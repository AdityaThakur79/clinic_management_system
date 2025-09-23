import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, IconButton, Input, Select, Table, Tbody, Td, Th, Thead, Tr, Text,
  useColorModeValue, Card, CardBody, CardHeader, TableContainer, VStack, Divider, Badge,
  useDisclosure, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useToast, Tooltip, InputGroup, InputLeftElement, Flex, Grid, Checkbox,
  Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, SimpleGrid,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, FormControl,
  FormLabel, Textarea, useBreakpointValue
} from '@chakra-ui/react';
import { 
  useListInventoriesQuery, 
  useDeleteInventoryMutation,
  useUpdateInventoryStockMutation,
  useGetInventoryAnalyticsQuery
} from '../../../features/api/inventoryApi';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { 
  DeleteIcon, EditIcon, SearchIcon, AddIcon, ChevronLeftIcon, ChevronRightIcon, 
  ViewIcon, RepeatIcon, SettingsIcon, PhoneIcon, EmailIcon, CalendarIcon, 
  InfoIcon, WarningIcon, CheckIcon, CloseIcon
} from '@chakra-ui/icons';
import { 
  MdAssignment, MdBusiness, MdPhone, MdEmail, MdAssessment, MdInventory, 
  MdWarning, MdTrendingUp, MdTrendingDown, MdAdd, MdEdit, MdDelete,
  MdVisibility, MdRefresh, MdFilterList, MdDownload, MdPrint
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Inventories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedInventories, setSelectedInventories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const [stockUpdateData, setStockUpdateData] = useState({
    operation: 'add',
    quantity: 0,
    notes: ''
  });
  const [showStockUpdate, setShowStockUpdate] = useState(false);
  const [inventoryForStockUpdate, setInventoryForStockUpdate] = useState(null);
  const navigate = useNavigate();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';

  const { data, isFetching, refetch, error, isLoading } = useListInventoriesQuery({ 
    page: currentPage, 
    limit: pageSize, 
    search: searchTerm,
    category: categoryFilter,
    status: statusFilter,
    condition: conditionFilter,
    sortBy,
    sortOrder,
    lowStock: false
  });


  const { data: analyticsData } = useGetInventoryAnalyticsQuery({});
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [deleteInventory, { isLoading: isDeleting }] = useDeleteInventoryMutation();
  const [updateStock, { isLoading: isUpdatingStock }] = useUpdateInventoryStockMutation();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isStockModalOpen, onOpen: onStockModalOpen, onClose: onStockModalClose } = useDisclosure();
  const toast = useToast();

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewInventory = (inventory) => {
    setSelectedInventory(inventory);
    onDrawerOpen();
  };

  const handleDeleteClick = (inventory) => {
    setInventoryToDelete(inventory);
    onDeleteModalOpen();
  };

  const handleDelete = async (inventoryId) => {
    try {
      await deleteInventory(inventoryId).unwrap();
      toast({
        title: 'Inventory Deleted',
        description: 'Inventory item has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteModalClose();
      setInventoryToDelete(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete inventory item.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStockUpdateClick = (inventory) => {
    setInventoryForStockUpdate(inventory);
    setStockUpdateData({
      operation: 'add',
      quantity: 0,
      notes: ''
    });
    onStockModalOpen();
  };

  const handleStockUpdate = async () => {
    try {
      await updateStock({
        id: inventoryForStockUpdate._id,
        ...stockUpdateData
      }).unwrap();
      
      toast({
        title: 'Stock Updated',
        description: `Stock ${stockUpdateData.operation}ed successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onStockModalClose();
      setInventoryForStockUpdate(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update stock.',
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
        selectedInventories.map(id => 
          deleteInventory(id).unwrap()
        )
      );
      toast({
        title: 'Inventory Items Deleted',
        description: `${selectedInventories.length} inventory items have been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedInventories([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some inventory items.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedInventories(data?.inventories?.map(inv => inv._id) || []);
    } else {
      setSelectedInventories([]);
    }
  };

  // Handle individual selection
  const handleSelectItem = (inventoryId, checked) => {
    if (checked) {
      setSelectedInventories(prev => [...prev, inventoryId]);
    } else {
      setSelectedInventories(prev => prev.filter(id => id !== inventoryId));
    }
  };

  const getStockStatusColor = (inventory) => {
    if (inventory.currentStock === 0) return 'red';
    if (inventory.currentStock <= inventory.threshold) return 'orange';
    return 'green';
  };

  const getStockStatusText = (inventory) => {
    if (inventory.currentStock === 0) return 'Out of Stock';
    if (inventory.currentStock <= inventory.threshold) return 'Low Stock';
    return 'In Stock';
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent': return 'green';
      case 'Good': return 'blue';
      case 'Fair': return 'yellow';
      case 'Poor': return 'orange';
      case 'Damaged': return 'red';
      default: return 'gray';
    }
  };

  const categories = [
    'Medical Equipment',
    'Surgical Instruments',
    'Diagnostic Tools',
    'Therapeutic Devices',
    'Laboratory Equipment',
    'Office Equipment',
    'IT Equipment',
    'Furniture',
    'Consumables',
    'Other'
  ];

  const statuses = ['Active', 'Inactive', 'Maintenance', 'Disposed', 'Lost'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading inventory...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            Failed to load inventory data. Please try again.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
         
          <HStack spacing={3}>
            <Button
              leftIcon={<Icon as={MdRefresh} />}
              variant="outline"
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
              leftIcon={<Icon as={MdAdd} />}
              variant="primary"
              onClick={() => navigate('/admin/inventory/add')}
              _hover={{ 
                bg: "#2BA8D1", 
                color: "white",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
              }}
            >
              Add Inventory
            </Button>
          </HStack>
        </Flex>

        {/* Statistics Cards */}
        {analyticsData && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Items</StatLabel>
                  <StatNumber color="blue.500">{analyticsData.analytics?.totalItems || 0}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Value</StatLabel>
                  <StatNumber color="green.500">
                    ₹{analyticsData.analytics?.totalValue?.toLocaleString() || 0}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Low Stock Items</StatLabel>
                  <StatNumber color="orange.500">
                    {analyticsData.analytics?.lowStockItems || 0}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Out of Stock</StatLabel>
                  <StatNumber color="red.500">
                    {analyticsData.analytics?.outOfStockItems || 0}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Search and Filters */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                
                <Button
                  leftIcon={<Icon as={MdFilterList} />}
                  variant="outline"
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

              {showFilters && (
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      value={conditionFilter}
                      onChange={(e) => setConditionFilter(e.target.value)}
                    >
                      <option value="">All Conditions</option>
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Sort By</FormLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="deviceName">Device Name</option>
                      <option value="currentStock">Current Stock</option>
                      <option value="costPrice">Cost Price</option>
                      <option value="category">Category</option>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Bulk Actions */}
        {selectedInventories.length > 0 && (
          <Card bg="blue.50" borderColor="blue.200">
            <CardBody>
              <HStack justify="space-between">
                <Text fontWeight="semibold">
                  {selectedInventories.length} item(s) selected
                </Text>
                <HStack>
                  <Button
                    leftIcon={<Icon as={MdDelete} />}
                    colorScheme="red"
                    variant="outline"
                    onClick={handleBulkDelete}
                    isLoading={isDeleting}
                    size="sm"
                  >
                    Delete Selected
                  </Button>
                </HStack>
              </HStack>
            </CardBody>
          </Card>
        )}

        {/* Inventory Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader bg={headerBg}>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">
                Inventory Items ({data?.pagination?.total || 0})
              </Text>
              <HStack>
                <Select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  size="sm"
                  maxW="100px"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            {isFetching ? (
              <Center h="200px">
                <Spinner size="lg" />
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple" size={isMobile ? "sm" : "md"}>
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          isChecked={selectedInventories.length === data?.inventories?.length && data?.inventories?.length > 0}
                          isIndeterminate={selectedInventories.length > 0 && selectedInventories.length < (data?.inventories?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Device</Th>
                      <Th>Category</Th>
                      <Th>Branch</Th>
                      <Th>Stock</Th>
                      <Th>Status</Th>
                      <Th>Condition</Th>
                      <Th>Value</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data?.inventories?.map((inventory) => (
                      <Tr key={inventory._id}>
                        <Td>
                          <Checkbox
                            isChecked={selectedInventories.includes(inventory._id)}
                            onChange={(e) => handleSelectItem(inventory._id, e.target.checked)}
                          />
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {inventory.deviceName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {inventory.model} {inventory.brand && `- ${inventory.brand}`}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {inventory.category}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {inventory.branchId?.branchName || 'N/A'}
                          </Text>
                          {inventory.branchId?.address && (
                            <Text fontSize="xs" color="gray.500">
                              {inventory.branchId.address}
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm">
                              {inventory.currentStock} {inventory.unit}
                            </Text>
                            <Badge
                              colorScheme={getStockStatusColor(inventory)}
                              variant="subtle"
                              size="sm"
                            >
                              {getStockStatusText(inventory)}
                            </Badge>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={inventory.status === 'Active' ? 'green' : 'gray'}
                            variant="subtle"
                          >
                            {inventory.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getConditionColor(inventory.condition)}
                            variant="subtle"
                          >
                            {inventory.condition}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            ₹{inventory.costPrice?.toLocaleString() || 0}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/admin/inventory/${inventory._id}`)}
                              />
                            </Tooltip>
                            <Tooltip label="Update Stock">
                              <IconButton
                                icon={<Icon as={MdAdd} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => handleStockUpdateClick(inventory)}
                              />
                            </Tooltip>
                            <Tooltip label="Edit">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => navigate('/admin/inventory/update', { state: { inventory } })}
                              />
                            </Tooltip>
                            <Tooltip label="Delete">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteClick(inventory)}
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
                          isChecked={selectedInventories.length === data?.inventories?.length && data?.inventories?.length > 0}
                          isIndeterminate={selectedInventories.length > 0 && selectedInventories.length < (data?.inventories?.length || 0)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </Th>
                      <Th>Device</Th>
                      <Th>Category</Th>
                      <Th>Branch</Th>
                      <Th>Stock</Th>
                      <Th>Status</Th>
                      <Th>Condition</Th>
                      <Th>Value</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Pagination */}
        {data && data.pagination.total > pageSize && (
          <HStack justify="center" spacing={4}>
            <Button
              leftIcon={<ChevronLeftIcon />}
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
              _hover={{
                bg: "#2BA8D1",
                color: "white",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
              }}
            >
              Previous
            </Button>
            <Text>
              Page {currentPage} of {data.pagination.totalPages}
            </Text>
            <Button
              rightIcon={<ChevronRightIcon />}
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.pagination.totalPages))}
              isDisabled={currentPage === data.pagination.totalPages}
              _hover={{
                bg: "#2BA8D1",
                color: "white",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
              }}
            >
              Next
            </Button>
          </HStack>
        )}

        {/* Inventory Details Drawer */}
        <Drawer isOpen={isDrawerOpen} onClose={onDrawerClose} size="lg">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <Text fontSize="xl" fontWeight="bold">
                {selectedInventory?.deviceName}
              </Text>
            </DrawerHeader>

            <DrawerBody>
              {selectedInventory && (
                <VStack spacing={6} align="stretch">
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Model</Text>
                      <Text>{selectedInventory.model}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Brand</Text>
                      <Text>{selectedInventory.brand || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Category</Text>
                      <Badge colorScheme="blue">{selectedInventory.category}</Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Serial Number</Text>
                      <Text>{selectedInventory.serialNumber || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Current Stock</Text>
                      <Text>{selectedInventory.currentStock} {selectedInventory.unit}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Threshold</Text>
                      <Text>{selectedInventory.threshold} {selectedInventory.unit}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Status</Text>
                      <Badge colorScheme={selectedInventory.status === 'Active' ? 'green' : 'gray'}>
                        {selectedInventory.status}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Condition</Text>
                      <Badge colorScheme={getConditionColor(selectedInventory.condition)}>
                        {selectedInventory.condition}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Cost Price</Text>
                      <Text>₹{selectedInventory.costPrice?.toLocaleString() || 0}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Selling Price</Text>
                      <Text>₹{selectedInventory.sellingPrice?.toLocaleString() || 0}</Text>
                    </Box>
                  </Grid>

                  {selectedInventory.supplier?.name && (
                    <Box>
                      <Text fontWeight="semibold" color="gray.600" mb={2}>Supplier Information</Text>
                      <VStack align="start" spacing={1}>
                        <Text><strong>Name:</strong> {selectedInventory.supplier.name}</Text>
                        {selectedInventory.supplier.contact && (
                          <Text><strong>Contact:</strong> {selectedInventory.supplier.contact}</Text>
                        )}
                        {selectedInventory.supplier.email && (
                          <Text><strong>Email:</strong> {selectedInventory.supplier.email}</Text>
                        )}
                      </VStack>
                    </Box>
                  )}

                  {selectedInventory.location?.room && (
                    <Box>
                      <Text fontWeight="semibold" color="gray.600" mb={2}>Location</Text>
                      <VStack align="start" spacing={1}>
                        <Text><strong>Room:</strong> {selectedInventory.location.room}</Text>
                        {selectedInventory.location.shelf && (
                          <Text><strong>Shelf:</strong> {selectedInventory.location.shelf}</Text>
                        )}
                        {selectedInventory.location.position && (
                          <Text><strong>Position:</strong> {selectedInventory.location.position}</Text>
                        )}
                      </VStack>
                    </Box>
                  )}

                  {selectedInventory.description && (
                    <Box>
                      <Text fontWeight="semibold" color="gray.600" mb={2}>Description</Text>
                      <Text>{selectedInventory.description}</Text>
                    </Box>
                  )}

                  {selectedInventory.notes && (
                    <Box>
                      <Text fontWeight="semibold" color="gray.600" mb={2}>Notes</Text>
                      <Text>{selectedInventory.notes}</Text>
                    </Box>
                  )}
                </VStack>
              )}
            </DrawerBody>

            <DrawerFooter borderTopWidth="1px">
              <HStack spacing={3} w="full">
                <Button variant="outline" onClick={onDrawerClose} flex={1}>
                  Close
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={MdEdit} />}
                  onClick={() => {
                    onDrawerClose();
                    navigate('/admin/inventory/update', { state: { inventory: selectedInventory } });
                  }}
                  flex={1}
                >
                  Edit Item
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Inventory Item</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete "{inventoryToDelete?.deviceName}"? 
                This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onDeleteModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDelete(inventoryToDelete?._id)}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Stock Update Modal */}
        <Modal isOpen={isStockModalOpen} onClose={onStockModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Stock - {inventoryForStockUpdate?.deviceName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Operation</FormLabel>
                  <Select
                    value={stockUpdateData.operation}
                    onChange={(e) => setStockUpdateData(prev => ({ ...prev, operation: e.target.value }))}
                  >
                    <option value="add">Add Stock</option>
                    <option value="reduce">Reduce Stock</option>
                    <option value="set">Set Stock</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Quantity</FormLabel>
                  <NumberInput
                    value={stockUpdateData.quantity}
                    onChange={(value) => setStockUpdateData(prev => ({ ...prev, quantity: parseInt(value) || 0 }))}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <Textarea
                    value={stockUpdateData.notes}
                    onChange={(e) => setStockUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes about this stock update..."
                    rows={3}
                  />
                </FormControl>

                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Current Stock: {inventoryForStockUpdate?.currentStock} {inventoryForStockUpdate?.unit}</AlertTitle>
                    <AlertDescription>
                      {stockUpdateData.operation === 'add' && `New stock will be: ${(inventoryForStockUpdate?.currentStock || 0) + stockUpdateData.quantity}`}
                      {stockUpdateData.operation === 'reduce' && `New stock will be: ${Math.max(0, (inventoryForStockUpdate?.currentStock || 0) - stockUpdateData.quantity)}`}
                      {stockUpdateData.operation === 'set' && `Stock will be set to: ${stockUpdateData.quantity}`}
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onStockModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleStockUpdate}
                isLoading={isUpdatingStock}
              >
                Update Stock
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default Inventories;
