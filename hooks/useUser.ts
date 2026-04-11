'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser) { setUser(null); setLoading(false); return }
        const { data, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        if (dbError) {
          setError(dbError.message)
          setUser({
            id: authUser.id,
            email: authUser.email ?? '',
            plan: 'free',
            pa_count_this_month: 0,
            pa_quota: 10,
            created_at: authUser.created_at,
          })
        } else {
          setUser(data as User)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [])

  return { user, loading, error }
}
