'use client'
import { useState, useEffect, useCallback } from 'react'
import TopBar from '@/components/dashboard/TopBar'
import AppealGenerator from '@/components/dashboard/AppealGenerator'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { PriorAuth, Appeal } from '@/lib/types'

export default function AppealsPage() {
  const [deniedPAs, setDeniedPAs] = useState<PriorAuth[]>([])
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [expandedPA, setExpandedPA] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const [{ data: pas }, { data: apls }] = await Promise.all([
      supabase.from('prior_auths').select('*').eq('status', 'denied').order('created_at', { ascending: false }),
      supabase.from('appeals').select('*').order('created_at', { ascending: false }),
    ])
    setDeniedPAs((pas ?? []) as PriorAuth[])
    setAppeals((apls ?? []) as Appeal[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const wonAppeals = appeals.filter(a => a.status === 'overturned').length
  const submittedAppeals = appeals.filter(a => ['submitted', 'overturned', 'upheld'].includes(a.status)).length
  const winRate = submittedAppeals > 0 ? Math.round((wonAppeals / submittedAppeals) * 100) : 0

  return (
    <div>
      <TopBar title="Appeals" />
      <div style={{ padding: '32px', maxWidth: '1100px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Denied PAs', value: deniedPAs.length },
            { label: 'Appeals filed', value: appeals.length },
            { label: 'Win rate', value: `${winRate}%` },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px 28px', flex: '1', minWidth: '120px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{stat.label}</div>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '28px', fontWeight: 700, color: '#0F172A' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Denied PAs awaiting appeal */}
        <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '14px', color: '#0F172A', marginBottom: '16px' }}>
          Denied — ready to appeal
        </h2>
        {loading ? (
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#94A3B8' }}>Loading...</div>
        ) : deniedPAs.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#64748B', padding: '24px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            No denied prior authorizations.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
            {deniedPAs.map(pa => (
              <div key={pa.id}>
                <div
                  onClick={() => setExpandedPA(expandedPA === pa.id ? null : pa.id)}
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Badge variant="denied">denied</Badge>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#0F172A', fontWeight: 500 }}>{pa.procedure_name}</span>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#64748B' }}>{pa.payer}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#1D4ED8' }}>
                    {expandedPA === pa.id ? 'Cancel ↑' : 'Generate appeal →'}
                  </span>
                </div>
                {expandedPA === pa.id && (
                  <AppealGenerator
                    pa={pa}
                    onDone={(appeal) => {
                      setAppeals(prev => [appeal, ...prev])
                      setExpandedPA(null)
                      // remove from denied list since status is now 'appealed'
                      setDeniedPAs(prev => prev.filter(p => p.id !== pa.id))
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Filed appeals */}
        <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '14px', color: '#0F172A', marginBottom: '16px' }}>
          Filed appeals
        </h2>
        {appeals.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#64748B', padding: '24px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            No appeals filed yet.
          </div>
        ) : (
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  {['Status', 'Created', 'Submitted'].map(h => (
                    <th key={h} style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 14px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appeals.map(appeal => (
                  <tr key={appeal.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px' }}><Badge variant={appeal.status}>{appeal.status}</Badge></td>
                    <td style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#64748B', padding: '12px 14px' }}>{new Date(appeal.created_at).toLocaleDateString()}</td>
                    <td style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#64748B', padding: '12px 14px' }}>
                      {appeal.submitted_at ? new Date(appeal.submitted_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
