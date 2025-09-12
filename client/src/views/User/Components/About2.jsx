import React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Text,
  Heading,
  List,
  ListItem,
  Button,
  Image,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { assets } from '../../../assets/assets';

const About2 = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = '#2BA8D1';
  const secondaryColor = '#3AC0E7';

  return (
    <Box
      as="section"
      position="relative"
      py={{ base: 16, md: 20, lg: 24 }}
      bg={bgColor}
      overflow="hidden"
    >
      {/* Background Decorative Circle */}
      <Box
        position="absolute"
        right={{ base: '-50px', lg: '-110px' }}
        top="50%"
        transform="translateY(-50%)"
        fontSize={{ base: '200px', lg: '325px' }}
        color="rgba(43, 168, 209, 0.05)"
        fontWeight="500"
        lineHeight="1em"
        zIndex="0"
        display={{ base: 'none', lg: 'block' }}
      >
        A
      </Box>

      <Container maxW="7xl" position="relative" zIndex="1">
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={{ base: 8, lg: 12 }}
          alignItems="center"
        >
          {/* Content Column */}
          <GridItem order={{ base: 2, lg: 1 }}>
            <VStack align="start" spacing={6} pl={{ base: 0, lg: 8 }}>
              {/* Section Title */}
              <Box position="relative" w="full">
                <Text
                  fontSize="lg"
                  fontWeight="500"
                  color={accentColor}
                  mb={4}
                  position="relative"
                >
                  About Aartiket
                </Text>
                <Heading
                  as="h2"
                  fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                  fontWeight="600"
                  color={headingColor}
                  lineHeight="1.28em"
                  position="relative"
                  pb={5}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    left: '0px',
                    bottom: '0px',
                    width: '50px',
                    height: '3px',
                    bg: 'gray.300',
                  }}
                >
                  We are leaders in{' '}
                  <Box as="span" color={accentColor}>
                    Speech & Hearing Care
                  </Box>{' '}
                  Since 2010
                </Heading>
              </Box>

              {/* Description Text */}
              <Text
                fontSize="md"
                lineHeight="1.6"
                color={textColor}
                fontWeight="400"
                mb={6}
              >
                At Aartiket Speech & Hearing Care, we have been dedicated to
                providing comprehensive hearing and speech solutions to our
                community in Ghatkopar and beyond. Our experienced team of
                audiologists and speech therapists work tirelessly to ensure
                every patient receives personalized care and the best possible
                outcomes for their hearing and communication needs.
              </Text>

              {/* Feature List */}
              <List spacing={3} mb={8}>
                <ListItem
                  display="flex"
                  alignItems="flex-start"
                  fontSize="md"
                  lineHeight="1.6"
                  color={headingColor}
                  fontWeight="400"
                >
                  <Icon
                    as={FaCheckCircle}
                    color={accentColor}
                    fontSize="lg"
                    mr={3}
                    mt={0.5}
                    flexShrink={0}
                  />
                  <Text>State-of-the-art hearing assessment equipment</Text>
                </ListItem>
                <ListItem
                  display="flex"
                  alignItems="flex-start"
                  fontSize="md"
                  lineHeight="1.6"
                  color={headingColor}
                  fontWeight="400"
                >
                  <Icon
                    as={FaCheckCircle}
                    color={accentColor}
                    fontSize="lg"
                    mr={3}
                    mt={0.5}
                    flexShrink={0}
                  />
                  <Text>Experienced audiologists and speech therapists</Text>
                </ListItem>
                <ListItem
                  display="flex"
                  alignItems="flex-start"
                  fontSize="md"
                  lineHeight="1.6"
                  color={headingColor}
                  fontWeight="400"
                >
                  <Icon
                    as={FaCheckCircle}
                    color={accentColor}
                    fontSize="lg"
                    mr={3}
                    mt={0.5}
                    flexShrink={0}
                  />
                  <Text>Comprehensive warranty and ongoing support</Text>
                </ListItem>
              </List>

              {/* CTA Button */}
              <Button
                as="a"
                href="#contact"
                bg={accentColor}
                color="white"
                fontSize="lg"
                fontWeight="600"
                px={12}
                py={6}
                h="auto"
                borderRadius="md"
                position="relative"
                overflow="hidden"
                transition="all 0.3s ease"
                _hover={{
                  bg: '#0C2F4D',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(43, 168, 209, 0.3)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
              >
                Contact Us
              </Button>
            </VStack>
          </GridItem>

          {/* Image Column */}
          <GridItem order={{ base: 1, lg: 2 }}>
            <Box
              position="relative"
              pl={{ base: 0, lg: 20 }}
              pb={{ base: 0, lg: 32 }}
              _before={{
                content: '""',
                position: 'absolute',
                left: { base: '-20px', lg: '-75px' },
                top: { base: '20px', lg: '65px' },
                height: { base: '300px', lg: '520px' },
                width: { base: '300px', lg: '520px' },
                background: `radial-gradient(circle, rgba(43, 168, 209, 0.1) 0%, transparent 70%)`,
                borderRadius: 'full',
                zIndex: 0,
              }}
            >
              {/* Main Image */}
              <Box
                position="relative"
                zIndex="2"
                mb={4}
                _hover={{
                  transform: 'translateY(-5px)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Image
                  src={assets.audiologist2}
                  alt="Hearing test in progress"
                  borderRadius="lg"
                  boxShadow="0 30px 50px rgba(8, 13, 62, 0.15)"
                  w="full"
                  h="400px"
                  objectFit="cover"
                />
              </Box>

              {/* Secondary Image */}
              <Box
                position={{ base: 'relative', lg: 'absolute' }}
                left={{ base: 'auto', lg: '0' }}
                bottom={{ base: 'auto', lg: '0' }}
                zIndex="2"
                _hover={{
                  transform: 'translateY(-5px)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Image
                  src={assets.service_10}
                  alt="Digital hearing aids"
                  borderRadius="lg"
                  boxShadow="0 30px 50px rgba(8, 13, 62, 0.15)"
                  w={{ base: 'full', lg: '300px' }}
                  h={{ base: '250px', lg: '200px' }}
                  objectFit="cover"
                />
              </Box>

              {/* Video Play Button (Optional) */}
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default About2;
