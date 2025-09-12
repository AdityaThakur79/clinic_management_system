import React from 'react';

// Chakra imports
import { Button, Flex, useColorModeValue, Box, Text } from '@chakra-ui/react';

// Custom components
import { HorizonLogo } from 'components/icons/Icons';
import { HSeparator } from 'components/separator/Separator';
import logo from 'assets/img/aartiket_logo-removebg-preview.png';
import { Link } from 'react-router-dom';
export function SidebarBrand(props) {
  //   Chakra color mode
  let logoColor = useColorModeValue('navy.700', 'white');
  const { isCollapsed = false } = props;

  return (
    <Flex align="center" direction="column">
      <Box
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px="10px"
      >
        <img
          src={logo}
          alt="logo"
          width={isCollapsed ? '40px' : '128px'}
          height={isCollapsed ? '40px' : '128px'}
          style={{ objectFit: 'cover', transition: 'all 0.3s ease' }}
        />
      </Box>
      {!isCollapsed && <HSeparator mb="20px" />}
    </Flex>
  );
}

export default SidebarBrand;
