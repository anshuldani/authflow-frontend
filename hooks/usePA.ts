'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PriorAuth } from '@/lib/types'

export function usePA() {
  const [pas, setPas] = useState<PriorAuth[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('prior_auths')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPas((data ?? []) as PriorAuth[])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { pas, loading, refresh }
}
