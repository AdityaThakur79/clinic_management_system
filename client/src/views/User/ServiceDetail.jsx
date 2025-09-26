import React, { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Container, Text, Heading, VStack, Flex, SimpleGrid, Image, Divider, Button, HStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
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
  // Build Mumbai-focused FAQs (added dynamically without changing source data)
  const mumbaiFaqs = [
    {
      q: `Where can I get ${service.title.toLowerCase()} in Mumbai?`,
      a: `You can book ${service.title.toLowerCase()} at our Mumbai clinic. We serve patients across Kalyan, Dombivli, Thane and nearby suburbs with same‑week appointments.`
    },
    {
      q: `What is the cost of ${service.title.toLowerCase()} in Mumbai?`,
      a: `Pricing depends on your case and protocol. We provide transparent quotes during consultation and offer easy payment options. Contact us for current Mumbai pricing.`
    },
    {
      q: `How soon can I book ${service.title.toLowerCase()} near me?`,
      a: `Most Mumbai patients get slots within 24–72 hours. Use the Book Appointment button or call/WhatsApp for urgent availability.`
    },
    {
      q: `Is ${service.title.toLowerCase()} available for children and senior citizens in Mumbai?`,
      a: `Yes. Our audiologist provides child‑friendly and senior‑friendly care with age‑appropriate protocols and comfortable facilities at our Mumbai center.`
    },
    {
      q: `Do you provide reports and follow‑up for ${service.title.toLowerCase()}?`,
      a: `Yes. You’ll receive a clear report with next‑step guidance. Follow‑ups and counselling are included as clinically required.`
    }
  ];

  const mergedFaqs = Array.isArray(detailedContent.faqs)
    ? [...detailedContent.faqs, ...mumbaiFaqs]
    : mumbaiFaqs;

  // Build Mumbai-focused keyword set for meta and schema
  const baseKeywords = typeof seo?.keywords === 'string' ? seo.keywords.split(',').map(k => k.trim()) : [];
  const generatedKeywords = [
    `${service.title} Mumbai`,
    `${service.title} in Mumbai`,
    `best ${service.title.toLowerCase()} Mumbai`,
    `${service.title.toLowerCase()} near me`,
    `audiologist Mumbai`,
    `hearing clinic Mumbai`,
    `hearing test Mumbai`,
  ];
  const allKeywords = Array.from(new Set([...baseKeywords, ...generatedKeywords])).join(', ');
  const brand = {
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

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={allKeywords} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={service.image} />
        {/* JSON-LD: Service schema with Mumbai context */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalBusiness',
            name: service.title,
            description: seo.description,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            image: service.image,
            areaServed: {
              '@type': 'City',
              name: 'Mumbai'
            },
            address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressRegion: 'MH', addressCountry: 'IN' },
            keywords: allKeywords,
            serviceType: service.category,
          })}
        </script>
        {/* JSON-LD: FAQ schema (combined with Mumbai FAQs) */}
        {Array.isArray(mergedFaqs) && mergedFaqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: mergedFaqs.slice(0, 14).map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              }))
            })}
          </script>
        )}
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
        <Box as="section" py={{ base: 16, md: 20 }} bg={brand.bgSoft}>
          <Container maxW="7xl">
            <Flex direction={{ base: "column", md: "row" }} gap={12} align="stretch">
              <Box
                flex={1}
                data-animate
                id="overview-image"
                opacity={isVisible['overview-image'] ? 1 : 0}
                transform={isVisible['overview-image'] ? 'translateX(0)' : 'translateX(-50px)'}
                transition="all 0.8s ease-out"
                {...cardProps}
              >
                <Image src={service.image} alt={service.title} w="100%" h="320px" objectFit="cover" borderRadius="lg" />
              </Box>
              <Box
                flex={1}
                data-animate
                id="overview-content"
                opacity={isVisible['overview-content'] ? 1 : 0}
                transform={isVisible['overview-content'] ? 'translateX(0)' : 'translateX(50px)'}
                transition="all 0.8s ease-out"
                transitionDelay="0.2s"
                {...cardProps}
              >
                <Heading
                  as="h2"
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  color={brand.primaryDark}
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
                      bg={brand.primary}
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
                      bg={brand.primary}
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

        {/* Optional Sections: Preparation, What to Expect, Indications, Contraindications */}
        {(detailedContent.preparation || detailedContent.whatToExpect || detailedContent.indications || detailedContent.contraindications) && (
          <Box as="section" py={{ base: 16, md: 20 }} bg={brand.bgSoft}>
            <Container maxW="7xl">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                {detailedContent.preparation && (
                  <Box data-animate id="prep" opacity={isVisible['prep'] ? 1 : 0} transform={isVisible['prep'] ? 'translateY(0)' : 'translateY(30px)'} transition="all 0.6s ease-out" {...cardProps}>
                    <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} color={brand.primaryDark} mb={4}>Preparation</Heading>
                    <VStack align="start" spacing={3}>
                      {detailedContent.preparation.map((item, idx) => (
                        <Text key={idx} color="gray.700">• {item}</Text>
                      ))}
                    </VStack>
                  </Box>
                )}
                {detailedContent.whatToExpect && (
                  <Box data-animate id="expect" opacity={isVisible['expect'] ? 1 : 0} transform={isVisible['expect'] ? 'translateY(0)' : 'translateY(30px)'} transition="all 0.6s ease-out" {...cardProps}>
                    <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} color={brand.primaryDark} mb={4}>What to Expect</Heading>
                    <VStack align="start" spacing={3}>
                      {detailedContent.whatToExpect.map((item, idx) => (
                        <Text key={idx} color="gray.700">• {item}</Text>
                      ))}
                    </VStack>
                  </Box>
                )}
                {detailedContent.indications && (
                  <Box data-animate id="indications" opacity={isVisible['indications'] ? 1 : 0} transform={isVisible['indications'] ? 'translateY(0)' : 'translateY(30px)'} transition="all 0.6s ease-out" {...cardProps}>
                    <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} color={brand.primaryDark} mb={4}>Who Should Consider This</Heading>
                    <VStack align="start" spacing={3}>
                      {detailedContent.indications.map((item, idx) => (
                        <Text key={idx} color="gray.700">• {item}</Text>
                      ))}
                    </VStack>
                  </Box>
                )}
                {detailedContent.contraindications && (
                  <Box data-animate id="contra" opacity={isVisible['contra'] ? 1 : 0} transform={isVisible['contra'] ? 'translateY(0)' : 'translateY(30px)'} transition="all 0.6s ease-out" {...cardProps}>
                    <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} color={brand.primaryDark} mb={4}>Contraindications</Heading>
                    <VStack align="start" spacing={3}>
                      {detailedContent.contraindications.map((item, idx) => (
                        <Text key={idx} color="gray.700">• {item}</Text>
                      ))}
                    </VStack>
                  </Box>
                )}
              </SimpleGrid>
            </Container>
          </Box>
        )}

        {/* Process Section */}
        <Box
          as="section"
          py={{ base: 16, md: 20 }}
          bgGradient={`linear(to-b, ${brand.primary}, #3AC0E7)`}
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
                      <Box flex={1} {...cardProps} ml={{ base: 0, md: 4 }}>
                        <Flex align="start" gap={4}>
                          <Box
                            w={{ base: "12", md: "16" }}
                            h={{ base: "12", md: "16" }}
                            bg={brand.primary}
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
                              color={brand.primaryDark}
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
        <Box as="section" py={{ base: 16, md: 20 }} bg={brand.bgSoft}>
          <Container maxW="7xl">
            <VStack spacing={16}>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={brand.primaryDark}
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
                    {...cardProps}
                    borderLeft={`4px solid ${brand.primary}`}
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
                        bg={brand.primary}
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

        {/* Dos & Don'ts, Aftercare, Risks, Results */}
        {(detailedContent.dosDonts || detailedContent.aftercare || detailedContent.risks || detailedContent.results) && (
          <Box as="section" py={{ base: 16, md: 20 }} bg="white">
            <Container maxW="7xl">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={{ base: 6, md: 8, lg: 10 }}>
                {detailedContent.dosDonts && (
                  <Box {...cardProps} borderTop={`4px solid ${brand.primary}`} gridColumn={{ base: "auto", lg: "span 3" }}>
                    <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} color={brand.primaryDark} mb={4}>Dos & Don'ts</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 6 }}>
                      <Box pr={{ md: 4 }}>
                        <Heading as="h4" fontSize="md" color={brand.primaryDark} mb={2}>Do</Heading>
                        <VStack align="start" spacing={3}>
                          {(detailedContent.dosDonts.dos || []).map((item, idx) => (
                            <HStack key={idx} align="start" spacing={2}>
                              <Box w={2} h={2} borderRadius="full" bg={brand.primary} mt={2} />
                              <Text color="gray.700" lineHeight="taller">{item}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                      <Box pl={{ md: 4 }}>
                        <Heading as="h4" fontSize="md" color={brand.primaryDark} mb={2}>Don't</Heading>
                        <VStack align="start" spacing={3}>
                          {(detailedContent.dosDonts.donts || []).map((item, idx) => (
                            <HStack key={idx} align="start" spacing={2}>
                              <Box w={2} h={2} borderRadius="full" bg="#FF6B6B" mt={2} />
                              <Text color="gray.700" lineHeight="taller">{item}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    </SimpleGrid>
                  </Box>
                )}
                {detailedContent.aftercare && (
                  <Box {...cardProps} borderTop={`4px solid ${brand.primary}`} gridColumn={{ base: "auto", lg: "span 2" }}>
                    <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} color={brand.primaryDark} mb={4}>Aftercare</Heading>
                    <VStack align="start" spacing={3}>
                      {detailedContent.aftercare.map((item, idx) => (
                        <HStack key={idx} align="start" spacing={2}>
                          <Box w={2} h={2} borderRadius="full" bg={brand.primary} mt={2} />
                          <Text color="gray.700" lineHeight="taller">{item}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
                {detailedContent.risks && (
                  <Box {...cardProps} borderTop={`4px solid ${brand.primary}`} gridColumn={{ base: "auto", lg: "span 2" }}>
                    <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} color={brand.primaryDark} mb={4}>Risks</Heading>
                    <VStack align="start" spacing={3}>
                      {detailedContent.risks.map((item, idx) => (
                        <HStack key={idx} align="start" spacing={2}>
                          <Box w={2} h={2} borderRadius="full" bg={brand.primary} mt={2} />
                          <Text color="gray.700" lineHeight="taller">{item}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
                {detailedContent.results && (
                  <Box {...cardProps} borderTop={`4px solid ${brand.primary}`} gridColumn={{ base: "auto", lg: "span 3" }}>
                    <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} color={brand.primaryDark} mb={4}>Results & Reporting</Heading>
                    <Text color="gray.700" lineHeight="taller">{detailedContent.results}</Text>
                  </Box>
                )}
              </SimpleGrid>
            </Container>
          </Box>
        )}

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
        
        </Box>
        {/* FAQs */}
        {Array.isArray(mergedFaqs) && mergedFaqs.length > 0 && (
          <Box as="section" py={{ base: 16, md: 20 }} bg={brand.bgSoft}>
            <Container maxW="7xl">
              <VStack spacing={8} align="stretch">
                <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={brand.primaryDark} textAlign="center">FAQs</Heading>
                <Accordion allowMultiple>
                  {mergedFaqs.map((f, idx) => (
                    <AccordionItem key={idx} border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                      <h3>
                        <AccordionButton _expanded={{ bg: brand.bgSoft }} px={6} py={4}>
                          <Box as="span" flex="1" textAlign="left" color={brand.primaryDark} fontWeight="semibold">{f.q}</Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h3>
                      <AccordionPanel px={6} pb={4}>
                        <Text color="gray.700">{f.a}</Text>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </VStack>
            </Container>
          </Box>
        )}
        <Box
          data-animate
          id="footer-section"
          opacity={isVisible['footer-section'] ? 1 : 0}
          transform={isVisible['footer-section'] ? 'translateY(0)' : 'translateY(30px)'}
          transition="all 0.8s ease-out"
        >
             <CTA />
          <Footer />
        </Box>

        {/* Sticky CTA Bar */}
        <Box position="fixed" bottom={4} left={0} right={0} zIndex={50} px={{ base: 4, md: 8 }}>
          <Box maxW="7xl" mx="auto" bg="white" borderRadius="xl" shadow="xl" border="1px solid" borderColor="rgba(12,47,77,0.08)" p={{ base: 3, md: 4 }}>
            <Flex align="center" justify="space-between" gap={4} direction={{ base: "column", md: "row" }}>
              <Text color={brand.primaryDark} fontWeight="semibold">Have questions about {service.title}? Talk to our audiologist.</Text>
              <HStack>
                <Button as={Link} to="/doctors" bg={brand.primary} color="white" _hover={{ bg: "#3AC0E7" }}>Book Appointment</Button>
                <Button variant="outline" color={brand.primaryDark} borderColor={brand.primary} as={Link} to="/contact">Contact Us</Button>
              </HStack>
            </Flex>
          </Box>
        </Box>
          
      </Box>
    </>
  );
};

export default ServiceDetail;
