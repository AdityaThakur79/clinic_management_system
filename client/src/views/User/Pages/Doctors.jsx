import React, { useEffect } from 'react';
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