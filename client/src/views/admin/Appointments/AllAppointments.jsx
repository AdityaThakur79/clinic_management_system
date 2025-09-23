import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, IconButton, Input, Select, Table, Tbody, Td, Th, Thead, Tr, Text,
  useColorModeValue, Card, CardBody, CardHeader, TableContainer, VStack, Divider, Badge,
  useDisclosure, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useToast, Tooltip, InputGroup, InputLeftElement, Flex, Grid, Checkbox,
  Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, Avatar, Tabs,
  TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Textarea, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  SimpleGrid, Checkbox as ChakraCheckbox
} from '@chakra-ui/react';
import { useGetAllAppointmentsQuery, useUpdateAppointmentStatusMutation, useDeleteAppointmentMutation } from '../../../features/api/appointments';
import { useCompleteAppointmentMutation } from '../../../features/api/patientApi';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useGetAllDoctorsMutation } from '../../../features/api/doctor';
import { DeleteIcon, EditIcon, SearchIcon, AddIcon, ChevronLeftIcon, ChevronRightIcon, ViewIcon, RepeatIcon, SettingsIcon, PhoneIcon, EmailIcon, CalendarIcon, InfoIcon, CheckIcon, ReceiptIcon } from '@chakra-ui/icons';
import { FaPen } from 'react-icons/fa';
import { MdAssignment, MdBusiness, MdPhone, MdEmail, MdPerson, MdSchedule } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaReceipt } from 'react-icons/fa';

const AllAppointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [appointmentToComplete, setAppointmentToComplete] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    symptoms: [],
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    treatment: '',
    followUpRequired: false,
    followUpDate: '',
    doctorNotes: '',
    patientInstructions: ''
  });
  const [billForm, setBillForm] = useState({
    consultationFee: 0,
    treatmentFee: 0,
    medicineFee: 0,
    otherCharges: 0,
    discount: 0,
    tax: 0,
    paymentMethod: 'cash',
    notes: ''
  });
  const navigate = useNavigate();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';
  const userDoctorId = user?.role === 'doctor' ? user?._id : '';

  // API hooks
  const { data, isFetching, refetch, error, isLoading } = useGetAllAppointmentsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    branchId: (userRole === 'branchAdmin' || userRole === 'doctor') ? userBranchId : (branchFilter === 'all' ? '' : branchFilter),
    doctorId: userRole === 'doctor' ? userDoctorId : (doctorFilter === 'all' ? '' : doctorFilter),
    status: statusFilter === 'all' ? '' : statusFilter,
    date: dateFilter,
    sortBy,
    sortOrder,
  });

  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [getAllDoctors] = useGetAllDoctorsMutation();
  const [updateAppointmentStatus] = useUpdateAppointmentStatusMutation();
  const [deleteAppointment, { isLoading: isDeleting }] = useDeleteAppointmentMutation();
  const [completeAppointment] = useCompleteAppointmentMutation();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isCompleteModalOpen, onOpen: onCompleteModalOpen, onClose: onCompleteModalClose } = useDisclosure();
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

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    onDrawerOpen();
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    onDeleteModalOpen();
  };

  const handleCompleteAppointment = (appointment) => {
    navigate(`/admin/appointments/${appointment._id}/enhanced-complete`);
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment(appointmentToDelete._id).unwrap();
      toast({
        title: 'Appointment Deleted',
        description: 'Appointment has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteModalClose();
      setAppointmentToDelete(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete appointment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus({ id: appointmentId, status: newStatus }).unwrap();
      toast({
        title: 'Status Updated',
        description: 'Appointment status has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update appointment status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedAppointments(data?.appointments?.map(apt => apt._id) || []);
    } else {
      setSelectedAppointments([]);
    }
  };

  // Handle individual select
  const handleSelectAppointment = (appointmentId, checked) => {
    if (checked) {
      setSelectedAppointments([...selectedAppointments, appointmentId]);
    } else {
      setSelectedAppointments(selectedAppointments.filter(id => id !== appointmentId));
    }
  };

  // Form handlers for complete appointment
  const handlePrescriptionChange = (field, value) => {
    setPrescriptionForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBillChange = (field, value) => {
    setBillForm(prev => ({ ...prev, [field]: value }));
  };

  const addMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedicine = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const updateMedicine = (index, field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((medicine, i) => 
        i === index ? { ...medicine, [field]: value } : medicine
      )
    }));
  };

  const handleCompleteAppointmentSubmit = async () => {
    try {
      await completeAppointment({
        appointmentId: appointmentToComplete._id,
        prescription: prescriptionForm,
        bill: billForm
      }).unwrap();
      
      toast({
        title: 'Appointment Completed',
        description: 'Appointment has been completed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onCompleteModalClose();
      setAppointmentToComplete(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to complete appointment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeSlot) => {
    if (!timeSlot) return '-';
    return timeSlot;
  };

  // Format amount (Rs) with Indian grouping
  const formatAmount = (value) => {
    const num = Number(value || 0);
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
    return `Rs ${formatted}`;
  };

  if (error) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading appointments!</AlertTitle>
            <AlertDescription>
              {error?.data?.message || 'Something went wrong while loading appointments.'}
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={3}>
            <Button
              variant="outline"
              leftIcon={<RepeatIcon />}
              onClick={() => refetch()}
              isLoading={isFetching}
              {...brandHover}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<AddIcon />}
              onClick={() => navigate('/admin/appointments/create')}
              {...brandPrimary}
            >
              Add Appointment
            </Button>
          </HStack>
        </Flex>

        {/* Search and Filters */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Search Bar */}
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    borderRadius="lg"
                  />
                </InputGroup>
                
                <Button
                  variant="outline"
                  leftIcon={<SettingsIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  {...brandHover}
                >
                  Filters
                </Button>
              </HStack>

              {/* Advanced Filters */}
              {showFilters && (
                <Box>
                  <Divider mb={4} />
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Status</Text>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        borderRadius="lg"
                      >
                        <option value="all">All Status</option>
                        <option value="booked">Booked</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Select>
                    </Box>
                    
                    {userRole === 'superAdmin' && (
                      <Box>
                        <Text fontWeight="semibold" mb={2}>Branch</Text>
                        <Select
                          value={branchFilter}
                          onChange={(e) => setBranchFilter(e.target.value)}
                          borderRadius="lg"
                        >
                          <option value="all">All Branches</option>
                          {branchesData?.branches?.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.branchName}</option>
                          ))}
                        </Select>
                      </Box>
                    )}

                    {userRole === 'superAdmin' && (
                      <Box>
                        <Text fontWeight="semibold" mb={2}>Doctor</Text>
                        <Select
                          value={doctorFilter}
                          onChange={(e) => setDoctorFilter(e.target.value)}
                          borderRadius="lg"
                        >
                          <option value="all">All Doctors</option>
                          {doctors.map(doctor => (
                            <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
                          ))}
                        </Select>
                      </Box>
                    )}

                    <Box>
                      <Text fontWeight="semibold" mb={2}>Date</Text>
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        borderRadius="lg"
                      />
                    </Box>
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mt={4}>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Sort By</Text>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        borderRadius="lg"
                      >
                        <option value="createdAt">Created Date</option>
                        <option value="date">Appointment Date</option>
                        <option value="timeSlot">Time Slot</option>
                        <option value="status">Status</option>
                      </Select>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Order</Text>
                      <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        borderRadius="lg"
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </Select>
                    </Box>
                  </Grid>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Appointments Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader bg={headerBg}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">
                Appointments ({data?.pagination?.totalAppointments || 0})
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
                  <Text color="gray.600">Loading appointments...</Text>
                </VStack>
              </Center>
            ) : (data?.appointments?.length || 0) === 0 ? (
              <Center py={20}>
                <VStack spacing={3}>
                  <Icon as={MdSchedule} w={12} h={12} color="gray.400" />
                  <Text color="gray.600">No appointments found.</Text>
                </VStack>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          isChecked={selectedAppointments.length === data?.appointments?.length && data?.appointments?.length > 0}
                          isIndeterminate={selectedAppointments.length > 0 && selectedAppointments.length < (data?.appointments?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Patient</Th>
                      <Th>Doctor</Th>
                      <Th>Branch</Th>
                      <Th>Date & Time</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data?.appointments?.map(appointment => (
                      <Tr key={appointment._id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Checkbox
                            isChecked={selectedAppointments.includes(appointment._id)}
                            onChange={(e) => handleSelectAppointment(appointment._id, e.target.checked)}
                          />
                        </Td>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={appointment.patientId?.name} bg="#2BA8D1" color="white" />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">{appointment.patientId?.name || '-'}</Text>
                              <Text fontSize="sm" color="gray.600">{appointment.patientId?.contact || '-'}</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{appointment.doctorId?.name || '-'}</Text>
                            <Text fontSize="sm" color="gray.600">{appointment.doctorId?.specialization || '-'}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" noOfLines={2} maxW="150px">
                            {appointment.branchId?.branchName || '-'}
                          </Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">{formatDate(appointment.date)}</Text>
                            <Text fontSize="sm" color="gray.600">{formatTime(appointment.timeSlot)}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Select
                            value={appointment.status}
                            onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                            size="sm"
                            w="120px"
                            colorScheme={getStatusColor(appointment.status)}
                          >
                            <option value="booked">Booked</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </Select>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            {appointment.status === 'booked' && (
                              <Tooltip label="Complete Appointment">
                                <IconButton
                                  icon={<CheckIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="green"
                                  onClick={() => handleCompleteAppointment(appointment)}
                                />
                              </Tooltip>
                            )}
                            {appointment.status === 'completed' && (
                              <Tooltip label="View Bill">
                                <IconButton
                                  icon={<FaReceipt />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="purple"
                                  onClick={() => navigate(`/admin/appointments/${appointment._id}/bill`)}
                                />
                              </Tooltip>
                            )}
                            {appointment.status === 'completed' && (
                              <Tooltip label="Edit Completed Appointment">
                                <IconButton
                                  icon={<FaPen />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="orange"
                                  onClick={() => navigate(`/admin/appointments/${appointment._id}/enhanced-complete?edit=true`)}
                                />
                              </Tooltip>
                            )}
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => handleViewAppointment(appointment)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Appointment">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteClick(appointment)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          isChecked={selectedAppointments.length === data?.appointments?.length && data?.appointments?.length > 0}
                          isIndeterminate={selectedAppointments.length > 0 && selectedAppointments.length < (data?.appointments?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Patient</Th>
                      <Th>Doctor</Th>
                      <Th>Branch</Th>
                      <Th>Date & Time</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Pagination */}
        {data && data.pagination?.totalAppointments > pageSize && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                  {Math.min(currentPage * pageSize, data.pagination.totalAppointments)} of{' '}
                  {data.pagination.totalAppointments} appointments
                </Text>
                
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ChevronLeftIcon />}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    isDisabled={currentPage === 1}
                    {...brandHover}
                  >
                    Previous
                  </Button>
                  
                  <HStack spacing={1}>
                    {Array.from({ length: Math.ceil(data.pagination.totalAppointments / pageSize) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(data.pagination.totalAppointments / pageSize);
                        return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && <Text>...</Text>}
                          <Button
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            {...(page === currentPage ? brandPrimary : brandHover)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))
                    }
                  </HStack>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<ChevronRightIcon />}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(data.pagination.totalAppointments / pageSize)))}
                    isDisabled={currentPage === Math.ceil(data.pagination.totalAppointments / pageSize)}
                    {...brandHover}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Appointment Details Drawer */}
        <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose} size="lg">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack>
                <MdSchedule size={24} color="#2BA8D1" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">Appointment Details</Text>
                  <Badge colorScheme={getStatusColor(selectedAppointment?.status)} variant="subtle" borderRadius="full" px={3} py={1}>
                    {selectedAppointment?.status}
                  </Badge>
                </VStack>
              </HStack>
            </DrawerHeader>

            <DrawerBody px={6} py={4}>
              <VStack spacing={6} align="stretch">
                {/* Patient Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={MdPerson} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Patient Information</Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Name</Text>
                        <Text fontWeight="medium">{selectedAppointment?.patientId?.name || '-'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Age & Gender</Text>
                        <Text fontWeight="medium">
                          {selectedAppointment?.patientId?.age || '-'} years, {selectedAppointment?.patientId?.gender || '-'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Contact</Text>
                        <Text fontWeight="medium" color="blue.500">{selectedAppointment?.patientId?.contact || '-'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Email</Text>
                        <Text fontWeight="medium" color="blue.500">{selectedAppointment?.patientId?.email || '-'}</Text>
                      </Box>
                      {selectedAppointment?.patientId?.address && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Address</Text>
                          <Text fontWeight="medium">{selectedAppointment?.patientId?.address}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Appointment Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={MdSchedule} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Appointment Details</Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Doctor</Text>
                        <Text fontWeight="medium">{selectedAppointment?.doctorId?.name || '-'}</Text>
                        <Text fontSize="sm" color="gray.600">{selectedAppointment?.doctorId?.specialization || '-'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Branch</Text>
                        <Text fontWeight="medium">{selectedAppointment?.branchId?.branchName || '-'}</Text>
                        <Text fontSize="sm" color="gray.600">{selectedAppointment?.branchId?.address || '-'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Date & Time</Text>
                        <Text fontWeight="medium">{formatDate(selectedAppointment?.date)} at {formatTime(selectedAppointment?.timeSlot)}</Text>
                      </Box>
                      {selectedAppointment?.reason && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Reason</Text>
                          <Text fontWeight="medium">{selectedAppointment?.reason}</Text>
                        </Box>
                      )}
                      {selectedAppointment?.notes && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Notes</Text>
                          <Text fontWeight="medium">{selectedAppointment?.notes}</Text>
                        </Box>
                      )}
                      {selectedAppointment?.referredDoctorId && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Referred By</Text>
                          <Text fontWeight="medium">{selectedAppointment.referredDoctorId.name}</Text>
                          <Text fontSize="sm" color="gray.600">{selectedAppointment.referredDoctorId.clinicName || '-'}</Text>
                        </Box>
                      )}
                      {selectedAppointment?.notes && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Notes</Text>
                          <Text fontWeight="medium">{selectedAppointment.notes}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </DrawerBody>

            <DrawerFooter borderTopWidth="1px">
              <HStack spacing={3} w="full">
                <Button variant="outline" onClick={onDrawerClose} flex={1} _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}>Close</Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Appointment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete this appointment? 
                This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onDeleteModalClose} _hover={{ 
                bg: "#2BA8D1", 
                color: "white",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
              }}>Cancel</Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Complete Appointment Modal */}
        <Modal isOpen={isCompleteModalOpen} onClose={onCompleteModalClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Complete Appointment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs>
                <TabList>
                  <Tab>Prescription</Tab>
                  <Tab>Billing</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Prescription Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Diagnosis</FormLabel>
                        <Input
                          value={prescriptionForm.diagnosis}
                          onChange={(e) => handlePrescriptionChange('diagnosis', e.target.value)}
                          placeholder="Enter diagnosis"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Treatment</FormLabel>
                        <Textarea
                          value={prescriptionForm.treatment}
                          onChange={(e) => handlePrescriptionChange('treatment', e.target.value)}
                          placeholder="Enter treatment details"
                          rows={3}
                        />
                      </FormControl>
                      
                      <Box>
                        <HStack justify="space-between" mb={3}>
                          <Text fontWeight="semibold">Medicines</Text>
                          <Button size="sm" onClick={addMedicine}>Add Medicine</Button>
                        </HStack>
                        <VStack spacing={3}>
                          {prescriptionForm.medicines.map((medicine, index) => (
                            <Card key={index}>
                              <CardBody>
                                <SimpleGrid columns={2} spacing={3}>
                                  <FormControl>
                                    <FormLabel>Medicine Name</FormLabel>
                                    <Input
                                      value={medicine.name}
                                      onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                      placeholder="Medicine name"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel>Dosage</FormLabel>
                                    <Input
                                      value={medicine.dosage}
                                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                      placeholder="e.g., 500mg"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel>Frequency</FormLabel>
                                    <Input
                                      value={medicine.frequency}
                                      onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                      placeholder="e.g., 3 times daily"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel>Duration</FormLabel>
                                    <Input
                                      value={medicine.duration}
                                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                      placeholder="e.g., 7 days"
                                    />
                                  </FormControl>
                                </SimpleGrid>
                                <FormControl mt={3}>
                                  <FormLabel>Instructions</FormLabel>
                                  <Textarea
                                    value={medicine.instructions}
                                    onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                    placeholder="Special instructions"
                                    rows={2}
                                  />
                                </FormControl>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => removeMedicine(index)}
                                  mt={2}
                                >
                                  Remove
                                </Button>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      </Box>
                      
                      <ChakraCheckbox
                        isChecked={prescriptionForm.followUpRequired}
                        onChange={(e) => handlePrescriptionChange('followUpRequired', e.target.checked)}
                      >
                        Follow-up required
                      </ChakraCheckbox>
                      
                      {prescriptionForm.followUpRequired && (
                        <FormControl>
                          <FormLabel>Follow-up Date</FormLabel>
                          <Input
                            type="date"
                            value={prescriptionForm.followUpDate}
                            onChange={(e) => handlePrescriptionChange('followUpDate', e.target.value)}
                          />
                        </FormControl>
                      )}
                      
                      <FormControl>
                        <FormLabel>Doctor Notes</FormLabel>
                        <Textarea
                          value={prescriptionForm.doctorNotes}
                          onChange={(e) => handlePrescriptionChange('doctorNotes', e.target.value)}
                          placeholder="Additional notes"
                          rows={3}
                        />
                      </FormControl>
                    </VStack>
                  </TabPanel>
                  
                  {/* Billing Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                          <FormLabel>Consultation Fee</FormLabel>
                          <NumberInput
                            value={billForm.consultationFee}
                            onChange={(value) => handleBillChange('consultationFee', value)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Treatment Fee</FormLabel>
                          <NumberInput
                            value={billForm.treatmentFee}
                            onChange={(value) => handleBillChange('treatmentFee', value)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Medicine Fee</FormLabel>
                          <NumberInput
                            value={billForm.medicineFee}
                            onChange={(value) => handleBillChange('medicineFee', value)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Other Charges</FormLabel>
                          <NumberInput
                            value={billForm.otherCharges}
                            onChange={(value) => handleBillChange('otherCharges', value)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Discount</FormLabel>
                          <NumberInput
                            value={billForm.discount}
                            onChange={(value) => handleBillChange('discount', value)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Tax</FormLabel>
                          <NumberInput
                            value={billForm.tax}
                            onChange={(value) => handleBillChange('tax', value)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          value={billForm.paymentMethod}
                          onChange={(e) => handleBillChange('paymentMethod', e.target.value)}
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="netbanking">Net Banking</option>
                          <option value="wallet">Wallet</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          value={billForm.notes}
                          onChange={(e) => handleBillChange('notes', e.target.value)}
                          placeholder="Billing notes"
                          rows={3}
                        />
                      </FormControl>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onCompleteModalClose}>
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleCompleteAppointmentSubmit}>
                Complete Appointment
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default AllAppointments;
