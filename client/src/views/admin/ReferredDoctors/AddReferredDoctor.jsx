import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast, useColorModeValue, Card, CardHeader, CardBody, HStack, Text, Icon } from '@chakra-ui/react';
import { useCreateReferredDoctorMutation } from '../../../features/api/referredDoctors';
import { useNavigate } from 'react-router-dom';
import { MdAssignment } from 'react-icons/md';

const AddReferredDoctor = () => {
  const [form, setForm] = useState({ name: '', clinicName: '', contact: '' });
  const [createRefDoc, { isLoading }] = useCreateReferredDoctorMutation();
  const toast = useToast();
  const navigate = useNavigate();

  const cardBg = useColorModeValue('white', 'gray.800');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.name) {
        toast({ title: 'Name is required', status: 'warning' });
        return;
      }
      await createRefDoc(form).unwrap();
      toast({ title: 'Referred Doctor added', status: 'success' });
      navigate('/admin/referred-doctors/all');
    } catch (err) {
      toast({ title: 'Failed to add', description: err?.data?.message || 'Error', status: 'error' });
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Card bg={cardBg}>
        <CardHeader pb={3}>
          <HStack>
            <Icon as={MdAssignment} w={6} h={6} color="#2BA8D1" />
            <Text fontSize="xl" fontWeight="bold">Add Referred Doctor</Text>
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
              <HStack justify="flex-end">
                <Button type="submit" bg="#2BA8D1" color="white" _hover={{ bg: '#0C2F4D' }} isLoading={isLoading}>Create</Button>
              </HStack>
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AddReferredDoctor;


