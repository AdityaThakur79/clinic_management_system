import {
    Box,
    Container,
    Text,
    Heading,
    SimpleGrid,
    VStack,
    Flex,
  } from "@chakra-ui/react";
  import PatternBG from "../../../assets/patternBG.png";
  
  const data = [
    {
      id: 1,
      title: "Initial Assessment & Consultation",
      text: "Our certified audiologists conduct comprehensive hearing evaluations and speech assessments to understand your specific needs and challenges.",
    },
    {
      id: 2,
      title: "Personalized Treatment Plan",
      text: "Based on your assessment results, we create a customized therapy plan tailored to your hearing and speech goals and lifestyle.",
    },
    {
      id: 3,
      title: "Therapy Sessions & Progress Tracking",
      text: "Regular therapy sessions with our experienced specialists, using advanced techniques and equipment to improve your hearing and speech abilities.",
    },
    {
      id: 4,
      title: "Ongoing Support & Follow-up",
      text: "Continuous monitoring of your progress with regular follow-ups, adjustments to your treatment plan, and long-term support for sustained improvement.",
    },
  ];
  
  export default function WorkFlow() {
    return (
      <Box
        as="section"
        position="relative"
        py={{ base: 16, md: 20, lg: 24 }}
        bg="#2BA8D1"
        bgImage={`url(${PatternBG})`}
        bgRepeat="no-repeat"
        bgPos="center"
        bgSize="cover"
      >
        <Container maxW="7xl">
          {/* Section Heading */}
          <VStack spacing={2} textAlign="center" position="relative" zIndex="1">
            <Text fontSize="md" fontWeight="semibold" color="#ffffff">
              Our Process
            </Text>
            <Heading
              as="h2"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="white"
              maxW="4xl"
            >
              How We Help You Hear & Speak Better
            </Heading>
          </VStack>
  
          {/* Steps */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={{ base: 8, lg: 16 }}
            mt={24}
          >
            {data.map((item) => (
              <Flex
                key={item.id}
                direction="column"
                align={{ base: "center", md: "flex-start" }}
                textAlign={{ base: "center", md: "left" }}
                position="relative"
              >
                {/* Number Box */}
                <Flex
                  w={{ base: 12, md: 14, lg: 16 }}
                  h={{ base: 12, md: 14, lg: 16 }}
                  rounded={{ base: "2xl", lg: "3xl" }}
                  bg="white"
                  align="center"
                  justify="center"
                  fontSize={{ base: "2xl", lg: "3xl" }}
                  fontWeight="bold"
                  color="blue.800"
                  mb={{ base: 4, md: 6 }}
                >
                  {`0${item.id}`}
                </Flex>
  
                {/* Content */}
                <VStack align="start" spacing={2}>
                  <Heading
                    as="h3"
                    fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                    fontWeight="semibold"
                    color="white"
                    lineHeight="short"
                  >
                    {item.title}
                  </Heading>
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    color="white"
                    opacity={0.75}
                    lineHeight="tall"
                  >
                    {item.text}
                  </Text>
                </VStack>
              </Flex>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    );
  }
  