import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, 
  Grid, GridItem, Badge, useDisclosure, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useToast, 
  Select, FormControl, FormLabel, IconButton, Tooltip, Spinner, Center,
  Divider, Flex, Avatar, Tag, TagLabel, TagCloseButton
} from '@chakra-ui/react';
import { useGetAllAppointmentsQuery } from '../../../features/api/appointments';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useGetAllDoctorsMutation } from '../../../features/api/doctor';
import { MdEvent, MdToday, MdArrowBack, MdArrowForward, MdAdd, MdFilterList, MdRefresh } from 'react-icons/md';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [branchFilter, setBranchFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const navigate = useNavigate();
  const toast = useToast();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';

  // API hooks
  const { data: appointmentsData, isFetching, refetch } = useGetAllAppointmentsQuery({
    page: 1,
    limit: 1000, // Get all appointments for calendar
    search: '',
    branchId: (userRole === 'branchAdmin' || userRole === 'doctor') ? userBranchId : (branchFilter === 'all' ? '' : branchFilter),
    doctorId: doctorFilter === 'all' ? '' : doctorFilter,
    status: '',
    date: '',
    sortBy: 'date',
    sortOrder: 'asc'
  });

  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [getAllDoctors, { data: doctorsData }] = useGetAllDoctorsMutation();

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const inactiveBg = useColorModeValue('gray.50', 'gray.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  // Fetch doctors data on component mount
  useEffect(() => {
    getAllDoctors({ page: 1, limit: 100, search: '' });
  }, [getAllDoctors]);

  // Calendar navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const navigateDay = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction);
      return newDate;
    });
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    if (!appointmentsData?.appointments) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return appointmentsData.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      return appointmentDate === dateStr;
    });
  };

  // Get appointments for current week
  const getAppointmentsForWeek = () => {
    if (!appointmentsData?.appointments) return [];
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return appointmentsData.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
    });
  };

  // Calendar generation
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'booked': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Format time
  const formatTime = (timeSlot) => {
    if (!timeSlot) return '';
    const [hours, minutes] = timeSlot.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    onModalOpen();
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const appointments = getAppointmentsForDate(date);
    if (appointments.length > 0) {
      setSelectedAppointment(appointments[0]);
      onModalOpen();
    }
  };

  // Render month view
  const renderMonthView = () => {
    const days = generateCalendarDays();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <VStack spacing={0} align="stretch">
        {/* Calendar Header */}
        <Grid templateColumns="repeat(7, 1fr)" gap={0} bg={headerBg} p={2}>
          {dayNames.map(day => (
            <GridItem key={day} textAlign="center" fontWeight="semibold" color="gray.600">
              {day}
            </GridItem>
          ))}
        </Grid>

        {/* Calendar Body */}
        <Grid templateColumns="repeat(7, 1fr)" gap={0} minH="600px">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const appointments = getAppointmentsForDate(day);
            
            return (
              <GridItem
                key={index}
                border="1px solid"
                borderColor={borderColor}
                p={2}
                minH="100px"
                bg={isCurrentMonth ? cardBg : inactiveBg}
                cursor="pointer"
                _hover={{ bg: hoverBg }}
                onClick={() => handleDateClick(day)}
              >
                <VStack align="stretch" spacing={1}>
                  <Text
                    fontSize="sm"
                    fontWeight={isToday ? 'bold' : 'normal'}
                    color={isCurrentMonth ? (isToday ? 'blue.500' : 'gray.700') : 'gray.400'}
                  >
                    {day.getDate()}
                  </Text>
                  
                  <VStack spacing={1} align="stretch" maxH="80px" overflow="hidden">
                    {appointments.slice(0, 3).map((appointment, idx) => (
                      <Badge
                        key={idx}
                        colorScheme={getStatusColor(appointment.status)}
                        fontSize="xs"
                        p={1}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(appointment);
                        }}
                        _hover={{ transform: 'scale(1.05)' }}
                      >
                        {formatTime(appointment.timeSlot)} - {appointment.patientId?.name}
                      </Badge>
                    ))}
                    {appointments.length > 3 && (
                      <Text fontSize="xs" color="gray.500">
                        +{appointments.length - 3} more
                      </Text>
                    )}
                  </VStack>
                </VStack>
              </GridItem>
            );
          })}
        </Grid>
      </VStack>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    const timeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return (
      <VStack spacing={0} align="stretch">
        {/* Week Header */}
        <Grid templateColumns="100px repeat(7, 1fr)" gap={0} bg={headerBg} p={2}>
          <GridItem></GridItem>
          {weekDays.map((day, index) => (
            <GridItem key={index} textAlign="center" fontWeight="semibold">
              <VStack spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text fontSize="lg" color={day.toDateString() === new Date().toDateString() ? 'blue.500' : 'gray.700'}>
                  {day.getDate()}
                </Text>
              </VStack>
            </GridItem>
          ))}
        </Grid>

        {/* Week Body */}
        <Box maxH="600px" overflowY="auto">
          {timeSlots.map((timeSlot, timeIndex) => (
            <Grid key={timeIndex} templateColumns="100px repeat(7, 1fr)" gap={0} minH="40px">
              <GridItem
                border="1px solid"
                borderColor={borderColor}
                p={2}
                bg={headerBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="xs" color="gray.600">
                  {formatTime(timeSlot)}
                </Text>
              </GridItem>
              
              {weekDays.map((day, dayIndex) => {
                const appointments = getAppointmentsForDate(day).filter(
                  apt => apt.timeSlot === timeSlot
                );
                
                return (
                  <GridItem
                    key={dayIndex}
                    border="1px solid"
                    borderColor={borderColor}
                    p={1}
                    bg={cardBg}
                    position="relative"
                  >
                    {appointments.map((appointment, aptIndex) => (
                      <Badge
                        key={aptIndex}
                        colorScheme={getStatusColor(appointment.status)}
                        fontSize="xs"
                        p={1}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => handleAppointmentClick(appointment)}
                        _hover={{ transform: 'scale(1.05)' }}
                        w="full"
                        display="block"
                        textAlign="center"
                      >
                        {appointment.patientId?.name}
                      </Badge>
                    ))}
                  </GridItem>
                );
              })}
            </Grid>
          ))}
        </Box>
      </VStack>
    );
  };

  // Render day view
  const renderDayView = () => {
    const appointments = getAppointmentsForDate(currentDate);
    const timeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return (
      <VStack spacing={0} align="stretch">
        {/* Day Header */}
        <Box bg={headerBg} p={4} textAlign="center">
          <Text fontSize="xl" fontWeight="bold">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </Box>

        {/* Day Body */}
        <Box maxH="600px" overflowY="auto">
          {timeSlots.map((timeSlot, index) => {
            const appointments = appointments.filter(apt => apt.timeSlot === timeSlot);
            
            return (
              <Box
                key={index}
                border="1px solid"
                borderColor={borderColor}
                p={3}
                minH="60px"
                bg={cardBg}
              >
                <HStack spacing={4} align="start">
                  <Text fontSize="sm" color="gray.600" minW="80px">
                    {formatTime(timeSlot)}
                  </Text>
                  
                  <VStack spacing={2} align="stretch" flex={1}>
                    {appointments.map((appointment, aptIndex) => (
                      <Card
                        key={aptIndex}
                        size="sm"
                        cursor="pointer"
                        onClick={() => handleAppointmentClick(appointment)}
                        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                      >
                        <CardBody p={3}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">{appointment.patientId?.name}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {appointment.doctorId?.name} - {appointment.branchId?.branchName}
                              </Text>
                            </VStack>
                            <Tag colorScheme={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Tag>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </Box>
      </VStack>
    );
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <HStack spacing={3}>
                <MdEvent size={24} color="#2BA8D1" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">Appointment Calendar</Text>
                  <Text fontSize="sm" color="gray.600">
                    {currentDate.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={2}>
                <Button
                  variant="outline"
                  leftIcon={<MdRefresh />}
                  onClick={() => refetch()}
                  isLoading={isFetching}
                  _hover={{ 
                    bg: "#2BA8D1", 
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<MdAdd />}
                  onClick={() => navigate('/admin/appointments/create')}
                >
                  Add Appointment
                </Button>
              </HStack>
            </Flex>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              {/* View Mode */}
              <FormControl maxW="150px">
                <FormLabel fontSize="sm">View</FormLabel>
                <Select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  size="sm"
                >
                  <option value="month">Month</option>
                  <option value="week">Week</option>
                  <option value="day">Day</option>
                </Select>
              </FormControl>

              {/* Branch Filter */}
              {userRole === 'superAdmin' && (
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">Branch</FormLabel>
                  <Select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    size="sm"
                  >
                    <option value="all">All Branches</option>
                    {branchesData?.branches?.map(branch => (
                      <option key={branch._id} value={branch._id}>{branch.branchName}</option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Doctor Filter */}
              <FormControl maxW="200px">
                <FormLabel fontSize="sm">Doctor</FormLabel>
                <Select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  size="sm"
                >
                  <option value="all">All Doctors</option>
                  {doctorsData?.data?.doctors?.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
                  ))}
                </Select>
              </FormControl>
            </HStack>
          </CardBody>
        </Card>

        {/* Calendar Navigation */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <HStack spacing={2}>
                <IconButton
                  icon={<ChevronLeftIcon />}
                  onClick={() => {
                    if (viewMode === 'month') navigateMonth(-1);
                    else if (viewMode === 'week') navigateWeek(-1);
                    else navigateDay(-1);
                  }}
                  variant="outline"
                  size="sm"
                />
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                  leftIcon={<MdToday />}
                  size="sm"
                >
                  Today
                </Button>
                <IconButton
                  icon={<ChevronRightIcon />}
                  onClick={() => {
                    if (viewMode === 'month') navigateMonth(1);
                    else if (viewMode === 'week') navigateWeek(1);
                    else navigateDay(1);
                  }}
                  variant="outline"
                  size="sm"
                />
              </HStack>

              <Text fontSize="lg" fontWeight="semibold">
                {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
                {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}`}
                {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </Flex>
          </CardBody>
        </Card>

        {/* Calendar View */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody p={0}>
            {isFetching ? (
              <Center py={20}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="#2BA8D1" />
                  <Text color="gray.600">Loading appointments...</Text>
                </VStack>
              </Center>
            ) : (
              <>
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
              </>
            )}
          </CardBody>
        </Card>

        {/* Appointment Details Modal */}
        <Modal isOpen={isModalOpen} onClose={onModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <MdEvent size={20} color="#2BA8D1" />
                <Text>Appointment Details</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedAppointment && (
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Patient</Text>
                    <Text>{selectedAppointment.patientId?.name}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Doctor</Text>
                    <Text>{selectedAppointment.doctorId?.name}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Branch</Text>
                    <Text>{selectedAppointment.branchId?.branchName}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Date & Time</Text>
                    <Text>
                      {new Date(selectedAppointment.date).toLocaleDateString()} at {formatTime(selectedAppointment.timeSlot)}
                    </Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Status</Text>
                    <Tag colorScheme={getStatusColor(selectedAppointment.status)}>
                      {selectedAppointment.status}
                    </Tag>
                  </HStack>
                  
                  {selectedAppointment.referredDoctorId && (
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Referred Doctor</Text>
                      <Text>{selectedAppointment.referredDoctorId?.name}</Text>
                    </HStack>
                  )}
                  
                  {selectedAppointment.notes && (
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Notes</Text>
                      <Text fontSize="sm" color="gray.600">{selectedAppointment.notes}</Text>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={onModalClose} _hover={{ 
                bg: "#2BA8D1", 
                color: "white",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
              }}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default CalendarView;
