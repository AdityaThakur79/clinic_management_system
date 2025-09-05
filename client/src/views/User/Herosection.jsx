import React from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Image,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { MdArrowForward, MdDashboard, MdPeople, MdEvent } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';

const Herosection = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={20}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="space-between"
          gap={10}
        >
          {/* Left Content */}
          <VStack
            align={{ base: 'center', lg: 'start' }}
            spacing={8}
            flex={1}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            <VStack spacing={4} align={{ base: 'center', lg: 'start' }}>
              <Heading
                as="h1"
                size="2xl"
                color={textColor}
                fontWeight="bold"
                lineHeight="shorter"
              >
                Clinic Management System
              </Heading>
              <Text
                fontSize="xl"
                color={subTextColor}
                maxW="600px"
                lineHeight="tall"
              >
                Streamline your clinic operations with our comprehensive management solution. 
                Manage patients, appointments, billing, and more all in one place.
              </Text>
            </VStack>

            <HStack spacing={4} flexWrap="wrap" justify={{ base: 'center', lg: 'start' }}>
              <Button
                as={RouterLink}
                to="/admin"
                colorScheme="blue"
                size="lg"
                rightIcon={<Icon as={MdArrowForward} />}
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                Get Started
              </Button>
              <Button
                as={RouterLink}
                to="/auth"
                variant="outline"
                size="lg"
                colorScheme="blue"
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                Sign In
              </Button>
            </HStack>

            {/* Features */}
            <VStack spacing={4} align={{ base: 'center', lg: 'start' }} pt={8}>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Key Features:
              </Text>
              <HStack spacing={8} flexWrap="wrap" justify={{ base: 'center', lg: 'start' }}>
                <VStack spacing={2}>
                  <Icon as={MdPeople} w={8} h={8} color="blue.500" />
                  <Text fontSize="sm" color={subTextColor} textAlign="center">
                    Patient Management
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Icon as={MdEvent} w={8} h={8} color="green.500" />
                  <Text fontSize="sm" color={subTextColor} textAlign="center">
                    Appointment Scheduling
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Icon as={MdDashboard} w={8} h={8} color="purple.500" />
                  <Text fontSize="sm" color={subTextColor} textAlign="center">
                    Analytics Dashboard
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>

          {/* Right Content - Placeholder for image or illustration */}
          <Box flex={1} display={{ base: 'none', lg: 'block' }}>
            <Box
              w="100%"
              h="400px"
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              borderRadius="xl"
              display="flex"
              align="center"
              justify="center"
              color="white"
              fontSize="2xl"
              fontWeight="bold"
            >
              Clinic Management Dashboard Preview
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Herosection;
