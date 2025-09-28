import React, { useState } from 'react';
import {
  Box, Button, HStack, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, useToast, SimpleGrid, Badge, Divider, Icon, Flex, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Progress, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Select, Input, FormControl, FormLabel, Textarea
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetReferredDoctorDetailsQuery, useGetAppointmentsQuery, useAddPaymentMutation, useListPaymentsQuery } from '../../../features/api/referredDoctors';
import { useAddCommissionMutation } from '../../../features/api/appointmentCommission';
import { MdPerson, MdBusiness, MdPhone, MdEmail, MdAttachMoney, MdTrendingUp, MdPeople, MdEvent, MdArrowBack, MdReceipt, MdAssessment, MdAdd, MdCheckCircle, MdPending, MdCalendarToday, MdVisibility } from 'react-icons/md';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ReferredDoctorAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommissionOpen, onOpen: onCommissionOpen, onClose: onCommissionClose } = useDisclosure();

  const {
    data: doctorData,
    isLoading,
    error,
    refetch
  } = useGetReferredDoctorDetailsQuery(id);

  // Appointments data
  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError } = useGetAppointmentsQuery({ id });
  const [addCommission, { isLoading: isAddingCommission }] = useAddCommissionMutation();
  
  // Debug API call
  console.log('=== API CALL DEBUG ===');
  console.log('appointmentsLoading:', appointmentsLoading);
  console.log('appointmentsError:', appointmentsError);
  console.log('appointmentsData from API:', appointmentsData);
  console.log('=== END API CALL DEBUG ===');

  const referredDoctor = doctorData?.referredDoctor;
  const statistics = doctorData?.statistics;
  const monthlyStats = doctorData?.monthlyStats;
  const recentAppointments = doctorData?.recentAppointments;

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBtn = { bg: "#2BA8D1", color: "white", transform: "translateY(-2px)", boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)" };

  // Payments
  const currentYear = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(currentYear);
  const { data: paymentsData, refetch: refetchPayments } = useListPaymentsQuery({ id, year: yearFilter });
  const [addPayment, { isLoading: addingPayment }] = useAddPaymentMutation();
  const payments = paymentsData?.payments || [];
  const [newPayment, setNewPayment] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  // Commission management
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [commissionData, setCommissionData] = useState({
    commissionAmount: '',
    notes: '',
    commissionType: 'amount' // 'amount' or 'percentage'
  });
  
  // Debug state changes
  React.useEffect(() => {
    console.log('State changed - selectedAppointmentId:', selectedAppointmentId);
  }, [selectedAppointmentId]);

  // Chart colors
  const COLORS = ['#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c'];

  // Commission functions
  const handleAddCommission = (appointment) => {
    
    const appointmentId = appointment._id || appointment.id;
    
    if (!appointmentId) {
      toast({
        title: 'Error',
        description: 'Appointment ID not found',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Convert to string if it's an ObjectId
    const appointmentIdString = appointmentId.toString();
  
    
    setSelectedAppointment(appointment);
    setSelectedAppointmentId(appointmentIdString);
    setCommissionData({
      commissionAmount: appointment.commissionAmount || '',
      notes: appointment.commissionNotes || ''
    });
    
   
    
    onCommissionOpen();
  };

  const handleSubmitCommission = async () => {
    if (!commissionData.commissionAmount || commissionData.commissionAmount <= 0) {
      toast({
        title: 'Invalid Commission Amount',
        description: 'Please enter a valid commission amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let finalCommissionAmount = parseFloat(commissionData.commissionAmount);
    
    // If percentage, calculate based on bill amount
    if (commissionData.commissionType === 'percentage') {
      if (finalCommissionAmount > 100) {
        toast({
          title: 'Invalid Percentage',
          description: 'Percentage cannot be more than 100%',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      finalCommissionAmount = (selectedAppointment.charges * finalCommissionAmount) / 100;
    }

    try {
      console.log('handleSubmitCommission - selectedAppointmentId:', selectedAppointmentId);
      console.log('handleSubmitCommission - selectedAppointmentId type:', typeof selectedAppointmentId);
      console.log('handleSubmitCommission - selectedAppointment:', selectedAppointment);
      console.log('handleSubmitCommission - commissionData:', commissionData);
      
      if (!selectedAppointmentId) {
        console.error('handleSubmitCommission - No appointment ID found!');
        toast({
          title: 'Error',
          description: 'No appointment selected or appointment ID missing',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      const commissionPayload = {
        appointmentId: selectedAppointmentId,
        commissionAmount: finalCommissionAmount,
        notes: commissionData.notes,
        commissionType: commissionData.commissionType
      };
      
      console.log('handleSubmitCommission - sending data:', commissionPayload);
      console.log('handleSubmitCommission - appointmentId in payload:', commissionPayload.appointmentId);
      console.log('handleSubmitCommission - appointmentId type:', typeof commissionPayload.appointmentId);
      
      await addCommission(commissionPayload).unwrap();

      toast({
        title: 'Commission Added Successfully',
        description: `Commission of ₹${finalCommissionAmount.toFixed(2)} added to appointment`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onCommissionClose();
      setCommissionData({ commissionAmount: '', notes: '', commissionType: 'amount' });
      setSelectedAppointmentId(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error Adding Commission',
        description: error?.data?.message || 'Failed to add commission',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // handleMarkPaid function removed - using separate commission payment structure

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'booked': return 'blue';
      case 'assigned': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getCommissionStatusColor = (commissionPaid, commissionAmount) => {
    if (commissionAmount <= 0) return 'gray';
    return commissionPaid ? 'green' : 'orange';
  };

  const getCommissionStatusText = (commissionPaid, commissionAmount) => {
    if (commissionAmount <= 0) return 'No Commission';
    return commissionPaid ? 'Paid' : 'Pending';
  };

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

  const appointments = appointmentsData?.appointments || [];
  const appointmentsSummary = appointmentsData?.summary || {};
  
  // Debug appointments data
  console.log('=== FRONTEND DEBUG ===');
  console.log('appointmentsData:', appointmentsData);
  console.log('appointments:', appointments);
  console.log('appointmentsSummary:', appointmentsSummary);
  console.log('appointmentsSummary keys:', Object.keys(appointmentsSummary));
  console.log('appointmentsSummary.totalAppointments:', appointmentsSummary.totalAppointments);
  console.log('appointmentsSummary.totalBillAmount:', appointmentsSummary.totalBillAmount);
  console.log('appointmentsSummary.totalCommissionEarned:', appointmentsSummary.totalCommissionEarned);
  console.log('appointmentsSummary.pendingCommission:', appointmentsSummary.pendingCommission);
  console.log('=== END FRONTEND DEBUG ===');
  
  if (appointments.length > 0) {
    console.log('First appointment ID:', appointments[0]._id);
    console.log('First appointment keys:', Object.keys(appointments[0]));
  }
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
          </SimpleGrid>
        </CardBody>
      </Card>


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

      {/* Appointment Management Section */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader>
          <Heading size="md" color="#0C2F4D">
            <Icon as={MdPerson} mr={2} />
            Appointment Management
          </Heading>
        </CardHeader>
        <CardBody>
          {/* Summary Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Appointments</StatLabel>
                  <StatNumber color="#2BA8D1">{appointmentsSummary.totalAppointments || 0}</StatNumber>
                  <StatHelpText>
                    <Icon as={MdCalendarToday} mr={1} />
                    All time
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Bill Amount</StatLabel>
                  <StatNumber color="green.500">{formatCurrency(appointmentsSummary.totalBillAmount || 0)}</StatNumber>
                  <StatHelpText>
                    <Icon as={MdReceipt} mr={1} />
                    From all appointments
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Commission Earned</StatLabel>
                  <StatNumber color="orange.500">{formatCurrency(appointmentsSummary.totalCommissionEarned || 0)}</StatNumber>
                  <StatHelpText>
                    <Icon as={MdAttachMoney} mr={1} />
                    Total commission
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Pending Commission</StatLabel>
                  <StatNumber color="red.500">{formatCurrency(appointmentsSummary.pendingCommission || 0)}</StatNumber>
                  <StatHelpText>
                    <Icon as={MdPending} mr={1} />
                    Unpaid amount
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Appointments Table */}
          {appointmentsLoading ? (
            <Center py={10}>
              <VStack spacing={4}>
                <Spinner size="xl" color="#2BA8D1" />
                <Text>Loading appointments...</Text>
              </VStack>
            </Center>
          ) : appointmentsError ? (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>Failed to load appointments.</AlertDescription>
            </Alert>
          ) : appointments.length === 0 ? (
            <Center py={10}>
              <VStack spacing={4}>
                <Icon as={MdCalendarToday} boxSize={12} color="gray.400" />
                <Text fontSize="lg" color="gray.500" fontWeight="medium">
                  No appointments found
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  This referred doctor doesn't have any appointments yet.
                </Text>
              </VStack>
            </Center>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Patient</Th>
                    <Th>Service</Th>
                    <Th>Bill Amount</Th>
                    <Th>Commission</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {appointments.map((appointment) => (
                    <Tr key={appointment._id || appointment.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {formatDate(appointment.date)}
                          </Text>
                          <Text fontSize="xs" color={textColor}>
                            {appointment.timeSlot}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {appointment.patientId?.name || 'N/A'}
                          </Text>
                          <Text fontSize="xs" color={textColor}>
                            {appointment.patientId?.contact || 'N/A'}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{appointment.service}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium" color="green.500">
                          {formatCurrency(appointment.charges)}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium" color="orange.500">
                            {formatCurrency(appointment.commissionAmount)}
                          </Text>
                          {/* <Badge 
                            colorScheme={getCommissionStatusColor(appointment.commissionPaid, appointment.commissionAmount)}
                            size="sm"
                          >
                            {getCommissionStatusText(appointment.commissionPaid, appointment.commissionAmount)}
                          </Badge> */}
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            borderColor="#2BA8D1"
                            color="#2BA8D1"
                            leftIcon={<Icon as={MdAdd} />}
                            onClick={() => handleAddCommission(appointment)}
                            _hover={{ bg: "#2BA8D1", color: "white" }}
                          >
                            Add Commission
                          </Button>
                          {/* Removed Mark Paid flow; managed via Commission Payments section */}
                          <Button
                            size="sm"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.600"
                            leftIcon={<Icon as={MdVisibility} />}
                            _hover={{ bg: "gray.100" }}
                            onClick={() => navigate(`/admin/appointments/${appointment._id || appointment.id}/bill`)}
                          >
                            View Bill
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
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
      {/* <Card bg={cardBg} borderColor={borderColor}>
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
      </Card> */}

      {/* Add Commission Modal */}
      <Modal isOpen={isCommissionOpen} onClose={onCommissionClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Commission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Commission Type</FormLabel>
                <Select
                  value={commissionData.commissionType}
                  onChange={(e) => setCommissionData({
                    ...commissionData,
                    commissionType: e.target.value
                  })}
                >
                  <option value="amount">Fixed Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>
                  Commission {commissionData.commissionType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                </FormLabel>
                <Input
                  type="number"
                  value={commissionData.commissionAmount}
                  onChange={(e) => setCommissionData({
                    ...commissionData,
                    commissionAmount: e.target.value
                  })}
                  placeholder={commissionData.commissionType === 'percentage' ? 'Enter percentage (e.g., 10)' : 'Enter commission amount'}
                  max={commissionData.commissionType === 'percentage' ? 100 : undefined}
                />
                {commissionData.commissionType === 'percentage' && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Bill Amount: ₹{selectedAppointment?.charges?.toLocaleString() || 0}
                    {commissionData.commissionAmount && (
                      <Text as="span" ml={2}>
                        → Commission: ₹{((selectedAppointment?.charges || 0) * parseFloat(commissionData.commissionAmount || 0) / 100).toFixed(2)}
                      </Text>
                    )}
                  </Text>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Notes (Optional)</FormLabel>
                <Textarea
                  value={commissionData.notes}
                  onChange={(e) => setCommissionData({
                    ...commissionData,
                    notes: e.target.value
                  })}
                  placeholder="Add any notes about this commission"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onCommissionClose}>
                Cancel
              </Button>
              <Button
                bg="#2BA8D1"
                color="white"
                onClick={handleSubmitCommission}
                isLoading={isAddingCommission}
                _hover={{ bg: "#0C2F4D" }}
              >
                Add Commission
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
