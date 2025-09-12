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
import { useCreateAppointmentMutation } from '../../features/api/appointments';
import { useGetAllBranchesQuery } from '../../features/api/branchApi';
import { useListReferredDoctorsQuery } from '../../features/api/referredDoctors';

const AppointmentFormModal = ({
  isOpen,
  onClose,
  doctorId,
  branchId,
  selectedDate,
  selectedTimeSlot,
  doctorName,
  onBookingSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'prefer_not_to_say',
    address: '',
    notes: '',
    referredDoctorId: '',
  });

  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100 });
  const { data: refDocsData, refetch: refetchRefDocs } = useListReferredDoctorsQuery({ branchId });
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: 'Required fields missing',
        description: 'Name and phone number are required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const appointmentData = {
        branchId,
        doctorId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: formData.notes,
        referredDoctorId: formData.referredDoctorId || undefined,
        patient: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
          address: formData.address,
        },
      };

      const result = await createAppointment(appointmentData).unwrap();
      
      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with Dr. ${doctorName} has been scheduled for ${selectedDate} at ${selectedTimeSlot}`,
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
        referredDoctorId: '',
      });
    } catch (error) {
      console.error('Booking error:', error);
      
      // Handle specific conflict error
      if (error?.data?.message?.includes('no longer available')) {
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
      <ModalContent bg={bg} maxW="600px">
        <ModalHeader>
          <Text fontSize="xl" fontWeight="bold">
            Book Appointment
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            with Dr. {doctorName}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              {/* Appointment Details */}
              <Box w="full" p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="semibold" color="blue.700" mb={2}>
                  Appointment Details
                </Text>
                <HStack spacing={4}>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Date:</strong> {formatDate(selectedDate)}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Time:</strong> {selectedTimeSlot}
                  </Text>
                </HStack>
              </Box>

              <Divider />

              {/* Patient Information */}
              <Text fontWeight="semibold" color="gray.700" alignSelf="start">
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
                  value={branchId || ''}
                  onChange={(e) => {
                    // Not changing parent prop; instead inform user to pick correct doctor page if mismatched
                    // Optionally, you could lift this state up to parent if needed
                    handleInputChange('selectedBranchId', e.target.value);
                  }}
                  size="sm"
                >
                  <option value="" disabled>Select branch</option>
                  {branchesData?.branches?.map((b) => (
                    <option key={b._id} value={b._id}>{b.branchName}</option>
                  ))}
                </Select>
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Phone Number</FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
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
                <FormControl>
                  <FormLabel fontSize="sm">Referred Doctor</FormLabel>
                  <Select
                    value={formData.referredDoctorId}
                    onChange={(e) => handleInputChange('referredDoctorId', e.target.value)}
                    placeholder="Select referred doctor (optional)"
                    size="sm"
                  >
                    <option value="">None</option>
                    {refDocsData?.referredDoctors?.map((rd) => (
                      <option key={rd._id} value={rd._id}>{rd.name}{rd.clinicName ? ` - ${rd.clinicName}` : ''}</option>
                    ))}
                  </Select>
                </FormControl>
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

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
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
