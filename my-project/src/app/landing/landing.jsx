"use client"

// import { ThemeProvider } from "../components/theme-provider"
import { Navigation } from "./navigation"
import  HeroSection  from "./hero-section"
import  DemoCarousel  from "./demo-carousel"
import  {FeaturesSection}  from "./features-section"
import  HowItWorks  from "./how-it-works.jsx"
// import { PricingSection } from "../components/pricing-section"
// import { TestimonialsSection } from "../components/testimonials-section"
// import { Footer } from "../components/footer"
// import {Component} from "../components/nav"

export default function LandingPage() {
  return (
    // <ThemeProvider defaultTheme="dark" storageKey="code-sprout-theme">
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-300">
        <Navigation />
        <HeroSection />
         <DemoCarousel />
      <FeaturesSection />
      <HowItWorks />
       {/*
        <PricingSection />
        <TestimonialsSection /> */}
        {/* <Footer /> */}
      </div>
  )
}
