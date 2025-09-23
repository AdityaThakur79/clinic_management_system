
import { Box, Flex, SimpleGrid, Text, Spinner, Table, Thead, Tbody, Tr, Th, Td, Button, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, VStack, HStack, Select } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import { useGetOverviewQuery } from "../../../features/api/analyticsApi";
import Chart from "react-apexcharts";
import { Link as RouterLink } from "react-router-dom";
import { useGetAllAppointmentsQuery, useGetTodayAppointmentsQuery } from "../../../features/api/appointments";
import { useGetAllRemindersQuery, useGetTodayRemindersQuery, useGetReminderSettingsQuery, useUpdateReminderSettingsMutation, useProcessUpcomingRemindersMutation } from "../../../features/api/reminders";
import { useGetAllBillsQuery } from "../../../features/api/billsApi";

export default function UserReports() {
  const { user } = useSelector((s) => s.auth || {});
  const [filters, setFilters] = React.useState({ branchId: "", doctorId: "" });

  React.useEffect(() => {
    if (!user) return;
    const branchFromUser = user?.branch?._id || user?.branch || user?.branchId?._id || user?.branchId || "";
    if (user.role === "branchAdmin") {
      setFilters((f) => ({ ...f, branchId: branchFromUser }));
    }
    if (user.role === "doctor") {
      setFilters((f) => ({ ...f, doctorId: user?._id || "", branchId: branchFromUser || f.branchId }));
    }
  }, [user]);

  const { data, isFetching } = useGetOverviewQuery({
    branchId: filters.branchId || undefined,
    doctorId: filters.doctorId || undefined,
  });

  // Fetch bills for accurate paid/outstanding fallback on dashboard
  const { data: billsData } = useGetAllBillsQuery({
    page: 1,
    limit: 1000,
    branchId: filters.branchId || undefined,
    doctorId: filters.doctorId || undefined,
  });

  const { data: apptsData } = useGetAllAppointmentsQuery({
    page: 1,
    limit: 5,
    status: 'booked',
    branchId: filters.branchId || undefined,
    doctorId: filters.doctorId || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: remindersData } = useGetAllRemindersQuery({
    page: 1,
    limit: 5,
    branchId: filters.branchId || undefined,
    doctorId: filters.doctorId || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const totals = data?.totals || {};
  const bills = billsData?.bills || [];
  const toNum = (v) => typeof v === 'number' ? v : parseFloat(v || 0) || 0;
  const getPaid = (b) => {
    const direct = toNum(b.paidAmount);
    const fromPayments = Array.isArray(b.payments) ? b.payments.reduce((s, p) => s + toNum(p.amount), 0) : 0;
    const fromRemaining = (b.remainingAmount !== undefined) ? (toNum(b.totalAmount) - toNum(b.remainingAmount)) : 0;
    let paid = Math.max(direct, fromPayments, fromRemaining);
    if ((b.paymentStatus || '').toLowerCase() === 'paid') paid = Math.max(paid, toNum(b.totalAmount));
    return Math.max(0, paid);
  };
  const fallbackTotalPaid = bills.reduce((s, b) => s + getPaid(b), 0);
  const fallbackTotalBilled = bills.reduce((s, b) => s + toNum(b.totalAmount), 0);
  const fallbackOutstanding = bills.reduce((s, b) => s + Math.max(0, toNum(b.totalAmount) - getPaid(b)), 0);
  const walletBills = bills.filter(b => (b.paymentMethod === 'wallet'));
  const fallbackWalletCollected = walletBills.reduce((s, b) => s + getPaid(b), 0);
  const fallbackWalletPatients = new Set(walletBills.map(b => b.patientId?._id || b.patientId)).size;

  // Prefer bill-derived figures when bills are present; else fall back to API totals
  const showTotalBilled = bills.length ? fallbackTotalBilled : (totals.totalBilled ?? 0);
  const showTotalPaid = bills.length ? fallbackTotalPaid : (totals.totalPaid ?? 0);
  const showOutstanding = bills.length ? fallbackOutstanding : (totals.totalOutstanding ?? 0);
  const showWalletCollected = bills.length ? fallbackWalletCollected : (totals.walletCollected ?? 0);
  const showWalletPatients = bills.length ? fallbackWalletPatients : (totals.walletPatientsCount ?? 0);
  const charts = data?.charts || {};
  const cardBg = useColorModeValue('white', 'gray.800');
  const textPrimary = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.300');

  // Today modal data
  const { data: todayAppts } = useGetTodayAppointmentsQuery({
    branchId: filters.branchId || undefined,
    doctorId: filters.doctorId || undefined,
  });
  const { data: todayRems } = useGetTodayRemindersQuery({
    branchId: filters.branchId || undefined,
    doctorId: filters.doctorId || undefined,
  });

  // Reminder settings (superAdmin only UI)
  const { data: settingsData, refetch: refetchSettings } = useGetReminderSettingsQuery(undefined, { skip: !user || user.role !== 'superAdmin' });
  const [updateSettings, { isLoading: isSavingSettings }] = useUpdateReminderSettingsMutation();
  const [processReminders, { isLoading: isProcessing }] = useProcessUpcomingRemindersMutation();
  const [selectedLead, setSelectedLead] = React.useState(360);

  React.useEffect(() => {
    const lt = settingsData?.settings?.leadTimesMinutes;
    if (Array.isArray(lt) && lt.length) setSelectedLead(lt[0]);
  }, [settingsData]);

  const saveLeadTimes = async () => {
    await updateSettings([selectedLead]).unwrap();
    await refetchSettings();
  };

  const [isTodayOpen, setIsTodayOpen] = React.useState(false);
  React.useEffect(() => {
    const key = 'overviewModalShownDate';
    const todayStr = new Date().toISOString().slice(0,10);
    const already = localStorage.getItem(key);
    const hasAny = (todayAppts?.appointments?.length || 0) > 0 || (todayRems?.reminders?.length || 0) > 0;
    if (hasAny && already !== todayStr) {
      setIsTodayOpen(true);
      localStorage.setItem(key, todayStr);
    }
  }, [todayAppts, todayRems]);

  const revenueSeries = [{ name: "Revenue", data: (charts.revenueByMonth || []).map((d) => d.amount) }];
  const revenueCategories = (charts.revenueByMonth || []).map((d) => `${d._id.month}/${d._id.year}`);

  const statusSeries = [{ name: "Appointments", data: (charts.appointmentsByStatus || []).map((d) => d.count) }];
  const statusCategories = (charts.appointmentsByStatus || []).map((d) => d._id);

  const last7Series = [{ name: "Appointments", data: (charts.appointmentsLast7Days || []).map((d) => d.count) }];
  const last7Categories = (charts.appointmentsLast7Days || []).map((d) => `${d._id.day}/${d._id.month}`);

  const topServiceSeries = [{ name: "Revenue", data: (charts.topServices || []).map((d) => d.revenue) }];
  const topServiceCategories = (charts.topServices || []).map((d) => d._id?.name || "Unknown");

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {isFetching ? (
        <Flex align="center" justify="center" minH="200px"><Spinner size="lg" /></Flex>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm"><Text fontWeight="700" color={textSecondary}>Total Patients</Text><Text fontSize="2xl" color={textPrimary}>{totals.totalPatients || 0}</Text></Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm"><Text fontWeight="700" color={textSecondary}>Appointments</Text><Text fontSize="2xl" color={textPrimary}>{totals.totalAppointments || 0}</Text></Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm"><Text fontWeight="700" color={textSecondary}>Completed</Text><Text fontSize="2xl" color={textPrimary}>{totals.completedAppointments || 0}</Text></Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm"><Text fontWeight="700" color={textSecondary}>Total Billed</Text><Text fontSize="2xl" color={textPrimary}>₹{Number(showTotalBilled).toLocaleString('en-IN')}</Text></Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm"><Text fontWeight="700" color={textSecondary}>Total Paid</Text><Text fontSize="2xl" color={textPrimary}>₹{Number(showTotalPaid).toLocaleString('en-IN')}</Text></Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm"><Text fontWeight="700" color={textSecondary}>Outstanding</Text><Text fontSize="2xl" color={textPrimary}>₹{Number(showOutstanding).toLocaleString('en-IN')}</Text></Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm"><Text fontWeight="700" color={textSecondary}>Wallet Patients</Text><Text fontSize="2xl" color={textPrimary}>{showWalletPatients}</Text></Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm"><Text fontWeight="700" color={textSecondary}>Wallet Collected</Text><Text fontSize="2xl" color={textPrimary}>₹{Number(showWalletCollected).toLocaleString('en-IN')}</Text></Box>
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mt="20px">
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm">
              <Flex align="center" justify="space-between" mb="10px">
                <Text fontWeight="700">Recent Booked Appointments</Text>
                <Button as={RouterLink} colorScheme="brand" size="sm" to="/admin/appointments/all">View All</Button>
              </Flex>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Patient</Th>
                    <Th>Date</Th>
                    <Th>Time</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(apptsData?.appointments || apptsData?.data || []).map((a) => (
                    <Tr key={a._id}>
                      <Td>{a.patientId?.name || a.patient?.name || a.patientName || a.patientId}</Td>
                      <Td>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</Td>
                      <Td>{a.timeSlot || '-'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm">
              <Flex align="center" justify="space-between" mb="10px">
                <Text fontWeight="700">Recent Reminders</Text>
                <Button as={RouterLink} colorScheme="brand" size="sm" to="/admin/reminders/all">View All</Button>
              </Flex>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Due</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(remindersData?.reminders || remindersData?.data || []).map((r) => (
                    <Tr key={r._id}>
                      <Td>{r.title || r.type || 'Reminder'}</Td>
                      <Td>{r.reminderDate || r.date || r.dueDate ? new Date(r.reminderDate || r.date || r.dueDate).toLocaleString() : '-'}</Td>
                      <Td textTransform="capitalize">{r.status || '-'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </SimpleGrid>

          {user?.role === 'superAdmin' && (
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm" mt="20px">
              <Flex align="center" justify="space-between" mb="12px">
                <Text fontWeight="700">Reminder Lead Time</Text>
                <HStack>
                  <Select size="sm" width="220px" value={selectedLead} onChange={(e)=>setSelectedLead(parseInt(e.target.value, 10))}>
                    <option value={1}>1 min (test)</option>
                    <option value={5}>5 min</option>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={360}>6 hours</option>
                    <option value={480}>8 hours</option>
                    <option value={720}>12 hours</option>
                    <option value={1440}>24 hours</option>
                  </Select>
                  <Button size="sm" colorScheme="brand" onClick={saveLeadTimes} isLoading={isSavingSettings}>Save</Button>
                  <Button size="sm" variant="outline" colorScheme="brand" onClick={()=>processReminders().unwrap()} isLoading={isProcessing}>Run Now</Button>
                </HStack>
              </Flex>
              <Text mt={1} fontSize="sm" color={textSecondary}>Emails (and WhatsApp when enabled) will be sent this long before the appointment time.</Text>
            </Box>
          )}


          <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mt="20px">
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm" minH="340px">
              <Text mb="8px" fontWeight="700">Revenue by Month</Text>
              <Chart type="bar" height={280} series={revenueSeries} options={{ xaxis: { categories: revenueCategories } }} />
            </Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm" minH="340px">
              <Text mb="8px" fontWeight="700">Appointments by Status</Text>
              <Chart type="pie" height={280} series={statusSeries[0].data} options={{ labels: statusCategories }} />
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mt="20px">
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm" minH="340px">
              <Text mb="8px" fontWeight="700">Appointments Last 7 Days</Text>
              <Chart type="line" height={280} series={last7Series} options={{ xaxis: { categories: last7Categories } }} />
            </Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm" minH="340px">
              <Text mb="8px" fontWeight="700">Top Services</Text>
              <Chart type="bar" height={280} series={topServiceSeries} options={{ xaxis: { categories: topServiceCategories } }} />
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mt="20px">
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm" minH="280px">
              <Text mb="8px" fontWeight="700">Revenue by Payment Method</Text>
              <Chart type="donut" height={240} series={(charts.revenueByPaymentMethod||[]).map(x=>x.amount)} options={{ labels: (charts.revenueByPaymentMethod||[]).map(x=>x._id||'unknown') }} />
            </Box>
            <Box p="16px" bg={cardBg} borderRadius="16px" boxShadow="sm" minH="280px">
              <Text mb="8px" fontWeight="700">Paid vs Outstanding</Text>
              <Chart type="pie" height={240} series={(charts.paidVsOutstanding||[]).map(x=>x.amount)} options={{ labels: (charts.paidVsOutstanding||[]).map(x=>x.label) }} />
            </Box>
          </SimpleGrid>

         
        </>
      )}

      {/* <Modal isOpen={isTodayOpen} onClose={() => setIsTodayOpen(false)} size="xl">
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
            <Button onClick={() => setIsTodayOpen(false)} colorScheme="brand">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
    </Box>
  );
}
