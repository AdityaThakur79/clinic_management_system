import React from "react";
import { Box, Container, Heading, SimpleGrid, Image, Text, VStack, Button, Badge, useBreakpointValue } from "@chakra-ui/react";
import { assets } from "../../../assets/assets";

const brand = {
  primary: "#2BA8D1",
  primaryDark: "#0C2F4D",
  bgSoft: "#F7FBFD",
};

// Minimal representative styles list. Can be extended or fed via props
const DEFAULT_STYLES = [
  // Invisible / In-Canal / In-The-Ear
  { key: "iic", title: "IIC - Invisible In Canal", image: assets.styles.style_1, category: "Invisible In Canal" },
  { key: "cic", title: "CIC - Completely In Canal", image: assets.styles.style_2, category: "In Canal" },
  { key: "itc", title: "ITC - In The Canal", image: assets.styles.style_3, category: "In Canal" },
  { key: "half-shell", title: "Half Shell", image: assets.styles.style_4, category: "In The Ear" },
  { key: "full-shell", title: "Full Shell", image: assets.styles.style_5, category: "In The Ear" },

  // Receiver In The Ear (3 variants)
  { key: "minirite", title: "miniRITE", image: assets.styles.style_6, category: "Receiver In The Ear" },
  { key: "minirite-t", title: "miniRITE T", image: assets.styles.style_7, category: "Receiver In The Ear" },
  { key: "minirite-r", title: "miniRITE R", image: assets.styles.style_8, category: "Receiver In The Ear" },

  // Behind The Ear (4 variants)
  { key: "bte-m", title: "BTE M", image: assets.styles.style_9, category: "Behind The Ear" },
  { key: "bte-pp", title: "BTE PP", image: assets.styles.style_10, category: "Behind The Ear" },
  { key: "bte-sp", title: "BTE SP", image: assets.styles.style_11, category: "Behind The Ear" },
  { key: "bte-up", title: "BTE UP", image: assets.styles.style_12, category: "Behind The Ear" },
];

export default function HearingAidStyleSelector({ styles = DEFAULT_STYLES, onSelect }) {
  const cols = useBreakpointValue({ base: 2, md: 3, lg: 4 });
  const [isVisible, setIsVisible] = React.useState({});

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[data-style-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleSelect = (style) => {
    if (typeof onSelect === "function") {
      onSelect(style);
    } else if (typeof window !== "undefined" && window.openQuickAppointmentModal) {
      // Provide context so the modal can add it to notes
      window.quickAppointmentContext = { note: `Preferred style: ${style.title}` };
      window.openQuickAppointmentModal();
    }
  };

  return (
    <Box as="section" py={{ base: 12, md: 20 }} bg={brand.bgSoft}>
      <Container maxW="7xl">
        <VStack spacing={6} mb={{ base: 6, md: 10 }}>
          <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} color={brand.primaryDark} textAlign="center">
            Hearing Aid Style Overview
          </Heading>
          <Text color="gray.600" textAlign="center" maxW="3xl">
            Explore different hearing aid styles. Select a style to book a quick appointment and our audiologist will guide you to the best fit.
          </Text>
        </VStack>

        <SimpleGrid columns={cols} spacing={{ base: 4, md: 6 }}>
          {styles.map((style, index) => (
            <Box
              key={style.key}
              role="group"
              position="relative"
              cursor="pointer"
              bg="white"
              borderRadius="2xl"
              shadow="md"
              border="1px solid"
              borderColor="rgba(12,47,77,0.08)"
              overflow="hidden"
              transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              _hover={{
                transform: "translateY(-8px) scale(1.02)",
                shadow: "0 25px 50px rgba(43, 168, 209, 0.25)",
                borderColor: brand.primary,
              }}
              data-style-animate
              id={`style-card-${index}`}
              style={{
                opacity: isVisible[`style-card-${index}`] ? 1 : 0,
                transform: isVisible[`style-card-${index}`]
                  ? 'translateY(0) scale(1)'
                  : 'translateY(30px) scale(0.95)',
                transition: `all 0.6s ease-out ${index * 0.08}s`,
              }}
            >
              <Box position="relative">
                <Image
                  src={style.image}
                  alt={style.title}
                  w="100%"
                  h={{ base: "140px", md: "180px" }}
                  objectFit="cover"
                  transition="all 0.3s ease"
                  _groupHover={{ transform: "scale(1.03)" }}
                />
                <Box
                  position="absolute"
                  inset={0}
                  bg="rgba(0,0,0,0.08)"
                  opacity={0}
                  transition="opacity 0.3s ease"
                  _groupHover={{ opacity: 1 }}
                />
              </Box>
              <Box p={4} position="relative" zIndex={2}>
                <VStack spacing={2} align="start">
                  <Badge colorScheme="blue" variant="subtle">
                    {style.category}
                  </Badge>
                  <Text fontWeight="semibold" color={brand.primaryDark}  >
                    {style.title}
                  </Text>
                  <Button
                    onClick={() => handleSelect(style)}
                    size="sm"
                    alignSelf="stretch"
                    bg={brand.primary}
                    color="white"
                    _hover={{ bg: "#0C2F4D", transform: "translateY(-2px)" }}
                  >
                    Select & Book Appointment
                  </Button>
                </VStack>
              </Box>
              <Box
                position="absolute"
                top="50%"
                left="50%"
                w="0"
                h="0"
                bg="rgba(255, 255, 255, 0.15)"
                borderRadius="full"
                transform="translate(-50%, -50%)"
                transition="all 0.4s ease"
                _groupHover={{ w: "220px", h: "220px" }}
              />
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}


