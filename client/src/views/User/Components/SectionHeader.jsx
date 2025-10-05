import React from "react";
import { VStack, Heading, Text, Badge } from "@chakra-ui/react";

export default function SectionHeader({
  title,
  subtitle,
  badgeText,
  align = "center",
  titleColor = "#0C2F4D",
  subtitleColor = "gray.600",
  badgeColor = "blue",
  primaryColor = "#2BA8D1",
  badgeOnLightBg = false,
  spacing = 3,
}) {
  return (
    <VStack spacing={spacing} textAlign={align} align={align === "center" ? "center" : "start"}>
      {badgeText ? (
        <Badge
          colorScheme={badgeColor}
          px={4}
          py={2}
          rounded="full"
          fontSize="sm"
          fontWeight="bold"
          bg={badgeOnLightBg ? primaryColor : "white"}
          color={badgeOnLightBg ? "white" : primaryColor}
        >
          {badgeText}
        </Badge>
      ) : null}
      {title ? (
        <Heading as="h2" fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} fontWeight="bold" color={titleColor} lineHeight="1.2">
          {title}
        </Heading>
      ) : null}
      {subtitle ? (
        <Text color={subtitleColor} maxW="4xl">
          {subtitle}
        </Text>
      ) : null}
    </VStack>
  );
}
