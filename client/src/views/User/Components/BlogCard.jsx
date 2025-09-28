import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Image,
  Text,
  Badge,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Button,
  Avatar,
  Flex,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  MdCalendarToday,
  MdTrendingUp,
  MdThumbUp,
  MdPerson,
  MdArrowForward,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ blog, isLoading = false }) => {
  const navigate = useNavigate();
  
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Health Tips': 'blue',
      'Hearing Care': 'green',
      'Technology': 'purple',
      'News': 'orange',
      'General': 'gray',
      'Research': 'cyan',
      'Patient Stories': 'pink',
    };
    return colors[category] || 'gray';
  };

  // Truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <Card bg={cardBg} borderColor={borderColor} overflow="hidden" h="400px">
        <Center h="100%">
          <VStack spacing={4}>
            <Spinner size="xl" color="#2BA8D1" />
            <Text color={textColor}>Loading blog...</Text>
          </VStack>
        </Center>
      </Card>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      overflow="hidden"
      h="400px"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-8px)',
        shadow: 'xl',
        borderColor: '#2BA8D1',
        bg: hoverBg,
      }}
      cursor="pointer"
      onClick={() => navigate(`/blogs/${blog.slug}`)}
      position="relative"
      group
    >
      {/* Featured Image */}
      <Box position="relative" h="200px" overflow="hidden">
        <Image
          src={blog.featuredImage?.url}
          alt={blog.title}
          w="100%"
          h="100%"
          objectFit="cover"
          transition="transform 0.3s ease"
          _groupHover={{
            transform: 'scale(1.05)',
          }}
        />
        
        {/* Overlay on hover */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(43, 168, 209, 0.1)"
          opacity={0}
          transition="opacity 0.3s ease"
          _groupHover={{
            opacity: 1,
          }}
        />
        
        {/* Category Badge */}
        <Badge
          position="absolute"
          top={3}
          left={3}
          colorScheme={getCategoryColor(blog.category)}
          borderRadius="full"
          px={3}
          py={1}
          fontSize="xs"
          fontWeight="semibold"
        >
          {blog.category}
        </Badge>

        {/* Featured Badge */}
        {blog.isFeatured && (
          <Badge
            position="absolute"
            top={3}
            right={3}
            colorScheme="yellow"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            fontWeight="semibold"
            leftIcon={<Icon as={MdTrendingUp} />}
          >
            Featured
          </Badge>
        )}
      </Box>

      {/* Card Content */}
      <CardBody p={4} flex="1" display="flex" flexDirection="column">
        <VStack spacing={3} align="stretch" h="100%">
          {/* Title */}
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="gray.800"
            noOfLines={2}
            lineHeight="1.3"
            transition="color 0.3s ease"
            _groupHover={{
              color: '#2BA8D1',
            }}
          >
            {blog.title}
          </Text>

          {/* Excerpt */}
          <Text
            fontSize="sm"
            color={textColor}
            noOfLines={3}
            lineHeight="1.5"
            flex="1"
          >
            {truncateText(blog.excerpt, 120)}
          </Text>

          {/* Stats */}
          <HStack spacing={4} fontSize="xs" color={textColor} mb={2}>
            <HStack spacing={1}>
              <Icon as={MdCalendarToday} />
              <Text>{formatDate(blog.publishedAt)}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={MdTrendingUp} />
              <Text>{blog.views || 0}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={MdThumbUp} />
              <Text>{blog.likes || 0}</Text>
            </HStack>
          </HStack>

          {/* Author and Read More */}
          <Flex justify="space-between" align="center" mt="auto">
            <HStack spacing={2}>
              <Image
                src="/aartiket_logo.jpeg"
                alt="Aartiket Speech and Hearing Care Logo"
                boxSize="32px"
                borderRadius="full"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/32x32/2BA8D1/FFFFFF?text=AS"
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="medium" color="gray.700">
                  Aartiket Speech and Hearing Care
                </Text>
                <Text fontSize="xs" color={textColor}>
                  Leading Hearing Care Center
                </Text>
              </VStack>
            </HStack>

            <Button
              size="sm"
              variant="outline"
              borderColor="#2BA8D1"
              color="#2BA8D1"
              rightIcon={<Icon as={MdArrowForward} />}
              _hover={{
                bg: '#2BA8D1',
                color: 'white',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(43, 168, 209, 0.3)',
              }}
              transition="all 0.3s ease"
              fontSize="xs"
              px={3}
            >
              Read More
            </Button>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default BlogCard;
