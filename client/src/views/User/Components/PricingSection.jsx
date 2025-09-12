import React from "react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { assets } from "../../../assets/assets";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Link,
} from "@chakra-ui/react";

const PricingSection = () => {
  return (
    <Box
      as="section"
      py={{ base: 12, md: 16 }}
      bgGradient="linear(to-br, rgba(43, 168, 209, 0.05), rgba(58, 192, 231, 0.1))"
      position="relative"
      overflow="hidden"
    >
      {/* Background Circles */}
  

      {/* Content */}
      <Box maxW="6xl" mx="auto" px={4} position="relative" zIndex={10}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          gap={12}
        >
          {/* Left Content */}
          <Box w={{ base: "100%", lg: "50%" }} textAlign={{ base: "center", lg: "left" }}>
            <Heading
              as="h2"
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              fontWeight="bold"
              color="#0C2F4D"
              mb={6}
              lineHeight="short"
            >
              Quality Hearing Devices
              <br />
              Starting From{" "}
              <Flex
                as="span"
                color="#2BA8D1"
                align="center"
                justify={{ base: "center", lg: "flex-start" }}
                gap={2}
                mt={2}
              >
                <FaIndianRupeeSign size="28" />
                <Text as="span" fontSize="5xl" fontWeight="bold">
                  10,000
                </Text>
              </Flex>
            </Heading>

            <Text
              fontSize="lg"
              color="gray.600"
              mb={8}
              maxW="lg"
              mx={{ base: "auto", lg: "0" }}
            >
              Get professional hearing solutions with free fitting, programming,
              and ongoing support.
            </Text>

            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={4}
              justify={{ base: "center", lg: "flex-start" }}
            >
              <Button
                as={Link}
                href="/clinics"
                bg="#2BA8D1"
                color="white"
                px={8}
                py={3}
                rounded="lg"
                fontWeight="semibold"
                transition="all 0.3s ease"
                _hover={{ 
                  bg: "#3AC0E7", 
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}
              >
                Get Free Consultation
              </Button>

              <Button
                as={Link}
                href="/services"
                variant="outline"
                border="2px"
                borderColor="#2BA8D1"
                color="#2BA8D1"
                px={8}
                py={3}
                rounded="lg"
                fontWeight="semibold"
                transition="all 0.3s ease"
                _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}
              >
                View All Services
              </Button>
            </Flex>
          </Box>

          {/* Right Image */}
          <Box w={{ base: "100%", lg: "50%" }}>
            <Box position="relative">
              <Image
                src={assets.audiologist2}
                alt="Hearing Devices Starting from ₹10,000"
                w="100%"
                h={{ base: "80", lg: "96" }}
                objectFit="cover"
                rounded="2xl"
                shadow="2xl"
              />
              {/* Overlay */}
              <Box
                position="absolute"
                bottom={4}
                right={4}
                bg="whiteAlpha.900"
                backdropFilter="blur(6px)"
                rounded="lg"
                p={4}
                shadow="lg"
                border="1px solid rgba(43, 168, 209, 0.2)"
              >
                <Flex align="center" gap={2}>
                  <FaIndianRupeeSign size="20" color="#2BA8D1" />
                  <Text fontSize="2xl" fontWeight="bold" color="#0C2F4D">
                    10,000
                  </Text>
                </Flex>
                <Text fontSize="sm" color="gray.600">
                  Starting Price
                </Text>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default PricingSection;
