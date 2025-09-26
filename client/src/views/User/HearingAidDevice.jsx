import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Container, Text, Heading, VStack, Flex, SimpleGrid, Image, Button, HStack, Badge, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Table, Thead, Tbody, Tr, Th, Td, Alert, AlertIcon, AlertTitle, AlertDescription, FormControl, FormLabel, Select, Input, Textarea, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter } from "@chakra-ui/react";
import { FaTools } from "react-icons/fa";
import PageHeader from "./Components/PageHeader";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import CTA from "./Components/CTA";
import { getDeviceBySlug } from "../../data/hearingAidBrands";
import { useGetAllBranchesQuery } from "../../features/api/branchApi";
import { useCreateAppointmentMutation } from "../../features/api/appointments";

const HearingAidDevice = () => {
  const { brandSlug, deviceSlug } = useParams();
  const device = getDeviceBySlug(deviceSlug);
  const [isVisible, setIsVisible] = React.useState({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'prefer_not_to_say',
    address: '',
    branchId: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    serviceType: 'hearing_aid_consultation'
  });
  
  const toast = useToast();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100 });
  const [createAppointment, { isLoading: isBookingLoading }] = useCreateAppointmentMutation();

  const brandColors = {
    primary: "#2BA8D1",
    primaryDark: "#0C2F4D",
    bgSoft: "#F7FBFD"
  };

  const cardProps = {
    bg: "white",
    borderRadius: "2xl",
    p: { base: 6, md: 8 },
    shadow: "xl",
    border: "1px solid",
    borderColor: "rgba(12,47,77,0.06)",
    _hover: { shadow: "2xl", transform: "translateY(-4px)" },
    transition: "all 0.25s ease"
  };

  // Intersection Observer for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.branchId) {
      toast({
        title: 'Required fields missing',
        description: 'Name, phone number, and branch selection are required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const appointmentData = {
        branchId: bookingForm.branchId,
        doctorId: null, // Optional doctor
        date: bookingForm.preferredDate || new Date().toISOString().split('T')[0],
        timeSlot: bookingForm.preferredTime || '09:00',
        notes: `Service: ${device.name} consultation\nAdditional Notes: ${bookingForm.notes}`,
        patient: {
          name: bookingForm.name,
          email: bookingForm.email,
          contact: bookingForm.phone,
          age: bookingForm.age ? parseInt(bookingForm.age) : undefined,
          gender: bookingForm.gender,
          address: bookingForm.address,
        },
      };

      const result = await createAppointment(appointmentData).unwrap();
      
      toast({
        title: 'Appointment Booked Successfully!',
        description: `Your consultation for ${device.name} has been scheduled. We'll contact you soon to confirm the details.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setIsBookingModalOpen(false);
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'prefer_not_to_say',
        address: '',
        branchId: '',
        preferredDate: '',
        preferredTime: '',
        notes: '',
        serviceType: 'hearing_aid_consultation'
      });
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: error?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // JSON-LD Schema for SEO
  const deviceSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": device?.name,
    "description": device?.description,
    "brand": {
      "@type": "Brand",
      "name": device?.brand
    },
    "category": device?.category,
    "offers": {
      "@type": "Offer",
      "priceRange": device?.priceRange,
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    },
    "additionalProperty": Object.entries(device?.specifications || {}).map(([key, value]) => ({
      "@type": "PropertyValue",
      "name": key.replace(/([A-Z])/g, ' $1').trim(),
      "value": value
    }))
  };

  if (!device) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Device Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The requested hearing aid device could not be found.
          </p>
          <Link
            to="/services"
            className="px-6 py-3 bg-[#2BA8D1] text-white rounded-lg hover:bg-[#3AC0E7] transition-colors"
          >
            View All Services
          </Link>
        </div>
      </div>
    );
  }

  const metaKeywords = `${device.name}, ${device.brand} hearing aid, ${device.category} hearing aid, ${device.brand} ${device.model}, hearing aid Mumbai, audiologist Mumbai, ${device.brand} technology, hearing aid fitting, professional hearing aids, ${device.brand} support`;

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>{device.name} Mumbai | {device.brand} Hearing Aid Details & Usage Guide</title>
        <meta name="description" content={`Complete guide to ${device.name} - ${device.brand} ${device.category} hearing aid. Specifications, usage instructions, maintenance tips, and professional fitting in Mumbai.`} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:title" content={`${device.name} Mumbai | ${device.brand} Hearing Aid Details & Usage Guide`} />
        <meta property="og:description" content={`Complete guide to ${device.name} - ${device.brand} ${device.category} hearing aid. Specifications, usage instructions, maintenance tips.`} />
        <meta property="og:image" content={device.image} />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">
          {JSON.stringify(deviceSchema)}
        </script>
      </head>

      <Box>
        <Navbar />
        
        {/* Page Header */}
        <PageHeader
          title={device.name}
          description={`Complete guide to ${device.name} - ${device.brand} ${device.category} hearing aid`}
          crumbs={[
            { label: "Services", link: "/services" },
            { label: "Hearing Aids", link: "/services" },
            { label: device.brand, link: `/hearing-aids/${brandSlug}` },
            { label: device.name },
          ]}
          bgImage={device.image}
        />

        {/* Device Overview Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg={brandColors.bgSoft}>
          <Container maxW="7xl">
            <Flex direction={{ base: "column", md: "row" }} gap={12} align="center">
              <Box flex={1} {...cardProps}>
                <Image
                  src={device.image}
                  alt={device.name}
                  w="100%"
                  h="320px"
                  objectFit="cover"
                  borderRadius="lg"
                />
              </Box>
              <Box flex={1} {...cardProps}>
                <VStack spacing={4} align="start">
                  <HStack spacing={2}>
                    <Badge colorScheme="blue" variant="subtle" size="lg">
                      {device.category}
                    </Badge>
                    <Badge colorScheme="green" variant="subtle" size="lg">
                      {device.priceRange}
                    </Badge>
                    <Badge colorScheme="purple" variant="subtle" size="lg">
                      {device.brand}
                    </Badge>
                  </HStack>
                  
                  <Heading
                    as="h2"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="bold"
                    color={brandColors.primaryDark}
                  >
                    {device.name}
                  </Heading>
                  
                  <Text
                    fontSize="lg"
                    color="gray.700"
                    lineHeight="tall"
                  >
                    {device.description}
                  </Text>
                  
                  <VStack spacing={3} align="start" w="100%">
                    <Text fontSize="md" fontWeight="semibold" color={brandColors.primaryDark}>
                      Key Features:
                    </Text>
                    <SimpleGrid columns={1} spacing={2} w="100%">
                      {device.features.map((feature, idx) => (
                        <HStack key={idx} align="start" spacing={2}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text fontSize="sm" color="gray.600">{feature}</Text>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  </VStack>

                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Professional Fitting Required!</AlertTitle>
                      <AlertDescription>
                        This device requires professional fitting and programming by our certified audiologists for optimal performance.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </Box>
            </Flex>
          </Container>
        </Box>

        {/* Specifications Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg="white">
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={brandColors.primaryDark}
                textAlign="center"
                data-animate
                id="specs-title"
                opacity={isVisible['specs-title'] ? 1 : 0}
                transform={isVisible['specs-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                transition="all 0.8s ease-out"
              >
                Technical Specifications
              </Heading>
              
              <Box {...cardProps} w="100%" maxW="4xl">
                <Table variant="simple" size="md">
                  <Tbody>
                    {Object.entries(device.specifications).map(([key, value]) => (
                      <Tr key={key}>
                        <Th color={brandColors.primaryDark} textTransform="capitalize" w="40%">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Th>
                        <Td color="gray.700" fontWeight="medium">{value}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </Container>
        </Box>

        {/* Comprehensive Usage Guide Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg={brandColors.bgSoft}>
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={brandColors.primaryDark}
                textAlign="center"
                data-animate
                id="usage-title"
                opacity={isVisible['usage-title'] ? 1 : 0}
                transform={isVisible['usage-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                transition="all 0.8s ease-out"
              >
                Complete Usage Guide
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
                <Box {...cardProps}>
                  <Heading as="h3" fontSize="xl" color={brandColors.primaryDark} mb={4}>
                    Step-by-Step Usage Instructions
                  </Heading>
                  <VStack spacing={4} align="start">
                    {device.howToUse.map((step, idx) => (
                      <Box key={idx} w="100%">
                        <HStack align="start" spacing={3}>
                          <Box
                            w={8}
                            h={8}
                            bg={brandColors.primary}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            <Text color="white" fontSize="sm" fontWeight="bold">
                              {idx + 1}
                            </Text>
                          </Box>
                          <Text color="gray.700" lineHeight="tall">
                            {step}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
                
                <Box {...cardProps}>
                  <Heading as="h3" fontSize="xl" color={brandColors.primaryDark} mb={4}>
                    Daily Maintenance Schedule
                  </Heading>
                  <VStack spacing={4} align="start">
                    {device.maintenance.map((item, idx) => (
                      <Box key={idx} w="100%">
                        <HStack align="start" spacing={3}>
                          <Box
                            w={6}
                            h={6}
                            bg={brandColors.primary}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            <Text color="white" fontSize="xs">✓</Text>
                          </Box>
                          <Text color="gray.700">{item}</Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Dos & Don'ts Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg="white">
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={brandColors.primaryDark}
                textAlign="center"
                data-animate
                id="dos-donts-title"
                opacity={isVisible['dos-donts-title'] ? 1 : 0}
                transform={isVisible['dos-donts-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                transition="all 0.8s ease-out"
              >
                Important Dos & Don'ts
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
                <Box {...cardProps} borderLeft={`4px solid ${brandColors.primary}`}>
                  <VStack spacing={4} align="start">
                    <Heading as="h3" fontSize="xl" color={brandColors.primaryDark}>
                      ✅ Do's
                    </Heading>
                    <VStack spacing={3} align="start">
                      {device.dosDonts.dos.map((item, idx) => (
                        <HStack key={idx} align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">{item}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
                
                <Box {...cardProps} borderLeft={`4px solid #FF6B6B`}>
                  <VStack spacing={4} align="start">
                    <Heading as="h3" fontSize="xl" color={brandColors.primaryDark}>
                      ❌ Don'ts
                    </Heading>
                    <VStack spacing={3} align="start">
                      {device.dosDonts.donts.map((item, idx) => (
                        <HStack key={idx} align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg="#FF6B6B" mt={2} />
                          <Text color="gray.700">{item}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Precautions & Troubleshooting */}
        <Box as="section" py={{ base: 16, md: 20 }} bg={brandColors.bgSoft}>
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={brandColors.primaryDark}
                textAlign="center"
                data-animate
                id="precautions-title"
                opacity={isVisible['precautions-title'] ? 1 : 0}
                transform={isVisible['precautions-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                transition="all 0.8s ease-out"
              >
                Safety Precautions & Troubleshooting
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
                <Box {...cardProps}>
                  <VStack spacing={4} align="start">
                    <Heading as="h3" fontSize="xl" color={brandColors.primaryDark}>
                      ⚠️ Important Precautions
                    </Heading>
                    <VStack spacing={3} align="start">
                      {device.precautions.map((item, idx) => (
                        <HStack key={idx} align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg="#FF6B6B" mt={2} />
                          <Text color="gray.700">{item}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
                
                <Box {...cardProps}>
                  <VStack spacing={4} align="start">
                    <Heading as="h3" fontSize="xl" color={brandColors.primaryDark}>
                      <FaTools style={{ display: 'inline', marginRight: '8px' }} /> Common Troubleshooting
                    </Heading>
                    <VStack spacing={3} align="start">
                      {device.troubleshooting.map((item, idx) => (
                        <HStack key={idx} align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">{item}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Professional Support Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg="white">
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={brandColors.primaryDark}
                textAlign="center"
                data-animate
                id="support-title"
                opacity={isVisible['support-title'] ? 1 : 0}
                transform={isVisible['support-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                transition="all 0.8s ease-out"
              >
                Professional Support & Services
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                <Box {...cardProps} textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg={brandColors.primary}
                    borderRadius="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={4}
                  >
                    <FaTools color="white" size={24} />
                  </Box>
                  <Heading as="h3" fontSize="lg" color={brandColors.primaryDark} mb={3}>
                    Professional Fitting
                  </Heading>
                  <Text color="gray.600">
                    Expert fitting and programming by certified audiologists for optimal performance
                  </Text>
                </Box>
                
                <Box {...cardProps} textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg={brandColors.primary}
                    borderRadius="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={4}
                  >
                    <Text color="white" fontSize="2xl">🛠️</Text>
                  </Box>
                  <Heading as="h3" fontSize="lg" color={brandColors.primaryDark} mb={3}>
                    Repair & Maintenance
                  </Heading>
                  <Text color="gray.600">
                    Comprehensive repair services and regular maintenance for long-lasting performance
                  </Text>
                </Box>
                
                <Box {...cardProps} textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg={brandColors.primary}
                    borderRadius="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={4}
                  >
                    <Text color="white" fontSize="2xl">📞</Text>
                  </Box>
                  <Heading as="h3" fontSize="lg" color={brandColors.primaryDark} mb={3}>
                    Ongoing Support
                  </Heading>
                  <Text color="gray.600">
                    Continuous support, adjustments, and guidance throughout your hearing journey
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Book Consultation Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg="white">
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={brandColors.primaryDark}
                textAlign="center"
                data-animate
                id="booking-title"
                opacity={isVisible['booking-title'] ? 1 : 0}
                transform={isVisible['booking-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                transition="all 0.8s ease-out"
              >
                Book a Consultation for {device.name}
              </Heading>
              
              <Box {...cardProps} w="100%" maxW="4xl">
                <VStack spacing={8} align="stretch">
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Professional Consultation Required!</AlertTitle>
                      <AlertDescription>
                        Book a consultation to get expert advice on {device.name}. Our audiologists will help you determine if this device is right for your hearing needs and provide professional fitting services.
                      </AlertDescription>
                    </Box>
                  </Alert>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                    <VStack spacing={6} align="start">
                      <Heading as="h3" fontSize="xl" color={brandColors.primaryDark}>
                        What's Included in Your Consultation?
                      </Heading>
                      <VStack spacing={4} align="start">
                        <HStack align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">Hearing assessment and evaluation</Text>
                        </HStack>
                        <HStack align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">Device demonstration and trial</Text>
                        </HStack>
                        <HStack align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">Professional fitting and programming</Text>
                        </HStack>
                        <HStack align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">Usage training and maintenance guidance</Text>
                        </HStack>
                        <HStack align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">Follow-up support and adjustments</Text>
                        </HStack>
                      </VStack>
                    </VStack>
                    
                    <VStack spacing={6} align="center">
                      <Box textAlign="center">
                        <Heading as="h3" fontSize="xl" color={brandColors.primaryDark} mb={4}>
                          Ready to Get Started?
                        </Heading>
                        <Text color="gray.600" mb={6}>
                          Book your consultation today and take the first step towards better hearing with {device.name}.
                        </Text>
                        <Button
                          onClick={() => setIsBookingModalOpen(true)}
                          bg={brandColors.primary}
                          color="white"
                          _hover={{ bg: "#3AC0E7" }}
                          size="lg"
                          px={8}
                          py={6}
                          borderRadius="full"
                          fontWeight="semibold"
                          fontSize="lg"
                        >
                          Book Consultation Now
                        </Button>
                      </Box>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </Box>
            </VStack>
          </Container>
        </Box>

        {/* FAQ Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg={brandColors.bgSoft}>
          <Container maxW="7xl">
            <VStack spacing={8} align="stretch">
              <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={brandColors.primaryDark} textAlign="center">
                Frequently Asked Questions About {device.name}
              </Heading>
              <Accordion allowMultiple>
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        How long does the battery last on {device.name}?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      Battery life varies by model and usage. Most {device.brand} devices offer {device.specifications?.batteryLife || '24-30 hours'} of continuous use. 
                      Check the specifications above for your specific model's battery performance.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        Is {device.name} waterproof?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      {device.name} has {device.specifications?.waterResistance || 'IP67/IP68'} water resistance rating, but it is not fully waterproof. 
                      Avoid swimming or showering with it unless specifically designed for water activities.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        Can I connect {device.name} to my smartphone?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      Yes, {device.name} supports {device.specifications?.bluetooth || 'Bluetooth 5.0'} connectivity for streaming audio, 
                      phone calls, and app-based controls. You can control settings and stream audio directly from your smartphone.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        How often should I clean {device.name}?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      Clean {device.name} daily with a dry cloth and brush. Perform deep cleaning weekly, 
                      and replace filters monthly. Follow the maintenance schedule provided above for optimal performance.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        What if I need repairs for {device.name}?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      We provide professional repair and maintenance services for all {device.brand} hearing aids. 
                      Contact us for service appointments, warranty information, and quick turnaround repairs.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        Do you provide training on how to use {device.name}?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      Yes, we provide comprehensive training on {device.name} usage, including app controls, 
                      Bluetooth pairing, maintenance procedures, and troubleshooting tips during your fitting appointment.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </VStack>
          </Container>
        </Box>

        <CTA />
        <Footer />
      </Box>

      {/* Sticky CTA Bar */}
      <Box position="fixed" bottom={4} left={0} right={0} zIndex={50} px={{ base: 4, md: 8 }}>
        <Box maxW="7xl" mx="auto" bg="white" borderRadius="xl" shadow="xl" border="1px solid" borderColor="rgba(12,47,77,0.08)" p={{ base: 3, md: 4 }}>
          <Flex align="center" justify="space-between" gap={4} direction={{ base: "column", md: "row" }}>
            <Text color={brandColors.primaryDark} fontWeight="semibold">Interested in {device.name}? Book a consultation with our audiologist.</Text>
            <HStack>
              <Button onClick={() => setIsBookingModalOpen(true)} bg={brandColors.primary} color="white" _hover={{ bg: brandColors.primaryDark }}>Book Consultation</Button>
              <Button variant="outline" color={brandColors.primaryDark} borderColor={brandColors.primary} as={Link} to="/contact">Contact Us</Button>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} size={{ base: "full", md: "xl", lg: "2xl" }} isCentered>
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }} my={{ base: 4, md: 0 }} maxH={{ base: "90vh", md: "80vh" }} overflowY="auto">
          <ModalHeader px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
            <Heading fontSize={{ base: "lg", md: "xl" }} color={brandColors.primaryDark}>
              Book Consultation for {device.name}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody px={{ base: 4, md: 6 }} pb={{ base: 4, md: 6 }}>
            <VStack spacing={6}>
              {/* Personal Information */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.700">Full Name</FormLabel>
                  <Input
                    value={bookingForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    size="md"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.700">Phone Number</FormLabel>
                  <Input
                    value={bookingForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    type="tel"
                    size="md"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.700">Email Address</FormLabel>
                  <Input
                    value={bookingForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    type="email"
                    size="md"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.700">Age</FormLabel>
                  <Input
                    value={bookingForm.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter your age"
                    type="number"
                    size="md"
                  />
                </FormControl>
              </SimpleGrid>

              {/* Branch Selection */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.700">Select Branch</FormLabel>
                <Select
                  value={bookingForm.branchId}
                  onChange={(e) => handleInputChange('branchId', e.target.value)}
                  placeholder="Choose your preferred branch"
                  size="md"
                >
                  {branchesData?.branches?.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName} - {branch.address}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Gender Selection */}
              <FormControl>
                <FormLabel fontSize="sm" color="gray.700">Gender</FormLabel>
                <Select
                  value={bookingForm.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  size="md"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </Select>
              </FormControl>

              {/* Address */}
              <FormControl>
                <FormLabel fontSize="sm" color="gray.700">Address</FormLabel>
                <Textarea
                  value={bookingForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your address"
                  rows={3}
                  size="md"
                />
              </FormControl>

              {/* Preferred Date and Time */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.700">Preferred Date</FormLabel>
                  <Input
                    value={bookingForm.preferredDate}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    size="md"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.700">Preferred Time</FormLabel>
                  <Select
                    value={bookingForm.preferredTime}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    size="md"
                  >
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Additional Notes */}
              <FormControl>
                <FormLabel fontSize="sm" color="gray.700">Additional Notes</FormLabel>
                <Textarea
                  value={bookingForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any specific requirements or questions about {device.name}?"
                  rows={3}
                  size="md"
                />
              </FormControl>

              {/* Service Information */}
              <Alert status="info" borderRadius="lg" w="100%">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Service Details</AlertTitle>
                  <AlertDescription fontSize="sm">
                    You're booking a consultation for {device.name}. Our audiologist will assess your hearing needs and provide expert guidance on this device.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
            <HStack spacing={3} w="full" justify={{ base: "center", md: "flex-end" }}>
              <Button variant="outline" onClick={() => setIsBookingModalOpen(false)} size="md">
                Cancel
              </Button>
              <Button
                bg={brandColors.primary}
                color="white"
                _hover={{ bg: brandColors.primaryDark }}
                onClick={handleBookingSubmit}
                isLoading={isBookingLoading}
                loadingText="Booking..."
                size="md"
                minW={{ base: "120px", md: "140px" }}
              >
                Book Consultation
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HearingAidDevice;