'use client'
import { useState } from 'react'
import Modal from './Modal'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
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
        body: JSON.stringify({ email, source: 'modal' }),
      })
      const data = await res.json() as { success: boolean; message?: string; error?: string }
      if (data.success) setSuccess(true)
      else setError(data.error ?? 'Something went wrong')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={440}>
      <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '28px', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
        Join the Authflow waitlist
      </h2>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#6B7A9A', marginBottom: '28px' }}>
        Be the first to know when we launch. No spam.
      </p>
      {success ? (
        <div style={{ background: 'rgba(46,125,50,0.15)', border: '1px solid rgba(46,125,50,0.3)', borderRadius: '8px', padding: '16px', color: '#66BB6A', fontSize: '14px', fontFamily: 'var(--font-inter)' }}>
          You&apos;re on the list! We&apos;ll email you when we launch.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '12px', color: '#6B7A9A', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@practice.com"
              required
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? '#C62828' : 'rgba(255,255,255,0.10)'}`, borderRadius: '8px', padding: '12px 14px', fontSize: '14px', color: '#ffffff', fontFamily: 'var(--font-inter)', outline: 'none' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#1B4FD8')}
              onBlur={e => (e.currentTarget.style.borderColor = error ? '#C62828' : 'rgba(255,255,255,0.10)')}
            />
            {error && <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? 'rgba(27,79,216,0.5)' : '#1B4FD8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {loading ? 'Joining...' : 'Join waitlist'}
          </button>
        </form>
      )}
    </Modal>
  )
}
