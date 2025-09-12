import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Switch, VStack, useToast, useColorModeValue, Card, CardHeader, CardBody, HStack, Text, Icon } from '@chakra-ui/react';
import { useUpdateReferredDoctorMutation } from '../../../features/api/referredDoctors';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdAssignment } from 'react-icons/md';

const UpdateReferredDoctor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const referredDoctor = location.state?.referredDoctor;
  const [form, setForm] = useState({ name: '', clinicName: '', contact: '', isActive: true });
  const [updateRefDoc, { isLoading }] = useUpdateReferredDoctorMutation();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (referredDoctor) {
      setForm({
        name: referredDoctor.name || '',
        clinicName: referredDoctor.clinicName || '',
        contact: referredDoctor.contact || '',
        isActive: referredDoctor.isActive !== false,
      });
    }
  }, [referredDoctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
            <Icon as={MdAssignment} w={6} h={6} color="#2BA8D1" />
            <Text fontSize="xl" fontWeight="bold">Update Referred Doctor</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel>Clinic Name</FormLabel>
                <Input value={form.clinicName} onChange={(e) => setForm({ ...form, clinicName: e.target.value })} borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel>Contact</FormLabel>
                <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} borderRadius="lg" />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Active</FormLabel>
                <Switch isChecked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              </FormControl>
              <HStack justify="flex-end">
                <Button type="submit" bg="#2BA8D1" color="white" _hover={{ bg: '#0C2F4D' }} isLoading={isLoading}>Update</Button>
              </HStack>
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};

export default UpdateReferredDoctor;


