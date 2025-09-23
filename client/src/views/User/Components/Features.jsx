import React, { useEffect } from "react";
import { Box, Flex, VStack, Text, Heading } from "@chakra-ui/react";
import { GiSoundWaves } from "react-icons/gi";
import { RiHeadphoneLine } from "react-icons/ri";
import { MdRecordVoiceOver } from "react-icons/md";

const featuresData = [
  {
    icon: <GiSoundWaves size="3rem" color="#2BA8D1" />,
    title: "Comprehensive Hearing Tests",
    desc: "Precise pure-tone, speech, and impedance assessments to diagnose all types and degrees of hearing loss.",
  },
  {
    icon: <RiHeadphoneLine size="3rem" color="#2BA8D1" />,
    title: "Hearing Aids Fitting & Care",
    desc: "Latest digital hearing aids with expert fitting, real-ear measurements, programming, and ongoing maintenance.",
  },
  {
    icon: <MdRecordVoiceOver size="3rem" color="#2BA8D1" />,
    title: "Personalized Speech Therapy",
    desc: "Evidence-based therapy for children and adults: articulation, fluency (stuttering), voice, and language disorders.",
  },
];

const Features = () => {
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
    <Box px={{ base: 6, md: 10, lg: 20 }} py={{ base: 10, md: 20 }}>
      <Box 
        maxW="container.md" 
        mx="auto" 
        textAlign="center" 
        mb={12}
        data-animate
        id="features-title"
        opacity={isVisible['features-title'] ? 1 : 0}
        transform={isVisible['features-title'] ? 'translateY(0)' : 'translateY(-30px)'}
        transition="all 0.8s ease-out"
      >
        <Heading
          as="h2"
          fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
          fontWeight="extrabold"
          color="#0C2F4D"
          lineHeight="short"
          letterSpacing={{ base: 'tight', md: 'wide' }}
        >
       Advanced Audiology & Speech Therapy
        </Heading>
        <Box w={{ base: '60px', md: '80px' }} h="4px" bg="#2BA8D1" borderRadius="full" mt={3} mx="auto" />
        <Text color="gray.600" maxW="xl" mx="auto" mt={4}>
          Comprehensive audiology and speech therapy delivered with modern
          diagnostics, personalized fittings, and a patient‑first approach
          across the Mumbai Metropolitan Region.
        </Text>
      </Box>

      {/* Features Cards */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={8}
        justify="center"
        align="stretch"
      >
        {featuresData.map((feature, idx) => (
          <Box
            key={idx}
            textAlign="center"
            px={6}
            py={8}
            bg="whiteAlpha.800"
            rounded="xl"
            shadow="md"
            _hover={{ shadow: "xl" }}
            flex="1"
            data-animate
            id={`feature-${idx}`}
            opacity={isVisible[`feature-${idx}`] ? 1 : 0}
            transform={isVisible[`feature-${idx}`] ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)'}
            transition={`all 0.6s ease-out`}
            transitionDelay={`${idx * 0.2}s`}
          >
            <Flex justify="center" align="center" mb={6}>
              {feature.icon}
            </Flex>
            <Text fontSize="lg" fontWeight="semibold" color="#2C2D3F">
              {feature.title}
            </Text>
            <Text mt={4} color="gray.600">
              {feature.desc}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default Features;
