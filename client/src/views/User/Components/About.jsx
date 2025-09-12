import React from 'react';
import { assets } from '../../../assets/assets';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Stack,
  Image,
  Text,
  Heading,
  Button,
  Grid,
  GridItem,
} from '@chakra-ui/react';

const About1 = () => {
  return (
    <Box
      overflow="hidden"
      px={{ base: 4, md: 8, lg: 20 }}
      py={{ base: 10, md: 20 }}
      maxW="7xl"
      mx="auto"
    >
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align="center"
        justify="space-between"
        gap={{ base: 10, lg: 16 }}
      >
        {/* --- Left Images --- */}
        <Box w={{ base: '100%', lg: '50%' }}>
          <Grid
            templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }}
            gap={4}
          >
            <GridItem>
              <Image src={assets.image3} alt="Clinic 1" borderRadius="2xl" w="100%" />
            </GridItem>
            <GridItem>
              <Image src={assets.image1} alt="Clinic 2" borderRadius="2xl" w="100%" />
            </GridItem>
            <GridItem>
              <Image src={assets.image4} alt="Clinic 3" borderRadius="2xl" w="100%" />
            </GridItem>
            <GridItem>
            <svg width={134} height={106} viewBox="0 0 134 106" fill="none" xmlns="http://www.w3.org/2000/svg" > <circle cx="1.66667" cy={104} r="1.66667" transform="rotate(-90 1.66667 104)" fill="#2BA8D1" /> <circle cx="16.3333" cy={104} r="1.66667" transform="rotate(-90 16.3333 104)" fill="#2BA8D1" /> <circle cx={31} cy={104} r="1.66667" transform="rotate(-90 31 104)" fill="#2BA8D1" /> <circle cx="45.6667" cy={104} r="1.66667" transform="rotate(-90 45.6667 104)" fill="#2BA8D1" /> <circle cx="60.3334" cy={104} r="1.66667" transform="rotate(-90 60.3334 104)" fill="#2BA8D1" /> <circle cx="88.6667" cy={104} r="1.66667" transform="rotate(-90 88.6667 104)" fill="#2BA8D1" /> <circle cx="117.667" cy={104} r="1.66667" transform="rotate(-90 117.667 104)" fill="#2BA8D1" /> <circle cx="74.6667" cy={104} r="1.66667" transform="rotate(-90 74.6667 104)" fill="#2BA8D1" /> <circle cx={103} cy={104} r="1.66667" transform="rotate(-90 103 104)" fill="#2BA8D1" /> <circle cx={132} cy={104} r="1.66667" transform="rotate(-90 132 104)" fill="#2BA8D1" /> <circle cx="1.66667" cy="89.3333" r="1.66667" transform="rotate(-90 1.66667 89.3333)" fill="#2BA8D1" /> <circle cx="16.3333" cy="89.3333" r="1.66667" transform="rotate(-90 16.3333 89.3333)" fill="#2BA8D1" /> <circle cx={31} cy="89.3333" r="1.66667" transform="rotate(-90 31 89.3333)" fill="#2BA8D1" /> <circle cx="45.6667" cy="89.3333" r="1.66667" transform="rotate(-90 45.6667 89.3333)" fill="#2BA8D1" /> <circle cx="60.3333" cy="89.3338" r="1.66667" transform="rotate(-90 60.3333 89.3338)" fill="#2BA8D1" /> <circle cx="88.6667" cy="89.3338" r="1.66667" transform="rotate(-90 88.6667 89.3338)" fill="#2BA8D1" /> <circle cx="117.667" cy="89.3338" r="1.66667" transform="rotate(-90 117.667 89.3338)" fill="#2BA8D1" /> <circle cx="74.6667" cy="89.3338" r="1.66667" transform="rotate(-90 74.6667 89.3338)" fill="#2BA8D1" /> <circle cx={103} cy="89.3338" r="1.66667" transform="rotate(-90 103 89.3338)" fill="#2BA8D1" /> <circle cx={132} cy="89.3338" r="1.66667" transform="rotate(-90 132 89.3338)" fill="#2BA8D1" /> <circle cx="1.66667" cy="74.6673" r="1.66667" transform="rotate(-90 1.66667 74.6673)" fill="#2BA8D1" /> <circle cx="1.66667" cy="31.0003" r="1.66667" transform="rotate(-90 1.66667 31.0003)" fill="#2BA8D1" /> <circle cx="16.3333" cy="74.6668" r="1.66667" transform="rotate(-90 16.3333 74.6668)" fill="#2BA8D1" /> <circle cx="16.3333" cy="31.0003" r="1.66667" transform="rotate(-90 16.3333 31.0003)" fill="#2BA8D1" /> <circle cx={31} cy="74.6668" r="1.66667" transform="rotate(-90 31 74.6668)" fill="#2BA8D1" /> <circle cx={31} cy="31.0003" r="1.66667" transform="rotate(-90 31 31.0003)" fill="#2BA8D1" /> <circle cx="45.6667" cy="74.6668" r="1.66667" transform="rotate(-90 45.6667 74.6668)" fill="#2BA8D1" /> <circle cx="45.6667" cy="31.0003" r="1.66667" transform="rotate(-90 45.6667 31.0003)" fill="#2BA8D1" /> <circle cx="60.3333" cy="74.6668" r="1.66667" transform="rotate(-90 60.3333 74.6668)" fill="#2BA8D1" /> <circle cx="60.3333" cy="30.9998" r="1.66667" transform="rotate(-90 60.3333 30.9998)" fill="#2BA8D1" /> <circle cx="88.6667" cy="74.6668" r="1.66667" transform="rotate(-90 88.6667 74.6668)" fill="#2BA8D1" /> <circle cx="88.6667" cy="30.9998" r="1.66667" transform="rotate(-90 88.6667 30.9998)" fill="#2BA8D1" /> <circle cx="117.667" cy="74.6668" r="1.66667" transform="rotate(-90 117.667 74.6668)" fill="#2BA8D1" /> <circle cx="117.667" cy="30.9998" r="1.66667" transform="rotate(-90 117.667 30.9998)" fill="#2BA8D1" /> <circle cx="74.6667" cy="74.6668" r="1.66667" transform="rotate(-90 74.6667 74.6668)" fill="#2BA8D1" /> <circle cx="74.6667" cy="30.9998" r="1.66667" transform="rotate(-90 74.6667 30.9998)" fill="#2BA8D1" /> <circle cx={103} cy="74.6668" r="1.66667" transform="rotate(-90 103 74.6668)" fill="#2BA8D1" /> <circle cx={103} cy="30.9998" r="1.66667" transform="rotate(-90 103 30.9998)" fill="#2BA8D1" /> <circle cx={132} cy="74.6668" r="1.66667" transform="rotate(-90 132 74.6668)" fill="#2BA8D1" /> <circle cx={132} cy="30.9998" r="1.66667" transform="rotate(-90 132 30.9998)" fill="#2BA8D1" /> <circle cx="1.66667" cy="60.0003" r="1.66667" transform="rotate(-90 1.66667 60.0003)" fill="#2BA8D1" /> <circle cx="1.66667" cy="16.3333" r="1.66667" transform="rotate(-90 1.66667 16.3333)" fill="#2BA8D1" /> <circle cx="16.3333" cy="60.0003" r="1.66667" transform="rotate(-90 16.3333 60.0003)" fill="#2BA8D1" /> <circle cx="16.3333" cy="16.3333" r="1.66667" transform="rotate(-90 16.3333 16.3333)" fill="#2BA8D1" /> <circle cx={31} cy="60.0003" r="1.66667" transform="rotate(-90 31 60.0003)" fill="#2BA8D1" /> <circle cx={31} cy="16.3333" r="1.66667" transform="rotate(-90 31 16.3333)" fill="#2BA8D1" /> <circle cx="45.6667" cy="60.0003" r="1.66667" transform="rotate(-90 45.6667 60.0003)" fill="#2BA8D1" /> <circle cx="45.6667" cy="16.3333" r="1.66667" transform="rotate(-90 45.6667 16.3333)" fill="#2BA8D1" /> <circle cx="60.3333" cy="60.0003" r="1.66667" transform="rotate(-90 60.3333 60.0003)" fill="#2BA8D1" /> <circle cx="60.3333" cy="16.3333" r="1.66667" transform="rotate(-90 60.3333 16.3333)" fill="#2BA8D1" /> <circle cx="88.6667" cy="60.0003" r="1.66667" transform="rotate(-90 88.6667 60.0003)" fill="#2BA8D1" /> <circle cx="88.6667" cy="16.3333" r="1.66667" transform="rotate(-90 88.6667 16.3333)" fill="#2BA8D1" /> <circle cx="117.667" cy="60.0003" r="1.66667" transform="rotate(-90 117.667 60.0003)" fill="#2BA8D1" /> <circle cx="117.667" cy="16.3333" r="1.66667" transform="rotate(-90 117.667 16.3333)" fill="#2BA8D1" /> <circle cx="74.6667" cy="60.0003" r="1.66667" transform="rotate(-90 74.6667 60.0003)" fill="#2BA8D1" /> <circle cx="74.6667" cy="16.3333" r="1.66667" transform="rotate(-90 74.6667 16.3333)" fill="#2BA8D1" /> <circle cx={103} cy="60.0003" r="1.66667" transform="rotate(-90 103 60.0003)" fill="#2BA8D1" /> <circle cx={103} cy="16.3333" r="1.66667" transform="rotate(-90 103 16.3333)" fill="#2BA8D1" /> <circle cx={132} cy="60.0003" r="1.66667" transform="rotate(-90 132 60.0003)" fill="#2BA8D1" /> <circle cx={132} cy="16.3333" r="1.66667" transform="rotate(-90 132 16.3333)" fill="#2BA8D1" /> <circle cx="1.66667" cy="45.3333" r="1.66667" transform="rotate(-90 1.66667 45.3333)" fill="#2BA8D1" /> <circle cx="1.66667" cy="1.66683" r="1.66667" transform="rotate(-90 1.66667 1.66683)" fill="#2BA8D1" /> <circle cx="16.3333" cy="45.3333" r="1.66667" transform="rotate(-90 16.3333 45.3333)" fill="#2BA8D1" /> <circle cx="16.3333" cy="1.66683" r="1.66667" transform="rotate(-90 16.3333 1.66683)" fill="#2BA8D1" /> <circle cx={31} cy="45.3333" r="1.66667" transform="rotate(-90 31 45.3333)" fill="#2BA8D1" /> <circle cx={31} cy="1.66683" r="1.66667" transform="rotate(-90 31 1.66683)" fill="#2BA8D1" /> <circle cx="45.6667" cy="45.3333" r="1.66667" transform="rotate(-90 45.6667 45.3333)" fill="#2BA8D1" /> <circle cx="45.6667" cy="1.66683" r="1.66667" transform="rotate(-90 45.6667 1.66683)" fill="#2BA8D1" /> <circle cx="60.3333" cy="45.3338" r="1.66667" transform="rotate(-90 60.3333 45.3338)" fill="#2BA8D1" /> <circle cx="60.3333" cy="1.66683" r="1.66667" transform="rotate(-90 60.3333 1.66683)" fill="#2BA8D1" /> <circle cx="88.6667" cy="45.3338" r="1.66667" transform="rotate(-90 88.6667 45.3338)" fill="#2BA8D1" /> <circle cx="88.6667" cy="1.66683" r="1.66667" transform="rotate(-90 88.6667 1.66683)" fill="#2BA8D1" /> <circle cx="117.667" cy="45.3338" r="1.66667" transform="rotate(-90 117.667 45.3338)" fill="#2BA8D1" /> <circle cx="117.667" cy="1.66683" r="1.66667" transform="rotate(-90 117.667 1.66683)" fill="#2BA8D1" /> <circle cx="74.6667" cy="45.3338" r="1.66667" transform="rotate(-90 74.6667 45.3338)" fill="#2BA8D1" /> <circle cx="74.6667" cy="1.66683" r="1.66667" transform="rotate(-90 74.6667 1.66683)" fill="#2BA8D1" /> <circle cx={103} cy="45.3338" r="1.66667" transform="rotate(-90 103 45.3338)" fill="#2BA8D1" /> <circle cx={103} cy="1.66683" r="1.66667" transform="rotate(-90 103 1.66683)" fill="#2BA8D1" /> <circle cx={132} cy="45.3338" r="1.66667" transform="rotate(-90 132 45.3338)" fill="#2BA8D1" /> <circle cx={132} cy="1.66683" r="1.66667" transform="rotate(-90 132 1.66683)" fill="#2BA8D1" /> </svg>
            </GridItem>
          </Grid>
        </Box>

        {/* --- Right Content --- */}
        <Box w={{ base: '100%', lg: '50%' }}>
          <Stack spacing={6}>
            <Box>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="semibold"
                color="#2BA8D1"
                mb={2}
              >
                About Aartiket Speech & Hearing Care
              </Text>

              <Heading
                as="h2"
                fontWeight="bold"
                color="#0C2F4D"
                fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
                lineHeight="short"
                mb={4}
              >
                Premier Hearing & Speech Solutions Across Mumbai Metropolitan
                Region
              </Heading>

              <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600" mb={3}>
                At Aartiket Speech & Hearing Care, we are dedicated to providing
                comprehensive audiology and speech therapy services. With over 15
                years of specialized experience and serving as consultants at 15+
                leading hospitals across Mumbai, we deliver expert care with
                unmatched precision and compassion.
              </Text>

              <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                Our certified audiologists and speech therapists use
                state-of-the-art technology and evidence-based practices to
                create personalized treatment plans — from advanced hearing aid
                fitting and programming to speech therapy for all ages.
              </Text>
            </Box>

            {/* Key Features */}
            <Stack spacing={3}>
              {[
                '15+ Years of Specialized Experience',
                'Consultant at 15+ Leading Hospitals',
                'State-of-the-Art Technology & Equipment',
                'Personalized Treatment Plans for All Ages',
              ].map((feature, idx) => (
                <Flex key={idx} align="center" gap={3}>
                  <Box w={2} h={2} borderRadius="full" bg="#2BA8D1" />
                  <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600" fontWeight="medium">
                    {feature}
                  </Text>
                </Flex>
              ))}
            </Stack>

            {/* CTA Button */}
            <Button
              as={RouterLink}
              to="/contact"
              alignSelf={{ base: 'center', lg: 'flex-start' }}
              bg="#2BA8D1"
              color="white"
              px={8}
              py={4}
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="semibold"
              borderRadius="full"
              border="2px solid #2BA8D1"
              shadow="lg"
              _hover={{
                bg: '#3AC0E7',
                borderColor: '#3AC0E7',
                shadow: 'xl',
                transform: 'translateY(-2px)',
              }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.3s ease"
            >
              Book Free Consultation
            </Button>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};

export default About1;
