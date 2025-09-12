import React from 'react';
import { assets } from '../../../assets/assets';
import About1 from '../Components/About';
import Features from '../Components/Features';
import PageHeader from '../Components/PageHeader';
import CTA from '../Components/CTA';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import AboutSeoSection from '../Components/AboutSeoSection';

const About = () => {
  return (
    <>
      <Navbar />
      <PageHeader
        title="About Best Speech & Hearing"
        description="Learn about our patient-first care, advanced diagnostics, and compassionate team."
        crumbs={[{ label: 'About' }]}
        bgImage={assets.about_1}
      />
      <Features />
      <AboutSeoSection />
      <About1 />
      <CTA />
      <Footer />
    </>
  );
};

export default About;
