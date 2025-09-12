import React from "react";
import { Box, Flex, Text, Button, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import PatternBG from "../../../assets/patternBG.png";
import { assets } from "../../../assets/assets";

const CTA = ({ 
  title = "Take the First Step Towards Better Hearing",
  subtitle = "with Aartiket Speech & Hearing Care", 
  description = "Don't let hearing loss impact your quality of life. Schedule a consultation with our specialists at Aartiket Speech & Hearing Care today and discover the right hearing solution for you.",
  buttonText = "Book Consultation Now",
  buttonLink = "/clinics"
}) => {
  const navigate = useNavigate();

  return (
    <Box
      bg="#2BA8D1"
      position="relative"
      overflow="hidden"
      px={6}
    >
      {/* Pattern Background Overlay */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.2}
        bgImage={`url(${PatternBG})`}
        bgRepeat="no-repeat"
        bgSize="cover"
        bgPos="center"
      />

      {/* Centered Content */}
      <Flex
        justify="center"
        align="center"
        position="relative"
        zIndex={10}
        py={{ base: 8, sm: 12, md: 16, lg: 20 }}
        maxW="4xl"
        mx="auto"
        textAlign="center"
        direction="column"
      >
        {/* Logo */}
        <Box mb={4}>
          <Image
            src={assets.aartiket_logo}
            alt="Aartiket Speech & Hearing Care Logo"
            h={{ base: "60px", sm: "80px", md: "100px" }}
            w="auto"
            filter="brightness(0) invert(1)"
          />
        </Box>

        <Text
          fontSize={{ base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }}
          fontWeight="bold"
          color="white"
          lineHeight="tight"
          mt={2}
        >
          {title}
        </Text>

        <Text
          fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
          fontWeight="semibold"
          color="white"
          mt={2}
          opacity={0.9}
        >
          {subtitle}
        </Text>

        <Text
          color="whiteAlpha.800"
          mt={3}
          maxW="2xl"
          mx="auto"
          fontSize={{ base: "md", sm: "lg" }}
        >
          {description}
        </Text>

        <Button
          mt={6}
          px={6}
          py={6}
          rounded="lg"
          fontSize={{ base: "sm", sm: "md" }}
          fontWeight="semibold"
          bg="#2BA8D1"
          color="white"
          shadow="md"
          transition="all 0.3s ease"
          _hover={{ 
            shadow: "lg", 
            transform: "translateY(-2px)",
            bg: "#3AC0E7",
            boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
          }}
          _active={{ transform: "translateY(0)" }}
          onClick={() => {
            navigate(buttonLink);
            window.scrollTo(0, 0);
          }}
        >
          {buttonText}
        </Button>
      </Flex>
    </Box>
  );
};

export default CTA;
