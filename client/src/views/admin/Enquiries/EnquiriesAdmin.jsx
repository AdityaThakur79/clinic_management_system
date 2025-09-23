import React from 'react';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, Text } from '@chakra-ui/react';
import { useGetAllEnquiriesQuery } from '../../../features/api/enquiryApi';

const EnquiriesAdmin = () => {
  const { data, isLoading, isError, error } = useGetAllEnquiriesQuery({ page: 1, limit: 25 });

  if (isLoading) return <Box p={6}><Spinner /></Box>;
  if (isError) return <Box p={6}><Text color="red.500">Failed to load enquiries: {error?.data?.message || 'Unknown error'}</Text></Box>;

  const enquiries = data?.data?.enquiries || [];

  return (
    <Box pt={{ base: '130px', md: '100px', xl: '100px' }} px={6} maxW="1400px" mx="auto">
      <Heading size="lg" mb={6}>Enquiries</Heading>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
            <Th>Service</Th>
            <Th>Locality</Th>
            <Th>Status</Th>
            <Th>Created</Th>
          </Tr>
        </Thead>
        <Tbody>
          {enquiries.map(e => (
            <Tr key={e._id}>
              <Td>{e.name}</Td>
              <Td>{e.email}</Td>
              <Td>{e.phone}</Td>
              <Td>{e.service}</Td>
              <Td>{e.locality}</Td>
              <Td><Badge colorScheme={e.status === 'new' ? 'blue' : e.status === 'resolved' ? 'green' : 'orange'}>{e.status}</Badge></Td>
              <Td>{new Date(e.createdAt).toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default EnquiriesAdmin;


