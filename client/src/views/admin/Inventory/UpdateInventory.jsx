import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  Icon,
  Flex,
  Spinner,
  Center,
  Image,
  IconButton,
  CloseButton,
  SimpleGrid,
  Badge
} from '@chakra-ui/react';
import { useUpdateInventoryMutation, useGetInventoryByIdQuery } from '../../../features/api/inventoryApi';
import { useGetAllBranchesQuery, useGetBranchByIdMutation } from '../../../features/api/branchApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdSave, MdArrowBack, MdWarning, MdEdit, MdAdd, MdClose } from 'react-icons/md';

const UpdateInventory = () => {
  const location = useLocation();
  const inventory = location.state?.inventory;
  const inventoryId = inventory?._id;

  const [formData, setFormData] = useState({
    deviceName: '',
    model: '',
    brand: '',
    serialNumber: '',
    category: 'Medical Equipment',
    quantity: 0,
    unit: 'pieces',
    threshold: 5,
    costPrice: 0,
    sellingPrice: 0,
    branchId: '',
    supplier: {
      name: '',
      contact: '',
      email: ''
    },
    location: {
      room: '',
      shelf: '',
      position: ''
    },
    status: 'Active',
    condition: 'Good',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: '',
    description: '',
    deviceImage: {
      publicId: '',
      url: ''
    },
    dosAndDonts: {
      dos: [''],
      donts: ['']
    },
    careInstructions: '',
    warrantyInfo: {
      duration: '',
      conditions: ''
    },
    troubleshooting: [{
      issue: '',
      solution: ''
    }],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);

  const [updateInventory, { isLoading }] = useUpdateInventoryMutation();
  const { data: inventoryData, isLoading: isLoadingInventory } = useGetInventoryByIdQuery(inventoryId, {
    skip: !inventoryId
  });
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [getBranchById] = useGetBranchByIdMutation();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';
  const isScopedToBranch = !!userBranchId && (userRole === 'branchAdmin' || userRole === 'doctor');
  const [branchLabel, setBranchLabel] = useState('');

  useEffect(() => {
    if (isScopedToBranch) {
      setFormData(prev => ({ ...prev, branchId: prev.branchId || userBranchId }));
      (async () => {
        try {
          const res = await getBranchById({ id: userBranchId }).unwrap();
          if (res?.branch?.branchName) setBranchLabel(res.branch.branchName);
        } catch (e) {}
      })();
    }
  }, [isScopedToBranch, userBranchId, getBranchById]);

  const categories = [
    'Medical Equipment',
    'Surgical Instruments',
    'Diagnostic Tools',
    'Therapeutic Devices',
    'Laboratory Equipment',
    'Office Equipment',
    'IT Equipment',
    'Furniture',
    'Consumables',
    'Other'
  ];

  const units = [
    'pieces',
    'boxes',
    'units',
    'packs',
    'liters',
    'kg',
    'grams',
    'meters',
    'sets'
  ];

  const statuses = ['Active', 'Inactive', 'Maintenance', 'Disposed', 'Lost'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

  // Initialize form data when inventory data is loaded
  useEffect(() => {
    if (inventoryData?.inventory) {
      const inv = inventoryData.inventory;
      console.log('Inventory data received:', inv);
      console.log('Device image data:', inv.deviceImage);
      setFormData({
        deviceName: inv.deviceName || '',
        model: inv.model || '',
        brand: inv.brand || '',
        serialNumber: inv.serialNumber || '',
        category: inv.category || 'Medical Equipment',
        quantity: inv.quantity || 0,
        unit: inv.unit || 'pieces',
        threshold: inv.threshold || 5,
        costPrice: inv.costPrice || 0,
        sellingPrice: inv.sellingPrice || 0,
        branchId: inv.branchId || '',
        supplier: {
          name: inv.supplier?.name || '',
          contact: inv.supplier?.contact || '',
          email: inv.supplier?.email || ''
        },
        location: {
          room: inv.location?.room || '',
          shelf: inv.location?.shelf || '',
          position: inv.location?.position || ''
        },
        status: inv.status || 'Active',
        condition: inv.condition || 'Good',
        purchaseDate: inv.purchaseDate ? new Date(inv.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        warrantyExpiry: inv.warrantyExpiry ? new Date(inv.warrantyExpiry).toISOString().split('T')[0] : '',
        description: inv.description || '',
        deviceImage: {
          publicId: inv.deviceImage?.publicId || '',
          url: inv.deviceImage?.url || ''
        },
        dosAndDonts: {
          dos: inv.dosAndDonts?.dos || [''],
          donts: inv.dosAndDonts?.donts || ['']
        },
        careInstructions: inv.careInstructions || '',
        warrantyInfo: {
          duration: inv.warrantyInfo?.duration || '',
          conditions: inv.warrantyInfo?.conditions || ''
        },
        troubleshooting: inv.troubleshooting || [{ issue: '', solution: '' }],
        notes: inv.notes || ''
      });
    }
  }, [inventoryData]);

  // If no inventory data and not loading, redirect back
  useEffect(() => {
    if (!inventoryId && !isLoadingInventory) {
      navigate('/admin/inventory/list');
    }
  }, [inventoryId, isLoadingInventory, navigate]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Image upload handler
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

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

    // Validate file size (max 5MB)
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

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      deviceImage: {
        ...prev.deviceImage,
        file: file,
        preview: previewUrl
      }
    }));

    toast({
      title: 'Image selected',
      description: 'Image will be uploaded when you save the inventory item',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle button click to trigger file input
  const handleUploadClick = () => {
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.click();
    }
  };

  // Remove image handler
  const handleRemoveImage = () => {
    // Clean up preview URL if it exists
    if (formData.deviceImage?.preview) {
      URL.revokeObjectURL(formData.deviceImage.preview);
    }
    
    setFormData(prev => ({
      ...prev,
      deviceImage: {
        publicId: '',
        url: ''
      }
    }));
  };

  // Dos and Don'ts handlers
  const addDosItem = () => {
    setFormData(prev => ({
      ...prev,
      dosAndDonts: {
        ...prev.dosAndDonts,
        dos: [...prev.dosAndDonts.dos, '']
      }
    }));
  };

  const removeDosItem = (index) => {
    setFormData(prev => ({
      ...prev,
      dosAndDonts: {
        ...prev.dosAndDonts,
        dos: prev.dosAndDonts.dos.filter((_, i) => i !== index)
      }
    }));
  };

  const updateDosItem = (index, value) => {
    setFormData(prev => ({
      ...prev,
      dosAndDonts: {
        ...prev.dosAndDonts,
        dos: prev.dosAndDonts.dos.map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addDontsItem = () => {
    setFormData(prev => ({
      ...prev,
      dosAndDonts: {
        ...prev.dosAndDonts,
        donts: [...prev.dosAndDonts.donts, '']
      }
    }));
  };

  const removeDontsItem = (index) => {
    setFormData(prev => ({
      ...prev,
      dosAndDonts: {
        ...prev.dosAndDonts,
        donts: prev.dosAndDonts.donts.filter((_, i) => i !== index)
      }
    }));
  };

  const updateDontsItem = (index, value) => {
    setFormData(prev => ({
      ...prev,
      dosAndDonts: {
        ...prev.dosAndDonts,
        donts: prev.dosAndDonts.donts.map((item, i) => i === index ? value : item)
      }
    }));
  };

  // Troubleshooting handlers
  const addTroubleshootingItem = () => {
    setFormData(prev => ({
      ...prev,
      troubleshooting: [...prev.troubleshooting, { issue: '', solution: '' }]
    }));
  };

  const removeTroubleshootingItem = (index) => {
    setFormData(prev => ({
      ...prev,
      troubleshooting: prev.troubleshooting.filter((_, i) => i !== index)
    }));
  };

  const updateTroubleshootingItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      troubleshooting: prev.troubleshooting.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.deviceName.trim()) {
      newErrors.deviceName = 'Device name is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    if (formData.threshold < 0) {
      newErrors.threshold = 'Threshold cannot be negative';
    }
    if (formData.costPrice < 0) {
      newErrors.costPrice = 'Cost price cannot be negative';
    }
    if (formData.sellingPrice < 0) {
      newErrors.sellingPrice = 'Selling price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('id', inventoryId);
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'deviceImage') {
          // Handle device image file
          if (formData.deviceImage?.file) {
            submitData.append('deviceImage', formData.deviceImage.file);
          }
        } else if (key === 'dosAndDonts' || key === 'warrantyInfo' || key === 'troubleshooting') {
          // Stringify JSON fields
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          // Add other fields as strings
          submitData.append(key, formData[key]);
        }
      });

      const result = await updateInventory({
        id: inventoryId,
        body: submitData
      }).unwrap();
      
      toast({
        title: 'Success',
        description: 'Inventory item updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/admin/inventory/list');
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update inventory item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (inventoryData?.inventory) {
      const inv = inventoryData.inventory;
      setFormData({
        deviceName: inv.deviceName || '',
        model: inv.model || '',
        brand: inv.brand || '',
        serialNumber: inv.serialNumber || '',
        category: inv.category || 'Medical Equipment',
        quantity: inv.quantity || 0,
        unit: inv.unit || 'pieces',
        threshold: inv.threshold || 5,
        costPrice: inv.costPrice || 0,
        sellingPrice: inv.sellingPrice || 0,
        branchId: inv.branchId || '',
        supplier: {
          name: inv.supplier?.name || '',
          contact: inv.supplier?.contact || '',
          email: inv.supplier?.email || ''
        },
        location: {
          room: inv.location?.room || '',
          shelf: inv.location?.shelf || '',
          position: inv.location?.position || ''
        },
        status: inv.status || 'Active',
        condition: inv.condition || 'Good',
        purchaseDate: inv.purchaseDate ? new Date(inv.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        warrantyExpiry: inv.warrantyExpiry ? new Date(inv.warrantyExpiry).toISOString().split('T')[0] : '',
        description: inv.description || '',
        deviceImage: {
          publicId: inv.deviceImage?.publicId || '',
          url: inv.deviceImage?.url || ''
        },
        dosAndDonts: {
          dos: inv.dosAndDonts?.dos || [''],
          donts: inv.dosAndDonts?.donts || ['']
        },
        careInstructions: inv.careInstructions || '',
        warrantyInfo: {
          duration: inv.warrantyInfo?.duration || '',
          conditions: inv.warrantyInfo?.conditions || ''
        },
        troubleshooting: inv.troubleshooting || [{ issue: '', solution: '' }],
        notes: inv.notes || ''
      });
    }
    setErrors({});
  };

  if (isLoadingInventory) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading inventory item...</Text>
        </VStack>
      </Center>
    );
  }

  if (!inventoryData?.inventory) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            Inventory item not found. Please try again.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          
          <Button
            leftIcon={<Icon as={MdArrowBack} />}
            variant="outline"
            onClick={() => navigate('/admin/inventory/list')}
            _hover={{
              bg: "#2BA8D1",
              color: "white",
              transform: "translateY(-2px)",
              boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
            }}
          >
            Back to Inventory
          </Button>
        </Flex>

        {/* Low Stock Warning */}
        {formData.quantity <= formData.threshold && formData.quantity > 0 && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Low Stock Alert!</AlertTitle>
              <AlertDescription>
                The quantity ({formData.quantity}) is at or below the threshold ({formData.threshold}). 
                Consider increasing the quantity or adjusting the threshold.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Basic Information
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl isRequired isInvalid={errors.deviceName}>
                      <FormLabel>Device Name</FormLabel>
                      <Input
                        value={formData.deviceName}
                        onChange={(e) => handleInputChange('deviceName', e.target.value)}
                        placeholder="Enter device name"
                      />
                      <FormErrorMessage>{errors.deviceName}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isRequired isInvalid={errors.model}>
                      <FormLabel>Model</FormLabel>
                      <Input
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        placeholder="Enter model"
                      />
                      <FormErrorMessage>{errors.model}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Brand</FormLabel>
                      <Input
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="Enter brand"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Serial Number</FormLabel>
                      <Input
                        value={formData.serialNumber}
                        onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                        placeholder="Enter serial number"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isRequired isInvalid={errors.category}>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.category}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        value={formData.unit}
                        onChange={(e) => handleInputChange('unit', e.target.value)}
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Branch Selection or Display depending on role */}
            {userRole === 'superAdmin' ? (
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader bg={headerBg}>
                  <Text fontSize="lg" fontWeight="semibold">Branch Selection</Text>
                </CardHeader>
                <CardBody>
                  <FormControl isInvalid={errors.branchId}>
                    <FormLabel>Select Branch</FormLabel>
                    <Select
                      value={formData.branchId}
                      onChange={(e) => handleInputChange('branchId', e.target.value)}
                      placeholder="Select branch"
                    >
                      {branchesData?.branches?.map(branch => (
                        <option key={branch._id} value={branch._id}>
                          {branch.branchName} - {branch.address}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.branchId}</FormErrorMessage>
                  </FormControl>
                </CardBody>
              </Card>
            ) : (
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader bg={headerBg}>
                  <Text fontSize="lg" fontWeight="semibold">Branch</Text>
                </CardHeader>
                <CardBody>
                  <Input value={branchLabel || user?.branch?.branchName || 'Current Branch'} isReadOnly />
                </CardBody>
              </Card>
            )}

            {/* Stock Information */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Stock Information
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl isRequired isInvalid={errors.quantity}>
                      <FormLabel>Quantity</FormLabel>
                      <NumberInput
                        value={formData.quantity}
                        onChange={(value) => handleInputChange('quantity', parseInt(value) || 0)}
                        min={0}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{errors.quantity}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isRequired isInvalid={errors.threshold}>
                      <FormLabel>Threshold (Low Stock Alert)</FormLabel>
                      <NumberInput
                        value={formData.threshold}
                        onChange={(value) => handleInputChange('threshold', parseInt(value) || 0)}
                        min={0}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{errors.threshold}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Current Stock</FormLabel>
                      <Input
                        value={inventoryData?.inventory?.currentStock || 0}
                        isReadOnly
                        bg="gray.100"
                        placeholder="Current stock"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Pricing Information */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Pricing Information
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl isInvalid={errors.costPrice}>
                      <FormLabel>Cost Price (₹)</FormLabel>
                      <NumberInput
                        value={formData.costPrice}
                        onChange={(value) => handleInputChange('costPrice', parseFloat(value) || 0)}
                        min={0}
                        precision={2}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{errors.costPrice}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={errors.sellingPrice}>
                      <FormLabel>Selling Price (₹)</FormLabel>
                      <NumberInput
                        value={formData.sellingPrice}
                        onChange={(value) => handleInputChange('sellingPrice', parseFloat(value) || 0)}
                        min={0}
                        precision={2}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{errors.sellingPrice}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Supplier Information */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Supplier Information
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Supplier Name</FormLabel>
                      <Input
                        value={formData.supplier.name}
                        onChange={(e) => handleInputChange('supplier.name', e.target.value)}
                        placeholder="Enter supplier name"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Contact Number</FormLabel>
                      <Input
                        value={formData.supplier.contact}
                        onChange={(e) => handleInputChange('supplier.contact', e.target.value)}
                        placeholder="Enter contact number"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={formData.supplier.email}
                        onChange={(e) => handleInputChange('supplier.email', e.target.value)}
                        placeholder="Enter email"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Location Information */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Location Information
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Room</FormLabel>
                      <Input
                        value={formData.location.room}
                        onChange={(e) => handleInputChange('location.room', e.target.value)}
                        placeholder="Enter room"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Shelf</FormLabel>
                      <Input
                        value={formData.location.shelf}
                        onChange={(e) => handleInputChange('location.shelf', e.target.value)}
                        placeholder="Enter shelf"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Position</FormLabel>
                      <Input
                        value={formData.location.position}
                        onChange={(e) => handleInputChange('location.position', e.target.value)}
                        placeholder="Enter position"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Status and Condition */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Status & Condition
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Condition</FormLabel>
                      <Select
                        value={formData.condition}
                        onChange={(e) => handleInputChange('condition', e.target.value)}
                      >
                        {conditions.map(condition => (
                          <option key={condition} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Dates */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Important Dates
                </Text>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Purchase Date</FormLabel>
                      <Input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Warranty Expiry</FormLabel>
                      <Input
                        type="date"
                        value={formData.warrantyExpiry}
                        onChange={(e) => handleInputChange('warrantyExpiry', e.target.value)}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Device Image */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Device Image
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {(formData.deviceImage?.url || formData.deviceImage?.preview) ? (
                    <Box position="relative" display="inline-block">
                      <Image
                        src={formData.deviceImage.preview || formData.deviceImage.url}
                        alt="Device preview"
                        maxW="200px"
                        maxH="200px"
                        objectFit="contain"
                        borderRadius="md"
                        border="1px solid"
                        borderColor={borderColor}
                      />
                      <IconButton
                        aria-label="Remove image"
                        icon={<Icon as={MdClose} />}
                        size="sm"
                        colorScheme="red"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={handleRemoveImage}
                      />
                    </Box>
                  ) : (
                    <Box
                      border="2px dashed"
                      borderColor={borderColor}
                      borderRadius="md"
                      p={8}
                      textAlign="center"
                    >
                      <Text color="gray.500" mb={4}>
                        No image selected
                      </Text>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        id="image-upload"
                        size="sm"
                        mb={2}
                      />
                      <Button
                        as="label"
                        htmlFor="image-upload"
                        colorScheme="blue"
                        variant="outline"
                        cursor="pointer"
                        onClick={handleUploadClick}
                        _hover={{
                          bg: "blue.500",
                          color: "white",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                        }}
                        _active={{
                          bg: "blue.600",
                          color: "white",
                          transform: "translateY(0px)"
                        }}
                      >
                        Upload Device Image
                      </Button>
                    </Box>
                  )}
                  {!formData.deviceImage?.url && !formData.deviceImage?.preview && (
                    <VStack spacing={2}>
                      <Text fontSize="sm" color="gray.500">
                        Upload a clear image of the device (max 5MB)
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          console.log('Test button clicked');
                          const fileInput = document.getElementById('image-upload');
                          console.log('File input found:', fileInput);
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      >
                        Test File Input
                      </Button>
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Dos and Don'ts */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Care Guidelines
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {/* Dos */}
                    <Box>
                      <HStack justify="space-between" mb={4}>
                        <Text fontWeight="semibold" color="green.600">
                          ✓ DO's
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="green"
                          variant="outline"
                          leftIcon={<Icon as={MdAdd} />}
                          onClick={addDosItem}
                          _hover={{
                            bg: "green.500",
                            color: "white",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)"
                          }}
                          _active={{
                            bg: "green.600",
                            color: "white",
                            transform: "translateY(0px)"
                          }}
                        >
                          Add
                        </Button>
                      </HStack>
                      <VStack spacing={2} align="stretch">
                        {formData.dosAndDonts.dos.map((item, index) => (
                          <HStack key={index}>
                            <Input
                              value={item}
                              onChange={(e) => updateDosItem(index, e.target.value)}
                              placeholder="Enter a DO item"
                              size="sm"
                            />
                            <IconButton
                              aria-label="Remove DO item"
                              icon={<Icon as={MdClose} />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeDosItem(index)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    </Box>

                    {/* Don'ts */}
                    <Box>
                      <HStack justify="space-between" mb={4}>
                        <Text fontWeight="semibold" color="red.600">
                          ✗ DON'Ts
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          leftIcon={<Icon as={MdAdd} />}
                          onClick={addDontsItem}
                          _hover={{
                            bg: "red.500",
                            color: "white",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                          }}
                          _active={{
                            bg: "red.600",
                            color: "white",
                            transform: "translateY(0px)"
                          }}
                        >
                          Add
                        </Button>
                      </HStack>
                      <VStack spacing={2} align="stretch">
                        {formData.dosAndDonts.donts.map((item, index) => (
                          <HStack key={index}>
                            <Input
                              value={item}
                              onChange={(e) => updateDontsItem(index, e.target.value)}
                              placeholder="Enter a DON'T item"
                              size="sm"
                            />
                            <IconButton
                              aria-label="Remove DON'T item"
                              icon={<Icon as={MdClose} />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeDontsItem(index)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Care Instructions */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Care Instructions
                </Text>
              </CardHeader>
              <CardBody>
                <FormControl>
                  <FormLabel>Detailed Care Instructions</FormLabel>
                  <Textarea
                    value={formData.careInstructions}
                    onChange={(e) => handleInputChange('careInstructions', e.target.value)}
                    placeholder="Enter detailed care instructions for the device..."
                    rows={4}
                  />
                </FormControl>
              </CardBody>
            </Card>

            {/* Warranty Information */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Warranty Information
                </Text>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Warranty Duration</FormLabel>
                    <Input
                      value={formData.warrantyInfo.duration}
                      onChange={(e) => handleInputChange('warrantyInfo.duration', e.target.value)}
                      placeholder="e.g., 2 years, 6 months"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Warranty Conditions</FormLabel>
                    <Textarea
                      value={formData.warrantyInfo.conditions}
                      onChange={(e) => handleInputChange('warrantyInfo.conditions', e.target.value)}
                      placeholder="Enter warranty terms and conditions..."
                      rows={3}
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Troubleshooting */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">
                    Troubleshooting Guide
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    leftIcon={<Icon as={MdAdd} />}
                    onClick={addTroubleshootingItem}
                    _hover={{
                      bg: "blue.500",
                      color: "white",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                    }}
                    _active={{
                      bg: "blue.600",
                      color: "white",
                      transform: "translateY(0px)"
                    }}
                  >
                    Add Issue
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {formData.troubleshooting.map((item, index) => (
                    <Box key={index} p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                      <HStack justify="space-between" mb={3}>
                        <Text fontWeight="medium">Issue #{index + 1}</Text>
                        <IconButton
                          aria-label="Remove troubleshooting item"
                          icon={<Icon as={MdClose} />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeTroubleshootingItem(index)}
                        />
                      </HStack>
                      <VStack spacing={3} align="stretch">
                        <FormControl>
                          <FormLabel fontSize="sm">Issue Description</FormLabel>
                          <Input
                            value={item.issue}
                            onChange={(e) => updateTroubleshootingItem(index, 'issue', e.target.value)}
                            placeholder="Describe the issue..."
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Solution</FormLabel>
                          <Textarea
                            value={item.solution}
                            onChange={(e) => updateTroubleshootingItem(index, 'solution', e.target.value)}
                            placeholder="Provide the solution..."
                            rows={2}
                            size="sm"
                          />
                        </FormControl>
                      </VStack>
                    </Box>
                  ))}
                  {formData.troubleshooting.length === 0 && (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No troubleshooting items added yet
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Additional Information */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader bg={headerBg}>
                <Text fontSize="lg" fontWeight="semibold">
                  Additional Information
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Enter any additional notes"
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <HStack spacing={4} justify="flex-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                color="gray.700"
                borderColor="gray.300"
                _hover={{
                  bg: "#2BA8D1",
                  color: "white",
                  borderColor: "#2BA8D1",
                  transform: "translateY(-2px)",
                  boxShadow: "0 5px 15px rgba(43, 168, 209, 0.3)"
                }}
                _active={{
                  bg: "#0C2F4D",
                  color: "white",
                  transform: "translateY(0px)"
                }}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                leftIcon={<Icon as={MdSave} />}
                isLoading={isSubmitting || isLoading}
                loadingText="Updating..."
                bg="#2BA8D1"
                color="white"
                _hover={{
                  bg: '#0C2F4D',
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}
                _active={{
                  bg: '#0C2F4D',
                  color: "white",
                  transform: "translateY(0px)"
                }}
              >
                Update Inventory Item
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default UpdateInventory;
