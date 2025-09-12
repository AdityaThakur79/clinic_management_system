import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  Image,
  Badge,
  Button,
  Grid,
  GridItem,
  Flex,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  HStack,
  VStack,
  Card,
  CardBody,
  useColorModeValue,
  Icon,
  Tooltip,
  Divider,
  Container
} from '@chakra-ui/react';
import { StarIcon, PhoneIcon, EmailIcon, CalendarIcon, TimeIcon } from '@chakra-ui/icons';
import { useGetAllDoctorsMutation } from '../../../features/api/doctor';

const TopDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // RTK Query hook
  const [getAllDoctors] = useGetAllDoctorsMutation();

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllDoctors({
        page: 1,
        limit: 12, // Show top 12 doctors
        q: '',
        branch: '',
        status: 'true', // Only active doctors
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }).unwrap();

      setDoctors(result.doctors || []);
      console.log('Fetched doctors:', result.doctors);
      console.log('Doctor statuses:', result.doctors?.map(d => ({ name: d.name, status: d.status, statusType: typeof d.status })));
    } catch (err) {
      setError(err?.data?.message || 'Failed to fetch doctors');
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if doctor is available
  const isDoctorAvailable = (doctor) => {
    return doctor.status === true || 
           doctor.status === 'active' || 
           doctor.status === 'true' ||
           doctor.status === 1;
  };

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
    window.scrollTo(0, 0);
  };

  const handleBookAppointment = () => {
    navigate('/doctors');
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>Loading doctors...</Text>
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
            <Text fontWeight="bold">Error loading doctors</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
      </Center>
    );
  }

  return (
    <Box bg="gray.50" py={16} px={4}>
      {/* Decorative Background */}
      <Box position="absolute" top="-50px" left="-50px" w="200px" h="200px" bg="brand.100" opacity="0.1" rounded="full" zIndex={0} />
      <Box position="absolute" bottom="-50px" right="-50px" w="200px" h="200px" bg="brand.100" opacity="0.1" rounded="full" zIndex={0} />

      <Container maxW="6xl" position="relative" zIndex={10}>
        {/* Header */}
        <VStack spacing={6} textAlign="center" mb={12}>
          <Badge 
            colorScheme="brand" 
            px={4} 
            py={2} 
            rounded="full" 
            fontSize="sm" 
            fontWeight="bold"
            bg="brand.100"
            color="white"
          >
            Our Expert Team
          </Badge>
          <Text 
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} 
            fontWeight="bold" 
            color={headingColor} 
            maxW="4xl"
            lineHeight="1.2"
          >
            Meet Our <Text as="span" color="brand.500">Speech & Hearing</Text> Specialists
          </Text>
          <Text fontSize="lg" color={textColor} maxW="2xl" lineHeight="1.6">
            Our experienced audiologists and speech therapists are dedicated to providing exceptional care.
          </Text>
        </VStack>

        {/* Doctors Grid */}
        {doctors.length > 0 ? (
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)"
            }}
            gap={6}
            mb={12}
          >
            {doctors.map((doctor) => (
              <GridItem key={doctor._id}>
                <Card
                  bg="white"
                  borderColor="gray.200"
                  borderWidth="1px"
                  rounded="xl"
                  overflow="hidden"
                  cursor="pointer"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  shadow="md"
                  _hover={{
                    transform: "translateY(-8px) scale(1.02)",
                    shadow: "xl",
                    borderColor: "brand.300",
                    shadowColor: "brand.200"
                  }}
                  onClick={() => handleDoctorClick(doctor._id)}
                >
                  {/* Doctor Image */}
                  <Box position="relative" h="180px" bg="brand.50">
                    <Image
                      src={doctor.photoUrl || doctor.profilePhoto || '/api/placeholder/300/180'}
                      alt={doctor.name}
                      w="full"
                      h="full"
                      objectFit="cover"
                      fallback={
                        <Center h="full" bg="brand.50">
                          <VStack spacing={1}>
                            <Icon as={StarIcon} boxSize={12} color="brand.400" />
                            <Text fontSize="xs" color="brand.600" fontWeight="medium">Photo</Text>
                          </VStack>
                        </Center>
                      }
                    />
                    <Badge
                      position="absolute"
                      top={3}
                      right={3}
                      colorScheme={isDoctorAvailable(doctor) ? 'green' : 'red'}
                      px={2}
                      py={1}
                      rounded="full"
                      fontSize="xs"
                      fontWeight="bold"
                      bg={isDoctorAvailable(doctor) ? 'green.100' : 'red.100'}
                      color={isDoctorAvailable(doctor) ? 'green.700' : 'red.700'}
                    >
                      {isDoctorAvailable(doctor) ? 'Available' : 'Unavailable'}
                    </Badge>
                  </Box>

                  {/* Doctor Info */}
                  <CardBody p={5}>
                    <VStack spacing={3} align="start">
                      <Text fontSize="lg" fontWeight="bold" color="gray.800" noOfLines={1}>
                        {doctor.name}
                      </Text>
                      
                      <Text fontSize="sm" color="brand.500" fontWeight="semibold" noOfLines={1}>
                        {doctor.specialization}
                      </Text>
                      
                      {doctor.degree && (
                        <Text fontSize="xs" color="gray.600" noOfLines={1}>
                          {doctor.degree}
                        </Text>
                      )}

                      {doctor.yearsOfExperience && (
                        <HStack spacing={1}>
                          <Icon as={TimeIcon} boxSize={3} color="brand.400" />
                          <Text fontSize="xs" color="gray.600">
                            {doctor.yearsOfExperience} years exp
                          </Text>
                        </HStack>
                      )}

                      {doctor.perSessionCharge && (
                        <Text fontSize="sm" color="green.600" fontWeight="bold">
                          ₹{doctor.perSessionCharge}/session
                        </Text>
                      )}

                      <Divider borderColor="gray.100" />

                      <HStack spacing={2} w="full" justify="space-between">
                        <Button
                          size="sm"
                          colorScheme="brand"
                          variant="solid"
                          leftIcon={<CalendarIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDoctorClick(doctor._id);
                          }}
                          rounded="lg"
                          fontWeight="semibold"
                          px={4}
                          fontSize="xs"
                          _hover={{
                            transform: "translateY(-1px)",
                            shadow: "md"
                          }}
                        >
                          Book Now
                        </Button>
                        
                        <HStack spacing={2}>
                          <Tooltip label="Phone" hasArrow>
                            <Icon as={PhoneIcon} boxSize={4} color="brand.400" cursor="pointer" />
                          </Tooltip>
                          <Tooltip label="Email" hasArrow>
                            <Icon as={EmailIcon} boxSize={4} color="brand.400" cursor="pointer" />
                          </Tooltip>
                        </HStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        ) : (
          <Center py={20}>
            <VStack spacing={6}>
              <Icon as={StarIcon} boxSize={20} color="gray.400" />
              <Text fontSize="xl" color={textColor} fontWeight="medium">
                No doctors available at the moment
              </Text>
              <Text fontSize="md" color={textColor} textAlign="center">
                Please check back later or contact us for more information.
              </Text>
            </VStack>
          </Center>
        )}

        {/* View All Button */}
        <Center>
          <Button
            size="md"
            colorScheme="brand"
            variant="solid"
            px={8}
            py={4}
            rounded="xl"
            fontSize="md"
            fontWeight="semibold"
            onClick={handleBookAppointment}
            _hover={{
              transform: "translateY(-2px)",
              shadow: "lg"
            }}
            _active={{
              transform: "translateY(0px)"
            }}
            transition="all 0.2s ease"
          >
            View All Specialists
          </Button>
        </Center>
      </Container>
    </Box>
  );
};

export default TopDoctors;
