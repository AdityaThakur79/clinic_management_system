import React from "react";

// Chakra imports
import { Button, Flex, useColorModeValue } from "@chakra-ui/react";

// Custom components
import { HorizonLogo } from "components/icons/Icons";
import { HSeparator } from "components/separator/Separator";
import logo from "assets/img/aartiket_logo.jpeg"
import { Link } from "react-router-dom";
export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");

  return (
    <Flex align='center' direction='column'>
      <img src={logo} alt="logo" width="128px" height="128px" style={{objectFit: 'cover'}} />
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
