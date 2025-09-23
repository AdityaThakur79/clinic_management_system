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
  Switch,
  FormErrorMessage,
  Icon,
  Flex
} from '@chakra-ui/react';
import { useCreateInventoryMutation } from '../../../features/api/inventoryApi';
import { useGetAllBranchesQuery, useGetBranchByIdMutation } from '../../../features/api/branchApi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdSave, MdArrowBack, MdAdd, MdWarning } from 'react-icons/md';

const CreateInventory = () => {
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
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);

  const [createInventory, { isLoading }] = useCreateInventoryMutation();
  const { data: branchesData } = useGetAllBranchesQuery({ page: 1, limit: 100, search: '' });
  const [getBranchById] = useGetBranchByIdMutation();

  // Set default branchId based on user's role
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';
  const isScopedToBranch = !!userBranchId && (userRole === 'branchAdmin' || userRole === 'doctor');
  const [branchLabel, setBranchLabel] = useState('');

  useEffect(() => {
    if (isScopedToBranch) {
      setFormData(prev => ({ ...prev, branchId: userBranchId }));
      (async () => {
        try {
          const res = await getBranchById({ id: userBranchId }).unwrap();
          if (res?.branch?.branchName) setBranchLabel(res.branch.branchName);
        } catch (e) {}
      })();
    }
  }, [isScopedToBranch, userBranchId, getBranchById]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

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
    if (!formData.branchId) {
      newErrors.branchId = 'Branch selection is required';
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
      const result = await createInventory(formData).unwrap();
      
      toast({
        title: 'Success',
        description: 'Inventory item created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/admin/inventory/list');
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create inventory item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
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
      branchId: user?.branch?._id || user?.branch || '',
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
      notes: ''
    });
    setErrors({});
  };

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
          <VStack spacing={8} align="stretch">
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
                  <Text fontSize="lg" fontWeight="semibold">
                    Branch Selection
                  </Text>
                </CardHeader>
                <CardBody>
                  <FormControl isRequired isInvalid={errors.branchId}>
                    <FormLabel>Select Branch</FormLabel>
                    <Select
                      value={formData.branchId}
                      onChange={(e) => handleInputChange('branchId', e.target.value)}
                      placeholder="Select branch for this inventory item"
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
                        value={formData.quantity}
                        isReadOnly
                        bg="gray.100"
                        placeholder="Auto-calculated"
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
                _hover={{
                  bg: "gray.100",
                  transform: "translateY(-2px)",
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)"
                }}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                leftIcon={<Icon as={MdSave} />}
                isLoading={isSubmitting || isLoading}
                loadingText="Creating..."
                bg="#2BA8D1"
                color="white"
                _hover={{
                  bg: '#0C2F4D',
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
                }}
              >
                Create Inventory Item
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default CreateInventory;