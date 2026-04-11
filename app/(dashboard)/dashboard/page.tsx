import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/dashboard/TopBar'
import QueueClient from '@/components/dashboard/QueueClient'
import type { PriorAuth, Appeal } from '@/lib/types'

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24))
}

function daysUntil(dateStr: string) {
  return Math.round((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const [{ data: userData }, { data: pas }, { data: appeals }] = await Promise.all([
    supabase.from('users').select('plan, pa_count_this_month, pa_quota, email').eq('id', user.id).single(),
    supabase.from('prior_auths').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('appeals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const allPAs = (pas ?? []) as PriorAuth[]
  const allAppeals = (appeals ?? []) as Appeal[]

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const todayStart = `${today}T00:00:00.000Z`

  const submittedToday = allPAs.filter(pa => pa.submitted_at && pa.submitted_at >= todayStart).length
  const approvedToday = allPAs.filter(pa => pa.decision_at && pa.decision_at >= todayStart && pa.status === 'approved').length
  const deniedToday = allPAs.filter(pa => pa.decision_at && pa.decision_at >= todayStart && pa.status === 'denied').length
  const generatedToday = allPAs.filter(pa => pa.created_at >= todayStart).length

  const needsAttention = allPAs.filter(pa => {
    if (pa.status === 'draft' && daysBetween(pa.created_at, now.toISOString()) >= 1) return true
    if (pa.status === 'submitted' && pa.follow_up_date && pa.follow_up_date <= today) return true
    return false
  })

  const awaitingDecision = allPAs.filter(pa => pa.status === 'submitted' && !pa.decision_at)

  const expiringSoon = allPAs
    .filter(pa => pa.status === 'approved' && pa.auth_valid_through)
    .map(pa => ({ ...pa, daysLeft: daysUntil(pa.auth_valid_through!) }))
    .filter(pa => pa.daysLeft <= 90)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const filedAppealPAIds = new Set(allAppeals.map(a => a.pa_id))
  const appealWindow = allPAs.filter(pa => pa.status === 'denied' && !filedAppealPAIds.has(pa.id))

  const approvedAll = allPAs.filter(p => p.status === 'approved').length
  const submittedAll = allPAs.filter(p => ['submitted', 'approved', 'denied', 'appealed'].includes(p.status)).length
  const approvalRate = submittedAll > 0 ? Math.round((approvedAll / submittedAll) * 100) : null

  const ff = 'Inter, system-ui, sans-serif'

  if (allPAs.length === 0) {
    return (
      <div>
        <TopBar title="Dashboard" showUpgrade={userData?.plan === 'free'} />
        <div style={{ padding: '40px 32px', maxWidth: '1100px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '56px 48px', maxWidth: '560px', margin: '40px auto', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '64px', height: '64px', background: '#EBF2FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>
              📋
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '24px', color: '#0F172A', marginBottom: '10px' }}>
              Welcome to Authflow
            </h2>
            <p style={{ fontFamily: ff, fontSize: '15px', color: '#475569', marginBottom: '32px', lineHeight: 1.65 }}>
              Your dashboard is ready. Start by creating your first prior authorization request — we&apos;ll handle the paperwork so you can focus on your patients.
            </p>
            <Link href="/dashboard/new" style={{ display: 'inline-block', background: '#1A56DB', color: '#FFFFFF', textDecoration: 'none', padding: '14px 28px', borderRadius: '9px', fontFamily: ff, fontSize: '15px', fontWeight: 600, boxShadow: '0 2px 8px rgba(26,86,219,0.3)' }}>
              Create my first request →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Dashboard" showUpgrade={userData?.plan === 'free'} />
      <div style={{ padding: '24px 32px', maxWidth: '1200px' }}>

        {/* ── Today's summary ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontFamily: ff, fontSize: '13px', fontWeight: 500, color: '#475569' }}>
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <div style={{ display: 'flex', gap: '24px' }}>
              {[
                { label: 'Created today', value: generatedToday, color: '#1A56DB' },
                { label: 'Submitted', value: submittedToday, color: '#D97706' },
                { label: 'Approved', value: approvedToday, color: '#16A34A' },
                { label: 'Denied', value: deniedToday, color: '#DC2626' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: ff, fontWeight: 700, fontSize: '24px', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: ff, fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Need attention', value: String(needsAttention.length + awaitingDecision.length + appealWindow.length), color: '#0F172A', bg: '#FFFFFF' },
            { label: 'Awaiting decision', value: String(awaitingDecision.length), color: '#D97706', bg: '#FFFFFF' },
            { label: 'Approval rate', value: approvalRate !== null ? `${approvalRate}%` : '—', color: (approvalRate ?? 0) >= 80 ? '#16A34A' : (approvalRate ?? 0) >= 60 ? '#D97706' : '#DC2626', bg: '#FFFFFF' },
            { label: 'Open appeals', value: String(allAppeals.filter(a => a.status === 'submitted').length), color: '#7C3AED', bg: '#FFFFFF' },
          ].map(card => (
            <div key={card.label} style={{ background: card.bg, border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontFamily: ff, fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontFamily: ff, fontWeight: 700, fontSize: '30px', color: card.color, lineHeight: 1 }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* ── Queue ── */}
        <QueueClient
          needsAttention={needsAttention}
          awaitingDecision={awaitingDecision}
          appealWindow={appealWindow}
          expiringSoon={expiringSoon}
          today={today}
        />

        {/* ── Bottom bar ── */}
        <div style={{ marginTop: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontFamily: ff, fontSize: '13px', color: '#475569' }}>
            {userData?.pa_count_this_month ?? 0} requests this month
            {approvalRate !== null && <span style={{ color: '#16A34A', marginLeft: '12px', fontWeight: 500 }}>↑ {approvalRate}% approval rate</span>}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/dashboard/payers" style={{ background: '#F4F7FB', color: '#475569', textDecoration: 'none', padding: '8px 14px', borderRadius: '7px', fontFamily: ff, fontSize: '13px', fontWeight: 500, border: '1px solid #E2E8F0' }}>
              Insurance plans
            </Link>
            <Link href="/dashboard/new" style={{ background: '#1A56DB', color: '#FFFFFF', textDecoration: 'none', padding: '8px 18px', borderRadius: '7px', fontFamily: ff, fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 6px rgba(26,86,219,0.25)' }}>
              + New request
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
