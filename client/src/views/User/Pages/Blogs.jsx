import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Select,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Grid,
  GridItem,
  Text,
  useColorModeValue,
  Icon,
  Flex,
  Spinner,
  Center,
  Image,
  Badge,
  Avatar,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';
import {
  MdSearch,
  MdCalendarToday,
  MdPerson,
  MdTrendingUp,
  MdThumbUp,
  MdStar,
  MdBusiness,
} from 'react-icons/md';
import { useGetPublicBlogsQuery, useGetFeaturedBlogsQuery } from '../../../features/api/blogApi';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import PageHeader from '../Components/PageHeader';
import { assets } from '../../../assets/assets';

const Blogs = () => {
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFeatured, setShowFeatured] = useState(false);

  // API calls
  const { data, isLoading, error } = useGetPublicBlogsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    category: categoryFilter,
    tag: tagFilter,
    sortBy,
    sortOrder,
    featured: showFeatured,
  });

  const { data: featuredData } = useGetFeaturedBlogsQuery(3);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <PageHeader title="Blogs" subtitle="Stay updated with our latest articles and insights"  crumbs={[{ label: 'About' }]}
        bgImage={assets.about_1} />
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Loading blogs...</Text>
          </VStack>
        </Center>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <PageHeader title="Blogs" subtitle="Stay updated with our latest articles and insights" />
        <Center h="400px">
          <VStack spacing={4}>
            <Text color="red.500">Error loading blogs</Text>
            <Button 
              bg="#2BA8D1"
              color="white"
              _hover={{ 
                bg: "#0C2F4D",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
              }}
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </VStack>
        </Center>
        <Footer />
      </>
    );
  }

  const blogs = data?.blogs || [];
  const pagination = data?.pagination || {};
  const featuredBlogs = featuredData?.featuredBlogs || [];

  // Generate structured data for blog listing
  const generateBlogListSchema = () => {
    const blogListSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Aartiket Speech and Hearing Care Blog",
      "description": "Stay updated with our latest articles and insights on hearing care, speech therapy, and health tips",
      "url": `${window.location.origin}/blogs`,
      "publisher": {
        "@type": "Organization",
        "name": "Aartiket Speech and Hearing Care",
        "url": "https://aartiketspechandhearincare.in",
        "logo": {
          "@type": "ImageObject",
          "url": "/aartiket_logo.jpeg"
        }
      },
      "blogPost": blogs.map(blog => ({
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.excerpt,
        "url": `${window.location.origin}/blogs/${blog.slug}`,
        "datePublished": blog.publishedAt,
        "author": {
          "@type": "Organization",
          "name": "Aartiket Speech and Hearing Care"
        },
        "image": blog.featuredImage?.url,
        "articleSection": blog.category,
        "keywords": blog.tags?.join(", ")
      }))
    };
    return blogListSchema;
  };

  return (
    <>
      {/* Structured Data for Blog List */}
      {blogs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateBlogListSchema())
          }}
        />
      )}
      
      <Navbar />
      <PageHeader title="Blogs" description="Stay updated with our latest articles and insights"  crumbs={[{ label: 'Blogs' }]}
        bgImage={assets.service_7} />
      
      <Box py={16} px={4} maxW="7xl" mx="auto">
        <VStack spacing={12} align="stretch">
          {/* Featured Blogs Section */}
          {featuredBlogs.length > 0 && !showFeatured && (
            <Box>
              <HStack justify="space-between" align="center" mb={6}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  Featured Articles
                </Text>
                <Button
                  variant="outline"
                  borderColor="#2BA8D1"
                  color="#2BA8D1"
                  _hover={{ 
                    bg: "#2BA8D1", 
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                  }}
                  size="sm"
                  onClick={() => setShowFeatured(true)}
                >
                  View All Featured
                </Button>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {featuredBlogs.map((blog) => (
                  <Card key={blog._id} bg={cardBg} borderColor={borderColor} overflow="hidden" _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }} transition="all 0.3s">
                    <Box position="relative">
                      <Image
                        src={blog.featuredImage?.url}
                        alt={blog.title}
                        h="200px"
                        w="100%"
                        objectFit="cover"
                      />
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="yellow"
                        leftIcon={<Icon as={MdStar} />}
                      >
                        Featured
                      </Badge>
                    </Box>

                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" noOfLines={2}>
                            {blog.title}
                          </Text>
                          <Text fontSize="sm" color={textColor} noOfLines={3} mt={2}>
                            {blog.excerpt}
                          </Text>
                        </Box>

                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme={getCategoryColor(blog.category)} size="sm">
                            {blog.category}
                          </Badge>
                          {blog.tags?.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </HStack>

                        <HStack spacing={4} fontSize="sm" color={textColor}>
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

                        <Button
                          variant="outline"
                          borderColor="#2BA8D1"
                          color="#2BA8D1"
                          _hover={{ 
                            bg: "#2BA8D1", 
                            color: "white",
                            transform: "translateY(-2px)",
                            boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                          }}
                          size="sm"
                          onClick={() => window.location.href = `/blogs/${blog.slug}`}
                        >
                          Read More
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Filters */}
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }} gap={4}>
                <GridItem>
                  <VStack align="stretch" spacing={1}>
                    <Text fontSize="sm" fontWeight="semibold">Search</Text>
                    <Input
                      placeholder="Search blogs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      leftIcon={<Icon as={MdSearch} />}
                    />
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack align="stretch" spacing={1}>
                    <Text fontSize="sm" fontWeight="semibold">Category</Text>
                    <Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      placeholder="All Categories"
                    >
                      <option value="Health Tips">Health Tips</option>
                      <option value="Hearing Care">Hearing Care</option>
                      <option value="Technology">Technology</option>
                      <option value="News">News</option>
                      <option value="General">General</option>
                      <option value="Research">Research</option>
                      <option value="Patient Stories">Patient Stories</option>
                    </Select>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack align="stretch" spacing={1}>
                    <Text fontSize="sm" fontWeight="semibold">Sort By</Text>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="publishedAt">Published Date</option>
                      <option value="views">Most Viewed</option>
                      <option value="likes">Most Liked</option>
                      <option value="title">Title</option>
                    </Select>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack align="stretch" spacing={1}>
                    <Text fontSize="sm" fontWeight="semibold">Order</Text>
                    <Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </Select>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack align="stretch" spacing={1}>
                    <Text fontSize="sm" fontWeight="semibold">Filter</Text>
                    <Button
                      variant={showFeatured ? "solid" : "outline"}
                      bg={showFeatured ? "#2BA8D1" : "transparent"}
                      color={showFeatured ? "white" : "#2BA8D1"}
                      borderColor="#2BA8D1"
                      _hover={{ 
                        bg: showFeatured ? "#0C2F4D" : "#2BA8D1", 
                        color: "white",
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                      }}
                      size="sm"
                      onClick={() => setShowFeatured(!showFeatured)}
                    >
                      {showFeatured ? "All Blogs" : "Featured Only"}
                    </Button>
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Blogs Grid */}
          {blogs.length === 0 ? (
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Center py={10}>
                  <VStack spacing={4}>
                    <Text fontSize="lg" color={textColor}>No blogs found</Text>
                    <Text fontSize="sm" color="gray.500">
                      Try adjusting your search criteria
                    </Text>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {blogs.map((blog) => (
                <Card key={blog._id} bg={cardBg} borderColor={borderColor} overflow="hidden" _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }} transition="all 0.3s">
                  <Box position="relative">
                    <Image
                      src={blog.featuredImage?.url}
                      alt={blog.title}
                      h="200px"
                      w="100%"
                      objectFit="cover"
                    />
                    {blog.isFeatured && (
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="yellow"
                        leftIcon={<Icon as={MdStar} />}
                      >
                        Featured
                      </Badge>
                    )}
                  </Box>

                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <Text fontSize="lg" fontWeight="semibold" noOfLines={2}>
                          {blog.title}
                        </Text>
                        <Text fontSize="sm" color={textColor} noOfLines={3} mt={2}>
                          {blog.excerpt}
                        </Text>
                      </Box>

                      <HStack spacing={2} flexWrap="wrap">
                        <Badge colorScheme={getCategoryColor(blog.category)} size="sm">
                          {blog.category}
                        </Badge>
                        {blog.tags?.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </HStack>

                      <HStack spacing={4} fontSize="sm" color={textColor}>
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

                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Avatar
                            size="sm"
                            src={blog.author?.photoUrl}
                            name={blog.author?.name}
                            bg="#2BA8D1"
                            color="white"
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="medium">
                              {blog.author?.name}
                            </Text>
                            <Text fontSize="xs" color={textColor}>
                              {blog.branchId?.branchName}
                            </Text>
                          </VStack>
                        </HStack>

                        <Button
                          variant="outline"
                          borderColor="#2BA8D1"
                          color="#2BA8D1"
                          _hover={{ 
                            bg: "#2BA8D1", 
                            color: "white",
                            transform: "translateY(-2px)",
                            boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                          }}
                          size="sm"
                          onClick={() => window.location.href = `/blogs/${blog.slug}`}
                        >
                          Read More
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" color={textColor}>
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} blogs
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="#2BA8D1"
                      color="#2BA8D1"
                      _hover={{ 
                        bg: "#2BA8D1", 
                        color: "white",
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                      }}
                      _disabled={{
                        opacity: 0.4,
                        cursor: "not-allowed",
                        _hover: {
                          bg: "transparent",
                          color: "#2BA8D1",
                          transform: "none",
                          boxShadow: "none"
                        }
                      }}
                      onClick={() => setCurrentPage(pagination.page - 1)}
                      isDisabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <Text fontSize="sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="#2BA8D1"
                      color="#2BA8D1"
                      _hover={{ 
                        bg: "#2BA8D1", 
                        color: "white",
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                      }}
                      _disabled={{
                        opacity: 0.4,
                        cursor: "not-allowed",
                        _hover: {
                          bg: "transparent",
                          color: "#2BA8D1",
                          transform: "none",
                          boxShadow: "none"
                        }
                      }}
                      onClick={() => setCurrentPage(pagination.page + 1)}
                      isDisabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>

      <Footer />
    </>
  );
};

export default Blogs;
