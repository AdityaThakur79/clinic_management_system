import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, useToast, SimpleGrid, Badge, Divider, Icon, Flex, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Progress, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Select, Input
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetReferredDoctorDetailsQuery } from '../../../features/api/patientApi';
import { useAddPaymentMutation, useListPaymentsQuery } from '../../../features/api/referredDoctors';
import { MdPerson, MdBusiness, MdPhone, MdEmail, MdAttachMoney, MdTrendingUp, MdPeople, MdEvent, MdArrowBack, MdReceipt, MdAssessment } from 'react-icons/md';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ReferredDoctorAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    data: doctorData,
    isLoading,
    error,
    refetch
  } = useGetReferredDoctorDetailsQuery(id);

  const referredDoctor = doctorData?.referredDoctor;
  const statistics = doctorData?.statistics;
  const monthlyStats = doctorData?.monthlyStats;
  const recentAppointments = doctorData?.recentAppointments;

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBtn = { bg: "#2BA8D1", color: "white", transform: "translateY(-2px)", boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)" };

  // Payments
  const currentYear = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(currentYear);
  const { data: paymentsData, refetch: refetchPayments } = useListPaymentsQuery({ id, year: yearFilter });
  const [addPayment, { isLoading: addingPayment }] = useAddPaymentMutation();
  const payments = paymentsData?.payments || [];
  const [newPayment, setNewPayment] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  // Chart colors
  const COLORS = ['#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c'];

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading referred doctor analytics...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Alert status="error" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              Failed to load referred doctor details. Please try again.
            </AlertDescription>
          </Box>
        </Alert>
      </Center>
    );
  }

  if (!referredDoctor) {
    return (
      <Center h="100vh">
        <Alert status="warning" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>No Data!</AlertTitle>
            <AlertDescription>
              Referred doctor not found.
            </AlertDescription>
          </Box>
        </Alert>
      </Center>
    );
  }

  // Prepare chart data
  const chartData = monthlyStats?.map(stat => ({
    month: stat.month.split('-')[1], // Extract month number
    earnings: stat.earnings,
    patients: stat.patientsCount,
    appointments: stat.appointmentsCount
  })) || [];

  const pieData = [
    { name: 'Total Earnings', value: statistics?.totalEarnings || 0 },
    { name: 'Paid Amount', value: statistics?.totalPaid || 0 },
    { name: 'Pending Amount', value: statistics?.pendingAmount || 0 }
  ];

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={4}>
          <Button
            leftIcon={<Icon as={MdArrowBack} />}
            variant="outline"
            onClick={() => navigate(-1)}
            _hover={hoverBtn}
          >
            Back
          </Button>
          <Heading size="lg">Referred Doctor Analytics</Heading>
        </HStack>
        <Button
          leftIcon={<Icon as={MdAssessment} />}
          colorScheme="blue"
          onClick={onOpen}
          _hover={hoverBtn}
        >
          Detailed Report
        </Button>
      </Flex>

      {/* Doctor Info Card */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader>
          <Heading size="md" color="blue.500">
            <Icon as={MdPerson} mr={2} />
            Doctor Information
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Name</Text>
              <Text fontSize="lg">{referredDoctor.name}</Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Clinic</Text>
              <Text>{referredDoctor.clinicName}</Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Contact</Text>
              <Text>{referredDoctor.contact}</Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Commission Rate</Text>
              <Badge colorScheme="green" fontSize="md" p={2}>
                {referredDoctor.commissionRate}%
              </Badge>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Total Patients</StatLabel>
              <StatNumber color="blue.500">{statistics?.totalPatients || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Referred patients
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Total Earnings</StatLabel>
              <StatNumber color="green.500">₹{statistics?.totalEarnings?.toLocaleString() || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                From referrals
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Paid Amount</StatLabel>
              <StatNumber color="purple.500">₹{statistics?.totalPaid?.toLocaleString() || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Commission paid
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Pending Amount</StatLabel>
              <StatNumber color="orange.500">₹{statistics?.pendingAmount?.toLocaleString() || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                Awaiting payment
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts Section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        {/* Monthly Earnings Chart */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color="green.500">
              <Icon as={MdTrendingUp} mr={2} />
              Monthly Earnings Trend
            </Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Earnings']} />
                  <Line type="monotone" dataKey="earnings" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Patient & Appointment Chart */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color="blue.500">
              <Icon as={MdPeople} mr={2} />
              Patients & Appointments
            </Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#059669" />
                  <Bar dataKey="appointments" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Earnings Distribution */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader>
          <Heading size="md" color="purple.500">
            <Icon as={MdAttachMoney} mr={2} />
            Earnings Distribution
          </Heading>
        </CardHeader>
        <CardBody>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>

      {/* Commission Payments */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="teal.500">Commission Payments</Heading>
            <HStack>
              <Text fontSize="sm" color="gray.600">Year</Text>
              <Select size="sm" value={yearFilter} onChange={(e)=>{ setYearFilter(Number(e.target.value)); refetchPayments(); }}>
                {Array.from({length:5}).map((_,i)=>{
                  const y = currentYear - i; return <option key={y} value={y}>{y}</option>;
                })}
              </Select>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1 }} spacing={4} mb={4}>
            <HStack spacing={4} align="center" wrap="wrap">
              <Input type="number" placeholder="Amount (₹)" value={newPayment.amount} onChange={(e)=> setNewPayment({...newPayment, amount: e.target.value})} maxW="200px" />
              <Input type="date" value={newPayment.date} onChange={(e)=> setNewPayment({...newPayment, date: e.target.value})} maxW="200px" />
              <Input placeholder="Notes" value={newPayment.notes} onChange={(e)=> setNewPayment({...newPayment, notes: e.target.value})} maxW="300px" />
              <Button variant="primary" isLoading={addingPayment} onClick={async()=>{
                  if (!newPayment.amount) { toast({ title: 'Enter amount', status: 'warning' }); return; }
                  await addPayment({ id, amount: parseFloat(newPayment.amount), date: newPayment.date, notes: newPayment.notes }).unwrap();
                  toast({ title: 'Payment recorded', status: 'success' });
                  setNewPayment({ amount:'', date: new Date().toISOString().split('T')[0], notes:'' });
                  refetch(); refetchPayments();
                }} _hover={hoverBtn}>Add Payment</Button>
            </HStack>
          </SimpleGrid>
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th isNumeric>Amount (₹)</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {payments.map((p)=> (
                  <Tr key={p._id}>
                    <Td>{new Date(p.date).toLocaleDateString()}</Td>
                    <Td isNumeric>{(p.amount||0).toLocaleString('en-IN')}</Td>
                    <Td>{p.notes || '-'}</Td>
                  </Tr>
                ))}
                {payments.length === 0 && (
                  <Tr><Td colSpan={3}><Text textAlign="center" color="gray.500">No payments for {yearFilter}</Text></Td></Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Recent Appointments */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="orange.500">
            <Icon as={MdEvent} mr={2} />
            Recent Appointments
          </Heading>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Patient</Th>
                  <Th>Doctor</Th>
                  <Th>Date</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentAppointments?.map((appointment) => (
                  <Tr key={appointment._id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{appointment.patientId?.name}</Text>
                        <Text fontSize="sm" color="gray.600">{appointment.patientId?.contact}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text>{appointment.doctorId?.name}</Text>
                      <Text fontSize="sm" color="gray.600">{appointment.doctorId?.specialization}</Text>
                    </Td>
                    <Td>{new Date(appointment.billId?.billDate).toLocaleDateString()}</Td>
                    <Td fontWeight="bold">₹{appointment.billId?.totalAmount?.toLocaleString()}</Td>
                    <Td>
                      <Badge colorScheme={appointment.billId?.paymentStatus === 'paid' ? 'green' : 'yellow'}>
                        {appointment.billId?.paymentStatus}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Detailed Report Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detailed Analytics Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">Commission Summary:</Text>
              <Text>Total Referrals: {statistics?.totalPatients}</Text>
              <Text>Commission Rate: {referredDoctor.commissionRate}%</Text>
              <Text>Total Earnings: ₹{statistics?.totalEarnings?.toLocaleString()}</Text>
              <Text>Amount Paid: ₹{statistics?.totalPaid?.toLocaleString()}</Text>
              <Text>Pending Amount: ₹{statistics?.pendingAmount?.toLocaleString()}</Text>
              
              <Divider />
              
              <Text fontWeight="bold">Monthly Breakdown:</Text>
              {monthlyStats?.map((stat, index) => (
                <Flex key={index} justify="space-between">
                  <Text>{stat.month}</Text>
                  <Text>₹{stat.earnings.toLocaleString()} ({stat.appointmentsCount} appointments)</Text>
                </Flex>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReferredDoctorAnalytics;
