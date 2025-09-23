import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, IconButton, Input, Select, Table, Tbody, Td, Th, Thead, Tr, Text,
  useColorModeValue, Card, CardBody, CardHeader, TableContainer, VStack, Divider, Badge,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useToast, Tooltip, InputGroup, InputLeftElement, Flex, Grid, Checkbox,
  Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, Avatar, Tabs,
  TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Textarea, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  SimpleGrid, Checkbox as ChakraCheckbox
} from '@chakra-ui/react';
import { useGetAllRemindersQuery, useUpdateReminderStatusMutation, useDeleteReminderMutation, useMarkReminderCompletedMutation, useSendReminderMutation } from '../../../features/api/reminders';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useGetAllDoctorsMutation } from '../../../features/api/doctor';
import { DeleteIcon, EditIcon, SearchIcon, AddIcon, ChevronLeftIcon, ChevronRightIcon, ViewIcon, RepeatIcon, SettingsIcon, PhoneIcon, EmailIcon, CalendarIcon, InfoIcon, CheckIcon, ReceiptIcon, BellIcon } from '@chakra-ui/icons';
import { MdAssignment, MdBusiness, MdPhone, MdEmail, MdPerson, MdSchedule, MdNotifications } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AllReminders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('reminderDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedReminders, setSelectedReminders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const navigate = useNavigate();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';
  const userDoctorId = user?.role === 'doctor' ? user?._id : '';

  // API hooks
  const { data, isFetching, refetch, error, isLoading } = useGetAllRemindersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    type: typeFilter === 'all' ? '' : typeFilter,
    status: statusFilter === 'all' ? '' : statusFilter,
    priority: priorityFilter === 'all' ? '' : priorityFilter,
    startDate,
    endDate,
    branchId: (userRole === 'branchAdmin' || userRole === 'doctor') ? userBranchId : (branchFilter === 'all' ? '' : branchFilter),
    doctorId: userRole === 'doctor' ? userDoctorId : (doctorFilter === 'all' ? '' : doctorFilter),
    sortBy,
    sortOrder,
  });

  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [getAllDoctors] = useGetAllDoctorsMutation();
  const [updateReminderStatus] = useUpdateReminderStatusMutation();
  const [deleteReminder, { isLoading: isDeleting }] = useDeleteReminderMutation();
  const [markReminderCompleted] = useMarkReminderCompletedMutation();
  const [sendReminder] = useSendReminderMutation();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const toast = useToast();

  // Brand button styles
  const brandHover = {
    _hover: {
      bg: '#2BA8D1',
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(43,168,209,0.3)'
    },
    _active: { bg: '#2696ba', transform: 'translateY(0)' },
    transition: 'all 0.15s ease'
  };
  const brandPrimary = {
    bg: '#2BA8D1',
    color: 'white',
    _hover: { bg: '#2696ba', transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(43,168,209,0.25)' },
    _active: { bg: '#2187a6', transform: 'translateY(0)' },
    transition: 'all 0.15s ease'
  };

  // Load doctors for filter
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await getAllDoctors({
          page: 1,
          limit: 100,
          q: '',
          branch: userRole === 'branchAdmin' || userRole === 'doctor' ? userBranchId : '',
        }).unwrap();
        setDoctors(result.doctors || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, [userRole, userBranchId, getAllDoctors]);

  const handleViewReminder = (reminder) => {
    setSelectedReminder(reminder);
    onViewModalOpen();
  };

  const handleDeleteClick = (reminder) => {
    setReminderToDelete(reminder);
    onDeleteModalOpen();
  };

  const handleDelete = async () => {
    try {
      await deleteReminder(reminderToDelete._id).unwrap();
      toast({
        title: 'Reminder Deleted',
        description: 'Reminder has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteModalClose();
      setReminderToDelete(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete reminder.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = async (reminderId, newStatus) => {
    try {
      await updateReminderStatus({ id: reminderId, status: newStatus }).unwrap();
      toast({
        title: 'Status Updated',
        description: 'Reminder status has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update reminder status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMarkCompleted = async (reminderId) => {
    try {
      await markReminderCompleted(reminderId).unwrap();
      toast({
        title: 'Reminder Completed',
        description: 'Reminder has been marked as completed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to mark reminder as completed.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSendReminder = async (reminderId) => {
    try {
      await sendReminder(reminderId).unwrap();
      toast({
        title: 'Reminder Sent',
        description: 'Reminder has been sent successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to send reminder.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'sent': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'gray';
      case 'medium': return 'blue';
      case 'high': return 'orange';
      case 'urgent': return 'red';
      default: return 'gray';
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment': return 'blue';
      case 'follow_up': return 'green';
      case 'medication': return 'purple';
      case 'general': return 'gray';
      default: return 'gray';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="#2BA8D1" />
          <Text>Loading reminders...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Failed to load reminders.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '100px', xl: '100px' }} px={6} maxW="1400px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={MdNotifications} boxSize={8} color="#2BA8D1" />
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold">Reminders</Text>
              <Text fontSize="sm" color="gray.600">Manage all reminders and follow-ups</Text>
            </VStack>
          </HStack>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Icon as={SettingsIcon} />}
              {...brandHover}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
          </HStack>
        </Flex>

        {/* Filters */}
        {showFilters && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="semibold">Filters</Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Search</Text>
                    <InputGroup>
                      <InputLeftElement>
                        <SearchIcon color="gray.300" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search reminders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Type</Text>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="appointment">Appointment</option>
                      <option value="follow_up">Follow-up</option>
                      <option value="medication">Medication</option>
                      <option value="general">General</option>
                    </Select>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Status</Text>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="sent">Sent</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Priority</Text>
                    <Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Start Date</Text>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold" mb={2}>End Date</Text>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Box>
                  
                  {userRole === 'superAdmin' && (
                    <>
                      <Box>
                        <Text fontWeight="semibold" mb={2}>Branch</Text>
                        <Select
                          value={branchFilter}
                          onChange={(e) => setBranchFilter(e.target.value)}
                        >
                          <option value="all">All Branches</option>
                          {branchesData?.branches?.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.branchName}</option>
                          ))}
                        </Select>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" mb={2}>Doctor</Text>
                        <Select
                          value={doctorFilter}
                          onChange={(e) => setDoctorFilter(e.target.value)}
                        >
                          <option value="all">All Doctors</option>
                          {doctors.map(doctor => (
                            <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
                          ))}
                        </Select>
                      </Box>
                    </>
                  )}
                </Grid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Reminders Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader bg={headerBg}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">
                Reminders ({data?.pagination?.totalReminders || 0})
              </Text>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Show:</Text>
                <Select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  size="sm"
                  w="80px"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Select>
              </HStack>
            </Flex>
          </CardHeader>
          
          <CardBody p={0}>
            {isLoading ? (
              <Center py={20}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="#2BA8D1" />
                  <Text color="gray.600">Loading reminders...</Text>
                </VStack>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Patient</Th>
                      <Th>Type</Th>
                      <Th>Title</Th>
                      <Th>Date & Time</Th>
                      <Th>Priority</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data?.reminders?.map((reminder) => (
                      <Tr key={reminder._id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">{reminder.patientId?.name}</Text>
                            <Text fontSize="sm" color="gray.600">{reminder.patientId?.contact}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getTypeColor(reminder.type)} variant="subtle" borderRadius="full" px={3} py={1}>
                            {reminder.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontWeight="medium">{reminder.title}</Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>{reminder.description}</Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{formatDate(reminder.reminderDate)}</Text>
                            <Text fontSize="sm" color="gray.600">{formatTime(reminder.reminderTime)}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getPriorityColor(reminder.priority)} variant="subtle" borderRadius="full" px={3} py={1}>
                            {reminder.priority.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(reminder.status)} variant="subtle" borderRadius="full" px={3} py={1}>
                            {reminder.status.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => handleViewReminder(reminder)}
                              />
                            </Tooltip>
                            {reminder.status === 'pending' && (
                              <Tooltip label="Send Reminder">
                                <IconButton
                                  icon={<BellIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="green"
                                  onClick={() => handleSendReminder(reminder._id)}
                                />
                              </Tooltip>
                            )}
                            {reminder.status === 'sent' && (
                              <Tooltip label="Mark Completed">
                                <IconButton
                                  icon={<CheckIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="green"
                                  onClick={() => handleMarkCompleted(reminder._id)}
                                />
                              </Tooltip>
                            )}
                            <Tooltip label="Delete Reminder">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteClick(reminder)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Pagination */}
        {data?.pagination && (
          <Flex justify="center" align="center" py={4}>
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<ChevronLeftIcon />}
                isDisabled={!data.pagination.hasPrev}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                {...brandHover}
              >
                Previous
              </Button>
              <Text fontSize="sm" color="gray.600">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                rightIcon={<ChevronRightIcon />}
                isDisabled={!data.pagination.hasNext}
                onClick={() => setCurrentPage(prev => prev + 1)}
                {...brandHover}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}

        {/* View Reminder Modal */}
        <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Reminder Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedReminder && (
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Patient</Text>
                      <Text fontWeight="semibold">{selectedReminder.patientId?.name}</Text>
                      <Text fontSize="sm" color="gray.600">{selectedReminder.patientId?.contact}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Doctor</Text>
                      <Text fontWeight="semibold">{selectedReminder.doctorId?.name}</Text>
                      <Text fontSize="sm" color="gray.600">{selectedReminder.doctorId?.specialization}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Type</Text>
                      <Badge colorScheme={getTypeColor(selectedReminder.type)} variant="subtle" borderRadius="full" px={3} py={1}>
                        {selectedReminder.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Priority</Text>
                      <Badge colorScheme={getPriorityColor(selectedReminder.priority)} variant="subtle" borderRadius="full" px={3} py={1}>
                        {selectedReminder.priority.toUpperCase()}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Date & Time</Text>
                      <Text fontWeight="semibold">{formatDate(selectedReminder.reminderDate)}</Text>
                      <Text fontSize="sm" color="gray.600">{formatTime(selectedReminder.reminderTime)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Status</Text>
                      <Badge colorScheme={getStatusColor(selectedReminder.status)} variant="subtle" borderRadius="full" px={3} py={1}>
                        {selectedReminder.status.toUpperCase()}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Title</Text>
                    <Text fontWeight="semibold">{selectedReminder.title}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Description</Text>
                    <Text>{selectedReminder.description}</Text>
                  </Box>
                  
                  {selectedReminder.notes && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Notes</Text>
                      <Text>{selectedReminder.notes}</Text>
                    </Box>
                  )}
                  
                  {selectedReminder.isRecurring && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Recurring</Text>
                      <Text fontWeight="semibold">{selectedReminder.recurringPattern?.toUpperCase()}</Text>
                      {selectedReminder.recurringEndDate && (
                        <Text fontSize="sm" color="gray.600">Until: {formatDate(selectedReminder.recurringEndDate)}</Text>
                      )}
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onViewModalClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Reminder</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete this reminder? 
                This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onDeleteModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default AllReminders;

