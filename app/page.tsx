'use client'
import { motion } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import ParticleField from '@/components/marketing/ParticleField'
import Navbar from '@/components/marketing/Navbar'
import Hero from '@/components/marketing/Hero'
import Features from '@/components/marketing/Features'
import HowItWorks from '@/components/marketing/HowItWorks'
import Testimonials from '@/components/marketing/Testimonials'
import Pricing from '@/components/marketing/Pricing'
import Footer from '@/components/marketing/Footer'

function AnimatedDivider() {
  const { ref, isInView } = useScrollReveal(0.5)
  return (
    <div ref={ref} style={{ display: 'flex', justifyContent: 'center', padding: '0 40px' }}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isInView ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          height: 1,
          width: '100%',
          maxWidth: 1200,
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)',
          transformOrigin: 'left',
        }}
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <div style={{ position: 'relative', background: '#f0f7ff', minHeight: '100vh' }}>
      <ParticleField />

      <div style={{
        position: 'fixed', top: '-150px', left: '-200px',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,197,253,0.5) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: '50px', right: '-150px',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,181,253,0.3) 0%, transparent 70%)',
        filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: '80vh', left: '30%',
        width: 800, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(125,211,252,0.25) 0%, transparent 70%)',
        filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: '200vh', right: '10%',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,197,253,0.2) 0%, transparent 70%)',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Hero />
        <AnimatedDivider />
        <Features />
        <AnimatedDivider />
        <HowItWorks />
        <AnimatedDivider />
        <Testimonials />
        <AnimatedDivider />
        <Pricing />
        <Footer />
      </div>
    </div>
  )
}
