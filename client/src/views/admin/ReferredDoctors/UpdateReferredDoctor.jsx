import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Switch, VStack, useToast, useColorModeValue, Card, CardHeader, CardBody, HStack, Text, Icon, Select, Textarea, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, SimpleGrid } from '@chakra-ui/react';
import { useUpdateReferredDoctorMutation } from '../../../features/api/referredDoctors';
import { useGetAllBranchesQuery, useGetBranchByIdMutation } from '../../../features/api/branchApi';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdAssignment, MdEmail, MdLocationOn, MdWork, MdAttachMoney } from 'react-icons/md';

const UpdateReferredDoctor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const referredDoctor = location.state?.referredDoctor;
  const [form, setForm] = useState({ 
    name: '', 
    clinicName: '', 
    contact: '', 
    email: '', 
    address: '', 
    specialization: '', 
    branchId: '', 
    commissionRate: 10, 
    isActive: true 
  });
  const [updateRefDoc, { isLoading }] = useUpdateReferredDoctorMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, isActive: true });
  const [getBranchById] = useGetBranchByIdMutation();
  const user = useSelector((s) => s.auth.user);
  const userBranchId = user?.branch?._id || user?.branch || '';
  const userRole = user?.role;
  const isScopedToBranch = !!userBranchId && (userRole === 'branchAdmin' || userRole === 'doctor');
  const [branchLabel, setBranchLabel] = useState('');
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const brandColor = "#2BA8D1";
  const branches = branchesData?.branches || [];

  useEffect(() => {
    if (referredDoctor) {
      setForm({
        name: referredDoctor.name || '',
        clinicName: referredDoctor.clinicName || '',
        contact: referredDoctor.contact || '',
        email: referredDoctor.email || '',
        address: referredDoctor.address || '',
        specialization: referredDoctor.specialization || '',
        branchId: referredDoctor.branchId?._id || referredDoctor.branchId || '',
        commissionRate: referredDoctor.commissionRate || 10,
        isActive: referredDoctor.isActive !== false,
      });
    }
  }, [referredDoctor]);

  useEffect(() => {
    if (isScopedToBranch) {
      setForm((prev) => ({ ...prev, branchId: prev.branchId || userBranchId }));
      (async () => {
        try {
          const res = await getBranchById({ id: userBranchId }).unwrap();
          if (res?.branch?.branchName) setBranchLabel(res.branch.branchName);
        } catch (e) {}
      })();
    }
  }, [isScopedToBranch, userBranchId, getBranchById]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.name) {
        toast({ title: 'Name is required', status: 'warning' });
        return;
      }
      if (!form.contact) {
        toast({ title: 'Contact is required', status: 'warning' });
        return;
      }
      if (!form.branchId) {
        toast({ title: 'Branch is required', status: 'warning' });
        return;
      }
      await updateRefDoc({ id: referredDoctor._id, ...form }).unwrap();
      toast({ title: 'Referred Doctor updated', status: 'success' });
      navigate('/admin/referred-doctors/all');
    } catch (err) {
      toast({ title: 'Failed to update', description: err?.data?.message || 'Error', status: 'error' });
    }
  };

  if (!referredDoctor) {
    return <Box p={6}>No referred doctor selected.</Box>;
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Card bg={cardBg}>
        <CardHeader pb={3}>
          <HStack>
            <Icon as={MdAssignment} w={6} h={6} color={brandColor} />
            <Text fontSize="xl" fontWeight="bold" color={brandColor}>Update Referred Doctor</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Basic Information */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4} color={brandColor}>
                  <Icon as={MdAssignment} mr={2} color={brandColor} />
                  Basic Information
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Doctor Name</FormLabel>
                    <Input 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      placeholder="Enter doctor's full name"
                      borderRadius="lg" 
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Contact Number</FormLabel>
                    <Input 
                      value={form.contact} 
                      onChange={(e) => setForm({ ...form, contact: e.target.value })} 
                      placeholder="Enter contact number"
                      borderRadius="lg" 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email Address</FormLabel>
                    <Input 
                      type="email"
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      placeholder="Enter email address"
                      borderRadius="lg" 
                    />
                  </FormControl>
                  {isScopedToBranch ? (
                    <FormControl>
                      <FormLabel>Branch</FormLabel>
                      <Input value={branchLabel || user?.branch?.branchName || 'Current Branch'} isReadOnly borderRadius="lg" />
                    </FormControl>
                  ) : (
                    <FormControl isRequired>
                      <FormLabel>Branch</FormLabel>
                      <Select 
                        value={form.branchId} 
                        onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                        placeholder="Select branch"
                        borderRadius="lg"
                      >
                        {branches.map(branch => (
                          <option key={branch._id} value={branch._id}>
                            {branch.branchName} - {branch.address}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </SimpleGrid>
              </Box>

              {/* Professional Information */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4} color={brandColor}>
                  <Icon as={MdWork} mr={2} color={brandColor} />
                  Professional Information
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Clinic Name</FormLabel>
                    <Input 
                      value={form.clinicName} 
                      onChange={(e) => setForm({ ...form, clinicName: e.target.value })} 
                      placeholder="Enter clinic name"
                      borderRadius="lg" 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Specialization</FormLabel>
                    <Input 
                      value={form.specialization} 
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })} 
                      placeholder="Enter specialization"
                      borderRadius="lg" 
                    />
                  </FormControl>
                </SimpleGrid>
                <FormControl mt={4}>
                  <FormLabel>Clinic Address</FormLabel>
                  <Textarea 
                    value={form.address} 
                    onChange={(e) => setForm({ ...form, address: e.target.value })} 
                    placeholder="Enter complete clinic address"
                    borderRadius="lg"
                    rows={3}
                  />
                </FormControl>
              </Box>

              {/* Commission Settings */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4} color={brandColor}>
                  <Icon as={MdAttachMoney} mr={2} color={brandColor} />
                  Commission Settings
                </Text>
                <FormControl>
                  <FormLabel>Commission Rate (%)</FormLabel>
                  <NumberInput 
                    value={form.commissionRate} 
                    onChange={(value) => setForm({ ...form, commissionRate: parseFloat(value) || 0 })}
                    min={0}
                    max={100}
                    precision={2}
                  >
                    <NumberInputField borderRadius="lg" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Commission rate for this referred doctor
                  </Text>
                </FormControl>
              </Box>

              {/* Status Settings */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4} color={brandColor}>
                  <Icon as={MdLocationOn} mr={2} color={brandColor} />
                  Status Settings
                </Text>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active Status</FormLabel>
                  <Switch 
                    isChecked={form.isActive} 
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })} 
                    colorScheme="green"
                  />
                  <Text fontSize="sm" color="gray.600" ml={2}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </FormControl>
              </Box>

              <HStack justify="flex-end" pt={4}>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/referred-doctors/all')}
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
                  bg="#2BA8D1" 
                  color="white" 
                  _hover={{ bg: '#0C2F4D' }} 
                  isLoading={isLoading}
                  loadingText="Updating..."
                >
                  Update Referred Doctor
                </Button>
              </HStack>
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};

export default UpdateReferredDoctor;


