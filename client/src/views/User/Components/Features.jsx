import { Box, Flex, VStack, Text, Heading } from "@chakra-ui/react";
import { GiSoundWaves } from "react-icons/gi";
import { RiHeadphoneLine } from "react-icons/ri";
import { MdRecordVoiceOver } from "react-icons/md";

const featuresData = [
  {
    icon: <GiSoundWaves size="3rem" color="#E6541C" />,
    title: "Comprehensive Hearing Tests",
    desc: "Precise pure-tone, speech, and impedance assessments to diagnose all types and degrees of hearing loss.",
  },
  {
    icon: <RiHeadphoneLine size="3rem" color="#E6541C" />,
    title: "Hearing Aids Fitting & Care",
    desc: "Latest digital hearing aids with expert fitting, real-ear measurements, programming, and ongoing maintenance.",
  },
  {
    icon: <MdRecordVoiceOver size="3rem" color="#E6541C" />,
    title: "Personalized Speech Therapy",
    desc: "Evidence-based therapy for children and adults: articulation, fluency (stuttering), voice, and language disorders.",
  },
];

const Features = () => {
  return (
    <Box px={{ base: 6, md: 10, lg: 20 }} py={{ base: 10, md: 20 }}>
      <Box maxW="container.md" mx="auto" textAlign="center" mb={12}>
        <Heading
          as="h2"
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="semibold"
          color="#0C2F4D"
        >
          Best Speech & Hearing Services
        </Heading>
        <Text color="gray.600" maxW="xl" mx="auto" mt={4}>
          Expert audiology and speech therapy delivered with modern technology
          and a patient-first approach across the Mumbai Metropolitan Region.
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
            transition="all 0.3s"
            _hover={{ shadow: "xl" }}
            flex="1"
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
