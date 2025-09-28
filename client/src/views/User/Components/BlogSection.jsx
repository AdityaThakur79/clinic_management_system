import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Button,
  Icon,
  useColorModeValue,
  Container,
  Flex,
  Spinner,
  Center,
  Badge,
} from '@chakra-ui/react';
import {
  MdArrowForward,
  MdTrendingUp,
  MdLibraryBooks,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useGetFeaturedBlogsQuery } from '../../../features/api/blogApi';
import BlogCard from './BlogCard';
import { assets } from '../../../assets/assets';

const BlogSection = () => {
  const navigate = useNavigate();
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Fetch featured blogs
  const { data, isLoading, error } = useGetFeaturedBlogsQuery(3);

  const blogs = data?.featuredBlogs || [];

  return (
    <Box 
      as="section" 
      py={{ base: 16, md: 20 }} 
      bg={bgColor}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("/patternbg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.05,
        zIndex: 0,
      }}
    >
      <Container maxW="7xl" position="relative" zIndex={1}>
        <VStack spacing={16}>
          <VStack spacing={6} textAlign="center">
            <Badge 
              colorScheme="blue" 
              px={4} 
              py={2} 
              rounded="full" 
              fontSize="sm" 
              fontWeight="bold"
              bg="#2BA8D1"
              color="white"
            >
              Latest Insights
            </Badge>
            <Text 
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} 
              fontWeight="bold" 
              color={headingColor}
              maxW="4xl"
              lineHeight="1.2"
            >
              Expert Articles on Hearing Care & Speech Therapy
            </Text>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color={textColor}
              maxW="600px"
              lineHeight="1.6"
            >
              Stay informed with our expert articles on hearing care, speech therapy, 
              and health tips from our professional team.
            </Text>
          </VStack>

          {/* Loading State */}
          {isLoading && (
            <Center py={20}>
              <VStack spacing={4}>
                <Spinner size="xl" color="#2BA8D1" />
                <Text color={textColor}>Loading latest articles...</Text>
              </VStack>
            </Center>
          )}

          {/* Error State */}
          {error && (
            <Center py={20}>
              <VStack spacing={4}>
                <Text color="red.500" fontSize="lg">
                  Unable to load articles
                </Text>
                <Button
                  variant="outline"
                  borderColor="#2BA8D1"
                  color="#2BA8D1"
                  _hover={{
                    bg: '#2BA8D1',
                    color: 'white',
                  }}
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </VStack>
            </Center>
          )}

          {/* Blog Cards */}
          {!isLoading && !error && blogs.length > 0 && (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={8}
              w="100%"
            >
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </SimpleGrid>
          )}

          {/* View All Articles Button */}
          {!isLoading && !error && blogs.length > 0 && (
            <Flex justify="center" mt={8}>
              <Button
                bg="#2BA8D1"
                color="white"
                rightIcon={<Icon as={MdArrowForward} />}
                _hover={{
                  bg: '#0C2F4D',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(43, 168, 209, 0.3)',
                }}
                transition="all 0.3s ease"
                size={{ base: 'md', md: 'lg' }}
                onClick={() => navigate('/blogs')}
              >
                View All Articles
              </Button>
            </Flex>
          )}

          {/* Empty State */}
          {!isLoading && !error && blogs.length === 0 && (
            <Center py={20}>
              <VStack spacing={4}>
                <Icon as={MdLibraryBooks} boxSize={16} color={textColor} />
                <Text fontSize="lg" color={textColor}>
                  No articles available yet
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Check back soon for our latest insights
                </Text>
              </VStack>
            </Center>
          )}

          {/* Featured Badge */}
          {/* {blogs.length > 0 && (
            <Flex justify="center" mt={4}>
              <Badge
                colorScheme="blue"
                variant="subtle"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                leftIcon={<Icon as={MdTrendingUp} />}
              >
                Featured Articles
              </Badge>
            </Flex>
          )} */}
        </VStack>
      </Container>
    </Box>
  );
};

export default BlogSection;
