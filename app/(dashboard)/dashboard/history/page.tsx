import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopBar from '@/components/dashboard/TopBar'
import PATable from '@/components/dashboard/PATable'
import type { PriorAuth } from '@/lib/types'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: pas } = await supabase
    .from('prior_auths')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <TopBar title="Prior Auth History" />
      <div style={{ padding: '32px', maxWidth: '1100px' }}>
        <PATable pas={(pas ?? []) as PriorAuth[]} showFilters />
      </div>
    </div>
  )
}
