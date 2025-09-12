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
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Badge,
  Flex,
} from '@chakra-ui/react';
import {
  MdPerson,
  MdEmail,
  MdBusiness,
  MdPhone,
  MdArrowBack,
  MdPhoto,
  MdUpload,
} from 'react-icons/md';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  useGetBranchAdminByIdMutation,
  useUpdateBranchAdminMutation,
} from '../../../features/api/branchAdmin';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';

const UpdateBranchAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Get ID from location state
  const id = location.state?.adminId;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    bio: '',
    status: 'active',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [existingProfilePhoto, setExistingProfilePhoto] = useState('');
  const [existingBannerImage, setExistingBannerImage] = useState('');

  const [getBranchAdminById] = useGetBranchAdminByIdMutation();
  const [updateBranchAdmin, { isLoading: isUpdating }] =
    useUpdateBranchAdminMutation();
  
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

  // Fetch branch admin data on component mount
  useEffect(() => {
    const fetchBranchAdminData = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const result = await getBranchAdminById({ id }).unwrap();

        if (result.success && result.branchAdmin) {
          const admin = result.branchAdmin;
          setFormData({
            name: admin.name || '',
            email: admin.email || '',
            phone: admin.phone || '',
            branch: admin.branch?._id || admin.branch || '',
            bio: admin.bio || '',
            status: admin.status || 'active',
          });

          // Set existing images
          if (admin.photoUrl) {
            setExistingProfilePhoto(admin.photoUrl);
          }
          if (admin.bannerUrl) {
            setExistingBannerImage(admin.bannerUrl);
          }

          // Set selected branch
          if (admin.branch) {
            const branch = branches.find(
              (b) => b._id === admin.branch._id || b._id === admin.branch,
            );
            if (branch) {
              setSelectedBranch(branch);
            }
          }
        } else {
          setFetchError('Failed to fetch branch admin data');
        }
      } catch (error) {
        console.error('Error fetching branch admin:', error);
        setFetchError(
          error?.data?.message || 'Failed to fetch branch admin data',
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBranchAdminData();
    }
  }, [id, getBranchAdminById, branches]);

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
      formDataToSend.append('id', id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('branch', formData.branch);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('status', formData.status);

      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }
      if (bannerImage) {
        formDataToSend.append('bannerImage', bannerImage);
      }

      const result = await updateBranchAdmin(formDataToSend).unwrap();

      toast({
        title: 'Branch Admin Updated Successfully',
        description:
          result.message || `${formData.name} has been updated successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate back to branch admin list
      navigate('/admin/branch-admins');
    } catch (error) {
      console.error('Error updating branch admin:', error);
      toast({
        title: 'Error',
        description:
          error?.data?.message ||
          'Failed to update branch admin. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="#2BA8D1" />
            <Text>Loading branch admin data...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Error loading branch admin data</Text>
            <Text>{fetchError}</Text>
            <Button
              leftIcon={<MdArrowBack />}
              onClick={() => navigate('/admin/branch-admins')}
              size="sm"
              variant="outline"
            >
              Go Back
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
  
        <Card 
          bg={cardBg} 
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        >
          <CardHeader pb={4}>
            <HStack justify="space-between">
              <HStack>
                <Icon as={MdBusiness} w={7} h={7} color="#3AC0E7" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    Update Branch Admin
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Modify branch information and settings
                  </Text>
                </VStack>
              </HStack>
              <Button
                as={Link}
                to='/admin/branch-admins'
                leftIcon={<MdArrowBack />}
                variant="outline"
                colorScheme="gray"
                _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}
              >
                Back to Admins
              </Button>
            </HStack>
          </CardHeader>
        </Card>

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

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Profile Photo
                      </FormLabel>

                      {/* Current Profile Photo */}
                      {existingProfilePhoto && !profilePhoto && (
                        <Box mb={4}>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            mb={2}
                            fontWeight="500"
                          >
                            Current Profile Photo:
                          </Text>
                          <Box
                            border="2px solid"
                            borderColor="blue.200"
                            borderRadius="lg"
                            p={2}
                            bg="blue.50"
                          >
                            <img
                              src={existingProfilePhoto}
                              alt="Current Profile"
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <Box
                              display="none"
                              textAlign="center"
                              py={8}
                              color="gray.500"
                            >
                              <Text>Image not available</Text>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* New Profile Photo Preview */}
                      {profilePhoto && (
                        <Box mb={4}>
                          <Text
                            fontSize="sm"
                            color="green.600"
                            mb={2}
                            fontWeight="500"
                          >
                            New Profile Photo Preview:
                          </Text>
                          <Box
                            border="2px solid"
                            borderColor="green.200"
                            borderRadius="lg"
                            p={2}
                            bg="green.50"
                          >
                            <img
                              src={URL.createObjectURL(profilePhoto)}
                              alt="New Profile Preview"
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                              }}
                            />
                            <Text
                              fontSize="xs"
                              color="green.600"
                              mt={1}
                              textAlign="center"
                            >
                              {profilePhoto.name}
                            </Text>
                          </Box>
                        </Box>
                      )}

                      {/* Custom File Upload */}
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
                          p={4}
                          border="2px dashed"
                          borderColor="gray.300"
                          borderRadius="lg"
                          bg="gray.50"
                          _hover={{
                            borderColor: '#2BA8D1',
                            bg: 'blue.50',
                          }}
                          _focus={{
                            borderColor: '#2BA8D1',
                            boxShadow: '0 0 0 3px rgba(43, 168, 209, 0.1)',
                          }}
                          cursor="pointer"
                          minH="60px"
                        >
                          <HStack spacing={3}>
                            <Icon as={MdUpload} color="#2BA8D1" w={5} h={5} />
                            <VStack align="start" spacing={0}>
                              <Text
                                fontSize="sm"
                                color="gray.700"
                                fontWeight="500"
                              >
                                {profilePhoto
                                  ? 'Change Profile Photo'
                                  : 'Upload Profile Photo'}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                JPG, PNG up to 10MB
                              </Text>
                            </VStack>
                          </HStack>
                          <Box
                            px={3}
                            py={1}
                            bg="white"
                            border="1px solid"
                            borderColor="gray.300"
                            borderRadius="md"
                            fontSize="xs"
                            color="gray.600"
                            fontWeight="500"
                          >
                            Browse
                          </Box>
                        </Flex>
                      </Box>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Banner Image
                      </FormLabel>

                      {/* Current Banner Image */}
                      {existingBannerImage && !bannerImage && (
                        <Box mb={4}>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            mb={2}
                            fontWeight="500"
                          >
                            Current Banner Image:
                          </Text>
                          <Box
                            border="2px solid"
                            borderColor="blue.200"
                            borderRadius="lg"
                            p={2}
                            bg="blue.50"
                          >
                            <img
                              src={existingBannerImage}
                              alt="Current Banner"
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <Box
                              display="none"
                              textAlign="center"
                              py={8}
                              color="gray.500"
                            >
                              <Text>Image not available</Text>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* New Banner Image Preview */}
                      {bannerImage && (
                        <Box mb={4}>
                          <Text
                            fontSize="sm"
                            color="green.600"
                            mb={2}
                            fontWeight="500"
                          >
                            New Banner Image Preview:
                          </Text>
                          <Box
                            border="2px solid"
                            borderColor="green.200"
                            borderRadius="lg"
                            p={2}
                            bg="green.50"
                          >
                            <img
                              src={URL.createObjectURL(bannerImage)}
                              alt="New Banner Preview"
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                              }}
                            />
                            <Text
                              fontSize="xs"
                              color="green.600"
                              mt={1}
                              textAlign="center"
                            >
                              {bannerImage.name}
                            </Text>
                          </Box>
                        </Box>
                      )}

                      {/* Custom File Upload */}
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
                          p={4}
                          border="2px dashed"
                          borderColor="gray.300"
                          borderRadius="lg"
                          bg="gray.50"
                          _hover={{
                            borderColor: '#2BA8D1',
                            bg: 'blue.50',
                          }}
                          _focus={{
                            borderColor: '#2BA8D1',
                            boxShadow: '0 0 0 3px rgba(43, 168, 209, 0.1)',
                          }}
                          cursor="pointer"
                          minH="60px"
                        >
                          <HStack spacing={3}>
                            <Icon as={MdUpload} color="#2BA8D1" w={5} h={5} />
                            <VStack align="start" spacing={0}>
                              <Text
                                fontSize="sm"
                                color="gray.700"
                                fontWeight="500"
                              >
                                {bannerImage
                                  ? 'Change Banner Image'
                                  : 'Upload Banner Image'}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                JPG, PNG up to 10MB
                              </Text>
                            </VStack>
                          </HStack>
                          <Box
                            px={3}
                            py={1}
                            bg="white"
                            border="1px solid"
                            borderColor="gray.300"
                            borderRadius="md"
                            fontSize="xs"
                            color="gray.600"
                            fontWeight="500"
                          >
                            Browse
                          </Box>
                        </Flex>
                      </Box>
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Submit Buttons */}
                <HStack spacing={6} justify="flex-end" pt={8}>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/branch-admins')}
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg="#2BA8D1"
                    color="white"
                    _hover={{ bg: '#0C2F4D' }}
                    isLoading={isUpdating}
                    loadingText="Updating Branch Admin..."
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    minW="180px"
                  >
                    Update Branch Admin
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

export default UpdateBranchAdmin;
