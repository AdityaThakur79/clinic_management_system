import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { WarningIcon, EmailIcon, CloseIcon } from '@chakra-ui/icons';
import InventoryThresholdModal from './modals/InventoryThresholdModal';

const InventoryThresholdNotification = ({ alertData, onDismiss }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('orange.50', 'orange.900');
  const borderColor = useColorModeValue('orange.200', 'orange.700');

  if (!alertData || alertData.totalAlerts === 0) {
    return null;
  }

  return (
    <>
      <Alert
        status="warning"
        variant="left-accent"
        bg={bg}
        borderColor={borderColor}
        borderRadius="lg"
        mb={4}
        mt={8}
        pt={4}
        position="relative"
        zIndex={10}
      >
        <AlertIcon color="orange.500" />
        <VStack align="start" spacing={2} flex={1}>
          <HStack spacing={3} align="center">
            <AlertTitle color="orange.700" fontSize="md">
              ⚠️ Inventory Alert: {alertData.totalAlerts} items need attention
            </AlertTitle>
            <Badge colorScheme="orange" variant="solid">
              {alertData.outOfStock} Out of Stock
            </Badge>
            <Badge colorScheme="yellow" variant="solid">
              {alertData.lowStock} Low Stock
            </Badge>
          </HStack>
          <AlertDescription color="orange.600" fontSize="sm">
            Some inventory items have reached or fallen below their threshold levels. 
            Please review and take necessary action to restock.
          </AlertDescription>
          <HStack spacing={3} mt={2}>
            <Button
              size="sm"
              colorScheme="orange"
              leftIcon={<WarningIcon />}
              onClick={onOpen}
              _hover={{ transform: 'translateY(-1px)' }}
            >
              View Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="orange"
              leftIcon={<EmailIcon />}
              onClick={onOpen}
              _hover={{ transform: 'translateY(-1px)' }}
            >
              Send Alerts
            </Button>
            <Button
              size="sm"
              variant="ghost"
              colorScheme="orange"
              leftIcon={<CloseIcon />}
              onClick={onDismiss}
              _hover={{ transform: 'translateY(-1px)' }}
            >
              Dismiss
            </Button>
          </HStack>
        </VStack>
      </Alert>

      <InventoryThresholdModal 
        isOpen={isOpen} 
        onClose={onClose}
        branchId={null} // Will be determined by user's role in the modal
      />
    </>
  );
};

export default InventoryThresholdNotification;
