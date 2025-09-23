import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Input, Select, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, FormControl, FormLabel, Textarea, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid, Checkbox as ChakraCheckbox, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Badge, Divider, Icon, Flex, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Heading
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAppointmentByIdQuery } from '../../../features/api/appointments';
import { useCompleteAppointmentMutation } from '../../../features/api/patientApi';
import { useGetAllServicesQuery } from '../../../features/api/service';
import { MdPerson, MdSchedule, MdBusiness, MdPhone, MdEmail, MdAssignment, MdReceipt, MdPrint, MdDownload } from 'react-icons/md';
import { useSelector } from 'react-redux';

const CompleteAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);

  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    symptoms: [],
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    treatment: '',
    followUpRequired: false,
    followUpDate: '',
    doctorNotes: '',
    patientInstructions: ''
  });

  const [patientUpdateForm, setPatientUpdateForm] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    email: '',
    address: '',
    plan: {
      type: 'basic',
      walletAmount: 0,
      visitsRemaining: 0,
      perVisitCharge: 0
    }
  });

  const [billForm, setBillForm] = useState({
    consultationFee: 0,
    treatmentFee: 0,
    medicineFee: 0,
    otherCharges: 0,
    discount: 0,
    tax: 0,
    paymentMethod: 'cash',
    notes: '',
    services: [] // Array of selected services
  });

  const [selectedServices, setSelectedServices] = useState([]);

  // API hooks
  const { data: appointmentData, isLoading, error } = useGetAppointmentByIdQuery(id);
  const { data: servicesData } = useGetAllServicesQuery({ page: 1, limit: 100, search: '' });
  const [completeAppointment, { isLoading: isCompleting }] = useCompleteAppointmentMutation();

  const appointment = appointmentData?.appointment;
  const services = servicesData?.services || [];

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Populate patient update form when appointment data loads
  useEffect(() => {
    if (appointment?.patientId) {
      const patient = appointment.patientId;
      setPatientUpdateForm({
        name: patient.name || '',
        age: patient.age || '',
        gender: patient.gender || '',
        contact: patient.contact || '',
        email: patient.email || '',
        address: patient.address || '',
        plan: {
          type: patient.plan?.type || 'basic',
          walletAmount: patient.plan?.walletAmount || 0,
          visitsRemaining: patient.plan?.visitsRemaining || 0,
          perVisitCharge: patient.plan?.perVisitCharge || 0
        }
      });
    }
  }, [appointment]);

  // Form handlers
  const handlePrescriptionChange = (field, value) => {
    setPrescriptionForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBillChange = (field, value) => {
    setBillForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientUpdateChange = (field, value) => {
    if (field.startsWith('plan.')) {
      const planField = field.split('.')[1];
      setPatientUpdateForm(prev => ({
        ...prev,
        plan: {
          ...prev.plan,
          [planField]: value
        }
      }));
    } else {
      setPatientUpdateForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const addMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
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
      medicines: prev.medicines.map((medicine, i) => 
        i === index ? { ...medicine, [field]: value } : medicine
      )
    }));
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.find(s => s._id === service._id);
      if (isSelected) {
        return prev.filter(s => s._id !== service._id);
      } else {
        return [...prev, service];
      }
    });
  };

  const calculateTotal = () => {
    const servicesTotal = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
    const consultationFee = parseFloat(billForm.consultationFee) || 0;
    const treatmentFee = parseFloat(billForm.treatmentFee) || 0;
    const medicineFee = parseFloat(billForm.medicineFee) || 0;
    const otherCharges = parseFloat(billForm.otherCharges) || 0;
    const discount = parseFloat(billForm.discount) || 0;
    const tax = parseFloat(billForm.tax) || 0;
    
    const subtotal = consultationFee + treatmentFee + medicineFee + otherCharges + servicesTotal;
    const total = subtotal - discount + tax;
    return total;
  };

  const handleCompleteAppointment = async () => {
    try {
      const servicesData = selectedServices.map(service => ({
        serviceId: service._id,
        name: service.name,
        price: service.price,
        description: service.description
      }));

      await completeAppointment({
        appointmentId: id,
        prescription: prescriptionForm,
        bill: {
          ...billForm,
          services: servicesData,
          totalAmount: calculateTotal()
        },
        patientUpdate: patientUpdateForm
      }).unwrap();
      
      toast({
        title: 'Appointment Completed',
        description: 'Appointment has been completed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/admin/appointments/all');
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to complete appointment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="#2BA8D1" />
          <Text>Loading appointment details...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Failed to load appointment details.</AlertDescription>
      </Alert>
    );
  }

  if (!appointment) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Appointment not found!</AlertTitle>
        <AlertDescription>The requested appointment could not be found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '100px', xl: '100px' }} px={6} maxW="1400px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="brand.500">
          Complete Appointment
        </Heading>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/appointments/all')}
          leftIcon={<Icon as={MdSchedule} />}
        >
          Back to Appointments
        </Button>
      </Flex>

      {/* Appointment Details Card */}
      <Card mb={6} boxShadow="lg">
        <CardHeader>
          <HStack>
            <Icon as={MdSchedule} boxSize={6} color="#2BA8D1" />
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">Appointment Details</Text>
              <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1}>
                {appointment.status}
              </Badge>
            </VStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Patient</Text>
              <Text fontWeight="semibold">{appointment.patientId?.name}</Text>
              <Text fontSize="sm" color="gray.600">{appointment.patientId?.contact}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Doctor</Text>
              <Text fontWeight="semibold">{appointment.doctorId?.name}</Text>
              <Text fontSize="sm" color="gray.600">{appointment.doctorId?.specialization}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Date & Time</Text>
              <Text fontWeight="semibold">{new Date(appointment.date).toLocaleDateString()}</Text>
              <Text fontSize="sm" color="gray.600">{appointment.timeSlot}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Branch</Text>
              <Text fontWeight="semibold">{appointment.branchId?.branchName}</Text>
              <Text fontSize="sm" color="gray.600">{appointment.branchId?.address}</Text>
            </Box>
            {appointment.referredDoctorId && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Referred By</Text>
                <Text fontWeight="semibold">{appointment.referredDoctorId.name}</Text>
                <Text fontSize="sm" color="gray.600">{appointment.referredDoctorId.clinicName}</Text>
              </Box>
            )}
            {appointment.notes && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Notes</Text>
                <Text fontWeight="semibold">{appointment.notes}</Text>
              </Box>
            )}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Completion Form */}
      <Card boxShadow="lg">
        <CardHeader>
          <HStack>
            <Icon as={MdAssignment} boxSize={6} color="#2BA8D1" />
            <Text fontSize="xl" fontWeight="bold">Complete Appointment</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <Tabs>
            <TabList>
              <Tab>Prescription</Tab>
              <Tab>Billing & Services</Tab>
              <Tab>Update Patient</Tab>
            </TabList>
            
            <TabPanels>
              {/* Prescription Tab */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
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
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="semibold">Medicines</Text>
                      <Button size="sm" onClick={addMedicine}>Add Medicine</Button>
                    </HStack>
                    <VStack spacing={3}>
                      {prescriptionForm.medicines.map((medicine, index) => (
                        <Card key={index}>
                          <CardBody>
                            <SimpleGrid columns={2} spacing={3}>
                              <FormControl>
                                <FormLabel>Medicine Name</FormLabel>
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
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => removeMedicine(index)}
                              mt={2}
                            >
                              Remove
                            </Button>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </Box>
                  
                  <ChakraCheckbox
                    isChecked={prescriptionForm.followUpRequired}
                    onChange={(e) => handlePrescriptionChange('followUpRequired', e.target.checked)}
                  >
                    Follow-up required
                  </ChakraCheckbox>
                  
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
              
              {/* Billing & Services Tab */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  {/* Services Selection */}
                  <Box>
                    <Text fontWeight="semibold" mb={3}>Select Services</Text>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                      {services.map(service => (
                        <Card 
                          key={service._id} 
                          cursor="pointer" 
                          border={selectedServices.find(s => s._id === service._id) ? "2px solid #2BA8D1" : "1px solid"}
                          borderColor={selectedServices.find(s => s._id === service._id) ? "#2BA8D1" : "gray.200"}
                          onClick={() => handleServiceToggle(service)}
                        >
                          <CardBody>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="semibold">{service.name}</Text>
                              <Text fontSize="sm" color="gray.600">{service.description}</Text>
                              <Text fontWeight="bold" color="green.600">₹{service.price}</Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>

                  <Divider />

                  {/* Billing Details */}
                  <Text fontWeight="semibold">Billing Details</Text>
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
                  
                  <FormControl>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      value={billForm.paymentMethod}
                      onChange={(e) => handleBillChange('paymentMethod', e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="wallet">Wallet</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea
                      value={billForm.notes}
                      onChange={(e) => handleBillChange('notes', e.target.value)}
                      placeholder="Billing notes"
                      rows={3}
                    />
                  </FormControl>

                  {/* Bill Summary */}
                  <Card bg="gray.50">
                    <CardBody>
                      <Text fontWeight="semibold" mb={3}>Bill Summary</Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text>Consultation Fee:</Text>
                          <Text>₹{billForm.consultationFee}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Treatment Fee:</Text>
                          <Text>₹{billForm.treatmentFee}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Medicine Fee:</Text>
                          <Text>₹{billForm.medicineFee}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Other Charges:</Text>
                          <Text>₹{billForm.otherCharges}</Text>
                        </HStack>
                        {selectedServices.length > 0 && (
                          <>
                            <Divider />
                            <Text fontWeight="semibold">Services:</Text>
                            {selectedServices.map(service => (
                              <HStack key={service._id} justify="space-between">
                                <Text fontSize="sm">{service.name}:</Text>
                                <Text fontSize="sm">₹{service.price}</Text>
                              </HStack>
                            ))}
                          </>
                        )}
                        <Divider />
                        <HStack justify="space-between">
                          <Text>Subtotal:</Text>
                          <Text>₹{(parseFloat(billForm.consultationFee) || 0) + (parseFloat(billForm.treatmentFee) || 0) + (parseFloat(billForm.medicineFee) || 0) + (parseFloat(billForm.otherCharges) || 0) + selectedServices.reduce((sum, service) => sum + (service.price || 0), 0)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Discount:</Text>
                          <Text color="red.600">-₹{parseFloat(billForm.discount) || 0}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Tax:</Text>
                          <Text>₹{parseFloat(billForm.tax) || 0}</Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between" fontSize="lg" fontWeight="bold">
                          <Text>Total Amount:</Text>
                          <Text color="green.600">₹{calculateTotal()}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Update Patient Tab */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Text fontWeight="semibold" color="gray.700" mb={2}>Update Patient Information</Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Patient Name</FormLabel>
                      <Input
                        value={patientUpdateForm.name}
                        onChange={(e) => handlePatientUpdateChange('name', e.target.value)}
                        placeholder="Enter patient name"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Age</FormLabel>
                      <NumberInput
                        value={patientUpdateForm.age}
                        onChange={(value) => handlePatientUpdateChange('age', value)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        value={patientUpdateForm.gender}
                        onChange={(e) => handlePatientUpdateChange('gender', e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Contact Number</FormLabel>
                      <Input
                        value={patientUpdateForm.contact}
                        onChange={(e) => handlePatientUpdateChange('contact', e.target.value)}
                        placeholder="Enter contact number"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={patientUpdateForm.email}
                        onChange={(e) => handlePatientUpdateChange('email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Textarea
                        value={patientUpdateForm.address}
                        onChange={(e) => handlePatientUpdateChange('address', e.target.value)}
                        placeholder="Enter address"
                        rows={3}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <Divider />

                  <Text fontWeight="semibold" color="gray.700" mb={2}>Patient Plan & Wallet</Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Plan Type</FormLabel>
                      <Select
                        value={patientUpdateForm.plan.type}
                        onChange={(e) => handlePatientUpdateChange('plan.type', e.target.value)}
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="vip">VIP</option>
                        <option value="custom">Custom</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Wallet Amount (₹)</FormLabel>
                      <NumberInput
                        value={patientUpdateForm.plan.walletAmount}
                        onChange={(value) => handlePatientUpdateChange('plan.walletAmount', value)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Visits Remaining</FormLabel>
                      <NumberInput
                        value={patientUpdateForm.plan.visitsRemaining}
                        onChange={(value) => handlePatientUpdateChange('plan.visitsRemaining', value)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Per Visit Charge (₹)</FormLabel>
                      <NumberInput
                        value={patientUpdateForm.plan.perVisitCharge}
                        onChange={(value) => handlePatientUpdateChange('plan.perVisitCharge', value)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>

                  <Card bg="blue.50" borderColor="blue.200">
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        <Text fontWeight="semibold" color="blue.700">Wallet Information</Text>
                        <HStack justify="space-between">
                          <Text>Current Wallet Balance:</Text>
                          <Text fontWeight="bold" color="green.600">₹{patientUpdateForm.plan.walletAmount}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Visits Remaining:</Text>
                          <Text fontWeight="bold" color="blue.600">{patientUpdateForm.plan.visitsRemaining}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Per Visit Charge:</Text>
                          <Text fontWeight="bold" color="purple.600">₹{patientUpdateForm.plan.perVisitCharge}</Text>
                        </HStack>
                        {patientUpdateForm.plan.visitsRemaining > 0 && (
                          <HStack justify="space-between">
                            <Text>Total Value Remaining:</Text>
                            <Text fontWeight="bold" color="orange.600">₹{patientUpdateForm.plan.visitsRemaining * patientUpdateForm.plan.perVisitCharge}</Text>
                          </HStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <HStack justify="flex-end" mt={6} spacing={4}>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/appointments/all')}
        >
          Cancel
        </Button>
        <Button
          leftIcon={<Icon as={MdReceipt} />}
          colorScheme="blue"
          onClick={() => navigate(`/admin/appointments/${id}/bill`)}
        >
          View Bill
        </Button>
        <Button
          colorScheme="green"
          onClick={handleCompleteAppointment}
          isLoading={isCompleting}
          loadingText="Completing..."
        >
          Complete Appointment
        </Button>
      </HStack>
    </Box>
  );
};

export default CompleteAppointment;
