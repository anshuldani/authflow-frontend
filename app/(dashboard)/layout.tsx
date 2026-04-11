import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: userData } = await supabase
    .from('users')
    .select('plan, pa_count_this_month, pa_quota, email')
    .eq('id', user.id)
    .single()

  const userInfo = userData ?? {
    plan: 'free',
    pa_count_this_month: 0,
    pa_quota: 10,
    email: user.email ?? '',
  }

  return (
    <DashboardShell userInfo={userInfo as { plan: string; pa_count_this_month: number; pa_quota: number | null; email: string }}>
      {children}
    </DashboardShell>
  )
}
