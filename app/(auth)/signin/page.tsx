'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SigninPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

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
        <button
          onClick={handleGoogle}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#ffffff', color: '#0F172A', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: 'pointer', marginBottom: '16px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#6B7A9A' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>
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

// Sign-in page metadata
export const metadata = {
  title: 'Sign In | AuthFlow',
}
