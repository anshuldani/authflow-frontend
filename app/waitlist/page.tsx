'use client'
import { useState } from 'react'
import Link from 'next/link'

const PRO_FEATURES = [
  'Unlimited prior authorizations',
  'Appeal letter generator',
  'Denial tracking + priority support',
]

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'pro_waitlist' }),
      })
      const data = await res.json() as { success: boolean; message?: string; error?: string }
      if (data.success) {
        setSuccess(true)
      } else {
        if (data.message?.includes('already')) {
          setSuccess(true)
        } else {
          setError(data.error ?? 'Something went wrong. Try again.')
        }
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0F1A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {/* Wordmark */}
        <Link href="/" style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontWeight: 700,
          fontSize: '22px',
          color: '#ffffff',
          letterSpacing: '-0.5px',
          textDecoration: 'none',
          display: 'block',
          marginBottom: '40px',
        }}>
          Authflow.
        </Link>

        {/* Beta badge */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{
            background: 'rgba(217,119,6,0.15)',
            border: '1px solid rgba(217,119,6,0.3)',
            color: '#FCD34D',
            fontSize: '11px',
            fontFamily: 'var(--font-inter)',
            fontWeight: 600,
            padding: '4px 14px',
            borderRadius: '99px',
            letterSpacing: '0.04em',
          }}>
            Now in beta
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontWeight: 800,
          fontSize: '48px',
          color: '#ffffff',
          letterSpacing: '-2px',
          lineHeight: 1.08,
          marginBottom: '16px',
        }}>
          Authflow Pro is coming.
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: 'var(--font-inter)',
          fontWeight: 400,
          fontSize: '16px',
          color: '#6B7A9A',
          lineHeight: 1.65,
          marginBottom: '40px',
        }}>
          We&apos;re rolling out Pro access to a limited number of practices. Join the waitlist and we&apos;ll reach out as soon as a spot opens.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
          {PRO_FEATURES.map(feature => (
            <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'rgba(27,79,216,0.15)',
                border: '1px solid rgba(27,79,216,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#1B4FD8',
                fontSize: '12px',
                fontWeight: 700,
              }}>
                ✓
              </div>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#C9D1D9' }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Form or success */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '18px', color: '#22c55e',
            }}>
              ✓
            </div>
            <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '24px', color: '#ffffff', marginBottom: '8px' }}>
              You&apos;re on the list.
            </div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#6B7A9A', lineHeight: 1.65 }}>
              We&apos;ll email you at <strong style={{ color: '#9CA3AF' }}>{email}</strong> when Pro access opens. You&apos;ll be one of the first.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your practice email"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.10)'}`,
                borderRadius: '8px',
                padding: '14px 16px',
                fontSize: '15px',
                color: '#ffffff',
                fontFamily: 'var(--font-inter)',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#1B4FD8')}
              onBlur={e => (e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.10)')}
            />
            {error && (
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(27,79,216,0.5)' : '#1B4FD8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 600,
                fontFamily: 'var(--font-inter)',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '12px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3D6AE8' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1B4FD8' }}
            >
              {loading ? 'Adding you to the list...' : 'Join the waitlist'}
            </button>
          </form>
        )}

        {/* Back link */}
        <div style={{ marginTop: '32px' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#6B7A9A', textDecoration: 'none' }}>
            ← Back to Authflow
          </Link>
        </div>
      </div>
    </div>
  )
}

// Waitlist page — SEO metadata
export const metadata = {
  title: 'Join the Waitlist | AuthFlow',
  description: 'Be the first to access AuthFlow — AI-powered prior authorization, simplified.',
}
