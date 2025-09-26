import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  Image,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  useDisclosure,
  useToast,
  Box,
  Flex,
} from "@chakra-ui/react";
import { assets } from "../../../assets/assets";
import { useGetAllBranchesQuery } from "../../../features/api/branchApi";
import { useCreateAppointmentMutation } from "../../../features/api/appointments";

const brand = {
  primary: "#3AC0E7",
  primaryDark: "#2BA8D1",
};

export default function PopupAppointmentModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { data: branchesData } = useGetAllBranchesQuery();
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const [form, setForm] = React.useState({ name: "", phone: "", branchId: "", preferredDate: "" });

  // Show once per session after 30s
  React.useEffect(() => {
    const flag = sessionStorage.getItem("popup_appointment_shown");
    const timer = setTimeout(() => {
      if (!flag) {
        onOpen();
        sessionStorage.setItem("popup_appointment_shown", "1");
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [onOpen]);

  const handleChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  // Doctor selection is optional; we won't fetch or require it

  const handleSubmit = async () => {
    if (!form.phone || !form.branchId) {
      toast({ title: "Please fill phone and preferred branch.", status: "warning" });
      return;
    }
    try {
      const isoDate = (form.preferredDate && new Date(form.preferredDate).toISOString()) || new Date().toISOString();
      await createAppointment({
        name: form.name || undefined,
        phone: form.phone,
        branchId: form.branchId,
        // doctorId intentionally omitted (optional)
        date: isoDate,
        timeSlot: "Any",
        notes: "Quick popup appointment request",
        patient: { name: form.name || "Website Lead", contact: form.phone },
      }).unwrap();
      toast({ title: "Appointment request sent!", status: "success" });
      onClose();
    } catch (e) {
      toast({ title: "Failed to submit. Please try again.", status: "error" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} isCentered>
      <ModalOverlay />
      <ModalContent
        mx={{ base: 4, md: 0 }}
        p={0}
        overflow="hidden"
        maxW={{ base: "100%", md: "900px" }}
        h={{ md: "auto" }}
      >
        <ModalCloseButton zIndex={10} />
        <Flex direction={{ base: "column", md: "row" }} h="100%">
          {/* Left image - hidden on mobile */}
          <Box 
            display={{ base: 'none', md: 'block' }} 
            flex="0 0 40%" 
            position="relative"
          >
            <Image 
              src={assets.audiologist2} 
              alt="Book Appointment" 
              h="100%" 
              w="100%" 
              objectFit="cover" 
            />
          </Box>
          
          {/* Right form section */}
          <Box flex="1" display="flex" flexDirection="column">
            <ModalBody flex="1" px={{ base: 6, md: 6 }} py={{ base: 6, md: 8 }}>
              <VStack spacing={4} align="stretch" h="100%">
                <Box>
                  <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="semibold">
                    Book a quick appointment
                  </Text>
                  <Text color="gray.600" fontSize="sm" mt={1}>
                    Minimum details, we will call you back.
                  </Text>
                </Box>
                
                <VStack spacing={4} align="stretch" flex="1">
                  <FormControl>
                    <FormLabel fontSize="sm">Full name</FormLabel>
                    <Input 
                      value={form.name} 
                      onChange={handleChange("name")} 
                      placeholder="Your name" 
                      size="md" 
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Phone</FormLabel>
                    <Input 
                      value={form.phone} 
                      onChange={handleChange("phone")} 
                      placeholder="Your phone" 
                      size="md" 
                      type="tel" 
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Preferred branch</FormLabel>
                    <Select 
                      value={form.branchId} 
                      onChange={handleChange("branchId")} 
                      placeholder="Select branch" 
                      size="md"
                    >
                      {branchesData?.branches?.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.branchName} - {b.address}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Preferred date (optional)</FormLabel>
                    <Input 
                      type="date" 
                      value={form.preferredDate} 
                      onChange={handleChange("preferredDate")} 
                      size="md" 
                      min={new Date().toISOString().split('T')[0]} 
                    />
                  </FormControl>
                  
                  <Box fontSize="xs" color="gray.500" mt="auto">
                    By submitting, you agree to be contacted by our team.
                  </Box>
                </VStack>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button 
                bg={brand.primary} 
                color="white" 
                _hover={{ bg: brand.primaryDark }} 
                onClick={handleSubmit} 
                isLoading={isLoading}
              >
                Submit
              </Button>
            </ModalFooter>
          </Box>
        </Flex>
      </ModalContent>
    </Modal>
  );
}