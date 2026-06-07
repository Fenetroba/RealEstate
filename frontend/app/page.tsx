import React from 'react';

import HeroSection from '@/components/home/HeroSection';

import FeaturedProperties from '@/components/home/FeaturedProperties';

import WhyEdenetSection from '@/components/home/WhyEdenetSection';

import LandingServicesSection from '@/components/home/LandingServicesSection';

import CtaSection from '@/components/home/CtaSection';

import Footer from '@/components/layout/Footer';

import Navbar from '@/components/layout/Navbar';



export default function HomePage() {

  return (

    <>

      <div className="relative">

        <HeroSection />

        <Navbar />

      </div>

      <main className="bg-background">

        <FeaturedProperties />

        <WhyEdenetSection />

        <LandingServicesSection />

        <CtaSection />

      </main>

      <Footer />

    </>

  );

}

