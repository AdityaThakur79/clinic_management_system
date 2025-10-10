import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Input, Select, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, FormControl, FormLabel, Textarea, useToast, FormErrorMessage, Checkbox, Divider
} from '@chakra-ui/react';
import { useCreatePatientMutation } from '../../../features/api/patientApi';
import { useGetAllBranchesQuery, useGetBranchByIdMutation } from '../../../features/api/branchApi';
import { useListReferredDoctorsQuery } from '../../../features/api/referredDoctors';
import { useGetMultipleDateAvailabilityQuery } from '../../../features/api/appointments';
import { MdPerson } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AddPatient = () => {
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    email: '',
    address: '',
    dateOfBirth: '',
    medicalHistory: '',
    branchId: '',
    referredDoctorId: '',
    referredBy: '',
    referralDate: '',
    plan: {
      type: 'standard',
      walletAmount: 0,
      visitsRemaining: 0,
      perVisitCharge: 0
    }
  });

  // Appointment state
  const [createAppointmentWithPatient, setCreateAppointmentWithPatient] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    appointmentBranchId: '',
    appointmentDate: '',
    appointmentTimeSlot: '09:00',
    service: 'General Consultation'
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const navigate = useNavigate();
  const toast = useToast();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';

  // API hooks
  const [createPatient, { isLoading }] = useCreatePatientMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [getBranchById] = useGetBranchByIdMutation();
  const { data: referredDoctorsData } = useListReferredDoctorsQuery({ page: 1, limit: 100, search: '' });

  // Get availability data for appointment
  const { data: availabilityData, isLoading: isAvailabilityLoading } = useGetMultipleDateAvailabilityQuery(
    {
      branchId: appointmentData.appointmentBranchId,
      startDate: new Date().toISOString().split('T')[0],
      days: 7,
    },
    {
      skip: !appointmentData.appointmentBranchId || !createAppointmentWithPatient,
    }
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const appointmentSectionBg = useColorModeValue('blue.50', 'gray.700');

  const [errors, setErrors] = useState({});

  const validators = {
    name: (v) => !!v && v.trim().length >= 2,
    contact: (v) => {
      if (!v) return false;
      const digits = String(v).replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15;
    },
    email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    age: (v) => !v || (Number(v) >= 0 && Number(v) <= 120),
    branchId: (v) => (userRole === 'superAdmin' ? !!v : true),
  };

  const normalize = (payload) => {
    const cloned = { ...payload };
    if (cloned.email) cloned.email = cloned.email.trim().toLowerCase();
    if (cloned.contact) cloned.contact = String(cloned.contact).replace(/\D/g, '');
    if (!cloned.email) delete cloned.email;
    return cloned;
  };

  // Set default branch for branch admin/doctor and fetch branch title for display
  useEffect(() => {
    if (userRole === 'branchAdmin' || userRole === 'doctor') {
      setForm(prev => ({ ...prev, branchId: userBranchId }));
      setAppointmentData(prev => ({ ...prev, appointmentBranchId: userBranchId }));
      (async () => {
        try {
          const res = await getBranchById({ id: userBranchId }).unwrap();
          if (res?.branch?.branchName) {
            setBranchLabel(res.branch.branchName);
          }
        } catch (e) {}
      })();
    }
  }, [userRole, userBranchId, getBranchById]);

  // Auto-select first branch for superAdmin
  useEffect(() => {
    if (userRole === 'superAdmin' && branchesData?.branches?.length > 0 && !appointmentData.appointmentBranchId && createAppointmentWithPatient) {
      const firstBranchId = branchesData.branches[0]._id;
      setAppointmentData(prev => ({ ...prev, appointmentBranchId: firstBranchId }));
    }
  }, [branchesData, appointmentData.appointmentBranchId, createAppointmentWithPatient, userRole]);

  // Handle availability data and auto-select date and time
  useEffect(() => {
    if (availabilityData?.data && selectedDate) {
      const dayAvailability = availabilityData.data.find((d) => d.date === selectedDate);
      if (dayAvailability?.availableSlots) {
        const slots = dayAvailability.availableSlots
          .filter((s) => s.isAvailable)
          .map((s) => s.time);
        setAvailableTimeSlots(slots);
      } else {
        setAvailableTimeSlots([]);
      }
    }
  }, [availabilityData, selectedDate]);

  // Auto-select first available date and time slot
  useEffect(() => {
    if (availabilityData?.data && !selectedDate && createAppointmentWithPatient) {
      const firstWorkingDay = availabilityData.data.find((day) => day.isWorkingDay);
      if (firstWorkingDay) {
        const firstDate = firstWorkingDay.date;
        setSelectedDate(firstDate);
        setAppointmentData(prev => ({ ...prev, appointmentDate: firstDate }));

        // Auto-select first available time slot for that date
        if (firstWorkingDay.availableSlots) {
          const availableSlots = firstWorkingDay.availableSlots
            .filter((s) => s.isAvailable)
            .map((s) => s.time);
          if (availableSlots.length > 0) {
            setAppointmentData(prev => ({ ...prev, appointmentTimeSlot: availableSlots[0] }));
          }
        }
      }
    }
  }, [availabilityData, selectedDate, createAppointmentWithPatient]);

  const [branchLabel, setBranchLabel] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = {};
    if (!validators.name(form.name)) fieldErrors.name = 'Please enter a valid name (min 2 chars).';
    if (!validators.contact(form.contact)) fieldErrors.contact = 'Enter a valid phone number (10-15 digits).';
    if (!validators.email(form.email)) fieldErrors.email = 'Enter a valid email address.';
    if (!validators.age(form.age)) fieldErrors.age = 'Enter a valid age (0-120).';
    if (!validators.branchId(form.branchId)) fieldErrors.branchId = 'Branch is required.';
    
    // Validate appointment fields if creating appointment
    if (createAppointmentWithPatient) {
      if (!appointmentData.appointmentBranchId) fieldErrors.appointmentBranchId = 'Appointment branch is required.';
      if (!appointmentData.appointmentDate) fieldErrors.appointmentDate = 'Appointment date is required.';
      if (!appointmentData.appointmentTimeSlot) fieldErrors.appointmentTimeSlot = 'Appointment time slot is required.';
    }

    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      toast({ title: 'Please fix validation errors', status: 'error', duration: 2500, isClosable: true });
      return;
    }

    try {
      const patientData = normalize({
        ...form,
        age: form.age ? parseInt(form.age) : undefined,
        medicalHistory: form.medicalHistory ? form.medicalHistory.split('\n').filter(h => h.trim()) : [],
        branchId: form.branchId || undefined,
      });

      // Add appointment data if creating appointment
      if (createAppointmentWithPatient) {
        patientData.createAppointment = true;
        patientData.appointment = {
          branchId: appointmentData.appointmentBranchId,
          date: appointmentData.appointmentDate,
          timeSlot: appointmentData.appointmentTimeSlot,
          service: appointmentData.service || 'General Consultation',
        };
      }

      await createPatient(patientData).unwrap();
      toast({
        title: createAppointmentWithPatient ? 'Patient & Appointment Created' : 'Patient Created',
        description: createAppointmentWithPatient 
          ? 'Patient and appointment have been created successfully.' 
          : 'Patient has been created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin/patients/database');
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create patient.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAppointmentChange = (field, value) => {
    if (field === 'appointmentBranchId') {
      // Reset date/time when branch changes
      setSelectedDate('');
      setAvailableTimeSlots([]);
      setAppointmentData(prev => ({ ...prev, appointmentBranchId: value, appointmentDate: '', appointmentTimeSlot: '09:00' }));
      return;
    }
    if (field === 'appointmentDate') {
      setSelectedDate(value);
      setAppointmentData(prev => ({ ...prev, appointmentDate: value }));
      return;
    }
    setAppointmentData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader pb={3}>
            <HStack>
              <MdPerson size={24} color="#2BA8D1" />
              <Text fontSize="xl" fontWeight="bold">Add New Patient</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">Basic Information</Text>
                
                <HStack spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.name}>
                    <FormLabel>Patient Name</FormLabel>
                    <Input
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter patient name"
                      borderRadius="lg"
                    />
                    {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                  </FormControl>
                  <FormControl isInvalid={!!errors.age}>
                    <FormLabel>Age</FormLabel>
                    <Input
                      type="number"
                      value={form.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      placeholder="Enter age"
                      borderRadius="lg"
                      min="0"
                      max="120"
                    />
                    {errors.age && <FormErrorMessage>{errors.age}</FormErrorMessage>}
                  </FormControl>
                  <FormControl>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      value={form.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      placeholder="Select gender"
                      borderRadius="lg"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </Select>
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.contact}>
                    <FormLabel>Contact Number</FormLabel>
                    <Input
                      value={form.contact}
                      onChange={(e) => handleChange('contact', e.target.value)}
                      placeholder="Enter contact number"
                      borderRadius="lg"
                    />
                    {errors.contact && <FormErrorMessage>{errors.contact}</FormErrorMessage>}
                  </FormControl>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter email address"
                      borderRadius="lg"
                    />
                    {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                  </FormControl>
                  <FormControl>
                    <FormLabel>Date of Birth (optional)</FormLabel>
                    <Input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      borderRadius="lg"
                    />
                  </FormControl>
                </HStack>

                {/* Branch Selection or Display depending on role */}
                {userRole === 'superAdmin' ? (
                  <FormControl isRequired isInvalid={!!errors.branchId}>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      value={form.branchId}
                      onChange={(e) => handleChange('branchId', e.target.value)}
                      placeholder="Select branch"
                      borderRadius="lg"
                    >
                      {branchesData?.branches?.map(branch => (
                        <option key={branch._id} value={branch._id}>{branch.branchName}</option>
                      ))}
                    </Select>
                    {errors.branchId && <FormErrorMessage>{errors.branchId}</FormErrorMessage>}
                  </FormControl>
                ) : (
                  <FormControl>
                    <FormLabel>Branch</FormLabel>
                    <Input value={branchLabel || user?.branch?.branchName || 'Current Branch'} isReadOnly borderRadius="lg" />
                  </FormControl>
                )}

                {/* Address */}
                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Textarea
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter patient address"
                    borderRadius="lg"
                    rows={3}
                  />
                </FormControl>

                {/* Referral Information */}
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">Referral Information</Text>
                
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Referred Doctor</FormLabel>
                    <Select
                      value={form.referredDoctorId}
                      onChange={(e) => handleChange('referredDoctorId', e.target.value)}
                      placeholder="Select referred doctor"
                      borderRadius="lg"
                    >
                      {referredDoctorsData?.referredDoctors?.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name} {doctor.clinicName ? `(${doctor.clinicName})` : ''}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  {/* Removed manual referred doctor name as requested */}
                  <FormControl>
                    <FormLabel>Referral Date</FormLabel>
                    <Input
                      type="date"
                      value={form.referralDate}
                      onChange={(e) => handleChange('referralDate', e.target.value)}
                      borderRadius="lg"
                    />
                  </FormControl>
                </HStack>

                {/* Patient Plan */}
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">Patient Plan</Text>
                
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Plan Type</FormLabel>
                    <Select
                      value={form.plan.type}
                      onChange={(e) => handleChange('plan', { ...form.plan, type: e.target.value })}
                      borderRadius="lg"
                    >
                      <option value="standard">Standard</option>
                      <option value="wallet">Wallet</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Wallet Amount (₹)</FormLabel>
                    <Input
                      type="number"
                      value={form.plan.walletAmount}
                      onChange={(e) => handleChange('plan', { ...form.plan, walletAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter wallet amount"
                      borderRadius="lg"
                      min="0"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Visits Remaining</FormLabel>
                    <Input
                      type="number"
                      value={form.plan.visitsRemaining}
                      onChange={(e) => handleChange('plan', { ...form.plan, visitsRemaining: parseInt(e.target.value) || 0 })}
                      placeholder="Enter visits remaining"
                      borderRadius="lg"
                      min="0"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Per Visit Charge (₹)</FormLabel>
                    <Input
                      type="number"
                      value={form.plan.perVisitCharge}
                      onChange={(e) => handleChange('plan', { ...form.plan, perVisitCharge: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter per visit charge"
                      borderRadius="lg"
                      min="0"
                    />
                  </FormControl>
                </HStack>

                {/* Medical History */}
                <FormControl>
                  <FormLabel>Medical History</FormLabel>
                  <Textarea
                    value={form.medicalHistory}
                    onChange={(e) => handleChange('medicalHistory', e.target.value)}
                    placeholder="Enter medical history (one per line)"
                    borderRadius="lg"
                    rows={4}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Enter each medical condition on a new line
                  </Text>
                </FormControl>

                {/* Quick Appointment Section */}
                <Divider my={4} />
                <Checkbox
                  isChecked={createAppointmentWithPatient}
                  onChange={(e) => setCreateAppointmentWithPatient(e.target.checked)}
                  colorScheme="blue"
                  size="lg"
                >
                  <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                    Create Appointment with Patient
                  </Text>
                </Checkbox>

                {createAppointmentWithPatient && (
                  <VStack spacing={4} align="stretch" p={4} bg={appointmentSectionBg} borderRadius="lg">
                    <Text fontSize="md" fontWeight="semibold" color="gray.700">
                      Quick Appointment Details
                    </Text>
                    
                    <HStack spacing={4}>
                      {userRole === 'superAdmin' ? (
                        <FormControl isRequired isInvalid={!!errors.appointmentBranchId}>
                          <FormLabel fontSize="sm">Appointment Branch</FormLabel>
                          <Select
                            value={appointmentData.appointmentBranchId}
                            onChange={(e) => handleAppointmentChange('appointmentBranchId', e.target.value)}
                            placeholder="Select branch"
                            borderRadius="lg"
                          >
                            {branchesData?.branches?.map(branch => (
                              <option key={branch._id} value={branch._id}>{branch.branchName}</option>
                            ))}
                          </Select>
                          {errors.appointmentBranchId && <FormErrorMessage>{errors.appointmentBranchId}</FormErrorMessage>}
                        </FormControl>
                      ) : (
                        <FormControl>
                          <FormLabel fontSize="sm">Appointment Branch</FormLabel>
                          <Input value={branchLabel || user?.branch?.branchName || 'Current Branch'} isReadOnly borderRadius="lg" />
                        </FormControl>
                      )}

                      <FormControl isRequired isInvalid={!!errors.appointmentDate}>
                        <FormLabel fontSize="sm">Date</FormLabel>
                        <Select
                          value={appointmentData.appointmentDate}
                          onChange={(e) => handleAppointmentChange('appointmentDate', e.target.value)}
                          placeholder="Select date"
                          borderRadius="lg"
                          disabled={!appointmentData.appointmentBranchId}
                        >
                          {availabilityData?.data ? (
                            availabilityData.data
                              .filter((day) => day.isWorkingDay)
                              .map((day) => {
                                const d = new Date(day.date);
                                const label = d.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                });
                                return (
                                  <option key={day.date} value={day.date}>
                                    {label}
                                  </option>
                                );
                              })
                          ) : (
                            <option value="">{isAvailabilityLoading ? 'Loading dates...' : 'Select a branch first'}</option>
                          )}
                        </Select>
                        {errors.appointmentDate && <FormErrorMessage>{errors.appointmentDate}</FormErrorMessage>}
                      </FormControl>

                      <FormControl isRequired isInvalid={!!errors.appointmentTimeSlot}>
                        <FormLabel fontSize="sm">Time Slot</FormLabel>
                        <Select
                          value={appointmentData.appointmentTimeSlot}
                          onChange={(e) => handleAppointmentChange('appointmentTimeSlot', e.target.value)}
                          placeholder="Select time"
                          borderRadius="lg"
                          disabled={!selectedDate || availableTimeSlots.length === 0}
                        >
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {new Date(`2000-01-01T${slot}`).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </option>
                            ))
                          ) : (
                            <option value="09:00">09:00 AM (Default)</option>
                          )}
                        </Select>
                        {errors.appointmentTimeSlot && <FormErrorMessage>{errors.appointmentTimeSlot}</FormErrorMessage>}
                      </FormControl>
                    </HStack>

                    {!appointmentData.appointmentBranchId && (
                      <Text fontSize="xs" color="gray.600">
                        Please select a branch to view available dates and times
                      </Text>
                    )}
                    {isAvailabilityLoading && appointmentData.appointmentBranchId && (
                      <Text fontSize="xs" color="blue.600">
                        Loading availability...
                      </Text>
                    )}
                  </VStack>
                )}

                <HStack spacing={4} justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/patients/database')}
                    _hover={{ 
                      bg: "#2BA8D1", 
                      color: "white",
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    loadingText="Creating..."
                  >
                    Create Patient
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default AddPatient;
