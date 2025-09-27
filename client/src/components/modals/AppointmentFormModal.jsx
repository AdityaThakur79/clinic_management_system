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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'prefer_not_to_say',
    address: '',
    notes: '',
  });

  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100 });
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerSubColor = useColorModeValue('gray.500', 'gray.400');

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
        service: service?.title || service,
        servicePrice: service?.detailedContent?.cost || service?.price || 0,
        serviceDuration: service?.duration || 30,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: formData.notes,
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
        description: `Your appointment for ${service?.title || service} has been scheduled for ${selectedDate} at ${selectedTimeSlot}. A doctor will be assigned to your appointment.`,
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
                    <strong>Date:</strong> {formatDate(selectedDate)}
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    <strong>Time:</strong> {selectedTimeSlot}
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

              {/* Branch (default to doctor's branch) */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Branch</FormLabel>
                <Input
                  value={branchName || branchesData?.branches?.find(b => b._id === branchId)?.branchName || ''}
                  isReadOnly
                  size="sm"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderColor={borderColor}
                />
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
