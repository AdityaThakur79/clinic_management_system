import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Input, Select, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, FormControl, FormLabel, Textarea, useToast
} from '@chakra-ui/react';
import { useCreateAppointmentMutation } from '../../../features/api/appointments';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useGetAllDoctorsMutation } from '../../../features/api/doctor';
import { useListReferredDoctorsQuery } from '../../../features/api/referredDoctors';
import { MdSchedule } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AddAppointment = () => {
  const [form, setForm] = useState({
    branchId: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    notes: '',
    referredDoctorId: '',
    patient: {
      name: '',
      age: '',
      gender: '',
      contact: '',
      email: '',
      address: '',
    }
  });

  const navigate = useNavigate();
  const toast = useToast();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';

  // API hooks
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [getAllDoctors] = useGetAllDoctorsMutation();
  const { data: referredDoctorsData } = useListReferredDoctorsQuery({ page: 1, limit: 100, search: '' });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Load doctors for selected branch
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    const fetchDoctors = async () => {
      if (form.branchId) {
        try {
          const result = await getAllDoctors({
            page: 1,
            limit: 100,
            q: '',
            branch: form.branchId,
          }).unwrap();
          setDoctors(result.doctors || []);
        } catch (error) {
          console.error('Error fetching doctors:', error);
        }
      } else {
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, [form.branchId, getAllDoctors]);

  // Set default branch for branch admin/doctor
  useEffect(() => {
    if (userRole === 'branchAdmin' || userRole === 'doctor') {
      setForm(prev => ({ ...prev, branchId: userBranchId }));
    }
  }, [userRole, userBranchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.branchId || !form.doctorId || !form.date || !form.timeSlot || !form.patient.name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await createAppointment(form).unwrap();
      toast({
        title: 'Appointment Created',
        description: 'Appointment has been created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin/appointments/all');
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create appointment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith('patient.')) {
      const patientField = field.split('.')[1];
      setForm(prev => ({
        ...prev,
        patient: {
          ...prev.patient,
          [patientField]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader pb={3}>
            <HStack>
              <MdSchedule size={24} color="#2BA8D1" />
              <Text fontSize="xl" fontWeight="bold">Add New Appointment</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Branch Selection */}
                {userRole === 'superAdmin' && (
                  <FormControl isRequired>
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
                  </FormControl>
                )}

                {/* Doctor Selection */}
                <FormControl isRequired>
                  <FormLabel>Doctor</FormLabel>
                  <Select
                    value={form.doctorId}
                    onChange={(e) => handleChange('doctorId', e.target.value)}
                    placeholder="Select doctor"
                    borderRadius="lg"
                    isDisabled={!form.branchId}
                  >
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>{doctor.name} - {doctor.specialization}</option>
                    ))}
                  </Select>
                </FormControl>

                {/* Date and Time */}
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      borderRadius="lg"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Time Slot</FormLabel>
                    <Input
                      type="time"
                      value={form.timeSlot}
                      onChange={(e) => handleChange('timeSlot', e.target.value)}
                      borderRadius="lg"
                    />
                  </FormControl>
                </HStack>

                {/* Referred Doctor */}
                <FormControl>
                  <FormLabel>Referred Doctor (Optional)</FormLabel>
                  <Select
                    value={form.referredDoctorId}
                    onChange={(e) => handleChange('referredDoctorId', e.target.value)}
                    placeholder="Select referred doctor"
                    borderRadius="lg"
                  >
                    {referredDoctorsData?.referredDoctors?.map(rd => (
                      <option key={rd._id} value={rd._id}>{rd.name} - {rd.clinicName}</option>
                    ))}
                  </Select>
                </FormControl>

                {/* Patient Information */}
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">Patient Information</Text>
                
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Patient Name</FormLabel>
                    <Input
                      value={form.patient.name}
                      onChange={(e) => handleChange('patient.name', e.target.value)}
                      placeholder="Enter patient name"
                      borderRadius="lg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Age</FormLabel>
                    <Input
                      type="number"
                      value={form.patient.age}
                      onChange={(e) => handleChange('patient.age', e.target.value)}
                      placeholder="Enter age"
                      borderRadius="lg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      value={form.patient.gender}
                      onChange={(e) => handleChange('patient.gender', e.target.value)}
                      placeholder="Select gender"
                      borderRadius="lg"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Contact</FormLabel>
                    <Input
                      value={form.patient.contact}
                      onChange={(e) => handleChange('patient.contact', e.target.value)}
                      placeholder="Enter contact number"
                      borderRadius="lg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={form.patient.email}
                      onChange={(e) => handleChange('patient.email', e.target.value)}
                      placeholder="Enter email"
                      borderRadius="lg"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Textarea
                    value={form.patient.address}
                    onChange={(e) => handleChange('patient.address', e.target.value)}
                    placeholder="Enter patient address"
                    borderRadius="lg"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Enter appointment notes"
                    borderRadius="lg"
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4} justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/appointments/all')}
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
                    Create Appointment
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

export default AddAppointment;
