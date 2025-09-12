import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, IconButton, Input, Select, Table, Tbody, Td, Th, Thead, Tr, Text,
  useColorModeValue, Card, CardBody, CardHeader, TableContainer, VStack, Divider, Badge,
  useDisclosure, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useToast, Tooltip, InputGroup, InputLeftElement, Flex, Grid, Checkbox,
  Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, Avatar
} from '@chakra-ui/react';
import { useGetAllPatientsQuery, useDeletePatientMutation } from '../../../features/api/patients';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { DeleteIcon, EditIcon, SearchIcon, AddIcon, ChevronLeftIcon, ChevronRightIcon, ViewIcon, RepeatIcon, SettingsIcon, PhoneIcon, EmailIcon, CalendarIcon, InfoIcon } from '@chakra-ui/icons';
import { MdPerson, MdBusiness, MdPhone, MdEmail, MdLocationOn } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AllPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const navigate = useNavigate();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';

  // API hooks
  const { data, isFetching, refetch, error, isLoading } = useGetAllPatientsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    branchId: (userRole === 'branchAdmin' || userRole === 'doctor') ? userBranchId : (branchFilter === 'all' ? '' : branchFilter),
    sortBy,
    sortOrder,
  });

  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation();

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

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    onDrawerOpen();
  };

  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    onDeleteModalOpen();
  };

  const handleDelete = async () => {
    try {
      await deletePatient(patientToDelete._id).unwrap();
      toast({
        title: 'Patient Deleted',
        description: 'Patient has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteModalClose();
      setPatientToDelete(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete patient.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPatients(data?.patients?.map(patient => patient._id) || []);
    } else {
      setSelectedPatients([]);
    }
  };

  // Handle individual select
  const handleSelectPatient = (patientId, checked) => {
    if (checked) {
      setSelectedPatients([...selectedPatients, patientId]);
    } else {
      setSelectedPatients(selectedPatients.filter(id => id !== patientId));
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

  if (error) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading patients!</AlertTitle>
            <AlertDescription>
              {error?.data?.message || 'Something went wrong while loading patients.'}
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
              onClick={() => navigate('/admin/patients/add')}
            >
              Add Patient
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
                    placeholder="Search patients..."
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
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
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
                      <Text fontWeight="semibold" mb={2}>Sort By</Text>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        borderRadius="lg"
                      >
                        <option value="createdAt">Created Date</option>
                        <option value="name">Name</option>
                        <option value="age">Age</option>
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

        {/* Patients Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader bg={headerBg}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">
                Patients ({data?.pagination?.totalPatients || 0})
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
                  <Text color="gray.600">Loading patients...</Text>
                </VStack>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          isChecked={selectedPatients.length === data?.patients?.length && data?.patients?.length > 0}
                          isIndeterminate={selectedPatients.length > 0 && selectedPatients.length < (data?.patients?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Patient</Th>
                      <Th>Contact</Th>
                      <Th>Age & Gender</Th>
                      <Th>Branch</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data?.patients?.map(patient => (
                      <Tr key={patient._id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Checkbox
                            isChecked={selectedPatients.includes(patient._id)}
                            onChange={(e) => handleSelectPatient(patient._id, e.target.checked)}
                          />
                        </Td>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={patient.name} bg="#2BA8D1" color="white" />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">{patient.name}</Text>
                              <Text fontSize="sm" color="gray.600">{patient.email || '-'}</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm">{patient.contact || '-'}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm">{patient.age ? `${patient.age} years` : '-'}</Text>
                            <Text fontSize="sm" color="gray.600" textTransform="capitalize">{patient.gender || '-'}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" noOfLines={2} maxW="150px">
                            {patient.branchId?.branchName || '-'}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(patient.createdAt)}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => handleViewPatient(patient)}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Patient">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => navigate('/admin/patients/update', { state: { patient } })}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Patient">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteClick(patient)}
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
                          isChecked={selectedPatients.length === data?.patients?.length && data?.patients?.length > 0}
                          isIndeterminate={selectedPatients.length > 0 && selectedPatients.length < (data?.patients?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Patient</Th>
                      <Th>Contact</Th>
                      <Th>Age & Gender</Th>
                      <Th>Branch</Th>
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
        {data && data.pagination?.totalPatients > pageSize && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                  {Math.min(currentPage * pageSize, data.pagination.totalPatients)} of{' '}
                  {data.pagination.totalPatients} patients
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
                    {Array.from({ length: Math.ceil(data.pagination.totalPatients / pageSize) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(data.pagination.totalPatients / pageSize);
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(data.pagination.totalPatients / pageSize)))}
                    isDisabled={currentPage === Math.ceil(data.pagination.totalPatients / pageSize)}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Patient Details Drawer */}
        <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose} size="lg">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack>
                <MdPerson size={24} color="#2BA8D1" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">Patient Details</Text>
                  <Text fontSize="sm" color="gray.600">{selectedPatient?.name}</Text>
                </VStack>
              </HStack>
            </DrawerHeader>

            <DrawerBody px={6} py={4}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={MdPerson} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Basic Information</Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Full Name</Text>
                        <Text fontWeight="medium">{selectedPatient?.name}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Age & Gender</Text>
                        <Text fontWeight="medium">
                          {selectedPatient?.age ? `${selectedPatient.age} years` : 'Not specified'}, {selectedPatient?.gender || 'Not specified'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Contact</Text>
                        <Text fontWeight="medium" color="blue.500">{selectedPatient?.contact || 'Not provided'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Email</Text>
                        <Text fontWeight="medium" color="blue.500">{selectedPatient?.email || 'Not provided'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Address</Text>
                        <Text fontWeight="medium">{selectedPatient?.address || 'Not provided'}</Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Branch Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={MdBusiness} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">Branch Information</Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Branch</Text>
                        <Text fontWeight="medium">{selectedPatient?.branchId?.branchName || 'Not assigned'}</Text>
                        <Text fontSize="sm" color="gray.600">{selectedPatient?.branchId?.address || ''}</Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Medical History */}
                {selectedPatient?.medicalHistory && selectedPatient.medicalHistory.length > 0 && (
                  <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                    <CardHeader pb={3}>
                      <HStack>
                        <Icon as={InfoIcon} w={5} h={5} color="#2BA8D1" />
                        <Text fontWeight="semibold" fontSize="lg">Medical History</Text>
                      </HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack spacing={2} align="stretch">
                        {selectedPatient.medicalHistory.map((history, index) => (
                          <Text key={index} fontSize="sm" color="gray.600">• {history}</Text>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* System Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={CalendarIcon} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">System Information</Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Created Date</Text>
                        <Text fontWeight="medium">{selectedPatient?.createdAt && formatDate(selectedPatient.createdAt)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>Last Updated</Text>
                        <Text fontWeight="medium">{selectedPatient?.updatedAt && formatDate(selectedPatient.updatedAt)}</Text>
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
                  onClick={() => { onDrawerClose(); navigate('/admin/patients/update', { state: { patient: selectedPatient } }); }}
                  flex={1}>Edit Patient</Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Patient</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete "{patientToDelete?.name}"? 
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

export default AllPatients;
