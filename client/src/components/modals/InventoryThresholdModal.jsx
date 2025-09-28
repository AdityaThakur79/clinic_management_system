import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Icon
} from '@chakra-ui/react';
import { 
  WarningIcon, 
  InfoIcon, 
  EmailIcon,
  CheckIcon,
  CloseIcon
} from '@chakra-ui/icons';
import { useCheckInventoryThresholdsQuery, useSendInventoryAlertsMutation } from '../../features/api/inventoryApi';

const InventoryThresholdModal = ({ isOpen, onClose, branchId = null }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSendingAlerts, setIsSendingAlerts] = useState(false);
  
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch threshold data
  const { 
    data: thresholdData, 
    isLoading, 
    error, 
    refetch 
  } = useCheckInventoryThresholdsQuery(
    { branchId },
    { skip: !isOpen }
  );

  const [sendAlerts] = useSendInventoryAlertsMutation();

  // Reset selected items when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedItems([]);
      refetch();
    }
  }, [isOpen, refetch]);

  // Auto-select all items when data loads
  useEffect(() => {
    if (thresholdData?.lowStockItems && Array.isArray(thresholdData.lowStockItems) && thresholdData.lowStockItems.length > 0) {
      setSelectedItems(thresholdData.lowStockItems.map(item => item?._id).filter(id => id));
    }
  }, [thresholdData]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(thresholdData?.lowStockItems?.map(item => item?._id).filter(id => id) || []);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSendAlerts = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one item to send alerts for.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSendingAlerts(true);
    try {
      const result = await sendAlerts({ branchId }).unwrap();
      
      toast({
        title: 'Alerts sent successfully!',
        description: `Inventory alerts sent to ${result.alertResult?.results?.length || 0} recipients for ${result.itemsCount || 0} items.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Failed to send alerts',
        description: error?.data?.message || 'Something went wrong while sending alerts.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSendingAlerts(false);
    }
  };

  const getStockStatusColor = (item) => {
    if (item.currentStock === 0) return 'red';
    if (item.currentStock <= item.threshold) return 'orange';
    return 'green';
  };

  const getStockStatusText = (item) => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock <= item.threshold) return 'Low Stock';
    return 'In Stock';
  };

  const lowStockItems = thresholdData?.lowStockItems || [];
  const outOfStockItems = lowStockItems.filter(item => item && item.currentStock === 0);
  const lowStockOnlyItems = lowStockItems.filter(item => item && item.currentStock > 0 && item.currentStock <= item.threshold);

  // Debug logging
  useEffect(() => {
    if (thresholdData) {
      console.log('🔍 Modal threshold data:', thresholdData);
      console.log('🔍 Low stock items:', lowStockItems);
    }
  }, [thresholdData, lowStockItems]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bg} maxH="90vh">
        <ModalHeader bg={headerBg} borderBottomWidth="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Icon as={WarningIcon} color="orange.500" boxSize={6} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="bold">Inventory Threshold Alert</Text>
              <Text fontSize="sm" color="gray.600">
                {thresholdData?.statistics ? 
                  `${thresholdData.statistics.lowStockItems + thresholdData.statistics.outOfStockItems} items need attention` :
                  'Checking inventory levels...'
                }
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={6}>
          {isLoading ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Spinner size="xl" color="orange.500" />
                <Text color="gray.600">Checking inventory thresholds...</Text>
              </VStack>
            </Center>
          ) : error ? (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Error loading inventory data!</AlertTitle>
                <AlertDescription>
                  {error?.data?.message || 'Something went wrong while loading inventory thresholds.'}
                </AlertDescription>
              </Box>
            </Alert>
          ) : lowStockItems.length === 0 ? (
            <Alert status="success" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>All good!</AlertTitle>
                <AlertDescription>
                  No inventory items are currently at or below their threshold levels.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <VStack spacing={6} align="stretch">
              {/* Statistics */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat textAlign="center" p={4} bg="orange.50" borderRadius="lg">
                  <StatLabel color="orange.600">Low Stock</StatLabel>
                  <StatNumber color="orange.600">{lowStockOnlyItems.length}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Items below threshold
                  </StatHelpText>
                </Stat>
                <Stat textAlign="center" p={4} bg="red.50" borderRadius="lg">
                  <StatLabel color="red.600">Out of Stock</StatLabel>
                  <StatNumber color="red.600">{outOfStockItems.length}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Zero inventory
                  </StatHelpText>
                </Stat>
                <Stat textAlign="center" p={4} bg="blue.50" borderRadius="lg">
                  <StatLabel color="blue.600">Total Items</StatLabel>
                  <StatNumber color="blue.600">{thresholdData?.statistics?.totalItems || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    In inventory
                  </StatHelpText>
                </Stat>
                <Stat textAlign="center" p={4} bg="green.50" borderRadius="lg">
                  <StatLabel color="green.600">Total Value</StatLabel>
                  <StatNumber color="green.600">₹{thresholdData?.statistics?.totalValue?.toLocaleString('en-IN') || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Inventory value
                  </StatHelpText>
                </Stat>
              </SimpleGrid>

              <Divider />

              {/* Action Bar */}
              <HStack justify="space-between" wrap="wrap" gap={4}>
                <HStack spacing={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<CheckIcon />}
                    onClick={() => handleSelectAll(true)}
                    isDisabled={lowStockItems.length === 0}
                  >
                    Select All ({lowStockItems.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<CloseIcon />}
                    onClick={() => handleSelectAll(false)}
                    isDisabled={selectedItems.length === 0}
                  >
                    Deselect All
                  </Button>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {selectedItems.length} of {lowStockItems.length} items selected
                </Text>
              </HStack>

              {/* Out of Stock Items */}
              {outOfStockItems.length > 0 && (
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="red.600" mb={3}>
                    🚨 Out of Stock Items ({outOfStockItems.length})
                  </Text>
                  <TableContainer border="1px solid" borderColor="red.200" borderRadius="lg">
                    <Table variant="simple" size="sm">
                      <Thead bg="red.50">
                        <Tr>
                          <Th>
                            <input
                              type="checkbox"
                              checked={outOfStockItems.every(item => selectedItems.includes(item._id))}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                outOfStockItems.forEach(item => {
                                  if (checked) {
                                    if (!selectedItems.includes(item._id)) {
                                      setSelectedItems([...selectedItems, item._id]);
                                    }
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== item._id));
                                  }
                                });
                              }}
                            />
                          </Th>
                          <Th>Device Name</Th>
                          <Th>Model</Th>
                          <Th>Brand</Th>
                          <Th>Current Stock</Th>
                          <Th>Threshold</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {outOfStockItems.map((item) => {
                          if (!item || !item._id) return null;
                          return (
                          <Tr key={item._id} _hover={{ bg: 'red.25' }}>
                            <Td>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item._id)}
                                onChange={(e) => handleSelectItem(item._id, e.target.checked)}
                              />
                            </Td>
                            <Td fontWeight="semibold">{item.deviceName}</Td>
                            <Td>{item.model}</Td>
                            <Td>{item.brand || 'N/A'}</Td>
                            <Td textAlign="center">
                              <Badge colorScheme="red" variant="solid">
                                {item.currentStock} {item.unit}
                              </Badge>
                            </Td>
                            <Td textAlign="center">{item.threshold} {item.unit}</Td>
                            <Td>
                              <Badge colorScheme={getStockStatusColor(item)} variant="solid">
                                {getStockStatusText(item)}
                              </Badge>
                            </Td>
                          </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Low Stock Items */}
              {lowStockOnlyItems.length > 0 && (
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="orange.600" mb={3}>
                    ⚠️ Low Stock Items ({lowStockOnlyItems.length})
                  </Text>
                  <TableContainer border="1px solid" borderColor="orange.200" borderRadius="lg">
                    <Table variant="simple" size="sm">
                      <Thead bg="orange.50">
                        <Tr>
                          <Th>
                            <input
                              type="checkbox"
                              checked={lowStockOnlyItems.every(item => selectedItems.includes(item._id))}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                lowStockOnlyItems.forEach(item => {
                                  if (checked) {
                                    if (!selectedItems.includes(item._id)) {
                                      setSelectedItems([...selectedItems, item._id]);
                                    }
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== item._id));
                                  }
                                });
                              }}
                            />
                          </Th>
                          <Th>Device Name</Th>
                          <Th>Model</Th>
                          <Th>Brand</Th>
                          <Th>Current Stock</Th>
                          <Th>Threshold</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {lowStockOnlyItems.map((item) => {
                          if (!item || !item._id) return null;
                          return (
                          <Tr key={item._id} _hover={{ bg: 'orange.25' }}>
                            <Td>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item._id)}
                                onChange={(e) => handleSelectItem(item._id, e.target.checked)}
                              />
                            </Td>
                            <Td fontWeight="semibold">{item.deviceName}</Td>
                            <Td>{item.model}</Td>
                            <Td>{item.brand || 'N/A'}</Td>
                            <Td textAlign="center">
                              <Badge colorScheme="orange" variant="solid">
                                {item.currentStock} {item.unit}
                              </Badge>
                            </Td>
                            <Td textAlign="center">{item.threshold} {item.unit}</Td>
                            <Td>
                              <Badge colorScheme={getStockStatusColor(item)} variant="solid">
                                {getStockStatusText(item)}
                              </Badge>
                            </Td>
                          </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <HStack spacing={3} w="full" justify="space-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <HStack spacing={3}>
              <Button
                variant="outline"
                leftIcon={<InfoIcon />}
                onClick={() => refetch()}
                isLoading={isLoading}
              >
                Refresh
              </Button>
              <Button
                colorScheme="orange"
                leftIcon={<EmailIcon />}
                onClick={handleSendAlerts}
                isLoading={isSendingAlerts}
                isDisabled={selectedItems.length === 0 || lowStockItems.length === 0}
              >
                Send Alerts ({selectedItems.length})
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InventoryThresholdModal;
