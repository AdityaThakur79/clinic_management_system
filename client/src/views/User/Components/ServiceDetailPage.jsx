import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  Image,
  Badge,
  Button,
  Flex,
  VStack,
  HStack,
  Container,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Icon,
  useColorModeValue,
  Grid,
  Card,
  CardBody,
  useToast,
  Divider,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { 
  CheckIcon,
  InfoIcon,
  TimeIcon,
  StarIcon,
  ArrowBackIcon
} from '@chakra-ui/icons';
import { useGetAvailabilityQuery } from '../../../features/api/appointments';
import AppointmentFormModal from '../../../components/modals/AppointmentFormModal';
import Navbar from './Navbar';
import Footer from './Footer';
import CTA from './CTA';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDateISO, setSelectedDateISO] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Get availability for selected date
  const branchIdForQuery = service?.branchId || '64f8b8e1a1b2c3d4e5f6g7h8'; // Default branch ID - should be dynamic
  const { data: availabilityData, refetch: refetchAvailability } = useGetAvailabilityQuery(
    {
      branchId: branchIdForQuery,
      date: selectedDateISO,
    },
    {
      skip: !branchIdForQuery || !selectedDateISO,
    }
  );

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Days of week
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Mock service data - replace with actual API call
  const mockService = {
    id: id,
    name: "Hearing Tests (Audiometry - PTA)",
    description: "Comprehensive hearing assessments using audiometry (PTA) to accurately diagnose hearing conditions in all age groups.",
    image: "/api/placeholder/300/400",
    category: "Diagnostics",
    price: 500,
    duration: 45,
    benefits: [
      "Accurate hearing loss diagnosis",
      "Frequency-specific hearing assessment",
      "Air and bone conduction testing",
      "Speech audiometry evaluation",
      "Tympanometry for middle ear assessment",
      "Detailed hearing profile creation"
    ],
    process: [
      "Case history and symptom discussion",
      "Visual inspection of ear canal and eardrum",
      "Pure tone audiometry (air conduction)",
      "Bone conduction testing",
      "Speech audiometry and word recognition",
      "Tympanometry and acoustic reflex testing",
      "Results interpretation and counseling"
    ],
    preparation: [
      "Arrive with clean, dry ears (avoid cotton buds)",
      "Bring previous test reports and current medications",
      "Avoid loud noise exposure for 12–24 hours before the test",
      "Inform the clinician about ear pain, discharge, or dizziness"
    ],
    whatToExpect: [
      "You will wear headphones and listen for beeps at different pitches and volumes",
      "You will press a button or raise a hand whenever you hear a sound",
      "A small vibrator may be placed behind the ear for bone conduction testing",
      "No pain; the test is safe and comfortable for all ages"
    ],
    branchId: '64f8b8e1a1b2c3d4e5f6g7h8' // Mock branch ID
  };

  // Fetch service details
  const fetchServiceDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const result = await getServiceById({ id }).unwrap();
      // if (result.success && result.service) {
      //   setService(result.service);
      // } else {
      //   setError('Service not found');
      // }
      
      // Mock implementation
      setService(mockService);
    } catch (err) {
      setError(err?.data?.message || 'Failed to fetch service details');
      console.error('Error fetching service:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots for the next 7 days based on branch availability
  const generateTimeSlots = async () => {
    const slots = [];
    const today = new Date();

    console.log('Generating slots for branch:', branchIdForQuery);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      const dateISO = `${y}-${m}-${d}`;

      try {
        // Fetch availability for this specific date
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/appointments/availability?branchId=${branchIdForQuery}&date=${dateISO}`
        );
        const data = await response.json();

        if (data.success) {
          const daySlots = data.availableSlots.map(slot => ({
            datetime: new Date(currentDate),
            time: slot.time,
            date: dateISO,
            isAvailable: slot.isAvailable,
            isBooked: slot.isBooked
          }));
          slots.push(daySlots);
        } else {
          // If branch is closed or error, add empty array
          slots.push([]);
        }
      } catch (error) {
        console.error('Error fetching availability for', dateISO, error);
        slots.push([]);
      }
    }

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

  // Handle appointment booking
  const handleBookAppointment = () => {
    if (!selectedTime) {
      toast({
        title: 'Please select a time slot',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Set selected date and time for modal
    const selectedSlot = availableSlots[selectedDateIndex]?.find(slot => slot.time === selectedTime);
    if (selectedSlot) {
      setSelectedDateISO(selectedSlot.datetime.toISOString().split('T')[0]);
      setSelectedTimeSlot(selectedTime);
      setIsBookingModalOpen(true);
    }
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

  // Handle booking success/conflict
  const handleBookingSuccess = (type) => {
    if (type === 'conflict') {
      // Refresh availability when there's a conflict
      refetchAvailability();
      setSelectedTime('');
      setIsBookingModalOpen(false);
    }
  };

  // Regenerate slots whenever branch is available
  useEffect(() => {
    if (branchIdForQuery) {
      generateTimeSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchIdForQuery]);

  // Fetch service details on component mount
  useEffect(() => {
    if (id) {
      fetchServiceDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color={textColor}>Loading service details...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center py={20}>
        <Alert status="error" maxW="md" rounded="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error loading service</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
      </Center>
    );
  }

  if (!service) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Text fontSize="xl" color={textColor}>Service not found</Text>
          <Button onClick={() => navigate('/services')}>
            Back to Services
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <div>
      <Navbar />
      <Box bg="gray.50" minH="100vh" py={8}>
        <Container maxW="6xl">
          {/* Back Button */}
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            mb={6}
            onClick={() => navigate('/services')}
          >
            Back to Services
          </Button>

          {/* Service Details Section */}
          <Flex direction={{ base: "column", md: "row" }} gap={6} mb={8}>
            {/* Service Image */}
            <Box flexShrink={0}>
              <Image
                src={service.image || '/api/placeholder/300/400'}
                alt={service.name}
                w={{ base: "full", md: "300px" }}
                h="400px"
                objectFit="cover"
                rounded="lg"
                bg="brand.50"
                fallback={
                  <Center h="400px" bg="brand.50" rounded="lg">
                    <VStack spacing={2}>
                      <Icon as={StarIcon} boxSize={16} color="brand.400" />
                      <Text color="brand.600" fontWeight="medium">Service Image</Text>
                    </VStack>
                  </Center>
                }
              />
            </Box>

            {/* Service Info */}
            <Box flex={1} bg="white" border="1px solid" borderColor={borderColor} rounded="lg" p={8}>
              {/* Name and Category */}
              <HStack spacing={3} mb={4}>
                <Text fontSize="3xl" fontWeight="bold" color={headingColor}>
                  {service.name}
                </Text>
                <Badge colorScheme="blue" variant="outline" px={3} py={1} rounded="full">
                  {service.category}
                </Badge>
              </HStack>

              {/* Price and Duration */}
              <HStack spacing={4} mb={4} wrap="wrap">
                <Text fontSize="lg" color={textColor}>
                  <Text as="span" fontWeight="bold" color="green.600">₹{service.price}</Text>
                </Text>
                <HStack spacing={1}>
                  <Icon as={TimeIcon} boxSize={4} color="brand.500" />
                  <Text fontSize="lg" color={textColor}>
                    {service.duration} minutes
                  </Text>
                </HStack>
              </HStack>

              {/* Description */}
              <Box mb={6}>
                <Text color={textColor} lineHeight="1.6" fontSize="lg">
                  {service.description}
                </Text>
              </Box>

              {/* Benefits */}
              <Box mb={6}>
                <HStack spacing={2} mb={3}>
                  <Icon as={CheckIcon} boxSize={4} color="green.500" />
                  <Text fontWeight="semibold" color={headingColor}>
                    Key Benefits
                  </Text>
                </HStack>
                <List spacing={1}>
                  {service.benefits?.slice(0, 4).map((benefit, index) => (
                    <ListItem key={index} color={textColor} fontSize="sm">
                      <ListIcon as={CheckIcon} color="green.500" />
                      {benefit}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Flex>

          {/* Booking Section */}
          <Box bg="white" rounded="lg" p={6} border="1px solid" borderColor={borderColor} mb={8}>
            <Text fontSize="lg" fontWeight="semibold" color={headingColor} mb={6}>
              Book an Appointment
            </Text>

            {/* Date Selection */}
            <Box mb={6}>
              <Text fontWeight="medium" color={textColor} mb={4}>
                Select Date
              </Text>
              <HStack spacing={3} overflowX="auto" pb={2}>
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
                      minW="80px"
                      h="80px"
                      flexDirection="column"
                      rounded="full"
                      isDisabled={!hasAvailableSlots}
                      opacity={hasAvailableSlots ? 1 : 0.4}
                      _hover={hasAvailableSlots ? { 
                        bg: "#2BA8D1", 
                        color: "white",
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                      } : {}}
                      _disabled={{
                        cursor: "not-allowed",
                        opacity: 0.4
                      }}
                    >
                      <Text fontSize="sm" fontWeight="bold">
                        {daySlots[0] && daysOfWeek[daySlots[0].datetime.getDay()]}
                      </Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {daySlots[0] && daySlots[0].datetime.getDate()}
                      </Text>
                      {!hasAvailableSlots && (
                        <Text fontSize="xs" color="red.500">
                          Unavailable
                        </Text>
                      )}
                    </Button>
                  );
                })}
              </HStack>
            </Box>

            {/* Time Selection */}
            <Box mb={6}>
              <Text fontWeight="medium" color={textColor} mb={4}>
                Select Time
              </Text>
              <HStack spacing={3} wrap="wrap">
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
                      size="sm"
                      px={4}
                      py={2}
                      rounded="full"
                      isDisabled={isBooked}
                      opacity={isBooked ? 0.6 : 1}
                      bg={isBooked ? "red.100" : undefined}
                      color={isBooked ? "red.600" : undefined}
                      borderColor={isBooked ? "red.300" : undefined}
                      _hover={!isBooked ? { 
                        bg: selectedTime === slot.time ? "#3182ce" : "#2BA8D1", 
                        color: "white",
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                      } : {}}
                      boxShadow={selectedTime === slot.time ? "0 0 0 3px rgba(49, 130, 206, 0.3)" : undefined}
                      _disabled={{
                        cursor: "not-allowed",
                        opacity: 0.6,
                        bg: "red.100",
                        color: "red.600",
                        borderColor: "red.300"
                      }}
                    >
                      {isBooked ? `${slot.time} (Booked)` : slot.time}
                    </Button>
                  );
                })}
              </HStack>
              {availableSlots[selectedDateIndex]?.length === 0 && (
                <Text color="gray.500" fontSize="sm" mt={2}>
                  No available time slots for this day
                </Text>
              )}
            </Box>

            {/* Book Button */}
            <Button
              colorScheme="brand"
              size="lg"
              onClick={handleBookAppointment}
              isDisabled={!selectedTime || !availableSlots[selectedDateIndex]?.find(slot => slot.time === selectedTime)?.isAvailable}
              px={12}
              py={6}
              rounded="full"
              fontWeight="semibold"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "lg"
              }}
              _disabled={{
                opacity: 0.4,
                cursor: "not-allowed"
              }}
            >
              {!selectedTime ? "Select a time slot" : "Book Appointment"}
            </Button>
          </Box>

          {/* Service Details Grid */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {/* What to Expect */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <HStack spacing={2} mb={4}>
                  <Icon as={InfoIcon} boxSize={4} color="brand.500" />
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor}>
                    What to Expect
                  </Text>
                </HStack>
                <List spacing={2}>
                  {service.whatToExpect?.map((item, index) => (
                    <ListItem key={index} color={textColor} fontSize="sm">
                      <ListIcon as={CheckIcon} color="green.500" />
                      {item}
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>

            {/* Preparation */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <HStack spacing={2} mb={4}>
                  <Icon as={TimeIcon} boxSize={4} color="brand.500" />
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor}>
                    Preparation
                  </Text>
                </HStack>
                <List spacing={2}>
                  {service.preparation?.map((item, index) => (
                    <ListItem key={index} color={textColor} fontSize="sm">
                      <ListIcon as={CheckIcon} color="blue.500" />
                      {item}
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>
          </Grid>
        </Container>
      </Box>
   
      <Footer />

      {/* Booking Modal */}
      <AppointmentFormModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceId={id}
        branchId={service?.branchId}
        branchName="Aartiket Speech & Hearing" // This should be dynamic
        selectedDate={selectedDateISO}
        selectedTimeSlot={selectedTimeSlot}
        serviceName={service?.name}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default ServiceDetailPage;
