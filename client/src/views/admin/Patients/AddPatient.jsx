import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Input, Select, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, FormControl, FormLabel, Textarea, useToast
} from '@chakra-ui/react';
import { useCreatePatientMutation } from '../../../features/api/patients';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
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
    medicalHistory: '',
    branchId: '',
  });

  const navigate = useNavigate();
  const toast = useToast();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';

  // API hooks
  const [createPatient, { isLoading }] = useCreatePatientMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Set default branch for branch admin/doctor
  useEffect(() => {
    if (userRole === 'branchAdmin' || userRole === 'doctor') {
      setForm(prev => ({ ...prev, branchId: userBranchId }));
    }
  }, [userRole, userBranchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.contact) {
      toast({
        title: 'Error',
        description: 'Name and contact are required fields.',
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
      };

      await createPatient(patientData).unwrap();
      toast({
        title: 'Patient Created',
        description: 'Patient has been created successfully.',
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

                {/* Branch Selection - Only for SuperAdmin */}
                {userRole === 'superAdmin' && (
                  <FormControl>
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
