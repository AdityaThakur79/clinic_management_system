import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
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
  useToast,
  Spinner,
  Center,
  VStack,
  Heading,
  Divider,
  useDisclosure,
  useColorModeValue,
  TableContainer,
  Tooltip,
} from '@chakra-ui/react';
import {
  SearchIcon,
  AddIcon,
  DeleteIcon,
  RepeatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useGetAllServicesQuery, useDeleteServiceMutation } from '../../../features/api/service';

const Services = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setCurrentPage(1), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const {
    data: servicesData,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetAllServicesQuery({
    page: currentPage,
    limit: pageSize,
    q: searchTerm,
    isActive: statusFilter === 'all' ? '' : statusFilter === 'active',
    sortBy,
    sortOrder,
  });

  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const getStatusColor = (isActive) => (isActive ? 'green' : 'red');
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleDelete = async (id, name) => {
    try {
      await deleteService({ id }).unwrap();
      toast({ title: 'Service Deleted', description: `${name} removed from catalog.`, status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Error', description: err?.data?.message || 'Failed to delete service.', status: 'error', duration: 3000 });
    }
  };

  if (error) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Text color="red.500">{error?.data?.message || 'Failed to load services.'}</Text>
          </CardBody>
        </Card>
      </Box>
    );
  }

  const total = servicesData?.pagination?.totalItems || 0;

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
              _hover={{ bg: '#2BA8D1', color: 'white', transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(43, 168, 209, 0.3)' }}
            >
              Refresh
            </Button>
            <Button variant="primary" leftIcon={<AddIcon />} as={Link} to="/admin/service/add">
              Add Service
            </Button>
          </HStack>
        </Flex>

        {/* Search & Filters */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    borderRadius="lg"
                  />
                </InputGroup>

                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} borderRadius="lg" maxW="200px">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>

              
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Services Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader bg={headerBg}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">Services ({total})</Text>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Show:</Text>
                <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} size="sm" w="80px">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </Select>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody p={0}>
            {isLoading ? (
              <Center py={20}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="#3AC0E7" />
                  <Text color="gray.600">Loading services...</Text>
                </VStack>
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Service Name</Th>
                      <Th>Description</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {servicesData?.services?.map((s) => (
                      <Tr key={s._id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Text fontWeight="semibold">{s.name}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" noOfLines={2} maxW="360px">{s.description}</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(s.isActive)} variant="subtle" borderRadius="full" px={3} py={1}>
                            {s.isActive ? 'active' : 'inactive'}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">{formatDate(s.createdAt)}</Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="Edit Service">
                              <IconButton
                                icon={<SettingsIcon boxSize={3} transform="rotate(45deg)" />}
                                aria-label="Edit"
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => navigate('/admin/service/update', { state: { serviceId: s._id } })}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Service">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                isLoading={isDeleting}
                                onClick={() => handleDelete(s._id, s.name)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                  <Thead>
                    <Tr>
                      <Th>Service Name</Th>
                      <Th>Description</Th>
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
        {total > pageSize && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} services
                </Text>
                <HStack spacing={2}>
                  <Button size="sm" variant="outline" leftIcon={<ChevronLeftIcon />} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>
                    Previous
                  </Button>
                  <Button size="sm" variant="outline" rightIcon={<ChevronRightIcon />} onClick={() => setCurrentPage((p) => p + 1)} isDisabled={currentPage * pageSize >= total}>
                    Next
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default Services;
 
