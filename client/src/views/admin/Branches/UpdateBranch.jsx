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
  Checkbox,
  CheckboxGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  CloseButton,
} from '@chakra-ui/react';
import { MdBusiness, MdLocationOn, MdPhone, MdEmail, MdArrowBack, MdSchedule, MdAccessTime } from 'react-icons/md';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useGetBranchByIdMutation, useUpdateBranchMutation } from '../../../features/api/branchApi';

const UpdateBranch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Get ID from location state
  const id = location.state?.branchId;

  const [formData, setFormData] = useState({
    branchName: '',
    address: '',
    gst: '',
    pan: '',
    scn: '',
    phone: '',
    email: '',
    status: 'active',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    dailyWorkingHours: {
      Monday: { start: '09:00', end: '17:00', isWorking: true },
      Tuesday: { start: '09:00', end: '17:00', isWorking: true },
      Wednesday: { start: '09:00', end: '17:00', isWorking: true },
      Thursday: { start: '09:00', end: '17:00', isWorking: true },
      Friday: { start: '09:00', end: '17:00', isWorking: true },
      Saturday: { start: '09:00', end: '17:00', isWorking: true },
      Sunday: { start: '09:00', end: '17:00', isWorking: false }
    },
    slotDuration: 30,
    breakTimes: []
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [getBranchById] = useGetBranchByIdMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();

  // Fetch branch details on component mount
  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        
        const result = await getBranchById({ id }).unwrap();
        
        if (result.success && result.branch) {
          const branch = result.branch;
          setFormData({
            branchName: branch.branchName || '',
            address: branch.address || '',
            gst: branch.gst || '',
            pan: branch.pan || '',
            scn: branch.scn || '',
            phone: branch.phone || '',
            email: branch.email || '',
            status: branch.status || 'active',
            workingDays: branch.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            workingHours: branch.workingHours || { start: '09:00', end: '17:00' },
            dailyWorkingHours: branch.dailyWorkingHours || {
              Monday: { start: '09:00', end: '17:00', isWorking: true },
              Tuesday: { start: '09:00', end: '17:00', isWorking: true },
              Wednesday: { start: '09:00', end: '17:00', isWorking: true },
              Thursday: { start: '09:00', end: '17:00', isWorking: true },
              Friday: { start: '09:00', end: '17:00', isWorking: true },
              Saturday: { start: '09:00', end: '17:00', isWorking: true },
              Sunday: { start: '09:00', end: '17:00', isWorking: false }
            },
            slotDuration: branch.slotDuration || 30,
            breakTimes: branch.breakTimes || []
          });
        } else {
          setFetchError('Branch not found');
        }
      } catch (error) {
        console.error('Error fetching branch details:', error);
        setFetchError(error?.data?.message || 'Failed to fetch branch details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBranchDetails();
    }
  }, [id, getBranchById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleWorkingDaysChange = (selectedDays) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: selectedDays,
    }));
  };

  const handleWorkingHoursChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value,
      },
    }));
  };

  const handleSlotDurationChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      slotDuration: parseInt(value) || 30,
    }));
  };

  const addBreakTime = () => {
    setFormData((prev) => ({
      ...prev,
      breakTimes: [...prev.breakTimes, { start: '12:00', end: '13:00' }],
    }));
  };

  const removeBreakTime = (index) => {
    setFormData((prev) => ({
      ...prev,
      breakTimes: prev.breakTimes.filter((_, i) => i !== index),
    }));
  };

  const updateBreakTime = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      breakTimes: prev.breakTimes.map((breakTime, i) =>
        i === index ? { ...breakTime, [field]: value } : breakTime
      ),
    }));
  };

  const handleDailyWorkingHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      dailyWorkingHours: {
        ...prev.dailyWorkingHours,
        [day]: {
          ...prev.dailyWorkingHours[day],
          [field]: value
        }
      }
    }));
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
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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
      const updateData = {
        id,
        ...formData,
      };

      const result = await updateBranch(updateData).unwrap();
      
      toast({
        title: 'Branch Updated Successfully',
        description: result.message || `${formData.branchName} has been updated successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate back to branches list
      navigate('/admin/branches/all');
      
    } catch (error) {
      console.error('Error updating branch:', error);
      toast({
        title: 'Update Failed',
        description: error?.data?.message || 'Failed to update branch. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    navigate('/admin/branches/all');
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Loading state
  if (isLoading) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="#3AC0E7" />
            <Text color="gray.600">Loading branch details...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  // Error state - No ID provided
  if (!id) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Center py={20}>
          <VStack spacing={4} maxW="md">
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              No branch selected for editing. Please select a branch to edit.
            </Alert>
            <Button as={Link} to="/admin/branches" leftIcon={<MdArrowBack />}>
              Back to Branches
            </Button>
          </VStack>
        </Center>
      </Box>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Center py={20}>
          <VStack spacing={4} maxW="md">
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {fetchError}
            </Alert>
            <HStack spacing={4}>
              <Button as={Link} to="/admin/branches" leftIcon={<MdArrowBack />}>
                Back to Branches
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </HStack>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
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
                    Update Branch
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Modify branch information and settings
                  </Text>
                </VStack>
              </HStack>
              <Button
                as={Link}
                to="/admin/branches"
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
                Back to Branches
              </Button>
            </HStack>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card 
          bg={cardBg} 
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          _hover={{
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transform: "translateY(-2px)",
            transition: "all 0.3s ease"
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
                        borderColor: "#3AC0E7",
                        boxShadow: "0 0 0 3px rgba(58, 192, 231, 0.1)",
                      }}
                      _hover={{
                        borderColor: "gray.300",
                      }}
                      py={6}
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
                        borderColor: "#3AC0E7",
                        boxShadow: "0 0 0 3px rgba(58, 192, 231, 0.1)",
                      }}
                      _hover={{
                        borderColor: "gray.300",
                      }}
                      py={6}
                      fontSize="md"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* Address Information */}
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
                        borderColor: "#3AC0E7",
                        boxShadow: "0 0 0 3px rgba(58, 192, 231, 0.1)",
                      }}
                      _hover={{
                        borderColor: "gray.300",
                      }}
                      fontSize="md"
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
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isInvalid={errors.phone}>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Phone Number
                      </FormLabel>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "#3AC0E7",
                          boxShadow: "0 0 0 3px rgba(58, 192, 231, 0.1)",
                        }}
                        _hover={{
                          borderColor: "gray.300",
                        }}
                        py={6}
                        fontSize="md"
                      />
                      <FormErrorMessage>{errors.phone}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.email}>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Email Address
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
                          borderColor: "#3AC0E7",
                          boxShadow: "0 0 0 3px rgba(58, 192, 231, 0.1)",
                        }}
                        _hover={{
                          borderColor: "gray.300",
                        }}
                        py={6}
                        fontSize="md"
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
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <FormControl>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        GST Number
                      </FormLabel>
                      <Input
                        name="gst"
                        value={formData.gst}
                        onChange={handleInputChange}
                        placeholder="Enter GST number"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "#3AC0E7",
                          boxShadow: "0 0 0 3px rgba(58, 192, 231, 0.1)",
                        }}
                        _hover={{
                          borderColor: "gray.300",
                        }}
                        py={6}
                        fontSize="md"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        PAN Number
                      </FormLabel>
                      <Input
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        placeholder="Enter PAN number"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "#3AC0E7",
                          boxShadow: "0 0 0 3px rgba(58, 192, 231, 0.1)",
                        }}
                        _hover={{
                          borderColor: "gray.300",
                        }}
                        py={6}
                        fontSize="md"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        SCN Number
                      </FormLabel>
                      <Input
                        name="scn"
                        value={formData.scn}
                        onChange={handleInputChange}
                        placeholder="Enter SCN number"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "#3AC0E7",
                          boxShadow: "0 0 0 3px rgba(58, 192, 231, 0.1)",
                        }}
                        _hover={{
                          borderColor: "gray.300",
                        }}
                        py={6}
                        fontSize="md"
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Working Hours and Slots */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdSchedule} w={5} h={5} color="#3AC0E7" />
                    <Text fontSize="md" fontWeight="semibold">
                      Working Hours & Slot Management
                    </Text>
                  </HStack>

                  <VStack spacing={6} align="stretch">
                    {/* Daily Working Hours */}
                    <Box>
                      <FormLabel fontWeight="600" color="gray.700" mb={3}>
                        Daily Working Hours *
                      </FormLabel>
                      <Text fontSize="sm" color="gray.600" mb={4}>
                        Set different working hours for each day. Check the box to enable working on that day.
                      </Text>
                      
                      <VStack spacing={4} align="stretch">
                        {Object.keys(formData.dailyWorkingHours).map((day) => (
                          <Box key={day} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg">
                            <HStack justify="space-between" mb={3}>
                              <Text fontWeight="medium" fontSize="md">
                                {day}
                              </Text>
                              <Checkbox
                                isChecked={formData.dailyWorkingHours[day].isWorking}
                                onChange={(e) => handleDailyWorkingHoursChange(day, 'isWorking', e.target.checked)}
                                colorScheme="blue"
                                size="md"
                              >
                                Working Day
                              </Checkbox>
                            </HStack>
                            
                            {formData.dailyWorkingHours[day].isWorking && (
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl>
                                  <FormLabel fontSize="sm" fontWeight="600">Start Time</FormLabel>
                                  <Input
                                    type="time"
                                    value={formData.dailyWorkingHours[day].start}
                                    onChange={(e) => handleDailyWorkingHoursChange(day, 'start', e.target.value)}
                                    size="md"
                                    borderRadius="lg"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    _focus={{
                                      borderColor: '#3AC0E7',
                                      boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)',
                                    }}
                                    h="48px"
                                    fontSize="md"
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel fontSize="sm" fontWeight="600">End Time</FormLabel>
                                  <Input
                                    type="time"
                                    value={formData.dailyWorkingHours[day].end}
                                    onChange={(e) => handleDailyWorkingHoursChange(day, 'end', e.target.value)}
                                    size="md"
                                    borderRadius="lg"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    _focus={{
                                      borderColor: '#3AC0E7',
                                      boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)',
                                    }}
                                    h="48px"
                                    fontSize="md"
                                  />
                                </FormControl>
                              </SimpleGrid>
                            )}
                          </Box>
                        ))}
                      </VStack>
                    </Box>

                    {/* Slot Duration */}
                    <FormControl>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Slot Duration (minutes) *
                      </FormLabel>
                      <NumberInput
                        value={formData.slotDuration}
                        onChange={handleSlotDurationChange}
                        min={15}
                        max={120}
                        step={15}
                      >
                        <NumberInputField
                          borderRadius="lg"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: '#3AC0E7',
                            boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)',
                          }}
                          h="48px"
                          fontSize="md"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    {/* Break Times */}
                    <Box>
                      <HStack justify="space-between" mb={3}>
                        <FormLabel fontWeight="600" color="gray.700" mb={0}>
                          Break Times (Optional)
                        </FormLabel>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Icon as={MdAccessTime} />}
                          onClick={addBreakTime}
                          _hover={{
                            bg: "#2BA8D1",
                            color: "white",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(43, 168, 209, 0.3)"
                          }}
                        >
                          Add Break
                        </Button>
                      </HStack>

                      {formData.breakTimes.length === 0 ? (
                        <Text fontSize="sm" color="gray.500" fontStyle="italic">
                          No break times added. Click "Add Break" to add lunch breaks or other break periods.
                        </Text>
                      ) : (
                        <VStack spacing={3} align="stretch">
                          {formData.breakTimes.map((breakTime, index) => (
                            <HStack key={index} p={3} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                              <Text fontSize="sm" fontWeight="medium" minW="60px">
                                Break {index + 1}:
                              </Text>
                              <Input
                                type="time"
                                value={breakTime.start}
                                onChange={(e) => updateBreakTime(index, 'start', e.target.value)}
                                size="sm"
                                w="120px"
                              />
                              <Text fontSize="sm">to</Text>
                              <Input
                                type="time"
                                value={breakTime.end}
                                onChange={(e) => updateBreakTime(index, 'end', e.target.value)}
                                size="sm"
                                w="120px"
                              />
                              <CloseButton
                                size="sm"
                                onClick={() => removeBreakTime(index)}
                                color="red.500"
                                _hover={{ bg: "red.50" }}
                              />
                            </HStack>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  </VStack>
                </Box>

                {/* Action Buttons */}
                <HStack spacing={4} justify="flex-end" pt={4}>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    colorScheme="gray"
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="semibold"
                    borderRadius="lg"
                    _hover={{ 
                      bg: "#2BA8D1", 
                      color: "white",
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                    }}
                    transition="all 0.3s ease"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isUpdating}
                    loadingText="Updating..."
                    bg="#3AC0E7"
                    color="white"
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="semibold"
                    borderRadius="lg"
                    _hover={{
                      bg: "#2BA3D1",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(58, 192, 231, 0.4)",
                    }}
                    _active={{
                      bg: "#1E8BB8",
                      transform: "translateY(0)",
                    }}
                    transition="all 0.3s ease"
                  >
                    Update Branch
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

export default UpdateBranch;
