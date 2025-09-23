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
  useToast
} from '@chakra-ui/react';
import { 
  StarIcon, 
  CheckIcon,
  InfoIcon
} from '@chakra-ui/icons';
import { useGetDoctorByIdMutation } from '../../../features/api/doctor';
import { useGetAvailabilityQuery } from '../../../features/api/appointments';
import AppointmentFormModal from '../../../components/modals/AppointmentFormModal';
import Navbar from './Navbar';
import Footer from './Footer';
import CTA from './CTA';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDateISO, setSelectedDateISO] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // RTK Query hooks
  const [getDoctorById] = useGetDoctorByIdMutation();
  
  // Get availability for selected date
  const branchIdForQuery = doctor?.branch?._id || doctor?.branch;
  const { data: availabilityData, refetch: refetchAvailability } = useGetAvailabilityQuery(
    {
      doctorId: id,
      branchId: branchIdForQuery,
      date: selectedDateISO,
    },
    {
      skip: !id || !branchIdForQuery || !selectedDateISO,
    }
  );

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Days of week
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Fetch doctor details
  const fetchDoctorDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getDoctorById({ id }).unwrap();
      
      if (result.success && result.doctor) {
        setDoctor(result.doctor);
        console.log('Doctor data:', result.doctor);
        console.log('Available days:', result.doctor.availableDays);
        console.log('Available time slots:', result.doctor.availableTimeSlots);
        generateTimeSlots(result.doctor);
      } else {
        setError('Doctor not found');
      }
    } catch (err) {
      setError(err?.data?.message || 'Failed to fetch doctor details');
      console.error('Error fetching doctor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots for the next 7 days based on doctor's availability
  const generateTimeSlots = (docInfo) => {
    const slots = [];
    const today = new Date();

    // Get doctor's available days and consultation time
    const availableDays = docInfo.availableDays || [];
    const consultationTime = docInfo.consultationTime || 30; // Default 30 minutes
    const workingHours = {
      start: 9, // 9:00 AM
      end: 17   // 5:00 PM
    };
    
    console.log('Generating slots for doctor:', docInfo.name);
    console.log('Available days:', availableDays);
    console.log('Consultation time:', consultationTime, 'minutes');

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // Get day name (e.g., "Monday", "Tuesday")
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if doctor is available on this day
      const isDayAvailable = availableDays.some(day => 
        day.toLowerCase() === dayName.toLowerCase()
      );

      const daySlots = [];

      if (isDayAvailable) {
        // Generate time slots from 9:00 AM to 5:00 PM
        const startTime = new Date(currentDate);
        startTime.setHours(workingHours.start, 0, 0, 0);
        
        const endTime = new Date(currentDate);
        endTime.setHours(workingHours.end, 0, 0, 0);

        // If it's today, start from current time + consultation time
        if (today.getDate() === currentDate.getDate()) {
          const now = new Date();
          const nextAvailableTime = new Date(now);
          nextAvailableTime.setMinutes(nextAvailableTime.getMinutes() + consultationTime);
          
          // Round up to the next consultation interval
          const minutesToAdd = consultationTime - (nextAvailableTime.getMinutes() % consultationTime);
          nextAvailableTime.setMinutes(nextAvailableTime.getMinutes() + minutesToAdd);
          
          if (nextAvailableTime > startTime) {
            startTime.setTime(nextAvailableTime.getTime());
          }
        }

        // Generate slots every consultation time minutes
        const currentSlot = new Date(startTime);
        while (currentSlot < endTime) {
          // Format as 24h HH:mm to match backend timeSlot
          const hours = String(currentSlot.getHours()).padStart(2, '0');
          const minutes = String(currentSlot.getMinutes()).padStart(2, '0');
          const formattedTime = `${hours}:${minutes}`;

          const y = currentDate.getFullYear();
          const m = String(currentDate.getMonth() + 1).padStart(2, '0');
          const d = String(currentDate.getDate()).padStart(2, '0');
          const slotISODate = `${y}-${m}-${d}`;

          // Check if this slot is booked using API data
          const isBooked = availabilityData?.bookedTimeSlots?.includes(formattedTime) || false;

          daySlots.push({
            datetime: new Date(currentSlot),
            time: formattedTime,
            date: slotISODate,
            isAvailable: !isBooked,
            isBooked: isBooked
          });

          // Increment by consultation time
          currentSlot.setMinutes(currentSlot.getMinutes() + consultationTime);
        }
      }

      slots.push(daySlots);
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

  // Regenerate slots whenever availability data or date changes
  useEffect(() => {
    if (doctor) {
      generateTimeSlots(doctor);
    }
    // Fallback: if no slots after generation, attempt one auto-refetch (guards random backend delays)
    if (doctor && availableSlots.every(day => day.length === 0)) {
      const t = setTimeout(() => {
        refetchAvailability();
      }, 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityData, selectedDateISO]);

  // Fetch doctor details on component mount
  useEffect(() => {
    if (id) {
      fetchDoctorDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color={textColor}>Loading doctor details...</Text>
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
            <Text fontWeight="bold">Error loading doctor</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
      </Center>
    );
  }

  if (!doctor) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Text fontSize="xl" color={textColor}>Doctor not found</Text>
          <Button onClick={() => navigate('/doctors')}>
            Back to Doctors
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
        {/* Doctor Details Section */}
        <Flex direction={{ base: "column", md: "row" }} gap={6} mb={8}>
          {/* Doctor Image */}
          <Box flexShrink={0}>
            <Image
              src={doctor.photoUrl || doctor.profilePhoto || '/api/placeholder/300/400'}
              alt={doctor.name}
              w={{ base: "full", md: "300px" }}
              h="400px"
              objectFit="cover"
              rounded="lg"
              bg="brand.50"
              fallback={
                <Center h="400px" bg="brand.50" rounded="lg">
                  <VStack spacing={2}>
                    <Icon as={StarIcon} boxSize={16} color="brand.400" />
                    <Text color="brand.600" fontWeight="medium">Doctor Photo</Text>
                  </VStack>
                </Center>
              }
            />
          </Box>

          {/* Doctor Info */}
          <Box flex={1} bg="white" border="1px solid" borderColor={borderColor} rounded="lg" p={8}>
            {/* Name and Verification */}
            <HStack spacing={3} mb={4}>
              <Text fontSize="3xl" fontWeight="bold" color={headingColor}>
                {doctor.name}
              </Text>
              <Icon as={CheckIcon} boxSize={5} color="green.500" />
            </HStack>

            {/* Degree and Specialization */}
            <HStack spacing={4} mb={4} wrap="wrap">
              <Text fontSize="lg" color={textColor}>
                {doctor.degree} - {doctor.specialization}
              </Text>
              <Badge colorScheme="blue" variant="outline" px={3} py={1} rounded="full">
                {doctor.yearsOfExperience} years exp
              </Badge>
            </HStack>

            {/* About Section */}
            <Box mb={6}>
              <HStack spacing={2} mb={2}>
                <Icon as={InfoIcon} boxSize={4} color="brand.500" />
                <Text fontWeight="semibold" color={headingColor}>
                  About
                </Text>
              </HStack>
              <Text color={textColor} lineHeight="1.6">
                {doctor.bio || 'No bio available for this doctor.'}
              </Text>
            </Box>

            {/* Languages */}
            {doctor.languages && doctor.languages.length > 0 && (
              <Box mb={6}>
                <Text fontWeight="semibold" color={headingColor} mb={2}>
                  Languages Spoken
                </Text>
                <HStack spacing={2} wrap="wrap">
                  {doctor.languages.map((language, index) => (
                    <Badge key={index} colorScheme="green" variant="subtle" px={3} py={1} rounded="full">
                      {language}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            {/* Appointment Fee */}
            <Box>
              <Text color={textColor} fontWeight="medium">
                Appointment fee: 
                <Text as="span" color={headingColor} fontWeight="bold" ml={2}>
                  ₹{doctor.perSessionCharge || 'Not specified'}
                </Text>
              </Text>
            </Box>
          </Box>
        </Flex>

        {/* Booking Section */}
        <Box bg="white" rounded="lg" p={6} border="1px solid" borderColor={borderColor}>
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

        {/* Additional Information */}
        <Grid templateColumns={{ base: "1fr", md: "1fr" }} gap={6} mt={8}>
          {/* Availability */}
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" color={headingColor} mb={4}>
                Availability
              </Text>
              <VStack spacing={3} align="start">
                {doctor.availableDays && doctor.availableDays.length > 0 ? (
                  <HStack spacing={2} wrap="wrap">
                    {doctor.availableDays.map((day, index) => (
                      <Badge key={index} colorScheme="green" variant="subtle" px={3} py={1} rounded="full">
                        {day}
                      </Badge>
                    ))}
                  </HStack>
                ) : (
                  <Text color={textColor}>Availability not specified</Text>
                )}
              </VStack>
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
        doctorId={id}
        branchId={doctor?.branch?._id || doctor?.branch}
        branchName={doctor?.branch?.branchName}
        selectedDate={selectedDateISO}
        selectedTimeSlot={selectedTimeSlot}
        doctorName={doctor?.name}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default DoctorDetailPage;
