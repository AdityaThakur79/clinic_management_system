import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "@chakra-ui/react";
import CTA from "../Components/CTA";
import PageHeader from "../Components/PageHeader";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

// Using servicesData from centralized data file

const Services = () => {
  

  return (
    <>
    <Navbar/>
     <PageHeader
        title="Our Services"
        description="Comprehensive audiology and speech therapy under one roof with advanced hearing tests, precise digital hearing aid fitting and programming, tinnitus care, and personalised speech therapy for children and adults."
        crumbs={[{ label: "Services" }]}
        bgImage={assets.service_4}
      />
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
          {servicesData.map((service) => {
            return (
              <Box
                as={Link}
                key={service.id}
                to={`/service/${service.slug}`}
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

       
      </Container>
    </Box>
    <CTA/>
    <Footer/>
    </>
  );
};

export default Services;
