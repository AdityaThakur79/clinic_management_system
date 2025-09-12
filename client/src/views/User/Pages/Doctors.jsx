import React from 'react';
import { assets } from '../../../assets/assets';
import About1 from '../Components/About';
import Features from '../Components/Features';
import PageHeader from '../Components/PageHeader';
import CTA from '../Components/CTA';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import AboutSeoSection from '../Components/AboutSeoSection';
import TopDoctors from '../Components/TopDoctors';

const Doctors = () => {
  return (
    <>
      <Navbar />
      <PageHeader
        title="Our Expert Doctors"
        description="Meet our experienced team of speech and hearing specialists dedicated to providing exceptional care and personalized treatment."
        crumbs={[{ label: 'Doctors' }]}
        bgImage={assets.about_1}
      />
      <TopDoctors/>
      <Footer/>
      </>
  )}

export default Doctors;