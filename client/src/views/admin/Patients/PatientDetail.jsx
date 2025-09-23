import React, { useState } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Checkbox,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdCalendarToday,
  MdLocalHospital,
  MdAttachMoney,
  MdReceipt,
  MdEdit,
  MdAdd,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdBusiness,
  MdStar
} from 'react-icons/md';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPatientDetailsQuery, useCompleteAppointmentMutation } from '../../../features/api/patientApi';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    symptoms: [],
    medicines: [],
    treatment: '',
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
    doctorNotes: '',
    patientInstructions: ''
  });
  const [billForm, setBillForm] = useState({
    consultationFee: 0,
    treatmentFee: 0,
    medicineFee: 0,
    otherCharges: 0,
    discount: 0,
    tax: 0,
    paymentMethod: 'cash',
    paidAmount: 0,
    notes: ''
  });

  // Prescription filters (must be declared before any early returns)
  const [rxSearch, setRxSearch] = useState('');
  const [rxStartDate, setRxStartDate] = useState('');
  const [rxEndDate, setRxEndDate] = useState('');

  // Brand button styles
  const brandHover = {
    _hover: {
      bg: '#2BA8D1',
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(43,168,209,0.3)'
    },
    _active: { bg: '#2696ba', transform: 'translateY(0)' },
    transition: 'all 0.15s ease'
  };

  const { data, isLoading, error } = useGetPatientDetailsQuery(id);
  const [completeAppointment, { isLoading: isCompleting }] = useCompleteAppointmentMutation();

  // Debug logging
  console.log('PatientDetail - ID:', id);
  console.log('PatientDetail - Data:', data);
  console.log('PatientDetail - Loading:', isLoading);
  console.log('PatientDetail - Error:', error);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Text>Loading patient details...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Failed to load patient details.</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert status="info">
        <AlertIcon />
        <AlertTitle>No Data!</AlertTitle>
        <AlertDescription>Patient details not found.</AlertDescription>
      </Alert>
    );
  }

  const { patient, statistics } = data;

  // Additional safety check
  if (!patient) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Patient data is missing.</AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'booked': return 'blue';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'partial': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

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

  const formatMethod = (value) => {
    if (!value || typeof value !== 'string') return '';
    const cleaned = value.replace(/_/g, ' ').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };


  const handleCompleteAppointment = (appointment) => {
    // Navigate to enhanced complete appointment page
    navigate(`/admin/appointments/${appointment._id}/enhanced-complete`);
  };

  const handleSubmitCompleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await completeAppointment({
        appointmentId: selectedAppointment._id,
        prescription: prescriptionForm,
        bill: billForm,
        patientUpdate: {} // No patient update in this modal
      }).unwrap();

      toast({
        title: "Appointment completed successfully",
        status: "success",
        duration: 3000,
      });
      
      onClose();
      // Reset forms
      setPrescriptionForm({
        diagnosis: '',
        symptoms: [],
        medicines: [],
        treatment: '',
        followUpRequired: false,
        followUpDate: '',
        followUpNotes: '',
        doctorNotes: '',
        patientInstructions: ''
      });
      setBillForm({
        consultationFee: 0,
        treatmentFee: 0,
        medicineFee: 0,
        otherCharges: 0,
        discount: 0,
        tax: 0,
        paymentMethod: 'cash',
        paidAmount: 0,
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Failed to complete appointment",
        description: error.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handlePrescriptionChange = (field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBillChange = (field, value) => {
    setBillForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    }));
  };

  const removeMedicine = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const updateMedicine = (index, field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
     
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
       
        <Button
          variant="outline"
          onClick={() => navigate('/admin/patients')}
          leftIcon={<Icon as={MdEdit} />}
          {...brandHover}
        >
          Back to Patients
        </Button>
      </Flex>

      {/* Patient Information Card */}
      <Card mb={6} boxShadow="lg">
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
            <Box>
              <Icon as={MdPerson} boxSize={12} color="brand.500" />
            </Box>
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2} flex={1}>
              <Heading size="md">{patient.name}</Heading>
              <HStack spacing={4}>
                <HStack>
                  <Icon as={MdPhone} />
                  <Text>{patient.contact}</Text>
                </HStack>
                {patient.email && (
                  <HStack>
                    <Icon as={MdEmail} />
                    <Text>{patient.email}</Text>
                  </HStack>
                )}
              </HStack>
              {patient.address && (
                <HStack>
                  <Icon as={MdLocationOn} />
                  <Text>{patient.address}</Text>
                </HStack>
              )}
              <HStack spacing={4}>
                <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                  {patient.gender || 'Not specified'}
                </Badge>
                <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                  {patient.age || 0} years
                </Badge>
                <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                  {patient.plan?.type || 'standard'} Plan
                </Badge>
              </HStack>
            </VStack>
            {patient.branchId && (
              <VStack align="flex-end" spacing={2}>
                <Text fontSize="sm" color="gray.600">Branch</Text>
                <Text fontWeight="semibold">{patient.branchId.branchName}</Text>
                <Text fontSize="sm" color="gray.600">{patient.branchId.address}</Text>
              </VStack>
            )}
          </Flex>
        </CardBody>
      </Card>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card borderColor="#2BA8D1" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel>Total Appointments</StatLabel>
              <StatNumber>{statistics?.totalAppointments || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {statistics?.completedAppointments || 0} completed
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card borderColor="#2BA8D1" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel>Total Bills</StatLabel>
              <StatNumber>{statistics?.totalBills || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {formatCurrency(statistics?.totalAmount || 0)}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card borderColor="#2BA8D1" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel>Pending Appointments</StatLabel>
              <StatNumber>{statistics?.pendingAppointments || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                Need attention
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card borderColor="#2BA8D1" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel>Wallet Balance</StatLabel>
              <StatNumber>{formatCurrency(patient.plan?.walletAmount || 0)}</StatNumber>
              <StatHelpText>
                {patient.plan?.visitsRemaining || 0} visits remaining
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Tabs for different sections */}
      <Tabs>
        <TabList>
          <Tab>Appointments</Tab>
          <Tab>Prescriptions</Tab>
          <Tab>Bills</Tab>
        </TabList>

        <TabPanels>
          {/* Appointments Tab */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Date & Time</Th>
                        <Th>Doctor</Th>
                        <Th>Branch</Th>
                        <Th>Status</Th>
                        <Th>Charges</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(patient.appointments || []).map((appointment) => (
                        <Tr key={appointment._id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">
                                {formatDate(appointment.date)}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {appointment.timeSlot}
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
                          <Td>{appointment.branchId?.branchName}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </Td>
                          <Td>
                            {appointment.billId ? 
                              formatCurrency(appointment.billId.totalAmount) : 
                              formatCurrency(appointment.charges || 0)
                            }
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              {appointment.status === 'booked' && (
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleCompleteAppointment(appointment)}
                                  leftIcon={<Icon as={MdCheckCircle} />}
                                >
                                  Complete
                                </Button>
                              )}
                              {appointment.status === 'completed' && (
                                <Badge colorScheme="green">Completed</Badge>
                              )}
                              {appointment.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  variant="outline"
                                  onClick={() => navigate(`/admin/appointments/${appointment._id}/edit`)}
                                  leftIcon={<Icon as={MdEdit} />}
                                >
                                  Edit
                                </Button>
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Prescriptions Tab */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Prescription Filters */}
                  <HStack spacing={3} flexWrap="wrap">
                    <Input
                      placeholder="Search prescriptions (diagnosis, medicine, notes)"
                      value={rxSearch}
                      onChange={(e) => setRxSearch(e.target.value)}
                      maxW="360px"
                    />
                    <HStack>
                      <Text fontSize="sm" color="gray.600">From</Text>
                      <Input type="date" value={rxStartDate} onChange={(e)=> setRxStartDate(e.target.value)} />
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">To</Text>
                      <Input type="date" value={rxEndDate} onChange={(e)=> setRxEndDate(e.target.value)} />
                    </HStack>
                  </HStack>
                  {(patient.appointments || [])
                    .filter(apt => apt.prescriptionId)
                    // Sort by createdAt desc
                    .sort((a,b) => new Date(b.prescriptionId?.createdAt || b.date) - new Date(a.prescriptionId?.createdAt || a.date))
                    // Apply filters
                    .filter(appointment => {
                      const rx = appointment.prescriptionId || {};
                      const text = `${rx.diagnosis || ''} ${(rx.medicines||[]).map(m=>m.name).join(' ')} ${rx.treatment || ''} ${rx.doctorNotes || ''}`.toLowerCase();
                      const matchSearch = !rxSearch || text.includes(rxSearch.toLowerCase());
                      const created = new Date(rx.createdAt || appointment.date);
                      const afterStart = !rxStartDate || created >= new Date(rxStartDate);
                      const beforeEnd = !rxEndDate || created <= new Date(rxEndDate + 'T23:59:59');
                      return matchSearch && afterStart && beforeEnd;
                    })
                    .map((appointment) => (
                      <Card key={appointment._id} variant="outline">
                        <CardBody>
                          <HStack justify="space-between" mb={4}>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">
                                {formatDate(appointment.prescriptionId?.createdAt || appointment.date)} - {appointment.timeSlot}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Dr. {appointment.doctorId?.name}
                              </Text>
                            </VStack>
                            <Badge colorScheme="blue">Prescription</Badge>
                          </HStack>
                          
                          {appointment.prescriptionId && (
                            <VStack align="stretch" spacing={3}>
                              {appointment.prescriptionId.diagnosis && (
                                <Box>
                                  <Text fontWeight="semibold" mb={2}>Diagnosis:</Text>
                                  <Text>{appointment.prescriptionId.diagnosis}</Text>
                                </Box>
                              )}
                              
                              {(appointment.prescriptionId.symptoms || []).length > 0 && (
                                <Box>
                                  <Text fontWeight="semibold" mb={2}>Symptoms:</Text>
                                  <HStack spacing={2} flexWrap="wrap">
                                    {(appointment.prescriptionId.symptoms || []).map((symptom, index) => (
                                      <Tag key={index} colorScheme="orange">
                                        <TagLabel>{symptom}</TagLabel>
                                      </Tag>
                                    ))}
                                  </HStack>
                                </Box>
                              )}
                              
                              {(appointment.prescriptionId.medicines || []).length > 0 && (
                                <Box>
                                  <Text fontWeight="semibold" mb={2}>Medicines:</Text>
                                  <VStack align="stretch" spacing={2}>
                                    {(appointment.prescriptionId.medicines || []).map((medicine, index) => (
                                      <Box key={index} p={3} bg="gray.50" borderRadius="md">
                                        <Text fontWeight="semibold">{medicine.name}</Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {medicine.dosage} - {medicine.frequency} - {medicine.duration}
                                        </Text>
                                        {medicine.instructions && (
                                          <Text fontSize="sm" color="gray.600" mt={1}>
                                            {medicine.instructions}
                                          </Text>
                                        )}
                                      </Box>
                                    ))}
                                  </VStack>
                                </Box>
                              )}
                              
                              {appointment.prescriptionId.treatment && (
                                <Box>
                                  <Text fontWeight="semibold" mb={2}>Treatment:</Text>
                                  <Text>{appointment.prescriptionId.treatment}</Text>
                                </Box>
                              )}
                              
                              {appointment.prescriptionId.followUpRequired && (
                                <Box>
                                  <Text fontWeight="semibold" mb={2}>Follow-up Required:</Text>
                                  <Text>
                                    {appointment.prescriptionId.followUpDate ? 
                                      formatDate(appointment.prescriptionId.followUpDate) : 
                                      'Date not specified'
                                    }
                                  </Text>
                                  {appointment.prescriptionId.followUpNotes && (
                                    <Text fontSize="sm" color="gray.600" mt={1}>
                                      {appointment.prescriptionId.followUpNotes}
                                    </Text>
                                  )}
                                </Box>
                              )}
                            </VStack>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  
                  {(patient.appointments || []).filter(apt => apt.prescriptionId).length === 0 && (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>No prescriptions found for this patient.</AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Bills Tab */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Bill Number</Th>
                        <Th>Date</Th>
                        <Th>Amount</Th>
                        <Th>Payment Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(patient.appointments || [])
                        .filter(apt => apt.billId)
                        .map((appointment) => (
                          <Tr key={appointment._id}>
                            <Td>{appointment.billId.billNumber}</Td>
                            <Td>{formatDate(appointment.billId.billDate)}</Td>
                            <Td>{formatCurrency(appointment.billId.totalAmount)}</Td>
                            <Td>
                              <Badge colorScheme={getPaymentStatusColor(appointment.billId.paymentStatus)}>
                                {appointment.billId.paymentStatus}
                              </Badge>
                            </Td>
                            <Td>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/admin/appointments/${appointment._id}/bill`)}
                                _hover={{
                                  bg: '#2BA8D1',
                                  color: 'white',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 10px 25px rgba(43, 168, 209, 0.3)'
                                }}
                              >
                                View Details
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>

          
        </TabPanels>
      </Tabs>

      {/* Complete Appointment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs>
              <TabList>
                <Tab>Prescription</Tab>
                <Tab>Billing</Tab>
              </TabList>
              
              <TabPanels>
                {/* Prescription Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Diagnosis</FormLabel>
                      <Input
                        value={prescriptionForm.diagnosis}
                        onChange={(e) => handlePrescriptionChange('diagnosis', e.target.value)}
                        placeholder="Enter diagnosis"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Treatment</FormLabel>
                      <Textarea
                        value={prescriptionForm.treatment}
                        onChange={(e) => handlePrescriptionChange('treatment', e.target.value)}
                        placeholder="Enter treatment details"
                        rows={3}
                      />
                    </FormControl>
                    
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <FormLabel>Medicines</FormLabel>
                        <Button size="sm" onClick={addMedicine} leftIcon={<Icon as={MdAdd} />}>
                          Add Medicine
                        </Button>
                      </HStack>
                      <VStack spacing={3} align="stretch">
                        {prescriptionForm.medicines.map((medicine, index) => (
                          <Card key={index} variant="outline">
                            <CardBody>
                              <HStack justify="space-between" mb={3}>
                                <Text fontWeight="semibold">Medicine {index + 1}</Text>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => removeMedicine(index)}
                                >
                                  <Icon as={MdCancel} />
                                </Button>
                              </HStack>
                              <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                  <FormLabel>Name</FormLabel>
                                  <Input
                                    value={medicine.name}
                                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                    placeholder="Medicine name"
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Dosage</FormLabel>
                                  <Input
                                    value={medicine.dosage}
                                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                    placeholder="e.g., 500mg"
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Frequency</FormLabel>
                                  <Input
                                    value={medicine.frequency}
                                    onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                    placeholder="e.g., 3 times daily"
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Duration</FormLabel>
                                  <Input
                                    value={medicine.duration}
                                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                    placeholder="e.g., 7 days"
                                  />
                                </FormControl>
                              </SimpleGrid>
                              <FormControl mt={3}>
                                <FormLabel>Instructions</FormLabel>
                                <Textarea
                                  value={medicine.instructions}
                                  onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                  placeholder="Special instructions"
                                  rows={2}
                                />
                              </FormControl>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </Box>
                    
                    <Checkbox
                      isChecked={prescriptionForm.followUpRequired}
                      onChange={(e) => handlePrescriptionChange('followUpRequired', e.target.checked)}
                    >
                      Follow-up required
                    </Checkbox>
                    
                    {prescriptionForm.followUpRequired && (
                      <FormControl>
                        <FormLabel>Follow-up Date</FormLabel>
                        <Input
                          type="date"
                          value={prescriptionForm.followUpDate}
                          onChange={(e) => handlePrescriptionChange('followUpDate', e.target.value)}
                        />
                      </FormControl>
                    )}
                    
                    <FormControl>
                      <FormLabel>Doctor Notes</FormLabel>
                      <Textarea
                        value={prescriptionForm.doctorNotes}
                        onChange={(e) => handlePrescriptionChange('doctorNotes', e.target.value)}
                        placeholder="Additional notes"
                        rows={3}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>
                
                {/* Billing Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel>Consultation Fee</FormLabel>
                        <NumberInput
                          value={billForm.consultationFee}
                          onChange={(value) => handleBillChange('consultationFee', value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Treatment Fee</FormLabel>
                        <NumberInput
                          value={billForm.treatmentFee}
                          onChange={(value) => handleBillChange('treatmentFee', value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Medicine Fee</FormLabel>
                        <NumberInput
                          value={billForm.medicineFee}
                          onChange={(value) => handleBillChange('medicineFee', value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Other Charges</FormLabel>
                        <NumberInput
                          value={billForm.otherCharges}
                          onChange={(value) => handleBillChange('otherCharges', value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>
                    
                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel>Discount</FormLabel>
                        <NumberInput
                          value={billForm.discount}
                          onChange={(value) => handleBillChange('discount', value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Tax</FormLabel>
                        <NumberInput
                          value={billForm.tax}
                          onChange={(value) => handleBillChange('tax', value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>
                    
                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          value={billForm.paymentMethod}
                          onChange={(e) => handleBillChange('paymentMethod', e.target.value)}
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="wallet">Wallet</option>
                          <option value="insurance">Insurance</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Paid Amount</FormLabel>
                        <NumberInput
                          value={billForm.paidAmount}
                          onChange={(value) => handleBillChange('paidAmount', value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>
                    
                    <FormControl>
                      <FormLabel>Notes</FormLabel>
                      <Textarea
                        value={billForm.notes}
                        onChange={(e) => handleBillChange('notes', e.target.value)}
                        placeholder="Additional billing notes"
                        rows={3}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
            
            <HStack justify="flex-end" mt={6} spacing={3}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="green" 
                onClick={handleSubmitCompleteAppointment}
                isLoading={isCompleting}
                loadingText="Completing..."
              >
                Complete Appointment
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
       
    </Box>
  );
}
