import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Container, Text, Heading, VStack, Flex, SimpleGrid, Image, Button, HStack, Badge } from "@chakra-ui/react";
import { hearingAidBrands } from "../../../data/hearingAidBrands";

const HearingAidDevices = () => {
  const [isVisible, setIsVisible] = React.useState({});

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

  // Get all devices from all brands
  const allDevices = hearingAidBrands.flatMap(brand => 
    brand.devices.map(device => ({
      ...device,
      brandName: brand.brandName,
      brandSlug: brand.brandSlug
    }))
  );

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
            id="devices-title"
            opacity={isVisible['devices-title'] ? 1 : 0}
            transform={isVisible['devices-title'] ? 'translateY(0)' : 'translateY(-30px)'}
            transition="all 0.8s ease-out"
          >
            Featured Hearing Aid Devices
          </Heading>
          <Text
            fontSize="lg"
            color="gray.600"
            textAlign="center"
            maxW="3xl"
            mx="auto"
          >
            Discover our top-rated hearing aid devices from leading manufacturers, each offering unique features and technologies.
          </Text>
          
          {/* Devices Grid */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={8}
            w="100%"
          >
            {allDevices.slice(0, 6).map((device, index) => (
              <Box
                key={`${device.brandSlug}-${device.id}`}
                {...cardProps}
                borderTop={`4px solid ${brandColors.primary}`}
                data-animate
                id={`device-${index}`}
                opacity={isVisible[`device-${index}`] ? 1 : 0}
                transform={isVisible[`device-${index}`] ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)'}
                transition={`all 0.6s ease-out`}
                transitionDelay={`${index * 0.1}s`}
                _hover={{ 
                  shadow: "2xl", 
                  transform: "translateY(-8px) scale(1.02)" 
                }}
              >
                <VStack spacing={6} align="stretch">
                  <Image
                    src={device.image}
                    alt={device.name}
                    w="100%"
                    h="200px"
                    objectFit="cover"
                    borderRadius="lg"
                  />
                  
                  <VStack spacing={4} align="start">
                    <VStack spacing={2} align="start" w="100%">
                      <Heading
                        as="h3"
                        fontSize="lg"
                        fontWeight="bold"
                        color={brandColors.primaryDark}
                      >
                        {device.name}
                      </Heading>
                      <HStack spacing={2}>
                        <Badge colorScheme="blue" variant="subtle" size="sm">
                          {device.category}
                        </Badge>
                        <Badge colorScheme="green" variant="subtle" size="sm">
                          {device.priceRange}
                        </Badge>
                        <Badge colorScheme="purple" variant="subtle" size="sm">
                          {device.brandName}
                        </Badge>
                      </HStack>
                    </VStack>
                    
                    <Text color="gray.700" lineHeight="tall" fontSize="sm">
                      {device.description}
                    </Text>
                    
                    <VStack spacing={3} align="start" w="100%">
                      <Text fontSize="sm" fontWeight="semibold" color={brandColors.primaryDark}>
                        Key Features:
                      </Text>
                      <SimpleGrid columns={1} spacing={2} w="100%">
                        {device.features.slice(0, 3).map((feature, idx) => (
                          <HStack key={idx} align="start" spacing={2}>
                            <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                            <Text fontSize="xs" color="gray.600">{feature}</Text>
                          </HStack>
                        ))}
                      </SimpleGrid>
                    </VStack>
                    
                    <Button
                      as={Link}
                      to={`/hearing-aids/${device.brandSlug}/${device.slug}`}
                      bg={brandColors.primary}
                      color="white"
                      _hover={{ bg: "#3AC0E7" }}
                      size="sm"
                      w="100%"
                    >
                      View Details & Usage Guide
                    </Button>
                  </VStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
          
          {/* View All Devices Button */}
          <Box textAlign="center">
            <Button
              as={Link}
              to="/services"
              bg={brandColors.primaryDark}
              color="white"
              _hover={{ bg: "#1A4A6B" }}
              size="lg"
              px={8}
            >
              View All Hearing Aid Services
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HearingAidDevices;
