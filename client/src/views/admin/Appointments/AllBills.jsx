import React from 'react';
import { Box, Card, CardBody, CardHeader, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Select, HStack, Input, Text, SimpleGrid, Button, Icon, useColorModeValue, Badge, Flex, Spacer, InputGroup, InputLeftElement, Grid, Divider, Center, Spinner, VStack } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { useGetAllBillsQuery } from '../../../features/api/billsApi';
import { useNavigate } from 'react-router-dom';
import { MdReceiptLong, MdEdit } from 'react-icons/md';
import { SearchIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useGetAllBranchesQuery } from '../../../features/api/branchApi';
import { useGetAllDoctorsMutation } from '../../../features/api/doctor';

const AllBills = () => {
  const user = useSelector((s) => s.auth.user);
  const branchId = (user?.role === 'branchAdmin' || user?.role === 'doctor') ? (user?.branch?._id || user?.branch) : undefined;
  const doctorId = user?.role === 'doctor' ? user?._id : undefined;

  const [filters, setFilters] = React.useState({ paymentStatus: '', paymentMethod: '', search: '' });
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [showFilters, setShowFilters] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState('desc');
  const [branchFilter, setBranchFilter] = React.useState('all');
  const [doctorFilter, setDoctorFilter] = React.useState('all');
  const navigate = useNavigate();
  const { data, refetch, isFetching } = useGetAllBillsQuery({
    page,
    limit,
    branchId: (user?.role === 'branchAdmin' || user?.role === 'doctor') ? branchId : (branchFilter === 'all' ? undefined : branchFilter),
    doctorId: user?.role === 'doctor' ? doctorId : (doctorFilter === 'all' ? undefined : doctorFilter),
    paymentStatus: filters.paymentStatus || undefined,
    paymentMethod: filters.paymentMethod || undefined,
    search: filters.search || undefined,
    sortBy,
    sortOrder,
  });

  const bills = data?.bills || [];
  const pagination = data?.pagination || {};
  const currentPage = pagination.currentPage || page;
  const totalPages = pagination.totalPages || 1;
  const totalBillsCount = pagination.totalBills || bills.length;
  // Normalize numeric fields to avoid string concatenation issues
  const toNum = (v) => typeof v === 'number' ? v : parseFloat(v || 0) || 0;
  const getPaid = (b) => {
    const direct = toNum(b.paidAmount);
    const fromPayments = Array.isArray(b.payments) ? b.payments.reduce((s, p) => s + toNum(p.amount), 0) : 0;
    const fromRemaining = (b.remainingAmount !== undefined) ? (toNum(b.totalAmount) - toNum(b.remainingAmount)) : 0;
    let paid = Math.max(direct, fromPayments, fromRemaining);
    if ((b.paymentStatus || '').toLowerCase() === 'paid') {
      paid = Math.max(paid, toNum(b.totalAmount));
    }
    return Math.max(0, paid);
  };
  const totalBilled = bills.reduce((sum, b) => sum + toNum(b.totalAmount), 0);
  const totalPaid = bills.reduce((sum, b) => sum + getPaid(b), 0);
  // Outstanding = sum of (total - paid) with floor at 0
  const totalOutstanding = bills.reduce((sum, b) => sum + Math.max(0, toNum(b.totalAmount) - getPaid(b)), 0);
  // Wallet stats (based on bills paid via wallet)
  const walletBills = bills.filter(b => (b.paymentMethod === 'wallet'));
  const walletCollected = walletBills.reduce((sum, b) => sum + getPaid(b), 0);
  const walletPatients = new Set(walletBills.map(b => b.patientId?._id || b.patientId)).size;

  const within24h = (iso) => {
    if (!iso) return false;
    const created = new Date(iso).getTime();
    return (Date.now() - created) <= 24 * 60 * 60 * 1000;
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Load branches and doctors for filters (for superAdmin)
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, isActive: true });
  const [getAllDoctors] = useGetAllDoctorsMutation();
  const [doctors, setDoctors] = React.useState([]);
  React.useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await getAllDoctors({ page: 1, limit: 100, q: '', branch: branchFilter === 'all' ? '' : branchFilter }).unwrap();
        setDoctors(result?.doctors || []);
      } catch (e) {
        // silent
      }
    };
    if (user?.role === 'superAdmin') fetchDoctors();
  }, [getAllDoctors, branchFilter, user?.role]);

  // Debounce search resets to page 1
  React.useEffect(() => {
    const t = setTimeout(() => setPage(1), 500);
    return () => clearTimeout(t);
  }, [filters.search, filters.paymentMethod, filters.paymentStatus, sortBy, sortOrder, branchFilter, doctorFilter, limit]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>

      {/* Header */}
      <Card bg={cardBg} borderColor={borderColor} mb={4}>
        <CardHeader>
          <Flex align="center" gap={4} wrap="wrap">
            <Heading size="md">All Bills</Heading>
            <Spacer />
            <Button
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
          </Flex>
        </CardHeader>
      </Card>

      {/* Top stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={4}>
        <Card><CardBody><Heading size="sm" color="gray.600" mb={1}>Total Bills</Heading><Text fontSize="2xl" fontWeight="bold">{bills.length}</Text></CardBody></Card>
        <Card><CardBody><Heading size="sm" color="gray.600" mb={1}>Total Billed</Heading><Text fontSize="2xl" fontWeight="bold">₹{totalBilled.toLocaleString('en-IN')}</Text></CardBody></Card>
        <Card><CardBody><Heading size="sm" color="gray.600" mb={1}>Total Paid</Heading><Text fontSize="2xl" fontWeight="bold" color="green.600">₹{totalPaid.toLocaleString('en-IN')}</Text></CardBody></Card>
        <Card><CardBody><Heading size="sm" color="gray.600" mb={1}>Outstanding</Heading><Text fontSize="2xl" fontWeight="bold" color="orange.600">₹{totalOutstanding.toLocaleString('en-IN')}</Text></CardBody></Card>
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
        <Card><CardBody><Heading size="sm" color="gray.600" mb={1}>Wallet Patients</Heading><Text fontSize="2xl" fontWeight="bold">{walletPatients}</Text></CardBody></Card>
        <Card><CardBody><Heading size="sm" color="gray.600" mb={1}>Wallet Collected</Heading><Text fontSize="2xl" fontWeight="bold">₹{walletCollected.toLocaleString('en-IN')}</Text></CardBody></Card>
      </SimpleGrid>
      {/* Search and Filters */}
      <Card bg={cardBg} borderColor={borderColor} mb={4}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search bill number, notes..."
                  value={filters.search}
                  onChange={(e)=> setFilters({ ...filters, search: e.target.value })}
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
              <Spacer />
              <Text fontSize="sm" color="gray.500">Showing {bills.length} of {totalBillsCount}</Text>
            </HStack>

            {showFilters && (
              <Box>
                <Divider mb={4} />
                <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Payment Status</Text>
                    <Select value={filters.paymentStatus} onChange={(e)=>{ setPage(1); setFilters({...filters, paymentStatus:e.target.value}); }} borderRadius="lg">
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Payment Method</Text>
                    <Select value={filters.paymentMethod} onChange={(e)=>{ setPage(1); setFilters({...filters, paymentMethod:e.target.value}); }} borderRadius="lg">
                      <option value="">All</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="wallet">Wallet</option>
                      <option value="insurance">Insurance</option>
                    </Select>
                  </Box>
                  {user?.role === 'superAdmin' && (
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Branch</Text>
                      <Select value={branchFilter} onChange={(e)=> { setPage(1); setBranchFilter(e.target.value); }} borderRadius="lg">
                        <option value="all">All Branches</option>
                        {branchesData?.branches?.map(b => (
                          <option key={b._id} value={b._id}>{b.branchName}</option>
                        ))}
                      </Select>
                    </Box>
                  )}
                  {user?.role === 'superAdmin' && (
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Doctor</Text>
                      <Select value={doctorFilter} onChange={(e)=> { setPage(1); setDoctorFilter(e.target.value); }} borderRadius="lg">
                        <option value="all">All Doctors</option>
                        {doctors.map(d => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </Select>
                    </Box>
                  )}
                </Grid>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mt={4}>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Sort By</Text>
                    <Select value={sortBy} onChange={(e)=> setSortBy(e.target.value)} borderRadius="lg">
                      <option value="createdAt">Created Date</option>
                      <option value="totalAmount">Total Amount</option>
                      <option value="paymentStatus">Payment Status</option>
                    </Select>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Order</Text>
                    <Select value={sortOrder} onChange={(e)=> setSortOrder(e.target.value)} borderRadius="lg">
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

      <Card bg={cardBg} borderColor={borderColor}>
        <CardHeader bg={headerBg}>
          <Flex justify="space-between" align="center">
            <Text fontWeight="semibold">Bills ({totalBillsCount})</Text>
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.600">Show:</Text>
              <Select value={limit} onChange={(e)=>{ setPage(1); setLimit(Number(e.target.value)); }} size="sm" w="80px">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </Select>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Bill No</Th>
                  <Th>Patient</Th>
                  <Th>Doctor</Th>
                  <Th isNumeric>Total</Th>
                  <Th isNumeric>Paid</Th>
                  <Th isNumeric>Remaining</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {bills.map(b => (
                  <Tr key={b._id} _hover={{ bg: rowHoverBg }}>
                    <Td>{b.billNumber}</Td>
                    <Td>{b.patientId?.name}</Td>
                    <Td>{b.doctorId?.name}</Td>
                    <Td isNumeric>₹{toNum(b.totalAmount).toLocaleString('en-IN')}</Td>
                    <Td isNumeric>₹{getPaid(b).toLocaleString('en-IN')}</Td>
                    <Td isNumeric>₹{Math.max(0, toNum(b.totalAmount) - getPaid(b)).toLocaleString('en-IN')}</Td>
                    <Td textTransform="capitalize">
                      <Badge colorScheme={b.paymentStatus === 'paid' ? 'green' : (b.paymentStatus === 'partial' ? 'orange' : (b.paymentStatus === 'cancelled' ? 'red' : 'gray'))}>
                        {b.paymentStatus}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        {within24h(b.createdAt) && (
                          <Button size="sm" variant="ghost" colorScheme="orange" px={2} onClick={()=> navigate(`/admin/appointments/${b.appointmentId}/enhanced-complete?edit=true`)}>
                            <Icon as={MdEdit} />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" px={2} onClick={()=> navigate(`/admin/appointments/${b.appointmentId}/bill`)} title="View Bill">
                          <Icon as={MdReceiptLong} />
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {(!data || (data?.bills||[]).length===0) && (
                  <Tr><Td colSpan={8}><Text textAlign="center" color="gray.500">No bills found</Text></Td></Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
          {/* Pagination */}
          {totalBillsCount > limit && (
            <Card bg={cardBg} borderColor={borderColor} mt={4}>
              <CardBody>
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                  <Text fontSize="sm" color="gray.600">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalBillsCount)} of {totalBillsCount} bills
                  </Text>
                  <HStack spacing={2}>
                    <Button size="sm" variant="outline" leftIcon={<ChevronLeftIcon />} onClick={()=> setPage(p=> Math.max(1, p-1))} isDisabled={currentPage === 1}>
                      Previous
                    </Button>
                    <HStack spacing={1}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                        .map((p, index, arr) => (
                          <React.Fragment key={p}>
                            {index > 0 && arr[index - 1] !== p - 1 && <Text>...</Text>}
                            <Button size="sm" variant={p === currentPage ? 'primary' : 'outline'} onClick={()=> setPage(p)}>
                              {p}
                            </Button>
                          </React.Fragment>
                        ))}
                    </HStack>
                    <Button size="sm" variant="outline" rightIcon={<ChevronRightIcon />} onClick={()=> setPage(p=> Math.min(totalPages, p+1))} isDisabled={currentPage === totalPages}>
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default AllBills;


