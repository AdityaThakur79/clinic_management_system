import React, { useState, useEffect } from 'react';
import {
  Box, Button, HStack, Text, useColorModeValue, Card, CardBody, CardHeader, VStack, useToast, SimpleGrid, Badge, Divider, Icon, Flex, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Input, Select, Textarea, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, FormControl, FormLabel, Switch, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Tooltip, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, InputGroup, InputLeftElement, InputRightElement
} from '@chakra-ui/react';
import { useGetAllRemindersQuery, useCreateReminderMutation, useUpdateReminderMutation, useDeleteReminderMutation, useMarkReminderCompletedMutation } from '../../../features/api/reminders';
import { useSelector } from 'react-redux';
import { MdAdd, MdEdit, MdDelete, MdCheck, MdAccessTime, MdCalendarToday, MdNotifications, MdFilterList, MdViewList, MdViewModule, MdRefresh, MdSearch, MdSort, MdMoreVert, MdWarning, MdInfo, MdError, MdClose } from 'react-icons/md';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AdvancedReminders = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [view, setView] = useState('calendar'); // 'calendar', 'list', 'grid'
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'upcoming', 'overdue', 'completed'
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'dueDate', 'priority', 'title', 'status'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: remindersData,
    isLoading,
    error,
    refetch
  } = useGetAllRemindersQuery({ page: 1, limit: 500, sortBy: 'createdAt', sortOrder: 'desc' });

  const [createReminder, { isLoading: isCreating }] = useCreateReminderMutation();
  const [updateReminder, { isLoading: isUpdating }] = useUpdateReminderMutation();
  const [deleteReminder, { isLoading: isDeleting }] = useDeleteReminderMutation();
  const [markCompleted, { isLoading: isCompleting }] = useMarkReminderCompletedMutation();

  const reminders = remindersData?.reminders || [];
  const user = useSelector((s) => s.auth.user);
  const userId = user?._id || user?.userId;
  const userBranchId = user?.branch?._id || user?.branch;

  // Brand button styles
  const brandHover = {
    _hover: {
      bg: '#2BA8D1',
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(43,168,209,0.3)'
    },
    _active: { bg: '#2696ba', transform: 'translateY(0)' },
    transition: 'all 0.15s ease'
  };
  const brandPrimary = {
    bg: '#2BA8D1',
    color: 'white',
    _hover: { bg: '#2696ba', transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(43,168,209,0.25)' },
    _active: { bg: '#2187a6', transform: 'translateY(0)' },
    transition: 'all 0.15s ease'
  };

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    status: 'pending',
    type: 'general',
    patientId: '',
    appointmentId: '',
    isRecurring: false,
    recurringType: 'none',
    notes: ''
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');

  // Filter and sort reminders
  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = (() => {
      const now = new Date();
      const dueDate = new Date(reminder.reminderDate || reminder.dueDate);
      
      switch (filter) {
        case 'today':
          return dueDate.toDateString() === now.toDateString();
        case 'upcoming':
          return dueDate > now && reminder.status !== 'completed';
        case 'overdue':
          return dueDate < now && reminder.status !== 'completed';
        case 'completed':
          return reminder.status === 'completed';
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt); // newest first
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'title':
        return a.title.localeCompare(b.title);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'dueDate':
      default:
        return new Date(a.reminderDate || a.dueDate) - new Date(b.reminderDate || b.dueDate);
    }
  });

  // Helper: combine date string and time string into a local Date
  const toLocalDateTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    if (!timeStr) return date;
    try {
      let hours = 0;
      let minutes = 0;
      const trimmed = String(timeStr).trim();
      // Supports formats: HH:mm, H:mm, hh:mm AM/PM, 11:20 PM
      const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*([APap][Mm])$/);
      if (ampmMatch) {
        hours = parseInt(ampmMatch[1], 10);
        minutes = parseInt(ampmMatch[2], 10);
        const isPM = ampmMatch[3].toUpperCase() === 'PM';
        if (hours === 12) hours = isPM ? 12 : 0; else hours = isPM ? hours + 12 : hours;
      } else {
        const twentyFour = trimmed.match(/^(\d{1,2}):(\d{2})$/);
        if (twentyFour) {
          hours = parseInt(twentyFour[1], 10);
          minutes = parseInt(twentyFour[2], 10);
        }
      }
      date.setHours(hours, minutes, 0, 0);
      return date;
    } catch {
      return date;
    }
  };

  // Calendar events
  const calendarEvents = filteredReminders.map(reminder => ({
    id: reminder._id,
    title: reminder.title,
    start: toLocalDateTime(reminder.reminderDate || reminder.dueDate, reminder.reminderTime || reminder.dueTime),
    end: toLocalDateTime(reminder.reminderDate || reminder.dueDate, reminder.reminderTime || reminder.dueTime),
    resource: reminder
  }));

  const handleCreateReminder = async () => {
    try {
      const payload = {
        ...formData,
        doctorId: formData.doctorId || userId,
        branchId: formData.branchId || userBranchId,
      };
      await createReminder(payload).unwrap();
      toast({
        title: 'Success',
        description: 'Reminder created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      resetForm();
      onClose();
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create reminder',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateReminder = async () => {
    try {
      await updateReminder({ id: selectedReminder._id, ...formData }).unwrap();
      toast({
        title: 'Success',
        description: 'Reminder updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      resetForm();
      onClose();
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update reminder',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await deleteReminder(id).unwrap();
      toast({
        title: 'Success',
        description: 'Reminder deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete reminder',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await markCompleted(id).unwrap();
      toast({
        title: 'Success',
        description: 'Reminder marked as completed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to mark reminder as completed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reminderDate: '',
      reminderTime: '',
      priority: 'medium',
      status: 'pending',
      type: 'general',
      patientId: '',
      appointmentId: '',
      isRecurring: false,
      recurringType: 'none',
      notes: ''
    });
    setSelectedReminder(null);
    setIsEditing(false);
  };

  const openCreateModal = () => {
    resetForm();
    onOpen();
  };

  const openEditModal = (reminder) => {
    setSelectedReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      reminderDate: reminder.reminderDate ? new Date(reminder.reminderDate).toISOString().split('T')[0] : '',
      reminderTime: reminder.reminderTime || '',
      priority: reminder.priority,
      status: reminder.status,
      type: reminder.type,
      patientId: reminder.patientId || '',
      appointmentId: reminder.appointmentId || '',
      isRecurring: reminder.isRecurring || false,
      recurringType: reminder.recurringType || 'none',
      notes: reminder.notes || ''
    });
    setIsEditing(true);
    onOpen();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'blue';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading reminders...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Alert status="error" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              Failed to load reminders. Please try again.
            </AlertDescription>
          </Box>
        </Alert>
      </Center>
    );
  }

  const upcomingCount = reminders.filter(r => new Date(r.reminderDate || r.dueDate) > new Date() && r.status !== 'completed').length;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        
        <HStack spacing={4}>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            variant="outline"
            onClick={() => refetch()}
            {...brandHover}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            {...brandPrimary}
            onClick={openCreateModal}
          >
            Add Reminder
          </Button>
        </HStack>

        <HStack spacing={4} align="center">
          <Badge colorScheme="blue" borderRadius="md" px={3} py={1}>
            Upcoming: {upcomingCount}
          </Badge>
          <Select size="sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)} width="180px">
            <option value="createdAt">Sort: Created At</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
            <option value="status">Sort: Status</option>
          </Select>
        </HStack>
      </Flex>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Reminders</StatLabel>
              <StatNumber>{reminders.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Today</StatLabel>
              <StatNumber color="blue.500">
                {reminders.filter(r => new Date(r.reminderDate || r.dueDate).toDateString() === new Date().toDateString()).length}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Overdue</StatLabel>
              <StatNumber color="red.500">
                {reminders.filter(r => new Date(r.reminderDate || r.dueDate) < new Date() && r.status !== 'completed').length}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Completed</StatLabel>
              <StatNumber color="green.500">
                {reminders.filter(r => r.status === 'completed').length}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters and Controls */}
      <Card bg={cardBg} borderColor={borderColor} mb={6}>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} alignItems="center">
            <FormControl>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search reminders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="md"
                  bg={inputBg}
                />
                {searchTerm && (
                  <InputRightElement>
                    <Button size="xs" variant="ghost" onClick={() => setSearchTerm('')}>
                      <Icon as={MdClose} />
                    </Button>
                  </InputRightElement>
                )}
              </InputGroup>
            </FormControl>

            <FormControl>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)} borderRadius="md">
                <option value="all">All Reminders</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </Select>
            </FormControl>

            <FormControl>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} borderRadius="md">
                <option value="createdAt">Sort by Created At</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="title">Sort by Title</option>
                <option value="status">Sort by Status</option>
              </Select>
            </FormControl>

            <HStack spacing={2} justify={{ base: 'flex-start', md: 'flex-end' }}>
              <Button
                leftIcon={<Icon as={MdViewModule} />}
                bg={view === 'calendar' ? '#2BA8D1' : 'transparent'}
                color={view === 'calendar' ? 'white' : 'inherit'}
                border={view === 'calendar' ? 'none' : '1px solid'}
                borderColor={view === 'calendar' ? 'transparent' : 'gray.200'}
                _hover={{ bg: '#2BA8D1', color: 'white' }}
                _active={{ bg: '#2696ba' }}
                transition="all 0.15s ease"
                onClick={() => setView('calendar')}
              >
                Calendar
              </Button>
              <Button
                leftIcon={<Icon as={MdViewList} />}
                bg={view === 'list' ? '#2BA8D1' : 'transparent'}
                color={view === 'list' ? 'white' : 'inherit'}
                border={view === 'list' ? 'none' : '1px solid'}
                borderColor={view === 'list' ? 'transparent' : 'gray.200'}
                _hover={{ bg: '#2BA8D1', color: 'white' }}
                _active={{ bg: '#2696ba' }}
                transition="all 0.15s ease"
                onClick={() => setView('list')}
              >
                List
              </Button>
            </HStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Calendar full width */}
      {view === 'calendar' && (
        <Card bg={cardBg} borderColor={borderColor} mb={6}>
          <CardHeader>
            <Heading size="md">Calendar</Heading>
          </CardHeader>
          <CardBody>
            <Box h="700px">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={(event) => openEditModal(event.resource)}
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: getPriorityColor(event.resource.priority) === 'red' ? '#e53e3e' :
                                   getPriorityColor(event.resource.priority) === 'yellow' ? '#d69e2e' :
                                   getPriorityColor(event.resource.priority) === 'green' ? '#38a169' : '#718096',
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    padding: '2px 4px',
                    fontSize: '12px'
                  }
                })}
              />
            </Box>
          </CardBody>
        </Card>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">List View</Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Due Date</Th>
                    <Th>Priority</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredReminders.map((reminder) => (
                    <Tr key={reminder._id} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{reminder.title}</Text>
                          <Text fontSize="sm" color="gray.600">{reminder.description}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text>{new Date(reminder.dueDate).toLocaleDateString()}</Text>
                        {reminder.dueTime && (
                          <Text fontSize="sm" color="gray.600">{reminder.dueTime}</Text>
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={getPriorityColor(reminder.priority)}>
                          {reminder.priority.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(reminder.status)}>
                          {reminder.status.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="Edit">
                            <Button
                              size="sm"
                              leftIcon={<Icon as={MdEdit} />}
                              variant="ghost"
                              _hover={{ bg: 'rgba(43,168,209,0.08)' }}
                              onClick={() => openEditModal(reminder)}
                            />
                          </Tooltip>
                          {reminder.status !== 'completed' && (
                            <Tooltip label="Mark Complete">
                              <Button
                                size="sm"
                                leftIcon={<Icon as={MdCheck} />}
                                variant="ghost"
                                _hover={{ bg: 'rgba(56,161,105,0.12)' }}
                                onClick={() => handleMarkCompleted(reminder._id)}
                              />
                            </Tooltip>
                          )}
                          <Tooltip label="Delete">
                            <Button
                              size="sm"
                              leftIcon={<Icon as={MdDelete} />}
                              variant="ghost"
                              _hover={{ bg: 'rgba(229,62,62,0.12)' }}
                              onClick={() => handleDeleteReminder(reminder._id)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Reminder' : 'Create New Reminder'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter reminder title"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter reminder description"
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Reminder Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderDate: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Reminder Time</FormLabel>
                  <Input
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="appointment">Appointment</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="medication">Medication</option>
                    <option value="test">Test</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter additional notes"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onClose}
              borderColor="#2BA8D1"
              color="#2BA8D1"
              _hover={{ bg: 'rgba(43,168,209,0.08)' }}
              _active={{ bg: 'rgba(43,168,209,0.16)' }}
              transition="all 0.15s ease"
            >
              Cancel
            </Button>
            <Button
              {...brandPrimary}
              onClick={isEditing ? handleUpdateReminder : handleCreateReminder}
              isLoading={isCreating || isUpdating}
              loadingText={isEditing ? 'Updating...' : 'Creating...'}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedReminders;
