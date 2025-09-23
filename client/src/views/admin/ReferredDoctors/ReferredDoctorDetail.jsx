import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Divider,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  useColorModeValue as useColorMode,
} from '@chakra-ui/react';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdBusiness,
  MdAttachMoney,
  MdTrendingUp,
  MdPeople,
  MdCalendarToday,
  MdStar,
  MdReceipt,
  MdCheckCircle
} from 'react-icons/md';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetReferredDoctorDetailsQuery } from 'features/api/referredDoctors';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ReferredDoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorMode('white', 'gray.800');
  const borderColor = useColorMode('gray.200', 'gray.600');

  const { data, isLoading, error } = useGetReferredDoctorDetailsQuery(id);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Text>Loading referred doctor details...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Failed to load referred doctor details.</AlertDescription>
      </Alert>
    );
  }

  const { referredDoctor, recentAppointments, monthlyStats, statistics } = data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
  };

  // Prepare chart data
  const chartData = monthlyStats.map(stat => ({
    month: formatMonth(stat.month),
    earnings: stat.earnings,
    patients: stat.patientsCount,
    appointments: stat.appointmentsCount
  }));

  return (
    <Box pt={{ base: '130px', md: '100px', xl: '100px' }} px={6} maxW="1400px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="brand.500">
          Referred Doctor Details
        </Heading>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/referred-doctors')}
          leftIcon={<Icon as={MdBusiness} />}
        >
          Back to Referred Doctors
        </Button>
      </Flex>

      {/* Doctor Information Card */}
      <Card mb={6} boxShadow="lg">
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
            <Box>
              <Icon as={MdBusiness} boxSize={12} color="brand.500" />
            </Box>
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2} flex={1}>
              <Heading size="md">{referredDoctor.name}</Heading>
              <HStack spacing={4}>
                {referredDoctor.contact && (
                  <HStack>
                    <Icon as={MdPhone} />
                    <Text>{referredDoctor.contact}</Text>
                  </HStack>
                )}
                {referredDoctor.email && (
                  <HStack>
                    <Icon as={MdEmail} />
                    <Text>{referredDoctor.email}</Text>
                  </HStack>
                )}
              </HStack>
              {referredDoctor.clinicName && (
                <HStack>
                  <Icon as={MdLocationOn} />
                  <Text>{referredDoctor.clinicName}</Text>
                </HStack>
              )}
              {referredDoctor.address && (
                <Text fontSize="sm" color="gray.600">{referredDoctor.address}</Text>
              )}
              <HStack spacing={4}>
                {referredDoctor.specialization && (
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                    {referredDoctor.specialization}
                  </Badge>
                )}
                <Badge colorScheme={referredDoctor.isActive ? "green" : "red"} px={3} py={1} borderRadius="full">
                  {referredDoctor.isActive ? "Active" : "Inactive"}
                </Badge>
              </HStack>
            </VStack>
            {referredDoctor.branchId && (
              <VStack align="flex-end" spacing={2}>
                <Text fontSize="sm" color="gray.600">Branch</Text>
                <Text fontWeight="semibold">{referredDoctor.branchId.branchName}</Text>
                <Text fontSize="sm" color="gray.600">{referredDoctor.branchId.address}</Text>
              </VStack>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Patients</StatLabel>
              <StatNumber>{statistics.totalPatients}</StatNumber>
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
              <StatNumber>{formatCurrency(statistics.totalEarnings)}</StatNumber>
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
              <StatLabel>Commission Rate</StatLabel>
              <StatNumber>{statistics.commissionRate}%</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Per appointment
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pending Amount</StatLabel>
              <StatNumber>{formatCurrency(statistics.pendingAmount)}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                To be paid
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Tabs for different sections */}
      <Tabs>
        <TabList>
          <Tab>Earnings Overview</Tab>
          <Tab>Recent Appointments</Tab>
          <Tab>Referred Patients</Tab>
          <Tab>Monthly Reports</Tab>
        </TabList>

        <TabPanels>
          {/* Earnings Overview Tab */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Monthly Earnings Chart */}
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Monthly Earnings Trend</Heading>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            formatCurrency(value), 
                            name === 'earnings' ? 'Earnings' : name
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="earnings" 
                          stroke="#3AC0E7" 
                          strokeWidth={2}
                          dot={{ fill: '#3AC0E7' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardBody>
              </Card>

              {/* Appointments Chart */}
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Monthly Appointments</Heading>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#3AC0E7" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Recent Appointments Tab */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Recent Appointments</Heading>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Patient</Th>
                        <Th>Doctor</Th>
                        <Th>Amount</Th>
                        <Th>Commission</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentAppointments.map((appointment) => {
                        const commission = (appointment.billId?.totalAmount || 0) * (statistics.commissionRate / 100);
                        return (
                          <Tr key={appointment._id}>
                            <Td>{formatDate(appointment.createdAt)}</Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="semibold">
                                  {appointment.patientId?.name}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {appointment.patientId?.contact}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="semibold">
                                  {appointment.doctorId?.name}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {appointment.doctorId?.specialization}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>{formatCurrency(appointment.billId?.totalAmount || 0)}</Td>
                            <Td>{formatCurrency(commission)}</Td>
                            <Td>
                              <Badge colorScheme="green">
                                <Icon as={MdCheckCircle} mr={1} />
                                Completed
                              </Badge>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Referred Patients Tab */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Referred Patients</Heading>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Patient Name</Th>
                        <Th>Contact</Th>
                        <Th>Email</Th>
                        <Th>Plan Type</Th>
                        <Th>Referral Date</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {referredDoctor.patientsReferredIds.map((patient) => (
                        <Tr key={patient._id}>
                          <Td>
                            <Text fontWeight="semibold">{patient.name}</Text>
                          </Td>
                          <Td>{patient.contact}</Td>
                          <Td>{patient.email || '-'}</Td>
                          <Td>
                            <Badge colorScheme={patient.plan?.type === 'wallet' ? 'blue' : 'green'}>
                              {patient.plan?.type || 'standard'}
                            </Badge>
                          </Td>
                          <Td>{formatDate(patient.createdAt)}</Td>
                          <Td>
                            <Badge colorScheme="green">Active</Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Monthly Reports Tab */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Monthly Performance Report</Heading>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Month</Th>
                        <Th>Earnings</Th>
                        <Th>Patients</Th>
                        <Th>Appointments</Th>
                        <Th>Avg. per Patient</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {monthlyStats.map((stat, index) => {
                        const avgPerPatient = stat.patientsCount > 0 ? stat.earnings / stat.patientsCount : 0;
                        return (
                          <Tr key={index}>
                            <Td>{formatMonth(stat.month)}</Td>
                            <Td>
                              <Text fontWeight="semibold" color="green.600">
                                {formatCurrency(stat.earnings)}
                              </Text>
                            </Td>
                            <Td>{stat.patientsCount}</Td>
                            <Td>{stat.appointmentsCount}</Td>
                            <Td>{formatCurrency(avgPerPatient)}</Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Payment Summary */}
      <Card mt={6}>
        <CardBody>
          <Heading size="md" mb={4}>Payment Summary</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>Total Earnings</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {formatCurrency(statistics.totalEarnings)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>Amount Paid</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {formatCurrency(statistics.totalPaid)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>Pending Amount</Text>
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {formatCurrency(statistics.pendingAmount)}
              </Text>
              <Progress 
                value={(statistics.totalPaid / statistics.totalEarnings) * 100} 
                colorScheme="green" 
                size="sm" 
                mt={2}
              />
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
}

