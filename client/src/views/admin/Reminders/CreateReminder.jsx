import React, { useState, useEffect } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, useToast, useColorModeValue, Card, CardHeader, CardBody, HStack, Text, Icon, Select, Textarea, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, SimpleGrid, Switch, Divider, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, Heading, Flex, Spinner, Center
} from '@chakra-ui/react';
import { useCreateReminderMutation } from '../../../features/api/reminders';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useGetAllDoctorsMutation } from '../../../features/api/doctor';
import { useGetAllPatientsQuery } from '../../../features/api/patientApi';
import { useGetAllAppointmentsQuery } from '../../../features/api/appointments';
import { useNavigate } from 'react-router-dom';
import { MdAssignment, MdPerson, MdBusiness, MdPhone, MdEmail, MdCalendarToday, MdAccessTime, MdNotifications, MdSave, MdCancel, MdArrowBack } from 'react-icons/md';

const CreateReminder = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [createReminder, { isLoading: isCreating }] = useCreateReminderMutation();

  // API Queries
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, isActive: true });
  const [getAllDoctors, { data: doctorsData, isLoading: doctorsLoading }] = useGetAllDoctorsMutation();
  const { data: patientsData } = useGetAllPatientsQuery({ page: 1, limit: 100 });
  const { data: appointmentsData } = useGetAllAppointmentsQuery({ page: 1, limit: 100 });

  const branches = branchesData?.branches || [];
  const doctors = doctorsData?.doctors || [];
  const patients = patientsData?.patients || [];
  const appointments = appointmentsData?.appointments || [];

  // Form state
  const [formData, setFormData] = useState({
    appointmentId: '',
    patientId: '',
    doctorId: '',
    branchId: '',
    type: 'general',
    title: '',
    description: '',
    reminderDate: '',
    reminderTime: '',
    priority: 'medium',
    method: 'in_app',
    isRecurring: false,
    recurringPattern: 'daily',
    recurringEndDate: '',
    notes: ''
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch doctors on component mount
  useEffect(() => {
    getAllDoctors({ page: 1, limit: 100, isActive: true });
  }, [getAllDoctors]);

  // Filter appointments when patient is selected
  useEffect(() => {
    if (formData.patientId) {
      const patientAppointments = appointments.filter(apt => 
        apt.patientId?._id === formData.patientId || apt.patientId === formData.patientId
      );
      setFilteredAppointments(patientAppointments);
      
      // Auto-select the first appointment if available
      if (patientAppointments.length > 0) {
        setFormData(prev => ({
          ...prev,
          appointmentId: patientAppointments[0]._id
        }));
        setSelectedAppointment(patientAppointments[0]);
      }
    } else {
      setFilteredAppointments([]);
      setFormData(prev => ({ ...prev, appointmentId: '' }));
      setSelectedAppointment(null);
    }
  }, [formData.patientId, appointments]);

  // Update patient info when patient is selected
  useEffect(() => {
    if (formData.patientId) {
      const patient = patients.find(p => p._id === formData.patientId);
      if (patient) {
        setSelectedPatient(patient);
        // Auto-fill doctor and branch from patient's recent appointment
        if (filteredAppointments.length > 0) {
          const recentAppointment = filteredAppointments[0];
          setFormData(prev => ({
            ...prev,
            doctorId: recentAppointment.doctorId?._id || recentAppointment.doctorId || '',
            branchId: recentAppointment.branchId?._id || recentAppointment.branchId || ''
          }));
        }
      }
    } else {
      setSelectedPatient(null);
    }
  }, [formData.patientId, patients, filteredAppointments]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createReminder(formData).unwrap();
      
      toast({
        title: 'Success',
        description: 'Reminder created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/admin/reminders');
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create reminder',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    navigate('/admin/reminders');
  };

  // Set default reminder date to today
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData(prev => ({
      ...prev,
      reminderDate: tomorrow.toISOString().split('T')[0],
      reminderTime: '09:00'
    }));
  }, []);

  return (
    <Box p={6} pt={8}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="blue.500">
          <Icon as={MdAssignment} mr={2} />
          Create Reminder
        </Heading>
        <HStack spacing={4}>
          <Button
            leftIcon={<Icon as={MdArrowBack} />}
            colorScheme="blue"
            variant="outline"
            onClick={handleCancel}
          >
            Back
          </Button>
        </HStack>
      </Flex>

      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* Patient Selection */}
          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color="blue.500">
                <Icon as={MdPerson} mr={2} />
                Patient Information
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Select Patient</FormLabel>
                  <Select
                    value={formData.patientId}
                    onChange={(e) => handleInputChange('patientId', e.target.value)}
                    placeholder="Choose a patient"
                  >
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} - {patient.contact}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedPatient && (
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color="gray.600">Patient Details</Text>
                    <Text><Icon as={MdPerson} mr={1} />{selectedPatient.name}</Text>
                    <Text><Icon as={MdPhone} mr={1} />{selectedPatient.contact}</Text>
                    {selectedPatient.email && (
                      <Text><Icon as={MdEmail} mr={1} />{selectedPatient.email}</Text>
                    )}
                    {selectedPatient.age && (
                      <Text>Age: {selectedPatient.age}</Text>
                    )}
                  </VStack>
                )}
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Appointment Selection */}
          {formData.patientId && (
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md" color="blue.500">
                  <Icon as={MdCalendarToday} mr={2} />
                  Appointment Information
                </Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Select Appointment</FormLabel>
                    <Select
                      value={formData.appointmentId}
                      onChange={(e) => {
                        const appointment = filteredAppointments.find(apt => apt._id === e.target.value);
                        setSelectedAppointment(appointment);
                        handleInputChange('appointmentId', e.target.value);
                      }}
                      placeholder="Choose an appointment"
                    >
                      {filteredAppointments.map(appointment => (
                        <option key={appointment._id} value={appointment._id}>
                          {new Date(appointment.date).toLocaleDateString()} - {appointment.timeSlot}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedAppointment && (
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold" color="gray.600">Appointment Details</Text>
                      <Text>Date: {new Date(selectedAppointment.date).toLocaleDateString()}</Text>
                      <Text>Time: {selectedAppointment.timeSlot}</Text>
                      <Text>Status: <Badge colorScheme={selectedAppointment.status === 'completed' ? 'green' : 'blue'}>{selectedAppointment.status}</Badge></Text>
                    </VStack>
                  )}
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

          {/* Doctor & Branch Selection */}
          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color="blue.500">
                <Icon as={MdBusiness} mr={2} />
                Doctor & Branch Information
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Select Doctor</FormLabel>
                  <Select
                    value={formData.doctorId}
                    onChange={(e) => handleInputChange('doctorId', e.target.value)}
                    placeholder="Choose a doctor"
                    isDisabled={doctorsLoading}
                  >
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Select Branch</FormLabel>
                  <Select
                    value={formData.branchId}
                    onChange={(e) => handleInputChange('branchId', e.target.value)}
                    placeholder="Choose a branch"
                  >
                    {branches.map(branch => (
                      <option key={branch._id} value={branch._id}>
                        {branch.branchName} - {branch.address}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Reminder Details */}
          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color="blue.500">
                <Icon as={MdNotifications} mr={2} />
                Reminder Details
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Reminder Type</FormLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <option value="appointment">Appointment</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="medication">Medication</option>
                      <option value="general">General</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter reminder title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter reminder description"
                    rows={3}
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Reminder Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.reminderDate}
                      onChange={(e) => handleInputChange('reminderDate', e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Reminder Time</FormLabel>
                    <Input
                      type="time"
                      value={formData.reminderTime}
                      onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Reminder Method</FormLabel>
                  <Select
                    value={formData.method}
                    onChange={(e) => handleInputChange('method', e.target.value)}
                  >
                    <option value="in_app">In-App Notification</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes (optional)"
                    rows={2}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Recurring Options */}
          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color="blue.500">
                <Icon as={MdAccessTime} mr={2} />
                Recurring Options
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <HStack>
                    <Switch
                      isChecked={formData.isRecurring}
                      onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                    />
                    <FormLabel mb={0}>Make this a recurring reminder</FormLabel>
                  </HStack>
                </FormControl>

                {formData.isRecurring && (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Recurring Pattern</FormLabel>
                      <Select
                        value={formData.recurringPattern}
                        onChange={(e) => handleInputChange('recurringPattern', e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Input
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                      />
                    </FormControl>
                  </SimpleGrid>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <HStack spacing={4} justify="center" pt={4}>
            <Button
              type="button"
              leftIcon={<Icon as={MdCancel} />}
              colorScheme="red"
              variant="outline"
              onClick={handleCancel}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={<Icon as={MdSave} />}
              colorScheme="blue"
              variant="solid"
              isLoading={isCreating}
              loadingText="Creating..."
              size="lg"
            >
              Create Reminder
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateReminder;
