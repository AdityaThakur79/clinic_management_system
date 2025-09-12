import React from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { RiDoubleQuotesL } from "react-icons/ri";
import {
  Box,
  Container,
  Text,
  Heading,
  VStack,
  Flex,
  Avatar,
} from "@chakra-ui/react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    position: "Ghatkopar",
    image: "",
    rating: 5,
    feedback:
      "Aartiket Speech & Hearing Care is the right place if you're looking for genuine hearing care. The support and guidance provided here are excellent, and they ensure that patients feel comfortable and well taken care of. 👍🙏",
  },
  {
    name: "Priya Sharma",
    position: "Vikhroli",
    image: "",
    rating: 5,
    feedback:
      "The expertise and compassion shown by the team at Aartiket made me feel at ease. From the first consultation to follow-ups, everything was smooth and professional. Highly recommended for anyone needing speech or hearing care. 👂💬",
  },
  {
    name: "Vikram Patel",
    position: "Bhandup",
    image: "",
    rating: 5,
    feedback:
      "Very professional and welcoming staff! The audiologist at Aartiket explained every detail clearly and guided me step by step. I really appreciate the personalized care and clean, well-maintained setup. Excellent experience!",
  },
  {
    name: "Sunita Desai",
    position: "Kanjurmarg",
    image: "",
    rating: 5,
    feedback:
      "I visited with my grandmother who had slight hearing issues, and we were amazed at the patient handling and care at Aartiket. The efficiency and quality of service make this the best option for hearing problems.",
  },
  {
    name: "Amit Joshi",
    position: "Powai",
    image: "",
    rating: 5,
    feedback:
      "After visiting several clinics, I finally found proper guidance at Aartiket Speech & Hearing Care. The treatment was effective, and the results were outstanding. Truly thankful for their dedicated service.",
  },
  {
    name: "Meera Iyer",
    position: "Mulund",
    image: "",
    rating: 5,
    feedback:
      "Aartiket's team is simply outstanding! They helped my son with his speech therapy and the improvement has been remarkable. The facilities are modern and the staff is very caring. Highly recommend to anyone in the area.",
  },
  {
    name: "Suresh Gupta",
    position: "Chembur",
    image: "",
    rating: 5,
    feedback:
      "The hearing aid fitting at Aartiket was perfect. The audiologist took time to understand my needs and provided excellent after-sales support. The pricing is also very reasonable compared to other clinics.",
  },
  {
    name: "Anita Singh",
    position: "Kurla",
    image: "",
    rating: 5,
    feedback:
      "I've been coming to Aartiket for my hearing check-ups for over a year now. The service is consistent, professional, and the results speak for themselves. The team truly cares about their patients' well-being.",
  },
];

const Testimonials = () => {
  return (
    <Box as="section" py={{ base: 6, md: 20 }} bg="">
      <Container maxW="8xl" px={{ base: 4, md: 10 }}>
        {/* Section Header */}
        <VStack spacing={3} textAlign="center">
          <Text fontSize="sm" color="#3AC0E7" fontWeight="semibold">
            Testimonials
          </Text>
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="#0C2F4D"
            maxW="4xl"
          >
            What Patients Say About Best Speech & Hearing
          </Heading>
        </VStack>

        {/* Carousel */}
        <Splide
          options={{
            type: "loop",
            perPage: 3,
            perMove: 1,
            gap: "30px",
            arrows: false,
            autoplay: true,
            interval: 1500,
            pagination: false,
            breakpoints: {
              992: { perPage: 2 },
              572: { perPage: 1 },
            },
          }}
          className="chakra-splide"
          style={{ marginTop: "2.5rem" }}
        >
          {testimonials.map((testimonial, index) => (
            <SplideSlide key={index}>
              <Box
                bg="white"
                p={6}
                textAlign="left"
                shadow="md"
                borderRadius="lg"
                transition="all 0.2s"
                _hover={{ bg: "#3AC0E7", color: "white", shadow: "lg" }}
              >
                {/* Quote Icon */}
                <RiDoubleQuotesL
                  size={28}
                  color="#043152"
                  style={{ marginBottom: "0.5rem" }}
                />

                {/* Rating */}
                <Flex mb={2} color="yellow.400" fontSize="lg">
                  {Array(testimonial.rating)
                    .fill()
                    .map((_, i) => (
                      <Box as="span" key={i}>
                        ★
                      </Box>
                    ))}
                </Flex>

                {/* Feedback */}
                <Text mb={4} color="gray.600" _groupHover={{ color: "white" }}>
                  {testimonial.feedback}
                </Text>

                {/* User Info */}
                <Flex align="center" gap={3}>
                  {testimonial.image ? (
                    <Avatar
                      src={testimonial.image}
                      name={testimonial.name}
                      size="md"
                    />
                  ) : (
                    <Avatar
                      name={testimonial.name}
                      size="md"
                      bg="gray.300"
                      color="gray.700"
                    />
                  )}

                  <Box>
                    <Text
                      fontWeight="bold"
                      color="black"
                      _groupHover={{ color: "white" }}
                    >
                      {testimonial.name}
                    </Text>
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      _groupHover={{ color: "white" }}
                    >
                      {testimonial.position}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </SplideSlide>
          ))}
        </Splide>
      </Container>
    </Box>
  );
};

export default Testimonials;
