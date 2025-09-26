import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Container,
  Text,
  Heading,
  VStack,
  SimpleGrid,
  Button,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { assets } from "../../../assets/assets";
import { hearingAidBrands } from "../../../data/hearingAidBrands";

const brand = {
  primary: "#3AC0E7",
  primaryDark: "#2BA8D1",
  textDark: "#0C2F4D",
  bgSoft: "#F7FBFD",
};

const AREA_ALIASES = {
  "andheri-east": "Andheri East",
  "andheri-west": "Andheri West",
  "bandra-east": "Bandra East",
  "bandra-west": "Bandra West",
  juhu: "Juhu",
  powai: "Powai",
  "borivali-east": "Borivali East",
  "borivali-west": "Borivali West",
  "kandivali-east": "Kandivali East",
  "kandivali-west": "Kandivali West",
  "malad-east": "Malad East",
  "malad-west": "Malad West",
  "goregaon-east": "Goregaon East",
  "goregaon-west": "Goregaon West",
  "dadar-east": "Dadar East",
  "dadar-west": "Dadar West",
  worli: "Worli",
  "lower-parel": "Lower Parel",
  colaba: "Colaba",
  fort: "Fort",
  chembur: "Chembur",
  "ghatkopar-east": "Ghatkopar East",
  "ghatkopar-west": "Ghatkopar West",
  "mulund-east": "Mulund East",
  "mulund-west": "Mulund West",
  bhandup: "Bhandup",
  vikhroli: "Vikhroli",
  kurla: "Kurla",
  sion: "Sion",
  "santacruz-east": "Santacruz East",
  "santacruz-west": "Santacruz West",
  "vile-parle-east": "Vile Parle East",
  "vile-parle-west": "Vile Parle West",
  "charni-road": "Charni Road",
  "marine-lines": "Marine Lines",
  "grant-road": "Grant Road",
  byculla: "Byculla",
  mazgaon: "Mazgaon",
  "matunga-east": "Matunga East",
  "matunga-west": "Matunga West",
  sewri: "Sewri",
  parel: "Parel",
};

function titleCaseArea(slug) {
  if (AREA_ALIASES[slug]) return AREA_ALIASES[slug];
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

const serviceKeywords = [
  "hearing aids",
  "hearing aid fitting",
  "hearing test",
  "audiometry PTA",
  "BERA ABR test",
  "OAE test",
  "speech therapy",
  "tinnitus treatment",
];

export default function LocationSEO() {
  const { areaSlug } = useParams();
  const areaName = titleCaseArea(areaSlug || "Mumbai");

  const pageTitle = `Hearing Aids, Hearing Test & Speech Therapy in ${areaName}, Mumbai`;
  const pageDesc = `Looking for hearing aids, hearing tests or speech therapy in ${areaName}? Get expert audiology care, advanced diagnostics (PTA, OAE, BERA), hearing aid fitting and speech therapy at our Mumbai clinic.`;

  const keywords = [
    `${areaName} hearing aids`,
    `${areaName} hearing test`,
    `${areaName} speech therapy`,
    `${areaName} audiologist`,
    `${areaName} BERA test`,
    `${areaName} OAE test`,
    `${areaName} tinnitus clinic`,
    `${areaName} best hearing aid center`,
  ];

  const faqs = [
    {
      q: `Do you provide hearing tests in ${areaName}, Mumbai?`,
      a: `Yes. We offer comprehensive audiometry (PTA), tympanometry, OAE and BERA. Appointments are usually available within 24–72 hours for patients from ${areaName}.`,
    },
    {
      q: `What hearing aid brands are available near ${areaName}?`,
      a: `We fit Signia, Phonak, ReSound, Oticon, Unitron and Widex with real‑ear verification, trial support and local after‑sales service for patients from ${areaName}.`,
    },
    {
      q: `How much does a hearing test cost in ${areaName}?`,
      a: `Pricing depends on the test protocol; we keep it transparent and affordable. Contact us for the latest Mumbai pricing and available offers.`,
    },
    {
      q: `Is speech therapy available for children and adults in ${areaName}?`,
      a: `Yes. We provide child‑friendly and adult speech therapy including articulation, fluency, voice and aural rehabilitation, convenient for ${areaName} residents.`,
    },
  ];

  return (
    <>
      <head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={[...keywords, ...serviceKeywords.map(k=>`${k} ${areaName}`)].join(", ")} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalBusiness',
            name: pageTitle,
            description: pageDesc,
            areaServed: { '@type': 'City', name: 'Mumbai' },
            keywords: [...keywords, ...serviceKeywords.map(k=>`${k} ${areaName}`)].join(', '),
            serviceType: 'Audiology, Speech Therapy, Diagnostics',
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
              { '@type': 'ListItem', position: 2, name: 'Mumbai', item: '/mumbai' },
              { '@type': 'ListItem', position: 3, name: areaName, item: `/mumbai/${areaSlug}` },
            ],
          })}
        </script>
      </head>

      <Box>
        <Navbar />

        {/* Hero (image + content) */}
        <Box as="section" py={{ base: 12, md: 20 }} bg={brand.bgSoft}>
          <Container maxW="7xl">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
              <VStack spacing={6} align="start">
                <Heading fontSize={{ base: "2xl", md: "4xl" }} color={brand.textDark}>
                  Hearing Aids, Tests & Speech Therapy in {areaName}
                </Heading>
                <Text fontSize={{ base: "md", md: "lg" }} color="gray.700" maxW="2xl">
                  Expert audiology care for {areaName} residents. Advanced diagnostics (PTA, OAE, BERA),
                  professional hearing aid fitting, and evidence‑based speech therapy in Mumbai.
                </Text>
                <HStack spacing={4}>
                  <Button as={Link} to="/doctors" bg={brand.primary} color="white" _hover={{ bg: brand.primaryDark }}>Book Appointment</Button>
                  <Button as={Link} to="/contact" variant="outline" borderColor={brand.primary} color={brand.textDark}>Contact Us</Button>
                </HStack>
              </VStack>
              <Box>
                <Box as="img" src={assets.audiologist2} alt="Audiology in Mumbai" style={{ width: '100%', height: 'auto', borderRadius: '16px', boxShadow: '0 20px 40px rgba(12,47,77,0.12)' }} />
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        {/* Services Snapshot */}
        <Box as="section" py={{ base: 12, md: 20 }} bg="white">
          <Container maxW="7xl">
            <VStack spacing={10}>
              <Heading color={brand.textDark} fontSize={{ base: "xl", md: "3xl" }}>What We Offer Near {areaName}</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%">
                {[
                  { t: "Hearing Tests & Diagnostics", d: "PTA, Tympanometry, OAE, BERA with detailed reports.", img: assets.audiologist_test, to: "/service/hearing-tests-audiometry-pta" },
                  { t: "Hearing Aids & Fitting", d: "Signia, Phonak, ReSound, Oticon, Unitron, Widex with real‑ear verification.", img: assets.fitting, to: "/service/hearing-aid-fitting-programming" },
                  { t: "Speech Therapy", d: "Articulation, fluency, voice and aural rehabilitation for all ages.", img: assets.service_4, to: "/service/speech-training-aural-rehabilitation" },
                ].map((card, i) => (
                  <Box key={i} p={0} borderRadius="2xl" shadow="lg" border="1px solid rgba(12,47,77,0.06)" overflow="hidden">
                    <Box as={Link} to={card.to} display="block">
                      <Box as="img" src={card.img} alt={card.t} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                      <Box p={6}>
                        <Heading as="h3" fontSize="xl" color={brand.textDark} mb={2}>{card.t}</Heading>
                        <Text color="gray.700">{card.d}</Text>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Brands We Fit */}
        <Box as="section" py={{ base: 12, md: 20 }} bg={brand.bgSoft}>
          <Container maxW="7xl">
            <VStack spacing={8}>
              <Heading color={brand.textDark} fontSize={{ base: "xl", md: "3xl" }}>Top Hearing Aid Brands We Fit</Heading>
              <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={6} w="100%">
                {hearingAidBrands.slice(0, 6).map((b) => (
                  <Box key={b.brandSlug} as={Link} to={`/hearing-aids/${b.brandSlug}`} bg="white" borderRadius="xl" p={4} shadow="md" border="1px solid rgba(12,47,77,0.06)" textAlign="center" _hover={{ shadow: 'lg', transform: 'translateY(-3px)' }} transition="all 0.2s ease">
                    <Box as="img" src={b.logo} alt={b.brandName} style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto' }} />
                    <Text mt={2} fontSize="sm" color={brand.textDark} fontWeight="semibold">{b.brandName}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Why Choose Us (localized) */}
        <Box as="section" py={{ base: 12, md: 20 }} bg={brand.bgSoft}>
          <Container maxW="7xl">
            <VStack spacing={8}>
              <Heading color={brand.textDark} fontSize={{ base: "xl", md: "3xl" }}>Why Patients from {areaName} Choose Us</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
                {[
                  "Same‑week appointments",
                  "Transparent pricing",
                  "Brand‑agnostic recommendations",
                  "Local after‑sales support",
                ].map((item, i) => (
                  <Box key={i} p={6} bg="white" borderRadius="2xl" shadow="md" border="1px solid rgba(12,47,77,0.06)">
                    <Text color="gray.800">• {item}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* FAQs */}
        <Box as="section" py={{ base: 12, md: 20 }} bg="white">
          <Container maxW="7xl">
            <VStack spacing={8} align="stretch">
              <Heading color={brand.textDark} textAlign="center">FAQs for {areaName}</Heading>
              <Accordion allowMultiple>
                {faqs.map((f, idx) => (
                  <AccordionItem key={idx} border="1px solid rgba(12,47,77,0.06)" borderRadius="lg" overflow="hidden" bg="white">
                    <h3>
                      <AccordionButton _expanded={{ bg: brand.bgSoft }} px={6} py={4}>
                        <Box as="span" flex="1" textAlign="left" color={brand.textDark} fontWeight="semibold">{f.q}</Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h3>
                    <AccordionPanel px={6} pb={4}>
                      <Text color="gray.700">{f.a}</Text>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </VStack>
          </Container>
        </Box>

        {/* CTA */}
        <Box as="section" py={{ base: 12, md: 16 }} bgGradient={`linear(to-r, ${brand.primary}, ${brand.primaryDark})`}>
          <Container maxW="7xl">
            <VStack spacing={6} color="white" textAlign="center">
              <Heading fontSize={{ base: "xl", md: "3xl" }}>Ready to book your visit near {areaName}?</Heading>
              <HStack spacing={4}>
                <Button as={Link} to="/doctors" bg="white" color={brand.textDark} _hover={{ bg: '#F1FAFE' }}>Book Appointment</Button>
                <Button as={Link} to="/contact" variant="outline" borderColor="white" color="white">Contact Us</Button>
              </HStack>
            </VStack>
          </Container>
        </Box>

        {/* Keyword Cloud Footer (very light) */}
        <Box py={8} bg="white">
          <Container maxW="7xl">
            <Text fontSize="sm" color="gray.400" opacity={0.6} textAlign="center" lineHeight="taller">
              {[...new Set([...serviceKeywords, ...serviceKeywords.map(k=>`${k} ${areaName}`), ...keywords])].join(" • ")}
            </Text>
          </Container>
        </Box>

        <Footer />

        {/* Popular searches (extra strip below footer) */}
        <Box py={6} bg="white" display="none">
          <Container maxW="7xl">
            <Text fontSize="xs" color="gray.400" opacity={0.6} textAlign="center" lineHeight="taller">
              Popular searches: {[...new Set([
                `${areaName} hearing aids`,
                `${areaName} hearing aid fitting`,
                `${areaName} audiologist near me`,
                `${areaName} hearing test PTA`,
                `${areaName} BERA ABR test`,
                `${areaName} OAE test`,
                `${areaName} speech therapy`,
                `${areaName} tinnitus treatment`,
              ])].join(" • ")}
            </Text>
          </Container>
        </Box>
      </Box>
    </>
  );
}


