import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { MdBuild, MdArrowBack } from 'react-icons/md';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useGetServiceByIdMutation, useUpdateServiceMutation } from '../../../features/api/service';

const UpdateService = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const serviceId = location.state?.serviceId;

  const [formData, setFormData] = useState({ name: '', description: '', isActive: 'active' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [getServiceById] = useGetServiceByIdMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const load = async () => {
      try {
        if (!serviceId) return;
        setIsLoading(true);
        setFetchError(null);
        const res = await getServiceById({ id: serviceId }).unwrap();
        if (res?.success && res?.service) {
          const s = res.service;
          setFormData({
            name: s.name || '',
            description: s.description || '',
            isActive: s.isActive ? 'active' : 'inactive',
          });
        } else {
          setFetchError('Service not found');
        }
      } catch (err) {
        setFetchError(err?.data?.message || 'Failed to fetch service');
      } finally {
        setIsLoading(false);
      }
    };
    if (serviceId) load();
  }, [serviceId, getServiceById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fill in required fields.', status: 'error', duration: 3000 });
      return;
    }
    try {
      const payload = {
        id: serviceId,
        name: formData.name.trim(),
        description: formData.description,
        isActive: formData.isActive === 'active',
      };
      const res = await updateService(payload).unwrap();
      toast({ title: 'Service Updated', description: res?.message || 'Service updated successfully.', status: 'success', duration: 4000 });
      navigate('/admin/services');
    } catch (err) {
      toast({ title: 'Update Failed', description: err?.data?.message || 'Failed to update service.', status: 'error', duration: 3000 });
    }
  };

  if (!serviceId) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Center py={20}>
          <VStack spacing={4}>
            <Text>No service selected for update.</Text>
            <Button as={Link} to="/admin/services" leftIcon={<MdArrowBack />}>Back to Services</Button>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Center py={20}>
          <Spinner size="xl" color="#3AC0E7" />
        </Center>
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Center py={20}>
          <VStack>
            <Text color="red.500">{fetchError}</Text>
            <Button as={Link} to="/admin/services" leftIcon={<MdArrowBack />}>Back to Services</Button>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        <Card bg={cardBg} borderColor={borderColor} borderRadius="xl" boxShadow="sm">
          <CardHeader pb={4}>
            <HStack justify="space-between">
              <HStack>
                <Icon as={MdBuild} w={7} h={7} color="#3AC0E7" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.700">Update Service</Text>
                  <Text fontSize="sm" color="gray.600">Modify service information</Text>
                </VStack>
              </HStack>
              <Button as={Link} to="/admin/services/all" leftIcon={<MdArrowBack />} variant="outline" 
              _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}>Back to Services</Button>
            </HStack>
          </CardHeader>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} borderRadius="xl" boxShadow="sm">
          <CardHeader pb={4}>
            <HStack>
              <Icon as={MdBuild} w={7} h={7} color="#3AC0E7" />
              <Text fontSize="xl" fontWeight="bold" color="gray.700">Service Information</Text>
            </HStack>
          </CardHeader>
          <Divider borderColor="gray.200" />
          <CardBody pt={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isInvalid={errors.name}>
                  <FormLabel fontWeight="600" color="gray.700" mb={2}>Service Name *</FormLabel>
                  <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter service name" />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="600" color="gray.700" mb={2}>Status</FormLabel>
                  <Select name="isActive" value={formData.isActive} onChange={handleInputChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="600" color="gray.700" mb={2}>Description</FormLabel>
                  <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Enter description" />
                </FormControl>
                <HStack spacing={4} justify="flex-end" pt={2}>
                  <Button as={Link} to="/admin/services/all" variant="outline"   _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}>Cancel</Button>
                  <Button type="submit" variant="primary" isLoading={isUpdating} loadingText="Updating...">Update Service</Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default UpdateService;
 
