import React, { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../../../assets/assets";
import { serviceSlugs, generateSlug } from "../../../utils/slugGenerator";
import {
  Box,
  Grid,
  Text,
  Heading,
  Image,
  Button,
  VStack,
  Container,
} from "@chakra-ui/react";

const servicesData = [
  {
    id: 7,
    title: "Speech Therapy for All Ages",
    description:
      "Personalized speech therapy services for children, adults, and senior citizens facing speech or language difficulties.",
    image: assets.service_4,
  },
  {
    id: 8,
    title: "Pediatric Hearing Care",
    description:
      "Kid-friendly hearing tests and treatment tailored for infants and children in a comfortable environment.",
    image: assets.service_6,
  },
  {
    id: 9,
    title: "Tinnitus Management",
    description:
      "Evaluation and therapeutic solutions for managing ringing in the ears (tinnitus).",
    image: assets.service_1,
  },
  {
    id: 10,
    title: "Senior Citizen Hearing Test Center",
    description:
      "Specialized hearing tests and solutions for elderly patients in a senior-friendly environment.",
    image: assets.service_12,
  },
  {
    id: 11,
    title: "TV Smartphone or Bluetooth Solutions",
    description:
      "Solutions and accessories to improve TV and smartphone listening experiences using your hearing aids with Bluetooth connectivity.",
    image: assets.service_15,
  },
  {
    id: 12,
    title: "Hearing Aids & Accessories in Kalyan",
    description:
      "Full range of hearing aids, batteries, and accessories available at our Kalyan clinic.",
    image: assets.service_11,
  },
  {
    id: 13,
    title: "PHONAK, UNITRON & AUDIO Service",
    description:
      "Authorized services and fitting of Phonak, Unitron & Audio hearing aids with expert consultation and support.",
    image: assets.service_9,
  },
  {
    id: 14,
    title: "Expert Hearing Consultation",
    description:
      "One-on-one sessions with hearing specialists to discuss concerns and find optimal hearing solutions.",
    image: assets.audiologist2,
  },
  {
    id: 15,
    title: "Custom Ear Molds & Ear Plugs",
    description:
      "High-quality custom ear molds and plugs for hearing aids, swimmers, musicians, and noise protection tailored to your ear shape.",
    image: assets.ear_moulds,
  },
  {
    id: 1,
    title: "Hearing Tests (Audiometry - PTA)",
    description:
      "Comprehensive hearing assessments using audiometry (PTA) to accurately diagnose hearing conditions in all age groups.",
    image: assets.audiologist_test,
  },
  {
    id: 2,
    title: "Hearing Aid Fitting & Programming",
    description:
      "Expert fitting, tuning, and programming of hearing aids based on your specific hearing profile and lifestyle.",
    image: assets.fitting,
  },
  {
    id: 3,
    title: "Affordable Hearing Aids",
    description:
      "High-quality hearing aids available at affordable prices, including options from leading brands like Siemens.",
    image: assets.service_7,
  },
  {
    id: 4,
    title: "Rechargeable Hearing Aids",
    description:
      "Modern rechargeable hearing aids that offer convenience and long battery life for everyday use.",
    image: assets.rechargeable_machine,
  },
  {
    id: 5,
    title: "Hearing Aid Batteries",
    description:
      "Reliable and long-lasting hearing aid batteries suitable for all major hearing aid models.",
    image: assets.battery2,
  },
  {
    id: 6,
    title: "Hearing Aid Repair & Maintenance",
    description:
      "Professional repair, cleaning, and maintenance for all types and brands of hearing instruments.",
    image: assets.service_15,
  },
];

const Services = () => {
  const [showAll, setShowAll] = useState(false);
  const displayedServices = showAll ? servicesData : servicesData.slice(0, 6);

  return (
    <Box as="section" px={{ base: 2, md: 10, lg: 20 }} py={{ base: 10, md: 20 }}>
      <Container maxW="8xl">
        {/* Header */}
        <VStack spacing={3} textAlign="center">
          <Text fontSize="sm" color="#2BA8D1" fontWeight="semibold">
            SERVICES
          </Text>
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="#0C2F4D"
            maxW="4xl"
          >
            What Patients Get at Best Speech & Hearing
          </Heading>
          <Text color="gray.600" maxW="xl" pt={2}>
            Expert diagnostics, precise hearing aid fitting and compassionate
            speech therapy tailored to every age group.
          </Text>
        </VStack>

        {/* Service Grid */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
          gap={8}
          mt={10}
        >
          {displayedServices.map((service) => {
            const slug = serviceSlugs[service.title] || generateSlug(service.title);
            return (
              <Box
                as={Link}
                key={service.id}
                to={`/service/${slug}`}
                _hover={{ textDecoration: "none" }}
              >
                <Box overflow="hidden" borderRadius="lg"  >
                  <figure className="hover:shine">
                  <Image  
                    src={service.image}
                    alt={service.title}
                    w="100%"
                    h="220px"
                    objectFit="cover"
                    borderTopRadius="lg"
                    
                  />
                  </figure>
                </Box>
                <Box mt={4}>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontWeight="semibold"
                    color="#0C2F4D"
                    _hover={{ color: "#F26423" }}
                    transition="color 0.2s"
                  >
                    {service.title}
                  </Heading>
                  <Text mt={2} color="gray.600">
                    {service.description}
                  </Text>
                  <Text mt={3} color="#2BA8D1" fontWeight="medium" fontSize="sm">
                    Learn More →
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Grid>

        {/* View More Button */}
        {!showAll && servicesData.length > 6 && (
          <Box textAlign="center" mt={10}>
            <Button
              onClick={() => setShowAll(true)}
              px={8}
              py={3}
              rounded="lg"
              bg="#2BA8D1"
              color="white"
              fontWeight="semibold"
              transition="all 0.3s ease"
              _hover={{ 
                bg: "#3AC0E7", 
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
              }}
              shadow="md"
            >
              View More
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Services;
