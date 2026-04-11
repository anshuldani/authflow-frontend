'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SigninPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (authError) setError(authError.message)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px' }}>
        <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '24px', color: '#ffffff', marginBottom: '24px', letterSpacing: '-0.5px' }}>
          Authflow.
        </div>
        <h1 style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '18px', color: '#ffffff', marginBottom: '8px' }}>
          Sign in to Authflow
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#6B7A9A', marginBottom: '28px' }}>
          Enter your email. We&apos;ll send you a magic link — no password needed.
        </p>
        {success ? (
          <div style={{ background: 'rgba(46,125,50,0.15)', border: '1px solid rgba(46,125,50,0.3)', borderRadius: '8px', padding: '16px', color: '#66BB6A', fontSize: '14px', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
            Check your email. We sent a magic link to <strong>{email}</strong>. Click it to sign in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '8px', padding: '12px 14px', fontSize: '14px', color: '#ffffff', fontFamily: 'var(--font-inter)', outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#1B4FD8')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
              />
            </div>
            {error && (
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#EF5350' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: loading ? 'rgba(27,79,216,0.5)' : '#1B4FD8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        )}
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#6B7A9A', marginTop: '24px', textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: '#7BA3FF', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
