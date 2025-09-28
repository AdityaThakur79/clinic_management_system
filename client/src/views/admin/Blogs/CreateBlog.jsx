import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  useToast,
  Grid,
  GridItem,
  Divider,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  FormErrorMessage,
  Icon,
  Flex,
  Spinner,
  Center,
  Image,
  IconButton,
  CloseButton,
  Badge,
  Switch,
  FormHelperText,
} from '@chakra-ui/react';
import { MdAdd, MdImage, MdSave, MdCancel, MdAutoAwesome } from 'react-icons/md';
import { useCreateBlogMutation } from '../../../features/api/blogApi';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../../../components/RichTextEditor';
import { generateKeywords, generateSEOTitle, generateSEODescription } from '../../../utils/keywordGenerator';

const CreateBlog = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [createBlog, { isLoading }] = useCreateBlogMutation();

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'General',
    tags: '',
    status: 'draft',
    isFeatured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  // Auto-generate SEO content and keywords
  const autoGenerateSEO = () => {
    const keywords = generateKeywords(formData.title, formData.excerpt);
    const seoTitle = generateSEOTitle(formData.title);
    const seoDescription = generateSEODescription(formData.excerpt);
    
    setFormData(prev => ({
      ...prev,
      seoTitle: seoTitle,
      seoDescription: seoDescription,
      seoKeywords: keywords.join(', ')
    }));
    
    toast({
      title: 'SEO Content Generated',
      description: 'Keywords and SEO content have been automatically generated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'title') {
      const slug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: slug,
        seoTitle: prev.seoTitle || generateSEOTitle(value),
        seoDescription: prev.seoDescription || prev.excerpt
      }));
    } else if (name === 'excerpt') {
      setFormData(prev => ({
        ...prev,
        excerpt: value,
        seoDescription: prev.seoDescription || generateSEODescription(value)
      }));
    } else if (name === 'isFeatured') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle featured image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setFeaturedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove featured image
  const removeFeaturedImage = () => {
    setFeaturedImage(null);
    setFeaturedImagePreview(null);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!featuredImage) {
      newErrors.featuredImage = 'Featured image is required';
    }
    
    // SEO validation
    if (formData.seoTitle && formData.seoTitle.length > 60) {
      newErrors.seoTitle = 'SEO title must be 60 characters or less';
    }
    if (formData.seoDescription && formData.seoDescription.length > 160) {
      newErrors.seoDescription = 'SEO description must be 160 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      // Append featured image
      if (featuredImage) {
        submitData.append('featuredImage', featuredImage);
      }

      const result = await createBlog(submitData).unwrap();

      toast({
        title: 'Success',
        description: 'Blog created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/admin/blogs');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to create blog',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle reset
  const handleReset = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'General',
      tags: '',
      status: 'draft',
      isFeatured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    });
    setFeaturedImage(null);
    setFeaturedImagePreview(null);
    setErrors({});
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.700">
            Create New Blog
          </Text>
          <Text fontSize="sm" color={textColor}>
            Create a new blog post with rich content and SEO optimization
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            {/* Main Content */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="semibold">Basic Information</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl isInvalid={errors.title}>
                        <FormLabel>Title *</FormLabel>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter blog title"
                          bg={inputBg}
                        />
                        <FormErrorMessage>{errors.title}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.slug}>
                        <FormLabel>Slug *</FormLabel>
                        <Input
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          placeholder="blog-slug-url"
                          bg={inputBg}
                        />
                        <FormHelperText>URL-friendly version of the title</FormHelperText>
                        <FormErrorMessage>{errors.slug}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.excerpt}>
                        <FormLabel>Excerpt *</FormLabel>
                        <Textarea
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          placeholder="Brief description of the blog post"
                          rows={3}
                          bg={inputBg}
                        />
                        <FormHelperText>Short summary that appears in blog listings</FormHelperText>
                        <FormErrorMessage>{errors.excerpt}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.content}>
                        <FormLabel>Content *</FormLabel>
                        <RichTextEditor
                          value={formData.content}
                          onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                          placeholder="Write your blog content here..."
                        />
                        <FormHelperText>Rich text editor with formatting options</FormHelperText>
                        <FormErrorMessage>{errors.content}</FormErrorMessage>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Featured Image */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="semibold">Featured Image</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {!featuredImagePreview ? (
                        <Box
                          border="2px dashed"
                          borderColor={borderColor}
                          borderRadius="md"
                          p={8}
                          textAlign="center"
                          cursor="pointer"
                          _hover={{ borderColor: 'blue.300' }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            id="featured-image-upload"
                          />
                          <label htmlFor="featured-image-upload">
                            <VStack spacing={2}>
                              <Icon as={MdImage} boxSize={8} color="gray.400" />
                              <Text color={textColor}>Click to upload featured image</Text>
                              <Text fontSize="sm" color="gray.500">
                                PNG, JPG, GIF up to 5MB
                              </Text>
                            </VStack>
                          </label>
                        </Box>
                      ) : (
                        <Box position="relative">
                          <Image
                            src={featuredImagePreview}
                            alt="Featured image preview"
                            borderRadius="md"
                            maxH="300px"
                            objectFit="cover"
                            w="100%"
                          />
                          <IconButton
                            icon={<CloseButton />}
                            position="absolute"
                            top={2}
                            right={2}
                            size="sm"
                            colorScheme="red"
                            variant="solid"
                            onClick={removeFeaturedImage}
                          />
                        </Box>
                      )}
                      {errors.featuredImage && (
                        <Text color="red.500" fontSize="sm">{errors.featuredImage}</Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>

            {/* Sidebar */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Blog Settings */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="semibold">Blog Settings</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl isInvalid={errors.category}>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          bg={inputBg}
                        >
                          <option value="Health Tips">Health Tips</option>
                          <option value="Hearing Care">Hearing Care</option>
                          <option value="Technology">Technology</option>
                          <option value="News">News</option>
                          <option value="General">General</option>
                          <option value="Research">Research</option>
                          <option value="Patient Stories">Patient Stories</option>
                        </Select>
                        <FormErrorMessage>{errors.category}</FormErrorMessage>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Tags</FormLabel>
                        <Input
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          placeholder="tag1, tag2, tag3"
                          bg={inputBg}
                        />
                        <FormHelperText>Separate tags with commas</FormHelperText>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          bg={inputBg}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <HStack justify="space-between">
                          <FormLabel mb={0}>Featured Blog</FormLabel>
                          <Switch
                            name="isFeatured"
                            isChecked={formData.isFeatured}
                            onChange={handleInputChange}
                            colorScheme="blue"
                          />
                        </HStack>
                        <FormHelperText>Show this blog in featured section</FormHelperText>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* SEO Settings */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="lg" fontWeight="semibold">SEO Settings</Text>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon as={MdAutoAwesome} />}
                        onClick={autoGenerateSEO}
                        colorScheme="blue"
                        _hover={{ 
                          bg: "#2BA8D1", 
                          color: "white",
                          transform: "translateY(-2px)",
                          boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                        }}
                      >
                        Auto Generate
                      </Button>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl isInvalid={errors.seoTitle}>
                        <FormLabel>SEO Title</FormLabel>
                        <Input
                          name="seoTitle"
                          value={formData.seoTitle}
                          onChange={handleInputChange}
                          placeholder="SEO optimized title"
                          bg={inputBg}
                        />
                        <FormHelperText>Max 60 characters ({formData.seoTitle.length}/60)</FormHelperText>
                        <FormErrorMessage>{errors.seoTitle}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.seoDescription}>
                        <FormLabel>SEO Description</FormLabel>
                        <Textarea
                          name="seoDescription"
                          value={formData.seoDescription}
                          onChange={handleInputChange}
                          placeholder="SEO description"
                          rows={3}
                          bg={inputBg}
                        />
                        <FormHelperText>Max 160 characters ({formData.seoDescription.length}/160)</FormHelperText>
                        <FormErrorMessage>{errors.seoDescription}</FormErrorMessage>
                      </FormControl>

                      <FormControl>
                        <FormLabel>SEO Keywords</FormLabel>
                        <Input
                          name="seoKeywords"
                          value={formData.seoKeywords}
                          onChange={handleInputChange}
                          placeholder="keyword1, keyword2, keyword3"
                          bg={inputBg}
                        />
                        <FormHelperText>Separate keywords with commas</FormHelperText>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Actions */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Button
                        type="submit"
                        bg="#2BA8D1"
                        color="white"
                        _hover={{ bg: '#0C2F4D' }}
                        leftIcon={<Icon as={MdSave} />}
                        isLoading={isLoading}
                        loadingText="Creating..."
                        size="lg"
                      >
                        Create Blog
                      </Button>
                      
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        borderColor="#2BA8D1"
                        color="#2BA8D1"
                        _hover={{ 
                          bg: "#2BA8D1", 
                          color: "white",
                          transform: "translateY(-2px)",
                          boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                        }}
                        leftIcon={<Icon as={MdCancel} />}
                        size="lg"
                      >
                        Reset Form
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </Grid>
        </form>
      </VStack>
    </Box>
  );
};

export default CreateBlog;
