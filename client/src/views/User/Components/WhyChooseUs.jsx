import React, { useEffect } from "react";
import {
  Box,
  Container,
  Text,
  Heading,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { GiSoundWaves } from "react-icons/gi";
import {
  MdHearing,
  MdRecordVoiceOver,
  MdHome,
} from "react-icons/md";
import { FaHeadphones } from "react-icons/fa";
import { IoShieldCheckmark } from "react-icons/io5";
import { FaIndianRupeeSign } from "react-icons/fa6";

const features = [
  { icon: GiSoundWaves, title: "Advanced Hearing Tests", description: "Comprehensive audiological assessments using state-of-the-art equipment" },
  { icon: MdHearing, title: "Digital Hearing Aids", description: "Latest digital hearing aid technology for optimal sound quality" },
  { icon: MdRecordVoiceOver, title: "Speech Therapy", description: "Professional speech therapy for all ages and conditions" },
  { icon: MdHome, title: "Home Visits Available", description: "Convenient home consultation services in Mumbai" },
  { icon: FaIndianRupeeSign, title: "Best Rates Guaranteed", description: "Competitive pricing with no hidden charges" },
  { icon: FaHeadphones, title: "ITC & Microhearing Devices", description: "Discreet In-The-Canal and microhearing solutions" },
  { icon: IoShieldCheckmark, title: "Warranty & Support", description: "Comprehensive warranty and ongoing support services" },
  { icon: MdHearing, title: "All Accessories Available", description: "Complete range of hearing aid accessories and maintenance" },
];

export default function WhyChooseUs() {
  const [isVisible, setIsVisible] = React.useState({});

  // Intersection Observer for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      py={{ base: 10, md: 20 }}
      px={{ base: 3, md: 8, lg: 20 }}
      bg="#2BA8D1"
    >
      <Container maxW="7xl" textAlign="center" position="relative" zIndex="1">
        <Heading
          as="h2"
          fontSize="xl"
          fontWeight="semibold"
          color="white"
          mb={2}
        >
          Why Choose Aartiket Speech & Hearing Care?
        </Heading>
        <Text
          fontSize={{ base: "xl", md: "3xl", lg: "4xl" }}
          fontWeight="bold"
          color="white"
          mb={10}
        >
          We Care for Your Hearing & Communication
        </Text>

        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
          spacing={6}
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              role="group"
              position="relative"
              cursor="pointer"
              bg="white"
              rounded="2xl"
              shadow="lg"
              p={{ base: 4, md: 6 }}
              textAlign="center"
              border="1px solid transparent"
              overflow="hidden"
              transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              data-animate
              id={`why-choose-card-${index}`}
              opacity={isVisible[`why-choose-card-${index}`] ? 1 : 0}
              transform={isVisible[`why-choose-card-${index}`] ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)'}
              transition={`all 0.6s ease-out`}
              transitionDelay={`${index * 0.1}s`}
              _hover={{
                transform: "translateY(-8px) scale(1.02)",
                shadow: "0 25px 50px rgba(43, 168, 209, 0.25)",
                borderColor: "#2BA8D1",
                bg: "linear-gradient(135deg, #2BA8D1 0%, #3AC0E7 100%)",
                _before: {
                  opacity: 1,
                  transform: "scale(1)",
                },
                _after: {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              }}
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, rgba(43, 168, 209, 0.05) 0%, rgba(58, 192, 231, 0.1) 100%)",
                opacity: 0,
                transform: "scale(0.8)",
                transition: "all 0.4s ease",
                zIndex: 1,
              }}
              _after={{
                content: '""',
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background: "conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                opacity: 0,
                transform: "translateY(100%) rotate(0deg)",
                transition: "all 0.6s ease",
                zIndex: 1,
              }}
            >
              {/* Animated Background Circle */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                w="0"
                h="0"
                bg="rgba(255, 255, 255, 0.1)"
                borderRadius="full"
                transform="translate(-50%, -50%)"
                transition="all 0.4s ease"
                _groupHover={{
                  w: "200px",
                  h: "200px",
                }}
              />

              {/* Icon with Hover Animation */}
              <Box
                position="relative"
                zIndex="2"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
                transition="all 0.3s ease"
                _groupHover={{
                  transform: "scale(1.1) rotate(5deg)",
                }}
              >
                <Box
                  p={{ base: 3, md: 4 }}
                  borderRadius="full"
                  bg="rgba(43, 168, 209, 0.1)"
                  transition="all 0.3s ease"
                  color="#2BA8D1"
                  _groupHover={{
                    bg: "rgba(255, 255, 255, 0.2)",
                    transform: "scale(1.1)",
                    color: "white",
                  }}
                >
                  {/* responsive icon size */}
                  <Box as={feature.icon} boxSize={{ base: 8, md: 10 }} />
                </Box>
              </Box>

              {/* Title */}
              <Text
                fontWeight="bold"
                color="#0C2F4D"
                fontSize={{ base: "md", md: "lg" }}
                position="relative"
                zIndex="2"
                mb={2}
                transition="all 0.3s ease"
                _groupHover={{
                  color: "white",
                }}
              >
                {feature.title}
              </Text>

              {/* Description */}
              <Text
                fontSize="sm"
                color="gray.600"
                position="relative"
                zIndex="2"
                lineHeight="1.5"
                opacity={0.8}
                transition="all 0.3s ease"
                _groupHover={{
                  opacity: 1,
                  color: "white",
                }}
              >
                {feature.description}
              </Text>

              {/* Hover Border Effect */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                borderRadius="2xl"
                border="2px solid transparent"
                background="linear-gradient(135deg, #2BA8D1, #3AC0E7) border-box"
                mask="linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)"
                maskComposite="xor"
                opacity={0}
                transition="all 0.3s ease"
                _groupHover={{
                  opacity: 1,
                }}
              />
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}