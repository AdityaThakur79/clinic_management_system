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
import { MdBusiness, MdLocationOn } from 'react-icons/md';
import { useGetAllBranchesQuery, useDeleteBranchMutation } from '../../../features/api/branchApi';
import { Link, useNavigate } from 'react-router-dom';

const Branches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDrawerOpen, 
    onOpen: onDrawerOpen, 
    onClose: onDrawerClose 
  } = useDisclosure();
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // RTK Query hooks
  const {
    data: branchesData,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllBranchesQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter === 'all' ? '' : statusFilter,
    sortBy,
    sortOrder,
  });

  const [deleteBranch, { isLoading: isDeleting }] = useDeleteBranchMutation();

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle view branch details
  const handleViewBranch = (branch) => {
    setSelectedBranch(branch);
    onDrawerOpen();
  };

  // Handle delete
  const handleDelete = async (branchId) => {
    try {
      await deleteBranch({ branchId }).unwrap();
      toast({
        title: 'Branch Deleted',
        description: 'Branch has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setBranchToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete branch.',
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
        selectedBranches.map(branchId => 
          deleteBranch({ branchId }).unwrap()
        )
      );
      toast({
        title: 'Branches Deleted',
        description: `${selectedBranches.length} branches have been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedBranches([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some branches.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBranches(branchesData?.branches?.map(branch => branch._id) || []);
    } else {
      setSelectedBranches([]);
    }
  };

  // Handle individual select
  const handleSelectBranch = (branchId, checked) => {
    if (checked) {
      setSelectedBranches([...selectedBranches, branchId]);
    } else {
      setSelectedBranches(selectedBranches.filter(id => id !== branchId));
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
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

  if (error) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading branches!</AlertTitle>
            <AlertDescription>
              {error?.data?.message || 'Something went wrong while loading branches.'}
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
          {/* <Box>
            <Heading size="lg" color="gray.700" mb={2}>
              Branch Management
            </Heading>
            <Text color="gray.600">
              Manage and monitor all clinic branches
            </Text>
          </Box> */}
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
              as={Link}
              to="/admin/branches/add"
            >
              Add Branch
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
                    placeholder="Search branches..."
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
                
                {selectedBranches.length > 0 && (
                  <Button
                    variant="danger"
                    leftIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    isLoading={isDeleting}
                  >
                    Delete Selected ({selectedBranches.length})
                  </Button>
                )}
              </HStack>

              {/* Advanced Filters */}
              {showFilters && (
                <Box>
                  <Divider mb={4} />
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
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
                        <option value="branchName">Branch Name</option>
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

        {/* Branches Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader bg={headerBg}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">
                Branches ({branchesData?.total || 0})
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
                  <Spinner size="xl" color="#3AC0E7" />
                  <Text color="gray.600">Loading branches...</Text>
                </VStack>
              </Center>
            ) : (branchesData?.branches?.length || 0) === 0 ? (
              <Center py={16} px={6}>
                <Alert status="info" borderRadius="md" maxW="lg">
                  <AlertIcon />
                  <Text>No branches found. Use "Add Branch" to create one.</Text>
                </Alert>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          isChecked={selectedBranches.length === branchesData?.branches?.length && branchesData?.branches?.length > 0}
                          isIndeterminate={selectedBranches.length > 0 && selectedBranches.length < (branchesData?.branches?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Branch Name</Th>
                      <Th>Address</Th>
                      <Th>Contact</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {branchesData?.branches?.map((branch) => (
                      <Tr key={branch._id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Checkbox
                            isChecked={selectedBranches.includes(branch._id)}
                            onChange={(e) => handleSelectBranch(branch._id, e.target.checked)}
                          />
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">{branch.branchName}</Text>
                            {branch.gst && (
                              <Text fontSize="sm" color="gray.600">
                                GST: {branch.gst}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" noOfLines={2} maxW="200px">
                            {branch.address}
                          </Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            {branch.phone && (
                              <Text fontSize="sm">{branch.phone}</Text>
                            )}
                            {branch.email && (
                              <Text fontSize="sm" color="blue.500">
                                {branch.email}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(branch.status)}
                            variant="subtle"
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            {branch.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(branch.createdAt)}
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
                                onClick={() => handleViewBranch(branch)}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Branch">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => navigate('/admin/branches/update', { state: { branchId: branch._id } })}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Branch">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => {
                                  setBranchToDelete(branch);
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
                          isChecked={selectedBranches.length === branchesData?.branches?.length && branchesData?.branches?.length > 0}
                          isIndeterminate={selectedBranches.length > 0 && selectedBranches.length < (branchesData?.branches?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Branch Name</Th>
                      <Th>Address</Th>
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
        {branchesData && branchesData.total > pageSize && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                  {Math.min(currentPage * pageSize, branchesData.total)} of{' '}
                  {branchesData.total} branches
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
                    {Array.from({ length: Math.ceil(branchesData.total / pageSize) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(branchesData.total / pageSize);
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(branchesData.total / pageSize)))}
                    isDisabled={currentPage === Math.ceil(branchesData.total / pageSize)}
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
            <ModalHeader>Delete Branch</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete "{branchToDelete?.branchName}"? 
                This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onClose} _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(branchToDelete?._id)}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Branch Details Drawer */}
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
                {/* <Icon as={MdBusiness} w={6} h={6} color="#3AC0E7" /> */}
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">
                    {selectedBranch?.branchName}
                  </Text>
                  <Badge
                    colorScheme={getStatusColor(selectedBranch?.status)}
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {selectedBranch?.status}
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
                      <Icon as={InfoIcon} w={5} h={5} color="#3AC0E7" />
                      <Text fontWeight="semibold" fontSize="lg">
                        Basic Information
                      </Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Branch Name
                        </Text>
                        <Text fontWeight="medium">{selectedBranch?.branchName}</Text>
                      </Box>
                      
                      {selectedBranch?.gst && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            GST Number
                          </Text>
                          <Text fontWeight="medium">{selectedBranch.gst}</Text>
                        </Box>
                      )}
                      
                      {selectedBranch?.pan && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            PAN Number
                          </Text>
                          <Text fontWeight="medium">{selectedBranch.pan}</Text>
                        </Box>
                      )}
                      
                      {selectedBranch?.scn && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            SCN Number
                          </Text>
                          <Text fontWeight="medium">{selectedBranch.scn}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Address Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={MdLocationOn} w={5} h={5} color="#3AC0E7" />
                      <Text fontWeight="semibold" fontSize="lg">
                        Address Information
                      </Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Full Address
                      </Text>
                      <Text fontWeight="medium" lineHeight="1.6">
                        {selectedBranch?.address}
                      </Text>
                    </Box>
                  </CardBody>
                </Card>

                {/* Contact Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={PhoneIcon} w={5} h={5} color="#3AC0E7" />
                      <Text fontWeight="semibold" fontSize="lg">
                        Contact Information
                      </Text>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      {selectedBranch?.phone && (
                        <HStack>
                          <Icon as={PhoneIcon} w={4} h={4} color="gray.500" />
                          <Text fontWeight="medium">{selectedBranch.phone}</Text>
                        </HStack>
                      )}
                      
                      {selectedBranch?.email && (
                        <HStack>
                          <Icon as={EmailIcon} w={4} h={4} color="gray.500" />
                          <Text fontWeight="medium" color="blue.500">
                            {selectedBranch.email}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Additional Information */}
                <Card bg={cardBg} borderColor={borderColor} borderRadius="lg">
                  <CardHeader pb={3}>
                    <HStack>
                      <Icon as={CalendarIcon} w={5} h={5} color="#3AC0E7" />
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
                          {selectedBranch?.createdAt && formatDate(selectedBranch.createdAt)}
                        </Text>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Last Updated
                        </Text>
                        <Text fontWeight="medium">
                          {selectedBranch?.updatedAt && formatDate(selectedBranch.updatedAt)}
                        </Text>
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
                }}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<EditIcon />}
                  onClick={() => {
                    onDrawerClose();
                    navigate('/admin/branches/update', { state: { branchId: selectedBranch?._id } });
                  }}
                  flex={1}
                >
                  Edit Branch
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </VStack>
    </Box>
  );
};

export default Branches;
