  import React, { useState, useEffect } from "react";
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
  } from "@chakra-ui/react";
  import {
    MdPerson,
    MdEmail,
    MdBusiness,
    MdPhone,
    MdPhoto,
    MdWork,
    MdSchool,
    MdAttachMoney,
    MdSchedule,
    MdLanguage,
    MdCalendarToday,
  } from "react-icons/md";
  import { useGetAllBranchesQuery, useGetBranchByIdMutation } from "../../../features/api/branchApi";
  import { useCreateDoctorMutation } from "../../../features/api/doctor";
  import { useNavigate } from 'react-router-dom';
  import { useSelector } from 'react-redux';
  import { skipToken } from '@reduxjs/toolkit/query';

  const AddDoctor = () => {
    const user = useSelector((s) => s.auth.user);
    const userBranchId = user?.branch?._id || user?.branch || '';
    const isScopedToBranch = !!userBranchId && (user?.role === 'branchAdmin' || user?.role === 'doctor');
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      phone: "",
      branch: "",
      degree: "",
      specialization: "",
      perSessionCharge: "",
      yearsOfExperience: "",
      consultationTime: 30,
      bio: "",
      languages: [],
      availableDays: [],
      availableTimeSlots: {}, // Will store per-day time slots
      status: "active",
    });

    const [errors, setErrors] = useState({});
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);

    const toast = useToast();
    const [createDoctor, { isLoading: isSubmitting }] = useCreateDoctorMutation();
    const navigate = useNavigate();

    const { data: branchesData, isLoading: branchesLoading } = useGetAllBranchesQuery(
      isScopedToBranch ? skipToken : { page: 1, limit: 100, search: "" }
    );
    const [getBranchById] = useGetBranchByIdMutation();

    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    useEffect(() => {
      const init = async () => {
        if (isScopedToBranch) {
          setFormData(prev => ({ ...prev, branch: userBranchId }));
          try {
            const res = await getBranchById({ id: userBranchId }).unwrap();
            if (res?.branch) setSelectedBranch(res.branch);
          } catch (e) {
            // ignore; still allow submission with id
          }
        } else if (branchesData?.branches) {
          setBranches(branchesData.branches);
        }
      };
      init();
    }, [branchesData, isScopedToBranch, userBranchId, getBranchById]);

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
          [name]: "",
        }));
      }
    };

    const handleNumberChange = (value, field) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    };

    const handleBranchChange = (e) => {
      const branchId = e.target.value;
      setFormData((prev) => ({
        ...prev,
        branch: branchId,
      }));

      const branch = branches.find(b => b._id === branchId);
      setSelectedBranch(branch);
    };

    const handleLanguageChange = (languages) => {
      setFormData((prev) => ({
        ...prev,
        languages,
      }));
    };

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
    };

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

    const handleFileChange = (e, type) => {
      const file = e.target.files[0];
      if (file) {
        if (type === "profile") {
          setProfilePhoto(file);
        } else {
          setBannerImage(file);
        }
      }
    };

    const validateForm = () => {
      const newErrors = {};

      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!formData.password.trim()) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
        newErrors.phone = "Phone number must be 10 digits";
      }

      if (!formData.branch) {
        newErrors.branch = "Branch is required";
      }

      if (!formData.degree.trim()) {
        newErrors.degree = "Degree is required";
      }

      if (!formData.specialization.trim()) {
        newErrors.specialization = "Specialization is required";
      }

      if (!formData.perSessionCharge || formData.perSessionCharge <= 0) {
        newErrors.perSessionCharge = "Per session charge is required and must be greater than 0";
      }

      if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
        newErrors.yearsOfExperience = "Years of experience is required and must be 0 or greater";
      }

      // Validate time slots for each selected day
      formData.availableDays.forEach(day => {
        const timeSlot = formData.availableTimeSlots[day];
        if (timeSlot) {
          const startTime = new Date(`2000-01-01T${timeSlot.start}`);
          const endTime = new Date(`2000-01-01T${timeSlot.end}`);
          
          if (startTime >= endTime) {
            newErrors[`timeSlot_${day}`] = "End time must be after start time";
          }
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields correctly.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("branch", formData.branch);
        formDataToSend.append("degree", formData.degree);
        formDataToSend.append("specialization", formData.specialization);
        formDataToSend.append("perSessionCharge", formData.perSessionCharge);
        formDataToSend.append("yearsOfExperience", formData.yearsOfExperience);
        formDataToSend.append("consultationTime", formData.consultationTime);
        formDataToSend.append("bio", formData.bio);
        formDataToSend.append("languages", JSON.stringify(formData.languages));
        formDataToSend.append("availableDays", JSON.stringify(formData.availableDays));
        formDataToSend.append("availableTimeSlots", JSON.stringify(formData.availableTimeSlots));
        formDataToSend.append("status", formData.status);

        if (profilePhoto) {
          formDataToSend.append("profilePhoto", profilePhoto);
        }
        if (bannerImage) {
          formDataToSend.append("bannerImage", bannerImage);
        }

        const result = await createDoctor(formDataToSend).unwrap();

        toast({
          title: "Doctor Added Successfully",
          description: result.message || `${formData.name} has been added as Doctor.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          branch: "",
          degree: "",
          specialization: "",
          perSessionCharge: "",
          yearsOfExperience: "",
          consultationTime: 30,
          bio: "",
          languages: [],
          availableDays: [],
          availableTimeSlots: {},
          status: "active",
        });
        setErrors({});
        setSelectedBranch(null);
        setProfilePhoto(null);
        setBannerImage(null);

        setTimeout(() => {
          navigate('/admin/doctors/all');
        }, 1000);
      } catch (error) {
        console.error("Error creating doctor:", error);
        toast({
          title: "Error",
          description: error?.data?.message || "Failed to add doctor. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const languageOptions = [
      "English", "Hindi","Marathi","Maithali", "Avadhai", "Bengali", "Telugu", "Tamil", "Gujarati", 
      "Kannada", "Malayalam", "Punjabi", "Odia", "Assamese", "Urdu"
    ];

    const dayOptions = [
      { value: "monday", label: "Monday" },
      { value: "tuesday", label: "Tuesday" },
      { value: "wednesday", label: "Wednesday" },
      { value: "thursday", label: "Thursday" },
      { value: "friday", label: "Friday" },
      { value: "saturday", label: "Saturday" },
      { value: "sunday", label: "Sunday" },
    ];

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
              <HStack>
                <Icon as={MdPerson} w={7} h={7} color="#2BA8D1" />
                <Text fontSize="xl" fontWeight="bold" color="gray.700">
                  Doctor Information
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
                        onChange={handleInputChange}
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
                          borderColor: "#2BA8D1",
                          boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                        }}
                        _hover={{ borderColor: "gray.300" }}
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
                          borderColor: "#2BA8D1",
                          boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                        }}
                        _hover={{ borderColor: "gray.300" }}
                        h="48px"
                        fontSize="md"
                      />
                      <FormErrorMessage>{errors.phone}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>

                  {isScopedToBranch ? (
                    <FormControl>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Branch
                      </FormLabel>
                      <Input value={selectedBranch?.branchName || user?.branch?.branchName || 'Current Branch'} isReadOnly placeholder="Branch" />
                    </FormControl>
                  ) : (
                    <FormControl isInvalid={errors.branch}>
                      <FormLabel fontWeight="600" color="gray.700" mb={2}>
                        Branch *
                      </FormLabel>
                      <Select
                        name="branch"
                        value={formData.branch}
                        onChange={handleBranchChange}
                        placeholder={branchesLoading ? "Loading branches..." : "Select branch"}
                        isDisabled={branchesLoading}
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
                  )}

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
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
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
                          onChange={(value) => handleNumberChange(value, "perSessionCharge")}
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
                          onChange={(value) => handleNumberChange(value, "yearsOfExperience")}
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
                          onChange={(value) => handleNumberChange(value, "consultationTime")}
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
                        onChange={handleInputChange}
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
                              const dayLabel = dayOptions.find(d => d.value === day)?.label;
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
                                    <Text fontWeight="semibold" color="gray.700">
                                      {dayLabel}
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
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "profile")}
                          borderRadius="lg"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: "#2BA8D1",
                            boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                          }}
                          py={2}
                        />
                        {profilePhoto && (
                          <Text fontSize="sm" color="green.600" mt={1}>
                            Selected: {profilePhoto.name}
        </Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Banner Image</FormLabel>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "banner")}
                          borderRadius="lg"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: "#2BA8D1",
                            boxShadow: "0 0 0 3px rgba(43, 168, 209, 0.1)",
                          }}
                          py={2}
                        />
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
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          name: "",
                          email: "",
                          password: "",
                          phone: "",
                          branch: "",
                          degree: "",
                          specialization: "",
                          perSessionCharge: "",
                          yearsOfExperience: "",
                          consultationTime: 30,
                          bio: "",
                          languages: [],
                          availableDays: [],
                          availableTimeSlots: {},
                          status: "active",
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
                      _hover={{ bg: "#0C2F4D" }}
                      isLoading={isSubmitting}
                      loadingText="Adding Doctor..."
                      size="lg"
                      px={8}
                      py={6}
                      fontSize="md"
                      fontWeight="600"
                      minW="180px"
                    >
                      Add Doctor
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

  export default AddDoctor;
