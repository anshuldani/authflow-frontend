'use client'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const TESTIMONIALS = [
  {
    quote: `In our cardiology department, a single prior authorization takes close to an hour — even for experienced staff. At the smaller clinic where I also work, there's simply no one with the time or knowledge to find the correct CPT codes or match the clinical language to what the payer requires. Errors are common. Denials follow. Patients wait weeks. What AuthFlow is building addresses something I see cause real harm every single day. If it gets the codes right and gets that hour down to 30 seconds, it will be one of the most useful things to come into this space in years.`,
    name: 'Dr. Bijal Mishra',
    role: 'Lead Nurse Practitioner · Kaiser Permanente, LA',
  },
  {
    quote: `It is a long process — the pharmacist takes about an hour to finish a form. They take the clinical notes from Epic and the patient's insurance card to write up the form. Smaller clinics, maybe 10 or fewer doctors, can't afford Epic at $85,000 a month, so they still handwrite all their notes. The pharmacist handles all of it. I see about 20 patients a day and a good amount need prior authorization. This sounds really helpful for them. AuthFlow is much easier to work with and saves time of going through nearly 16,000 CPT codes for the prior auth to not be denied just because of a clerical error.`,
    name: 'Dr. Jasson Barrios, MD',
    role: 'Internal Medicine · Mayo Clinic',
  },
]

export default function Testimonials() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section
      ref={ref}
      id="testimonials"
      style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-inter)' }}
    >
      <div style={{
        position: 'absolute', top: 0, right: '-60px',
        width: 400, height: 400,
        background: 'radial-gradient(ellipse, rgba(196,181,253,0.35) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 800,
          color: '#0f172a',
          textAlign: 'center',
          maxWidth: 640,
          margin: '0 auto 48px',
          lineHeight: 1.3,
          position: 'relative', zIndex: 1,
        }}
      >
        Based on early feedback from the names you know and trust
      </motion.h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        perspective: 1000,
        position: 'relative', zIndex: 1,
      }}>
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 40, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            style={{
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(59,130,246,0.1)',
              borderRadius: 20,
              padding: 36,
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: 100, height: 100, borderRadius: '50%',
              background: 'rgba(59,130,246,0.06)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }} />

            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <User size={20} color="#64748b" />
            </div>

            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.8, fontStyle: 'italic' }}>
              &ldquo;{t.quote}&rdquo;
            </p>

            <div style={{
              borderTop: '1px solid rgba(59,130,246,0.1)',
              marginTop: 24, paddingTop: 20,
            }}>
              <p style={{ color: '#0f172a', fontWeight: 700, marginBottom: 2 }}>{t.name}</p>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
