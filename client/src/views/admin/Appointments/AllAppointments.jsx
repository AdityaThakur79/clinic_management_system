import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, IconButton, Input, Select, Table, Tbody, Td, Th, Thead, Tr, Text,
  useColorModeValue, Card, CardBody, CardHeader, TableContainer, VStack, Divider, Badge,
  useDisclosure, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useToast, Tooltip, InputGroup, InputLeftElement, Flex, Grid, Checkbox,
  Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, Avatar
} from '@chakra-ui/react';
import { useGetAllAppointmentsQuery, useUpdateAppointmentStatusMutation, useDeleteAppointmentMutation } from '../../../features/api/appointments';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useGetAllDoctorsMutation } from '../../../features/api/doctor';
import { DeleteIcon, EditIcon, SearchIcon, AddIcon, ChevronLeftIcon, ChevronRightIcon, ViewIcon, RepeatIcon, SettingsIcon, PhoneIcon, EmailIcon, CalendarIcon, InfoIcon } from '@chakra-ui/icons';
import { MdAssignment, MdBusiness, MdPhone, MdEmail, MdPerson, MdSchedule } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const toast = useToast();

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
              leftIcon={<AddIcon />}
              onClick={() => navigate('/admin/appointments/create')}
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
                  _hover={{ 
                    bg: "#2BA8D1", 
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                  }}
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
                            variant={page === currentPage ? "primary" : "outline"}
                            onClick={() => setCurrentPage(page)}
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
      </VStack>
    </Box>
  );
};

export default AllAppointments;
