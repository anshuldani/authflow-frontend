'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/dashboard/TopBar'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { PriorAuth } from '@/lib/types'

const ff = 'var(--font-inter)'

function daysUntil(dateStr: string) {
  return Math.round((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function daysSince(dateStr: string) {
  return Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function expiryColor(days: number) {
  if (days < 0) return '#f87171'
  if (days <= 14) return '#f87171'
  if (days <= 30) return '#FFA726'
  if (days <= 60) return '#FCD34D'
  return '#4ade80'
}

function expiryBg(days: number) {
  if (days < 0) return 'rgba(239,68,68,0.1)'
  if (days <= 14) return 'rgba(239,68,68,0.08)'
  if (days <= 30) return 'rgba(255,167,38,0.08)'
  if (days <= 60) return 'rgba(252,211,77,0.06)'
  return 'rgba(74,222,128,0.06)'
}

type FilterTab = 'all' | 'critical' | 'expiring' | 'expired'

export default function RenewalsPage() {
  const router = useRouter()
  const [allPAs, setAllPAs] = useState<PriorAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('prior_auths')
      .select('*')
      .eq('status', 'approved')
      .order('auth_valid_through', { ascending: true })
    setAllPAs((data ?? []) as PriorAuth[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const withExpiry = allPAs.map(pa => ({
    ...pa,
    daysLeft: pa.auth_valid_through ? daysUntil(pa.auth_valid_through) : null,
  }))

  const filtered = withExpiry.filter(pa => {
    if (filter === 'critical') return pa.daysLeft !== null && pa.daysLeft <= 14
    if (filter === 'expiring') return pa.daysLeft !== null && pa.daysLeft > 14 && pa.daysLeft <= 60
    if (filter === 'expired') return pa.daysLeft !== null && pa.daysLeft < 0
    return true
  })

  const criticalCount = withExpiry.filter(p => p.daysLeft !== null && p.daysLeft <= 14 && p.daysLeft >= 0).length
  const expiringCount = withExpiry.filter(p => p.daysLeft !== null && p.daysLeft > 14 && p.daysLeft <= 60).length
  const expiredCount = withExpiry.filter(p => p.daysLeft !== null && p.daysLeft < 0).length

  // Save auth dates inline
  const handleSaveDates = async (pa: PriorAuth, from: string, through: string) => {
    setSavingId(pa.id)
    const supabase = createClient()
    await supabase.from('prior_auths').update({ auth_valid_from: from || null, auth_valid_through: through || null }).eq('id', pa.id)
    setAllPAs(prev => prev.map(p => p.id === pa.id ? { ...p, auth_valid_from: from || undefined, auth_valid_through: through || undefined } : p))
    setSavingId(null)
  }

  // Start renewal — navigate to new PA with pre-filled state via query params
  const handleRenew = (pa: PriorAuth) => {
    const params = new URLSearchParams({
      renew: '1',
      payer_id: pa.payer_id,
      procedure_name: pa.procedure_name,
      patient_name: pa.patient_name ?? '',
      patient_dob: pa.patient_dob ?? '',
      member_id: pa.patient_member_id ?? '',
      group_number: pa.patient_group_number ?? '',
      prev_auth: pa.auth_number ?? '',
    })
    router.push(`/dashboard/new?${params.toString()}`)
  }

  return (
    <div>
      <TopBar title="Active Authorizations" />
      <div style={{ padding: '24px 32px', maxWidth: '1100px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total active auths', value: allPAs.length },
            { label: 'Expiring in 14 days', value: criticalCount, urgent: criticalCount > 0 },
            { label: 'Expiring in 30–60 days', value: expiringCount },
            { label: 'Expired (action needed)', value: expiredCount, urgent: expiredCount > 0 },
          ].map(s => (
            <div key={s.label} style={{ background: '#FFFFFF', border: `1px solid ${s.urgent ? 'rgba(239,68,68,0.25)' : '#E2E8F0'}`, borderRadius: '12px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '28px', color: s.urgent ? '#f87171' : '#0F172A', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {([
            { key: 'all', label: `All (${withExpiry.length})` },
            { key: 'critical', label: `Critical — ≤14 days (${criticalCount})`, color: '#f87171' },
            { key: 'expiring', label: `Expiring soon (${expiringCount})`, color: '#FFA726' },
            { key: 'expired', label: `Expired (${expiredCount})`, color: '#EF5350' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                background: filter === tab.key ? '#EBF2FF' : '#F8FAFC',
                border: `1px solid ${filter === tab.key ? '#BFDBFE' : '#E2E8F0'}`,
                borderRadius: '8px', padding: '6px 14px',
                fontFamily: ff, fontSize: '12px', fontWeight: filter === tab.key ? 600 : 400,
                color: filter === tab.key ? '#1D4ED8' : '#64748B',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ fontFamily: ff, fontSize: '13px', color: '#94A3B8', padding: '40px', textAlign: 'center' }}>Loading authorizations...</div>
        ) : filtered.length === 0 ? (
          <div style={{ fontFamily: ff, fontSize: '13px', color: '#64748B', padding: '48px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            {allPAs.length === 0
              ? 'No approved prior authorizations yet. Auth dates will appear here once you log them on approved PAs.'
              : 'No authorizations match this filter.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(pa => (
              <RenewalRow
                key={pa.id}
                pa={pa}
                onRenew={() => handleRenew(pa)}
                onSaveDates={handleSaveDates}
                saving={savingId === pa.id}
              />
            ))}
          </div>
        )}

        {allPAs.length === 0 && !loading && (
          <div style={{ background: '#EBF2FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '20px 24px', marginTop: '24px' }}>
            <div style={{ fontFamily: ff, fontSize: '12px', fontWeight: 700, color: '#1D4ED8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>How to track expiration dates</div>
            <p style={{ fontFamily: ff, fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              When you mark a PA as approved and log the auth number, also add the &quot;valid from&quot; and &quot;valid through&quot; dates.
              Authflow will alert you here when auths are about to expire so you can renew before service is disrupted.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function RenewalRow({ pa, onRenew, onSaveDates, saving }: {
  pa: PriorAuth & { daysLeft: number | null }
  onRenew: () => void
  onSaveDates: (pa: PriorAuth, from: string, through: string) => void
  saving: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [editFrom, setEditFrom] = useState(pa.auth_valid_from ?? '')
  const [editThrough, setEditThrough] = useState(pa.auth_valid_through ?? '')
  const [dirty, setDirty] = useState(false)

  const daysApproved = daysSince(pa.decision_at ?? pa.created_at)
  const color = pa.daysLeft !== null ? expiryColor(pa.daysLeft) : '#6B7A9A'
  const bg = pa.daysLeft !== null ? expiryBg(pa.daysLeft) : 'transparent'
  const expiryLabel = pa.daysLeft === null
    ? 'No expiry date set'
    : pa.daysLeft < 0
    ? `Expired ${Math.abs(pa.daysLeft)}d ago`
    : pa.daysLeft === 0
    ? 'Expires today'
    : `${pa.daysLeft}d remaining`

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div
        style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Expiry badge */}
        <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: '8px', padding: '4px 10px', minWidth: '120px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: ff, fontSize: '11px', fontWeight: 700, color }}>{expiryLabel}</div>
        </div>

        {/* Patient + procedure */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: ff, fontSize: '13px', fontWeight: 500, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pa.patient_name ?? 'Unknown patient'}
          </div>
          <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pa.procedure_name} · {pa.payer}
          </div>
        </div>

        {/* Auth number */}
        {pa.auth_number && (
          <div style={{ fontFamily: ff, fontSize: '11px', color: '#94A3B8', flexShrink: 0 }}>
            Auth #{pa.auth_number}
          </div>
        )}

        {/* Days since approved */}
        <div style={{ fontFamily: ff, fontSize: '11px', color: '#4A5A7A', flexShrink: 0 }}>
          Approved {daysApproved}d ago
        </div>

        <Badge variant="approved">approved</Badge>

        {/* Renew button */}
        <button
          onClick={e => { e.stopPropagation(); onRenew() }}
          style={{ background: '#EBF2FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '6px 12px', fontFamily: ff, fontSize: '11px', fontWeight: 600, color: '#1D4ED8', cursor: 'pointer', flexShrink: 0 }}
        >
          Renew →
        </button>

        <span style={{ color: '#4A5A7A', fontSize: '10px' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded: edit auth dates */}
      {expanded && (
        <div style={{ borderTop: '1px solid #E2E8F0', padding: '14px 18px', background: '#F8FAFC' }}>
          <div style={{ fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Authorization dates</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: ff, fontSize: '10px', color: '#64748B', marginBottom: '4px' }}>Valid from</div>
              <input
                type="date"
                value={editFrom}
                onChange={e => { setEditFrom(e.target.value); setDirty(true) }}
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none', colorScheme: 'light' }}
              />
            </div>
            <div>
              <div style={{ fontFamily: ff, fontSize: '10px', color: '#64748B', marginBottom: '4px' }}>Valid through</div>
              <input
                type="date"
                value={editThrough}
                onChange={e => { setEditThrough(e.target.value); setDirty(true) }}
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none', colorScheme: 'light' }}
              />
            </div>
            {dirty && (
              <button
                onClick={() => { onSaveDates(pa, editFrom, editThrough); setDirty(false) }}
                disabled={saving}
                style={{ background: '#1B4FD8', border: 'none', borderRadius: '6px', padding: '7px 14px', fontFamily: ff, fontSize: '12px', fontWeight: 600, color: '#ffffff', cursor: 'pointer' }}
              >
                {saving ? 'Saving...' : 'Save dates'}
              </button>
            )}
          </div>
          {pa.complete_pa_form && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                ['Diagnosis', `${pa.complete_pa_form.icd10_code} — ${pa.complete_pa_form.icd10_description}`],
                ['CPT', `${pa.complete_pa_form.cpt_code} — ${pa.complete_pa_form.cpt_description}`],
                ['Member ID', pa.patient_member_id],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string}>
                  <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontFamily: ff, fontSize: '12px', color: '#475569' }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
