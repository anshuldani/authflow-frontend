'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    const code = searchParams.get('code')

    if (code) {
      // PKCE flow — exchange code for session
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) router.replace('/dashboard')
        else router.replace('/signin?error=auth_failed')
      })
    } else {
      // Implicit flow — Supabase client auto-reads access_token from URL hash
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/dashboard')
        } else {
          router.replace('/signin?error=auth_failed')
        }
      })
    }
  }, [router, searchParams])

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '14px', fontFamily: 'sans-serif' }}>
      Signing you in...
    </div>
  )
}
