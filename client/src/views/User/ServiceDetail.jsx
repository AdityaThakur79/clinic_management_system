import React, { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Container, Text, Heading, VStack, Flex, SimpleGrid, Image } from "@chakra-ui/react";
import PageHeader from "./Components/PageHeader";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import CTA from "./Components/CTA";
import { getServiceBySlug } from "../../data/servicesData";
import PatternBG from "../../assets/patternBG.png";

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);
  const [isVisible, setIsVisible] = React.useState({});

  // Ensure scroll to top on mount for this page specifically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
  }, []);

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

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Service Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The requested service could not be found.
          </p>
          <p className="text-sm text-gray-500 mb-4">Slug: {slug}</p>
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

  const { detailedContent, seo } = service;

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={service.image} />
      </head>

      <Box>
        <Navbar />
        
        {/* Page Header */}
        <PageHeader
          title={service.title}
          description={service.description}
          crumbs={[
            { label: "Services", link: "/services" },
            { label: service.title },
          ]}
          bgImage={service.image}
        />

        {/* Service Overview Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg="white">
          <Container maxW="7xl">
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={12}
              align="center"
            >
              <Box 
                flex={1}
                data-animate
                id="overview-image"
                opacity={isVisible['overview-image'] ? 1 : 0}
                transform={isVisible['overview-image'] ? 'translateX(0)' : 'translateX(-50px)'}
                transition="all 0.8s ease-out"
              >
                <Image
                  src={service.image}
                  alt={service.title}
                  w="100%"
                  h="320px"
                  objectFit="cover"
                  borderRadius="lg"
                  shadow="lg"
                />
              </Box>
              <Box 
                flex={1}
                data-animate
                id="overview-content"
                opacity={isVisible['overview-content'] ? 1 : 0}
                transform={isVisible['overview-content'] ? 'translateX(0)' : 'translateX(50px)'}
                transition="all 0.8s ease-out"
                transitionDelay="0.2s"
              >
                <Heading
                  as="h2"
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  color="#0C2F4D"
                  mb={6}
                >
                  Service Overview
                </Heading>
                <Text
                  fontSize="lg"
                  color="gray.700"
                  lineHeight="tall"
                  mb={6}
                >
                  {detailedContent.overview}
                </Text>
                <VStack spacing={4} align="start">
                  <Flex align="start">
                    <Box
                      w={6}
                      h={6}
                      bg="#2BA8D1"
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
                      <Text fontWeight="semibold" color="#0C2F4D">
                        Duration
                      </Text>
                      <Text color="gray.600">
                        {detailedContent.duration}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex align="start">
                    <Box
                      w={6}
                      h={6}
                      bg="#2BA8D1"
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
                      <Text fontWeight="semibold" color="#0C2F4D">
                        Cost
                      </Text>
                      <Text color="gray.600">
                        {detailedContent.cost}
                      </Text>
                    </Box>
                  </Flex>
                </VStack>
              </Box>
            </Flex>
          </Container>
        </Box>

        {/* Process Section */}
        <Box
          as="section"
          py={{ base: 16, md: 20 }}
          bg="#2BA8D1"
          position="relative"
        >
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color="white"
                textAlign="center"
              >
                Our Process
              </Heading>

              {/* Timeline Layout */}
              <Box position="relative" w="100%" maxW="4xl" mx="auto">
                {/* Vertical Timeline Line */}
                <Box
                  position="absolute"
                  left={{ base: "20px", md: "40px" }}
                  top="0"
                  bottom="0"
                  w="2px"
                  bg="white"
                  sx={{ background: "white !important" }}
                  data-animate
                  id="timeline-line"
                  opacity={isVisible['timeline-line'] ? 1 : 0}
                  transform={isVisible['timeline-line'] ? 'scaleY(1)' : 'scaleY(0)'}
                  transformOrigin="top"
                  transition="all 1s ease-out"
                  transitionDelay="0.5s"
                />

                <VStack spacing={8} align="stretch">
                  {detailedContent.process.map((step, index) => (
                    <Flex
                      key={index}
                      position="relative"
                      align="start"
                      gap={6}
                      data-animate
                      id={`process-step-${index}`}
                      opacity={isVisible[`process-step-${index}`] ? 1 : 0}
                      transform={isVisible[`process-step-${index}`] ? 'translateY(0)' : 'translateY(30px)'}
                      transition={`all 0.6s ease-out`}
                      transitionDelay={`${index * 0.2}s`}
                    >
                      {/* Timeline Node */}
                      <Box
                        position="relative"
                        zIndex={2}
                        w={{ base: "40px", md: "80px" }}
                        display="flex"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Box
                          w={{ base: "12px", md: "16px" }}
                          h={{ base: "12px", md: "16px" }}
                          bg="#2BA8D1"
                          borderRadius="full"
                          border="3px solid white"
                          shadow="lg"
                          sx={{ bg: "#2BA8D1 !important" }}
                        />
                      </Box>

                      {/* Content Card */}
                      <Box
                        flex={1}
                        bg="white"
                        borderRadius="2xl"
                        p={{ base: 6, md: 8 }}
                        shadow="xl"
                        _hover={{ 
                          shadow: "2xl", 
                          transform: "translateY(-4px)" 
                        }}
                        transition="all 0.3s ease"
                        ml={{ base: 0, md: 4 }}
                      >
                        <Flex align="start" gap={4}>
                          <Box
                            w={{ base: "12", md: "16" }}
                            h={{ base: "12", md: "16" }}
                            bg="#2BA8D1"
                            borderRadius="2xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            shadow="lg"
                            flexShrink={0}
                            sx={{ bg: "#2BA8D1 !important" }}
                          >
                            <Text color="white" fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
                              {index + 1}
                            </Text>
                          </Box>
                          <Box flex={1}>
                            <Heading
                              as="h3"
                              fontSize={{ base: "lg", md: "xl" }}
                              fontWeight="bold"
                              color="#0C2F4D"
                              mb={3}
                            >
                              Step {index + 1}
                            </Heading>
                            <Text color="gray.700" lineHeight="tall" fontSize={{ base: "sm", md: "md" }}>
                              {step}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Container>
        </Box>

        {/* Benefits Section */}
        <Box as="section" py={{ base: 16, md: 20 }} bg="gray.50">
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color="#0C2F4D"
                textAlign="center"
                data-animate
                id="benefits-title"
                opacity={isVisible['benefits-title'] ? 1 : 0}
                transform={isVisible['benefits-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                transition="all 0.8s ease-out"
              >
                What You'll Get
              </Heading>
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={8}
                w="100%"
              >
                {detailedContent.benefits.map((benefit, index) => (
                  <Box
                    key={index}
                    bg="white"
                    p={8}
                    borderRadius="2xl"
                    shadow="lg"
                    _hover={{ 
                      shadow: "2xl", 
                      transform: "translateY(-4px)",
                      borderLeft: "4px solid #2BA8D1"
                    }}
                    borderLeft="4px solid #2BA8D1"
                    data-animate
                    id={`benefit-${index}`}
                    opacity={isVisible[`benefit-${index}`] ? 1 : 0}
                    transform={isVisible[`benefit-${index}`] ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)'}
                    transition={`all 0.6s ease-out`}
                    transitionDelay={`${index * 0.1}s`}
                  >
                    <Flex align="start" gap={4}>
                      <Box
                        w={12}
                        h={12}
                        bg="#2BA8D1"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        _groupHover={{ transform: "scale(1.1)" }}
                        transition="transform 0.3s ease"
                      >
                        <Text color="white" fontWeight="bold" fontSize="lg">
                          {index + 1}
                        </Text>
                      </Box>
                      <Text color="gray.700" fontWeight="medium" lineHeight="tall">
                        {benefit}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Age Groups or Specialized Content */}
        {detailedContent.ageGroups && (
          <Box as="section" py={{ base: 16, md: 20 }} bg="white">
            <Container maxW="7xl">
              <VStack spacing={16}>
                <Heading
                  as="h2"
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  color="#0C2F4D"
                  textAlign="center"
                  data-animate
                  id="specialized-title"
                  opacity={isVisible['specialized-title'] ? 1 : 0}
                  transform={isVisible['specialized-title'] ? 'translateY(0)' : 'translateY(-30px)'}
                  transition="all 0.8s ease-out"
                >
                  Specialized Care
                </Heading>
                <SimpleGrid
                  columns={{ base: 1, md: 3 }}
                  spacing={8}
                  w="100%"
                >
                  {Object.entries(detailedContent.ageGroups).map(
                    ([group, description], index) => (
                      <Box
                        key={group}
                        bg="gray.50"
                        p={8}
                        borderRadius="2xl"
                        shadow="lg"
                        _hover={{ 
                          shadow: "2xl", 
                          transform: "translateY(-4px)",
                          borderTop: "4px solid #2BA8D1"
                        }}
                        borderTop="4px solid #2BA8D1"
                        textAlign="center"
                        data-animate
                        id={`specialized-${index}`}
                        opacity={isVisible[`specialized-${index}`] ? 1 : 0}
                        transform={isVisible[`specialized-${index}`] ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)'}
                        transition={`all 0.6s ease-out`}
                        transitionDelay={`${index * 0.2}s`}
                      >
                        <VStack spacing={6}>
                          <Box
                            w={16}
                            h={16}
                            bg="#2BA8D1"
                            borderRadius="2xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            _groupHover={{ transform: "scale(1.1)" }}
                            transition="transform 0.3s ease"
                          >
                            <Text color="white" fontWeight="bold" fontSize="xl">
                              {group.charAt(0).toUpperCase()}
                            </Text>
                          </Box>
                          <Heading
                            as="h3"
                            fontSize="xl"
                            fontWeight="bold"
                            color="#0C2F4D"
                            textTransform="capitalize"
                          >
                            {group.replace(/([A-Z])/g, " $1").trim()}
                          </Heading>
                          <Text color="gray.700" lineHeight="tall">
                            {description}
                          </Text>
                        </VStack>
                      </Box>
                    )
                  )}
                </SimpleGrid>
              </VStack>
            </Container>
          </Box>
        )}

        <Box
          data-animate
          id="cta-section"
          opacity={isVisible['cta-section'] ? 1 : 0}
          transform={isVisible['cta-section'] ? 'translateY(0)' : 'translateY(50px)'}
          transition="all 1s ease-out"
        >
          <CTA />
        </Box>
        <Box
          data-animate
          id="footer-section"
          opacity={isVisible['footer-section'] ? 1 : 0}
          transform={isVisible['footer-section'] ? 'translateY(0)' : 'translateY(30px)'}
          transition="all 0.8s ease-out"
        >
          <Footer />
        </Box>
      </Box>
    </>
  );
};

export default ServiceDetail;
