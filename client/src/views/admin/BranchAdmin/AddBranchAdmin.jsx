import React, { useState, useEffect } from 'react';
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
  Badge,
  Flex,
} from '@chakra-ui/react';
import {
  MdPerson,
  MdEmail,
  MdBusiness,
  MdPhoto,
  MdUpload,
} from 'react-icons/md';
import { useCreateBranchAdminMutation } from '../../../features/api/branchAdmin';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';

const AddBranchAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    phone: '',
    bio: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);

  const toast = useToast();
  const [createBranchAdmin, { isLoading: isSubmitting }] =
    useCreateBranchAdminMutation();

  // Fetch all branches using query
  const { data: branchesData, isLoading: branchesLoading } =
    useGetAllBranchesQuery({
      page: 1,
      limit: 100,
      search: '',
    });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Update branches when data is fetched
  useEffect(() => {
    if (branchesData?.branches) {
      setBranches(branchesData.branches);
    }
  }, [branchesData]);

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

  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      branch: branchId,
    }));

    const branch = branches.find((b) => b._id === branchId);
    setSelectedBranch(branch);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'profile') {
        setProfilePhoto(file);
      } else {
        setBannerImage(file);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
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
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('branch', formData.branch);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('status', formData.status);

      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }
      if (bannerImage) {
        formDataToSend.append('bannerImage', bannerImage);
      }

      const result = await createBranchAdmin(formDataToSend).unwrap();

      toast({
        title: 'Branch Admin Added Successfully',
        description:
          result.message || `${formData.name} has been added as Branch Admin.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        branch: '',
        phone: '',
        bio: '',
        status: 'active',
      });
      setErrors({});
      setSelectedBranch(null);
      setProfilePhoto(null);
      setBannerImage(null);
    } catch (error) {
      console.error('Error creating branch admin:', error);
      toast({
        title: 'Error',
        description:
          error?.data?.message ||
          'Failed to add branch admin. Please try again.',
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
              <Icon as={MdPerson} w={7} h={7} color="#2BA8D1" />
              <Text fontSize="xl" fontWeight="bold" color="gray.700">
                Branch Admin Information
              </Text>
            </HStack>
          </CardHeader>
          <Divider borderColor="gray.200" />
          <CardBody pt={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={errors.name}>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Full Name *
                    </FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#2BA8D1',
                        boxShadow: '0 0 0 3px rgba(43, 168, 209, 0.1)',
                      }}
                      _hover={{ borderColor: 'gray.300' }}
                      h="48px"
                      fontSize="md"
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.email}>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Email Address *
                    </FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#2BA8D1',
                        boxShadow: '0 0 0 3px rgba(43, 168, 209, 0.1)',
                      }}
                      _hover={{ borderColor: 'gray.300' }}
                      h="48px"
                      fontSize="md"
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={errors.password}>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Password *
                    </FormLabel>
                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#2BA8D1',
                        boxShadow: '0 0 0 3px rgba(43, 168, 209, 0.1)',
                      }}
                      _hover={{ borderColor: 'gray.300' }}
                      h="48px"
                      fontSize="md"
                    />
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.phone}>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Phone Number *
                    </FormLabel>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#2BA8D1',
                        boxShadow: '0 0 0 3px rgba(43, 168, 209, 0.1)',
                      }}
                      _hover={{ borderColor: 'gray.300' }}
                      h="48px"
                      fontSize="md"
                    />
                    <FormErrorMessage>{errors.phone}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <FormControl isInvalid={errors.branch}>
                  <FormLabel fontWeight="600" color="gray.700" mb={2}>
                    Branch *
                  </FormLabel>
                  <Select
                    name="branch"
                    value={formData.branch}
                    onChange={handleBranchChange}
                    placeholder={
                      branchesLoading ? 'Loading branches...' : 'Select branch'
                    }
                    isDisabled={branchesLoading}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: '#2BA8D1',
                      boxShadow: '0 0 0 3px rgba(43, 168, 209, 0.1)',
                    }}
                    _hover={{ borderColor: 'gray.300' }}
                    h="48px"
                    fontSize="md"
                  >
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.branchName}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.branch}</FormErrorMessage>
                </FormControl>

                {/* Selected Branch Info */}
                {selectedBranch && (
                  <Box
                    p={4}
                    bg="blue.50"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="blue.200"
                  >
                    <HStack>
                      <Icon as={MdBusiness} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" color="blue.700">
                        Selected Branch: {selectedBranch.branchName}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="blue.600" mt={1}>
                      {selectedBranch.address}
                    </Text>
                  </Box>
                )}

                {/* Bio Section */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdPerson} w={5} h={5} color="#2BA8D1" />
                    <Text fontSize="md" fontWeight="semibold">
                      Bio Information
                    </Text>
                  </HStack>

                  <FormControl>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Bio
                    </FormLabel>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Enter bio information"
                      rows={3}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: '#2BA8D1',
                        boxShadow: '0 0 0 3px rgba(43, 168, 209, 0.1)',
                      }}
                      _hover={{ borderColor: 'gray.300' }}
                      py={4}
                      fontSize="md"
                      resize="vertical"
                    />
                  </FormControl>
                </Box>

                {/* File Upload Section */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdPhoto} w={5} h={5} color="#2BA8D1" />
                    <Text fontSize="md" fontWeight="semibold">
                      Profile Images
                    </Text>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Profile Photo</FormLabel>
                      <Box position="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'profile')}
                          position="absolute"
                          top="0"
                          left="0"
                          width="100%"
                          height="100%"
                          opacity="0"
                          cursor="pointer"
                          zIndex="2"
                        />
                        <Flex
                          align="center"
                          justify="space-between"
                          p={3}
                          border="2px dashed"
                          borderColor="gray.300"
                          borderRadius="lg"
                          bg="gray.50"
                          _hover={{
                            borderColor: '#2BA8D1',
                            bg: 'blue.50',
                          }}
                          cursor="pointer"
                          minH="50px"
                        >
                          <HStack>
                            <Icon as={MdUpload} color="#2BA8D1" />
                            <Text fontSize="sm" color="gray.600">
                              {profilePhoto ? profilePhoto.name : 'Choose file'}
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            Browse
                          </Text>
                        </Flex>
                      </Box>
                      {profilePhoto && (
                        <Text fontSize="sm" color="green.600" mt={1}>
                          Selected: {profilePhoto.name}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Banner Image</FormLabel>
                      <Box position="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'banner')}
                          position="absolute"
                          top="0"
                          left="0"
                          width="100%"
                          height="100%"
                          opacity="0"
                          cursor="pointer"
                          zIndex="2"
                        />
                        <Flex
                          align="center"
                          justify="space-between"
                          p={3}
                          border="2px dashed"
                          borderColor="gray.300"
                          borderRadius="lg"
                          bg="gray.50"
                          _hover={{
                            borderColor: '#2BA8D1',
                            bg: 'blue.50',
                          }}
                          cursor="pointer"
                          minH="50px"
                        >
                          <HStack>
                            <Icon as={MdUpload} color="#2BA8D1" />
                            <Text fontSize="sm" color="gray.600">
                              {bannerImage ? bannerImage.name : 'Choose file'}
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            Browse
                          </Text>
                        </Flex>
                      </Box>
                      {bannerImage && (
                        <Text fontSize="sm" color="green.600" mt={1}>
                          Selected: {bannerImage.name}
                        </Text>
                      )}
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Status */}
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
                      borderColor: '#2BA8D1',
                      boxShadow: '0 0 0 3px rgba(43, 168, 209, 0.1)',
                    }}
                    _hover={{ borderColor: 'gray.300' }}
                    h="48px"
                    fontSize="md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </FormControl>

                {/* Submit Buttons */}
                <HStack spacing={6} justify="flex-end" pt={8}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        branch: '',
                        phone: '',
                        bio: '',
                        status: 'active',
                      });
                      setErrors({});
                      setSelectedBranch(null);
                      setProfilePhoto(null);
                      setBannerImage(null);
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
                    bg="#2BA8D1"
                    color="white"
                    _hover={{ bg: '#0C2F4D' }}
                    isLoading={isSubmitting}
                    loadingText="Adding Branch Admin..."
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    minW="180px"
                  >
                    Add Branch Admin
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

export default AddBranchAdmin;
