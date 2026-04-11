'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { PriorAuth } from '@/lib/types'

const ff = 'Inter, system-ui, sans-serif'

const PAYER_PHONES: Record<string, string> = {
  bcbs_il: '1-800-972-8088',
  aetna: '1-800-624-0756',
  uhc: '1-866-889-8054',
  cigna: '1-800-244-6224',
  humana: '1-800-523-0023',
}

const PAYER_TURNAROUND: Record<string, number> = {
  bcbs_il: 15, aetna: 10, uhc: 15, cigna: 14, humana: 14,
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24))
}

// ── Approve modal ────────────────────────────────────────────────────────────

function ApproveModal({ pa, onDone, onClose }: { pa: PriorAuth; onDone: (pa: PriorAuth) => void; onClose: () => void }) {
  const [authNumber, setAuthNumber] = useState('')
  const [authFrom, setAuthFrom] = useState('')
  const [authThrough, setAuthThrough] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!authNumber.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('prior_auths').update({
      status: 'approved', auth_number: authNumber,
      auth_valid_from: authFrom || null, auth_valid_through: authThrough || null,
      decision_at: new Date().toISOString(),
    }).eq('id', pa.id)
    onDone({ ...pa, status: 'approved', auth_number: authNumber, auth_valid_from: authFrom, auth_valid_through: authThrough })
    setSaving(false)
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontFamily: ff, fontSize: '15px', fontWeight: 700, color: '#16A34A', marginBottom: '6px' }}>Authorization approved</div>
      <div style={{ fontFamily: ff, fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
        {pa.patient_name} · {pa.procedure_name}
      </div>
      <label style={labelStyle}>Authorization number *</label>
      <input
        autoFocus value={authNumber} onChange={e => setAuthNumber(e.target.value)} placeholder="AUTH-2024-123456"
        style={{ ...lightInputStyle, marginBottom: '12px' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Valid from</label>
          <input type="date" value={authFrom} onChange={e => setAuthFrom(e.target.value)} style={lightInputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Valid through</label>
          <input type="date" value={authThrough} onChange={e => setAuthThrough(e.target.value)} style={lightInputStyle} />
        </div>
      </div>
      <button
        onClick={handleSave} disabled={!authNumber.trim() || saving}
        style={{ width: '100%', background: authNumber.trim() ? '#16A34A' : '#E2E8F0', border: 'none', borderRadius: '8px', padding: '11px', fontFamily: ff, fontSize: '14px', fontWeight: 600, color: authNumber.trim() ? '#FFFFFF' : '#94A3B8', cursor: authNumber.trim() ? 'pointer' : 'default' }}
      >
        {saving ? 'Saving...' : 'Save approval'}
      </button>
    </Overlay>
  )
}

// ── Deny modal ───────────────────────────────────────────────────────────────

const DENIAL_CODES = [
  { code: 'CO-50', label: 'CO-50 — Not medically necessary' },
  { code: 'CO-4', label: 'CO-4 — Not covered' },
  { code: 'N-130', label: 'N-130 — Step therapy not completed' },
  { code: 'CO-197', label: 'CO-197 — PA required but not obtained' },
  { code: 'OA-23', label: 'OA-23 — Information not provided' },
  { code: 'CUSTOM', label: 'Other' },
]

function DenyModal({ pa, onDone, onClose }: { pa: PriorAuth; onDone: (pa: PriorAuth) => void; onClose: () => void }) {
  const [denialCode, setDenialCode] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('prior_auths').update({
      status: 'denied', denial_code: denialCode || null,
      follow_up_notes: notes || null, decision_at: new Date().toISOString(),
    }).eq('id', pa.id)
    onDone({ ...pa, status: 'denied', denial_code: denialCode })
    setSaving(false)
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontFamily: ff, fontSize: '15px', fontWeight: 700, color: '#DC2626', marginBottom: '6px' }}>Log denial</div>
      <div style={{ fontFamily: ff, fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
        {pa.patient_name} · {pa.procedure_name}
      </div>
      <label style={labelStyle}>Denial code (optional)</label>
      <select value={denialCode} onChange={e => setDenialCode(e.target.value)} style={{ ...lightInputStyle, marginBottom: '12px' }}>
        <option value="">Select code</option>
        {DENIAL_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
      </select>
      <label style={labelStyle}>Notes (optional)</label>
      <textarea
        value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="Denial reason, rep name, callback number..."
        rows={2}
        style={{ ...lightInputStyle, marginBottom: '20px', resize: 'none' as const }}
      />
      <button
        onClick={handleSave} disabled={saving}
        style={{ width: '100%', background: '#DC2626', border: 'none', borderRadius: '8px', padding: '11px', fontFamily: ff, fontSize: '14px', fontWeight: 600, color: '#FFFFFF', cursor: 'pointer' }}
      >
        {saving ? 'Saving...' : 'Mark denied — move to appeals'}
      </button>
    </Overlay>
  )
}

// ── Shared modal helpers ─────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px', width: '380px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F4F7FB', border: 'none', borderRadius: '6px', color: '#475569', cursor: 'pointer', fontSize: '14px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        {children}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: ff, fontSize: '12px', fontWeight: 500, color: '#475569', marginBottom: '5px' }
const lightInputStyle: React.CSSProperties = { width: '100%', background: '#F4F7FB', border: '1px solid #CBD5E1', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none' }

// ── Main QueueClient ─────────────────────────────────────────────────────────

interface QueueClientProps {
  needsAttention: PriorAuth[]
  awaitingDecision: PriorAuth[]
  appealWindow: PriorAuth[]
  expiringSoon: (PriorAuth & { daysLeft: number })[]
  today: string
}

type ModalState = { type: 'approve'; pa: PriorAuth } | { type: 'deny'; pa: PriorAuth } | null

export default function QueueClient({ needsAttention, awaitingDecision, appealWindow, expiringSoon, today }: QueueClientProps) {
  const [modal, setModal] = useState<ModalState>(null)
  const [localNeedsAttention, setLocalNeedsAttention] = useState(needsAttention)
  const [localAwaiting, setLocalAwaiting] = useState(awaitingDecision)
  const [localAppealWindow, setLocalAppealWindow] = useState(appealWindow)
  const [awaitingSort, setAwaitingSort] = useState<'age' | 'payer'>('age')
  const [awaitingPayerFilter, setAwaitingPayerFilter] = useState('all')

  const handleApproved = (updated: PriorAuth) => {
    setLocalNeedsAttention(prev => prev.filter(p => p.id !== updated.id))
    setLocalAwaiting(prev => prev.filter(p => p.id !== updated.id))
    setModal(null)
  }

  const handleDenied = (updated: PriorAuth) => {
    setLocalNeedsAttention(prev => prev.filter(p => p.id !== updated.id))
    setLocalAwaiting(prev => prev.filter(p => p.id !== updated.id))
    setLocalAppealWindow(prev => [updated, ...prev])
    setModal(null)
  }

  const awaitingPayers = [...new Set(localAwaiting.map(p => p.payer_id))]
  let filteredAwaiting = awaitingPayerFilter === 'all' ? localAwaiting : localAwaiting.filter(p => p.payer_id === awaitingPayerFilter)
  filteredAwaiting = [...filteredAwaiting].sort((a, b) =>
    awaitingSort === 'payer' ? a.payer_id.localeCompare(b.payer_id)
      : daysBetween(b.created_at, new Date().toISOString()) - daysBetween(a.created_at, new Date().toISOString())
  )

  return (
    <>
      {modal?.type === 'approve' && <ApproveModal pa={modal.pa} onDone={handleApproved} onClose={() => setModal(null)} />}
      {modal?.type === 'deny' && <DenyModal pa={modal.pa} onDone={handleDenied} onClose={() => setModal(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Needs attention */}
        <QueueSection title="Needs Attention" dotColor="#DC2626" count={localNeedsAttention.length} empty="Nothing needs your attention right now.">
          {localNeedsAttention.map(pa => (
            <QueueRow key={pa.id} pa={pa} onApprove={() => setModal({ type: 'approve', pa })} onDeny={() => setModal({ type: 'deny', pa })}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                {pa.status === 'draft' && (
                  <Link href={`/dashboard/pa/${pa.id}`} style={pillStyle('#1A56DB', '#EBF2FF')}>Resume →</Link>
                )}
                {pa.status === 'submitted' && pa.follow_up_date && pa.follow_up_date <= today && (
                  <>
                    <span style={{ fontFamily: ff, fontSize: '11px', color: '#D97706', fontWeight: 600 }}>Follow-up due</span>
                    {PAYER_PHONES[pa.payer_id] && (
                      <span
                        onClick={() => navigator.clipboard.writeText(PAYER_PHONES[pa.payer_id])}
                        title="Click to copy number"
                        style={{ ...pillStyle('#D97706', '#FEF3C7'), cursor: 'pointer' }}
                      >
                        📞 {PAYER_PHONES[pa.payer_id]}
                      </span>
                    )}
                  </>
                )}
              </div>
            </QueueRow>
          ))}
        </QueueSection>

        {/* Awaiting decision */}
        <QueueSection
          title="Awaiting Decision"
          dotColor="#D97706"
          count={localAwaiting.length}
          empty="No requests currently awaiting a decision."
          controls={
            localAwaiting.length > 3 ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                {awaitingPayers.length > 1 && (
                  <select value={awaitingPayerFilter} onChange={e => setAwaitingPayerFilter(e.target.value)}
                    style={{ background: '#F4F7FB', border: '1px solid #E2E8F0', borderRadius: '5px', padding: '3px 8px', fontSize: '11px', color: '#475569', fontFamily: ff, outline: 'none' }}>
                    <option value="all">All plans</option>
                    {awaitingPayers.map(pid => <option key={pid} value={pid}>{pid.replace('_', ' ').toUpperCase()}</option>)}
                  </select>
                )}
                <button onClick={() => setAwaitingSort(s => s === 'age' ? 'payer' : 'age')}
                  style={{ background: '#F4F7FB', border: '1px solid #E2E8F0', borderRadius: '5px', padding: '3px 8px', fontSize: '11px', color: '#475569', fontFamily: ff, cursor: 'pointer' }}>
                  Sort: {awaitingSort === 'age' ? 'oldest first' : 'by plan'}
                </button>
              </div>
            ) : null
          }
        >
          {filteredAwaiting.map(pa => {
            const daysWaiting = daysBetween(pa.created_at, new Date().toISOString())
            const turnaround = PAYER_TURNAROUND[pa.payer_id] ?? 15
            const overdue = daysWaiting > turnaround
            return (
              <QueueRow key={pa.id} pa={pa} onApprove={() => setModal({ type: 'approve', pa })} onDeny={() => setModal({ type: 'deny', pa })}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontFamily: ff, fontSize: '11px', fontWeight: overdue ? 700 : 400, color: overdue ? '#DC2626' : '#94A3B8' }}>
                    {overdue ? `${daysWaiting}d — call insurer` : `Day ${daysWaiting} of ${turnaround}`}
                  </span>
                  {overdue && PAYER_PHONES[pa.payer_id] && (
                    <span onClick={() => navigator.clipboard.writeText(PAYER_PHONES[pa.payer_id])} title="Click to copy"
                      style={{ ...pillStyle('#DC2626', '#FEE2E2'), cursor: 'pointer' }}>📞 copy #</span>
                  )}
                </div>
              </QueueRow>
            )
          })}
        </QueueSection>

        {/* Appeal window */}
        <QueueSection title="Denied — File an Appeal" dotColor="#DC2626" count={localAppealWindow.length} empty="No denied requests awaiting an appeal.">
          {localAppealWindow.map(pa => {
            const daysDenied = pa.decision_at ? daysBetween(pa.decision_at, new Date().toISOString()) : null
            const daysLeft = 180 - (daysDenied ?? 0)
            return (
              <QueueRow key={pa.id} pa={pa} showActions={false}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Link href="/dashboard/appeals" style={pillStyle('#DC2626', '#FEE2E2')}>Appeal →</Link>
                  {daysLeft > 0 && <span style={{ fontFamily: ff, fontSize: '11px', color: daysLeft < 30 ? '#DC2626' : '#94A3B8' }}>{daysLeft}d left</span>}
                  {pa.denial_code && <span style={pillStyle('#D97706', '#FEF3C7')}>{pa.denial_code}</span>}
                </div>
              </QueueRow>
            )
          })}
        </QueueSection>

        {/* Expiring soon */}
        <QueueSection title="Approvals Expiring Soon" dotColor="#16A34A" count={expiringSoon.length} empty="No approvals expiring within 90 days." viewAllHref="/dashboard/renewals">
          {expiringSoon.slice(0, 5).map(pa => {
            const col = pa.daysLeft <= 14 ? '#DC2626' : pa.daysLeft <= 30 ? '#D97706' : '#16A34A'
            const bg = pa.daysLeft <= 14 ? '#FEE2E2' : pa.daysLeft <= 30 ? '#FEF3C7' : '#DCFCE7'
            return (
              <QueueRow key={pa.id} pa={pa} showActions={false}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={pillStyle(col, bg)}>{pa.daysLeft <= 0 ? 'Expired' : `${pa.daysLeft}d left`}</span>
                  <Link href="/dashboard/renewals" style={pillStyle('#1A56DB', '#EBF2FF')}>Renew →</Link>
                </div>
              </QueueRow>
            )
          })}
        </QueueSection>
      </div>
    </>
  )
}

// ── Queue row ────────────────────────────────────────────────────────────────

function QueueRow({ pa, children, onApprove, onDeny, showActions = true }: {
  pa: PriorAuth; children: React.ReactNode; onApprove?: () => void; onDeny?: () => void; showActions?: boolean
}) {
  const statusStyle: Record<string, { dot: string; label: string; labelColor: string; labelBg: string }> = {
    draft:     { dot: '#94A3B8', label: 'Draft',     labelColor: '#475569', labelBg: '#F1F5F9' },
    submitted: { dot: '#D97706', label: 'Submitted', labelColor: '#D97706', labelBg: '#FEF3C7' },
    approved:  { dot: '#16A34A', label: 'Approved',  labelColor: '#16A34A', labelBg: '#DCFCE7' },
    denied:    { dot: '#DC2626', label: 'Denied',    labelColor: '#DC2626', labelBg: '#FEE2E2' },
    appealed:  { dot: '#7C3AED', label: 'Appealed',  labelColor: '#7C3AED', labelBg: '#EDE9FE' },
  }
  const s = statusStyle[pa.status] ?? statusStyle.draft

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: showActions ? '10px' : '0' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: ff, fontSize: '13px', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pa.patient_name ?? 'Unknown patient'}
            </span>
            <span style={{ fontFamily: ff, fontSize: '11px', fontWeight: 600, color: s.labelColor, background: s.labelBg, padding: '1px 7px', borderRadius: '20px', flexShrink: 0 }}>
              {s.label}
            </span>
          </div>
          <div style={{ fontFamily: ff, fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: '12px' }}>
            {pa.procedure_name} · {pa.payer}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
      </div>
      {showActions && onApprove && onDeny && (pa.status === 'submitted' || pa.status === 'draft') && (
        <div style={{ display: 'flex', gap: '6px', paddingLeft: '12px' }}>
          <button onClick={onApprove} style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '6px', padding: '4px 12px', fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#16A34A', cursor: 'pointer' }}>
            ✓ Approved
          </button>
          <button onClick={onDeny} style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '4px 12px', fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#DC2626', cursor: 'pointer' }}>
            ✗ Denied
          </button>
          <Link href={`/dashboard/pa/${pa.id}`} style={{ background: '#F4F7FB', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 12px', fontFamily: ff, fontSize: '11px', color: '#475569', textDecoration: 'none' }}>
            View
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function QueueSection({ title, dotColor, count, empty, children, viewAllHref, controls }: {
  title: string; dotColor: string; count: number; empty: string
  children?: React.ReactNode; viewAllHref?: string; controls?: React.ReactNode
}) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
          <span style={{ fontFamily: ff, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{title}</span>
          {count > 0 && (
            <span style={{ background: '#F4F7FB', color: '#475569', fontSize: '11px', fontFamily: ff, fontWeight: 600, padding: '1px 8px', borderRadius: '99px', border: '1px solid #E2E8F0' }}>
              {count}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {controls}
          {viewAllHref && count > 0 && (
            <Link href={viewAllHref} style={{ fontFamily: ff, fontSize: '12px', color: '#1A56DB', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          )}
        </div>
      </div>
      {count === 0 ? (
        <div style={{ fontFamily: ff, fontSize: '13px', color: '#94A3B8', padding: '20px 0', textAlign: 'center' }}>{empty}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>{children}</div>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pillStyle(color: string, bg: string): React.CSSProperties {
  return { fontFamily: ff, fontSize: '11px', fontWeight: 600, color, background: bg, padding: '3px 9px', borderRadius: '20px', textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-block' }
}
