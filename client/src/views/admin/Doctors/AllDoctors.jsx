import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardBody, CardHeader, Flex, Grid, HStack, Input, InputGroup,
  InputLeftElement, Select, Table, Thead, Tbody, Tr, Th, Td, Text, Badge, IconButton,
  useDisclosure, useToast, Spinner, Center, VStack, Divider, Checkbox, Tooltip,
  Alert, AlertIcon, AlertTitle, AlertDescription, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useColorModeValue, TableContainer,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, Avatar, Icon
} from '@chakra-ui/react';
import {
  SearchIcon, AddIcon, EditIcon, DeleteIcon, ViewIcon, RepeatIcon,
  ChevronLeftIcon, ChevronRightIcon, SettingsIcon, CalendarIcon, InfoIcon,
  TimeIcon, StarIcon, PhoneIcon, EmailIcon
} from '@chakra-ui/icons';
import { MdBusiness } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetAllDoctorsMutation,
  useDeleteDoctorMutation
} from '../../../features/api/doctor';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useSelector } from 'react-redux';

const AllDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // RTK Query hooks
  const [getAllDoctors] = useGetAllDoctorsMutation();
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();

  // Branches for filter
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch doctors
  // Pull current user to restrict by branch when needed
  const user = useSelector((s) => s.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllDoctors({
        page: currentPage,
        limit: pageSize,
        q: searchTerm,
        // For branchAdmin/doctor, always restrict to their own branch
        branch:
          (userRole === 'branchAdmin' || userRole === 'doctor')
            ? userBranchId
            : (branchFilter === 'all' ? '' : branchFilter),
        status: statusFilter === 'all' ? '' : (statusFilter === 'active' ? 'true' : 'false'),
        sortBy,
        sortOrder,
      }).unwrap();

      setDoctors(result.doctors || []);
      setPagination(result.pagination || {});
    } catch (err) {
      setError(err);
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchDoctors();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, branchFilter, statusFilter, sortBy, sortOrder]);

  // Fetch on mount and page changes
  useEffect(() => {
    fetchDoctors();
  }, [currentPage, pageSize]);

  // Handlers
  const handleViewDoctor = (doctor) => {
    console.log('Selected doctor data:', doctor);
    console.log('Available time slots:', doctor?.availableTimeSlots);
    console.log('Available time slots type:', typeof doctor?.availableTimeSlots);
    if (doctor?.availableTimeSlots) {
      Object.entries(doctor.availableTimeSlots).forEach(([day, slots]) => {
        console.log(`${day}:`, slots, 'Type:', typeof slots, 'Is Array:', Array.isArray(slots));
      });
    }
    setSelectedDoctor(doctor);
    onDrawerOpen();
  };

  const handleDelete = async (doctorId) => {
    try {
      await deleteDoctor({ id: doctorId }).unwrap();
      toast({
        title: 'Doctor Deleted',
        description: 'Doctor has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setDoctorToDelete(null);
      fetchDoctors();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete doctor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedDoctors.map(id => deleteDoctor({ id }).unwrap())
      );
      toast({
        title: 'Doctors Deleted',
        description: `${selectedDoctors.length} doctors deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedDoctors([]);
      fetchDoctors();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete some doctors.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDoctors(doctors?.map(d => d._id) || []);
    } else {
      setSelectedDoctors([]);
    }
  };

  const handleSelectDoctor = (id, checked) => {
    if (checked) setSelectedDoctors([...selectedDoctors, id]);
    else setSelectedDoctors(selectedDoctors.filter(d => d !== id));
  };

  // Helpers
  const getStatusInfo = (status) => {
    if (status === true || status === 'active') return { color: 'green', text: 'Active' };
    if (status === false || status === 'inactive') return { color: 'red', text: 'Inactive' };
    return { color: 'gray', text: 'Unknown' };
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (error) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading doctors!</AlertTitle>
            <AlertDescription>
              {error?.data?.message || 'Something went wrong while loading doctors.'}
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
            <Button variant="outline" leftIcon={<RepeatIcon />} onClick={fetchDoctors} isLoading={isLoading}  _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}>
              Refresh
            </Button>
            <Button variant="primary" leftIcon={<AddIcon />} as={Link} to="/admin/doctors/add">
              Add Doctor
            </Button>
          </HStack>
        </Flex>

        {/* Search & Filters */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none"><SearchIcon color="gray.300" /></InputLeftElement>
                  <Input placeholder="Search doctors..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} borderRadius="lg" />
                </InputGroup>
                <Button variant="outline" leftIcon={<SettingsIcon />} onClick={() => setShowFilters(!showFilters)}  _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}>
                  Filters
                </Button>
                {selectedDoctors.length > 0 && (
                  <Button variant="danger" leftIcon={<DeleteIcon />} onClick={handleBulkDelete} isLoading={isDeleting}>
                    Delete Selected ({selectedDoctors.length})
                  </Button>
                )}
              </HStack>

              {showFilters && (
                <Box>
                  <Divider mb={4} />
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Branch</Text>
                      <Select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} borderRadius="lg">
                        <option value="all">All Branches</option>
                        {branchesData?.branches?.map(b => (
                          <option key={b._id} value={b._id}>{b.branchName}</option>
                        ))}
                      </Select>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Status</Text>
                      <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} borderRadius="lg">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Select>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Sort By</Text>
                      <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} borderRadius="lg">
                        <option value="createdAt">Created Date</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="status">Status</option>
                      </Select>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Order</Text>
                      <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} borderRadius="lg">
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

        {/* Doctors Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader bg={headerBg}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">Doctors ({pagination.totalDoctors || 0})</Text>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Show:</Text>
                <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
                  size="sm" w="80px">
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
              <Center py={20}><VStack spacing={4}><Spinner size="xl" color="#2BA8D1" />
                <Text color="gray.600">Loading doctors...</Text></VStack></Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th><Checkbox isChecked={selectedDoctors.length === doctors?.length && doctors?.length > 0}
                        isIndeterminate={selectedDoctors.length > 0 && selectedDoctors.length < (doctors?.length || 0)}
                        onChange={(e) => handleSelectAll(e.target.checked)} /></Th>
                      <Th>Doctor</Th>
                      <Th>Branch</Th>
                      <Th>Specialization</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {doctors?.map((doc) => (
                      <Tr key={doc._id} _hover={{ bg: 'gray.50' }}>
                        <Td><Checkbox isChecked={selectedDoctors.includes(doc._id)}
                          onChange={(e) => handleSelectDoctor(doc._id, e.target.checked)} /></Td>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" src={doc.photoUrl} name={doc.name} bg="#2BA8D1" color="white" />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">{doc.name}</Text>
                              <Text fontSize="sm" color="gray.600">{doc.email}</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>{doc.branch?.branchName || 'N/A'}</Td>
                        <Td>{doc.specialization || 'N/A'}</Td>
                        <Td>
                          <Badge colorScheme={getStatusInfo(doc.status).color} variant="subtle" borderRadius="full" px={3} py={1}>
                            {getStatusInfo(doc.status).text}
                          </Badge>
                        </Td>
                        <Td><Text fontSize="sm" color="gray.600">{formatDate(doc.createdAt)}</Text></Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Details">
                              <IconButton icon={<ViewIcon />} size="sm" variant="ghost" colorScheme="blue"
                                onClick={() => handleViewDoctor(doc)} />
                            </Tooltip>
                            <Tooltip label="Edit Doctor">
                              <IconButton icon={<EditIcon />} size="sm" variant="ghost" colorScheme="green"
                                onClick={() => navigate(`/admin/doctors/update`, { state: { doctorId: doc._id } })} />
                            </Tooltip>
                            <Tooltip label="Delete Doctor">
                              <IconButton icon={<DeleteIcon />} size="sm" variant="ghost" colorScheme="red"
                                onClick={() => { setDoctorToDelete(doc); onOpen(); }} />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                  <Thead>
                    <Tr>
                      <Th><Checkbox isChecked={selectedDoctors.length === doctors?.length && doctors?.length > 0}
                        isIndeterminate={selectedDoctors.length > 0 && selectedDoctors.length < (doctors?.length || 0)}
                        onChange={(e) => handleSelectAll(e.target.checked)} /></Th>
                      <Th>Doctor</Th>
                      <Th>Branch</Th>
                      <Th>Specialization</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                </Table>
              </TableContainer>
            )}
          </CardBody>

          
        </Card>

        {/* Pagination */}
        {pagination && pagination.totalDoctors > pageSize && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                  {Math.min(currentPage * pageSize, pagination.totalDoctors)} of{' '}
                  {pagination.totalDoctors} doctors
                </Text>
                <HStack spacing={2}>
                  <Button size="sm" variant="outline" leftIcon={<ChevronLeftIcon />}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    isDisabled={currentPage === 1}>Previous</Button>
                  <HStack spacing={1}>
                    {Array.from({ length: Math.ceil(pagination.totalDoctors / pageSize) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(pagination.totalDoctors / pageSize);
                        return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && <Text>...</Text>}
                          <Button size="sm" variant={page === currentPage ? "primary" : "outline"}
                            onClick={() => setCurrentPage(page)}>{page}</Button>
                        </React.Fragment>
                      ))}
                  </HStack>
                  <Button size="sm" variant="outline" rightIcon={<ChevronRightIcon />}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(pagination.totalDoctors / pageSize)))}
                    isDisabled={currentPage === Math.ceil(pagination.totalDoctors / pageSize)}>Next</Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Doctor</ModalHeader>
            <ModalCloseButton />
            <ModalBody><Text>Are you sure you want to delete "{doctorToDelete?.name}"? This action cannot be undone.</Text></ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onClose}  _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(doctorToDelete?._id)} isLoading={isDeleting}>Delete</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Doctor Details Drawer */}
        <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose} size="lg">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack>
                <Avatar size="md" src={selectedDoctor?.photoUrl} name={selectedDoctor?.name} bg="#2BA8D1" color="white" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">{selectedDoctor?.name}</Text>
                  <Badge colorScheme={getStatusInfo(selectedDoctor?.status).color} variant="subtle" borderRadius="full" px={3} py={1}>
                    {getStatusInfo(selectedDoctor?.status).text}
                  </Badge>
                </VStack>
              </HStack>
            </DrawerHeader>

            <DrawerBody px={6} py={4}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack><Icon as={InfoIcon} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Basic Information</Text></HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box><Text fontSize="sm" color="gray.600" mb={1}>Full Name</Text>
                        <Text fontWeight="medium">{selectedDoctor?.name}</Text></Box>
                      <Box><Text fontSize="sm" color="gray.600" mb={1}>Email Address</Text>
                        <Text fontWeight="medium" color="blue.500">{selectedDoctor?.email}</Text></Box>
                      <Box><Text fontSize="sm" color="gray.600" mb={1}>Phone Number</Text>
                        <Text fontWeight="medium">{selectedDoctor?.phone || 'Not provided'}</Text></Box>
                      {selectedDoctor?.specialization && (
                        <Box><Text fontSize="sm" color="gray.600" mb={1}>Specialization</Text>
                          <Text fontWeight="medium">{selectedDoctor.specialization}</Text></Box>
                      )}
                      {selectedDoctor?.degree && (
                        <Box><Text fontSize="sm" color="gray.600" mb={1}>Degree</Text>
                          <Text fontWeight="medium">{selectedDoctor.degree}</Text></Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Professional Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack><Icon as={StarIcon} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Professional Information</Text></HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      {selectedDoctor?.yearsOfExperience && (
                        <Box><Text fontSize="sm" color="gray.600" mb={1}>Years of Experience</Text>
                          <Text fontWeight="medium">{selectedDoctor.yearsOfExperience} years</Text></Box>
                      )}
                      {selectedDoctor?.education && (
                        <Box><Text fontSize="sm" color="gray.600" mb={1}>Education</Text>
                          <Text fontWeight="medium">{selectedDoctor.education}</Text></Box>
                      )}
                      {selectedDoctor?.perSessionCharge && (
                        <Box><Text fontSize="sm" color="gray.600" mb={1}>Session Charge</Text>
                          <Text fontWeight="medium" color="green.600">₹{selectedDoctor.perSessionCharge} per session</Text></Box>
                      )}
                      {selectedDoctor?.consultationTime && (
                        <Box><Text fontSize="sm" color="gray.600" mb={1}>Consultation Time</Text>
                          <Text fontWeight="medium">{selectedDoctor.consultationTime} minutes</Text></Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Bio */}
                {selectedDoctor?.bio && (
                  <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                    <CardHeader pb={3}>
                      <HStack><Icon as={InfoIcon} w={5} h={5} color="#2BA8D1" />
                        <Text fontWeight="semibold" fontSize="lg">Bio</Text></HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                        {selectedDoctor.bio}
                      </Text>
                    </CardBody>
                  </Card>
                )}

                {/* Languages */}
                {selectedDoctor?.languages && selectedDoctor.languages.length > 0 && (
                  <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                    <CardHeader pb={3}>
                      <HStack><Icon as={TimeIcon} w={5} h={5} color="#2BA8D1" />
                        <Text fontWeight="semibold" fontSize="lg">Languages Spoken</Text></HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      <HStack spacing={2} wrap="wrap">
                        {selectedDoctor.languages.map((language, index) => (
                          <Badge key={index} colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                            {language}
                          </Badge>
                        ))}
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                {/* Availability */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack><Icon as={CalendarIcon} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Availability</Text></HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      {/* Available Days */}
                      {selectedDoctor?.availableDays && selectedDoctor.availableDays.length > 0 && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={2}>Available Days</Text>
                          <HStack spacing={2} wrap="wrap">
                            {selectedDoctor.availableDays.map((day, index) => (
                              <Badge key={index} colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                                {day}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>
                      )}

                      {/* Time Slots */}
                      {selectedDoctor?.availableTimeSlots && Object.keys(selectedDoctor.availableTimeSlots).length > 0 && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={2}>Time Slots</Text>
                          <VStack spacing={2} align="stretch">
                            {Object.entries(selectedDoctor.availableTimeSlots).map(([day, slots]) => {
                              // Handle different data formats
                              let slotsArray = [];
                              
                              if (Array.isArray(slots)) {
                                slotsArray = slots;
                              } else if (typeof slots === 'string') {
                                // If it's a JSON string, try to parse it
                                try {
                                  const parsed = JSON.parse(slots);
                                  slotsArray = Array.isArray(parsed) ? parsed : [];
                                } catch {
                                  // If parsing fails, treat as single slot
                                  slotsArray = [slots];
                                }
                              } else if (slots && typeof slots === 'object') {
                                // If it's an object, try to convert to array
                                slotsArray = Object.values(slots);
                              }
                              
                              // Filter out MongoDB ObjectIds and invalid data
                              const validSlots = slotsArray.filter(slot => {
                                if (typeof slot === 'string') {
                                  // Check if it's a MongoDB ObjectId (24 character hex string)
                                  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slot);
                                  if (isObjectId) {
                                    console.log(`Filtered out ObjectId: ${slot} for day: ${day}`);
                                    return false;
                                  }
                                  // Check if it's a valid time format (basic check)
                                  const isTimeFormat = /^(\d{1,2}:\d{2}|\d{1,2}:\d{2}\s*(AM|PM|am|pm))/.test(slot);
                                  if (!isTimeFormat && slot.length > 10) {
                                    console.log(`Filtered out non-time string: ${slot} for day: ${day}`);
                                    return false;
                                  }
                                  return true;
                                }
                                return true;
                              });
                              
                              console.log(`Day: ${day}, Original slots:`, slotsArray, 'Valid slots:', validSlots);
                              
                              return (
                                <Box key={day} p={3} bg="gray.50" borderRadius="md">
                                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
                                    {day}
                                  </Text>
                                  <HStack spacing={2} wrap="wrap">
                                    {validSlots.length > 0 ? (
                                      validSlots.map((slot, index) => (
                                        <Badge key={index} colorScheme="blue" variant="outline" px={2} py={1} borderRadius="md">
                                          {slot}
                                        </Badge>
                                      ))
                                    ) : (
                                      <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                        No time slots available
                                      </Text>
                                    )}
                                  </HStack>
                                </Box>
                              );
                            })}
                          </VStack>
                        </Box>
                      )}

                      {/* Status */}
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Current Status</Text>
                        <Badge colorScheme={getStatusInfo(selectedDoctor?.status).color} variant="subtle" borderRadius="full" px={3} py={1}>
                          {getStatusInfo(selectedDoctor?.status).text}
                        </Badge>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Branch Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack><Icon as={MdBusiness} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Branch Information</Text></HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Assigned Branch</Text>
                      <Text fontWeight="medium">{selectedDoctor?.branch?.branchName || 'Not assigned'}</Text>
                      {selectedDoctor?.branch?.address && (
                        <Text fontSize="sm" color="gray.500" mt={1}>{selectedDoctor.branch.address}</Text>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                {/* System Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack><Icon as={InfoIcon} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">System Information</Text></HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box><Text fontSize="sm" color="gray.600" mb={1}>Created Date</Text>
                        <Text fontWeight="medium">{selectedDoctor?.createdAt && formatDate(selectedDoctor.createdAt)}</Text></Box>
                      <Box><Text fontSize="sm" color="gray.600" mb={1}>Last Updated</Text>
                        <Text fontWeight="medium">{selectedDoctor?.updatedAt && formatDate(selectedDoctor.updatedAt)}</Text></Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </DrawerBody>

            <DrawerFooter borderTopWidth="1px">
              <HStack spacing={3} w="full">
                <Button variant="outline" onClick={onDrawerClose} flex={1}  _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}>Close</Button>
                <Button variant="primary" leftIcon={<EditIcon />}
                  onClick={() => { onDrawerClose(); navigate(`/admin/doctors/update`, { state: { doctorId: selectedDoctor?._id } }); }}
                  flex={1}>Edit Doctor</Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </VStack>
    </Box>
  );
};

export default AllDoctors;
