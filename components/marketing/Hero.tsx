'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FileText, ScanLine } from 'lucide-react'

const HEADLINE_WORDS = ['Patients,', 'not', 'paperwork']

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  border: '1px solid rgba(59,130,246,0.15)',
  borderRadius: 16,
  padding: 20,
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(59,130,246,0.12), 0 4px 16px rgba(0,0,0,0.06)',
  width: 280,
  position: 'relative',
  overflow: 'hidden',
}

export default function Hero() {
  const router = useRouter()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -80])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '120px 24px 80px',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--font-inter)',
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '10%', left: '50%',
          width: 900, height: 500,
          background: 'radial-gradient(ellipse, rgba(147,197,253,0.4) 0%, rgba(196,181,253,0.2) 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'blob-move 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '5%', right: '10%',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(196,181,253,0.35) 0%, rgba(147,197,253,0.15) 50%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'blob-move-reverse 10s ease-in-out infinite',
        }} />
      </div>

      <motion.div
        style={{ y: heroY, opacity: heroOpacity, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 999,
              border: '1px solid rgba(59,130,246,0.2)',
              background: 'rgba(59,130,246,0.08)',
              marginBottom: 32,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#10b981', flexShrink: 0,
                animation: 'pulse-dot 2s infinite',
              }} />
              <span style={{ color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.12em' }}>
                Live Beta &nbsp;·&nbsp; AI-Powered Prior Authorization
              </span>
            </div>
          </motion.div>

          <h1 style={{
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: 800, letterSpacing: '-0.04em',
            lineHeight: 1.08, color: '#0f172a',
            marginBottom: 24,
          }}>
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-block',
                  marginRight: '0.25em',
                  ...(word === 'paperwork' ? {
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #60a5fa)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 3s ease infinite',
                  } : {}),
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ color: '#475569', fontSize: '1.125rem', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}
          >
            Turn clinical notes and insurance cards into submission-ready prior
            authorization forms — in under 30 seconds.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
            style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 500, margin: '0.75rem auto 2rem', lineHeight: 1.7 }}
          >
            Snap a photo of clinical notes and the insurance card. AuthFlow extracts
            the right details, maps the right codes, and drafts the PA with the
            language insurers expect — so your claims are faster, cleaner, and less
            likely to be rejected.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.74, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.button
              onClick={() => router.push('/signin')}
              aria-label="Sign up for AuthFlow — free to start"
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(37,99,235,0.5), 0 12px 40px rgba(37,99,235,0.4)', y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: '#2563eb', color: 'white',
                padding: '16px 40px', borderRadius: 12,
                fontSize: '1rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                boxShadow: '0 0 0 1px rgba(37,99,235,0.5), 0 8px 32px rgba(37,99,235,0.3)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Sign up for free
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.95 }}
            style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 16, letterSpacing: '0.04em' }}
          >
            Used by doctors at Mayo Clinic · Kaiser Permanente · and more
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.86, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex', gap: 16, justifyContent: 'center',
              marginTop: 48, flexWrap: 'wrap', alignItems: 'center',
            }}
          >
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [-0.5, 0.5, -0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={cardStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <FileText size={18} color="#3b82f6" />
                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>Clinical Notes</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.65, textAlign: 'left' }}>
                Pt presents with chronic lower back pain. MRI reveals L4-L5 disc
                herniation. Conservative treatment failed over 6 months...
              </p>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16, pointerEvents: 'none' }}>
                <div style={{
                  position: 'absolute', top: 0, left: '-100%',
                  height: '100%', width: '60%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'card-shimmer 3s ease-in-out infinite',
                }} />
              </div>
            </motion.div>

            <div style={{ color: '#3b82f6', fontSize: '1.75rem', display: 'flex', alignItems: 'center' }}>→</div>

            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0.5, -0.5, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
              style={cardStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <ScanLine size={18} color="#3b82f6" />
                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>PA Draft</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 14 }}>Prior Authorization Request</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                {[
                  'Patient: John D. — DOB: 03/15/1978',
                  'Diagnosis: M51.16 — Lumbar disc herniation',
                  'Requested: Epidural steroid injection series',
                ].map(line => (
                  <p key={line} style={{ color: '#475569', fontSize: '0.78rem' }}>{line}</p>
                ))}
              </div>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16, pointerEvents: 'none' }}>
                <div style={{
                  position: 'absolute', top: 0, left: '-100%',
                  height: '100%', width: '60%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'card-shimmer 3s ease-in-out infinite',
                  animationDelay: '1.5s',
                }} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
