import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/dashboard/TopBar'
import StatsCards from '@/components/dashboard/StatsCards'
import PATable from '@/components/dashboard/PATable'
import type { PriorAuth } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const [{ data: userData }, { data: pas }, { data: appeals }] = await Promise.all([
    supabase.from('users').select('plan, pa_count_this_month, pa_quota').eq('id', user.id).single(),
    supabase.from('prior_auths').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('appeals').select('id').eq('user_id', user.id),
  ])

  const paList = (pas ?? []) as PriorAuth[]
  const approvedCount = paList.filter(p => p.status === 'approved').length
  const totalSubmitted = paList.filter(p => ['submitted', 'approved', 'denied', 'appealed'].includes(p.status)).length
  const paCount = userData?.pa_count_this_month ?? 0

  const isNewUser = paList.length === 0

  return (
    <div>
      <TopBar title="Dashboard" showUpgrade={userData?.plan === 'free'} />
      <div style={{ padding: '32px', maxWidth: '1100px' }}>
        {isNewUser ? (
          /* Welcome state — zero PAs */
          <div style={{ background: 'rgba(27,79,216,0.06)', border: '1px solid rgba(27,79,216,0.15)', borderRadius: '16px', padding: '48px', maxWidth: '640px', margin: '48px auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '28px', color: '#ffffff', marginBottom: '12px', letterSpacing: '-0.5px' }}>
              Welcome to Authflow.
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: '#6B7A9A', marginBottom: '32px', lineHeight: 1.65 }}>
              You have 10 free prior authorization requests to start. Generate your first one in under a minute.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
              {[
                { n: '1', label: 'Paste a clinical note' },
                { n: '2', label: 'Select a payer' },
                { n: '3', label: 'Get your completed form' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(27,79,216,0.15)', border: '1px solid rgba(27,79,216,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 700, color: '#7BA3FF', flexShrink: 0 }}>
                    {step.n}
                  </div>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#6B7A9A' }}>{step.label}</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/new" style={{ display: 'inline-block', background: '#1B4FD8', color: '#ffffff', textDecoration: 'none', padding: '14px 28px', borderRadius: '8px', fontFamily: 'var(--font-inter)', fontSize: '15px', fontWeight: 600 }}>
              Generate my first prior auth →
            </Link>
          </div>
        ) : (
          /* Returning user state */
          <>
            <StatsCards
              paCount={paCount}
              approvedCount={approvedCount}
              totalSubmitted={totalSubmitted}
              appealsCount={appeals?.length ?? 0}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '14px', color: '#ffffff' }}>Recent prior authorizations</h2>
              <Link href="/dashboard/history" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#1B4FD8', textDecoration: 'none' }}>View all →</Link>
            </div>
            <PATable pas={paList.slice(0, 5)} />
            <div style={{ background: 'rgba(27,79,216,0.06)', border: '1px solid rgba(27,79,216,0.12)', borderRadius: '12px', padding: '20px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#ffffff' }}>Ready to generate another prior auth?</span>
              <Link href="/dashboard/new" style={{ background: '#1B4FD8', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                + New prior auth
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
