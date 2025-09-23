import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  HStack,
  VStack,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  TableContainer,
  Button,
  useColorModeValue,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { useGetInventoryByIdQuery } from '../../../features/api/inventoryApi';

const InventoryDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetInventoryByIdQuery(id, {
    skip: !id,
  });
  const inventory = data?.inventory;
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const brand = '#2BA8D1';

  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN') : '-');

  if (isLoading)
    return (
      <Box p={6}>
        <Text>Loading...</Text>
      </Box>
    );
  if (error)
    return (
      <Box p={6}>
        <Text color="red.500">Failed to load inventory</Text>
      </Box>
    );
  if (!inventory)
    return (
      <Box p={6}>
        <Text>No data</Text>
      </Box>
    );

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={6}>
      {/* Summary */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardHeader bg={headerBg}>
          <HStack justify="space-between">
            <Heading size="md" color={brand}>Inventory Item</Heading>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              _hover={{ bg: brand, color: 'white', transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(43,168,209,0.3)' }}
            >
              Refresh
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Device
              </Text>
              <Text fontWeight="bold">{inventory.deviceName}</Text>
              <Text color="gray.600">
                {inventory.brand} {inventory.model}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Stock
              </Text>
              <HStack>
                <Badge
                  colorScheme={
                    inventory.currentStock === 0
                      ? 'red'
                      : inventory.currentStock <= inventory.threshold
                      ? 'orange'
                      : 'green'
                  }
                >
                  {inventory.currentStock} in stock
                </Badge>
                <Text fontSize="sm" color="gray.600">
                  Threshold: {inventory.threshold}
                </Text>
              </HStack>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Pricing
              </Text>
              <Text>
                Cost: ₹{inventory.costPrice} | Selling: ₹
                {inventory.sellingPrice}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Branch</Text>
              <Text fontWeight="medium">{inventory.branchId?.branchName || 'N/A'}</Text>
              {inventory.branchId?.address && (
                <Text fontSize="sm" color="gray.600">{inventory.branchId.address}</Text>
              )}
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Transactions */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardHeader bg={headerBg}>
          <Flex align="center" justify="space-between">
            <Heading size="md" color={brand}>Transactions</Heading>
            <Button size="sm" variant="outline" onClick={() => refetch()} _hover={{ bg: brand, color: 'white', transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(43,168,209,0.3)' }}>
              Refresh
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Operation</Th>
                  <Th isNumeric>Qty</Th>
                  <Th isNumeric>Balance</Th>
                  <Th>Reason/Notes</Th>
                  <Th>Patient</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(inventory.transactions || []).map((t, idx) => (
                  <Tr key={idx}>
                    <Td>{fmtDateTime(t.date || t.createdAt)}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          t.operation === 'reduce'
                            ? 'red'
                            : t.operation === 'add'
                            ? 'green'
                            : 'blue'
                        }
                      >
                        {t.operation}
                      </Badge>
                    </Td>
                    <Td isNumeric>{t.quantity}</Td>
                    <Td isNumeric>{t.balanceAfter}</Td>
                    <Td>{t.reason || t.notes || '-'}</Td>
                    <Td>{t.patientId?.name || '-'}</Td>
                  </Tr>
                ))}
                {(inventory.transactions || []).length === 0 && (
                  <Tr>
                    <Td colSpan={7}>
                      <Text color="gray.500">No transactions yet.</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
};

export default InventoryDetail;
