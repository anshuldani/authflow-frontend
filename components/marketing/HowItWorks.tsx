'use client'
import { motion } from 'framer-motion'
import { Camera, ScanSearch, FileCheck } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const STEPS = [
  {
    number: '1',
    icon: <Camera size={32} color="#3b82f6" />,
    title: 'Capture',
    description: 'Snap or upload clinical notes, insurance cards, and supporting records.',
  },
  {
    number: '2',
    icon: <ScanSearch size={32} color="#3b82f6" />,
    title: 'Extract',
    description: 'We identify patient details, plan information, relevant diagnoses, treatment history, and documentation signals.',
  },
  {
    number: '3',
    icon: <FileCheck size={32} color="#3b82f6" />,
    title: 'Done',
    description: 'AuthFlow generates a prior auth form draft with the right structure, insurer-aware wording, and coding support.',
  },
]

export default function HowItWorks() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section
      ref={ref}
      id="how-it-works"
      style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto', fontFamily: 'var(--font-inter)' }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 800,
          textAlign: 'center',
          color: '#0f172a',
          marginBottom: 48,
        }}
      >
        How it works
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', marginBottom: 48, marginTop: -24 }}
      >
        From scan to submission-ready draft in 30 seconds.
      </motion.p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 24,
      }}>
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(59,130,246,0.1)' }}
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(59,130,246,0.1)',
              borderRadius: 20,
              padding: 32,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  color: '#1d4ed8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 600, flexShrink: 0,
                  cursor: 'default',
                }}
              >
                {step.number}
              </motion.div>
              {step.icon}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#0f172a', margin: '20px 0 8px' }}>
              {step.title}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7 }}>
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
