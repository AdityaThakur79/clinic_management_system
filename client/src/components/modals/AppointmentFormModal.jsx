import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Text,
  Box,
  Divider,
} from '@chakra-ui/react';
import { useCreateAppointmentMutation, useGetMultipleDateAvailabilityQuery } from '../../features/api/appointments';
import { useGetAllBranchesQuery } from '../../features/api/branchApi';

const AppointmentFormModal = ({
  isOpen,
  onClose,
  service,
  branchId,
  branchName,
  selectedDate,
  selectedTimeSlot,
  onBookingSuccess,
}) => {
  // Debug: Log props when modal opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('AppointmentFormModal props:', {
        service,
        branchId,
        branchName,
        selectedDate,
        selectedTimeSlot,
      });
    }
  }, [isOpen, service, branchId, branchName, selectedDate, selectedTimeSlot]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'prefer_not_to_say',
    address: '',
    notes: '',
    branchId: branchId || '',
    preferredDate: selectedDate || '',
    preferredTime: selectedTimeSlot || '09:00',
  });

  // States for availability
  const [currentSelectedDate, setCurrentSelectedDate] = useState(selectedDate || '');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100 });
  const toast = useToast();

  // Fetch availability data
  const { 
    data: availabilityData, 
    isLoading: isAvailabilityLoading 
  } = useGetMultipleDateAvailabilityQuery({
    branchId: formData.branchId,
    startDate: new Date().toISOString().split('T')[0],
    days: 7
  }, {
    skip: !formData.branchId
  });

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerSubColor = useColorModeValue('gray.500', 'gray.400');

  // Update available time slots when availability data changes
  useEffect(() => {
    if (availabilityData?.data && currentSelectedDate) {
      const dayAvailability = availabilityData.data.find(
        day => day.date === currentSelectedDate
      );
      
      if (dayAvailability && dayAvailability.availableSlots) {
        // Filter only available slots and extract time strings
        const availableSlots = dayAvailability.availableSlots
          .filter(slot => slot.isAvailable)
          .map(slot => slot.time);
        setAvailableTimeSlots(availableSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    }
  }, [availabilityData, currentSelectedDate]);

  // Reset time slot when date changes
  useEffect(() => {
    if (currentSelectedDate) {
      setFormData(prev => ({ ...prev, preferredTime: '09:00' }));
    }
  }, [currentSelectedDate]);

  const handleInputChange = (field, value) => {
    if (field === 'preferredDate') {
      setCurrentSelectedDate(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: 'Name required',
        description: 'Please provide your name to book an appointment.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Validate required props
      if (!branchId) {
        toast({
          title: 'Missing Branch Information',
          description: 'Branch information is required to book an appointment.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Check if this is a consultation request (no specific date/time selected)
      const isConsultationRequest = !formData.preferredDate || !formData.preferredTime || formData.preferredTime === 'Any';
      
      // Use current date if not provided or invalid
      const appointmentDate = formData.preferredDate || new Date().toISOString().split('T')[0];
      
      // Use default time slot if not provided or "Any"
      const appointmentTimeSlot = (formData.preferredTime && formData.preferredTime !== 'Any') ? formData.preferredTime : '09:00';

      const appointmentData = {
        branchId: formData.branchId || branchId,
        service: service?.title || service || 'Consultation Request',
        servicePrice: service?.detailedContent?.cost || service?.price || 0,
        serviceDuration: service?.duration || 30,
        date: appointmentDate,
        timeSlot: appointmentTimeSlot,
        notes: isConsultationRequest 
          ? `Consultation request - ${formData.notes}\nNote: Please schedule at your convenience` 
          : `Appointment request - ${formData.notes}`,
        // Include service details from frontend data
        serviceDetails: {
          importance: service?.detailedContent?.overview || service?.description,
          benefits: service?.detailedContent?.benefits || [],
          duration: service?.detailedContent?.duration || service?.duration || '30 minutes',
          preparationInstructions: service?.detailedContent?.preparation?.join(', ') || 'Please arrive 15 minutes early',
          detailedInfo: service?.detailedContent?.whatToExpect?.join(', ') || service?.detailedContent?.process?.join(', ') || service?.description,
        },
        patient: {
          name: formData.name,
          contact: formData.phone || '',
          email: formData.email || '',
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender || 'prefer_not_to_say',
          address: formData.address || '',
        },
      };

      // Debug: Log appointment data before submission
      console.log('Validating props - selectedTimeSlot:', selectedTimeSlot, 'service:', service);
      console.log('Submitting appointment data:', JSON.stringify(appointmentData, null, 2));
      
      const result = await createAppointment(appointmentData).unwrap();
      
      toast({
        title: isConsultationRequest ? 'Consultation Request Submitted!' : 'Appointment Request Submitted!',
        description: isConsultationRequest 
          ? `Your consultation request has been submitted. Our team will contact you soon to schedule the most convenient time.`
          : `Your appointment request has been submitted. Our team will contact you soon to schedule the most convenient time.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'prefer_not_to_say',
        address: '',
        notes: '',
        branchId: branchId || '',
        preferredDate: selectedDate || '',
        preferredTime: selectedTimeSlot || '09:00',
      });
      setCurrentSelectedDate(selectedDate || '');
      setAvailableTimeSlots([]);
    } catch (error) {
      console.error('Booking error:', error);

      // Handle specific conflict error
      if (error?.data?.message?.includes('no longer available') || error?.data?.message?.includes('conflict')) {
        toast({
          title: 'Time Slot Unavailable',
          description: 'This time slot was just booked by someone else. Please select another time.',
          status: 'warning',
          duration: 6000,
          isClosable: true,
        });
        
        // Call parent to refresh availability
        if (onBookingSuccess) {
          onBookingSuccess('conflict');
        }
      } else if (error?.data?.message?.includes('Missing required fields')) {
        toast({
          title: 'Missing Required Fields',
          description: error?.data?.message || 'Please check all required fields and try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Booking Failed',
          description: error?.data?.message || 'Something went wrong. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg={bg} maxW="620px" borderRadius="xl" boxShadow="2xl" border="1px solid" borderColor={borderColor}>
        <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={3}>
          <Text fontSize="xl" fontWeight="bold" color="brand.600">
            Book Appointment
          </Text>
          <Text fontSize="sm" color={headerSubColor} mt={1}>
            for {service?.title || service}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={5} align="stretch">
              {/* Appointment Details */}
              <Box w="full" p={4} bg="brand.50" borderRadius="lg" border="1px solid" borderColor="brand.200">
                <Text fontWeight="semibold" color="brand.700" mb={2}>
                  Appointment Details
                </Text>
                <HStack spacing={4}>
                  <Text fontSize="sm" color="gray.700">
                    <strong>Date:</strong> {formatDate(formData.preferredDate)}
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    <strong>Time:</strong> {formData.preferredTime}
                  </Text>
                </HStack>
              </Box>

              <Divider />

              {/* Patient Information */}
              <Text fontWeight="semibold" color="gray.800" alignSelf="start">
                Patient Information
              </Text>

              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Full Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Age</FormLabel>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Age"
                    size="sm"
                    min="0"
                    max="120"
                  />
                </FormControl>
              </HStack>

              {/* Branch Selection */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Branch</FormLabel>
                <Select
                  value={formData.branchId}
                  onChange={(e) => handleInputChange('branchId', e.target.value)}
                  placeholder="Choose your preferred branch"
                  size="sm"
                >
                  {branchesData?.branches?.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName} - {branch.address}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Date and Time Selection */}
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Preferred Date</FormLabel>
                  <Select
                    value={formData.preferredDate || ''}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    placeholder="Select preferred date"
                    size="sm"
                    disabled={!formData.branchId}
                  >
                    {availabilityData?.data ? (
                      availabilityData.data
                        .filter(day => day.isWorkingDay)
                        .map((day) => {
                          const date = new Date(day.date);
                          const formattedDate = date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          });
                          return (
                            <option key={day.date} value={day.date}>
                              {formattedDate}
                            </option>
                          );
                        })
                    ) : (
                      <option value="">Loading dates...</option>
                    )}
                  </Select>
                  {!formData.branchId && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Please select a branch first
                    </Text>
                  )}
                  {isAvailabilityLoading && (
                    <Text fontSize="xs" color="blue.500" mt={1}>
                      Loading availability...
                    </Text>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Preferred Time</FormLabel>
                  <Select
                    value={formData.preferredTime || '09:00'}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    placeholder="Select preferred time"
                    size="sm"
                    disabled={!currentSelectedDate || availableTimeSlots.length === 0}
                  >
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {new Date(`2000-01-01T${slot}`).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </option>
                      ))
                    ) : (
                      <option value="09:00">09:00 AM (Default)</option>
                    )}
                  </Select>
                  {!currentSelectedDate && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Please select a date first
                    </Text>
                  )}
                  {currentSelectedDate && availableTimeSlots.length === 0 && !isAvailabilityLoading && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      No available slots for this date
                    </Text>
                  )}
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Phone Number</FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number (optional)"
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email (optional)"
                    size="sm"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Gender</FormLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    size="sm"
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
                {/* Referred doctor field removed as requested */}
              </HStack>

              <FormControl>
                <FormLabel fontSize="sm">Address</FormLabel>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter address (optional)"
                  size="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or symptoms (optional)"
                  size="sm"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3}>
              <Button variant="outline" colorScheme="brand" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={isLoading}
                loadingText="Booking..."
                size="sm"
              >
                Book Appointment
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AppointmentFormModal;
