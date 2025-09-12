import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
} from "@chakra-ui/react";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

const container = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PageHeader = ({
  title = "Page Title",
  description = "",
  crumbs = [],
  bgImage,
}) => {
  const fullCrumbs = [{ label: "Home", to: "/" }, ...crumbs];

  return (
    <Box
      as="header"
      position="relative"
      overflow="hidden"
      color="white"
      minH={{ base: "300px", md: "350px" }}
      bgImage={bgImage ? `url(${bgImage})` : undefined}
      bgPosition="center"
      bgSize="cover"
      bgRepeat="no-repeat"
      bg={!bgImage ? "#0C2F4D" : undefined}
      bgGradient={!bgImage ? "linear(135deg, #0C2F4D 0%, #043152 50%, #5AA89B 100%)" : undefined}
    >
      {/* Background Overlay */}
      {bgImage && (
        <Box
          position="absolute"
          inset={0}
          bg="blackAlpha.600"
          bgGradient="linear(to-br, blackAlpha.500, blackAlpha.700)"
          backdropFilter="blur(1px)"
        />
      )}

      {/* Decorative Elements for non-image backgrounds */}
      {!bgImage && (
        <>
          <Box
            position="absolute"
            top="-80px"
            right="-40px"
            w="288px"
            h="288px"
            rounded="full"
            bg="rgba(242, 100, 35, 0.1)"
            filter="blur(60px)"
            pointerEvents="none"
          />
          <Box
            position="absolute"
            bottom="-96px"
            left="-40px"
            w="320px"
            h="320px"
            rounded="full"
            bg="rgba(90, 168, 155, 0.1)"
            filter="blur(60px)"
            pointerEvents="none"
          />
          {/* Additional decorative circles */}
          <Box
            position="absolute"
            top="20%"
            left="10%"
            w="120px"
            h="120px"
            rounded="full"
            bg="rgba(242, 100, 35, 0.05)"
            filter="blur(40px)"
            pointerEvents="none"
          />
          <Box
            position="absolute"
            bottom="30%"
            right="15%"
            w="150px"
            h="150px"
            rounded="full"
            bg="rgba(90, 168, 155, 0.05)"
            filter="blur(50px)"
            pointerEvents="none"
          />
        </>
      )}

      <Container maxW="7xl" px={6} py={{ base: 12, md: 16 }} position="relative" zIndex={10}>
        {/* Breadcrumb */}
        <MotionBox
          as="nav"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-label="Breadcrumb"
          fontSize="sm"
          color="whiteAlpha.800"
          mb={{ base: 3, md: 4 }}
        >
          <Flex align="center" wrap="wrap" gap={1}>
            {fullCrumbs.map((c, i) => (
              <Flex key={i} align="center">
                {i > 0 && (
                  <Text mx={2} color="whiteAlpha.600" fontSize="xs">
                    /
                  </Text>
                )}
                {c.to ? (
                  <Link to={c.to}>
                    <Text
                      _hover={{ 
                        color: "white",
                        textDecor: "underline"
                      }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      {c.label}
                    </Text>
                  </Link>
                ) : (
                  <Text color="white" fontWeight="medium">
                    {c.label}
                  </Text>
                )}
              </Flex>
            ))}
          </Flex>
        </MotionBox>

        {/* Title */}
        <MotionHeading
          variants={container}
          initial="hidden"
          animate="show"
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          fontWeight="extrabold"
          letterSpacing="-0.02em"
          lineHeight="1.1"
          textShadow="0 2px 4px rgba(0,0,0,0.3)"
          bgGradient="linear(to-r, white, whiteAlpha.900)"
          bgClip="text"
        >
          {title}
        </MotionHeading>

        {/* Description */}
        {description && (
          <MotionText
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            mt={{ base: 4, md: 6 }}
            fontSize={{ base: "md", md: "lg" }}
            color="whiteAlpha.900"
            maxW="3xl"
            lineHeight="1.6"
            textShadow="0 1px 2px rgba(0,0,0,0.3)"
            fontWeight="medium"
          >
            {description}
          </MotionText>
        )}
      </Container>
    </Box>
  );
};

export default PageHeader;
