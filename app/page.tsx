import Nav from '@/components/marketing/Nav'
import Hero from '@/components/marketing/Hero'
import Stats from '@/components/marketing/Stats'
import HowItWorks from '@/components/marketing/HowItWorks'
import Appeal from '@/components/marketing/Appeal'
import Comparison from '@/components/marketing/Comparison'
import Testimonials from '@/components/marketing/Testimonials'
import Pricing from '@/components/marketing/Pricing'
import Hipaa from '@/components/marketing/Hipaa'
import FinalCTA from '@/components/marketing/FinalCTA'
import Footer from '@/components/marketing/Footer'

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <Appeal />
      <Comparison />
      <Testimonials />
      <Pricing />
      <Hipaa />
      <FinalCTA />
      <Footer />
    </>
  )
}
