import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
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
  IconButton,
  useToast,
  Grid,
} from '@chakra-ui/react';
import {
  MdCalendarToday,
  MdPerson,
  MdTrendingUp,
  MdThumbUp,
  MdStar,
  MdBusiness,
  MdShare,
  MdBookmarkBorder,
  MdBookmark,
  MdArrowBack,
  MdLanguage,
} from 'react-icons/md';
import { useGetBlogBySlugQuery, useGetRelatedBlogsQuery, useIncrementBlogLikesMutation } from '../../../features/api/blogApi';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import ReactMarkdown from 'react-markdown';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const contentBg = useColorModeValue('white', 'gray.800');

  // State
  const [isBookmarked, setIsBookmarked] = useState(false);

  // API calls
  const { data, isLoading, error } = useGetBlogBySlugQuery(slug);
  const { data: relatedData } = useGetRelatedBlogsQuery({ id: data?.blog?._id, limit: 3 });
  const [incrementLikes] = useIncrementBlogLikesMutation();

  // Handle like
  const handleLike = async () => {
    if (!data?.blog?._id) return;
    
    try {
      await incrementLikes(data.blog._id).unwrap();
      toast({
        title: 'Liked!',
        description: 'Thank you for liking this article',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like the article',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.blog?.title,
          text: data?.blog?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied!',
          description: 'Blog link copied to clipboard',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Blog link copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Handle bookmark
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
      description: isBookmarked ? 'Article removed from your bookmarks' : 'Article saved to your bookmarks',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Loading blog...</Text>
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
        <Center h="400px">
          <VStack spacing={4}>
            <Text color="red.500">Error loading blog</Text>
            <Button onClick={() => navigate('/blogs')}>Back to Blogs</Button>
          </VStack>
        </Center>
        <Footer />
      </>
    );
  }

  if (!data?.blog) {
    return (
      <>
        <Navbar />
        <Center h="400px">
          <VStack spacing={4}>
            <Text>Blog not found</Text>
            <Button onClick={() => navigate('/blogs')}>Back to Blogs</Button>
          </VStack>
        </Center>
        <Footer />
      </>
    );
  }

  const blog = data.blog;
  const relatedBlogs = relatedData?.relatedBlogs || [];

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!blog) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "description": blog.excerpt,
      "image": blog.featuredImage?.url,
      "author": {
        "@type": "Organization",
        "name": "Aartiket Speech and Hearing Care",
        "url": "https://aartiketspechandhearincare.in",
        "logo": {
          "@type": "ImageObject",
          "url": "/aartiket_logo.jpeg"
        }
      },
      "publisher": {
        "@type": "Organization",
        "name": "Aartiket Speech and Hearing Care",
        "url": "https://aartiketspechandhearincare.in",
        "logo": {
          "@type": "ImageObject",
          "url": "/aartiket_logo.jpeg"
        }
      },
      "datePublished": blog.publishedAt,
      "dateModified": blog.updatedAt || blog.publishedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${window.location.origin}/blogs/${blog.slug}`
      },
      "articleSection": blog.category,
      "keywords": blog.tags?.join(", "),
      "wordCount": blog.content?.split(' ').length || 0,
      "url": `${window.location.origin}/blogs/${blog.slug}`,
      "isPartOf": {
        "@type": "Blog",
        "name": "Aartiket Speech and Hearing Care Blog",
        "url": `${window.location.origin}/blogs`
      }
    };
  };

  return (
    <>
      {/* Structured Data */}
      {blog && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData())
          }}
        />
      )}
      
      <Navbar />
      
      <Box py={{ base: 4, md: 8 }} px={{ base: 2, md: 4 }} maxW="7xl" mx="auto">
        <VStack spacing={{ base: 4, md: 8 }} align="stretch">
          {/* Back Button */}
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
            leftIcon={<Icon as={MdArrowBack} />}
            onClick={() => navigate('/blogs')}
            alignSelf="flex-start"
            size={{ base: "sm", md: "md" }}
          >
            Back to Blogs
          </Button>

          <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={{ base: 4, md: 8 }}>
            {/* Main Content */}
            <Box>
              <VStack spacing={8} align="stretch">
                {/* Blog Header */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardBody p={{ base: 4, md: 6 }}>
                    <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                      {/* Category and Featured Badge */}
                      <HStack spacing={2} flexWrap="wrap">
                        <Badge colorScheme={getCategoryColor(blog.category)} size={{ base: "md", md: "lg" }}>
                          {blog.category}
                        </Badge>
                        {blog.isFeatured && (
                          <Badge colorScheme="yellow" size={{ base: "md", md: "lg" }} leftIcon={<Icon as={MdStar} />}>
                            Featured
                          </Badge>
                        )}
                        {blog.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </HStack>

                      {/* Title */}
                      <Text fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} fontWeight="bold" color="gray.700" lineHeight="1.2">
                        {blog.title}
                      </Text>

                      {/* Excerpt */}
                      <Text fontSize={{ base: "md", md: "lg" }} color={textColor} lineHeight="1.6">
                        {blog.excerpt}
                      </Text>

                      {/* Meta Information */}
                      <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={4} fontSize="sm" color={textColor}>
                        <HStack spacing={1}>
                          <Icon as={MdCalendarToday} />
                          <Text fontSize={{ base: "xs", md: "sm" }}>{formatDate(blog.publishedAt)}</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={MdTrendingUp} />
                          <Text fontSize={{ base: "xs", md: "sm" }}>{blog.views || 0} views</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={MdThumbUp} />
                          <Text fontSize={{ base: "xs", md: "sm" }}>{blog.likes || 0} likes</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={MdPerson} />
                          <Text fontSize={{ base: "xs", md: "sm" }}>{blog.readingTime || 1} min read</Text>
                        </HStack>
                      </SimpleGrid>

                      {/* Author Information */}
                      <HStack spacing={4}>
                        <Avatar
                          size={{ base: "sm", md: "md" }}
                          src={blog.author?.photoUrl}
                          name={blog.author?.name}
                          bg="#2BA8D1"
                          color="white"
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>{blog.author?.name}</Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color={textColor}>
                            {blog.branchId?.branchName}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Action Buttons */}
                      <HStack spacing={3} flexWrap="wrap">
                        <Button
                          bg="#2BA8D1"
                          color="white"
                          _hover={{ 
                            bg: "#0C2F4D",
                            transform: "translateY(-2px)",
                            boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                          }}
                          leftIcon={<Icon as={MdThumbUp} />}
                          onClick={handleLike}
                          size={{ base: "sm", md: "md" }}
                        >
                          <Text display={{ base: "none", sm: "inline" }}>Like ({blog.likes || 0})</Text>
                          <Text display={{ base: "inline", sm: "none" }}>{blog.likes || 0}</Text>
                        </Button>
                        <IconButton
                          icon={<Icon as={MdShare} />}
                          variant="outline"
                          borderColor="#2BA8D1"
                          color="#2BA8D1"
                          _hover={{ 
                            bg: "#2BA8D1", 
                            color: "white",
                            transform: "translateY(-2px)",
                            boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                          }}
                          onClick={handleShare}
                          aria-label="Share"
                          size={{ base: "sm", md: "md" }}
                        />
                        <IconButton
                          icon={<Icon as={isBookmarked ? MdBookmark : MdBookmarkBorder} />}
                          variant="outline"
                          borderColor={isBookmarked ? "#2BA8D1" : "#2BA8D1"}
                          color={isBookmarked ? "#2BA8D1" : "#2BA8D1"}
                          bg={isBookmarked ? "#2BA8D1" : "transparent"}
                          _hover={{ 
                            bg: "#2BA8D1", 
                            color: "white",
                            transform: "translateY(-2px)",
                            boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                          }}
                          onClick={handleBookmark}
                          aria-label="Bookmark"
                          size={{ base: "sm", md: "md" }}
                        />
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Featured Image */}
                {blog.featuredImage && (
                  <Card bg={cardBg} borderColor={borderColor} overflow="hidden">
                    <Image
                      src={blog.featuredImage.url}
                      alt={blog.title}
                      w="100%"
                      h={{ base: "250px", md: "350px", lg: "400px" }}
                      objectFit="cover"
                    />
                  </Card>
                )}

                {/* Blog Content */}
                <Card bg={contentBg} borderColor={borderColor}>
                  <CardBody p={{ base: 4, md: 6 }}>
                    <Box
                      fontSize={{ base: "md", md: "lg" }}
                      lineHeight="1.8"
                      color="gray.700"
                      sx={{
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                          fontWeight: 'bold',
                          marginTop: '2rem',
                          marginBottom: '1rem',
                          color: 'gray.800',
                          fontSize: { base: '1.2rem', md: '1.5rem' }
                        },
                        '& p': {
                          marginBottom: '1.5rem',
                        },
                        '& ul, & ol': {
                          marginBottom: '1.5rem',
                          paddingLeft: { base: '1.5rem', md: '2rem' },
                        },
                        '& li': {
                          marginBottom: '0.5rem',
                        },
                        '& blockquote': {
                          borderLeft: '4px solid #2BA8D1',
                          paddingLeft: '1rem',
                          margin: '1.5rem 0',
                          fontStyle: 'italic',
                          color: 'gray.600',
                        },
                        '& img': {
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: 'md',
                          margin: '1rem 0',
                        },
                        '& a': {
                          color: '#2BA8D1',
                          textDecoration: 'underline',
                        },
                        '& code': {
                          backgroundColor: 'gray.100',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                        },
                        '& pre': {
                          backgroundColor: 'gray.100',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          overflow: 'auto',
                          margin: '1rem 0',
                        },
                      }}
                    >
                      <ReactMarkdown>{blog.content}</ReactMarkdown>
                    </Box>
                  </CardBody>
                </Card>

                {/* Tags and Keywords */}
                {(blog.tags?.length > 0 || blog.keywords?.length > 0) && (
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardBody p={{ base: 4, md: 6 }}>
                      <VStack spacing={4} align="stretch">
                        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color="gray.700">
                          Tags & Keywords
                        </Text>
                        <VStack spacing={3} align="stretch">
                          {/* Tags */}
                          {blog.tags?.length > 0 && (
                            <Box>
                              <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium" color="gray.600" mb={2}>
                                Tags:
                              </Text>
                              <HStack spacing={2} flexWrap="wrap">
                                {blog.tags.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    colorScheme="blue"
                                    variant="subtle"
                                    size={{ base: "sm", md: "md" }}
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    _hover={{
                                      bg: "blue.100",
                                      transform: "scale(1.05)",
                                      cursor: "pointer"
                                    }}
                                  >
                                    #{tag}
                                  </Badge>
                                ))}
                              </HStack>
                            </Box>
                          )}
                          
                          {/* Keywords */}
                          {blog.keywords?.length > 0 && (
                            <Box>
                              <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium" color="gray.600" mb={2}>
                                Keywords:
                              </Text>
                              <HStack spacing={2} flexWrap="wrap">
                                {blog.keywords.map((keyword, index) => (
                                  <Badge
                                    key={index}
                                    colorScheme="green"
                                    variant="outline"
                                    size={{ base: "sm", md: "md" }}
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    _hover={{
                                      bg: "green.50",
                                      transform: "scale(1.05)",
                                      cursor: "pointer"
                                    }}
                                  >
                                    {keyword}
                                  </Badge>
                                ))}
                              </HStack>
                            </Box>
                          )}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Action Buttons Bottom */}
                <Card bg={cardBg} borderColor={borderColor} mt={6}>
                  <CardBody p={{ base: 4, md: 6 }}>
                    <VStack spacing={4}>
                      <HStack justify="center" spacing={4} flexWrap="wrap">
                        <Button
                          bg="#2BA8D1"
                          color="white"
                          _hover={{ 
                            bg: "#0C2F4D",
                            transform: "translateY(-2px)",
                            boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                          }}
                          leftIcon={<Icon as={MdThumbUp} />}
                          onClick={handleLike}
                          size={{ base: "md", md: "lg" }}
                        >
                          <Text display={{ base: "none", sm: "inline" }}>Like This Article ({blog.likes || 0})</Text>
                          <Text display={{ base: "inline", sm: "none" }}>Like ({blog.likes || 0})</Text>
                        </Button>
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
                          leftIcon={<Icon as={MdShare} />}
                          onClick={handleShare}
                          size={{ base: "md", md: "lg" }}
                        >
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          borderColor="#2BA8D1"
                          color={isBookmarked ? "white" : "#2BA8D1"}
                          bg={isBookmarked ? "#2BA8D1" : "transparent"}
                          _hover={{ 
                            bg: "#2BA8D1", 
                            color: "white",
                            transform: "translateY(-2px)",
                            boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                          }}
                          leftIcon={<Icon as={isBookmarked ? MdBookmark : MdBookmarkBorder} />}
                          onClick={handleBookmark}
                          size={{ base: "md", md: "lg" }}
                        >
                          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Box>

            {/* Sidebar */}
            <Box>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                {/* Aartiket Speech and Hearing Care Card */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader pb={2}>
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">About Aartiket Speech and Hearing Care</Text>
                  </CardHeader>
                  <CardBody pt={2}>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3}>
                        <Image
                          src="/aartiket_logo.jpeg"
                          alt="Aartiket Speech and Hearing Care Logo"
                          boxSize={{ base: "50px", md: "60px" }}
                          borderRadius="full"
                          objectFit="cover"
                          fallbackSrc="https://via.placeholder.com/60x60/2BA8D1/FFFFFF?text=AS"
                        />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                            Aartiket Speech and Hearing Care
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color={textColor}>
                            Leading Hearing Care Center
                          </Text>
                          <HStack spacing={1}>
                            <Icon as={MdLanguage} color="#2BA8D1" />
                            <Text 
                              fontSize={{ base: "xs", md: "sm" }} 
                              color="#2BA8D1" 
                              cursor="pointer"
                              _hover={{ textDecoration: "underline" }}
                              onClick={() => window.open('https://aartiketspechandhearincare.in', '_blank')}
                            >
                              aartiketspechandhearincare.in
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                      <Text fontSize={{ base: "xs", md: "sm" }} color={textColor}>
                        Dedicated to providing comprehensive hearing care services, speech therapy, and advanced hearing aid solutions to improve your quality of life.
                      </Text>
                      <Button
                        size={{ base: "sm", md: "md" }}
                        variant="outline"
                        borderColor="#2BA8D1"
                        color="#2BA8D1"
                        _hover={{ 
                          bg: "#2BA8D1", 
                          color: "white",
                          transform: "translateY(-2px)",
                          boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                        }}
                        onClick={() => window.open('https://aartiketspechandhearingcare.in', '_blank')}
                        leftIcon={<Icon as={MdLanguage} />}
                      >
                        Visit Our Website
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Blog Stats */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader pb={2}>
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">Article Stats</Text>
                  </CardHeader>
                  <CardBody pt={2}>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textColor}>Views</Text>
                        <Badge colorScheme="blue" size={{ base: "sm", md: "md" }}>{blog.views || 0}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textColor}>Likes</Text>
                        <Badge colorScheme="green" size={{ base: "sm", md: "md" }}>{blog.likes || 0}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textColor}>Reading Time</Text>
                        <Badge colorScheme="purple" size={{ base: "sm", md: "md" }}>{blog.readingTime || 1} min</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textColor}>Published</Text>
                        <Text fontSize={{ base: "xs", md: "sm" }}>{formatDate(blog.publishedAt)}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Related Articles */}
                {relatedBlogs.length > 0 && (
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardHeader pb={2}>
                      <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">Related Articles</Text>
                    </CardHeader>
                    <CardBody pt={2}>
                      <VStack spacing={4} align="stretch">
                        {relatedBlogs.map((relatedBlog) => (
                          <Box
                            key={relatedBlog._id}
                            p={{ base: 2, md: 3 }}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => navigate(`/blogs/${relatedBlog.slug}`)}
                          >
                            <VStack spacing={2} align="stretch">
                              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold" noOfLines={2}>
                                {relatedBlog.title}
                              </Text>
                              <Text fontSize={{ base: "xs", md: "xs" }} color={textColor} noOfLines={2}>
                                {relatedBlog.excerpt}
                              </Text>
                              <HStack spacing={2} fontSize={{ base: "xs", md: "xs" }} color="gray.500">
                                <HStack spacing={1}>
                                  <Icon as={MdCalendarToday} />
                                  <Text>{formatDate(relatedBlog.publishedAt)}</Text>
                                </HStack>
                                <HStack spacing={1}>
                                  <Icon as={MdTrendingUp} />
                                  <Text>{relatedBlog.views || 0}</Text>
                                </HStack>
                              </HStack>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Call to Action */}
                <Card bg="blue.50" borderColor="blue.200">
                  <CardBody p={{ base: 3, md: 4 }}>
                    <VStack spacing={3} align="stretch" textAlign="center">
                      <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color="blue.700">
                        Need Help?
                      </Text>
                      <Text fontSize={{ base: "xs", md: "sm" }} color="blue.600">
                        Contact us for personalized hearing care consultation
                      </Text>
                      <Button
                        bg="#2BA8D1"
                        color="white"
                        _hover={{ 
                          bg: "#0C2F4D",
                          transform: "translateY(-2px)",
                          boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                        }}
                        size={{ base: "sm", md: "md" }}
                        onClick={() => navigate('/contact')}
                      >
                        Contact Us
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Box>
          </Grid>
        </VStack>
      </Box>

      <Footer />
    </>
  );
};

export default BlogDetail;
