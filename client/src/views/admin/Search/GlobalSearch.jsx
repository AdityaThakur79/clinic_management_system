import React from 'react';
import { Box, Card, CardBody, Heading, VStack, Text, SimpleGrid, Link as ChakraLink, Spinner, Center, Alert, AlertIcon, Badge } from '@chakra-ui/react';
import { useLocation, Link } from 'react-router-dom';
import { BASE_URL } from '../../../utils/BaseUrl';

const useQuery = () => new URLSearchParams(useLocation().search);

const Section = ({ title, items, renderItem }) => (
  <Card>
    <CardBody>
      <Heading size="md" mb={4}>{title} <Badge ml={2}>{items?.length || 0}</Badge></Heading>
      <VStack align="stretch" spacing={3}>
        {items && items.length > 0 ? items.map(renderItem) : <Text color="gray.500">No results</Text>}
      </VStack>
    </CardBody>
  </Card>
);

export default function GlobalSearch() {
  const q = useQuery().get('q') || '';
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!q || q.trim().length < 2) return;
    let alive = true;
    const run = async () => {
      setLoading(true); setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(q)}&limit=6`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        });
        const json = await res.json();
        if (!alive) return;
        if (!json.success) throw new Error(json.message || 'Search failed');
        setData(json.results || {});
      } catch (e) {
        if (!alive) return;
        setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [q]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Heading mb={6}>Search results for "{q}"</Heading>
      {loading && (
        <Center py={12}><Spinner size="lg" /></Center>
      )}
      {error && (
        <Alert status="error" mb={6}><AlertIcon />{error}</Alert>
      )}
      {!loading && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Section title="Patients" items={data?.patients} renderItem={(p) => (
            <ChakraLink as={Link} to={`/admin/patients/${p._id}/details`} key={p._id} color="blue.600">
              {p.name} {p.contact ? `(${p.contact})` : ''}
            </ChakraLink>
          )} />
          <Section title="Appointments" items={data?.appointments} renderItem={(a) => (
            <ChakraLink as={Link} to={`/admin/appointments/${a._id}/bill`} key={a._id} color="blue.600">
              {new Date(a.date).toLocaleDateString()} {a.timeSlot ? `- ${a.timeSlot}` : ''} — {a?.patientId?.name || 'Patient'}
            </ChakraLink>
          )} />
          <Section title="Bills" items={data?.bills} renderItem={(b) => (
            <ChakraLink as={Link} to={`/admin/appointments/${b.appointmentId || ''}/bill`} key={b._id} color="blue.600">
              {b.billNumber} — {b?.patientId?.name || ''}
            </ChakraLink>
          )} />
          <Section title="Doctors" items={data?.doctors} renderItem={(d) => (
            <Text key={d._id}>{d.name} ({d.specialization || 'Doctor'})</Text>
          )} />
          <Section title="Branch Admins" items={data?.branchAdmins} renderItem={(u) => (
            <Text key={u._id}>{u.name} ({u.email})</Text>
          )} />
          <Section title="Branches" items={data?.branches} renderItem={(br) => (
            <Text key={br._id}>{br.branchName} — {br.address}</Text>
          )} />
          <Section title="Services" items={data?.services} renderItem={(s) => (
            <Text key={s._id}>{s.name}</Text>
          )} />
          <Section title="Inventory" items={data?.inventory} renderItem={(i) => (
            <ChakraLink as={Link} to={`/admin/inventory/${i._id}`} key={i._id} color="blue.600">
              {i.deviceName || i.name || 'Item'} {i.sku ? `(${i.sku})` : ''}
            </ChakraLink>
          )} />
        </SimpleGrid>
      )}
    </Box>
  );
}


