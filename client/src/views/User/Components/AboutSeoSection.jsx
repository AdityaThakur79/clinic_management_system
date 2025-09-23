import React from "react";
import { motion } from "framer-motion";
import { Box, Container, Flex, Heading, Text, Image, HStack, Tag } from "@chakra-ui/react";
import { assets } from "../../../assets/assets";

const MotionBox = motion(Box);

const AboutSeoSection = ({
  title = "Aartiket Speech & Hearing Care",
  text = "Personalized hearing care and speech therapy powered by modern diagnostics, expert fittings, and compassionate follow‑ups across Mumbai.",
  image = assets.service_1,
}) => {
  return (
    <Box as="section" bg="#2BA8D1" color="white" className="bg-[#2BA8D1] text-white">
      <Container maxW="7xl" px={{ base: 6, md: 10, lg: 20 }} py={{ base: 10, md: 14 }}>
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          gap={8}
        >
          {/* Text */}
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            flex="1"
            className="flex-1"
          >
            <Heading
              as="h3"
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              fontWeight="extrabold"
              lineHeight="short"
              letterSpacing={{ base: 'tight', md: 'wide' }}
              textShadow="0 2px 8px rgba(0,0,0,0.15)"
            >
              {title}
            </Heading>
            <Box w={{ base: '60px', md: '80px' }} h="4px" bg="white" borderRadius="full" mt={3} mb={2} />
            <Text mt={3} color="whiteAlpha.900" maxW="2xl" fontSize={{ base: 'md', md: 'lg' }}>
              {text}
            </Text>

            {/* Tags */}
            <HStack mt={5} spacing={3} wrap="wrap" className="flex flex-wrap gap-3 text-sm">
              <Tag px={3} py={1} borderRadius="full" bg="whiteAlpha.100" color={"white"} border="1px solid rgba(255,255,255,0.15)">
                Comprehensive Hearing Tests
              </Tag>
              <Tag px={3} py={1} borderRadius="full" bg="whiteAlpha.200" color={"white"} border="1px solid rgba(255,255,255,0.15)">
                Digital Hearing Aids & Fittings
              </Tag>
              <Tag px={3} py={1} borderRadius="full" bg="whiteAlpha.200" color={"white"} border="1px solid rgba(255,255,255,0.15)">
                Speech Therapy for All Ages
              </Tag>
            </HStack>
          </MotionBox>

          {/* Image (optional) */}
          {image && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              w={{ base: "100%", md: "33%" }}
              className="w-full md:w-1/3"
            >
              <Image
                src={image}
                alt="Best Speech & Hearing"
                rounded="xl"
                shadow="lg"
                objectFit="cover"
                w="full"
                className="w-full rounded-xl shadow-lg object-cover"
              />
            </MotionBox>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default AboutSeoSection;
