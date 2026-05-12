'use client'
import { motion } from 'framer-motion'
import { FileText, Camera, Upload, Check } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const cardBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.7)',
  borderRadius: 20,
  padding: 36,
  backdropFilter: 'blur(20px)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(59,130,246,0.1)',
}

const inputRow: React.CSSProperties = {
  background: 'rgba(59,130,246,0.04)',
  border: '1px solid rgba(59,130,246,0.1)',
  borderRadius: 10,
  padding: '12px 16px',
  margin: '8px 0',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const pill: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: 999,
  background: 'rgba(59,130,246,0.08)',
  border: '1px solid rgba(59,130,246,0.2)',
  color: '#1d4ed8',
  fontSize: '0.75rem',
  fontWeight: 500,
  marginBottom: 16,
}

const learnMore: React.CSSProperties = {
  color: '#2563eb',
  fontSize: '0.875rem',
  marginTop: 20,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
}

export default function Features() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section
      ref={ref}
      id="features"
      style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-inter)' }}
    >
      <div style={{
        position: 'absolute', top: '20%', right: '-100px',
        width: 500, height: 500,
        background: 'radial-gradient(ellipse, rgba(147,197,253,0.25) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 800,
          textAlign: 'center',
          color: '#0f172a',
          marginBottom: 12,
          position: 'relative', zIndex: 1,
        }}
      >
        Save lives with AuthFlow
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          textAlign: 'center', color: '#64748b',
          fontSize: '1rem', marginBottom: 48,
          position: 'relative', zIndex: 1,
        }}
      >
        Two powerful tools built for the people who keep practices running.
      </motion.p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        position: 'relative', zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -6, boxShadow: '0 30px 60px rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.35)' }}
          style={cardBase}
        >
          <span style={pill}>Prior Auth Drafts</span>
          <h3 style={{ fontWeight: 700, fontSize: '1.4rem', color: '#0f172a', margin: '0 0 8px' }}>
            Instantly generate prior auth drafts that are insurer-aware
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 12 }}>
            Upload or snap a photo of:
          </p>
          {[
            { icon: <FileText size={16} color="#3b82f6" />, label: 'Clinical notes' },
            { icon: <Camera size={16} color="#3b82f6" />, label: 'Insurance card' },
            { icon: <Upload size={16} color="#3b82f6" />, label: 'Supporting documents' },
          ].map(({ icon, label }) => (
            <div key={label} style={inputRow}>
              {icon}
              <span style={{ color: '#334155', fontSize: '0.875rem' }}>{label}</span>
            </div>
          ))}
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 16, lineHeight: 1.65 }}>
            AuthFlow extracts the important details and turns them into a structured
            prior authorization draft your team can review, edit, and submit.
          </p>
          <button style={learnMore}>Learn more →</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          whileHover={{ y: -6, boxShadow: '0 30px 60px rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.35)' }}
          style={cardBase}
        >
          <span style={pill}>Smart Extraction</span>
          <h3 style={{ fontWeight: 700, fontSize: '1.4rem', color: '#0f172a', margin: '0 0 8px' }}>
            Read complex documents without the manual headache
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.65 }}>
            Clinical notes are long. Insurance requirements are inconsistent.
            Manual review creates bottlenecks and mistakes.
          </p>
          <div style={{
            background: 'rgba(59,130,246,0.04)',
            border: '1px solid rgba(59,130,246,0.1)',
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
          }}>
            <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.65 }}>
              AuthFlow helps your team pull out the relevant facts, identify treatment
              history, highlight diagnosis context, and organize the information needed
              for approval.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {['Patient details extracted', 'Diagnosis codes mapped', 'Treatment history organized'].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check size={15} color="#10b981" />
                <span style={{ color: '#334155', fontSize: '0.875rem' }}>{text}</span>
              </div>
            ))}
          </div>
          <button style={learnMore}>Learn more →</button>
        </motion.div>
      </div>
    </section>
  )
}
