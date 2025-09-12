import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Center,
  VStack,
  Heading,
  Divider,
  Checkbox,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useColorModeValue,
  TableContainer,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  SimpleGrid,
  Tag,
  TagLabel,
  TagLeftIcon,
  Icon,
  Image,
  Avatar,
} from '@chakra-ui/react';
import {
  SearchIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  RepeatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
  PhoneIcon,
  EmailIcon,
  CalendarIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { MdPerson, MdBusiness } from 'react-icons/md';
import { useGetAllBranchAdminsMutation, useDeleteBranchAdminMutation } from '../../../features/api/branchAdmin';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { Link, useNavigate } from 'react-router-dom';

const AllBranchAdmins = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDrawerOpen, 
    onOpen: onDrawerOpen, 
    onClose: onDrawerClose 
  } = useDisclosure();
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [branchAdmins, setBranchAdmins] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // RTK Query hooks
  const [getAllBranchAdmins] = useGetAllBranchAdminsMutation();
  const [deleteBranchAdmin, { isLoading: isDeleting }] = useDeleteBranchAdminMutation();
  
  // Get branches for filter
  const { data: branchesData } = useGetAllBranchesQuery({
    page: 1,
    limit: 100,
    search: '',
  });

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch branch admins
  const fetchBranchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllBranchAdmins({
        page: currentPage,
        limit: pageSize,
        q: searchTerm,
        branch: branchFilter === 'all' ? '' : branchFilter,
        status: statusFilter === 'all' ? '' : (statusFilter === 'active' ? 'true' : 'false'),
        sortBy,
        sortOrder,
      }).unwrap();
      
      setBranchAdmins(result.branchAdmins || []);
      setPagination(result.pagination || {});
    } catch (err) {
      setError(err);
      console.error('Error fetching branch admins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      fetchBranchAdmins();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, branchFilter, statusFilter, sortBy, sortOrder]);

  // Fetch data on component mount and page changes
  useEffect(() => {
    fetchBranchAdmins();
  }, [currentPage, pageSize]);

  // Handle view admin details
  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    onDrawerOpen();
  };

  // Handle delete
  const handleDelete = async (adminId) => {
    try {
      await deleteBranchAdmin({ id: adminId }).unwrap();
      toast({
        title: 'Branch Admin Deleted',
        description: 'Branch admin has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setAdminToDelete(null);
      fetchBranchAdmins(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete branch admin.',
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
        selectedAdmins.map(adminId => 
          deleteBranchAdmin({ id: adminId }).unwrap()
        )
      );
      toast({
        title: 'Branch Admins Deleted',
        description: `${selectedAdmins.length} branch admins have been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedAdmins([]);
      fetchBranchAdmins(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some branch admins.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedAdmins(branchAdmins?.map(admin => admin._id) || []);
    } else {
      setSelectedAdmins([]);
    }
  };

  // Handle individual select
  const handleSelectAdmin = (adminId, checked) => {
    if (checked) {
      setSelectedAdmins([...selectedAdmins, adminId]);
    } else {
      setSelectedAdmins(selectedAdmins.filter(id => id !== adminId));
    }
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    if (status === true || status === 'active') {
      return { color: 'green', text: 'Active' };
    } else if (status === false || status === 'inactive') {
      return { color: 'red', text: 'Inactive' };
    } else {
      return { color: 'gray', text: 'Unknown' };
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
            <AlertTitle>Error loading branch admins!</AlertTitle>
            <AlertDescription>
              {error?.data?.message || 'Something went wrong while loading branch admins.'}
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
              onClick={fetchBranchAdmins}
              isLoading={isLoading}
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
              as={Link}
              to="/admin/branch-admins/add"
            >
              Add Branch Admin
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
                    placeholder="Search branch admins..."
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
                
                {selectedAdmins.length > 0 && (
                  <Button
                    variant="danger"
                    leftIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    isLoading={isDeleting}
                  >
                    Delete Selected ({selectedAdmins.length})
                  </Button>
                )}
              </HStack>

              {/* Advanced Filters */}
              {showFilters && (
                <Box>
                  <Divider mb={4} />
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Branch</Text>
                      <Select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        borderRadius="lg"
                      >
                        <option value="all">All Branches</option>
                        {branchesData?.branches?.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.branchName}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    
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
                        <option value="createdAt">Created Date</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
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

        {/* Branch Admins Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader bg={headerBg}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">
                Branch Admins ({pagination.totalBranchAdmins || 0})
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
                  <Text color="gray.600">Loading branch admins...</Text>
                </VStack>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          isChecked={selectedAdmins.length === branchAdmins?.length && branchAdmins?.length > 0}
                          isIndeterminate={selectedAdmins.length > 0 && selectedAdmins.length < (branchAdmins?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Admin</Th>
                      <Th>Branch</Th>
                      <Th>Contact</Th>
                     
                      <Th>Status</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {branchAdmins?.map((admin) => (
                      <Tr key={admin._id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Checkbox
                            isChecked={selectedAdmins.includes(admin._id)}
                            onChange={(e) => handleSelectAdmin(admin._id, e.target.checked)}
                          />
                        </Td>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar
                              size="sm"
                              src={admin.photoUrl}
                              name={admin.name}
                              bg="#2BA8D1"
                              color="white"
                            />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">{admin.name}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {admin.email}
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm">
                              {admin.branch?.branchName || 'N/A'}
                            </Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="150px">
                              {admin.branch?.address || ''}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            {admin.phone && (
                              <Text fontSize="sm">{admin.phone}</Text>
                            )}
                            <Text fontSize="sm" color="blue.500">
                              {admin.email}
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <Badge
                            colorScheme={getStatusInfo(admin.status).color}
                            variant="subtle"
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            {getStatusInfo(admin.status).text}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(admin.createdAt)}
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
                                onClick={() => handleViewAdmin(admin)}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Admin">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => navigate(`/admin/branch-admins/update`, { state: { adminId: admin._id } })}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Admin">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => {
                                  setAdminToDelete(admin);
                                  onOpen();
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
                          isChecked={selectedAdmins.length === branchAdmins?.length && branchAdmins?.length > 0}
                          isIndeterminate={selectedAdmins.length > 0 && selectedAdmins.length < (branchAdmins?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Admin</Th>
                      <Th>Branch</Th>
                      <Th>Contact</Th>
                     
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
        {pagination && pagination.totalBranchAdmins > pageSize && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                  {Math.min(currentPage * pageSize, pagination.totalBranchAdmins)} of{' '}
                  {pagination.totalBranchAdmins} branch admins
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
                    {Array.from({ length: Math.ceil(pagination.totalBranchAdmins / pageSize) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(pagination.totalBranchAdmins / pageSize);
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(pagination.totalBranchAdmins / pageSize)))}
                    isDisabled={currentPage === Math.ceil(pagination.totalBranchAdmins / pageSize)}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Branch Admin</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete "{adminToDelete?.name}"? 
                This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onClose}  _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(adminToDelete?._id)}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Branch Admin Details Drawer */}
        <Drawer
          isOpen={isDrawerOpen}
          placement="right"
          onClose={onDrawerClose}
          size="md"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack>
                <Avatar
                  size="md"
                  src={selectedAdmin?.photoUrl}
                  name={selectedAdmin?.name}
                  bg="#2BA8D1"
                  color="white"
                />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">
                    {selectedAdmin?.name}
                  </Text>
                  <Badge
                    colorScheme={getStatusInfo(selectedAdmin?.status).color}
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {getStatusInfo(selectedAdmin?.status).text}
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
                      <Icon as={InfoIcon} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">
                        Basic Information
                      </Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Full Name
                        </Text>
                        <Text fontWeight="medium">{selectedAdmin?.name}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Email Address
                        </Text>
                        <Text fontWeight="medium" color="blue.500">
                          {selectedAdmin?.email}
                        </Text>
                      </Box>
                      
                      {selectedAdmin?.bio && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            Bio
                          </Text>
                          <Text fontWeight="medium" lineHeight="1.6">
                            {selectedAdmin.bio}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Branch Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={MdBusiness} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">
                        Branch Information
                      </Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Assigned Branch
                      </Text>
                      <Text fontWeight="medium">
                        {selectedAdmin?.branch?.branchName || 'Not assigned'}
                      </Text>
                      {selectedAdmin?.branch?.address && (
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          {selectedAdmin.branch.address}
                        </Text>
                      )}
                    </Box>
                  </CardBody>
                </Card>


                {/* Additional Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={CalendarIcon} w={5} h={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" fontSize="lg">
                        Additional Information
                      </Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Created Date
                        </Text>
                        <Text fontWeight="medium">
                          {selectedAdmin?.createdAt && formatDate(selectedAdmin.createdAt)}
                        </Text>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Last Updated
                        </Text>
                        <Text fontWeight="medium">
                          {selectedAdmin?.updatedAt && formatDate(selectedAdmin.updatedAt)}
                        </Text>
                      </Box>
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
                }}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<EditIcon />}
                  onClick={() => {
                    onDrawerClose();
                    navigate(`/admin/branch-admins/update`, { state: { adminId: selectedAdmin?._id } });
                  }}
                  flex={1}
                >
                  Edit Admin
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </VStack>
    </Box>
  );
};

export default AllBranchAdmins;
