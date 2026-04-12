'use client'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    const code = searchParams.get('code')

    if (code) {
      // PKCE flow
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) router.replace('/dashboard')
        else router.replace('/signin?error=auth_failed')
      })
      return
    }

    // Implicit flow — manually parse hash fragment
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
        if (!error) router.replace('/dashboard')
        else router.replace('/signin?error=auth_failed')
      })
    } else {
      router.replace('/signin?error=auth_failed')
    }
  }, [router, searchParams])

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '14px', fontFamily: 'sans-serif' }}>
      Signing you in...
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '14px', fontFamily: 'sans-serif' }}>Signing you in...</div>}>
      <AuthCallbackInner />
    </Suspense>
  )
}
