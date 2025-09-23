import React, { useState } from 'react';
import {
  Box, Button, HStack, IconButton, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, Badge,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useToast, Tooltip, Flex, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, SimpleGrid
} from '@chakra-ui/react';
import { useGetTodayRemindersQuery, useMarkReminderCompletedMutation, useSendReminderMutation } from '../../../features/api/reminders';
import { MdNotifications, MdCheckCircle, MdSend, MdPerson, MdSchedule, MdBusiness, MdPhone, MdEmail } from 'react-icons/md';
import { useSelector } from 'react-redux';

const TodayReminders = () => {
  const [selectedReminder, setSelectedReminder] = useState(null);
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const toast = useToast();

  // Get current user for role-based filtering
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const userBranchId = user?.branch?._id || user?.branch || '';
  const userDoctorId = user?.role === 'doctor' ? user?._id : '';

  // API hooks
  const { data, isLoading, error, refetch } = useGetTodayRemindersQuery({
    branchId: (userRole === 'branchAdmin' || userRole === 'doctor') ? userBranchId : '',
    doctorId: userRole === 'doctor' ? userDoctorId : ''
  });

  const [markReminderCompleted] = useMarkReminderCompletedMutation();
  const [sendReminder] = useSendReminderMutation();

  const reminders = data?.reminders || [];

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleViewReminder = (reminder) => {
    setSelectedReminder(reminder);
    onViewModalOpen();
  };

  const handleMarkCompleted = async (reminderId) => {
    try {
      await markReminderCompleted(reminderId).unwrap();
      toast({
        title: 'Reminder Completed',
        description: 'Reminder has been marked as completed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to mark reminder as completed.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSendReminder = async (reminderId) => {
    try {
      await sendReminder(reminderId).unwrap();
      toast({
        title: 'Reminder Sent',
        description: 'Reminder has been sent successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to send reminder.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'sent': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'gray';
      case 'medium': return 'blue';
      case 'high': return 'orange';
      case 'urgent': return 'red';
      default: return 'gray';
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment': return 'blue';
      case 'follow_up': return 'green';
      case 'medication': return 'purple';
      case 'general': return 'gray';
      default: return 'gray';
    }
  };

  // Format time
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group reminders by time
  const groupRemindersByTime = (reminders) => {
    const grouped = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };

    reminders.forEach(reminder => {
      const hour = new Date(`2000-01-01T${reminder.reminderTime}`).getHours();
      if (hour >= 6 && hour < 12) {
        grouped.morning.push(reminder);
      } else if (hour >= 12 && hour < 18) {
        grouped.afternoon.push(reminder);
      } else if (hour >= 18 && hour < 22) {
        grouped.evening.push(reminder);
      } else {
        grouped.night.push(reminder);
      }
    });

    return grouped;
  };

  const groupedReminders = groupRemindersByTime(reminders);

  if (isLoading) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="#2BA8D1" />
          <Text>Loading today's reminders...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Failed to load today's reminders.</AlertDescription>
      </Alert>
    );
  }

  // Determine how many groups are non-empty to size the grid appropriately
  const nonEmptyGroupsCount = ['morning','afternoon','evening','night'].filter(k => groupedReminders[k].length > 0).length;
  const gridColumns = {
    base: 1,
    md: Math.min(nonEmptyGroupsCount || 1, 2),
    lg: Math.min(nonEmptyGroupsCount || 1, 3),
    xl: Math.min(nonEmptyGroupsCount || 1, 4),
  };

  return (
    <Box pt={{ base: '130px', md: '100px', xl: '100px' }} px={6} maxW="100%" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={MdNotifications} boxSize={8} color="#2BA8D1" />
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold">Today's Reminders</Text>
              <Text fontSize="sm" color="gray.600">{reminders.length} reminders for today</Text>
            </VStack>
          </HStack>
        </Flex>

        {/* Reminders by Time */}
        {reminders.length === 0 ? (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Center py={20}>
                <VStack spacing={4}>
                  <Icon as={MdNotifications} boxSize={16} color="gray.400" />
                  <Text fontSize="lg" color="gray.600">No reminders for today</Text>
                  <Text fontSize="sm" color="gray.500">You're all caught up!</Text>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={gridColumns} spacing={6}>
            {/* Morning Reminders */}
            {groupedReminders.morning.length > 0 && (
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <HStack>
                    <Icon as={MdSchedule} boxSize={6} color="orange.500" />
                    <Text fontSize="lg" fontWeight="semibold">Morning ({groupedReminders.morning.length})</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {groupedReminders.morning.map((reminder) => (
                      <Card key={reminder._id} variant="outline" p={3}>
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="semibold" fontSize="sm">{reminder.title}</Text>
                            <Text fontSize="xs" color="gray.600">{formatTime(reminder.reminderTime)}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.600" noOfLines={2}>{reminder.description}</Text>
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Badge colorScheme={getTypeColor(reminder.type)} size="sm">
                                {reminder.type.replace('_', ' ')}
                              </Badge>
                              <Badge colorScheme={getPriorityColor(reminder.priority)} size="sm">
                                {reminder.priority}
                              </Badge>
                              <Badge colorScheme={getStatusColor(reminder.status)} size="sm">
                                {reminder.status}
                              </Badge>
                            </HStack>
                            <HStack spacing={1}>
                              <Tooltip label="View Details">
                                <IconButton
                                  icon={<MdPerson />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewReminder(reminder)}
                                />
                              </Tooltip>
                              {reminder.status === 'pending' && (
                                <Tooltip label="Send Reminder">
                                  <IconButton
                                    icon={<MdSend />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handleSendReminder(reminder._id)}
                                  />
                                </Tooltip>
                              )}
                              {reminder.status === 'sent' && (
                                <Tooltip label="Mark Completed">
                                  <IconButton
                                    icon={<MdCheckCircle />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handleMarkCompleted(reminder._id)}
                                  />
                                </Tooltip>
                              )}
                            </HStack>
                          </HStack>
                        </VStack>
                      </Card>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Afternoon Reminders */}
            {groupedReminders.afternoon.length > 0 && (
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <HStack>
                    <Icon as={MdSchedule} boxSize={6} color="yellow.500" />
                    <Text fontSize="lg" fontWeight="semibold">Afternoon ({groupedReminders.afternoon.length})</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {groupedReminders.afternoon.map((reminder) => (
                      <Card key={reminder._id} variant="outline" p={3}>
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="semibold" fontSize="sm">{reminder.title}</Text>
                            <Text fontSize="xs" color="gray.600">{formatTime(reminder.reminderTime)}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.600" noOfLines={2}>{reminder.description}</Text>
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Badge colorScheme={getTypeColor(reminder.type)} size="sm">
                                {reminder.type.replace('_', ' ')}
                              </Badge>
                              <Badge colorScheme={getPriorityColor(reminder.priority)} size="sm">
                                {reminder.priority}
                              </Badge>
                              <Badge colorScheme={getStatusColor(reminder.status)} size="sm">
                                {reminder.status}
                              </Badge>
                            </HStack>
                            <HStack spacing={1}>
                              <Tooltip label="View Details">
                                <IconButton
                                  icon={<MdPerson />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewReminder(reminder)}
                                />
                              </Tooltip>
                              {reminder.status === 'pending' && (
                                <Tooltip label="Send Reminder">
                                  <IconButton
                                    icon={<MdSend />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handleSendReminder(reminder._id)}
                                  />
                                </Tooltip>
                              )}
                              {reminder.status === 'sent' && (
                                <Tooltip label="Mark Completed">
                                  <IconButton
                                    icon={<MdCheckCircle />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handleMarkCompleted(reminder._id)}
                                  />
                                </Tooltip>
                              )}
                            </HStack>
                          </HStack>
                        </VStack>
                      </Card>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Evening Reminders */}
            {groupedReminders.evening.length > 0 && (
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <HStack>
                    <Icon as={MdSchedule} boxSize={6} color="purple.500" />
                    <Text fontSize="lg" fontWeight="semibold">Evening ({groupedReminders.evening.length})</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {groupedReminders.evening.map((reminder) => (
                      <Card key={reminder._id} variant="outline" p={3}>
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="semibold" fontSize="sm">{reminder.title}</Text>
                            <Text fontSize="xs" color="gray.600">{formatTime(reminder.reminderTime)}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.600" noOfLines={2}>{reminder.description}</Text>
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Badge colorScheme={getTypeColor(reminder.type)} size="sm">
                                {reminder.type.replace('_', ' ')}
                              </Badge>
                              <Badge colorScheme={getPriorityColor(reminder.priority)} size="sm">
                                {reminder.priority}
                              </Badge>
                              <Badge colorScheme={getStatusColor(reminder.status)} size="sm">
                                {reminder.status}
                              </Badge>
                            </HStack>
                            <HStack spacing={1}>
                              <Tooltip label="View Details">
                                <IconButton
                                  icon={<MdPerson />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewReminder(reminder)}
                                />
                              </Tooltip>
                              {reminder.status === 'pending' && (
                                <Tooltip label="Send Reminder">
                                  <IconButton
                                    icon={<MdSend />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handleSendReminder(reminder._id)}
                                  />
                                </Tooltip>
                              )}
                              {reminder.status === 'sent' && (
                                <Tooltip label="Mark Completed">
                                  <IconButton
                                    icon={<MdCheckCircle />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handleMarkCompleted(reminder._id)}
                                  />
                                </Tooltip>
                              )}
                            </HStack>
                          </HStack>
                        </VStack>
                      </Card>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Night Reminders */}
            {groupedReminders.night.length > 0 && (
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <HStack>
                    <Icon as={MdSchedule} boxSize={6} color="blue.500" />
                    <Text fontSize="lg" fontWeight="semibold">Night ({groupedReminders.night.length})</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {groupedReminders.night.map((reminder) => (
                      <Card key={reminder._id} variant="outline" p={3}>
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="semibold" fontSize="sm">{reminder.title}</Text>
                            <Text fontSize="xs" color="gray.600">{formatTime(reminder.reminderTime)}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.600" noOfLines={2}>{reminder.description}</Text>
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Badge colorScheme={getTypeColor(reminder.type)} size="sm">
                                {reminder.type.replace('_', ' ')}
                              </Badge>
                              <Badge colorScheme={getPriorityColor(reminder.priority)} size="sm">
                                {reminder.priority}
                              </Badge>
                              <Badge colorScheme={getStatusColor(reminder.status)} size="sm">
                                {reminder.status}
                              </Badge>
                            </HStack>
                            <HStack spacing={1}>
                              <Tooltip label="View Details">
                                <IconButton
                                  icon={<MdPerson />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewReminder(reminder)}
                                />
                              </Tooltip>
                              {reminder.status === 'pending' && (
                                <Tooltip label="Send Reminder">
                                  <IconButton
                                    icon={<MdSend />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handleSendReminder(reminder._id)}
                                  />
                                </Tooltip>
                              )}
                              {reminder.status === 'sent' && (
                                <Tooltip label="Mark Completed">
                                  <IconButton
                                    icon={<MdCheckCircle />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handleMarkCompleted(reminder._id)}
                                  />
                                </Tooltip>
                              )}
                            </HStack>
                          </HStack>
                        </VStack>
                      </Card>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}
          </SimpleGrid>
        )}

        {/* View Reminder Modal */}
        <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Reminder Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedReminder && (
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Patient</Text>
                      <Text fontWeight="semibold">{selectedReminder.patientId?.name}</Text>
                      <Text fontSize="sm" color="gray.600">{selectedReminder.patientId?.contact}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Doctor</Text>
                      <Text fontWeight="semibold">{selectedReminder.doctorId?.name}</Text>
                      <Text fontSize="sm" color="gray.600">{selectedReminder.doctorId?.specialization}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Type</Text>
                      <Badge colorScheme={getTypeColor(selectedReminder.type)} variant="subtle" borderRadius="full" px={3} py={1}>
                        {selectedReminder.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Priority</Text>
                      <Badge colorScheme={getPriorityColor(selectedReminder.priority)} variant="subtle" borderRadius="full" px={3} py={1}>
                        {selectedReminder.priority.toUpperCase()}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Time</Text>
                      <Text fontWeight="semibold">{formatTime(selectedReminder.reminderTime)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Status</Text>
                      <Badge colorScheme={getStatusColor(selectedReminder.status)} variant="subtle" borderRadius="full" px={3} py={1}>
                        {selectedReminder.status.toUpperCase()}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Title</Text>
                    <Text fontWeight="semibold">{selectedReminder.title}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Description</Text>
                    <Text>{selectedReminder.description}</Text>
                  </Box>
                  
                  {selectedReminder.notes && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>Notes</Text>
                      <Text>{selectedReminder.notes}</Text>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onViewModalClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default TodayReminders;

