'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV_LINKS = [
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Our doctors', id: 'testimonials' },
  { label: 'Pricing', id: 'pricing' },
]

function NavLink({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: hovered ? '#0f172a' : '#64748b',
        fontSize: '0.875rem', fontWeight: 500,
        transition: 'color 0.15s ease',
        position: 'relative', padding: '4px 0',
        fontFamily: 'var(--font-inter)',
      }}
    >
      {label}
      <motion.span
        initial={false}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'absolute', bottom: -2, left: 0,
          height: 1.5, width: '100%',
          background: '#2563eb',
          transformOrigin: 'left',
          display: 'block',
        }}
      />
    </button>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <motion.nav
      role="navigation"
      aria-label="Main navigation"
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        backgroundColor: scrolled ? 'rgba(240,247,255,0.95)' : 'rgba(240,247,255,0.85)',
        boxShadow: scrolled ? '0 4px 30px rgba(59,130,246,0.08)' : 'none',
      }}
      transition={{
        y: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.5 },
        backgroundColor: { duration: 0.3 },
        boxShadow: { duration: 0.3 },
      }}
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.05)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
      }}
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', fontFamily: 'var(--font-inter)' }}>AuthFlow</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {NAV_LINKS.map(({ label, id }) => (
          <NavLink key={id} label={label} onClick={() => scrollTo(id)} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <NavLink label="Login" onClick={() => router.push('/signin')} />
        <motion.button
          onClick={() => router.push('/signin')}
          aria-label="Sign up for AuthFlow"
          whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: '#2563eb', color: 'white',
            padding: '8px 20px', borderRadius: 8,
            fontWeight: 600, fontSize: '0.875rem',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
          }}
        >
          Sign up
        </motion.button>
      </div>
    </motion.nav>
  )
}
