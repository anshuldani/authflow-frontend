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
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) router.replace('/dashboard')
        else router.replace('/signin?error=auth_failed')
      })
    } else {
      // Implicit flow — wait for Supabase to parse the hash fragment
      const check = (attempts: number) => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            router.replace('/dashboard')
          } else if (attempts > 0) {
            setTimeout(() => check(attempts - 1), 500)
          } else {
            router.replace('/signin?error=auth_failed')
          }
        })
      }
      setTimeout(() => check(5), 300)
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
