import React, { useEffect } from "react";
import { Box } from "@chakra-ui/react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import PageHeader from "../Components/PageHeader";
import CTA from "../Components/CTA";
import HearingAidBrands from "../Components/HearingAidBrands";
import HearingAidStyleSelector from "../Components/HearingAidStyleSelector";
import { assets } from "../../../assets/assets";
import PopupAppointmentModal from "../Components/PopupAppointmentModal";

export default function HearingAids() {
  const [isVisible, setIsVisible] = React.useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <Box>
      {/* Mount global quick appointment modal */}
      <PopupAppointmentModal />
      <Navbar />

      <PageHeader
        title="Hearing Aids in Mumbai"
        description="Explore trusted brands, compare styles, and book a consultation with our audiologists."
        crumbs={[{ label: "Hearing Aids" }]}
        bgImage={assets.service_10}
      />

      {/* Brands section */}
      <div data-animate id="brands-section" style={{ opacity: isVisible["brands-section"] ? 1 : 0, transform: isVisible["brands-section"] ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease-out" }}>
        <HearingAidBrands />
      </div>

      {/* Styles section */}
      <div data-animate id="styles-section" style={{ opacity: isVisible["styles-section"] ? 1 : 0, transform: isVisible["styles-section"] ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease-out" }}>
        <HearingAidStyleSelector />
      </div>

      {/* CTA */}
      <div data-animate id="cta-section" style={{ opacity: isVisible["cta-section"] ? 1 : 0, transform: isVisible["cta-section"] ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease-out" }}>
        <CTA />
      </div>

      <Footer />
    </Box>
  );
}


