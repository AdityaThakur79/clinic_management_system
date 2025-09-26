import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Container, Text, Heading, VStack, Flex, SimpleGrid, Image, Button, HStack, Badge, useColorModeValue } from "@chakra-ui/react";
import { hearingAidBrands } from "../../../data/hearingAidBrands";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

const HearingAidBrands = () => {
  const [isVisible, setIsVisible] = React.useState({});

  const brandColors = {
    primary: "#3AC0E7", // Your brand color
    primaryDark: "#2BA8D1", // Your brand dark color
    bgSoft: "#F7FBFD" // Light blue background
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
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');


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
    <Box as="section" py={{ base: 16, md: 20 }} bg={brandColors.primary}>
      <Container maxW="7xl">
        <VStack spacing={16}>
        <VStack spacing={6} textAlign="center" >
          <Badge 
            colorScheme="brand" 
            px={4} 
            py={2} 
            rounded="full" 
            fontSize="sm" 
            fontWeight="bold"
            bg="white"
            color={brandColors.primary}
          >
            Trusted Brands
          </Badge>
          <Text 
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} 
            fontWeight="bold" 
            color="#ffffff"
            maxW="4xl"
            lineHeight="1.2"
          >
            Top Hearing Aid Brands Available
          </Text>
          
        </VStack>
          
          {/* Brands Carousel */}
              <Box w="100%" px={{ base: 8, md: 16, lg: 24 }}>
            <Splide
              options={{
                type: 'loop',
                perPage: 3,
                perMove: 1,
                gap: '2rem',
                arrows: true,
                pagination: false,
                padding: { left: '3rem', right: '3rem' },
                breakpoints: {
                  1200: {
                    perPage: 2,
                    padding: { left: '2.5rem', right: '2.5rem' },
                  },
                  768: {
                    perPage: 1,
                    padding: { left: '2rem', right: '2rem' },
                  },
                  480: {
                    perPage: 1,
                    padding: { left: '1.5rem', right: '1.5rem' },
                  },
                },
              }}
              style={{
                '--splide-arrow-color': brandColors.primary,
                '--splide-arrow-bg': 'white',
                '--splide-arrow-border': `2px solid ${brandColors.primary}`,
                '--splide-arrow-size': '2.5rem',
                '--splide-arrow-height': '2.5rem',
              }}
            >
              {hearingAidBrands.map((brandItem, index) => (
                <SplideSlide key={brandItem.id}>
                  <Box
                    {...cardProps}
                    borderTop={`4px solid ${brandColors.primary}`}
                    data-animate
                    id={`brand-${index}`}
                    opacity={isVisible[`brand-${index}`] ? 1 : 0}
                    transform={isVisible[`brand-${index}`] ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)'}
                    transition={`all 0.6s ease-out`}
                    transitionDelay={`${index * 0.1}s`}
                    _hover={{ 
                      shadow: "2xl", 
                      transform: "translateY(-8px) scale(1.02)" 
                    }}
                    h="400px"
                    display="flex"
                    flexDirection="column"
                    mx={2}
                  >
                    <VStack spacing={6} align="center" h="100%" justify="space-between">
                      <VStack spacing={4} align="center">
                        <Image
                          src={brandItem.logo}
                          alt={brandItem.brandName}
                          w="100px"
                          h="100px"
                          objectFit="contain"
                          borderRadius="lg"
                          filter="contrast(1.1) brightness(1.05)"
                          transition="all 0.3s ease"
                          _hover={{
                            transform: "scale(1.05)",
                            filter: "contrast(1.2) brightness(1.1)"
                          }}
                        />
                        <VStack spacing={3} align="center">
                          <Heading
                            as="h3"
                            fontSize="xl"
                            fontWeight="bold"
                            color={brandColors.primaryDark}
                            textAlign="center"
                          >
                            {brandItem.brandName}
                          </Heading>
                          <Text
                            color="gray.600"
                            textAlign="center"
                            fontSize="sm"
                            lineHeight="tall"
                            noOfLines={3}
                          >
                            {brandItem.description}
                          </Text>
                          <HStack spacing={2} fontSize="xs" color="gray.500">
                            <Text>Founded: {brandItem.founded}</Text>
                            <Text>•</Text>
                            <Text>{brandItem.headquarters}</Text>
                          </HStack>
                        </VStack>
                      </VStack>
                      
                      {/* Key Benefits */}
                      <VStack spacing={3} w="100%" align="stretch">
                       
                        <VStack spacing={2} align="start">
                          {brandItem.benefits?.slice(0, 3).map((benefit, idx) => (
                            <HStack key={idx} align="start" spacing={2}>
                              <Box w={2} h={2} borderRadius="full" bg={brandColors.primary} mt={2} />
                              <Text fontSize="xs" color="gray.600" lineHeight="short">
                                {benefit}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </VStack>
                      
                      <Button
                        as={Link}
                        to={`/hearing-aids/${brandItem.brandSlug}`}
                        bg={brandColors.primary}
                        color="white"
                        _hover={{ bg: brandColors.primaryDark }}
                        size="md"
                        w="100%"
                        mt="auto"
                      >
                        Explore {brandItem.brandName} Devices
                      </Button>
                    </VStack>
                  </Box>
                </SplideSlide>
              ))}
            </Splide>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HearingAidBrands;
 