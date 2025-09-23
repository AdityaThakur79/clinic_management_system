import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { servicesData } from "../../../data/servicesData";
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

// Using servicesData from centralized data file

const Services = () => {
  const [showAll, setShowAll] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const displayedServices = showAll ? servicesData : servicesData.slice(0, 6);

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
          {displayedServices.map((service, index) => {
            return (
              <Box
                as={Link}
                key={service.id}
                to={`/service/${service.slug}`}
                _hover={{ textDecoration: "none" }}
                data-animate
                id={`service-card-${index}`}
                opacity={isVisible[`service-card-${index}`] ? 1 : 0}
                transform={isVisible[`service-card-${index}`] ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)'}
                transition={`all 0.6s ease-out`}
                transitionDelay={`${index * 0.1}s`}
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
                    _hover={{ color: "#2BA8D1" }}
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
            as={Link}
            to="/services"
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
