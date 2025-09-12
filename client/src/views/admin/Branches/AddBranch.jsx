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
  SimpleGrid,
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
import {
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdPerson,
} from 'react-icons/md';
import { useCreateBranchMutation } from '../../../features/api/branchApi';

const AddBranch = () => {
  const [formData, setFormData] = useState({
    branchName: '',
    address: '',
    gst: '',
    pan: '',
    scn: '',
    phone: '',
    email: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const toast = useToast();
  const [createBranch, { isLoading: isSubmitting }] = useCreateBranchMutation();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

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
      const result = await createBranch(formData).unwrap();

      toast({
        title: 'Branch Added Successfully',
        description:
          result.message ||
          `${formData.branchName} has been added to the system.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        branchName: '',
        address: '',
        gst: '',
        pan: '',
        scn: '',
        phone: '',
        email: '',
        status: 'active',
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating branch:', error);
      toast({
        title: 'Error',
        description:
          error?.data?.message || 'Failed to add branch. Please try again.',
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
              <Icon as={MdBusiness} w={7} h={7} color="#3AC0E7" />
              <Text fontSize="xl" fontWeight="bold" color="gray.700">
                Branch Information
              </Text>
            </HStack>
          </CardHeader>
          <Divider borderColor="gray.200" />
          <CardBody pt={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={errors.branchName}>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Branch Name *
                    </FormLabel>
                    <Input
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      placeholder="Enter branch name"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#3AC0E7',
                        boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)',
                      }}
                      _hover={{
                        borderColor: 'gray.300',
                      }}
                      h="48px" 
                      fontSize="md"
                    />
                    <FormErrorMessage>{errors.branchName}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Status
                    </FormLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#3AC0E7',
                        boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)',
                      }}
                      _hover={{
                        borderColor: 'gray.300',
                      }}
                      h="48px"  
                      fontSize="md"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

               
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdLocationOn} w={5} h={5} color="#3AC0E7" />
                    <Text fontSize="md" fontWeight="semibold">
                      Address Information
                    </Text>
                  </HStack>

                  <FormControl isInvalid={errors.address} mb={4}>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Address *
                    </FormLabel>
                    <Textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter full address"
                      rows={3}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#3AC0E7',
                        boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)',
                      }}
                      _hover={{
                        borderColor: 'gray.300',
                      }}
                      py={4}
                      fontSize="md"
                      resize="vertical"
                    />
                    <FormErrorMessage>{errors.address}</FormErrorMessage>
                  </FormControl>
                </Box>

                {/* Contact Information */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdPhone} w={5} h={5} color="#3AC0E7" />
                    <Text fontSize="md" fontWeight="semibold">
                      Contact Information
                    </Text>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        type="tel"
                      />
                    </FormControl>

                    <FormControl isInvalid={errors.email}>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        type="email"
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Business Information */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdBusiness} w={5} h={5} color="#3AC0E7" />
                    <Text fontSize="md" fontWeight="semibold">
                      Business Information
                    </Text>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel>GST Number</FormLabel>
                      <Input
                        name="gst"
                        value={formData.gst}
                        onChange={handleInputChange}
                        placeholder="Enter GST number"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>PAN Number</FormLabel>
                      <Input
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        placeholder="Enter PAN number"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>SCN Number</FormLabel>
                      <Input
                        name="scn"
                        value={formData.scn}
                        onChange={handleInputChange}
                        placeholder="Enter SCN number"
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Submit Buttons */}
                <HStack spacing={6} justify="flex-end" pt={8}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        branchName: '',
                        address: '',
                        gst: '',
                        pan: '',
                        scn: '',
                        phone: '',
                        email: '',
                        status: 'active',
                      });
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
                    loadingText="Adding Branch..."
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    minW="160px"
                  >
                    Add Branch
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

export default AddBranch;
