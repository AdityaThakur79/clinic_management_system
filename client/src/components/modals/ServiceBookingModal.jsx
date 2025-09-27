import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Text,
  Box,
  Divider,
  List,
  ListItem,
  ListIcon,
  Badge,
  Image,
  Grid,
  Card,
  CardBody,
  Icon,
  useDisclosure,
  Collapse
} from '@chakra-ui/react';
import { 
  CheckIcon, 
  TimeIcon, 
  InfoIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  StarIcon
} from '@chakra-ui/icons';
import { useCreateAppointmentMutation } from '../../features/api/appointments';
import { useGetAllBranchesQuery } from '../../features/api/branchApi';
import { useGetAvailabilityQuery } from '../../features/api/appointments';

const ServiceBookingModal = ({
  isOpen,
  onClose,
  service,
}) => {
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedBranchName, setSelectedBranchName] = useState('');

  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100 });
  const toast = useToast();

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
        // Fetch availability for this specific date
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/appointments/availability?branchId=${branchId}&date=${dateISO}`
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

  // Regenerate slots when modal opens or branch changes
  useEffect(() => {
    if (isOpen && branchId) {
      generateTimeSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, branchId]);

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
        servicePrice: service.detailedContent?.cost || service.price || 0,
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

      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'prefer_not_to_say',
        address: '',
        notes: '',
      });
      setSelectedTime('');
      setSelectedDateIndex(0);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!service) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bg} maxW="1200px" borderRadius="xl" boxShadow="2xl" border="1px solid" borderColor={borderColor}>
        <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={3}>
          <HStack spacing={3}>
            <Image src={service.image} alt={service.title} w="50px" h="50px" objectFit="cover" rounded="md" />
            <Box>
              <Text fontSize="xl" fontWeight="bold" color="brand.600">
                Book Appointment
              </Text>
              <Text fontSize="sm" color={headerSubColor} mt={1}>
                for {service.title}
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody maxH="80vh" overflowY="auto">
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Service Details */}
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardBody>
                    <Text fontWeight="semibold" color="gray.800" mb={3} fontSize="lg">
                      Service Details
                    </Text>
                    
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Price:</Text>
                        <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                          ₹{service.detailedContent?.cost || service.price || 'TBD'}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Duration:</Text>
                        <Text>{service.duration || 30} minutes</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Category:</Text>
                        <Badge colorScheme="blue" variant="outline">
                          {service.category}
                        </Badge>
                      </HStack>
                    </VStack>

                    <Divider my={4} />

                    <Text fontWeight="medium" mb={2}>Description:</Text>
                    <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                      {service.description}
                    </Text>

                    {/* Service Details Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      onClick={() => setShowDetails(!showDetails)}
                      mt={3}
                      color="brand.500"
                    >
                      {showDetails ? 'Hide' : 'Show'} Details
                    </Button>

                    <Collapse in={showDetails}>
                      <Box mt={4}>
                        {service.detailedContent?.benefits && (
                          <Box mb={4}>
                            <Text fontWeight="medium" mb={2} color="green.600">
                              <Icon as={CheckIcon} mr={1} />
                              Key Benefits:
                            </Text>
                            <List spacing={1}>
                              {service.detailedContent.benefits.slice(0, 4).map((benefit, index) => (
                                <ListItem key={index} fontSize="sm" color="gray.600">
                                  <ListIcon as={CheckIcon} color="green.500" />
                                  {benefit}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {service.detailedContent?.whatToExpect && (
                          <Box mb={4}>
                            <Text fontWeight="medium" mb={2} color="blue.600">
                              <Icon as={InfoIcon} mr={1} />
                              What to Expect:
                            </Text>
                            <List spacing={1}>
                              {service.detailedContent.whatToExpect.slice(0, 3).map((item, index) => (
                                <ListItem key={index} fontSize="sm" color="gray.600">
                                  <ListIcon as={CheckIcon} color="blue.500" />
                                  {item}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {service.detailedContent?.preparation && (
                          <Box>
                            <Text fontWeight="medium" mb={2} color="orange.600">
                              <Icon as={TimeIcon} mr={1} />
                              Preparation:
                            </Text>
                            <List spacing={1}>
                              {service.detailedContent.preparation.slice(0, 3).map((item, index) => (
                                <ListItem key={index} fontSize="sm" color="gray.600">
                                  <ListIcon as={CheckIcon} color="orange.500" />
                                  {item}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </CardBody>
                </Card>
              </VStack>

              {/* Booking Form */}
              <VStack spacing={4} align="stretch">
                {/* Date Selection */}
                <Card>
                  <CardBody>
                    <Text fontWeight="semibold" color="gray.800" mb={3}>
                      Select Date
                    </Text>
                    {!selectedBranchId ? (
                      <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
                        Please select a branch first to view available dates and times
                      </Text>
                    ) : (
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
                            size="sm"
                          >
                            <Text fontSize="xs" fontWeight="bold">
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
                    )}
                  </CardBody>
                </Card>

                {/* Time Selection */}
                <Card>
                  <CardBody>
                    <Text fontWeight="semibold" color="gray.800" mb={3}>
                      Select Time
                    </Text>
                    {!selectedBranchId ? (
                      <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
                        Please select a branch first to view available time slots
                      </Text>
                    ) : (
                      <>
                        <HStack spacing={2} wrap="wrap">
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
                                px={3}
                                py={1}
                                rounded="full"
                                isDisabled={isBooked}
                                opacity={isBooked ? 0.6 : 1}
                                bg={isBooked ? "red.100" : undefined}
                                color={isBooked ? "red.600" : undefined}
                                borderColor={isBooked ? "red.300" : undefined}
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
                      </>
                    )}
                  </CardBody>
                </Card>

                {/* Patient Information */}
                <Card>
                  <CardBody>
                    <Text fontWeight="semibold" color="gray.800" mb={3}>
                      Patient Information
                    </Text>

                    <VStack spacing={3} align="stretch">
                      <HStack spacing={3}>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Full Name</FormLabel>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter full name"
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Age</FormLabel>
                          <Input
                            type="number"
                            value={formData.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            placeholder="Age"
                            size="sm"
                            min="0"
                            max="120"
                          />
                        </FormControl>
                      </HStack>

                      <HStack spacing={3}>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Phone Number</FormLabel>
                          <Input
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Enter phone number"
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Email</FormLabel>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter email (optional)"
                            size="sm"
                          />
                        </FormControl>
                      </HStack>

                      <HStack spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="sm">Gender</FormLabel>
                          <Select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            size="sm"
                          >
                            <option value="prefer_not_to_say">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Branch *</FormLabel>
                          <Select
                            value={selectedBranchId}
                            onChange={(e) => {
                              const branch = branchesData?.branches?.find(b => b._id === e.target.value);
                              if (branch) {
                                handleBranchSelection(branch);
                              }
                            }}
                            size="sm"
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
                      </HStack>

                      <FormControl>
                        <FormLabel fontSize="sm">Address</FormLabel>
                        <Input
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="Enter address (optional)"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Notes</FormLabel>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Any additional notes or symptoms (optional)"
                          size="sm"
                          rows={2}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Grid>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3}>
              <Button variant="outline" colorScheme="brand" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={isLoading}
                loadingText="Booking..."
                size="sm"
                isDisabled={!selectedTime}
              >
                Book Appointment
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ServiceBookingModal;
