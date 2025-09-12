import React, { useState } from "react";
import { assets } from "../../../assets/assets";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Image,
  Button,
  IconButton,
  Text,
} from "@chakra-ui/react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  // Check active path
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "ABOUT US", path: "/about" },
    { name: "SERVICES", path: "/services" },
    { name: "BOOK AN APPOINTMENT", path: "/doctors" },
    { name: "CONTACT", path: "/contact" },
  ];

  return (
    <Flex
      align="center"
      justify="space-between"
      py={4}
      mb={0}
      px={{ base: 4, md: 10 }}
    >
      {/* Logo */}
      <Image
        w="11rem"
        cursor="pointer"
        src={assets.aartiket_logo}
        alt="logo"
        onClick={() => navigate("/")}
      />

      {/* Desktop Menu */}
      <HStack
        as="ul"
        spacing={5}
        display={{ base: "none", md: "flex" }}
        fontWeight="medium"
        align="flex-start"
         listStyleType="none"
      >
        {navLinks.map((link) => (
          <NavLink key={link.path} to={link.path}>
            <Box
              as="li"
              position="relative"
              py={1}
              transition="all 0.3s"
              color={isActive(link.path) ? "#3AC0E7" : "inherit"}
              _hover={{ color: "#3AC0E7" }}
            >
              {link.name}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                h="2px"
                bg="#3AC0E7"
                transition="all 0.3s"
                w={isActive(link.path) ? "100%" : "0"}
                _groupHover={{ w: "100%" }}
              />
            </Box>
          </NavLink>
        ))}
      </HStack>

      {/* CTA + Mobile Menu Button */}
      <HStack spacing={4}>
        <Button
          display={{ base: "none", md: "block" }}
          bg="#3AC0E7"
          color="white"
          px={8}
          py={3}
          rounded="full"
          fontWeight="light"
          shadow="lg"
          _hover={{ bg: "#2BA8D1", shadow: "xl" }}
          _active={{ transform: "scale(0.95)" }}
          onClick={() => {
            navigate("/doctors");
           
          }}
        >
          Book Appointment
        </Button>

        {/* Mobile Menu Icon */}
        <Image
          w={6}
          display={{ base: "block", md: "none" }}
          src={assets.menu_icon}
          alt="menu"
          onClick={() => setShowMenu(true)}
        />
      </HStack>

      {/* ---- Mobile Menu ---- */}
      <Box
        display={{ base: "block", md: "none" }}
        position="fixed"
        top={0}
        right={0}
        bottom={0}
        w={showMenu ? "100%" : "0"}
        overflow="hidden"
        bg="white"
        zIndex={20}
        transition="all 0.3s"
      >
        <Flex align="center" justify="space-between" px={5} py={6}>
          <Image w="9rem" src={assets.aartiket_logo} alt="logo" />
          <Image
            w={7}
            src={assets.cross_icon}
            alt="close"
            cursor="pointer"
            onClick={() => setShowMenu(false)}
          />
        </Flex>

        <VStack spacing={3} mt={5} px={5} fontWeight="medium" fontSize="lg">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setShowMenu(false)}
            >
              <Text
                px={4}
                py={2}
                rounded="full"
                transition="color 0.3s"
                color={isActive(link.path) ? "#3AC0E7" : "inherit"}
                _hover={{ color: "#3AC0E7" }}
              >
                {link.name}
              </Text>
            </NavLink>
          ))}
        </VStack>
      </Box>
    </Flex>
  );
};

export default Navbar;
