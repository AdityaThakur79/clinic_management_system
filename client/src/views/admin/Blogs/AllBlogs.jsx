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
  useToast,
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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Avatar,
  Divider,
  SimpleGrid,
  Tooltip,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdVisibilityOff,
  MdStar,
  MdStarBorder,
  MdCalendarToday,
  MdPerson,
  MdBusiness,
  MdTrendingUp,
  MdThumbUp,
} from 'react-icons/md';
import { useGetBlogsQuery, useDeleteBlogMutation } from '../../../features/api/blogApi';
import { useNavigate } from 'react-router-dom';

const AllBlogs = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // API calls
  const { data, isLoading, error, refetch } = useGetBlogsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    category: categoryFilter,
    status: statusFilter,
    author: authorFilter,
    sortBy,
    sortOrder,
  });

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle view blog details
  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    onOpen();
  };

  // Handle edit blog
  const handleEditBlog = (blogId) => {
    navigate(`/admin/blogs/edit/${blogId}`);
  };

  // Handle delete blog
  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(blogId).unwrap();
        toast({
          title: 'Success',
          description: 'Blog deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        refetch();
      } catch (error) {
        toast({
          title: 'Error',
          description: error.data?.message || 'Failed to delete blog',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'yellow';
      case 'archived': return 'gray';
      default: return 'gray';
    }
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

  if (isLoading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading blogs...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Text color="red.500">Error loading blogs</Text>
          <Button onClick={() => refetch()}>Retry</Button>
        </VStack>
      </Center>
    );
  }

  const blogs = data?.blogs || [];
  const pagination = data?.pagination || {};

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
              All Blogs
            </Text>
            <Text fontSize="sm" color={textColor}>
              Manage your blog posts and content
            </Text>
          </Box>
          <Button
            bg="#2BA8D1"
            color="white"
            _hover={{ bg: '#0C2F4D' }}
            leftIcon={<Icon as={MdAdd} />}
            onClick={() => navigate('/admin/blogs/create')}
          >
            Create Blog
          </Button>
        </Flex>

        {/* Filters */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }} gap={4}>
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
                  <Text fontSize="sm" fontWeight="semibold">Status</Text>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    placeholder="All Status"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
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
                    <option value="createdAt">Created Date</option>
                    <option value="publishedAt">Published Date</option>
                    <option value="title">Title</option>
                    <option value="views">Views</option>
                    <option value="likes">Likes</option>
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
                  <Text fontSize="sm" fontWeight="semibold">Per Page</Text>
                  <Select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </Select>
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
                  <Button
                    bg="#2BA8D1"
                    color="white"
                    _hover={{ bg: '#0C2F4D' }}
                    leftIcon={<Icon as={MdAdd} />}
                    onClick={() => navigate('/admin/blogs/create')}
                  >
                    Create Your First Blog
                  </Button>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {blogs.map((blog) => (
              <Card key={blog._id} bg={cardBg} borderColor={borderColor} overflow="hidden">
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
                  <Badge
                    position="absolute"
                    top={2}
                    left={2}
                    colorScheme={getStatusColor(blog.status)}
                  >
                    {blog.status}
                  </Badge>
                </Box>

                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold" noOfLines={2}>
                        {blog.title}
                      </Text>
                      <Text fontSize="sm" color={textColor} noOfLines={2} mt={1}>
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
                        <Text>{formatDate(blog.createdAt)}</Text>
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

                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<Icon as={MdMoreVert} />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<Icon as={MdVisibility} />}
                            onClick={() => handleViewBlog(blog)}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem
                            icon={<Icon as={MdEdit} />}
                            onClick={() => handleEditBlog(blog._id)}
                          >
                            Edit Blog
                          </MenuItem>
                          <MenuItem
                            icon={<Icon as={MdDelete} />}
                            onClick={() => handleDeleteBlog(blog._id)}
                            color="red.500"
                          >
                            Delete Blog
                          </MenuItem>
                        </MenuList>
                      </Menu>
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

      {/* Blog Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Text fontSize="xl" fontWeight="bold">{selectedBlog?.title}</Text>
              <HStack spacing={2}>
                <Badge colorScheme={getStatusColor(selectedBlog?.status)}>
                  {selectedBlog?.status}
                </Badge>
                <Badge colorScheme={getCategoryColor(selectedBlog?.category)}>
                  {selectedBlog?.category}
                </Badge>
                {selectedBlog?.isFeatured && (
                  <Badge colorScheme="yellow" leftIcon={<Icon as={MdStar} />}>
                    Featured
                  </Badge>
                )}
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody overflowY="auto">
            <VStack spacing={6} align="stretch">
              {selectedBlog?.featuredImage && (
                <Image
                  src={selectedBlog.featuredImage.url}
                  alt={selectedBlog.title}
                  borderRadius="md"
                  maxH="300px"
                  objectFit="cover"
                  w="100%"
                />
              )}

              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={2}>Excerpt</Text>
                <Text color={textColor}>{selectedBlog?.excerpt}</Text>
              </Box>

              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={2}>Content</Text>
                <Box
                  color={textColor}
                  fontSize="sm"
                  lineHeight="1.6"
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  {selectedBlog?.content?.substring(0, 1000)}
                  {selectedBlog?.content?.length > 1000 && '...'}
                </Box>
              </Box>

              {selectedBlog?.tags && selectedBlog.tags.length > 0 && (
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={2}>Tags</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {selectedBlog.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}

              <Divider />

              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Author</Text>
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      src={selectedBlog?.author?.photoUrl}
                      name={selectedBlog?.author?.name}
                      bg="#2BA8D1"
                      color="white"
                    />
                    <Text fontWeight="medium">{selectedBlog?.author?.name}</Text>
                  </HStack>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Branch</Text>
                  <Text fontWeight="medium">{selectedBlog?.branchId?.branchName || 'N/A'}</Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Created</Text>
                  <Text fontWeight="medium">{formatDate(selectedBlog?.createdAt)}</Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Published</Text>
                  <Text fontWeight="medium">
                    {selectedBlog?.publishedAt ? formatDate(selectedBlog.publishedAt) : 'Not published'}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Views</Text>
                  <Text fontWeight="medium">{selectedBlog?.views || 0}</Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Likes</Text>
                  <Text fontWeight="medium">{selectedBlog?.likes || 0}</Text>
                </Box>
              </SimpleGrid>

              {selectedBlog?.seoTitle && (
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={2}>SEO Information</Text>
                  <VStack align="stretch" spacing={2}>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>SEO Title</Text>
                      <Text>{selectedBlog.seoTitle}</Text>
                    </Box>
                    {selectedBlog.seoDescription && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>SEO Description</Text>
                        <Text>{selectedBlog.seoDescription}</Text>
                      </Box>
                    )}
                    {selectedBlog.seoKeywords && selectedBlog.seoKeywords.length > 0 && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>SEO Keywords</Text>
                        <HStack spacing={2} flexWrap="wrap">
                          {selectedBlog.seoKeywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {keyword}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button 
                variant="outline" 
                borderColor="#2BA8D1"
                color="#2BA8D1"
                onClick={onClose} 
                _hover={{ 
                  bg: "#2BA8D1", 
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}
              >
                Close
              </Button>
              <Button
                bg="#2BA8D1"
                color="white"
                _hover={{ 
                  bg: '#0C2F4D',
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}
                onClick={() => handleEditBlog(selectedBlog?._id)}
              >
                Edit Blog
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AllBlogs;
