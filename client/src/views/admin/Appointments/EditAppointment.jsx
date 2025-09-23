import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, useToast, SimpleGrid, Badge, Divider, Icon, Flex, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Heading, FormControl, FormLabel, Input, Select, Textarea, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Switch, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAppointmentByIdQuery, useUpdateAppointmentStatusMutation } from '../../../features/api/appointments';
import { useGetAllDoctorsMutation } from '../../../features/api/doctor';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useGetAllPatientsQuery } from '../../../features/api/patientApi';
import { MdPerson, MdBusiness, MdPhone, MdEmail, MdCalendarToday, MdAccessTime, MdEdit, MdSave, MdCancel, MdArrowBack } from 'react-icons/md';

const EditAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    data: appointmentData,
    isLoading,
    error,
    refetch
  } = useGetAppointmentByIdQuery(id);

  const [getAllDoctors, { data: doctorsData, isLoading: doctorsLoading }] = useGetAllDoctorsMutation();

  const {
    data: branchesData,
    isLoading: branchesLoading
  } = useGetAllBranchesQuery({ page: 1, limit: 100, isActive: true });

  const {
    data: patientsData,
    isLoading: patientsLoading
  } = useGetAllPatientsQuery({ page: 1, limit: 100 });

  const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentStatusMutation();

  const appointment = appointmentData?.appointment;
  const doctors = doctorsData?.doctors || [];
  const branches = branchesData?.branches || [];
  const patients = patientsData?.patients || [];

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    branchId: '',
    date: '',
    timeSlot: '',
    status: 'scheduled',
    reason: '',
    notes: '',
    isEmergency: false,
    priority: 'normal'
  });

  const [isDirty, setIsDirty] = useState(false);

  // Hooks that must be called before any early returns
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Brand button styles
  const brandHover = {
    _hover: {
      bg: '#2BA8D1',
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(43,168,209,0.3)'
    },
    _active: { bg: '#2696ba', transform: 'translateY(0)' },
    transition: 'all 0.15s ease'
  };
  const brandPrimary = {
    bg: '#2BA8D1',
    color: 'white',
    _hover: { bg: '#2696ba', transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(43,168,209,0.25)' },
    _active: { bg: '#2187a6', transform: 'translateY(0)' },
    transition: 'all 0.15s ease'
  };

  useEffect(() => {
    // Fetch doctors on component mount
    getAllDoctors({ page: 1, limit: 100, isActive: true });
  }, [getAllDoctors]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId?._id || '',
        doctorId: appointment.doctorId?._id || '',
        branchId: appointment.branchId?._id || '',
        date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
        timeSlot: appointment.timeSlot || '',
        status: appointment.status || 'scheduled',
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        isEmergency: appointment.isEmergency || false,
        priority: appointment.priority || 'normal'
      });
    }
  }, [appointment]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateAppointment({
        appointmentId: id,
        ...formData
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Appointment updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsDirty(false);
      onClose();
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update appointment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      onOpen();
    } else {
      navigate(-1);
    }
  };

  const confirmCancel = () => {
    setIsDirty(false);
    onClose();
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading appointment details...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Alert status="error" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              Failed to load appointment details. Please try again.
            </AlertDescription>
          </Box>
        </Alert>
      </Center>
    );
  }

  if (!appointment) {
    return (
      <Center h="100vh">
        <Alert status="warning" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>No Data!</AlertTitle>
            <AlertDescription>
              Appointment not found.
            </AlertDescription>
          </Box>
        </Alert>
      </Center>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={4}>
          <Button
            leftIcon={<Icon as={MdArrowBack} />}
            variant="outline"
            onClick={handleCancel}
            {...brandHover}
          >
            Back
          </Button>
          <Heading size="lg">Edit Appointment</Heading>
        </HStack>
        <HStack spacing={4}>
          <Button
            leftIcon={<Icon as={MdCancel} />}
            variant="outline"
            onClick={handleCancel}
            isDisabled={isUpdating}
            {...brandHover}
          >
            Cancel
          </Button>
          <Button
            leftIcon={<Icon as={MdSave} />}
            onClick={handleSave}
            isLoading={isUpdating}
            loadingText="Saving..."
            isDisabled={!isDirty}
            {...brandPrimary}
          >
            Save Changes
          </Button>
        </HStack>
      </Flex>

      {/* Current Appointment Info */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader>
          <Heading size="md" color="blue.500">
            <Icon as={MdEdit} mr={2} />
            Current Appointment Details
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Patient</Text>
              <Text>{appointment.patientId?.name}</Text>
              <Text fontSize="sm" color="gray.600">{appointment.patientId?.contact}</Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Doctor</Text>
              <Text>{appointment.doctorId?.name}</Text>
              <Text fontSize="sm" color="gray.600">{appointment.doctorId?.specialization}</Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Date & Time</Text>
              <Text>{new Date(appointment.date).toLocaleDateString()}</Text>
              <Text fontSize="sm" color="gray.600">{appointment.timeSlot}</Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Status</Text>
              <Badge colorScheme={
                appointment.status === 'completed' ? 'green' :
                appointment.status === 'cancelled' ? 'red' :
                appointment.status === 'rescheduled' ? 'yellow' : 'blue'
              }>
                {appointment.status?.toUpperCase()}
              </Badge>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Edit Form */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="green.500">
            <Icon as={MdEdit} mr={2} />
            Edit Appointment
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired>
                <FormLabel>Patient</FormLabel>
                <Select
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  placeholder="Select patient"
                >
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} - {patient.contact}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Doctor</FormLabel>
                <Select
                  value={formData.doctorId}
                  onChange={(e) => handleInputChange('doctorId', e.target.value)}
                  placeholder="Select doctor"
                >
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Branch</FormLabel>
                <Select
                  value={formData.branchId}
                  onChange={(e) => handleInputChange('branchId', e.target.value)}
                  placeholder="Select branch"
                >
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName} - {branch.address}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Time Slot</FormLabel>
                <Select
                  value={formData.timeSlot}
                  onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                  placeholder="Select time slot"
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Emergency</FormLabel>
                <Switch
                  isChecked={formData.isEmergency}
                  onChange={(e) => handleInputChange('isEmergency', e.target.checked)}
                  colorScheme="red"
                />
              </FormControl>
            </SimpleGrid>

            {/* Additional Information */}
            <FormControl>
              <FormLabel>Reason for Visit</FormLabel>
              <Textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Enter reason for visit"
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter additional notes"
                rows={3}
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Cancel</ModalHeader>
          <ModalBody>
            <Text>You have unsaved changes. Are you sure you want to cancel?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose} {...brandHover}>
              Continue Editing
            </Button>
            <Button bg="#E53E3E" color="white" _hover={{ bg: '#C53030' }} onClick={confirmCancel}>
              Discard Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EditAppointment;
