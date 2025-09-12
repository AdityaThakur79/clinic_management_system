import React from "react";
import { motion } from "framer-motion";
import { Box, Container, Flex, Heading, Text, Image, HStack, Tag } from "@chakra-ui/react";
import { assets } from "../../../assets/assets";

const MotionBox = motion(Box);

const AboutSeoSection = ({
  title = "Your Hearing. Our Care.",
  text = "Expert audiology and speech therapy with modern diagnostics and compassionate follow-ups across our partner hospitals.",
  image = assets.service_1,
}) => {
  return (
    <Box as="section" bg="#0C2F4D" color="white" className="bg-[#0C2F4D] text-white">
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
            <Heading as="h3" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" lineHeight="tight">
              {title}
            </Heading>
            <Text mt={3} color="whiteAlpha.800" maxW="2xl">
              {text}
            </Text>

            {/* Tags */}
            <HStack mt={5} spacing={3} wrap="wrap" className="flex flex-wrap gap-3 text-sm">
              <Tag px={3} py={1} borderRadius="full" bg="whiteAlpha.100" color={"white"} border="1px solid rgba(255,255,255,0.15)">
                Hearing Tests
              </Tag>
              <Tag px={3} py={1} borderRadius="full" bg="whiteAlpha.200" color={"white"} border="1px solid rgba(255,255,255,0.15)">
                Digital Hearing Aids
              </Tag>
              <Tag px={3} py={1} borderRadius="full" bg="whiteAlpha.200" color={"white"} border="1px solid rgba(255,255,255,0.15)">
                Speech Therapy
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
