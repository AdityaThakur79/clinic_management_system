import React, { useEffect } from 'react';
import { assets } from '../../../assets/assets';
import About1 from '../Components/About';
import About2 from '../Components/About2';
import Features from '../Components/Features';
import PageHeader from '../Components/PageHeader';
import CTA from '../Components/CTA';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import AboutSeoSection from '../Components/AboutSeoSection';

const About = () => {
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
        title="About Aartiket Speech & Hearing Care"
        description="Expert audiology and speech therapy with modern diagnostics, personalized fittings, and compassionate follow‑ups across Mumbai."
        crumbs={[{ label: 'About' }]}
        bgImage={assets.about_1}
      />
      <div
        data-animate
        id="about2-section"
        style={{
          opacity: isVisible['about2-section'] ? 1 : 0,
          transform: isVisible['about2-section'] ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <About2 />
      </div>
      <div
        data-animate
        id="about-seo-section"
        style={{
          opacity: isVisible['about-seo-section'] ? 1 : 0,
          transform: isVisible['about-seo-section'] ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <AboutSeoSection />
      </div>
      <div
        data-animate
        id="features-section"
        style={{
          opacity: isVisible['features-section'] ? 1 : 0,
          transform: isVisible['features-section'] ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <Features />
      </div>
      {/* <About1 /> */}
      <div
        data-animate
        id="cta-section"
        style={{
          opacity: isVisible['cta-section'] ? 1 : 0,
          transform: isVisible['cta-section'] ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s ease-out'
        }}
      >
        <CTA />
      </div>
      <div
        data-animate
        id="footer-section"
        style={{
          opacity: isVisible['footer-section'] ? 1 : 0,
          transform: isVisible['footer-section'] ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <Footer />
      </div>
    </>
  );
};

export default About;
