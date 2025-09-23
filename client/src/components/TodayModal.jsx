import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, Button, Box, Text, SimpleGrid, VStack, HStack, useColorModeValue } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { useGetTodayAppointmentsQuery } from '../features/api/appointments';
import { useGetTodayRemindersQuery } from '../features/api/reminders';

const TodayModal = () => {
  const user = useSelector((s) => s.auth?.user);
  const branchId = user?.branch?._id || user?.branch;
  const doctorId = user?.role === 'doctor' ? user?._id : undefined;

  const { data: todayAppts } = useGetTodayAppointmentsQuery({ branchId, doctorId }, { skip: !user });
  const { data: todayRems } = useGetTodayRemindersQuery({ branchId, doctorId }, { skip: !user });

  const [isOpen, setIsOpen] = React.useState(false);
  const textSecondary = useColorModeValue('gray.600', 'gray.300');

  React.useEffect(() => {
    if (!user) return;
    const key = 'overviewModalShownDate';
    const todayStr = new Date().toISOString().slice(0,10);
    const already = localStorage.getItem(key);
    const hasAny = (todayAppts?.appointments?.length || 0) > 0 || (todayRems?.reminders?.length || 0) > 0;
    if (hasAny && already !== todayStr) {
      setIsOpen(true);
      localStorage.setItem(key, todayStr);
    }
  }, [user, todayAppts, todayRems]);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Today at a Glance</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
            <Box>
              <Text fontWeight="700" mb="8px">Today's Appointments</Text>
              <VStack align="stretch" spacing={2} maxH="240px" overflowY="auto">
                {(todayAppts?.appointments || []).slice(0,5).map((a) => (
                  <HStack key={a._id} justify="space-between">
                    <Text>{a.patientId?.name || '-'}</Text>
                    <Text fontSize="sm" color={textSecondary}>{a.timeSlot || '-'}</Text>
                  </HStack>
                ))}
                {((todayAppts?.appointments || []).length || 0) === 0 && (
                  <Text color={textSecondary}>No appointments today.</Text>
                )}
              </VStack>
            </Box>
            <Box>
              <Text fontWeight="700" mb="8px">Today's Reminders</Text>
              <VStack align="stretch" spacing={2} maxH="240px" overflowY="auto">
                {(todayRems?.reminders || []).slice(0,5).map((r) => (
                  <HStack key={r._id} justify="space-between">
                    <Text>{r.title || r.type || 'Reminder'}</Text>
                    <Text fontSize="sm" color={textSecondary}>{r.reminderTime || ''}</Text>
                  </HStack>
                ))}
                {((todayRems?.reminders || []).length || 0) === 0 && (
                  <Text color={textSecondary}>No reminders today.</Text>
                )}
              </VStack>
            </Box>
          </SimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsOpen(false)} colorScheme="brand">Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TodayModal;


