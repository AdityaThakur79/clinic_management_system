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
  Checkbox,
  CheckboxGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import {
  MdPerson,
  MdEmail,
  MdBusiness,
  MdPhone,
  MdArrowBack,
  MdPhoto,
  MdUpload,
  MdWork,
  MdSchool,
  MdAttachMoney,
  MdSchedule,
  MdLanguage,
  MdCalendarToday,
} from 'react-icons/md';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  useGetDoctorByIdMutation,
  useUpdateDoctorMutation,
} from '../../../features/api/doctor';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';

const UpdateDoctor = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const doctorId = location.state?.doctorId;
  
  // API hooks
  const [getDoctorById, { isLoading: isFetching }] = useGetDoctorByIdMutation();
  const [updateDoctor, { isLoading: isUpdating }] = useUpdateDoctorMutation();
  const { data: branchesData, isLoading: isBranchesLoading } = useGetAllBranchesQuery({});

  // State management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    degree: '',
    specialization: '',
    perSessionCharge: '',
    yearsOfExperience: '',
    consultationTime: '',
    bio: '',
    languages: [],
    availableDays: [],
    availableTimeSlots: {},
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [existingProfilePhoto, setExistingProfilePhoto] = useState('');
  const [existingBannerImage, setExistingBannerImage] = useState('');

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Language options
  const languageOptions = [
    "English", "Hindi","Marathi","Maithali", "Avadhai", "Bengali", "Telugu", "Tamil", "Gujarati", 
    "Kannada", "Malayalam", "Punjabi", "Odia", "Assamese", "Urdu"
  ];

  // Day options
  const dayOptions = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  // Fetch branches
  useEffect(() => {
    if (branchesData?.branches) {
      setBranches(branchesData.branches);
    }
  }, [branchesData]);


  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!doctorId) {
        return;
      }

      try {
        setIsLoading(true);
        setFetchError(null);

        const result = await getDoctorById({ id: doctorId }).unwrap();
        
        if (result.success && result.doctor) {
          const doctor = result.doctor;
          
          // Set form data
          setFormData({
            name: doctor.name || '',
            email: doctor.email || '',
            phone: doctor.phone || '',
            branch: doctor.branch?._id || '',
            degree: doctor.degree || '',
            specialization: doctor.specialization || '',
            perSessionCharge: doctor.perSessionCharge || '',
            yearsOfExperience: doctor.yearsOfExperience || '',
            consultationTime: doctor.consultationTime || '',
            bio: doctor.bio || '',
            languages: doctor.languages || [],
            availableDays: doctor.availableDays || [],
            availableTimeSlots: doctor.availableTimeSlots || {},
            status: doctor.status || 'active',
          });

          // Set existing images
          setExistingProfilePhoto(doctor.photoUrl || '');
          setExistingBannerImage(doctor.bannerUrl || '');

          // Set selected branch
          if (doctor.branch) {
            setSelectedBranch(doctor.branch);
          }
        } else {
          setFetchError('Doctor not found');
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setFetchError(error?.data?.message || 'Failed to fetch doctor details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId, getDoctorById]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle number input changes
  const handleNumberChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle branch selection
  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    const branch = branches.find((b) => b._id === branchId);
    
    setFormData((prev) => ({ ...prev, branch: branchId }));
    setSelectedBranch(branch);
    
    // Clear error when user selects a branch
    if (errors.branch) {
      setErrors((prev) => ({ ...prev, branch: '' }));
    }
  };

  // Handle language selection
  const handleLanguageChange = (values) => {
    setFormData((prev) => ({ ...prev, languages: values }));
    
    // Clear error when user selects languages
    if (errors.languages) {
      setErrors((prev) => ({ ...prev, languages: '' }));
    }
  };

  // Handle available days selection
  const handleAvailableDaysChange = (days) => {
    setFormData((prev) => {
      const newTimeSlots = { ...prev.availableTimeSlots };
      
      // Remove time slots for unselected days
      Object.keys(newTimeSlots).forEach(day => {
        if (!days.includes(day)) {
          delete newTimeSlots[day];
        }
      });
      
      // Add default time slots for newly selected days
      days.forEach(day => {
        if (!newTimeSlots[day]) {
          newTimeSlots[day] = { start: "09:00", end: "17:00" };
        }
      });
      
      return {
        ...prev,
        availableDays: days,
        availableTimeSlots: newTimeSlots,
      };
    });
    
    // Clear error when user selects days
    if (errors.availableDays) {
      setErrors((prev) => ({ ...prev, availableDays: '' }));
    }
  };

  // Handle time slot changes for specific days
  const handleTimeSlotChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availableTimeSlots: {
        ...prev.availableTimeSlots,
        [day]: {
          ...prev.availableTimeSlots[day],
          [field]: value,
        },
      },
    }));

    // Clear time slot error when user makes changes
    if (errors[`timeSlot_${day}`]) {
      setErrors((prev) => ({
        ...prev,
        [`timeSlot_${day}`]: "",
      }));
    }
  };

  // Handle file selection
  const handleFileSelect = (type, file) => {
    if (type === 'profilePhoto') {
      setProfilePhoto(file);
    } else if (type === 'bannerImage') {
      setBannerImage(file);
    }
  };

  // Validation function
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
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    }

    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.perSessionCharge || formData.perSessionCharge <= 0) {
      newErrors.perSessionCharge = 'Per session charge must be greater than 0';
    }

    if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Years of experience must be 0 or greater';
    }

    if (formData.consultationTime && formData.consultationTime <= 0) {
      newErrors.consultationTime = 'Consultation time must be greater than 0';
    }

    if (formData.languages.length === 0) {
      newErrors.languages = 'At least one language is required';
    }

    if (formData.availableDays.length === 0) {
      newErrors.availableDays = 'At least one available day is required';
    }

    // Validate time slots for selected days
    formData.availableDays.forEach((day) => {
      const timeSlot = formData.availableTimeSlots[day];
      if (!timeSlot || !timeSlot.start || !timeSlot.end) {
        newErrors[`timeSlot_${day}`] = `Time slot is required for ${day}`;
      } else if (timeSlot.start >= timeSlot.end) {
        newErrors[`timeSlot_${day}`] = `End time must be after start time for ${day}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();


    // Check if doctor ID exists
    if (!doctorId) {
      toast({
        title: 'Error',
        description: 'No doctor ID found. Please go back and try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === 'languages' || key === 'availableDays') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'availableTimeSlots') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add files if selected
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }
      if (bannerImage) {
        formDataToSend.append('bannerImage', bannerImage);
      }

      // Add the doctor ID to the form data
      formDataToSend.append('id', doctorId);
      
      const result = await updateDoctor(formDataToSend).unwrap();

      if (result.success) {
        toast({
          title: 'Doctor Updated Successfully',
          description: `Doctor ${formData.name} has been updated successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Navigate back to doctors list
        setTimeout(() => {
          navigate('/admin/doctors/all');
        }, 1000);
      } else {
        throw new Error(result.message || 'Failed to update doctor');
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      
      let errorMessage = 'Failed to update doctor. Please try again.';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Update Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Loading state
  if (isLoading || isFetching) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="#2BA8D1" />
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
            Loading doctor details...
          </Text>
          <Text fontSize="sm" color="gray.500">
            Please wait while we fetch the doctor information
          </Text>
        </VStack>
      </Center>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <Center h="400px">
        <Alert status="error" maxW="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Error loading doctor details</Text>
            <Text>{fetchError}</Text>
            <Button
              as={Link}
              to="/admin/doctors"
              leftIcon={<Icon as={MdArrowBack} />}
              size="sm"
            >
              Back to Doctors
            </Button>
          </VStack>
        </Alert>
      </Center>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <VStack spacing={6} align="stretch">
        <Card
          bg={cardBg}
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          _hover={{
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transform: "translateY(-2px)",
            transition: "all 0.3s ease",
          }}
        >
          <CardHeader pb={4}>
            <HStack justify="space-between">
              <HStack>
                <Icon as={MdPerson} w={7} h={7} color="#2BA8D1" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    Update Doctor Information
                  </Text>
                   
                </VStack>
              </HStack>
              
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
                      onChange={handleChange}
                      placeholder="Enter full name"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "#2BA8D1",
                        boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                      }}
                      _hover={{ borderColor: "gray.300" }}
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
                      onChange={handleChange}
                      placeholder="Enter email address"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "#2BA8D1",
                        boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                      }}
                      _hover={{ borderColor: "gray.300" }}
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
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "#2BA8D1",
                        boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                      }}
                      _hover={{ borderColor: "gray.300" }}
                      h="48px"
                      fontSize="md"
                    />
                    <FormErrorMessage>{errors.phone}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.branch}>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Branch *
                    </FormLabel>
                    <Select
                      name="branch"
                      value={formData.branch}
                      onChange={handleBranchChange}
                      placeholder={isBranchesLoading ? "Loading branches..." : "Select branch"}
                      isDisabled={isBranchesLoading}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "#2BA8D1",
                        boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                      }}
                      _hover={{ borderColor: "gray.300" }}
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
                </SimpleGrid>

                {/* Selected Branch Info */}
                {selectedBranch && (
                  <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
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

                {/* Professional Information */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdWork} w={5} h={5} color="#2BA8D1" />
                    <Text fontSize="md" fontWeight="semibold">
                      Professional Information
                    </Text>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isInvalid={errors.degree}>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Degree *
                      </FormLabel>
                      <Input
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        placeholder="e.g., MBBS, MD, MS"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "#2BA8D1",
                          boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                        }}
                        _hover={{ borderColor: "gray.300" }}
                        h="48px"
                        fontSize="md"
                      />
                      <FormErrorMessage>{errors.degree}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.specialization}>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Specialization *
                      </FormLabel>
                      <Input
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g., Cardiology, Neurology"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "#2BA8D1",
                          boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                        }}
                        _hover={{ borderColor: "gray.300" }}
                        h="48px"
                        fontSize="md"
                      />
                      <FormErrorMessage>{errors.specialization}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={6}>
                    <FormControl isInvalid={errors.perSessionCharge}>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Per Session Charge (₹) *
                      </FormLabel>
                      <NumberInput
                        value={formData.perSessionCharge}
                        onChange={(value) => handleNumberChange('perSessionCharge', value)}
                        min={0}
                      >
                        <NumberInputField
                          placeholder="Enter charge"
                          borderRadius="lg"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: "#2BA8D1",
                            boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                          }}
                          _hover={{ borderColor: "gray.300" }}
                          h="48px"
                          fontSize="md"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{errors.perSessionCharge}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.yearsOfExperience}>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Years of Experience *
                      </FormLabel>
                      <NumberInput
                        value={formData.yearsOfExperience}
                        onChange={(value) => handleNumberChange('yearsOfExperience', value)}
                        min={0}
                        max={50}
                      >
                        <NumberInputField
                          placeholder="Enter years"
                          borderRadius="lg"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: "#2BA8D1",
                            boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                          }}
                          _hover={{ borderColor: "gray.300" }}
                          h="48px"
                          fontSize="md"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{errors.yearsOfExperience}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Consultation Time (minutes)
                      </FormLabel>
                      <NumberInput
                        value={formData.consultationTime}
                        onChange={(value) => handleNumberChange('consultationTime', value)}
                        min={15}
                        max={120}
                      >
                        <NumberInputField
                          placeholder="30"
                          borderRadius="lg"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: "#2BA8D1",
                            boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                          }}
                          _hover={{ borderColor: "gray.300" }}
                          h="48px"
                          fontSize="md"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                </Box>

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
                      onChange={handleChange}
                      placeholder="Enter bio information"
                      rows={3}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "#2BA8D1",
                        boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                      }}
                      _hover={{ borderColor: "gray.300" }}
                      py={4}
                      fontSize="md"
                      resize="vertical"
                    />
                  </FormControl>
                </Box>

                {/* Languages Section */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdLanguage} w={5} h={5} color="#2BA8D1" />
                    <Text fontSize="md" fontWeight="semibold">
                      Languages Spoken
                    </Text>
                  </HStack>

                  <FormControl>
                    <FormLabel fontWeight="600" color="gray.700" mb={2}>
                      Select Languages
                    </FormLabel>
                    <CheckboxGroup
                      value={formData.languages}
                      onChange={handleLanguageChange}
                    >
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
                        {languageOptions.map((language) => (
                          <Checkbox key={language} value={language} colorScheme="blue">
                            {language}
                          </Checkbox>
                        ))}
                      </SimpleGrid>
                    </CheckboxGroup>
                  </FormControl>
                </Box>

                {/* Availability Section */}
                <Box>
                  <HStack mb={4}>
                    <Icon as={MdCalendarToday} w={5} h={5} color="#2BA8D1" />
                    <Text fontSize="md" fontWeight="semibold">
                      Availability
                    </Text>
                  </HStack>

                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Available Days
                      </FormLabel>
                      <CheckboxGroup
                        value={formData.availableDays}
                        onChange={handleAvailableDaysChange}
                      >
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                          {dayOptions.map((day) => (
                            <Checkbox key={day.value} value={day.value} colorScheme="blue">
                              {day.label}
                            </Checkbox>
                          ))}
                        </SimpleGrid>
                      </CheckboxGroup>
                    </FormControl>

                    {/* Per-day Time Slots */}
                    {formData.availableDays.length > 0 && (
                      <Box>
                        <Text fontWeight="600" color="gray.700" mb={4}>
                          Set Time Slots for Each Day
                        </Text>
                        <VStack spacing={4} align="stretch">
                          {formData.availableDays.map((day) => {
                            const timeSlot = formData.availableTimeSlots[day] || { start: "09:00", end: "17:00" };
                            
                            return (
                              <Box
                                key={day}
                                p={4}
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="lg"
                                bg="gray.50"
                              >
                                <HStack mb={3}>
                                  <Icon as={MdSchedule} w={4} h={4} color="#2BA8D1" />
                                  <Text fontWeight="semibold" color="gray.700" textTransform="capitalize">
                                    {day}
                                  </Text>
                                </HStack>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                  <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="500" color="gray.600">
                                      Start Time
                                    </FormLabel>
                                    <Input
                                      type="time"
                                      value={timeSlot.start}
                                      onChange={(e) => handleTimeSlotChange(day, "start", e.target.value)}
                                      borderRadius="lg"
                                      border="2px solid"
                                      borderColor="gray.200"
                                      _focus={{
                                        borderColor: "#2BA8D1",
                                        boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                                      }}
                                      _hover={{ borderColor: "gray.300" }}
                                      h="40px"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="500" color="gray.600">
                                      End Time
                                    </FormLabel>
                                    <Input
                                      type="time"
                                      value={timeSlot.end}
                                      onChange={(e) => handleTimeSlotChange(day, "end", e.target.value)}
                                      borderRadius="lg"
                                      border="2px solid"
                                      borderColor="gray.200"
                                      _focus={{
                                        borderColor: "#2BA8D1",
                                        boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                                      }}
                                      _hover={{ borderColor: "gray.300" }}
                                      h="40px"
                                    />
                                  </FormControl>
                                </SimpleGrid>
                                {errors[`timeSlot_${day}`] && (
                                  <Text color="red.500" fontSize="sm" mt={2}>
                                    {errors[`timeSlot_${day}`]}
                                  </Text>
                                )}
                              </Box>
                            );
                          })}
                        </VStack>
                      </Box>
                    )}

                    {formData.availableDays.length === 0 && (
                      <Box
                        p={6}
                        textAlign="center"
                        border="2px dashed"
                        borderColor="gray.300"
                        borderRadius="lg"
                        bg="gray.50"
                      >
                        <Icon as={MdCalendarToday} w={8} h={8} color="gray.400" mb={2} />
                        <Text color="gray.500" fontSize="sm">
                          Select available days to set time slots
                        </Text>
                      </Box>
                    )}
                  </VStack>
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
      {existingProfilePhoto && (
        <Box mb={2}>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Current Profile Photo:
          </Text>
          <img
            src={existingProfilePhoto}
            alt="Current profile"
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Box>
      )}
      <Box position="relative">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect('profilePhoto', e.target.files[0])}
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
            borderColor: "#2BA8D1",
            bg: "blue.50"
          }}
          _focus={{
            borderColor: "#2BA8D1",
            boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
          }}
          cursor="pointer"
          minH="50px"
        >
          <HStack>
            <Icon as={MdUpload} color="#2BA8D1" />
            <Text fontSize="sm" color="gray.600">
              {profilePhoto ? profilePhoto.name : "Choose profile photo"}
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
      {existingBannerImage && (
        <Box mb={2}>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Current Banner Image:
          </Text>
          <img
            src={existingBannerImage}
            alt="Current banner"
            style={{
              width: '200px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Box>
      )}
      <Box position="relative">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect('bannerImage', e.target.files[0])}
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
            borderColor: "#2BA8D1",
            bg: "blue.50"
          }}
          _focus={{
            borderColor: "#2BA8D1",
            boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
          }}
          cursor="pointer"
          minH="50px"
        >
          <HStack>
            <Icon as={MdUpload} color="#2BA8D1" />
            <Text fontSize="sm" color="gray.600">
              {bannerImage ? bannerImage.name : "Choose banner image"}
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
                    onChange={handleChange}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "#2BA8D1",
                      boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                    }}
                    _hover={{ borderColor: "gray.300" }}
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
                    as={Link}
                    to="/admin/doctors/all"
                    variant="outline"
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    isDisabled={isUpdating}
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
                    _hover={{ bg: "#0C2F4D" }}
                    isLoading={isUpdating}
                    loadingText="Updating Doctor..."
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    minW="180px"
                    isDisabled={!doctorId || isUpdating}
                    leftIcon={isUpdating ? <Spinner size="sm" /> : undefined}
                  >
                    {isUpdating ? 'Updating Doctor...' : 'Update Doctor'}
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

export default UpdateDoctor;