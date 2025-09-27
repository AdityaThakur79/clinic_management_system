import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../../assets/assets";
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
  HStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { TimeIcon, StarIcon } from "@chakra-ui/icons";
import CTA from "../Components/CTA";
import PageHeader from "../Components/PageHeader";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

// Using servicesData from centralized data file

const BookAppointment = () => {
  const navigate = useNavigate();

  const handleBookAppointment = (service) => {
    navigate(`/book-service/${service.slug}`);
  };

  return (
    <>
    <Navbar/>
     <PageHeader
        title="Book An Appointment"
        description="Book an appointment with our experts for comprehensive audiology and speech therapy."
        crumbs={[{ label: "Services" }]}
        bgImage={assets.service_4}
      />
    <Box as="section" px={{ base: 2, md: 10, lg: 20 }} py={{ base: 10, md: 20 }}>
      <Container maxW="8xl">
        {/* Header */}
        <VStack spacing={3} textAlign="center">
          <Text fontSize="sm" color="#2BA8D1" fontWeight="semibold">
            BOOK AN APPOINTMENT
          </Text>
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="#0C2F4D"
            maxW="4xl"
          >
            Book An Appointment
          </Heading>
          <Text color="gray.600" maxW="xl" pt={2}>
            Book an appointment with our experts for comprehensive audiology and speech therapy.
          </Text>
        </VStack>

        {/* Service Grid */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
          gap={8}
          mt={10}
        >
          {servicesData.map((service) => {
            return (
              <Box
                key={service.id}
                bg="white"
                borderRadius="lg"
                boxShadow="md"
                overflow="hidden"
                _hover={{
                  boxShadow: "xl",
                  transform: "translateY(-5px)",
                  transition: "all 0.3s ease"
                }}
              >
                <Box overflow="hidden" borderRadius="lg">
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

                <Box p={6}>
                  <VStack spacing={3} align="stretch">
                    {/* Service Header */}
                    <Box>
                      <HStack justify="space-between" align="start" mb={2}>
                        <Heading
                          as="h3"
                          fontSize="xl"
                          fontWeight="semibold"
                          color="#0C2F4D"
                          lineHeight="1.2"
                        >
                          {service.title}
                        </Heading>
                        <Badge colorScheme="blue" variant="outline" fontSize="xs">
                          {service.category}
                        </Badge>
                      </HStack>

                      <Text color="gray.600" fontSize="sm" lineHeight="1.5">
                        {service.description}
                      </Text>
                    </Box>

                    {/* Service Details */}
                    <HStack spacing={4} fontSize="sm" color="gray.600">
                      <HStack spacing={1}>
                        <Icon as={TimeIcon} boxSize={3} />
                        <Text>{service.duration || 30} min</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={StarIcon} boxSize={3} />
                        <Text>₹{service.detailedContent?.cost || service.price || 'TBD'}</Text>
                      </HStack>
                    </HStack>

                    {/* Action Buttons */}
                    <HStack spacing={3} mt={2}>
                      <Button
                        colorScheme="brand"
                        size="sm"
                        flex={1}
                        onClick={() => handleBookAppointment(service)}
                        _hover={{
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(43, 168, 209, 0.3)"
                        }}
                      >
                        Book Appointment
                      </Button>
                      <Button
                        as={Link}
                        to={`/service/${service.slug}`}
                        variant="outline"
                        colorScheme="brand"
                        size="sm"
                        flex={1}
                        _hover={{
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(43, 168, 209, 0.2)"
                        }}
                      >
                        Learn More
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </Box>
            );
          })}
        </Grid>

       
      </Container>
    </Box>
    <CTA/>
    <Footer/>
    </>
  );
};

export default BookAppointment;
