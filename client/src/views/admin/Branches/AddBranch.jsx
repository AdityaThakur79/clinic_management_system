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
  Checkbox,
  CheckboxGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  CloseButton,
} from '@chakra-ui/react';
import {
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdPerson,
  MdSchedule,
  MdAccessTime,
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
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        slotDuration: 30,
        breakTimes: []
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
