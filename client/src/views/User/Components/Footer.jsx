import React from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  Link,
  VStack,
  HStack,
  Divider,
  Button,
  Icon,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { assets } from "../../../assets/assets";
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaWhatsapp,
  FaArrowRight,
  FaHome,
  FaUser,
  FaCogs,
  FaHospital,
  FaAddressBook
} from "react-icons/fa";
import { PhoneIcon } from "@chakra-ui/icons";

const Footer = () => {
  const getWhatsAppLink = () => {
    const phoneNumber = "917977483031";
    const message = encodeURIComponent("Hi Aartiket Speech & Hearing Care!");
    const isMobile =
      /iPhone|Android|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      );
    return isMobile
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
  };

  return (
    <>
      {/* Main Footer */}
      <Box
        as="footer"
        bgGradient="linear(to-br, rgba(43, 168, 209, 0.05), rgba(58, 192, 231, 0.1), rgba(12, 47, 77, 0.05))"
        color="gray.800"
        pos="relative"
        overflow="hidden"
        w="full"
      >
        {/* Background Pattern */}
        <Box
          pos="absolute"
          inset={0}
          opacity={0.1}
          bgImage={`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232BA8D1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}
        />

        {/* Top Border */}
        <Box h="1" bgGradient="linear(to-r, #2BA8D1, #3AC0E7, #0C2F4D)" />

        <Box pos="relative" zIndex={10} w="full">
          {/* Main Footer Content */}
          <Flex
            direction={{ base: "column", lg: "row" }}
            wrap="wrap"
            gap={12}
            py={16}
            px={{ base: 6, lg: 16, xl: 24 }}
          >
            {/* Company Info */}
            <Box flex="2">
              <Flex align="center" mb={4}>
                <Image
                  w="160px"
                  h="160px"
                  objectFit="contain"
                  src={assets.aartiket_logo}
                  alt="Aartiket Speech & Hearing Care Logo"
                />
                <Box ml={4}>
                  <Text fontSize="2xl" fontWeight="bold" color="#0C2F4D">
                    Aartiket Speech & Hearing Care
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" color="#2BA8D1">
                    Hearing Tests, Hearing Aid Trial and Fitting, Speech Therapy, and more.
                  </Text>
                </Box>
              </Flex>
              <Text color="gray.600" maxW="lg" mb={6} lineHeight="tall">
                Aartiket Speech & Hearing Care is committed to delivering expert hearing
                and speech solutions with compassion and advanced technology. We help
                you rediscover the joy of clear hearing and communication with personalized care
                and state-of-the-art equipment in Ghatkopar and surrounding areas.
              </Text>
            </Box>

            {/* Quick Links */}
            <Box>
              <Text
                fontSize="xl"
                fontWeight="semibold"
                mb={6}
                color="#0C2F4D"
                borderBottom="1px"
                borderColor="#2BA8D1"
                pb={2}
              >
                Quick Links
              </Text>
              <VStack align="start" spacing={3}>
                {[
                  { name: "Home", to: "/", icon: FaHome },
                  { name: "About Us", to: "/about", icon: FaUser },
                  { name: "Our Services", to: "/services", icon: FaCogs },
                  { name: "Book Appointment", to: "/doctors", icon: FaHospital },
                  { name: "Contact Us", to: "/contact", icon: FaAddressBook },
                ].map((link) => (
                  <NavLink key={link.to} to={link.to}>
                    <HStack
                      spacing={3}
                      color="gray.600"
                      transition="all 0.3s ease"
                      p={2}
                      rounded="md"
                      _hover={{ 
                        color: "#0C2F4D",
                        bg: "rgba(43, 168, 209, 0.1)"
                      }}
                    >
                      <Icon as={link.icon} color="#2BA8D1" />
                      <Text fontWeight="medium">{link.name}</Text>
                    </HStack>
                  </NavLink>
                ))}
              </VStack>
            </Box>


            {/* Contact Info */}
            <Box>
              <Text
                fontSize="xl"
                fontWeight="semibold"
                mb={6}
                color="#0C2F4D"
                borderBottom="1px"
                borderColor="#2BA8D1"
                pb={2}
              >
                Get In Touch
              </Text>
              <VStack align="start" spacing={6}>
                {/* Phones */}
                <HStack align="start" spacing={4}>
                  <Box 
                    bg="linear-gradient(135deg, #2BA8D1, #3AC0E7)" 
                    p={3} 
                    rounded="xl" 
                    shadow="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={PhoneIcon} color="white" fontSize="lg" />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                      Phone Numbers
                    </Text>
                    <VStack align="start" spacing={1}>
                      <Link 
                        href="tel:7977483031" 
                        color="#0C2F4D" 
                        fontWeight="semibold" 
                        fontSize="md"
                        _hover={{ color: "#2BA8D1" }}
                        transition="color 0.3s ease"
                      >
                        7977483031
                      </Link>
                      
                    </VStack>
                  </Box>
                </HStack>

                {/* Email */}
                <HStack align="start" spacing={4}>
                  <Box 
                    bg="linear-gradient(135deg, #2BA8D1, #3AC0E7)" 
                    p={3} 
                    rounded="xl" 
                    shadow="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FaEnvelope} color="white" fontSize="lg" />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                      Email
                    </Text>
                    <Link
                      href="mailto:aartiketspeechandhearing@gmail.com"
                      color="#0C2F4D"
                      fontWeight="semibold"
                      fontSize="md"
                      wordBreak="break-all"
                      _hover={{ color: "#2BA8D1" }}
                      transition="color 0.3s ease"
                    >
                    aartiketspeechandhearing@gmail.com
                    </Link>
                  </Box>
                </HStack>

                {/* Location */}
                <HStack align="start" spacing={4}>
                  <Box 
                    bg="linear-gradient(135deg, #2BA8D1, #3AC0E7)" 
                    p={3} 
                    rounded="xl" 
                    shadow="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FaMapMarkerAlt} color="white" fontSize="lg" />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                      Location
                    </Text>
                    <Link
                      href="https://maps.app.goo.gl/h1ndJAoJP2DnAr7M7"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="#0C2F4D"
                      fontWeight="semibold"
                      fontSize="md"
                      mb={3}
                      _hover={{ color: '#2BA8D1' }}
                    >
                      Ghatkopar, Mumbai 
                    </Link>
                    
                  </Box>
                </HStack>
              </VStack>
            </Box>
          </Flex>

          {/* Bottom Footer */}
          <Box
            borderTop="1px"
            borderColor="#2BA8D1"
            py={8}
            px={{ base: 6, lg: 16, xl: 24 }}
            bg="whiteAlpha.700"
          >
            <Flex
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              align="center"
              gap={6}
            >
              <Box textAlign={{ base: "center", lg: "left" }}>
                <Text color="gray.600" fontSize="sm" mb={2}>
                  © 2025 Aartiket Speech & Hearing Care. All Rights Reserved.
                </Text>
                <Text color="gray.500" fontSize="xs">
                  Providing expert hearing care and speech therapy services
                  in Ghatkopar and surrounding areas
                </Text>
              </Box>
              <Flex direction={{ base: "column", sm: "row" }} align="center" gap={2}>
                <Text fontSize="sm" color="gray.600">
                  Designed and developed by
                </Text>
                <Link
                  href="https://servora.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="#0C2F4D"
                  fontWeight="semibold"
                  _hover={{ color: "#2BA8D1" }}
                >
                  Servora
                </Link>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* Floating Action Buttons */}
      <Flex
        direction="column"
        gap={{ base: 3, md: 4 }}
        pos="fixed"
        bottom={{ base: 4, md: 6 }}
        right={{ base: 4, md: 6 }}
        zIndex={50}
      >
        {/* Phone Button with Wave Effect */}
        <Box position="relative" w={{ base: '48px', md: '56px' }} h={{ base: '48px', md: '56px' }}>
          {/* Wave Animation */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="100%"
            h="100%"
            rounded="full"
            bg="rgba(43, 168, 209, 0.3)"
            animation="wave 2s infinite ease-out"
            _before={{
              content: '""',
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              w: "100%",
              h: "100%",
              rounded: "full",
              bg: "rgba(43, 168, 209, 0.2)",
              animation: "wave 2s infinite ease-out 0.5s"
            }}
            _after={{
              content: '""',
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              w: "100%",
              h: "100%",
              rounded: "full",
              bg: "rgba(43, 168, 209, 0.1)",
              animation: "wave 2s infinite ease-out 1s"
            }}
          />
          <Link
            href="tel:+918087766556"
            bg="linear-gradient(135deg, #2BA8D1, #3AC0E7)"
            color="white"
            w="100%"
            h="100%"
            rounded="full"
            shadow="xl"
            transition="all 0.3s ease"
            _hover={{ 
              shadow: "2xl", 
              transform: "scale(1.1)",
              bg: "linear-gradient(135deg, #0C2F4D, #2BA8D1)"
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            zIndex={1}
          >
            <Icon as={PhoneIcon} fontSize={{ base: 'md', md: 'lg' }} />
          </Link>
        </Box>

        {/* WhatsApp Button with Wave Effect */}
        <Box position="relative" w={{ base: '48px', md: '56px' }} h={{ base: '48px', md: '56px' }}>
          {/* Wave Animation */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="100%"
            h="100%"
            rounded="full"
            bg="rgba(37, 211, 102, 0.3)"
            animation="wave 2s infinite ease-out 0.3s"
            _before={{
              content: '""',
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              w: "100%",
              h: "100%",
              rounded: "full",
              bg: "rgba(37, 211, 102, 0.2)",
              animation: "wave 2s infinite ease-out 0.8s"
            }}
            _after={{
              content: '""',
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              w: "100%",
              h: "100%",
              rounded: "full",
              bg: "rgba(37, 211, 102, 0.1)",
              animation: "wave 2s infinite ease-out 1.3s"
            }}
          />
          <Link
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            bg="linear-gradient(135deg, #25D366, #128C7E)"
            color="white"
            w="100%"
            h="100%"
            rounded="full"
            shadow="xl"
            transition="all 0.3s ease"
            _hover={{ 
              shadow: "2xl", 
              transform: "scale(1.1)",
              bg: "linear-gradient(135deg, #128C7E, #25D366)"
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            zIndex={1}
          >
            <Icon as={FaWhatsapp} fontSize={{ base: 'md', md: 'lg' }} />
          </Link>
        </Box>
      </Flex>

      {/* CSS Animation for Wave Effect */}
      <style jsx>{`
        @keyframes wave {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default Footer;
