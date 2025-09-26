import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Container, Text, Heading, VStack, Flex, SimpleGrid, Image, Button, HStack, Badge, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Divider, FormControl, FormLabel, Select, Input, Textarea, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { FaVolumeUp, FaBluetooth, FaBatteryFull } from "react-icons/fa";
import PageHeader from "./Components/PageHeader";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import CTA from "./Components/CTA";
import { getBrandBySlug } from "../../data/hearingAidBrands";
import { useGetAllBranchesQuery } from "../../features/api/branchApi";
import { useCreateAppointmentMutation } from "../../features/api/appointments";

const HearingAidBrand = () => {
  const { brandSlug } = useParams();
  const brand = getBrandBySlug(brandSlug);
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
    serviceType: 'hearing_aid_brand_consultation'
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
        notes: `Service: ${brand.brandName} hearing aids consultation\nAdditional Notes: ${bookingForm.notes}`,
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
        description: `Your consultation for ${brand.brandName} hearing aids has been scheduled. We'll contact you soon to confirm the details.`,
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
                Book a Consultation for {brand.brandName} Hearing Aids
              </Heading>
              
              <Box {...cardProps} w="100%" maxW="4xl">
                <VStack spacing={8} align="stretch">
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Professional Consultation Required!</AlertTitle>
                      <AlertDescription>
                        Book a consultation to explore {brand.brandName} hearing aids. Our audiologists will help you find the perfect device from our {brand.brandName} collection and provide professional fitting services.
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
                          <Text color="gray.700">Comprehensive hearing assessment</Text>
                        </HStack>
                        <HStack align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">{brand.brandName} device demonstration</Text>
                        </HStack>
                        <HStack align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">Professional fitting and programming</Text>
                        </HStack>
                        <HStack align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">Trial period and evaluation</Text>
                        </HStack>
                        <HStack align="start" spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                          <Text color="gray.700">Ongoing support and adjustments</Text>
                        </HStack>
                      </VStack>
                    </VStack>
                    
                    <VStack spacing={6} align="center">
                      <Box textAlign="center">
                        <Heading as="h3" fontSize="xl" color={brandColors.primaryDark} mb={4}>
                          Ready to Explore {brand.brandName}?
                        </Heading>
                        <Text color="gray.600" mb={6}>
                          Book your consultation today and discover the perfect {brand.brandName} hearing aid for your needs.
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
              Book Consultation for {brand.brandName} Hearing Aids
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
                  placeholder="Any specific requirements or questions about {brand.brandName} hearing aids?"
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
                    You're booking a consultation for {brand.brandName} hearing aids. Our audiologist will assess your hearing needs and help you find the perfect device from our {brand.brandName} collection.
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

export default HearingAidBrand;