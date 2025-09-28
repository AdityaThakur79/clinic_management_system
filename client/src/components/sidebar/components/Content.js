// chakra imports
import { Box, Flex, Stack } from '@chakra-ui/react';
//   Custom components
import Brand from 'components/sidebar/components/Brand';
import Links from 'components/sidebar/components/Links';
import SidebarCard from 'components/sidebar/components/SidebarCard';
import React from 'react';

// FUNCTIONS

function SidebarContent(props) {
  const {
    routes,
    isCollapsed = false,
    setIsCollapsed,
    activeParentIndex,
    setActiveParentIndex,
  } = props;
  // SIDEBAR
  return (
    <Flex
      direction="column"
      pt="25px"
      px="16px"
      borderRadius="30px"
      pb="40px"
      minH="120vh"
      w="100%"
    >
      <Brand isCollapsed={isCollapsed} />
      <Stack direction="column" mt="8px">
        <Box ps="20px" pe={{ md: '16px', '2xl': '1px' }}>
          <Links
            routes={routes}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            activeParentIndex={activeParentIndex}
            setActiveParentIndex={setActiveParentIndex}
          />
        </Box>
      </Stack>

      <Box
        mt='60px'
        mb='40px'
        borderRadius='30px'>
        {/* <SidebarCard /> */}
      </Box>
    </Flex>
  );
}

export default SidebarContent;
