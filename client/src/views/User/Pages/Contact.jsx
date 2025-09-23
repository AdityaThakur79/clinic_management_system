import React, { useState } from "react";
import { assets } from "../../../assets/assets";
import CTA from "../Components/CTA";
import { Link } from "react-router-dom";
import PageHeader from "../Components/PageHeader";
import TopDoctors from "../Components/TopDoctors";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useCreateEnquiryMutation } from "../../../features/api/enquiryApi";
import {
  Box,
  Container,
  Grid,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Input,
  Textarea,
  Select,
  FormControl,
  useToast,
  Card,
  CardBody,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { 
  PhoneIcon, 
  EmailIcon, 
  TimeIcon,
  StarIcon,
  CheckIcon
} from "@chakra-ui/icons";
import { MdLocationOn as MapPinIcon } from 'react-icons/md';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    phone: "",
    city: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const toast = useToast();
  const [createEnquiry, { isLoading }] = useCreateEnquiryMutation();

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Reveal animations using IntersectionObserver
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit enquiry to backend
      const enquiryData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Website Enquiry`,
        message: `Age: ${formData.age || '-'}\nCity: ${formData.city || '-'}\nMessage: ${formData.message || '-'}`,
        locality: formData.city || '',
        service: 'General Enquiry',
        source: 'website'
      };

      const result = await createEnquiry(enquiryData).unwrap();
      
      toast({
        title: "Enquiry Submitted Successfully!",
        description: "Thank you for your enquiry. We'll contact you within 24 hours.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        age: "",
        phone: "",
        city: "",
        message: "",
      });

      // Also provide WhatsApp option
      const number = "918087766556";
      const text = `Hi, I just submitted an enquiry. Name: ${formData.name}, Age: ${formData.age}, City: ${formData.city}. Please check your system for details.`;
      const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
      
      setTimeout(() => {
        if (window.confirm("Would you like to also send a WhatsApp message for immediate assistance?")) {
          window.open(url, "_blank");
        }
      }, 2000);

    } catch (error) {
      console.error('Enquiry submission error:', error);
      
      // Fallback to WhatsApp if API fails
      const number = "918087766556";
      const text = `Contact Enquiry\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nAge: ${formData.age}\nCity: ${formData.city}\nMessage: ${formData.message}`;
      const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      
      toast({
        title: "Redirecting to WhatsApp",
        description: "System temporarily unavailable. Redirecting to WhatsApp for immediate assistance.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <PageHeader
        title="Contact Aartiket Speech & Hearing Care"
        description="Message us on WhatsApp or use the form — we’ll help you choose a nearby clinic in Mumbai and the best available slot."
        crumbs={[{ label: "Contact" }]}
        bgImage={assets.service_8}
      />

      {/* Contact Information Section */}
      <Box as="section" py={16} bg="gray.50">
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={headingColor}
                data-animate id="contact-title"
                opacity={isVisible['contact-title'] ? 1 : 0}
                transform={isVisible['contact-title'] ? 'translateY(0)' : 'translateY(20px)'}
                transition="all 0.6s ease-out">
                Get in Touch
              </Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl">
                We're here to help you with all your hearing and speech needs. Contact us through any of the channels below.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8} w="100%">
              {/* Phone Contact */}
              <Card bg={cardBg} borderColor={borderColor} shadow="lg" _hover={{ shadow: "xl" }}
                data-animate id="contact-card-phone"
                opacity={isVisible['contact-card-phone'] ? 1 : 0}
                transform={isVisible['contact-card-phone'] ? 'translateY(0)' : 'translateY(20px)'}
                transition="all 0.6s ease-out">
                <CardBody p={8} textAlign="center">
                  <Icon as={PhoneIcon} boxSize={12} color="#2BA8D1" mb={4} />
                  <Heading as="h3" fontSize="xl" fontWeight="bold" color={headingColor} mb={3}>
                    Call Us
                  </Heading>
                  <Text color={textColor} mb={4}>
                    Speak directly with our team
                  </Text>
                  <VStack spacing={2}>
                    <Text fontSize="lg" fontWeight="semibold" color="#2BA8D1">
                      +91 7977483031
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      Mon - Sat: 9:00 AM - 7:00 PM
                    </Text>
                    <Button as="a" href="tel:+917977483031" size="sm" bg="#2BA8D1" color="white" _hover={{ bg: '#1E88B8' }} rounded="full">
                      Call Now
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Email Contact */}
              <Card bg={cardBg} borderColor={borderColor} shadow="lg" _hover={{ shadow: "xl" }}
                data-animate id="contact-card-email"
                opacity={isVisible['contact-card-email'] ? 1 : 0}
                transform={isVisible['contact-card-email'] ? 'translateY(0)' : 'translateY(20px)'}
                transition="all 0.6s ease-out 0.1s">
                <CardBody p={8} textAlign="center">
                  <Icon as={EmailIcon} boxSize={12} color="#2BA8D1" mb={4} />
                  <Heading as="h3" fontSize="xl" fontWeight="bold" color={headingColor} mb={3}>
                    Email Us
                  </Heading>
                  <Text color={textColor} mb={4}>
                    Send us your queries
                  </Text>
                  <VStack spacing={2}>
                    <Text fontSize="lg" fontWeight="semibold" color="#2BA8D1">
                      aartiketspeechandhearing@gmail.com
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      We'll respond within 24 hours
                    </Text>
                    <Button as="a" href="mailto:aartiketspeechandhearing@gmail.com" size="sm" bg="#2BA8D1" color="white" _hover={{ bg: '#1E88B8' }} rounded="full">
                      Email Us
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Location */}
              <Card bg={cardBg} borderColor={borderColor} shadow="lg" _hover={{ shadow: "xl" }}
                data-animate id="contact-card-location"
                opacity={isVisible['contact-card-location'] ? 1 : 0}
                transform={isVisible['contact-card-location'] ? 'translateY(0)' : 'translateY(20px)'}
                transition="all 0.6s ease-out 0.2s">
                <CardBody p={8} textAlign="center">
                  <Icon as={MapPinIcon} boxSize={12} color="#2BA8D1" mb={4} />
                  <Heading as="h3" fontSize="xl" fontWeight="bold" color={headingColor} mb={3}>
                    Visit Us
                  </Heading>
                  <Text color={textColor} mb={4}>
                    Find us at our clinic locations across Mumbai
                  </Text>
                  <VStack spacing={2}>
                    <Text fontSize="lg" fontWeight="semibold" color="#2BA8D1">
                      Ghatkopar, Mumbai
                    </Text>
                    <Button as="a" href="https://maps.app.goo.gl/h1ndJAoJP2DnAr7M7" target="_blank" rel="noopener noreferrer" size="sm" bg="#2BA8D1" color="white" _hover={{ bg: '#1E88B8' }} rounded="full">
                      Open in Maps
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Main Contact Section */}
      <Box as="section" py={16} bg="white">
        <Container maxW="7xl">
          <Box bg="white" rounded="2xl" overflow="hidden" shadow="2xl">
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} minH="600px">
              {/* Info Area */}
              <Box bg="#2BA8D1" p={8} display="flex" alignItems="center" justifyContent="center"
                data-animate id="info-area"
                opacity={isVisible['info-area'] ? 1 : 0}
                transform={isVisible['info-area'] ? 'translateY(0)' : 'translateY(20px)'}
                transition="all 0.6s ease-out">
                <VStack spacing={8} textAlign="center" maxW="md">
                  <VStack spacing={4}>
                    <Heading as="h3" fontSize="2xl" fontWeight="bold" color="white">
                      Trusted Hearing Care Across Mumbai
                    </Heading>
                    <Text color="white" fontSize="lg" lineHeight="1.6" >
                     Book an appointment with our expert doctors in Mumbai.
                    </Text>
                  </VStack>

                  <VStack spacing={3} align="start" w="100%">
                    <HStack spacing={3}
                      data-animate id="info-bullet-1"
                      opacity={isVisible['info-bullet-1'] ? 1 : 0}
                      transform={isVisible['info-bullet-1'] ? 'translateY(0)' : 'translateY(10px)'}
                      transition="all 0.6s ease-out 0.1s">
                      <Icon as={CheckIcon} boxSize={5} color="white" />
                      <Text color="white">Same‑day appointment assistance</Text>
                    </HStack>
                    <HStack spacing={3}
                      data-animate id="info-bullet-2"
                      opacity={isVisible['info-bullet-2'] ? 1 : 0}
                      transform={isVisible['info-bullet-2'] ? 'translateY(0)' : 'translateY(10px)'}
                      transition="all 0.6s ease-out 0.2s">
                      <Icon as={CheckIcon} boxSize={5} color="white" />
                      <Text color="white">WhatsApp confirmation and reminders</Text>
                    </HStack>
                    <HStack spacing={3}
                      data-animate id="info-bullet-3"
                      opacity={isVisible['info-bullet-3'] ? 1 : 0}
                      transform={isVisible['info-bullet-3'] ? 'translateY(0)' : 'translateY(10px)'}
                      transition="all 0.6s ease-out 0.3s">
                      <Icon as={CheckIcon} boxSize={5} color="white" />
                      <Text color="white">Hearing tests, hearing aid trials & fitting, speech therapy</Text>
                    </HStack>
                  </VStack>

                  <HStack spacing={4} flexWrap="wrap" justify="center">
                    <Button
                      as="a"
                      href={`https://wa.me/918087766556?text=${encodeURIComponent("Hi, I'd like to book an appointment. My locality is …")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      bg="white"
                      color="#0C2F4D"
                      fontWeight="semibold"
                      px={6}
                      py={3}
                      rounded="full"
                      _hover={{ opacity: 0.9 }}
                      rightIcon={<Icon as={PhoneIcon} />}
                    >
                      WhatsApp Us
                    </Button>
                    <Button
                      as={Link}
                      to="/doctors"
                      bg="white"
                      color="#0C2F4D"
                      fontWeight="semibold"
                      px={6}
                      py={3}
                      rounded="full"
                      _hover={{ opacity: 0.9 }}
                      rightIcon={<Icon as={PhoneIcon} />}
                    >
                      Book Appointment
                    </Button>
                  </HStack>
                </VStack>
              </Box>

              {/* Contact Form */}
              <Box p={8}>
                <VStack spacing={6} align="stretch">
                  <VStack spacing={2} align="start">
                    <Heading as="h2" fontSize="3xl" fontWeight="bold" color={headingColor}>
                      Contact With Us
                    </Heading>
                    <Text color={textColor}>
                      If you have any questions please feel free to contact with us.
                    </Text>
                  </VStack>

                  <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align="stretch">
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        <FormControl>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            required
                            borderColor={borderColor}
                            _focus={{ borderColor: "#2BA8D1", boxShadow: "0 0 0 1px #2BA8D1" }}
                          />
                        </FormControl>
                        <FormControl>
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                            borderColor={borderColor}
                            _focus={{ borderColor: "#2BA8D1", boxShadow: "0 0 0 1px #2BA8D1" }}
                          />
                        </FormControl>
                      </Grid>

                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        <FormControl>
                          <Input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Age"
                            borderColor={borderColor}
                            _focus={{ borderColor: "#2BA8D1", boxShadow: "0 0 0 1px #2BA8D1" }}
                          />
                        </FormControl>
                        <FormControl>
                          <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone"
                            required
                            borderColor={borderColor}
                            _focus={{ borderColor: "#2BA8D1", boxShadow: "0 0 0 1px #2BA8D1" }}
                          />
                        </FormControl>
                      </Grid>

                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        <FormControl>
                          <Input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            borderColor={borderColor}
                            _focus={{ borderColor: "#2BA8D1", boxShadow: "0 0 0 1px #2BA8D1" }}
                          />
                        </FormControl>
                      </Grid>

                      

                      <FormControl>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Your Message"
                          h="32"
                          resize="none"
                          borderColor={borderColor}
                          _focus={{ borderColor: "#2BA8D1", boxShadow: "0 0 0 1px #2BA8D1" }}
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        bg="#2BA8D1"
                        color="white"
                        fontWeight="semibold"
                        py={6}
                        px={8}
                        rounded="lg"
                        _hover={{ bg: "#1E88B8" }}
                        isLoading={isSubmitting || isLoading}
                        loadingText="Submitting..."
                        rightIcon={<Icon as={PhoneIcon} />}
                      >
                        Submit Enquiry
                      </Button>
                    </VStack>
                  </form>
                </VStack>
              </Box>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Google Maps Section */}
      <Box as="section" py={16} bg="gray.50">
        <Container maxW="7xl">
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={headingColor}>
                Find Us
              </Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl">
                Visit our main clinic in Ghatkopar or any of our partner hospitals across Mumbai.
              </Text>
            </VStack>

            <Box w="100%" h="400px" rounded="2xl" overflow="hidden" shadow="xl">
              <iframe
                src="https://www.google.com/maps?q=Aartiket%20Speech%20and%20Hearing%20Care%20%2C%20Speech%20Therapy%20and%20Hearing%20Aid%20center&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Aartiket Speech & Hearing Care Location"
              />
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} w="100%">
              <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                <CardBody p={6}>
                  <VStack spacing={3} align="start">
                    <HStack spacing={2}>
                      <Icon as={MapPinIcon} boxSize={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" color={headingColor}>Main Clinic</Text>
                    </HStack>
                    <Text color={textColor} fontSize="sm">
                      Ghatkopar, Mumbai<br />
                      Maharashtra, India
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                <CardBody p={6}>
                  <VStack spacing={3} align="start" w="full">
                    <HStack spacing={2}>
                      <Icon as={TimeIcon} boxSize={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" color={headingColor}>Working Hours</Text>
                    </HStack>
                    <VStack spacing={2} align="stretch" w="full">
                      {[
                        { d: 'Monday', h: '10:30 AM – 8:30 PM' },
                        { d: 'Tuesday', h: '10:30 AM – 8:30 PM' },
                        { d: 'Wednesday', h: '10:30 AM – 8:30 PM' },
                        { d: 'Thursday', h: '10:30 AM – 8:30 PM' },
                        { d: 'Friday', h: '10:30 AM – 8:30 PM' },
                        { d: 'Saturday', h: '10:30 AM – 8:30 PM' },
                        { d: 'Sunday', h: 'Closed' },
                      ].map((item) => (
                        <HStack key={item.d} justify="space-between" w="full" fontSize="sm">
                          <Text color={textColor}>{item.d}</Text>
                          <Text color={item.h === 'Closed' ? 'red.500' : '#0C2F4D'} fontWeight="semibold">
                            {item.h}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card 
                bg={cardBg} 
                borderColor={borderColor} 
                shadow="lg"
                transition="all 0.3s ease"
                _hover={{ shadow: 'xl', transform: 'translateY(-4px)', borderColor: '#2BA8D1' }}
              >
                <CardBody p={6}>
                  <VStack spacing={3} align="start">
                    <HStack spacing={2}>
                      <Icon as={StarIcon} boxSize={5} color="#2BA8D1" />
                      <Text fontWeight="semibold" color={headingColor}>Hearing Care Locations</Text>
                    </HStack>
                    <Text color={textColor} fontSize="sm">
                      Multiple convenient locations<br />
                      across Mumbai
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* <TopDoctors /> */}
      <Footer />
    </>
  );
};

export default Contact;
