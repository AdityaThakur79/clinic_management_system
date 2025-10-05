import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Container, Text, Heading, VStack, Flex, SimpleGrid, Image, Button, HStack, Badge, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Divider, FormControl, FormLabel, Select, Input, Textarea, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter } from "@chakra-ui/react";
import { FaVolumeUp, FaBluetooth, FaBatteryFull } from "react-icons/fa";
import PageHeader from "./Components/PageHeader";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import CTA from "./Components/CTA";
import { getBrandBySlug } from "../../data/hearingAidBrands";
import { useGetAllBranchesQuery } from "../../features/api/branchApi";
import { useCreateAppointmentMutation, useGetMultipleDateAvailabilityQuery } from "../../features/api/appointments";

const HearingAidBrand = () => {
  const { brandSlug } = useParams();
  const brand = getBrandBySlug(brandSlug);
  const [isVisible, setIsVisible] = React.useState({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    branchId: '',
    notes: '',
    serviceType: 'hearing_aid_brand_consultation',
    preferredDate: '',
    preferredTime: '09:00'
  });
  
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  const toast = useToast();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100 });
  const [createAppointment, { isLoading: isBookingLoading }] = useCreateAppointmentMutation();
  
  // Fetch availability data when branch and date are selected
  const { data: availabilityData, isLoading: isAvailabilityLoading } = useGetMultipleDateAvailabilityQuery(
    {
      branchId: bookingForm.branchId,
      startDate: selectedDate || new Date().toISOString().split('T')[0],
      days: 7
    },
    {
      // Fetch as soon as a branch is selected so we can show date options
      skip: !bookingForm.branchId
    }
  );

  const brandColors = {
    primary: "#2BA8D1",
    primaryDark: "#0C2F4D",
    bgSoft: "#F7FBFD"
  };

  // Update available time slots when availability data changes
  useEffect(() => {
    if (availabilityData?.data && selectedDate) {
      const dayAvailability = availabilityData.data.find(
        day => day.date === selectedDate
      );
      
      if (dayAvailability && dayAvailability.availableSlots) {
        // Filter only available slots and extract time strings
        const availableSlots = dayAvailability.availableSlots
          .filter(slot => slot.isAvailable)
          .map(slot => slot.time);
        setAvailableTimeSlots(availableSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    }
  }, [availabilityData, selectedDate]);

  // Reset time slot when date changes
  useEffect(() => {
    if (selectedDate) {
      setBookingForm(prev => ({ ...prev, preferredTime: '09:00' }));
    }
  }, [selectedDate]);

  // Check if a date should be disabled (non-working day)
  const isDateDisabled = (dateString) => {
    if (!availabilityData?.data) return false;
    
    const dayAvailability = availabilityData.data.find(
      day => day.date === dateString
    );
    
    return dayAvailability ? !dayAvailability.isWorkingDay : false;
  };

  // Get available dates for the date picker
  const getAvailableDates = () => {
    if (!availabilityData?.data) return [];
    
    return availabilityData.data
      .filter(day => day.isWorkingDay)
      .map(day => day.date);
  };

  const cardProps = {
    bg: "white",
    borderRadius: "2xl",
    p: { base: 4, md: 5 },
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
    if (field === 'preferredDate') {
      setSelectedDate(value);
      setBookingForm(prev => ({ ...prev, [field]: value }));
    } else {
      setBookingForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.branchId) {
      toast({
        title: 'Required fields missing',
        description: `Name, phone number, and branch selection are required`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Generate current date in YYYY-MM-DD format
      const today = new Date();
      const currentDate = today.toISOString().split('T')[0];
      
      const appointmentData = {
        branchId: bookingForm.branchId,
        service: `${brand.brandName} Hearing Aids Consultation`,
        servicePrice: 0,
        serviceDuration: 60,
        date: bookingForm.preferredDate || currentDate,
        timeSlot: bookingForm.preferredTime || '09:00',
        notes: `Consultation request - ${bookingForm.notes || `Hearing aid consultation request for ${brand.brandName}`}\nNote: Please schedule at your convenience`,
        serviceDetails: {
          importance: `${brand.brandName} hearing aid consultation - detailed evaluation and fitting`,
          benefits: [
            'Expert hearing assessment',
            'Personalized hearing aid fitting',
            'Professional advice on hearing solutions',
            'Follow-up support and maintenance'
          ],
          duration: '60 minutes consultation',
          preparationInstructions: 'No special preparation required. Please bring any previous hearing test results if available.',
          detailedInfo: `Comprehensive consultation for ${brand.brandName} hearing aids including assessment, fitting, and personalized recommendations.`,
        },
        patient: {
          name: bookingForm.name,
          email: bookingForm.email || '',
          contact: bookingForm.phone,
          age: undefined,
          gender: 'prefer_not_to_say',
          address: '',
        },
      };

      // Debug: Log appointment data before submission
      // console.log('Submitting appointment data:', JSON.stringify(appointmentData, null, 2));
      
      await createAppointment(appointmentData).unwrap();
      
      toast({
        title: 'Consultation Request Submitted!',
        description: `Your ${brand.brandName} hearing aids consultation request has been submitted. Our team will contact you soon to schedule the most convenient appointment time.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setIsBookingModalOpen(false);
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        branchId: '',
        notes: '',
        serviceType: 'hearing_aid_brand_consultation'
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
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brand?.brandName,
    "description": brand?.description,
    "foundingDate": brand?.founded,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": brand?.headquarters
    },
    "url": brand?.website,
    "sameAs": [brand?.website],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${brand?.brandName} Hearing Aids`,
      "itemListElement": brand?.devices?.map((device, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": device.name,
        "description": device.description,
        "category": device.category,
        "offers": {
          "@type": "Offer",
          "priceRange": device.priceRange
        }
      }))
    }
  };

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Brand Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The requested hearing aid brand could not be found.
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

  const metaKeywords = `${brand.brandName} hearing aids, ${brand.brandName} hearing devices, ${brand.brandName} audiologist, ${brand.brandName} hearing solutions, ${brand.brandName} Mumbai, hearing aid brands, professional hearing aids, ${brand.brandName} technology, hearing aid fitting, audiologist Mumbai`;

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>{brand.brandName} Hearing Aids Mumbai | Professional Hearing Solutions</title>
        <meta name="description" content={`Professional ${brand.brandName} hearing aids in Mumbai. Expert fitting, programming, and support for ${brand.brandName} devices. Book consultation today.`} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:title" content={`${brand.brandName} Hearing Aids Mumbai | Professional Hearing Solutions`} />
        <meta property="og:description" content={`Professional ${brand.brandName} hearing aids in Mumbai. Expert fitting, programming, and support for ${brand.brandName} devices.`} />
        <meta property="og:image" content={brand.logo} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(brandSchema)}
        </script>
      </head>

      <Box>
        <Navbar />
        
        {/* Page Header */}
        <PageHeader
          title={`${brand.brandName} Hearing Aids`}
          description={`Professional ${brand.brandName} hearing aids with expert fitting and support in Mumbai`}
          crumbs={[
            { label: "Services", link: "/services" },
            { label: "Hearing Aids", link: "/services" },
            { label: brand.brandName },
          ]}
          bgImage={brand.logo}
        />

        {/* Brand Overview Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg={brandColors.bgSoft}>
          <Container maxW="7xl">
            <Flex direction={{ base: "column", md: "row" }} gap={12} align="center">
              <Box flex={1} {...cardProps}>
                <Image
                  src={brand.logo}
                  alt={brand.brandName}
                  w="100%"
                  h="200px"
                  objectFit="contain"
                  borderRadius="lg"
                  mb={6}
                />
                <VStack spacing={4} align="start">
                  <Flex align="start">
                    <Box
                      w={6}
                      h={6}
                      bg={brandColors.primary}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mr={3}
                      mt={1}
                    >
                      <Text color="white" fontSize="sm">✓</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color={brandColors.primaryDark}>
                        Founded
                      </Text>
                      <Text color="gray.600">{brand.founded}</Text>
                    </Box>
                  </Flex>
                  <Flex align="start">
                    <Box
                      w={6}
                      h={6}
                      bg={brandColors.primary}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mr={3}
                      mt={1}
                    >
                      <Text color="white" fontSize="sm">✓</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color={brandColors.primaryDark}>
                        Headquarters
                      </Text>
                      <Text color="gray.600">{brand.headquarters}</Text>
                    </Box>
                  </Flex>
                  <Flex align="start">
                    <Box
                      w={6}
                      h={6}
                      bg={brandColors.primary}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mr={3}
                      mt={1}
                    >
                      <Text color="white" fontSize="sm">✓</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color={brandColors.primaryDark}>
                        Website
                      </Text>
                      <Text color="gray.600">
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" style={{ color: brandColors.primary }}>
                          {brand.website}
                        </a>
                      </Text>
                    </Box>
                  </Flex>
                </VStack>
              </Box>
              <Box flex={1} {...cardProps}>
                <Heading
                  as="h2"
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  color={brandColors.primaryDark}
                  mb={6}
                >
                  About {brand.brandName}
                </Heading>
                <Text
                  fontSize="lg"
                  color="gray.700"
                  lineHeight="tall"
                  mb={6}
                >
                  {brand.description}
                </Text>
                <Text
                  fontSize="md"
                  color="gray.600"
                  lineHeight="tall"
                  mb={6}
                >
                  We are proud to offer {brand.brandName} hearing aids, known for their innovative technology, 
                  superior sound quality, and user-friendly designs. Each device is carefully selected and 
                  professionally fitted to ensure optimal performance and comfort.
                </Text>
                
                {/* Brand Highlights */}
                <VStack spacing={4} align="start">
                  <Heading as="h3" fontSize="lg" color={brandColors.primaryDark}>
                    Why Choose {brand.brandName}?
                  </Heading>
                  <VStack spacing={3} align="start">
                    <HStack align="start" spacing={3}>
                      <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                      <Text color="gray.700">Advanced digital signal processing technology</Text>
                    </HStack>
                    <HStack align="start" spacing={3}>
                      <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                      <Text color="gray.700">Bluetooth connectivity for seamless streaming</Text>
                    </HStack>
                    <HStack align="start" spacing={3}>
                      <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                      <Text color="gray.700">Rechargeable options for convenience</Text>
                    </HStack>
                    <HStack align="start" spacing={3}>
                      <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                      <Text color="gray.700">Professional fitting and ongoing support</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Box>
            </Flex>
          </Container>
        </Box>

        {/* Technology & Innovation Section */}
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
                id="technology-title"
                opacity={isVisible['technology-title'] ? 1 : 0}
                transform={isVisible['technology-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                transition="all 0.8s ease-out"
              >
                {brand.brandName} Technology & Innovation
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
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
                    <FaVolumeUp color="white" size={24} />
                  </Box>
                  <Heading as="h3" fontSize="lg" color={brandColors.primaryDark} mb={3}>
                    Sound Quality
                  </Heading>
                  <Text color="gray.600">
                    Advanced digital processing delivers natural, clear sound with minimal distortion
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
                    <FaBluetooth color="white" size={24} />
                  </Box>
                  <Heading as="h3" fontSize="lg" color={brandColors.primaryDark} mb={3}>
                    Connectivity
                  </Heading>
                  <Text color="gray.600">
                    Seamless Bluetooth streaming for phone calls, music, and TV audio
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
                    <FaBatteryFull color="white" size={24} />
                  </Box>
                  <Heading as="h3" fontSize="lg" color={brandColors.primaryDark} mb={3}>
                    Battery Life
                  </Heading>
                  <Text color="gray.600">
                    Long-lasting rechargeable batteries with convenient overnight charging
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Product Showcase Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg={brandColors.primary}>
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color="#ffffff"
                textAlign="center"
                data-animate
                id="products-title"
                opacity={isVisible['products-title'] ? 1 : 0}
                transform={isVisible['products-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                transition="all 0.8s ease-out"
              >
                {brand.brandName} Product Range
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                {brand.devices.map((device, index) => (
                  <Box
                    key={device.id}
                    {...cardProps}
                    data-animate
                    id={`product-card-${index}`}
                    opacity={isVisible[`product-card-${index}`] ? 1 : 0}
                    transform={isVisible[`product-card-${index}`] ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)'}
                    transition={`all 0.6s ease-out`}
                    transitionDelay={`${index * 0.1}s`}
                    _hover={{
                      transform: "translateY(-8px) scale(1.02)",
                      shadow: "0 25px 50px rgba(43, 168, 209, 0.25)",
                      borderColor: brandColors.primary,
                    }}
                  >
                    {/* Product Image */}
                    <Box position="relative" mb={3}>
                      <Image
                        src={device.image}
                        alt={device.name}
                        w="100%"
                        h="120px"
                        objectFit="contain"
                        borderRadius="lg"
                        mb={3}
                      />
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="green"
                        variant="solid"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {device.priceRange}
                      </Badge>
                    </Box>

                    {/* Product Info */}
                    <VStack spacing={2} align="start">
                      <Heading as="h3" fontSize="md" color={brandColors.primaryDark}>
                        {device.name}
                      </Heading>
                      
                      <Text fontSize="xs" color="gray.600" lineHeight="1.4" noOfLines={2}>
                        {device.description}
                      </Text>

                      {/* Category Badge */}
                      <Badge colorScheme="blue" variant="outline" fontSize="xs">
                        {device.category}
                      </Badge>

                      {/* Key Features */}
                      <VStack spacing={1} align="start" w="full">
                        <Text fontSize="xs" fontWeight="semibold" color={brandColors.primaryDark}>
                          Key Features:
                        </Text>
                        <VStack spacing={0.5} align="start" w="full">
                          {device.features.slice(0, 2).map((feature, featureIndex) => (
                            <HStack key={featureIndex} spacing={1}>
                              <Box w={1} h={1} borderRadius="full" bg={brandColors.primary} mt={1} />
                              <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                {feature}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </VStack>

                      {/* Color Options - Simplified */}
                      <Text fontSize="xs" color="gray.500">
                        Multiple color variants available
                      </Text>

                      {/* Action Button */}
                      <Button
                        w="full"
                        bg={brandColors.primary}
                        color="white"
                        _hover={{ bg: brandColors.primaryDark }}
                        size="xs"
                        onClick={() => setIsBookingModalOpen(true)}
                      >
                        Book Consultation
                      </Button>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

       
        {/* FAQ Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg={brandColors.bgSoft}>
          <Container maxW="7xl">
            <VStack spacing={8} align="stretch">
              <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={brandColors.primaryDark} textAlign="center">
                Frequently Asked Questions About {brand.brandName}
              </Heading>
              <Accordion allowMultiple>
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        Why should I choose {brand.brandName} hearing aids?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      {brand.brandName} hearing aids are known for their innovative technology, superior sound quality, 
                      and user-friendly designs. They offer advanced features like Bluetooth connectivity, 
                      rechargeable options, and AI-powered sound processing for optimal hearing experience.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        Do you provide professional fitting for {brand.brandName} devices?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      Yes, we provide expert fitting and programming for all {brand.brandName} hearing aids. 
                      Our audiologists use advanced technology to customize devices to your specific hearing 
                      needs and lifestyle preferences, ensuring optimal performance and comfort.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        What warranty do {brand.brandName} hearing aids come with?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      {brand.brandName} hearing aids come with manufacturer warranty coverage. We also provide 
                      local support and service, including repairs, maintenance, and ongoing adjustments 
                      to ensure your devices continue to perform optimally.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                  <h3>
                    <AccordionButton _expanded={{ bg: brandColors.bgSoft }} px={6} py={4}>
                      <Box as="span" flex="1" textAlign="left" color={brandColors.primaryDark} fontWeight="semibold">
                        Can I connect {brand.brandName} hearing aids to my smartphone?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={6} pb={4}>
                    <Text color="gray.700">
                      Most modern {brand.brandName} hearing aids support Bluetooth connectivity, allowing you to 
                      stream audio directly from your smartphone, make hands-free calls, and control settings 
                      through dedicated mobile apps.
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
            <Text color={brandColors.primaryDark} fontWeight="semibold">Interested in {brand.brandName} hearing aids? Book a consultation with our audiologist.</Text>
            <HStack>
              <Button onClick={() => setIsBookingModalOpen(true)} bg={brandColors.primary} color="white" _hover={{ bg: brandColors.primaryDark }}>Book Consultation</Button>
              <Button 
                variant="outline" 
                color={brandColors.primaryDark} 
                borderColor={brandColors.primary} 
                _hover={{ 
                  bg: brandColors.primary, 
                  color: "white",
                  borderColor: brandColors.primary 
                }} 
                as={Link} 
                to="/contact"
              >
                Contact Us
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent bg="white" maxW="620px" borderRadius="xl" boxShadow="2xl" border="1px solid" borderColor="gray.200">
          <ModalHeader borderBottom="1px solid" borderColor="gray.200" pb={3}>
            <Text fontSize="xl" fontWeight="bold" color={brandColors.primaryDark}>
              Book Consultation
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              for {brand.brandName} Hearing Aids
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={5} align="stretch">
              {/* Service Details */}
              <Box w="full" p={4} bg={`${brandColors.primary}15`} borderRadius="lg" border="1px solid" borderColor={`${brandColors.primary}40`}>
                <Flex align="center" gap={4}>
                  <Image 
                    src={brand.logo} 
                    alt={brand.brandName}
                    w={16}
                    h={16}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={brandColors.primary}
                    p={1}
                    bg="white"
                  />
                  <Box flex={1}>
                    <Text fontWeight="semibold" color={brandColors.primaryDark} fontSize="lg">
                      Hearing Aid Consultation
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Expert consultation and fitting for {brand.brandName} hearing aids
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Select your preferred date and time, or we'll contact you to schedule
                    </Text>
                  </Box>
                </Flex>
              </Box>

              <Divider />

              {/* Patient Information */}
              <Text fontWeight="semibold" color="gray.800" alignSelf="start">
                Patient Information
              </Text>

              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Full Name</FormLabel>
                  <Input
                    value={bookingForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Email</FormLabel>
                  <Input
                    type="email"
                    value={bookingForm.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email (optional)"
                    size="sm"
                  />
                </FormControl>
              </HStack>

              {/* Branch Selection */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Branch</FormLabel>
                <Select
                  value={bookingForm.branchId}
                  onChange={(e) => handleInputChange('branchId', e.target.value)}
                  placeholder="Choose your preferred branch"
                  size="sm"
                >
                  {branchesData?.branches?.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName} - {branch.address}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Date and Time Selection */}
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Preferred Date</FormLabel>
                  <Select
                    value={bookingForm.preferredDate || ''}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    placeholder="Select preferred date"
                    size="sm"
                    disabled={!bookingForm.branchId}
                  >
                    {availabilityData?.data ? (
                      availabilityData.data
                        .filter(day => day.isWorkingDay)
                        .map((day) => {
                          const date = new Date(day.date);
                          const formattedDate = date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          });
                          return (
                            <option key={day.date} value={day.date}>
                              {formattedDate}
                            </option>
                          );
                        })
                    ) : (
                      <option value="">Loading dates...</option>
                    )}
                  </Select>
                  {!bookingForm.branchId && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Please select a branch first
                    </Text>
                  )}
                  {isAvailabilityLoading && (
                    <Text fontSize="xs" color="blue.500" mt={1}>
                      Loading availability...
                    </Text>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Preferred Time</FormLabel>
                  <Select
                    value={bookingForm.preferredTime || '09:00'}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    placeholder="Select preferred time"
                    size="sm"
                    disabled={!selectedDate || availableTimeSlots.length === 0}
                  >
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {new Date(`2000-01-01T${slot}`).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </option>
                      ))
                    ) : (
                      <option value="09:00">09:00 AM (Default)</option>
                    )}
                  </Select>
                  {!selectedDate && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Please select a date first
                    </Text>
                  )}
                  {selectedDate && availableTimeSlots.length === 0 && !isAvailabilityLoading && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      No available slots for this date
                    </Text>
                  )}
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Phone Number</FormLabel>
                <Input
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  size="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Notes</FormLabel>
                <Textarea
                  value={bookingForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any specific requirements or questions about hearing aids?"
                  size="sm"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <HStack spacing={3}>
              <Button 
                variant="outline" 
                colorScheme="brand" 
                onClick={() => setIsBookingModalOpen(false)} 
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                bg={brandColors.primary}
                color="white"
                onClick={handleBookingSubmit}
                isLoading={isBookingLoading}
                loadingText="Booking..."
                size="sm"
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

export default HearingAidBrand;