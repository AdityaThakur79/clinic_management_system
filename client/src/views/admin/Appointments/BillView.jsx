import React, { useState } from 'react';
import {
  Box, Button, HStack, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, useToast, SimpleGrid, Badge, Icon, Flex, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Divider, Image
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAppointmentByIdQuery } from '../../../features/api/appointments';
import { MdPerson, MdSchedule, MdBusiness, MdPhone, MdEmail, MdAssignment, MdReceipt, MdPrint, MdDownload, MdArrowBack, MdLocalHospital, MdEdit } from 'react-icons/md';
import { PDFDownloadLink, PDFViewer, pdf } from '@react-pdf/renderer';
import BillPDF from './BillPDF';

const BillView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [showPDF, setShowPDF] = useState(false);

  const {
    data: appointmentData,
    isLoading,
    error,
    refetch
  } = useGetAppointmentByIdQuery(id);

  const appointment = appointmentData?.appointment;

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

  const handlePrint = async () => {
    try {
      if (!appointment) {
        toast({ title: 'Print failed', description: 'Appointment not loaded yet', status: 'error' });
        return;
      }
      const blob = await pdf(<BillPDF appointment={appointment} />).toBlob();
      const url = URL.createObjectURL(blob);
      // Use hidden iframe for reliable printing across browsers
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        const cw = iframe.contentWindow;
        if (!cw) return;
        const cleanup = () => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          URL.revokeObjectURL(url);
        };
        // Cleanup after print completes
        cw.onafterprint = cleanup;
        // Fallback cleanup in case afterprint isn't fired
        setTimeout(cleanup, 30000);
        cw.focus();
        cw.print();
      };
    } catch (e) {
      toast({ title: 'Print failed', description: e?.message || 'Unknown error', status: 'error' });
    }
  };

  const handleDownload = () => {
    setShowPDF(true);
  };

  const calculateSubtotal = (bill) => {
    if (!bill) return 0;
    let subtotal = (bill.consultationFee || 0) + 
                   (bill.treatmentFee || 0) + 
                   (bill.medicineFee || 0) + 
                   (bill.otherCharges || 0) +
                   (bill.hearingAidFee || 0) +
                   (bill.audiometryFee || 0);
    
    // Add services from services array
    if (bill.services && bill.services.length > 0) {
      subtotal += bill.services.reduce((sum, service) => {
        let servicePrice = service.actualPrice || service.basePrice || 0;
        
        // Apply service discount if any
        if (service.discountType === 'percentage' && service.discountPercentage > 0) {
          servicePrice = servicePrice - (servicePrice * service.discountPercentage / 100);
        } else if (service.discountType === 'fixed' && service.discount > 0) {
          servicePrice = servicePrice - service.discount;
        }
        
        return sum + Math.max(0, servicePrice);
      }, 0);
    }
    // Add devices total
    if (bill.devices && bill.devices.length > 0) {
      subtotal += bill.devices.reduce((sum, device) => {
        const qty = Number(device.quantity) || 0;
        const price = Number(device.unitPrice) || 0;
        let deviceTotal = qty * price;
        
        // Apply device discount if any
        if (device.discountType === 'percentage' && device.discountPercentage > 0) {
          deviceTotal = deviceTotal - (deviceTotal * device.discountPercentage / 100);
        } else if (device.discountType === 'fixed' && device.discount > 0) {
          deviceTotal = deviceTotal - device.discount;
        }
        
        return sum + Math.max(0, deviceTotal);
      }, 0);
    }
    
    return subtotal;
  };

  const calculateTotal = (bill) => {
    if (!bill) return 0;
    const subtotal = calculateSubtotal(bill);
    const discount = bill.discount || 0;
    const tax = bill.tax || 0;
    return subtotal - discount + tax;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Box pt={{ base: '130px', md: '100px', xl: '100px' }} px={{ base: 4, md: 6 }} maxW="1200px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8} direction={{ base: 'column', md: 'row' }} gap={4}>
        <HStack spacing={4}>
          {/* <Button
            leftIcon={<Icon as={MdArrowBack} />}
            variant="outline"
            onClick={() => navigate(-1)}
            {...brandHover}
            size={{ base: 'sm', md: 'md' }}
          >
            Back
          </Button> */}
          <Heading size={{ base: 'lg', md: 'xl' }} color="#2BA8D1">Invoice</Heading>
        </HStack>
        <HStack spacing={3} wrap="wrap">
          {appointment && (
            <Button
              leftIcon={<Icon as={MdEdit} />}
              variant="outline"
              onClick={() => navigate(`/admin/appointments/${appointment._id}/enhanced-complete?edit=true`)}
              {...brandHover}
              size={{ base: 'sm', md: 'md' }}
            >
              Update Appointment
            </Button>
          )}
          <Button
            leftIcon={<Icon as={MdPrint} />}
            variant="outline"
            onClick={handlePrint}
            {...brandHover}
            size={{ base: 'sm', md: 'md' }}
          >
            Print
          </Button>
          {appointment && (
            <PDFDownloadLink
              document={<BillPDF appointment={appointment} />}
              fileName={`bill-${appointment._id}.pdf`}
            >
              {({ loading }) => (
                <Button
                  leftIcon={<Icon as={MdDownload} />}
                  isLoading={loading}
                  {...brandPrimary}
                  size={{ base: 'sm', md: 'md' }}
                >
                  Download PDF
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </HStack>
      </Flex>

      {/* PDF Viewer Modal */}
      {showPDF && (
        <Box position="fixed" top={0} left={0} right={0} bottom={0} bg="blackAlpha.800" zIndex={9999}>
          <Box position="absolute" top={4} right={4}>
            <Button onClick={() => setShowPDF(false)} colorScheme="red">
              Close
            </Button>
          </Box>
          <Box h="100%" w="100%">
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <BillPDF appointment={appointment} />
            </PDFViewer>
          </Box>
        </Box>
      )}

      {/* Invoice Container */}
      <Card bg={cardBg} borderColor={borderColor} boxShadow="xl" borderRadius="xl">
        <CardBody p={0}>
          {/* Invoice Header */}
          <Box bg="#2BA8D1" p={{ base: 4, md: 8 }} borderTopRadius="xl" color="white">
            <Flex justify="space-between" align="start" direction={{ base: 'column', lg: 'row' }} gap={6}>
              {/* Company Info */}
              <Box flex={1}>
                <HStack spacing={4} mb={4}>
                  <Image 
                    src={`/aartiket_logo.jpeg`} 
                    alt="Aartiket Logo" 
                    boxSize={{ base: "50px", md: "60px" }}
                    objectFit="contain"
                    fallback={<Icon as={MdLocalHospital} boxSize={{ base: "50px", md: "60px" }} color="white" />}
                  />
                  <Box>
                    <Heading size={{ base: 'lg', md: 'xl' }} color="white" mb={2}>
                      Aartiket Speech & Hearing Care
                    </Heading>
                    <Text color="white" fontSize={{ base: 'md', md: 'lg' }} fontWeight="medium" opacity={0.9}>
                      Hearing test, hearing aid trial and fitting, speech therapy
                    </Text>
                  </Box>
                </HStack>
                <VStack align="start" spacing={1} color="white" opacity={0.9}>
                  <Text fontSize={{ base: 'sm', md: 'md' }}><Icon as={MdBusiness} mr={2} />{appointment.branchId?.address || 'Ghatkopar, Mumbai'}</Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }}><Icon as={MdPhone} mr={2} />98 6779 4003</Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }}><Icon as={MdEmail} mr={2} />aartiketspeechandhearing@gmail.com</Text>
                </VStack>
              </Box>

              {/* Invoice Details */}
              <Box textAlign={{ base: 'left', lg: 'right' }}>
                <Heading size={{ base: 'md', md: 'lg' }} color="white" mb={4}>INVOICE</Heading>
                <VStack spacing={2} align={{ base: 'start', lg: 'end' }}>
                  <Text fontSize={{ base: 'sm', md: 'md' }}><strong>Bill No:</strong> {appointment.billId?.billNumber || `BILL-${appointment._id.slice(-8).toUpperCase()}`}</Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }}><strong>Date:</strong> {formatDate(appointment.date)}</Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }}><strong>Time:</strong> {formatTime(appointment.timeSlot)}</Text>
                </VStack>
              </Box>
            </Flex>
          </Box>

          <Divider />

          {/* Patient & Doctor Info */}
          <Box p={{ base: 4, md: 8 }}>
            <SimpleGrid columns={{ base: 1 }} spacing={{ base: 6, md: 8 }}>
              {/* Patient Details */}
              <Box>
                <Heading size="md" color="#2BA8D1" mb={4} display="flex" alignItems="center">
                  <Icon as={MdPerson} mr={2} />
                  Patient Information
                </Heading>
                <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={{ base: 3, md: 5 }} boxShadow="sm">
                <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Name:</Text>
                    <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">{appointment.patientId?.name}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Age:</Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }}>{appointment.patientId?.age} years</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Gender:</Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }}>{appointment.patientId?.gender}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Contact:</Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }}>{appointment.patientId?.contact}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Email:</Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }}>{appointment.patientId?.email}</Text>
                  </Flex>
                  {appointment.patientId?.address && (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" mb={1}>Address:</Text>
                      <Text fontSize={{ base: 'sm', md: 'md' }}>{appointment.patientId.address}</Text>
                    </Box>
                  )}
                </VStack>
                </Box>
              </Box>

              {/* Doctor Details removed as requested */}
            </SimpleGrid>
          </Box>

          <Divider />

          {/* Services & Charges Table */}
          <Box p={{ base: 4, md: 8 }}>
            <Heading size="md" color="#2BA8D1" mb={6} display="flex" alignItems="center">
              <Icon as={MdReceipt} mr={2} />
              Services & Charges
            </Heading>
            
            <TableContainer overflowX="auto">
              <Table variant="simple" size={{ base: 'sm', md: 'lg' }}>
                <Thead bg="#2BA8D1" color="white">
                  <Tr>
                    <Th color="white" fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>Service Description</Th>
                    <Th isNumeric color="white" fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>Amount (Rs)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {/* Show only services with amount > 0 */}
                  {(appointment.billId?.consultationFee || 0) > 0 && (
                    <Tr>
                      <Td fontWeight="semibold">Consultation Fee</Td>
                      <Td isNumeric fontWeight="semibold">Rs {(appointment.billId.consultationFee || 0).toFixed(2)}</Td>
                    </Tr>
                  )}
                  
                  {(appointment.billId?.treatmentFee || 0) > 0 && (
                    <Tr>
                      <Td fontWeight="semibold">Treatment Fee</Td>
                      <Td isNumeric fontWeight="semibold">Rs {(appointment.billId.treatmentFee || 0).toFixed(2)}</Td>
                    </Tr>
                  )}
                  
                  {(appointment.billId?.medicineFee || 0) > 0 && (
                    <Tr>
                      <Td fontWeight="semibold">Medicine Fee</Td>
                      <Td isNumeric fontWeight="semibold">Rs {(appointment.billId.medicineFee || 0).toFixed(2)}</Td>
                    </Tr>
                  )}
                  
                  {(appointment.billId?.otherCharges || 0) > 0 && (
                    <Tr>
                      <Td fontWeight="semibold">Additional Services</Td>
                      <Td isNumeric fontWeight="semibold">Rs {(appointment.billId.otherCharges || 0).toFixed(2)}</Td>
                    </Tr>
                  )}
                  
                  {(appointment.billId?.hearingAidFee || 0) > 0 && (
                    <Tr>
                      <Td fontWeight="semibold">Hearing Aid Services</Td>
                      <Td isNumeric fontWeight="semibold">Rs {(appointment.billId.hearingAidFee || 0).toFixed(2)}</Td>
                    </Tr>
                  )}
                  
                  {(appointment.billId?.audiometryFee || 0) > 0 && (
                    <Tr>
                      <Td fontWeight="semibold">Audiometry Test</Td>
                      <Td isNumeric fontWeight="semibold">Rs {(appointment.billId.audiometryFee || 0).toFixed(2)}</Td>
                    </Tr>
                  )}
                  
                  {/* Services from services array */}
                  {appointment.billId?.services && appointment.billId.services.map((service, index) => {
                    const originalPrice = service.actualPrice || service.basePrice || 0;
                    let discountAmount = 0;
                    let finalPrice = originalPrice;
                    
                    if (service.discountType === 'percentage' && service.discountPercentage > 0) {
                      discountAmount = originalPrice * service.discountPercentage / 100;
                      finalPrice = originalPrice - discountAmount;
                    } else if (service.discountType === 'fixed' && service.discount > 0) {
                      discountAmount = service.discount;
                      finalPrice = originalPrice - discountAmount;
                    }
                    
                    return (
                      <Tr key={index}>
                        <Td fontWeight="semibold">{service.name}</Td>
                        <Td isNumeric>
                          {discountAmount > 0 ? (
                            <VStack spacing={1} align="end">
                              <Text fontSize="sm" color="red.500" textDecoration="line-through">
                                Rs {originalPrice.toFixed(2)}
                              </Text>
                              <Text fontSize="sm" color="green.500">
                                -Rs {discountAmount.toFixed(2)} ({service.discountType === 'percentage' ? `${service.discountPercentage}%` : 'Fixed'})
                              </Text>
                              <Text fontWeight="semibold">
                                Rs {Math.max(0, finalPrice).toFixed(2)}
                              </Text>
                            </VStack>
                          ) : (
                            <Text fontWeight="semibold">Rs {originalPrice.toFixed(2)}</Text>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>

            {/* Devices Table */}
            {appointment.billId?.devices && appointment.billId.devices.length > 0 && (
              <Box mt={{ base: 6, md: 10 }}>
                <Heading size="md" color="#2BA8D1" mb={4}>Devices</Heading>
                <TableContainer overflowX="auto">
                  <Table variant="simple" size={{ base: 'sm', md: 'lg' }}>
                    <Thead bg="#2BA8D1" color="white">
                      <Tr>
                        <Th color="white" fontSize={{ base: 'xs', md: 'sm' }}>Device</Th>
                        <Th isNumeric color="white" fontSize={{ base: 'xs', md: 'sm' }}>Unit Price (Rs)</Th>
                        <Th isNumeric color="white" fontSize={{ base: 'xs', md: 'sm' }}>Qty</Th>
                        <Th isNumeric color="white" fontSize={{ base: 'xs', md: 'sm' }}>Discount</Th>
                        <Th isNumeric color="white" fontSize={{ base: 'xs', md: 'sm' }}>Final Total (Rs)</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {appointment.billId.devices.map((device, idx) => {
                        const originalTotal = (Number(device.unitPrice) || 0) * (Number(device.quantity) || 0);
                        let discountAmount = 0;
                        let finalTotal = originalTotal;
                        
                        if (device.discountType === 'percentage' && device.discountPercentage > 0) {
                          discountAmount = originalTotal * device.discountPercentage / 100;
                          finalTotal = originalTotal - discountAmount;
                        } else if (device.discountType === 'fixed' && device.discount > 0) {
                          discountAmount = device.discount;
                          finalTotal = originalTotal - discountAmount;
                        }
                        
                        return (
                          <Tr key={idx}>
                            <Td fontWeight="semibold">{device.deviceName}</Td>
                            <Td isNumeric>Rs {Number(device.unitPrice || 0).toFixed(2)}</Td>
                            <Td isNumeric>{Number(device.quantity || 0)}</Td>
                            <Td isNumeric>
                              {discountAmount > 0 ? (
                                <VStack spacing={1} align="end">
                                  <Text fontSize="sm" color="red.500" textDecoration="line-through">
                                    Rs {originalTotal.toFixed(2)}
                                  </Text>
                                  <Text fontSize="sm" color="green.500">
                                    -Rs {discountAmount.toFixed(2)} ({device.discountType === 'percentage' ? `${device.discountPercentage}%` : 'Fixed'})
                                  </Text>
                                </VStack>
                              ) : (
                                <Text>No discount</Text>
                              )}
                            </Td>
                            <Td isNumeric fontWeight="semibold">Rs {Math.max(0, finalTotal).toFixed(2)}</Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Financial Summary */}
            <Box mt={{ base: 6, md: 8 }} maxW={{ base: "100%", md: "400px" }} ml={{ base: 0, md: "auto" }}>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>Subtotal:</Text>
                  <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>Rs {calculateSubtotal(appointment.billId).toFixed(2)}</Text>
                </Flex>
                
                {appointment.billId?.discount > 0 && (
                  <Flex justify="space-between" py={2} color="red.500">
                    <Text>Discount {appointment.billId?.discountType === 'percentage' ? 
                      `(${appointment.billId?.discountPercentage}%)` : 
                      `(${appointment.billId?.discountType || 'General'})`}:</Text>
                    <Text>-Rs {appointment.billId.discount.toFixed(2)}</Text>
                  </Flex>
                )}
                
                {/* Show tax only if GST > 0 */}
                {(appointment.billId?.taxPercentage || 0) > 0 && (
                  <Flex justify="space-between" py={2}>
                    <Text>Tax (GST {appointment.billId?.taxPercentage}%):</Text>
                    <Text>Rs {(appointment.billId?.tax || 0).toFixed(2)}</Text>
                  </Flex>
                )}
                
                <Divider />
                
                <Flex justify="space-between" py={4} bg="#2BA8D1" px={4} borderRadius="md" border="2px solid" borderColor="#2BA8D1">
                  <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }} color="white">TOTAL AMOUNT:</Text>
                  <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }} color="white">Rs {calculateTotal(appointment.billId).toFixed(2)}</Text>
                </Flex>
              </VStack>
            </Box>
          </Box>

          <Divider />

          {/* Prescription Section */}
          {appointment.prescription && (
            <Box p={{ base: 4, md: 8 }} bg="gray.50">
              <Heading size="md" color="#2BA8D1" mb={6} display="flex" alignItems="center">
                <Icon as={MdAssignment} mr={2} />
                Prescription Details
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                {appointment.prescription.diagnosis && (
                  <Box>
                    <Text fontWeight="bold" mb={2} color="gray.700">Diagnosis:</Text>
                    <Text bg="white" p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
                      {appointment.prescription.diagnosis}
                    </Text>
                  </Box>
                )}
                {appointment.prescription.treatment && (
                  <Box>
                    <Text fontWeight="bold" mb={2} color="gray.700">Treatment:</Text>
                    <Text bg="white" p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
                      {appointment.prescription.treatment}
                    </Text>
                  </Box>
                )}
              </SimpleGrid>
              
              {appointment.prescription.medicines && appointment.prescription.medicines.length > 0 && (
                <Box mt={{ base: 4, md: 6 }}>
                  <Text fontWeight="bold" mb={4} color="gray.700">Prescribed Medicines:</Text>
                  <TableContainer bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead bg="#2BA8D1">
                        <Tr>
                          <Th color="white">Medicine</Th>
                          <Th color="white">Dosage</Th>
                          <Th color="white">Frequency</Th>
                          <Th color="white">Duration</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {appointment.prescription.medicines.map((medicine, index) => (
                          <Tr key={index}>
                            <Td fontWeight="semibold">{medicine.name}</Td>
                            <Td>{medicine.dosage}</Td>
                            <Td>{medicine.frequency}</Td>
                            <Td>{medicine.duration}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}

          {/* Footer */}
          <Box bg="#2BA8D1" color="white" p={{ base: 4, md: 6 }} borderBottomRadius="xl">
            <VStack spacing={2}>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" textAlign="center">Thank you for choosing Aartiket Speech & Hearing Care</Text>
              <Text fontSize={{ base: 'xs', md: 'sm' }} opacity={0.9} textAlign="center">
                For any queries, please contact us at 98 6779 4003 or email aartiketspeechandhearing@gmail.com
              </Text>
              <Text fontSize="xs" opacity={0.7} mt={2} textAlign="center">
                Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}
              </Text>
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};

export default BillView;