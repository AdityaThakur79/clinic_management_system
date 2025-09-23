import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Input, Select, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, FormControl, FormLabel, Textarea, useToast, Spinner, Center
} from '@chakra-ui/react';
import { useUpdatePatientMutation, useGetPatientByIdQuery } from '../../../features/api/patientApi';
import { useGetAllBranchesQuery, useGetBranchByIdMutation } from '../../../features/api/branchApi';
import { useListReferredDoctorsQuery } from '../../../features/api/referredDoctors';
import { MdPerson } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UpdatePatient = () => {
  const location = useLocation();
  const patient = location.state?.patient;
  const patientId = patient?._id;

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    email: '',
    address: '',
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

  const navigate = useNavigate();
  const toast = useToast();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';

  // API hooks
  const [updatePatient, { isLoading }] = useUpdatePatientMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [getBranchById] = useGetBranchByIdMutation();
  const [branchLabel, setBranchLabel] = useState('');
  const { data: referredDoctorsData } = useListReferredDoctorsQuery({ page: 1, limit: 100, search: '' });
  
  // Fetch patient data if not passed via state
  const { data: patientData, isLoading: isLoadingPatient } = useGetPatientByIdQuery(patientId, {
    skip: !patientId || !!patient
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Initialize form with patient data
  useEffect(() => {
    const patientToUse = patient || patientData?.patient;
    if (patientToUse) {
      setForm({
        name: patientToUse.name || '',
        age: patientToUse.age?.toString() || '',
        gender: patientToUse.gender || '',
        contact: patientToUse.contact || '',
        email: patientToUse.email || '',
        address: patientToUse.address || '',
        medicalHistory: patientToUse.medicalHistory?.join('\n') || '',
        branchId: patientToUse.branchId?._id || patientToUse.branchId || '',
        referredDoctorId: patientToUse.referredDoctorId?._id || patientToUse.referredDoctorId || '',
        referredBy: patientToUse.referredBy || '',
        referralDate: patientToUse.referralDate ? new Date(patientToUse.referralDate).toISOString().split('T')[0] : '',
        plan: {
          type: patientToUse.plan?.type || 'standard',
          walletAmount: patientToUse.plan?.walletAmount || 0,
          visitsRemaining: patientToUse.plan?.visitsRemaining || 0,
          perVisitCharge: patientToUse.plan?.perVisitCharge || 0
        }
      });
    }
  }, [patient, patientData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.contact || (userRole === 'superAdmin' && !form.branchId)) {
      toast({
        title: 'Error',
        description: userRole === 'superAdmin' && !form.branchId ? 'Branch is required.' : 'Name and contact are required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const patientData = {
        ...form,
        age: form.age ? parseInt(form.age) : undefined,
        medicalHistory: form.medicalHistory ? form.medicalHistory.split('\n').filter(h => h.trim()) : [],
        branchId: form.branchId || undefined,
        referredDoctorId: form.referredDoctorId || undefined,
        referredBy: form.referredBy?.trim() ? form.referredBy : undefined,
        referralDate: form.referralDate ? new Date(form.referralDate).toISOString() : undefined,
      };
      // Remove keys that ended up undefined to avoid sending empty strings
      Object.keys(patientData).forEach((k) => {
        if (patientData[k] === undefined || patientData[k] === '') delete patientData[k];
      });

      await updatePatient({ id: patientId, ...patientData }).unwrap();
      toast({
        title: 'Patient Updated',
        description: 'Patient has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin/patients/database');
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update patient.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoadingPatient) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="#2BA8D1" />
            <Text color="gray.600">Loading patient data...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (!patient && !patientData?.patient) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Center py={10}>
              <VStack spacing={4}>
                <Text fontSize="lg" color="red.500">Patient not found</Text>
                <Button onClick={() => navigate('/admin/patients/database')}>
                  Back to Patients
                </Button>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader pb={3}>
            <HStack>
              <MdPerson size={24} color="#2BA8D1" />
              <Text fontSize="xl" fontWeight="bold">Update Patient</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">Basic Information</Text>
                
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Patient Name</FormLabel>
                    <Input
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter patient name"
                      borderRadius="lg"
                    />
                  </FormControl>
                  <FormControl>
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
                  <FormControl isRequired>
                    <FormLabel>Contact Number</FormLabel>
                    <Input
                      value={form.contact}
                      onChange={(e) => handleChange('contact', e.target.value)}
                      placeholder="Enter contact number"
                      borderRadius="lg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter email address"
                      borderRadius="lg"
                    />
                  </FormControl>
                </HStack>

                {/* Branch Selection or Display depending on role */}
                {userRole === 'superAdmin' ? (
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
                    loadingText="Updating..."
                  >
                    Update Patient
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

export default UpdatePatient;
