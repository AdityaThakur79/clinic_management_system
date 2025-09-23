import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, IconButton, Input, Select, Table, Tbody, Td, Th, Thead, Tr, Text,
  useColorModeValue, Card, CardBody, CardHeader, TableContainer, VStack, Divider, Badge,
  useDisclosure, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useToast, Tooltip, InputGroup, InputLeftElement, Flex, Grid, Checkbox,
  Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, SimpleGrid,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow
} from '@chakra-ui/react';
import { useListReferredDoctorsQuery, useDeleteReferredDoctorMutation } from '../../../features/api/referredDoctors';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { DeleteIcon, EditIcon, SearchIcon, AddIcon, ChevronLeftIcon, ChevronRightIcon, ViewIcon, RepeatIcon, SettingsIcon, PhoneIcon, EmailIcon, CalendarIcon, InfoIcon } from '@chakra-ui/icons';
import { MdAssignment, MdBusiness, MdPhone, MdEmail, MdAssessment } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AllReferredDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sortBy, setSortBy] = useState('totalEarningsFromReferred');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedReferredDoctors, setSelectedReferredDoctors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReferredDoctor, setSelectedReferredDoctor] = useState(null);
  const [referredDoctorToDelete, setReferredDoctorToDelete] = useState(null);
  const navigate = useNavigate();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';

  const { data, isFetching, refetch, error, isLoading } = useListReferredDoctorsQuery({ 
    page: currentPage, 
    limit: pageSize, 
    search: searchTerm,
    branchId: (userRole === 'branchAdmin' || userRole === 'doctor') ? userBranchId : (branchFilter === 'all' ? '' : branchFilter),
    sortBy,
    sortOrder,
  });
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [deleteRefDoc, { isLoading: isDeleting }] = useDeleteReferredDoctorMutation();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const toast = useToast();

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewReferredDoctor = (referredDoctor) => {
    navigate(`/admin/referred-doctors/${referredDoctor._id}/details`);
  };

  const handleDeleteClick = (referredDoctor) => {
    setReferredDoctorToDelete(referredDoctor);
    onDeleteModalOpen();
  };

  const handleDelete = async (referredDoctorId) => {
    try {
      await deleteRefDoc(referredDoctorId).unwrap();
      toast({
        title: 'Referred Doctor Deleted',
        description: 'Referred doctor has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteModalClose();
      setReferredDoctorToDelete(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete referred doctor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedReferredDoctors.map(id => 
          deleteRefDoc(id).unwrap()
        )
      );
      toast({
        title: 'Referred Doctors Deleted',
        description: `${selectedReferredDoctors.length} referred doctors have been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedReferredDoctors([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some referred doctors.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedReferredDoctors(data?.referredDoctors?.map(rd => rd._id) || []);
    } else {
      setSelectedReferredDoctors([]);
    }
  };

  // Handle individual select
  const handleSelectReferredDoctor = (referredDoctorId, checked) => {
    if (checked) {
      setSelectedReferredDoctors([...selectedReferredDoctors, referredDoctorId]);
    } else {
      setSelectedReferredDoctors(selectedReferredDoctors.filter(id => id !== referredDoctorId));
    }
  };

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive === false ? 'red' : 'green';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading referred doctors!</AlertTitle>
            <AlertDescription>
              {error?.data?.message || 'Something went wrong while loading referred doctors.'}
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
              onClick={() => navigate('/admin/referred-doctors/add')}
            >
              Add Referred Doctor
            </Button>
          </HStack>
        </Flex>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Referred Doctors</StatLabel>
                <StatNumber>{data?.pagination?.totalReferredDoctors || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Active referrals
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Patients</StatLabel>
                <StatNumber>
                  {data?.referredDoctors?.reduce((sum, doc) => sum + doc.patientsReferredCount, 0) || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Referred patients
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Earnings</StatLabel>
                <StatNumber>
                  ₹{data?.referredDoctors?.reduce((sum, doc) => sum + doc.totalEarningsFromReferred, 0) || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  From referrals
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending Amount</StatLabel>
                <StatNumber>
                  ₹{data?.referredDoctors?.reduce((sum, doc) => 
                    sum + (doc.totalEarningsFromReferred - doc.totalPaidToDoctor), 0
                  ) || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  To be paid
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

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
                    placeholder="Search referred doctors..."
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
                
                {selectedReferredDoctors.length > 0 && (
                  <Button
                    variant="danger"
                    leftIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    isLoading={isDeleting}
                  >
                    Delete Selected ({selectedReferredDoctors.length})
                  </Button>
                )}
              </HStack>

              {/* Advanced Filters */}
              {showFilters && (
                <Box>
                  <Divider mb={4} />
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
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
                    
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Status</Text>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        borderRadius="lg"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Select>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Sort By</Text>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        borderRadius="lg"
                      >
                        <option value="totalEarningsFromReferred">Total Earnings</option>
                        <option value="patientsReferredCount">Patients Referred</option>
                        <option value="createdAt">Created Date</option>
                        <option value="name">Name</option>
                        <option value="clinicName">Clinic Name</option>
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

        {/* Referred Doctors Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader bg={headerBg}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">
                Referred Doctors ({data?.total || 0})
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
                  <Text color="gray.600">Loading referred doctors...</Text>
                </VStack>
              </Center>
            ) : (data?.referredDoctors?.length || 0) === 0 ? (
              <Center py={16} px={6}>
                <Alert status="info" borderRadius="md" maxW="lg">
                  <AlertIcon />
                  <Text>No referred doctors found.</Text>
                </Alert>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          isChecked={selectedReferredDoctors.length === data?.referredDoctors?.length && data?.referredDoctors?.length > 0}
                          isIndeterminate={selectedReferredDoctors.length > 0 && selectedReferredDoctors.length < (data?.referredDoctors?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Doctor</Th>
                      <Th>Contact</Th>
                      <Th>Specialization</Th>
                      <Th>Patients</Th>
                      <Th>Earnings</Th>
                      <Th>Commission</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data?.referredDoctors?.map(rd => (
                      <Tr key={rd._id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Checkbox
                            isChecked={selectedReferredDoctors.includes(rd._id)}
                            onChange={(e) => handleSelectReferredDoctor(rd._id, e.target.checked)}
                          />
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">{rd.name}</Text>
                            <Text fontSize="sm" color="gray.600">{rd.clinicName || '-'}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            {rd.contact && (
                              <HStack>
                                <PhoneIcon boxSize={3} />
                                <Text fontSize="sm">{rd.contact}</Text>
                              </HStack>
                            )}
                            {rd.email && (
                              <HStack>
                                <EmailIcon boxSize={3} />
                                <Text fontSize="sm">{rd.email}</Text>
                              </HStack>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" noOfLines={2} maxW="150px">
                            {rd.specialization || '-'}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontWeight="semibold" color="blue.600">
                            {rd.patientsReferredCount}
                          </Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" color="green.600">
                              ₹{rd.totalEarningsFromReferred}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              Paid: ₹{rd.totalPaidToDoctor}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {rd.commissionRate}%
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(rd.isActive)}
                            variant="subtle"
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            {rd.isActive === false ? 'Inactive' : 'Active'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Analytics">
                              <IconButton
                                icon={<Icon as={MdAssessment} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="purple"
                                onClick={() => navigate(`/admin/referred-doctors/${rd._id}/analytics`)}
                              />
                            </Tooltip>
                            
                            <Tooltip label="Edit Referred Doctor">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => navigate('/admin/referred-doctors/update', { state: { referredDoctor: rd } })}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Referred Doctor">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => {
                                  setReferredDoctorToDelete(rd);
                                  onDeleteModalOpen();
                                }}
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
                          isChecked={selectedReferredDoctors.length === data?.referredDoctors?.length && data?.referredDoctors?.length > 0}
                          isIndeterminate={selectedReferredDoctors.length > 0 && selectedReferredDoctors.length < (data?.referredDoctors?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Doctor</Th>
                      <Th>Contact</Th>
                      <Th>Specialization</Th>
                      <Th>Patients</Th>
                      <Th>Earnings</Th>
                      <Th>Commission</Th>
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
        {data && data.total > pageSize && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                  {Math.min(currentPage * pageSize, data.total)} of{' '}
                  {data.total} referred doctors
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
                    {Array.from({ length: Math.ceil(data.total / pageSize) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(data.total / pageSize);
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(data.total / pageSize)))}
                    isDisabled={currentPage === Math.ceil(data.total / pageSize)}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Referred Doctor Details Drawer */}
        <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose} size="lg">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack>
                <MdAssignment size={24} color="#2BA8D1" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">{selectedReferredDoctor?.name}</Text>
                  <Badge colorScheme={selectedReferredDoctor?.isActive === false ? "red" : "green"} variant="subtle" borderRadius="full" px={3} py={1}>
                    {selectedReferredDoctor?.isActive === false ? "Inactive" : "Active"}
                  </Badge>
                </VStack>
              </HStack>
            </DrawerHeader>

            <DrawerBody px={6} py={4}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <MdAssignment size={20} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Basic Information</Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Full Name</Text>
                        <Text fontWeight="medium">{selectedReferredDoctor?.name}</Text>
                      </Box>
                      {selectedReferredDoctor?.clinicName && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Clinic Name</Text>
                          <Text fontWeight="medium">{selectedReferredDoctor.clinicName}</Text>
                        </Box>
                      )}
                      {selectedReferredDoctor?.contact && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Contact</Text>
                          <Text fontWeight="medium" color="blue.500">{selectedReferredDoctor.contact}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Statistics */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <MdBusiness size={20} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Referral Statistics</Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Patients Referred</Text>
                        <Text fontWeight="medium" color="green.600">{selectedReferredDoctor?.patientsReferredCount || 0} patients</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Total Earnings</Text>
                        <Text fontWeight="medium" color="green.600">₹{selectedReferredDoctor?.totalEarningsFromReferred || 0}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Amount Paid</Text>
                        <Text fontWeight="medium" color="blue.600">₹{selectedReferredDoctor?.totalPaidToDoctor || 0}</Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* System Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <MdAssignment size={20} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">System Information</Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Created Date</Text>
                        <Text fontWeight="medium">{selectedReferredDoctor?.createdAt && new Date(selectedReferredDoctor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Last Updated</Text>
                        <Text fontWeight="medium">{selectedReferredDoctor?.updatedAt && new Date(selectedReferredDoctor.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                      </Box>
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
                <Button variant="primary" leftIcon={<EditIcon />}
                  onClick={() => { onDrawerClose(); navigate('/admin/referred-doctors/update', { state: { referredDoctor: selectedReferredDoctor } }); }}
                  flex={1}>Edit Referred Doctor</Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Referred Doctor</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete "{referredDoctorToDelete?.name}"? 
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
                onClick={() => handleDelete(referredDoctorToDelete?._id)}
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

export default AllReferredDoctors;


