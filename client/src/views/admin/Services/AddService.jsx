import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { MdBuild } from 'react-icons/md';
import { useCreateServiceMutation } from '../../../features/api/service';

const AddService = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: 'active',
  });

  const [errors, setErrors] = useState({});
  const toast = useToast();
  const [createService, { isLoading: isSubmitting }] = useCreateServiceMutation();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description,
        isActive: formData.isActive === 'active',
      };
      const result = await createService(payload).unwrap();
      toast({
        title: 'Service Added Successfully',
        description: result.message || `${formData.name} has been added to the catalog.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFormData({ name: '', description: '', isActive: 'active' });
      setErrors({});
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to add service. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        <Card
          bg={cardBg}
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          _hover={{
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          }}
        >
          <CardHeader pb={4}>
            <HStack>
              <Icon as={MdBuild} w={7} h={7} color="#3AC0E7" />
              <Text fontSize="xl" fontWeight="bold" color="gray.700">
                Service Information
              </Text>
            </HStack>
          </CardHeader>
          <Divider borderColor="gray.200" />
          <CardBody pt={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Info */}
                <FormControl isInvalid={errors.name}>
                  <FormLabel fontWeight="600" color="gray.700" mb={2}>
                    Service Name *
                  </FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter service name"
                    borderRadius="lg"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: '#3AC0E7', boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)' }}
                    _hover={{ borderColor: 'gray.300' }}
                    h="48px"
                    fontSize="md"
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" color="gray.700" mb={2}>
                    Status
                  </FormLabel>
                  <Select
                    name="isActive"
                    value={formData.isActive}
                    onChange={handleInputChange}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: '#3AC0E7', boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)' }}
                    _hover={{ borderColor: 'gray.300' }}
                    h="48px"
                    fontSize="md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" color="gray.700" mb={2}>
                    Description
                  </FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter a short description of the service"
                    rows={4}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: '#3AC0E7', boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)' }}
                    _hover={{ borderColor: 'gray.300' }}
                    py={4}
                    fontSize="md"
                    resize="vertical"
                  />
                </FormControl>

                {/* Actions */}
                <HStack spacing={6} justify="flex-end" pt={2}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({ name: '', description: '', isActive: 'active' });
                      setErrors({});
                    }}
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    _hover={{ 
                      bg: "#2BA8D1", 
                      color: "white",
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                    }}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    loadingText="Adding Service..."
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    minW="160px"
                  >
                    Add Service
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

export default AddService;
 
