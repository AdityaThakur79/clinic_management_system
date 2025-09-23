import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, useToast, SimpleGrid, Badge, Divider, Icon, Flex, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Input, Select, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Textarea, FormControl, FormLabel, Switch, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Tooltip
} from '@chakra-ui/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGetAppointmentByIdQuery } from '../../../features/api/appointments';
import { useCompleteAppointmentMutation, useUpdateCompletedAppointmentMutation } from '../../../features/api/patientApi';
import { useGetAllServicesQuery } from '../../../features/api/serviceApi';
import { MdPerson, MdBusiness, MdPhone, MdEmail, MdPrint, MdDownload, MdReceipt, MdAdd, MdRemove, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useCreateReminderMutation } from '../../../features/api/reminders';
import { appointmentsApi } from '../../../features/api/appointments';
import { useListInventoriesQuery as useListInventoriesQueryFn, useUpdateInventoryStockMutation } from '../../../features/api/inventoryApi';
import { useGetAllRemindersQuery, useUpdateReminderMutation } from '../../../features/api/reminders';

const EnhancedCompleteAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = new URLSearchParams(location.search).get('edit') === 'true';
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    data: appointmentData,
    isLoading,
    error,
    refetch
  } = useGetAppointmentByIdQuery(id);

  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError
  } = useGetAllServicesQuery({ page: 1, limit: 100, isActive: true });

  const [completeAppointment, { isLoading: isCompleting }] = useCompleteAppointmentMutation();
  const [updateCompletedAppointment, { isLoading: isUpdating }] = useUpdateCompletedAppointmentMutation();
  const { data: reminderQuery } = useGetAllRemindersQuery({ appointmentId: id, page: 1, limit: 1 });
  const [updateReminder] = useUpdateReminderMutation();
  const [createReminderMutation] = useCreateReminderMutation();
  const [createReminder, { isLoading: isCreatingReminder }] = useCreateReminderMutation();

  const appointment = appointmentData?.appointment;
  const services = servicesData?.services || [];

  // Debug logging
  console.log('Services Data:', servicesData);
  console.log('Services Loading:', servicesLoading);
  console.log('Services Error:', servicesError);
  console.log('Services Array:', services);

  // Form states
  const [prescription, setPrescription] = useState({
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

  const [bill, setBill] = useState({
    consultationFee: 0,
    treatmentFee: 0,
    medicineFee: 0,
    otherCharges: 0,
    hearingAidFee: 0,
    audiometryFee: 0,
    discount: 0,
    discountType: 'general',
    discountPercentage: 0,
    taxPercentage: 18,
    paymentMethod: 'cash',
    paidAmount: 0,
    notes: '',
    services: [],
    devices: []
  });

  const [patientUpdate, setPatientUpdate] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    email: '',
    address: '',
    plan: {
      type: 'standard',
      walletAmount: 0,
      visitsRemaining: 0,
      perVisitCharge: 0
    }
  });

  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    serviceId: '',
    name: '',
    description: '',
    basePrice: 0,
    actualPrice: 0,
    discount: 0,
    discountType: 'fixed',
    discountPercentage: 0,
    notes: ''
  });

  // Devices (Inventory) state
  const { data: inventoriesData, isLoading: inventoriesLoading, error: inventoriesError } = useListInventoriesQueryFn({ page: 1, limit: 100 });
  const inventories = inventoriesData?.inventories || [];
  const [updateInventoryStock] = useUpdateInventoryStockMutation();
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({
    inventoryId: '',
    deviceName: '',
    unitPrice: 0,
    quantity: 1,
    availableStock: 0,
    notes: ''
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
  const brandPrimary = {
    bg: '#2BA8D1',
    color: 'white',
    _hover: { bg: '#2696ba', transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(43,168,209,0.25)' },
    _active: { bg: '#2187a6', transform: 'translateY(0)' },
    transition: 'all 0.15s ease'
  };

  useEffect(() => {
    if (appointment) {
      
      
      setPatientUpdate({
        name: appointment.patientId?.name || '',
        age: appointment.patientId?.age || '',
        gender: appointment.patientId?.gender || '',
        contact: appointment.patientId?.contact || '',
        email: appointment.patientId?.email || '',
        address: appointment.patientId?.address || '',
        plan: appointment.patientId?.plan || {
          type: 'standard',
          walletAmount: 0,
          visitsRemaining: 0,
          perVisitCharge: 0
        }
      });

      // Preload prescription if present
      if (appointment.prescriptionId) {
        setPrescription({
          diagnosis: appointment.prescriptionId.diagnosis || '',
          symptoms: appointment.prescriptionId.symptoms || [],
          medicines: appointment.prescriptionId.medicines || [],
          treatment: appointment.prescriptionId.treatment || '',
          followUpRequired: appointment.prescriptionId.followUpRequired || false,
          followUpDate: appointment.prescriptionId.followUpDate || '',
          followUpNotes: appointment.prescriptionId.followUpNotes || '',
          doctorNotes: appointment.prescriptionId.doctorNotes || '',
          patientInstructions: appointment.prescriptionId.patientInstructions || ''
        });
      }

      // Preload bill if present
      if (appointment.billId) {
        setBill(prev => ({
          ...prev,
          consultationFee: appointment.billId.consultationFee || prev.consultationFee,
          treatmentFee: appointment.billId.treatmentFee || 0,
          medicineFee: appointment.billId.medicineFee || 0,
          otherCharges: appointment.billId.otherCharges || 0,
          hearingAidFee: appointment.billId.hearingAidFee || 0,
          audiometryFee: appointment.billId.audiometryFee || 0,
          discount: appointment.billId.discount || 0,
          discountType: appointment.billId.discountType || 'general',
          discountPercentage: appointment.billId.discountPercentage || 0,
          taxPercentage: appointment.billId.taxPercentage ?? prev.taxPercentage,
          paymentMethod: appointment.billId.paymentMethod || prev.paymentMethod,
          paymentStatus: appointment.billId.paymentStatus || 'pending',
          paidAmount: appointment.billId.paidAmount || 0,
          notes: appointment.billId.notes || '',
          services: (appointment.billId.services || []).map(s => ({
            serviceId: s.serviceId,
            name: s.name,
            description: s.description,
            basePrice: s.basePrice,
            actualPrice: s.actualPrice,
            discount: s.discount,
            discountType: s.discountType,
            discountPercentage: s.discountPercentage,
            notes: s.notes || ''
          })),
          devices: (appointment.billId.devices || []).map(d => ({
            inventoryId: d.inventoryId,
            deviceName: d.deviceName,
            unitPrice: d.unitPrice,
            quantity: d.quantity,
            notes: d.notes || ''
          }))
        }));
      }

      // Set consultation fee based on plan if not already from bill
      if (appointment.patientId?.plan?.type === 'wallet') {
        const perVisitCharge = appointment.patientId.plan.perVisitCharge || 0;
        const walletAmount = appointment.patientId.plan.walletAmount || 0;
        const visitsRemaining = appointment.patientId.plan.visitsRemaining || 0;
        
        
        
        setBill(prev => ({
          ...prev,
          consultationFee: prev.consultationFee || perVisitCharge,
          paymentMethod: prev.paymentMethod || 'wallet' // Set payment method to wallet for wallet plans
        }));
      } else {
        // For standard plans, set a default consultation fee
        setBill(prev => ({
          ...prev,
          consultationFee: prev.consultationFee || 500, // Default consultation fee for standard plans
          paymentMethod: prev.paymentMethod || 'cash'
        }));
      }
    }
  }, [appointment]);

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminder, setReminder] = useState({
    reminderDate: '',
    reminderTime: '10:00',
    title: 'Follow-up visit',
    description: 'Call patient to schedule follow-up visit',
    priority: 'medium',
    method: 'in_app'
  });

  // Prefill from existing reminder, if any
  useEffect(() => {
    const existing = reminderQuery?.reminders?.[0];
    if (existing) {
      setReminderEnabled(true);
      setReminder(prev => ({
        ...prev,
        reminderDate: existing.reminderDate ? new Date(existing.reminderDate).toISOString().split('T')[0] : prev.reminderDate,
        reminderTime: existing.reminderTime || prev.reminderTime,
        title: existing.title || prev.title,
        description: existing.description || prev.description,
        priority: existing.priority || prev.priority,
        method: existing.method || prev.method,
      }));
    }
  }, [reminderQuery]);

  // Prefill reminder date from prescription follow-up or +7 days
  useEffect(() => {
    const preset = prescription?.followUpDate || appointment?.prescriptionId?.followUpDate;
    const base = preset ? new Date(preset) : new Date();
    if (!preset) base.setDate(base.getDate() + 7);
    const iso = base.toISOString().split('T')[0];
    setReminder(prev => ({ ...prev, reminderDate: iso }));
  }, [prescription?.followUpDate, appointment?.prescriptionId?.followUpDate]);

  const handleAddService = () => {
    if (!newService.serviceId) {
      toast({
        title: 'Error',
        description: 'Please select a service',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const selectedService = services.find(s => s._id === newService.serviceId);
    if (selectedService) {
      const serviceToAdd = {
        ...newService,
        name: selectedService.name,
        description: selectedService.description,
        basePrice: selectedService.price,
        actualPrice: newService.actualPrice || selectedService.price
      };

      setBill(prev => ({
        ...prev,
        services: [...prev.services, serviceToAdd]
      }));

      setNewService({
        serviceId: '',
        name: '',
        description: '',
        basePrice: 0,
        actualPrice: 0,
        discount: 0,
        discountType: 'fixed',
        discountPercentage: 0,
        notes: ''
      });
    }
  };

  const handleEditService = (index) => {
    setEditingService(index);
  };

  const handleSaveService = (index) => {
    setEditingService(null);
  };

  const handleRemoveService = (index) => {
    setBill(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const calculateSubtotal = () => {
    const servicesTotal = bill.services.reduce((sum, service) => {
      let servicePrice = service.actualPrice || service.basePrice || 0;
      if (service.discount > 0) {
        if (service.discountType === 'percentage') {
          servicePrice = servicePrice - (servicePrice * service.discountPercentage / 100);
        } else {
          servicePrice = servicePrice - service.discount;
        }
      }
      return sum + Math.max(0, servicePrice);
    }, 0);

    const devicesTotal = bill.devices.reduce((sum, device) => {
      const qty = Number(device.quantity) || 0;
      const price = Number(device.unitPrice) || 0;
      return sum + Math.max(0, qty * price);
    }, 0);

    return bill.consultationFee + bill.treatmentFee + bill.medicineFee + 
           bill.otherCharges + bill.hearingAidFee + bill.audiometryFee + servicesTotal + devicesTotal;
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (bill.discountType === 'percentage' && bill.discountPercentage > 0) {
      return (subtotal * bill.discountPercentage) / 100;
    }
    return bill.discount || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const taxableAmount = subtotal - discount;
    return (taxableAmount * bill.taxPercentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);
  const userRole = currentUser?.role;
  const createdAt = appointment?.createdAt ? new Date(appointment.createdAt) : null;
  const isWithin24h = createdAt ? (Date.now() - createdAt.getTime()) <= 24*60*60*1000 : true;
  const canEdit = userRole === 'superAdmin' || isWithin24h;

  const handleComplete = async () => {
    try {
      // Validate devices stock before proceeding
      for (const device of bill.devices) {
        const inv = inventories.find(i => i._id === device.inventoryId);
        const available = inv?.currentStock ?? device.availableStock ?? 0;
        if ((device.quantity || 0) > available) {
          throw new Error(`Insufficient stock for ${device.deviceName}. Available: ${available}, Requested: ${device.quantity}`);
        }
      }

      if (isEdit && appointment?.status === 'completed') {
        if (!canEdit) throw new Error('Editing window expired for your role');
        // Compute stock deltas for devices
        const prevDevices = (appointment.billId?.devices || []).map(d => ({
          inventoryId: d.inventoryId,
          quantity: d.quantity
        }));
        const nextDevices = bill.devices.map(d => ({ inventoryId: d.inventoryId, quantity: d.quantity }));

        const deltas = new Map();
        for (const prev of prevDevices) {
          deltas.set(prev.inventoryId, (deltas.get(prev.inventoryId) || 0) - (Number(prev.quantity) || 0));
        }
        for (const next of nextDevices) {
          deltas.set(next.inventoryId, (deltas.get(next.inventoryId) || 0) + (Number(next.quantity) || 0));
        }

        const stockOps = [];
        deltas.forEach((delta, inventoryId) => {
          if (delta > 0) {
            stockOps.push(updateInventoryStock({ id: inventoryId, operation: 'reduce', quantity: delta, notes: `Used in appointment ${id} (edit adjustment)`, appointmentId: id, patientId: appointment?.patientId?._id || appointment?.patientId, reason: 'Edit adjustment' }).unwrap());
          } else if (delta < 0) {
            stockOps.push(updateInventoryStock({ id: inventoryId, operation: 'add', quantity: Math.abs(delta), notes: `Returned from appointment ${id} (edit adjustment)`, appointmentId: id, patientId: appointment?.patientId?._id || appointment?.patientId, reason: 'Edit adjustment' }).unwrap());
          }
        });

        if (stockOps.length > 0) {
          await Promise.all(stockOps);
        }

        await updateCompletedAppointment({ appointmentId: id, prescription, bill, status: 'completed' }).unwrap();
      } else {
        // Reduce stock for devices on completion
        if (bill.devices.length > 0) {
          await Promise.all(
            bill.devices.map(d => 
              updateInventoryStock({ id: d.inventoryId, operation: 'reduce', quantity: Number(d.quantity) || 0, notes: `Used in appointment ${id}`, appointmentId: id, patientId: appointment?.patientId?._id || appointment?.patientId, reason: 'Used in appointment' }).unwrap()
            )
          );
        }

        await completeAppointment({ appointmentId: id, prescription, bill, patientUpdate }).unwrap();
      }

      // Create/update reminder if enabled
      if (reminderEnabled) {
        const payload = {
          appointmentId: id,
          patientId: appointment?.patientId?._id || appointment?.patientId,
          doctorId: appointment?.doctorId?._id || appointment?.doctorId,
          branchId: appointment?.branchId?._id || appointment?.branchId,
          type: 'follow_up',
          title: reminder.title,
          description: reminder.description,
          reminderDate: reminder.reminderDate,
          reminderTime: reminder.reminderTime,
          priority: reminder.priority,
          method: reminder.method,
          notes: `Auto-created on ${new Date().toLocaleString()}`
        };
        try {
          const existing = reminderQuery?.reminders?.[0];
          if (existing) {
            await updateReminder({ id: existing._id, ...payload }).unwrap();
          } else {
            await createReminderMutation(payload).unwrap();
          }
        } catch (e) {
          console.error('Saving reminder failed', e);
        }
      }

      toast({
        title: 'Success',
        description: isEdit ? 'Appointment updated successfully' : 'Appointment completed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Ensure caches refresh instantly
      dispatch(appointmentsApi.util.invalidateTags([{ type: 'Appointment' }]));
      await refetch();
      navigate(`/admin/appointments/${id}/bill`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to complete appointment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading appointment details...</Text>
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
              Failed to load appointment details. Please try again.
            </AlertDescription>
          </Box>
        </Alert>
      </Center>
    );
  }

  if (!appointment) {
    return (
      <Center h="100vh">
        <Alert status="warning" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>No Data!</AlertTitle>
            <AlertDescription>
              Appointment not found.
            </AlertDescription>
          </Box>
        </Alert>
      </Center>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '100px', xl: '100px' }} p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="#2BA8D1">Complete Appointment</Heading>
        <HStack spacing={4}>
          <Button
            leftIcon={<Icon as={MdReceipt} />}
            variant="solid"
            size="md"
            onClick={() => navigate(`/admin/appointments/${id}/bill`)}
            {...brandPrimary}
          >
            View Bill
          </Button>
          <Button
            leftIcon={<Icon as={MdPrint} />}
            variant="outline"
            size="md"
            onClick={() => window.print()}
            {...brandHover}
          >
            Print
          </Button>
         
        </HStack>
      </Flex>

      {/* Patient Information */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader>
          <Heading size="md" color="blue.500">
            <Icon as={MdPerson} mr={2} />
            Patient Information
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Name</Text>
              <Text>{appointment.patientId?.name}</Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Contact</Text>
              <Text>{appointment.patientId?.contact}</Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Plan Type</Text>
              <Badge colorScheme={appointment.patientId?.plan?.type === 'wallet' ? 'green' : 'blue'}>
                {appointment.patientId?.plan?.type?.toUpperCase()}
              </Badge>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" color="gray.600">Wallet Balance</Text>
              <Text>₹{appointment.patientId?.plan?.walletAmount || 0}</Text>
            </VStack>
            {appointment.patientId?.plan?.type === 'wallet' && (
              <>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" color="gray.600">Per Visit Charge</Text>
                  <Text>₹{appointment.patientId?.plan?.perVisitCharge || 0}</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" color="gray.600">Visits Remaining</Text>
                  <Text>{appointment.patientId?.plan?.visitsRemaining || 0}</Text>
                </VStack>
              </>
            )}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Prescription Section */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader>
          <Heading size="md" color="#2BA8D1">
            <Icon as={MdEdit} mr={2} />
            Prescription Details
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Diagnosis</FormLabel>
              <Textarea
                value={prescription.diagnosis}
                onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Enter diagnosis"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Treatment</FormLabel>
              <Textarea
                value={prescription.treatment}
                onChange={(e) => setPrescription(prev => ({ ...prev, treatment: e.target.value }))}
                placeholder="Enter treatment details"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Doctor Notes</FormLabel>
              <Textarea
                value={prescription.doctorNotes}
                onChange={(e) => setPrescription(prev => ({ ...prev, doctorNotes: e.target.value }))}
                placeholder="Enter doctor notes"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Patient Instructions</FormLabel>
              <Textarea
                value={prescription.patientInstructions}
                onChange={(e) => setPrescription(prev => ({ ...prev, patientInstructions: e.target.value }))}
                placeholder="Enter patient instructions"
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Billing Section */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader>
          <Heading size="md" color="#2BA8D1">
            <Icon as={MdReceipt} mr={2} />
            Billing Details
          </Heading>
          {appointment.patientId?.plan?.type === 'wallet' && (
            <Alert status="info" mt={2}>
              <AlertIcon />
              <Box>
                <AlertTitle>Wallet Plan Active!</AlertTitle>
                <AlertDescription>
                  This patient has a wallet plan. Consultation fee is automatically set to ₹{appointment.patientId?.plan?.perVisitCharge || 0} per visit.
                  {appointment.patientId?.plan?.walletAmount < (appointment.patientId?.plan?.perVisitCharge || 0) && (
                    <Text color="red.500" fontWeight="bold">
                      ⚠️ Insufficient wallet balance! Required: ₹{appointment.patientId?.plan?.perVisitCharge || 0}, Available: ₹{appointment.patientId?.plan?.walletAmount || 0}
                    </Text>
                  )}
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </CardHeader>
        <CardBody>
          <Accordion allowMultiple>
            {/* Basic Fees */}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">Basic Fees</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>
                      Consultation Fee (₹)
                      {appointment.patientId?.plan?.type === 'wallet' && (
                        <Text as="span" fontSize="sm" color="blue.500" ml={2}>
                          (Auto-set for wallet plan)
                        </Text>
                      )}
                    </FormLabel>
                    <NumberInput
                      value={bill.consultationFee}
                      onChange={(value) => setBill(prev => ({ ...prev, consultationFee: parseFloat(value) || 0 }))}
                      min={0}
                      isReadOnly={appointment.patientId?.plan?.type === 'wallet'}
                    >
                      <NumberInputField 
                        bg={appointment.patientId?.plan?.type === 'wallet' ? 'gray.100' : 'white'}
                        cursor={appointment.patientId?.plan?.type === 'wallet' ? 'not-allowed' : 'text'}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    {appointment.patientId?.plan?.type === 'wallet' && (
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        This amount will be deducted from the patient's wallet balance
                      </Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Treatment Fee (₹)</FormLabel>
                    <NumberInput
                      value={bill.treatmentFee}
                      onChange={(value) => setBill(prev => ({ ...prev, treatmentFee: parseFloat(value) || 0 }))}
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
                    <FormLabel>Medicine Fee (₹)</FormLabel>
                    <NumberInput
                      value={bill.medicineFee}
                      onChange={(value) => setBill(prev => ({ ...prev, medicineFee: parseFloat(value) || 0 }))}
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
                    <FormLabel>Other Charges (₹)</FormLabel>
                    <NumberInput
                      value={bill.otherCharges}
                      onChange={(value) => setBill(prev => ({ ...prev, otherCharges: parseFloat(value) || 0 }))}
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
                    <FormLabel>Hearing Aid Fee (₹)</FormLabel>
                    <NumberInput
                      value={bill.hearingAidFee}
                      onChange={(value) => setBill(prev => ({ ...prev, hearingAidFee: parseFloat(value) || 0 }))}
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
                    <FormLabel>Audiometry Test Fee (₹)</FormLabel>
                    <NumberInput
                      value={bill.audiometryFee}
                      onChange={(value) => setBill(prev => ({ ...prev, audiometryFee: parseFloat(value) || 0 }))}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </AccordionPanel>
            </AccordionItem>

            {/* Services */}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">Services ({bill.services.length})</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                {/* Add New Service */}
                <Card mb={4} variant="outline">
                  <CardHeader>
                    <Heading size="sm">Add Service</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Select Service</FormLabel>
                        <Select
                          value={newService.serviceId}
                          onChange={(e) => {
                            const selectedService = services.find(s => s._id === e.target.value);
                            if (selectedService) {
                              setNewService(prev => ({
                                ...prev,
                                serviceId: e.target.value,
                                name: selectedService.name,
                                description: selectedService.description,
                                basePrice: selectedService.price,
                                actualPrice: selectedService.price
                              }));
                            }
                          }}
                          isDisabled={servicesLoading}
                        >
                          <option value="">
                            {servicesLoading ? 'Loading services...' : 'Select a service'}
                          </option>
                          {services.map(service => (
                            <option key={service._id} value={service._id}>
                              {service.name} - ₹{service?.price}
                            </option>
                          ))}
                        </Select>
                        {servicesError && (
                          <Text fontSize="sm" color="red.500" mt={1}>
                            Error loading services: {servicesError?.data?.message || 'Unknown error'}
                          </Text>
                        )}
                        {!servicesLoading && services.length === 0 && (
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            No services available. Please add services first.
                          </Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Actual Price (₹)</FormLabel>
                        <NumberInput
                          value={newService.actualPrice}
                          onChange={(value) => setNewService(prev => ({ ...prev, actualPrice: parseFloat(value) || 0 }))}
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
                        <FormLabel>Discount Type</FormLabel>
                        <Select
                          value={newService.discountType}
                          onChange={(e) => setNewService(prev => ({ ...prev, discountType: e.target.value }))}
                        >
                          <option value="fixed">Fixed Amount</option>
                          <option value="percentage">Percentage</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>
                          Discount {newService.discountType === 'percentage' ? '(%)' : '(₹)'}
                        </FormLabel>
                        <NumberInput
                          value={newService.discountType === 'percentage' ? newService.discountPercentage : newService.discount}
                          onChange={(value) => {
                            if (newService.discountType === 'percentage') {
                              setNewService(prev => ({ ...prev, discountPercentage: parseFloat(value) || 0 }));
                            } else {
                              setNewService(prev => ({ ...prev, discount: parseFloat(value) || 0 }));
                            }
                          }}
                          min={0}
                          max={newService.discountType === 'percentage' ? 100 : undefined}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>

                    <Button
                      leftIcon={<Icon as={MdAdd} />}
                      variant="solid"
                      size="md"
                      onClick={handleAddService}
                      mt={4}
                      {...brandPrimary}
                    >
                      Add Service
                    </Button>
                  </CardBody>
                </Card>

                {/* Services List */}
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Service</Th>
                        <Th>Base Price</Th>
                        <Th>Actual Price</Th>
                        <Th>Discount</Th>
                        <Th>Final Price</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {bill.services.map((service, index) => {
                        const discountAmount = service.discountType === 'percentage' 
                          ? (service.actualPrice * service.discountPercentage / 100)
                          : service.discount;
                        const finalPrice = Math.max(0, service.actualPrice - discountAmount);

                        return (
                          <Tr key={index}>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{service.name}</Text>
                                <Text fontSize="sm" color="gray.600">{service.description}</Text>
                              </VStack>
                            </Td>
                            <Td>₹{service.basePrice}</Td>
                            <Td>
                              {editingService === index ? (
                                <NumberInput
                                  size="sm"
                                  value={service.actualPrice}
                                  onChange={(value) => {
                                    const updatedServices = [...bill.services];
                                    updatedServices[index].actualPrice = parseFloat(value) || 0;
                                    setBill(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  min={0}
                                >
                                  <NumberInputField />
                                </NumberInput>
                              ) : (
                                `₹${service.actualPrice}`
                              )}
                            </Td>
                            <Td>
                              {service.discountType === 'percentage' 
                                ? `${service.discountPercentage}%`
                                : `₹${service.discount}`
                              }
                            </Td>
                            <Td fontWeight="bold">₹{finalPrice}</Td>
                            <Td>
                              <HStack spacing={1}>
                                {editingService === index ? (
                                  <Button
                                    size="sm"
                                    leftIcon={<Icon as={MdSave} />}
                                    variant="solid"
                                    onClick={() => handleSaveService(index)}
                                    {...brandPrimary}
                                  >
                                    Save
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    leftIcon={<Icon as={MdEdit} />}
                                    variant="outline"
                                    onClick={() => handleEditService(index)}
                                    {...brandHover}
                                  >
                                    Edit
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  leftIcon={<Icon as={MdRemove} />}
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => handleRemoveService(index)}
                                >
                                  Remove
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </AccordionPanel>
            </AccordionItem>

            {/* Devices (Inventory) */}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">Devices (Inventory) ({bill.devices.length})</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Card mb={4} variant="outline">
                  <CardHeader>
                    <Heading size="sm">Add Device</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Select Device</FormLabel>
                        <Select
                          value={newDevice.inventoryId}
                          onChange={(e) => {
                            const inv = inventories.find(i => i._id === e.target.value);
                            if (inv) {
                              setNewDevice(prev => ({
                                ...prev,
                                inventoryId: inv._id,
                                deviceName: inv.deviceName,
                                unitPrice: inv.sellingPrice || 0,
                                availableStock: inv.currentStock || 0,
                                quantity: 1
                              }));
                            }
                          }}
                          isDisabled={inventoriesLoading}
                        >
                          <option value="">
                            {inventoriesLoading ? 'Loading devices...' : 'Select a device'}
                          </option>
                          {inventories.map(inv => (
                            <option key={inv._id} value={inv._id}>
                              {inv.deviceName} ({inv.brand} {inv.model}) - In stock: {inv.currentStock} - ₹{inv.sellingPrice}
                            </option>
                          ))}
                        </Select>
                        {inventoriesError && (
                          <Text fontSize="sm" color="red.500" mt={1}>
                            Error loading devices
                          </Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Quantity</FormLabel>
                        <NumberInput
                          value={newDevice.quantity}
                          onChange={(value) => setNewDevice(prev => ({ ...prev, quantity: Math.max(0, parseInt(value || '0', 10)) }))}
                          min={1}
                          max={newDevice.availableStock || undefined}
                          isDisabled={!newDevice.inventoryId}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        {newDevice.inventoryId && (
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            Available: {newDevice.availableStock}
                          </Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Unit Price (₹)</FormLabel>
                        <NumberInput
                          value={newDevice.unitPrice}
                          onChange={(value) => setNewDevice(prev => ({ ...prev, unitPrice: parseFloat(value) || 0 }))}
                          min={0}
                          isDisabled={!newDevice.inventoryId}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>

                    <Button
                      leftIcon={<Icon as={MdAdd} />}
                      variant="solid"
                      size="md"
                      onClick={() => {
                        if (!newDevice.inventoryId) {
                          toast({ title: 'Error', description: 'Please select a device', status: 'error', duration: 3000, isClosable: true });
                          return;
                        }
                        if (!newDevice.quantity || newDevice.quantity <= 0) {
                          toast({ title: 'Error', description: 'Please enter a valid quantity', status: 'error', duration: 3000, isClosable: true });
                          return;
                        }
                        if ((newDevice.quantity || 0) > (newDevice.availableStock || 0)) {
                          toast({ title: 'Insufficient stock', description: `Only ${newDevice.availableStock} in stock`, status: 'error', duration: 3000, isClosable: true });
                          return;
                        }
                        setBill(prev => ({
                          ...prev,
                          devices: [...prev.devices, {
                            inventoryId: newDevice.inventoryId,
                            deviceName: newDevice.deviceName,
                            unitPrice: newDevice.unitPrice,
                            quantity: newDevice.quantity,
                            notes: newDevice.notes || ''
                          }]
                        }));
                        setNewDevice({ inventoryId: '', deviceName: '', unitPrice: 0, quantity: 1, availableStock: 0, notes: '' });
                      }}
                      mt={4}
                      isDisabled={inventoriesLoading}
                      {...brandPrimary}
                    >
                      Add Device
                    </Button>
                  </CardBody>
                </Card>

                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Device</Th>
                        <Th>Unit Price</Th>
                        <Th>Quantity</Th>
                        <Th>Total</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {bill.devices.map((device, index) => (
                        <Tr key={index}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{device.deviceName}</Text>
                            </VStack>
                          </Td>
                          <Td>₹{Number(device.unitPrice || 0)}</Td>
                          <Td>
                            {editingDevice === index ? (
                              <NumberInput
                                size="sm"
                                value={device.quantity}
                                onChange={(value) => {
                                  const updated = [...bill.devices];
                                  updated[index].quantity = Math.max(0, parseInt(value || '0', 10));
                                  setBill(prev => ({ ...prev, devices: updated }));
                                }}
                                min={1}
                              >
                                <NumberInputField />
                              </NumberInput>
                            ) : (
                              device.quantity
                            )}
                          </Td>
                          <Td fontWeight="bold">₹{((Number(device.unitPrice) || 0) * (Number(device.quantity) || 0)).toFixed(2)}</Td>
                          <Td>
                            <HStack spacing={1}>
                              {editingDevice === index ? (
                                <Button
                                  size="sm"
                                  leftIcon={<Icon as={MdSave} />}
                                  variant="solid"
                                  onClick={() => setEditingDevice(null)}
                                  {...brandPrimary}
                                >
                                  Save
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  leftIcon={<Icon as={MdEdit} />}
                                  variant="outline"
                                  onClick={() => setEditingDevice(index)}
                                  {...brandHover}
                                >
                                  Edit
                                </Button>
                              )}
                              <Button
                                size="sm"
                                leftIcon={<Icon as={MdRemove} />}
                                colorScheme="red"
                                variant="outline"
                                onClick={() => setBill(prev => ({ ...prev, devices: prev.devices.filter((_, i) => i !== index) }))}
                              >
                                Remove
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </AccordionPanel>
            </AccordionItem>

            {/* Discount & Tax */}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">Discount & Tax</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Discount Type</FormLabel>
                    <Select
                      value={bill.discountType}
                      onChange={(e) => setBill(prev => ({ ...prev, discountType: e.target.value }))}
                    >
                      <option value="general">General</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      Discount {bill.discountType === 'percentage' ? '(%)' : '(₹)'}
                    </FormLabel>
                    <NumberInput
                      value={bill.discountType === 'percentage' ? bill.discountPercentage : bill.discount}
                      onChange={(value) => {
                        if (bill.discountType === 'percentage') {
                          setBill(prev => ({ ...prev, discountPercentage: parseFloat(value) || 0 }));
                        } else {
                          setBill(prev => ({ ...prev, discount: parseFloat(value) || 0 }));
                        }
                      }}
                      min={0}
                      max={bill.discountType === 'percentage' ? 100 : undefined}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Tax Percentage (%)</FormLabel>
                    <NumberInput
                      value={bill.taxPercentage}
                      onChange={(value) => setBill(prev => ({ ...prev, taxPercentage: parseFloat(value) || 0 }))}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      value={bill.paymentMethod}
                      onChange={(e) => setBill(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="wallet">Wallet</option>
                      <option value="insurance">Insurance</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Payment Status</FormLabel>
                    <Select
                      value={bill.paymentStatus || ''}
                      onChange={(e) => setBill(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          {/* Financial Summary */}
          <Card mt={4} variant="outline">
            <CardHeader>
              <Heading size="sm">Financial Summary</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={2} align="stretch">
                <Flex justify="space-between">
                  <Text>Subtotal:</Text>
                  <Text fontWeight="bold">₹{calculateSubtotal().toFixed(2)}</Text>
                </Flex>
                
                {calculateDiscount() > 0 && (
                  <Flex justify="space-between" color="red.500">
                    <Text>Discount:</Text>
                    <Text>-₹{calculateDiscount().toFixed(2)}</Text>
                  </Flex>
                )}
                
                <Flex justify="space-between">
                  <Text>Tax (GST {bill.taxPercentage}%):</Text>
                  <Text>₹{calculateTax().toFixed(2)}</Text>
                </Flex>
                
                <Divider />
                
                <Flex justify="space-between" fontSize="lg" fontWeight="bold">
                  <Text>Total Amount:</Text>
                  <Text color="blue.600">₹{calculateTotal().toFixed(2)}</Text>
                </Flex>
                
                {appointment.patientId?.plan?.type === 'wallet' && (
                  <>
                    <Divider />
                    <Flex justify="space-between" color="green.600">
                      <Text>Wallet Balance:</Text>
                      <Text fontWeight="bold">₹{appointment.patientId?.plan?.walletAmount || 0}</Text>
                    </Flex>
                    <Flex justify="space-between" color={appointment.patientId?.plan?.walletAmount >= calculateTotal() ? "green.600" : "red.600"}>
                      <Text>Remaining Balance:</Text>
                      <Text fontWeight="bold">₹{((appointment.patientId?.plan?.walletAmount || 0) - calculateTotal()).toFixed(2)}</Text>
                    </Flex>
                    {appointment.patientId?.plan?.walletAmount < calculateTotal() && (
                      <Text fontSize="sm" color="red.500" textAlign="center" mt={2}>
                        ⚠️ Insufficient wallet balance! Additional payment required: ₹{(calculateTotal() - (appointment.patientId?.plan?.walletAmount || 0)).toFixed(2)}
                      </Text>
                    )}
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        </CardBody>
      </Card>

      {/* Reminder Section */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader>
          <Heading size="md" color="#2BA8D1">
            <Icon as={MdEdit} mr={2} />
            Follow-up Reminder
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Text fontWeight="semibold">Create reminder for follow-up</Text>
              <Switch isChecked={reminderEnabled} onChange={(e)=> setReminderEnabled(e.target.checked)} />
            </HStack>
            {reminderEnabled && (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input type="date" value={reminder.reminderDate} onChange={(e)=> setReminder(prev=>({...prev, reminderDate: e.target.value}))} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Time</FormLabel>
                  <Input type="time" value={reminder.reminderTime} onChange={(e)=> setReminder(prev=>({...prev, reminderTime: e.target.value}))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select value={reminder.priority} onChange={(e)=> setReminder(prev=>({...prev, priority: e.target.value}))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </FormControl>
                <FormControl gridColumn={{ base: 'auto', md: 'span 3' }}>
                  <FormLabel>Title</FormLabel>
                  <Input value={reminder.title} onChange={(e)=> setReminder(prev=>({...prev, title: e.target.value}))} />
                </FormControl>
                <FormControl gridColumn={{ base: 'auto', md: 'span 3' }}>
                  <FormLabel>Description</FormLabel>
                  <Textarea rows={2} value={reminder.description} onChange={(e)=> setReminder(prev=>({...prev, description: e.target.value}))} />
                </FormControl>
              </SimpleGrid>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Complete Button */}
      <Flex justify="center" mt={6}>
        <Button
          size="lg"
          variant="solid"
          onClick={handleComplete}
          isLoading={(isEdit ? isUpdating : isCompleting) || isCreatingReminder}
          isDisabled={isEdit && !canEdit}
          loadingText="Completing..."
          {...brandPrimary}
        >
          {isEdit ? 'Update Appointment' : 'Complete Appointment'}
        </Button>
      </Flex>
    </Box>
  );
};

export default EnhancedCompleteAppointment;
