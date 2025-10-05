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
import { useCreateAppointmentMutation, useGetMultipleDateAvailabilityQuery } from "../../../features/api/appointments";

const brand = {
  primary: "#3AC0E7",
  primaryDark: "#2BA8D1",
};

export default function PopupAppointmentModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { data: branchesData } = useGetAllBranchesQuery();
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const [form, setForm] = React.useState({ 
    name: "", 
    phone: "", 
    email: "",
    branchId: "", 
    preferredDate: "",
    preferredTime: "09:00"
  });

  // Availability-driven date/time like HearingAidBrand
  const [selectedDate, setSelectedDate] = React.useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = React.useState([]);

  const { data: availabilityData, isLoading: isAvailabilityLoading } = useGetMultipleDateAvailabilityQuery(
    {
      branchId: form.branchId,
      startDate: new Date().toISOString().split("T")[0],
      days: 7,
    },
    {
      skip: !form.branchId,
    }
  );

  React.useEffect(() => {
    if (availabilityData?.data && selectedDate) {
      const dayAvailability = availabilityData.data.find((d) => d.date === selectedDate);
      if (dayAvailability?.availableSlots) {
        const slots = dayAvailability.availableSlots
          .filter((s) => s.isAvailable)
          .map((s) => s.time);
        setAvailableTimeSlots(slots);
      } else {
        setAvailableTimeSlots([]);
      }
    }
  }, [availabilityData, selectedDate]);

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

  // Global trigger so any button can open this modal
  React.useEffect(() => {
    const handler = () => onOpen();
    window.addEventListener("open-quick-appointment", handler);
    // expose convenience function
    window.openQuickAppointmentModal = () => {
      window.dispatchEvent(new Event("open-quick-appointment"));
    };
    return () => {
      window.removeEventListener("open-quick-appointment", handler);
      if (window.openQuickAppointmentModal) delete window.openQuickAppointmentModal;
    };
  }, [onOpen]);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    if (key === "branchId") {
      // reset date/time when branch changes
      setSelectedDate("");
      setAvailableTimeSlots([]);
      setForm((p) => ({ ...p, branchId: value, preferredDate: "", preferredTime: "09:00" }));
      return;
    }
    if (key === "preferredDate") {
      setSelectedDate(value);
      setForm((p) => ({ ...p, preferredDate: value }));
      return;
    }
    setForm((p) => ({ ...p, [key]: value }));
  };

  // Doctor selection is optional; we won't fetch or require it

  const handleSubmit = async () => {
    if (!form.phone || !form.branchId) {
      toast({ title: "Please fill phone and preferred branch.", status: "warning" });
      return;
    }
    try {
      // Use date in YYYY-MM-DD format for backend
      const appointmentDate = form.preferredDate || new Date().toISOString().split('T')[0];
      
      // Optional context passed by other components (e.g., style selector)
      const contextNote = typeof window !== 'undefined' && window.quickAppointmentContext?.note
        ? `\nContext: ${window.quickAppointmentContext.note}`
        : "";

      await createAppointment({
        name: form.name || undefined,
        phone: form.phone,
        email: form.email || undefined,
        branchId: form.branchId,
        service: "Quick Consultation Request", // Add required service field
        // doctorId intentionally omitted (optional)
        date: appointmentDate,
        timeSlot: form.preferredTime || "09:00",
        notes: `Consultation request - Quick popup appointment request\nNote: Please schedule at your convenience${contextNote}`,
        patient: { name: form.name || "Website Lead", contact: form.phone, email: form.email || undefined },
      }).unwrap();
      toast({
        title: "Appointment request booked!",
        description:
          "Thank you. You’ll receive an email and WhatsApp confirmation shortly, along with timely reminders before your visit.",
        status: "success",
        duration: 6000,
        isClosable: true,
      });
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
                  <FormControl>
                    <FormLabel fontSize="sm">Email</FormLabel>
                    <Input 
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="Your email (optional)" 
                      size="md" 
                      type="email"
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
                    <Select
                      value={form.preferredDate || ""}
                      onChange={handleChange("preferredDate")}
                      placeholder="Select preferred date"
                      size="md"
                      disabled={!form.branchId}
                    >
                      {availabilityData?.data ? (
                        availabilityData.data
                          .filter((day) => day.isWorkingDay)
                          .map((day) => {
                            const d = new Date(day.date);
                            const label = d.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            });
                            return (
                              <option key={day.date} value={day.date}>
                                {label}
                              </option>
                            );
                          })
                      ) : (
                        <option value="">{isAvailabilityLoading ? "Loading dates..." : "Select a branch first"}</option>
                      )}
                    </Select>
                    {!form.branchId && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Please select a branch first
                      </Text>
                    )}
                    {isAvailabilityLoading && form.branchId && (
                      <Text fontSize="xs" color="blue.500" mt={1}>
                        Loading availability...
                      </Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Preferred time (optional)</FormLabel>
                    <Select
                      value={form.preferredTime || "09:00"}
                      onChange={handleChange("preferredTime")}
                      placeholder="Select preferred time"
                      size="md"
                      disabled={!selectedDate || availableTimeSlots.length === 0}
                    >
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {new Date(`2000-01-01T${slot}`).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </option>
                        ))
                      ) : (
                        <option value="09:00">09:00 AM (Default)</option>
                      )}
                    </Select>
                    {!selectedDate && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Please select a date first
                      </Text>
                    )}
                    {selectedDate && availableTimeSlots.length === 0 && !isAvailabilityLoading && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        No available slots for this date
                      </Text>
                    )}
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