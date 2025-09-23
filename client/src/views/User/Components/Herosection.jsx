import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { assets } from '../../../assets/assets';
import { Link } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Button,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';

const headers = [
  {
    title: 'Aartiket Speech & Hearing Care',
    subtitle:
      'Comprehensive hearing tests, hearing aid trials & fitting, speech therapy — in Mumbai',
    image: assets.service_1,
    primaryColor: '#2BA8D1',
    secondaryColor: '#3AC0E7',
    accentColor: '#1E88B8',
    gradientBg:
      'linear-gradient(135deg, rgba(43, 168, 209, 0.9) 0%, rgba(58, 192, 231, 0.8) 100%)',
  },
  {
    title: 'Expert Hearing Aid Solutions',
    subtitle:
      'Professional hearing aid trials, fitting and programming for all ages — in Mumbai',
    image: assets.service_2,
    primaryColor: '#2BA8D1',
    secondaryColor: '#3AC0E7',
    accentColor: '#1E88B8',
    gradientBg:
      'linear-gradient(135deg, rgba(43, 168, 209, 0.9) 0%, rgba(58, 192, 231, 0.8) 100%)',
  },
  {
    title: 'Comprehensive Speech Therapy',
    subtitle:
      'Advanced speech therapy & hearing care for children and adults — across Mumbai',
    image: assets.service_10,
    primaryColor: '#2BA8D1',
    secondaryColor: '#3AC0E7',
    accentColor: '#1E88B8',
    gradientBg:
      'linear-gradient(135deg, rgba(43, 168, 209, 0.9) 0%, rgba(58, 192, 231, 0.8) 100%)',
  },
  {
    title: 'Advanced Hearing Technology',
    subtitle:
      'State‑of‑the‑art hearing technology, ITC devices and discreet solutions — in Mumbai',
    image: assets.image4,
    primaryColor: '#2BA8D1',
    secondaryColor: '#3AC0E7',
    accentColor: '#1E88B8',
    gradientBg:
      'linear-gradient(135deg, rgba(43, 168, 209, 0.9) 0%, rgba(58, 192, 231, 0.8) 100%)',
  },
];

const HeroSection = () => {
  const overlayBg = useColorModeValue(
    'rgba(0, 0, 0, 0.5)',
    'rgba(0, 0, 0, 0.2)',
  );

  return (
    <Box as="section" pt={0} position="relative">
      {/* Floating Elements Background - removed per design request */}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .slide-content {
            animation: slideInUp 0.8s ease-out;
          }
          .cta-section {
            animation: fadeInScale 1s ease-out 0.3s both;
          }
        `}
      </style>

      <Splide
        options={{
          type: 'loop',
          perPage: 1,
          autoplay: true,
          interval: 7000,
          arrows: false,
          pagination: true,
          pauseOnHover: false,
          resetProgress: false,
          speed: 1000,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {headers.map((item, index) => (
          <SplideSlide key={index}>
            <Box
              position="relative"
              h={{ base: '85vh', sm: '90vh', md: '85vh' }}
              minH={{ base: '450px', sm: '550px', md: '650px' }}
              overflow="hidden"
            >
              {/* Background Image */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                zIndex={1}
              >
                <Image
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  src={item.image}
                  alt={item.title}
                  transform="scale(1.05)"
                  transition="transform 8s ease-out"
                  _hover={{ transform: 'scale(1.08)' }}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  background={item.gradientBg}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg={overlayBg}
                />
              </Box>

              {/* Content */}
              <Flex
                position="relative"
                zIndex={10}
                h="100%"
                direction="column"
                align="center"
                justify="center"
                textAlign="center"
                px={{ base: 3, sm: 6, md: 8 }}
                className="slide-content"
              >
                <VStack
                  spacing={{ base: 6, sm: 8, md: 12 }}
                  maxW="6xl"
                  mx="auto"
                >
                  {/* Badge */}
                  <Flex justify="center" w="100%">
                    <Badge
                      bg="rgba(255, 255, 255, 0.15)"
                      color="white"
                      px={{ base: 5, md: 7 }}
                      py={{ base: 2, md: 3 }}
                      borderRadius="full"
                      fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                      fontWeight="semibold"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      backdropFilter="blur(12px)"
                      textTransform="none"
                      display="inline-flex" // <— shrink to text width
                      alignItems="center"
                      justifyContent="center"
                      textAlign="center"
                      mx="auto" // <— center horizontally
                    >
                       Trusted Hearing & Speech Care Center
                    </Badge>
                  </Flex>

                  {/* Heading */}
                  <Heading
                    as="h1"
                    fontSize={{
                      base: '2xl',
                      sm: '3xl',
                      md: '5xl',
                      lg: '6xl',
                      xl: '7xl',
                    }}
                    fontWeight="800"
                    lineHeight="1.2"
                    letterSpacing="-0.02em"
                    textShadow="2px 2px 4px rgba(0,0,0,0.3)"
                  >
                    <Text as="span" color="white" display="block">
                      {item.title.split(' ')[0]}{' '}
                      <Text
                        as="span"
                        color={item.primaryColor}
                        textShadow={`0 0 30px ${item.primaryColor}40`}
                        position="relative"
                        _before={{
                          content: '""',
                          position: 'absolute',
                          bottom: '-6px',
                          left: '0',
                          right: '0',
                          height: '3px',
                          bg: item.primaryColor,
                          borderRadius: '2px',
                          transform: 'scaleX(0)',
                          animation: 'scaleIn 1.5s ease-out 1s both',
                        }}
                      >
                        {item.title.split(' ').slice(1).join(' ')}
                      </Text>
                    </Text>
                  </Heading>

                  {/* Subtitle */}
                  <Text
                    fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}
                    color="gray.50"
                    maxW={{ base: '90%', md: '4xl' }}
                    lineHeight="1.6"
                    fontWeight="500"
                    textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                    px={{ base: 2, md: 4 }}
                  >
                    {item.subtitle}
                  </Text>

                  {/* CTA & Proof */}
                  <VStack spacing={{ base: 6, md: 8 }} className="cta-section">
                    {/* Social Proof */}
                    <Flex
                      direction="column"
                      gap={{ base: 3, md: 6 }}
                      align="center"
                      justify="center"
                      bg="rgba(255, 255, 255, 0.1)"
                      backdropFilter="blur(15px)"
                      borderRadius="2xl"
                      px={{ base: 4, md: 8 }}
                      py={{ base: 4, md: 6 }}
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      textAlign="center"
                    >
                      <Image
                        w={{ base: '4.5rem', md: '7rem' }}
                        src={assets.group_profiles}
                        alt="Trusted by patients"
                        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                        mb={{ base: 2, sm: 0 }}
                      />
                      <VStack align="center" spacing={1}>
                        <Text
                          color="white"
                          fontSize={{ base: 'md', md: 'xl' }}
                          fontWeight="bold"
                        >
                          Personalized care in Ghatkopar
                        </Text>
                        <Text
                          color="gray.200"
                          fontSize={{ base: 'sm', md: 'lg' }}
                        >
                          with our expert audiologists
                        </Text>
                      </VStack>
                    </Flex>

                    {/* CTA Button */}
                    <Button
                      as={Link}
                      to="/doctors"
                      size={{ base: 'md', md: 'lg' }}
                      bg={`linear-gradient(135deg, ${item.primaryColor} 0%, ${item.secondaryColor} 100%)`}
                      color="white"
                      px={{ base: 6, md: 12 }}
                      py={{ base: 4, md: 8 }}
                      fontSize={{ base: 'md', md: 'xl' }}
                      fontWeight="bold"
                      borderRadius="2xl"
                      border={`2px solid ${item.primaryColor}`}
                      shadow="0 10px 30px rgba(43, 168, 209, 0.4)"
                    >
                      Book Consultation Now
                    </Button>

                    {/* Trust Indicators */}
                    <Flex
                      wrap="wrap"
                      gap={{ base: 2, md: 4 }}
                      justify="center"
                      color="gray.100"
                      fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                    >
                      {[
                        'Ghatkopar Location',
                        '15+ Years Experience',
                        'Free Consultation',
                      ].map((label, i) => (
                        <HStack
                          key={i}
                          spacing={2}
                          bg="rgba(255, 255, 255, 0.1)"
                          px={{ base: 3, md: 4 }}
                          py={{ base: 1, md: 2 }}
                          borderRadius="full"
                        >
                          <Box
                            w={2}
                            h={2}
                            borderRadius="full"
                            bg={item.primaryColor}
                            boxShadow={`0 0 10px ${item.primaryColor}`}
                          />
                          <Text fontWeight="semibold">{label}</Text>
                        </HStack>
                      ))}
                    </Flex>
                  </VStack>
                </VStack>
              </Flex>
            </Box>
          </SplideSlide>
        ))}
      </Splide>

      <style>
        {`
          @keyframes scaleIn {
            to { transform: scaleX(1); }
          }
        `}
      </style>
    </Box>
  );
};

export default HeroSection;
