'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

type Plan = {
  label: string
  price: { monthly: string; annual: string }
  tagline: string
  features: string[]
  cta: string
  ctaStyle: 'ghost' | 'primary'
  badge?: string
  highlight?: boolean
}

const PLANS: Plan[] = [
  {
    label: 'AuthFlow Basic',
    price: { monthly: 'Free', annual: 'Free' },
    tagline: 'For solo use with light needs.',
    features: ['10 prior auths / month', 'Top 5 payers', 'No credit card required'],
    cta: 'Start for Free',
    ctaStyle: 'ghost',
  },
  {
    label: 'AuthFlow Pro',
    price: { monthly: '$249', annual: '$199' },
    tagline: 'For busy doctors & growing practices.',
    features: [
      'Unlimited prior auths',
      'All major payers',
      'Appeal letter generator',
      'Denial tracking + status log',
      'Priority support',
    ],
    cta: 'Start 2-Week Trial',
    ctaStyle: 'primary',
    badge: 'Save $598',
    highlight: true,
  },
  {
    label: 'AuthFlow Enterprise',
    price: { monthly: 'Flexible', annual: 'Flexible' },
    tagline: 'For practices, clinics and beyond.',
    features: ['Discounted pricing', 'Custom features', 'Priority support', 'Deployment options'],
    cta: 'Talk to us',
    ctaStyle: 'ghost',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const { ref, isInView } = useScrollReveal()
  const router = useRouter()

  return (
    <section
      ref={ref}
      id="pricing"
      style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-inter)' }}
    >
      <div style={{
        position: 'absolute', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 800, height: 300,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 800,
          color: '#0f172a',
          textAlign: 'center',
          marginBottom: 32,
          position: 'relative', zIndex: 1,
        }}
      >
        Flexible pricing
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}
      >
        <div style={{
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 999,
          padding: 4,
          display: 'inline-flex',
        }}>
          {['Monthly', 'Annual'].map(label => {
            const isActive = (label === 'Annual') === annual
            return (
              <button
                key={label}
                onClick={() => setAnnual(label === 'Annual')}
                style={{
                  padding: '8px 24px', borderRadius: 999,
                  fontSize: '0.875rem', fontWeight: 500,
                  border: 'none', cursor: 'pointer',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? 'white' : '#64748b',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        alignItems: 'stretch',
        position: 'relative', zIndex: 1,
      }}>
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
            whileHover={
              plan.highlight
                ? { scale: 1.03, boxShadow: '0 0 80px rgba(37,99,235,0.2)' }
                : { y: -4, scale: 1.01 }
            }
            style={{
              background: plan.highlight ? 'rgba(37,99,235,0.06)' : 'rgba(255,255,255,0.7)',
              border: plan.highlight
                ? '1px solid rgba(37,99,235,0.4)'
                : '1px solid rgba(59,130,246,0.1)',
              borderRadius: 24, padding: 36,
              boxShadow: plan.highlight ? '0 0 60px rgba(37,99,235,0.12)' : 'none',
              backdropFilter: 'blur(20px)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ color: plan.highlight ? '#1d4ed8' : '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                {plan.label}
              </span>
              {plan.highlight && (
                <span style={{
                  background: 'rgba(37,99,235,0.1)',
                  border: '1px solid rgba(37,99,235,0.25)',
                  color: '#1d4ed8',
                  fontSize: '0.68rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 999,
                  letterSpacing: '0.04em',
                }}>
                  MOST POPULAR
                </span>
              )}
              {plan.badge && annual && (
                <span style={{
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: '#059669',
                  fontSize: '0.7rem', fontWeight: 600,
                  padding: '2px 8px', borderRadius: 999,
                }}>
                  {plan.badge}
                </span>
              )}
            </div>

            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a' }}>
                {annual ? plan.price.annual : plan.price.monthly}
              </span>
              {plan.price.monthly !== 'Free' && plan.price.monthly !== 'Flexible' && (
                <span style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: 4 }}>/mo</span>
              )}
            </div>

            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 24 }}>{plan.tagline}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, flex: 1 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Check size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            {plan.ctaStyle === 'primary' ? (
              <>
                <motion.button
                  onClick={() => router.push('/signin')}
                  whileHover={{ boxShadow: '0 0 40px rgba(37,99,235,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: '#2563eb', color: 'white',
                    border: 'none', borderRadius: 10,
                    padding: 14, width: '100%',
                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(37,99,235,0.3)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {plan.cta}
                </motion.button>
                <p style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center', marginTop: 10 }}>
                  No credit card required
                </p>
              </>
            ) : (
              <motion.button
                onClick={() => router.push('/signin')}
                whileHover={{ background: 'rgba(59,130,246,0.12)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  color: '#1d4ed8', borderRadius: 10,
                  padding: 14, width: '100%',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {plan.cta}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
