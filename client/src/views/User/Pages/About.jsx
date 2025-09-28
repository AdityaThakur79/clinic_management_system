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
import TopDoctors from '../Components/TopDoctors';
import { useGetSettingsQuery } from '../../../features/api/settingsApi';

const About = () => {
  const [isVisible, setIsVisible] = React.useState({});
  const { data: settingsData, isLoading: isSettingsLoading, error: settingsError, refetch: refetchSettings } = useGetSettingsQuery();
  const showDoctorsOnAboutPage = settingsData?.settings?.displaySettings?.showDoctorsOnAboutPage ?? true;

  // Refetch settings on component mount to ensure we have the latest data
  useEffect(() => {
    refetchSettings();
  }, [refetchSettings]);

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

  // Show loading state while settings are being fetched
  if (isSettingsLoading) {
    return (
      <>
        <Navbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading settings...
        </div>
        <Footer />
      </>
    );
  }

  // Show error state if settings failed to load
  if (settingsError) {
    return (
      <>
        <Navbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Error loading settings. Using default configuration.
        </div>
        <Footer />
      </>
    );
  }

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
          opacity: isVisible['about2-section'] !== undefined ? (isVisible['about2-section'] ? 1 : 0) : 1,
          transform: isVisible['about2-section'] !== undefined ? (isVisible['about2-section'] ? 'translateY(0)' : 'translateY(30px)') : 'translateY(0)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <About2 />
      </div>
      <div
        data-animate
        id="about-seo-section"
        style={{
          opacity: isVisible['about-seo-section'] !== undefined ? (isVisible['about-seo-section'] ? 1 : 0) : 1,
          transform: isVisible['about-seo-section'] !== undefined ? (isVisible['about-seo-section'] ? 'translateY(0)' : 'translateY(30px)') : 'translateY(0)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <AboutSeoSection />
      </div>
      <div
        data-animate
        id="features-section"
        style={{
          opacity: isVisible['features-section'] !== undefined ? (isVisible['features-section'] ? 1 : 0) : 1,
          transform: isVisible['features-section'] !== undefined ? (isVisible['features-section'] ? 'translateY(0)' : 'translateY(30px)') : 'translateY(0)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <Features />
      </div>
      
      {/* Top Doctors Section - Conditionally rendered */}
      {showDoctorsOnAboutPage && (
        <div
          data-animate
          id="top-doctors-section"
          style={{
            opacity: isVisible['top-doctors-section'] !== undefined ? (isVisible['top-doctors-section'] ? 1 : 0) : 1,
            transform: isVisible['top-doctors-section'] !== undefined ? (isVisible['top-doctors-section'] ? 'translateY(0)' : 'translateY(30px)') : 'translateY(0)',
            transition: 'all 0.8s ease-out'
          }}
        >
          <TopDoctors />
        </div>
      )}
      
      {/* <About1 /> */}
      <div
        data-animate
        id="cta-section"
        style={{
          opacity: isVisible['cta-section'] !== undefined ? (isVisible['cta-section'] ? 1 : 0) : 1,
          transform: isVisible['cta-section'] !== undefined ? (isVisible['cta-section'] ? 'translateY(0)' : 'translateY(50px)') : 'translateY(0)',
          transition: 'all 1s ease-out'
        }}
      >
        <CTA />
      </div>
      <div
        data-animate
        id="footer-section"
        style={{
          opacity: isVisible['footer-section'] !== undefined ? (isVisible['footer-section'] ? 1 : 0) : 1,
          transform: isVisible['footer-section'] !== undefined ? (isVisible['footer-section'] ? 'translateY(0)' : 'translateY(30px)') : 'translateY(0)',
          transition: 'all 0.8s ease-out'
        }}
      >
        <Footer />
      </div>
    </>
  );
};

export default About;
