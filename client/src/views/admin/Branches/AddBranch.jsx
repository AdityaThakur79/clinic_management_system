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
import { MdBusiness, MdLocationOn, MdPhone, MdEmail, MdPerson } from 'react-icons/md';

const AddBranch = () => {
  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    openingTime: '',
    closingTime: '',
    status: 'active',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    if (!formData.branchCode.trim()) {
      newErrors.branchCode = 'Branch code is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.managerName.trim()) {
      newErrors.managerName = 'Manager name is required';
    }

    if (!formData.managerEmail.trim()) {
      newErrors.managerEmail = 'Manager email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.managerEmail)) {
      newErrors.managerEmail = 'Manager email is invalid';
    }

    if (!formData.managerPhone.trim()) {
      newErrors.managerPhone = 'Manager phone is required';
    }

    if (!formData.openingTime) {
      newErrors.openingTime = 'Opening time is required';
    }

    if (!formData.closingTime) {
      newErrors.closingTime = 'Closing time is required';
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

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Branch Added Successfully',
        description: `${formData.branchName} has been added to the system.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        branchName: '',
        branchCode: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        email: '',
        managerName: '',
        managerEmail: '',
        managerPhone: '',
        openingTime: '',
        closingTime: '',
        status: 'active',
        description: '',
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add branch. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        

        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <HStack>
              <Icon as={MdBusiness} w={6} h={6} color="blue.500" />
              <Text fontSize="lg" fontWeight="semibold">
                Branch Information
              </Text>
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={errors.branchName}>
                    <FormLabel>Branch Name *</FormLabel>
                    <Input
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      placeholder="Enter branch name"
                    />
                    <FormErrorMessage>{errors.branchName}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.branchCode}>
                    <FormLabel>Branch Code *</FormLabel>
                    <Input
                      name="branchCode"
                      value={formData.branchCode}
                      onChange={handleInputChange}
                      placeholder="e.g., BR001"
                    />
                    <FormErrorMessage>{errors.branchCode}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                {/* Address Information */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdLocationOn} w={5} h={5} color="green.500" />
                    <Text fontSize="md" fontWeight="semibold">
                      Address Information
                    </Text>
                  </HStack>
                  
                  <FormControl isInvalid={errors.address} mb={4}>
                    <FormLabel>Address *</FormLabel>
                    <Textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter full address"
                      rows={3}
                    />
                    <FormErrorMessage>{errors.address}</FormErrorMessage>
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isInvalid={errors.city}>
                      <FormLabel>City *</FormLabel>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                      />
                      <FormErrorMessage>{errors.city}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.state}>
                      <FormLabel>State *</FormLabel>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                      />
                      <FormErrorMessage>{errors.state}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.zipCode}>
                      <FormLabel>ZIP Code *</FormLabel>
                      <Input
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="Enter ZIP code"
                      />
                      <FormErrorMessage>{errors.zipCode}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isInvalid={errors.country} mt={4}>
                    <FormLabel>Country *</FormLabel>
                    <Select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Select country"
                    >
                      <option value="USA">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="India">India</option>
                      <option value="Australia">Australia</option>
                      <option value="Other">Other</option>
                    </Select>
                    <FormErrorMessage>{errors.country}</FormErrorMessage>
                  </FormControl>
                </Box>

                {/* Contact Information */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdPhone} w={5} h={5} color="purple.500" />
                    <Text fontSize="md" fontWeight="semibold">
                      Contact Information
                    </Text>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isInvalid={errors.phone}>
                      <FormLabel>Phone Number *</FormLabel>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        type="tel"
                      />
                      <FormErrorMessage>{errors.phone}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.email}>
                      <FormLabel>Email Address *</FormLabel>
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

                {/* Manager Information */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdPerson} w={5} h={5} color="orange.500" />
                    <Text fontSize="md" fontWeight="semibold">
                      Branch Manager Information
                    </Text>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isInvalid={errors.managerName}>
                      <FormLabel>Manager Name *</FormLabel>
                      <Input
                        name="managerName"
                        value={formData.managerName}
                        onChange={handleInputChange}
                        placeholder="Enter manager name"
                      />
                      <FormErrorMessage>{errors.managerName}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.managerEmail}>
                      <FormLabel>Manager Email *</FormLabel>
                      <Input
                        name="managerEmail"
                        value={formData.managerEmail}
                        onChange={handleInputChange}
                        placeholder="Enter manager email"
                        type="email"
                      />
                      <FormErrorMessage>{errors.managerEmail}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.managerPhone}>
                      <FormLabel>Manager Phone *</FormLabel>
                      <Input
                        name="managerPhone"
                        value={formData.managerPhone}
                        onChange={handleInputChange}
                        placeholder="Enter manager phone"
                        type="tel"
                      />
                      <FormErrorMessage>{errors.managerPhone}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Operating Hours */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={4}>
                    Operating Hours
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isInvalid={errors.openingTime}>
                      <FormLabel>Opening Time *</FormLabel>
                      <Input
                        name="openingTime"
                        value={formData.openingTime}
                        onChange={handleInputChange}
                        type="time"
                      />
                      <FormErrorMessage>{errors.openingTime}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.closingTime}>
                      <FormLabel>Closing Time *</FormLabel>
                      <Input
                        name="closingTime"
                        value={formData.closingTime}
                        onChange={handleInputChange}
                        type="time"
                      />
                      <FormErrorMessage>{errors.closingTime}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Under Maintenance</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Description */}
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter any additional information about this branch"
                    rows={4}
                  />
                </FormControl>

                {/* Submit Buttons */}
                <HStack spacing={4} justify="flex-end" pt={4}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        branchName: '',
                        branchCode: '',
                        address: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: '',
                        phone: '',
                        email: '',
                        managerName: '',
                        managerEmail: '',
                        managerPhone: '',
                        openingTime: '',
                        closingTime: '',
                        status: 'active',
                        description: '',
                      });
                      setErrors({});
                    }}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isSubmitting}
                    loadingText="Adding Branch..."
                    size="lg"
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
