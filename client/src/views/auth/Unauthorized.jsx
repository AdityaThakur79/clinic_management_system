import React from 'react';
import { Box, Button, Heading, Text, VStack, HStack, Icon, Image } from '@chakra-ui/react';
import { MdLock, MdArrowBack, MdHealing } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Unauthorized = ({ title = "Unauthorized", message = "You don't have permission to access this page." }) => {
  const navigate = useNavigate();
  return (
    <Box pt={{ base: '120px', md: '100px' }} px={6} minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={6} maxW="lg" textAlign="center">
        <HStack spacing={3} color="#2BA8D1">
          <Icon as={MdHealing} boxSize={8} />
          <Heading size="lg">Doctor says: Hold on!</Heading>
        </HStack>
        <Icon as={MdLock} boxSize={16} color="#2BA8D1" />
        <Heading size="md">{title}</Heading>
        <Text color="gray.600">{message}</Text>
        <Text color="gray.500" fontSize="sm">If you think this is a mistake, please contact your administrator.</Text>
        <HStack spacing={4} pt={2}>
          <Button
            leftIcon={<Icon as={MdArrowBack} />}
            variant="outline"
            onClick={() => navigate(-1)}
            _hover={{ bg: '#2BA8D1', color: 'white', transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(43,168,209,0.3)' }}
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/admin/dashboard')}
            bg="#2BA8D1"
            color="white"
            _hover={{ bg: '#2696ba', transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(43,168,209,0.3)' }}
          >
            Dashboard
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Unauthorized;


