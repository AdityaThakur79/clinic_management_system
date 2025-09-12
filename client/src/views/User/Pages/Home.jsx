import React from 'react'
import HeroSection from '../Components/Herosection'
import Features from '../Components/Features'
import Navbar from '../Components/Navbar'
import About1 from '../Components/About'
import CTA from '../Components/CTA'
import Footer from '../Components/Footer'
import PricingSection from '../Components/PricingSection'
import Services from '../Components/Services'
import Testimonials from '../Components/Testimonials'
import WhyChooseUs from '../Components/WhyChooseUs'
import Process from '../Components/Process'
import About2 from '../Components/About2'
import About3 from '../Components/About3'
import TopDoctors from '../Components/TopDoctors'

const Home = () => {
  return (
    <div>
      <Navbar/>
      <HeroSection/>
      <About1/>
      <WhyChooseUs/>
      <TopDoctors/>
      <PricingSection/>
      <Services/>
      <Process/>
      <About3/>
      <Testimonials/>
      <CTA/>
      <Footer/>
    </div>
  )
}

export default Home
