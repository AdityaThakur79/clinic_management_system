import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Image,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  useColorModeValue,
  Divider,
  List,
  ListItem,
  ListIcon,
  Badge,
  Icon,
  Card,
  CardBody,
  Grid,
  Collapse,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@chakra-ui/react';
import { 
  CheckIcon, 
  TimeIcon, 
  InfoIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  StarIcon,
  ArrowBackIcon
} from '@chakra-ui/icons';
import { useCreateAppointmentMutation } from '../../../features/api/appointments';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useGetAvailabilityQuery } from '../../../features/api/appointments';
import { servicesData } from '../../../data/servicesData';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import CTA from '../Components/CTA';

const ServiceBookingPage = () => {
  const { serviceSlug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: showDetails, onToggle: toggleDetails } = useDisclosure();

  // Find the service by slug
  const service = servicesData.find(s => s.slug === serviceSlug);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'prefer_not_to_say',
    address: '',
    notes: '',
  });

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDateISO, setSelectedDateISO] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedBranchName, setSelectedBranchName] = useState('');

  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100 });

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerSubColor = useColorModeValue('gray.500', 'gray.400');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  // Use selected branch or default to first available branch
  const branchId = selectedBranchId || branchesData?.branches?.[0]?._id || '';
  const branchName = selectedBranchName || branchesData?.branches?.[0]?.branchName || '';

  // Get availability for selected date
  const { data: availabilityData, refetch: refetchAvailability } = useGetAvailabilityQuery(
    {
      branchId: branchId,
      date: selectedDateISO,
    },
    {
      skip: !branchId || !selectedDateISO,
    }
  );

  // Days of week
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Handle branch selection
  const handleBranchSelection = (branch) => {
    setSelectedBranchId(branch._id);
    setSelectedBranchName(branch.branchName);
    setSelectedDateIndex(0);
    setSelectedTime('');
    setSelectedDateISO('');
    setAvailableSlots([]);
  };

  // Generate time slots for the next 7 days based on branch availability
  const generateTimeSlots = async () => {
    if (!branchId) return;
    
    const slots = [];
    const today = new Date();

    console.log('Generating slots for branch:', branchId);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      const dateISO = `${y}-${m}-${d}`;

      try {
        // Fetch availability for this specific date from backend
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/appointments/availability?branchId=${branchId}&date=${dateISO}`
        );
        const data = await response.json();

        console.log(`Availability for ${dateISO}:`, data);

        if (data.success && data.availableSlots && data.availableSlots.length > 0) {
          const daySlots = data.availableSlots.map(slot => ({
            datetime: new Date(currentDate),
            time: slot.time,
            date: dateISO,
            isAvailable: slot.isAvailable,
            isBooked: slot.isBooked
          }));
          slots.push(daySlots);
        } else {
          // If branch is closed or no slots available, add empty array
          console.log(`No slots available for ${dateISO}:`, data.message || 'No slots');
          slots.push([]);
        }
      } catch (error) {
        console.error('Error fetching availability for', dateISO, error);
        slots.push([]);
      }
    }

    console.log('Final slots array:', slots);
    setAvailableSlots(slots);

    // If no date selected yet, initialize selectedDateISO to first available day
    try {
      if (!selectedDateISO) {
        const firstDayWithSlots = slots.find(dayArr => dayArr.length > 0);
        if (firstDayWithSlots && firstDayWithSlots[0]?.datetime) {
          const first = firstDayWithSlots[0].datetime;
          const initISO = `${first.getFullYear()}-${String(first.getMonth()+1).padStart(2,'0')}-${String(first.getDate()).padStart(2,'0')}`;
          setSelectedDateISO(initISO);
        }
      }
    } catch (_) {}
  };

  // Handle date selection
  const handleDateSelection = (index) => {
    const selectedSlot = availableSlots[index]?.[0];
    if (selectedSlot) {
      setSelectedDateISO(selectedSlot.datetime.toISOString().split('T')[0]);
      setSelectedDateIndex(index);
      setSelectedTime(''); // Reset selected time when changing date
      // Refetch availability for the new date
      refetchAvailability();
    }
  };

  // Regenerate slots when branch changes
  useEffect(() => {
    if (branchId) {
      console.log('Branch changed, regenerating slots for:', branchId);
      generateTimeSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  // Set default branch when branches data loads
  useEffect(() => {
    if (branchesData?.branches?.length > 0 && !selectedBranchId) {
      const firstBranch = branchesData.branches[0];
      setSelectedBranchId(firstBranch._id);
      setSelectedBranchName(firstBranch.branchName);
    }
  }, [branchesData, selectedBranchId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: 'Required fields missing',
        description: 'Name and phone number are required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: 'Please select a time slot',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const appointmentData = {
        branchId,
        service: service.title,
        date: selectedDateISO,
        timeSlot: selectedTime,
        serviceDuration: service.duration || 30,
        notes: formData.notes,
        patient: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
          address: formData.address,
        },
      };

      const result = await createAppointment(appointmentData).unwrap();
      
      toast({
        title: 'Appointment Booked!',
        description: `Your appointment for ${service.title} has been scheduled for ${selectedDateISO} at ${selectedTime}. A doctor will be assigned to your appointment.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate back to services or home
      navigate('/services');
    } catch (error) {
      console.error('Booking error:', error);
      
      // Handle specific conflict error
      if (error?.data?.message?.includes('no longer available')) {
        toast({
          title: 'Time Slot Unavailable',
          description: 'This time slot was just booked by someone else. Please select another time.',
          status: 'warning',
          duration: 6000,
          isClosable: true,
        });
        
        // Refresh availability
        refetchAvailability();
        setSelectedTime('');
      } else {
        toast({
          title: 'Booking Failed',
          description: error?.data?.message || 'Something went wrong. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  if (!service) {
    return (
      <>
        <Navbar />
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
          <Container maxW="6xl" py={20}>
            <VStack spacing={6} textAlign="center">
              <Heading color="red.500">Service Not Found</Heading>
              <Text color="gray.600">The service you're looking for doesn't exist.</Text>
              <Button onClick={() => navigate('/services')} colorScheme="blue">
                Back to Services
              </Button>
            </VStack>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box pt={{ base: '10px', md: '20px', xl: '20px' }} w="full" maxW="100vw" overflowX="hidden">
        <Container maxW="7xl" py={{ base: 4, md: 6, lg: 8 }} px={{ base: 3, md: 4, lg: 6 }} w="full">
          {/* Breadcrumb */}
          <Breadcrumb mb={{ base: 4, md: 6 }} fontSize={{ base: "xs", md: "sm" }}>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/')} color="blue.500" fontSize={{ base: "xs", md: "sm" }}>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/services')} color="blue.500" fontSize={{ base: "xs", md: "sm" }}>
                Services
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem isCurrentPage>
              <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                {service.title}
              </Text>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Back Button */}
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate('/services')}
            mb={{ base: 4, md: 6 }}
            color="blue.500"
            size={{ base: "sm", md: "md" }}
            fontSize={{ base: "xs", md: "sm" }}
            _hover={{ bg: 'blue.50' }}
          >
            Back to Services
          </Button>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 3, md: 4, lg: 6 }} w="full" maxW="100%">
            {/* Service Details */}
            <VStack spacing={{ base: 4, md: 6 }} align="stretch" order={{ base: 1, lg: 1 }} w="full" maxW="100%">
              <Card 
                _hover={{ 
                  transform: "translateY(-2px)", 
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease"
                }}
                transition="all 0.3s ease"
              >
                <CardBody p={{ base: 3, md: 4, lg: 6 }}>
                  <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                    <HStack 
                      spacing={{ base: 2, md: 3 }} 
                      flexDirection={{ base: "row", sm: "row" }} 
                      align={{ base: "start", sm: "start" }}
                      w="full"
                    >
                      <Image 
                        src={service.image} 
                        alt={service.title} 
                        w={{ base: "50px", sm: "70px", md: "80px" }} 
                        h={{ base: "50px", sm: "70px", md: "80px" }} 
                        objectFit="cover" 
                        rounded="lg" 
                        flexShrink={0}
                      />
                      <VStack 
                        align={{ base: "start", sm: "start" }} 
                        spacing={{ base: 1, md: 2 }} 
                        textAlign={{ base: "left", sm: "left" }}
                        flex={1}
                        minW={0}
                      >
                        <Heading 
                          size={{ base: "sm", sm: "md", md: "lg" }} 
                          color="brand.600"
                          lineHeight="1.2"
                          noOfLines={2}
                          wordBreak="break-word"
                        >
                          {service.title}
                        </Heading>
                        <Badge 
                          colorScheme="blue" 
                          variant="outline" 
                          fontSize={{ base: "2xs", md: "sm" }}
                          px={1}
                          py={0.5}
                        >
                          {service.category}
                        </Badge>
                      </VStack>
                    </HStack>

                    <VStack spacing={3} align="stretch" w="full">
                      <HStack justify="space-between" align="center" w="full">
                        <Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }}>Price:</Text>
                        <Badge 
                          colorScheme="green" 
                          fontSize={{ base: "xs", md: "sm" }} 
                          px={{ base: 2, md: 3 }} 
                          py={1}
                        >
                          ₹{service.detailedContent?.cost || service.price || 'TBD'}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between" align="center" w="full">
                        <Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }}>Duration:</Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">{service.duration || 30} min</Text>
                      </HStack>
                    </VStack>

                    <Divider />

                    <Box>
                      <Text fontWeight="medium" mb={2} fontSize={{ base: "sm", md: "md" }}>Description:</Text>
                      <Text 
                        fontSize={{ base: "xs", md: "sm" }} 
                        color="gray.600" 
                        lineHeight="1.6"
                        noOfLines={{ base: 3, md: "none" }}
                      >
                        {service.description}
                      </Text>
                    </Box>

                    {/* Service Details Toggle */}
                    <Button
                      variant="ghost"
                      size={{ base: "xs", md: "sm" }}
                      rightIcon={showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      onClick={toggleDetails}
                      color="brand.500"
                      fontSize={{ base: "xs", md: "sm" }}
                      py={{ base: 1, md: 2 }}
                    >
                      {showDetails ? 'Hide' : 'Show'} Details
                    </Button>

                    <Collapse in={showDetails}>
                      <Box mt={4}>
                        {service.detailedContent?.benefits && (
                          <Box mb={4}>
                            <Text fontWeight="medium" mb={2} color="green.600" fontSize={{ base: "xs", md: "sm" }}>
                              <Icon as={CheckIcon} mr={1} boxSize={{ base: 3, md: 4 }} />
                              Key Benefits:
                            </Text>
                            <List spacing={1}>
                              {service.detailedContent.benefits.slice(0, 4).map((benefit, index) => (
                                <ListItem key={index} fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                                  <ListIcon as={CheckIcon} color="green.500" boxSize={{ base: 3, md: 4 }} />
                                  {benefit}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {service.detailedContent?.whatToExpect && (
                          <Box mb={4}>
                            <Text fontWeight="medium" mb={2} color="blue.600" fontSize={{ base: "xs", md: "sm" }}>
                              <Icon as={InfoIcon} mr={1} boxSize={{ base: 3, md: 4 }} />
                              What to Expect:
                            </Text>
                            <List spacing={1}>
                              {service.detailedContent.whatToExpect.slice(0, 3).map((item, index) => (
                                <ListItem key={index} fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                                  <ListIcon as={CheckIcon} color="blue.500" boxSize={{ base: 3, md: 4 }} />
                                  {item}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {service.detailedContent?.preparation && (
                          <Box>
                            <Text fontWeight="medium" mb={2} color="orange.600" fontSize={{ base: "xs", md: "sm" }}>
                              <Icon as={TimeIcon} mr={1} boxSize={{ base: 3, md: 4 }} />
                              Preparation:
                            </Text>
                            <List spacing={1}>
                              {service.detailedContent.preparation.slice(0, 3).map((item, index) => (
                                <ListItem key={index} fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                                  <ListIcon as={CheckIcon} color="orange.500" boxSize={{ base: 3, md: 4 }} />
                                  {item}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>

            {/* Booking Form */}
            <VStack spacing={{ base: 4, md: 6 }} align="stretch" order={{ base: 2, lg: 2 }} w="full" maxW="100%">
              <form onSubmit={handleSubmit}>
                <VStack spacing={{ base: 4, md: 6 }} align="stretch" w="full" maxW="100%">
                  {/* Branch Selection */}
                  <Card 
                    _hover={{ 
                      transform: "translateY(-1px)", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease"
                    }}
                    transition="all 0.3s ease"
                  >
                    <CardBody p={{ base: 3, md: 4, lg: 6 }}>
                      <Text fontWeight="semibold" color="gray.800" mb={3} fontSize={{ base: "sm", md: "md" }}>
                        Select Branch
                      </Text>
                      <FormControl>
                        <Select
                          value={selectedBranchId}
                          onChange={(e) => {
                            const branch = branchesData?.branches?.find(b => b._id === e.target.value);
                            if (branch) {
                              handleBranchSelection(branch);
                            }
                          }}
                          size={{ base: "sm", md: "md" }}
                          borderColor={borderColor}
                          _focus={{
                            borderColor: '#3AC0E7',
                            boxShadow: '0 0 0 3px rgba(58, 192, 231, 0.1)',
                          }}
                        >
                          <option value="">Select a branch</option>
                          {branchesData?.branches?.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                              {branch.branchName}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </CardBody>
                  </Card>

                  {/* Date Selection */}
                  <Card 
                    _hover={{ 
                      transform: "translateY(-1px)", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease"
                    }}
                    transition="all 0.3s ease"
                  >
                    <CardBody p={{ base: 3, md: 4, lg: 6 }}>
                      <Text fontWeight="semibold" color="gray.800" mb={3} fontSize={{ base: "sm", md: "md" }}>
                        Select Date
                      </Text>
                      {!selectedBranchId ? (
                        <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }} textAlign="center" py={4}>
                          Please select a branch first to view available dates and times
                        </Text>
                      ) : (
                        <Box w="full" overflow="hidden">
                          <HStack spacing={{ base: 1, md: 2 }} wrap="wrap" justify="flex-start" w="full">
                            {availableSlots.map((daySlots, index) => {
                              const hasAvailableSlots = daySlots.length > 0;
                              const isSelected = selectedDateIndex === index;
                              
                              return (
                                <Button
                                  key={index}
                                  onClick={() => {
                                    if (hasAvailableSlots) {
                                      handleDateSelection(index);
                                    }
                                  }}
                                  variant={isSelected ? "solid" : "outline"}
                                  colorScheme={isSelected ? "brand" : hasAvailableSlots ? "gray" : "red"}
                                  minW={{ base: "45px", sm: "55px", md: "65px" }}
                                  h={{ base: "45px", sm: "55px", md: "65px" }}
                                  flexDirection="column"
                                  rounded="full"
                                  isDisabled={!hasAvailableSlots}
                                  opacity={hasAvailableSlots ? 1 : 0.4}
                                  size={{ base: "xs", sm: "sm" }}
                                  mb={{ base: 1, md: 0 }}
                                  _hover={{
                                    transform: hasAvailableSlots ? "scale(1.05)" : "none",
                                    transition: "all 0.2s ease"
                                  }}
                                >
                                  <Text fontSize={{ base: "2xs", sm: "xs" }} fontWeight="bold">
                                    {daySlots[0] && daysOfWeek[daySlots[0].datetime.getDay()]}
                                  </Text>
                                  <Text fontSize={{ base: "xs", sm: "sm", md: "md" }} fontWeight="bold">
                                    {daySlots[0] && daySlots[0].datetime.getDate()}
                                  </Text>
                                  {!hasAvailableSlots && (
                                    <Text fontSize={{ base: "2xs", sm: "xs" }} color="red.500">
                                      Unavailable
                                    </Text>
                                  )}
                                </Button>
                              );
                            })}
                          </HStack>
                        </Box>
                      )}
                    </CardBody>
                  </Card>

                  {/* Time Selection */}
                  <Card 
                    _hover={{ 
                      transform: "translateY(-1px)", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease"
                    }}
                    transition="all 0.3s ease"
                  >
                    <CardBody p={{ base: 3, md: 4, lg: 6 }}>
                      <Text fontWeight="semibold" color="gray.800" mb={3} fontSize={{ base: "sm", md: "md" }}>
                        Select Time
                      </Text>
                      {!selectedBranchId ? (
                        <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }} textAlign="center" py={4}>
                          Please select a branch first to view available time slots
                        </Text>
                      ) : (
                        <>
                          <Box w="full" overflow="hidden">
                            <HStack spacing={{ base: 1, md: 1 }} wrap="wrap" justify="flex-start" w="full">
                              {availableSlots[selectedDateIndex]?.map((slot, index) => {
                                const isBooked = slot.isBooked || !slot.isAvailable;
                                return (
                                  <Button
                                    key={index}
                                    onClick={() => slot.isAvailable && setSelectedTime(slot.time)}
                                    variant={selectedTime === slot.time ? "solid" : "outline"}
                                    colorScheme={
                                      selectedTime === slot.time 
                                        ? "blue" 
                                        : isBooked
                                          ? "red" 
                                          : "gray"
                                    }
                                    size={{ base: "xs", sm: "sm" }}
                                    px={{ base: 1, md: 2 }}
                                    py={{ base: 1, md: 1 }}
                                    rounded="full"
                                    isDisabled={isBooked}
                                    opacity={isBooked ? 0.6 : 1}
                                    bg={isBooked ? "red.100" : undefined}
                                    color={isBooked ? "red.600" : undefined}
                                    borderColor={isBooked ? "red.300" : undefined}
                                    fontSize={{ base: "2xs", md: "sm" }}
                                    mb={{ base: 1, md: 0 }}
                                    minW={{ base: "40px", md: "50px" }}
                                    maxW={{ base: "60px", md: "80px" }}
                                    h={{ base: "28px", md: "32px" }}
                                    _hover={{
                                      transform: !isBooked ? "scale(1.05)" : "none",
                                      transition: "all 0.2s ease"
                                    }}
                                  >
                                    {isBooked ? `${slot.time} (Booked)` : slot.time}
                                  </Button>
                                );
                              })}
                            </HStack>
                          </Box>
                          {availableSlots[selectedDateIndex]?.length === 0 && (
                            <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }} mt={2}>
                              No available time slots for this day
                            </Text>
                          )}
                        </>
                      )}
                    </CardBody>
                  </Card>

                  {/* Patient Information */}
                  <Card 
                    _hover={{ 
                      transform: "translateY(-1px)", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease"
                    }}
                    transition="all 0.3s ease"
                  >
                    <CardBody p={{ base: 3, md: 4, lg: 6 }}>
                      <Text fontWeight="semibold" color="gray.800" mb={3} fontSize={{ base: "sm", md: "md" }}>
                        Patient Information
                      </Text>

                      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={{ base: 2, md: 3 }} w="full">
                          <FormControl isRequired>
                            <FormLabel fontSize={{ base: "xs", md: "sm" }}>Full Name</FormLabel>
                            <Input
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Enter full name"
                              size={{ base: "sm", md: "md" }}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize={{ base: "xs", md: "sm" }}>Age</FormLabel>
                            <Input
                              type="number"
                              value={formData.age}
                              onChange={(e) => handleInputChange('age', e.target.value)}
                              placeholder="Age"
                              size={{ base: "sm", md: "md" }}
                              min="0"
                              max="120"
                            />
                          </FormControl>
                        </Grid>

                        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={{ base: 2, md: 3 }} w="full">
                          <FormControl isRequired>
                            <FormLabel fontSize={{ base: "xs", md: "sm" }}>Phone Number</FormLabel>
                            <Input
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="Enter phone number"
                              size={{ base: "sm", md: "md" }}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize={{ base: "xs", md: "sm" }}>Email</FormLabel>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="Enter email (optional)"
                              size={{ base: "sm", md: "md" }}
                            />
                          </FormControl>
                        </Grid>

                        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={{ base: 2, md: 3 }} w="full">
                          <FormControl>
                            <FormLabel fontSize={{ base: "xs", md: "sm" }}>Gender</FormLabel>
                            <Select
                              value={formData.gender}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              size={{ base: "sm", md: "md" }}
                            >
                              <option value="prefer_not_to_say">Prefer not to say</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize={{ base: "xs", md: "sm" }}>Address</FormLabel>
                            <Input
                              value={formData.address}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              placeholder="Enter address (optional)"
                              size={{ base: "sm", md: "md" }}
                            />
                          </FormControl>
                        </Grid>

                        <FormControl>
                          <FormLabel fontSize={{ base: "xs", md: "sm" }}>Notes</FormLabel>
                          <Textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Any additional notes or symptoms (optional)"
                            size={{ base: "sm", md: "md" }}
                            rows={{ base: 2, md: 3 }}
                          />
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    colorScheme="brand"
                    size={{ base: "md", md: "lg" }}
                    isLoading={isLoading}
                    loadingText="Booking Appointment..."
                    isDisabled={!selectedTime}
                    py={{ base: 4, md: 6 }}
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="semibold"
                    w="full"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(43, 168, 209, 0.3)",
                      transition: "all 0.3s ease"
                    }}
                    transition="all 0.3s ease"
                  >
                    Book Appointment
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Grid>
        </Container>
      </Box>
      <CTA />
      <Footer />
    </>
  );
};

export default ServiceBookingPage;
