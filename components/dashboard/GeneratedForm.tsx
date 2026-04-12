'use client'
import { useState, useCallback } from 'react'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { PriorAuth, GeneratedForm as GeneratedFormType } from '@/lib/types'
import { DENIAL_CODES } from '@/lib/types'

interface GeneratedFormProps {
  pa: PriorAuth
  form: GeneratedFormType
}

const ff = 'var(--font-inter)'

export default function GeneratedFormComponent({ pa, form }: GeneratedFormProps) {
  const [status, setStatus] = useState(pa.status)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'form' | 'submit' | 'followup'>('form')

  // Submit tab state
  const [subMethod, setSubMethod] = useState<'fax' | 'portal' | 'phone' | 'mail'>('portal')
  const [subConfirmation, setSubConfirmation] = useState(pa.submission_confirmation ?? '')
  const [savingSubmit, setSavingSubmit] = useState(false)
  const [submitSaved, setSubmitSaved] = useState(false)

  // Auth number
  const [authNumber, setAuthNumber] = useState(pa.auth_number ?? '')
  const [authFrom, setAuthFrom] = useState(pa.auth_valid_from ?? '')
  const [authThrough, setAuthThrough] = useState(pa.auth_valid_through ?? '')
  const [savingAuth, setSavingAuth] = useState(false)
  const [authSaved, setAuthSaved] = useState(false)

  // Follow-up tab state
  const [payerCaseNumber, setPayerCaseNumber] = useState(pa.payer_case_number ?? '')
  const [followUpDate, setFollowUpDate] = useState(pa.follow_up_date ?? '')
  const [followUpNotes, setFollowUpNotes] = useState(pa.follow_up_notes ?? '')
  const [denialCode, setDenialCode] = useState(pa.denial_code ?? '')
  const [p2pRequested, setP2pRequested] = useState(pa.peer_to_peer_requested ?? false)
  const [savingFollowUp, setSavingFollowUp] = useState(false)
  const [followUpSaved, setFollowUpSaved] = useState(false)

  const approvalConfig = {
    high: { label: '✓ High likelihood of approval', bg: 'rgba(46,125,50,0.15)', color: '#66BB6A', border: 'rgba(46,125,50,0.3)' },
    medium: { label: '⚠ Medium likelihood of approval', bg: 'rgba(186,117,23,0.15)', color: '#FFA726', border: 'rgba(186,117,23,0.3)' },
    low: { label: '✗ Low likelihood — peer-to-peer recommended', bg: 'rgba(198,40,40,0.15)', color: '#EF5350', border: 'rgba(198,40,40,0.3)' },
  }[form.approval_likelihood]

  const criteriaColor = form.criteria_met === form.criteria_total ? '#66BB6A'
    : form.criteria_met >= form.criteria_total * 0.6 ? '#FFA726' : '#EF5350'

  const allText = `Prior Authorization Form\n\nICD-10: ${form.icd10_code} — ${form.icd10_description}\nCPT: ${form.cpt_code} — ${form.cpt_description}\n\nClinical Justification:\n${form.clinical_justification}\n\nMedical Necessity:\n${form.medical_necessity}\n\nSupporting Evidence:\n${form.supporting_evidence}\n\nPolicy References:\n${form.policy_sections_cited.join('\n')}`

  const handleCopy = () => {
    navigator.clipboard.writeText(allText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMarkSubmitted = async () => {
    setSavingSubmit(true)
    const supabase = createClient()
    await supabase.from('prior_auths').update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submission_method: subMethod,
      submission_confirmation: subConfirmation || null,
    }).eq('id', pa.id)
    setStatus('submitted')
    setSavingSubmit(false)
    setSubmitSaved(true)
  }

  const handleSaveAuth = async () => {
    if (!authNumber.trim()) return
    setSavingAuth(true)
    const supabase = createClient()
    await supabase.from('prior_auths').update({
      auth_number: authNumber,
      auth_valid_from: authFrom || null,
      auth_valid_through: authThrough || null,
      status: 'approved',
      decision_at: new Date().toISOString(),
    }).eq('id', pa.id)
    setStatus('approved')
    setSavingAuth(false)
    setAuthSaved(true)
  }

  const handleSaveFollowUp = async () => {
    setSavingFollowUp(true)
    const supabase = createClient()
    const updates: Record<string, string | boolean | null> = {
      payer_case_number: payerCaseNumber || null,
      follow_up_date: followUpDate || null,
      follow_up_notes: followUpNotes || null,
      peer_to_peer_requested: p2pRequested,
    }
    if (denialCode) {
      updates.denial_code = denialCode
      updates.status = 'denied'
      updates.decision_at = new Date().toISOString()
    }
    await (createClient()).from('prior_auths').update(updates).eq('id', pa.id)
    if (denialCode) setStatus('denied')
    setSavingFollowUp(false)
    setFollowUpSaved(true)
    setTimeout(() => setFollowUpSaved(false), 2000)
  }

  const [exporting, setExporting] = useState(false)

  const handleExportPDF = useCallback(async () => {
    setExporting(true)
    try {
      const cpf = pa.complete_pa_form as unknown as Record<string, unknown> | null
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payer_id: pa.payer_id,
          // Patient
          patient_name: pa.patient_name ?? cpf?.patient_name ?? '',
          patient_dob: pa.patient_dob ?? cpf?.patient_dob ?? '',
          patient_member_id: pa.patient_member_id ?? cpf?.patient_member_id ?? '',
          patient_group_number: pa.patient_group_number ?? cpf?.patient_group_number ?? '',
          patient_plan_name: pa.patient_plan_name ?? cpf?.patient_plan_name ?? '',
          // Provider
          physician_name: cpf?.physician_name ?? '',
          physician_npi: cpf?.physician_npi ?? '',
          physician_credentials: cpf?.physician_credentials ?? '',
          practice_name: cpf?.practice_name ?? '',
          practice_address: cpf?.practice_address ?? '',
          practice_city: cpf?.practice_city ?? '',
          practice_state: cpf?.practice_state ?? '',
          practice_zip: cpf?.practice_zip ?? '',
          practice_phone: cpf?.practice_phone ?? '',
          practice_fax: cpf?.practice_fax ?? '',
          // Service
          procedure_name: pa.procedure_name ?? '',
          cpt_code: form.cpt_code ?? '',
          cpt_description: form.cpt_description ?? '',
          icd10_code: form.icd10_code ?? '',
          icd10_description: form.icd10_description ?? '',
          service_date: cpf?.requested_service_date ?? '',
          urgency: pa.urgency ?? 'routine',
          rendering_provider: cpf?.rendering_provider_name ?? '',
          rendering_facility: cpf?.rendering_facility_name ?? '',
          // Clinical
          clinical_justification: form.clinical_justification ?? '',
          medical_necessity: form.medical_necessity ?? '',
          supporting_evidence: form.supporting_evidence ?? '',
          policy_sections_cited: form.policy_sections_cited ?? [],
          criteria_details: form.criteria_details ?? [],
          criteria_met: form.criteria_met ?? 0,
          criteria_total: form.criteria_total ?? 0,
          approval_likelihood: form.approval_likelihood ?? '',
          missing_information: form.missing_information ?? [],
        }),
      })
      if (!res.ok) throw new Error('PDF export failed')
      const html = await res.text()
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
      }
    } catch (e) {
      console.error('PDF export error:', e)
      alert('PDF export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }, [pa, form])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: ff, fontWeight: 700, fontSize: '13px', color: criteriaColor, marginBottom: '6px' }}>
            {form.criteria_met === form.criteria_total ? '✓' : '⚠'} {form.criteria_met} of {form.criteria_total} criteria met
          </div>
          <div style={{ background: approvalConfig.bg, border: `1px solid ${approvalConfig.border}`, color: approvalConfig.color, display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', fontFamily: ff }}>
            {approvalConfig.label}
          </div>
        </div>
        <Badge variant={status}>{status}</Badge>
      </div>

      {/* Tabs: Form / Submit & Track / Follow-up */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '16px' }}>
        {([
          { key: 'form', label: 'PA Form' },
          { key: 'submit', label: 'Submit & Track' },
          { key: 'followup', label: 'Follow-up' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none', border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #1B4FD8' : '2px solid transparent',
              padding: '7px 14px', fontFamily: ff, fontSize: '12px',
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#1D4ED8' : '#64748B',
              cursor: 'pointer', marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: PA Form ── */}
      {activeTab === 'form' && (
        <>
          {[
            { label: 'Diagnosis', value: `${form.icd10_code} — ${form.icd10_description}` },
            { label: 'Procedure', value: `${form.cpt_code} — ${form.cpt_description}` },
            { label: 'Clinical Justification', value: form.clinical_justification },
            { label: 'Medical Necessity', value: form.medical_necessity },
            { label: 'Supporting Evidence', value: form.supporting_evidence },
            { label: 'Policy References', value: form.policy_sections_cited.join(' · ') },
          ].map(section => (
            <div key={section.label} style={{ marginBottom: '10px', padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', borderLeft: '2px solid #1B4FD8' }}>
              <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>{section.label}</div>
              <div style={{ fontFamily: ff, fontSize: '12px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{section.value}</div>
            </div>
          ))}

          {/* Criteria breakdown */}
          {form.criteria_details && form.criteria_details.length > 0 && (
            <div style={{ marginBottom: '10px', padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Criteria Checklist</div>
              {form.criteria_details.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: c.met ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: c.met ? '#4ade80' : '#f87171', flexShrink: 0, marginTop: '1px' }}>
                    {c.met ? '✓' : '✗'}
                  </span>
                  <div>
                    <div style={{ fontFamily: ff, fontSize: '11px', fontWeight: 500, color: c.met ? '#334155' : '#64748B', marginBottom: '1px' }}>{c.criterion}</div>
                    {c.evidence && <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', fontStyle: 'italic' }}>{c.evidence}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Missing info */}
          {form.missing_information && form.missing_information.length > 0 && (
            <div style={{ marginBottom: '10px', padding: '12px 14px', background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '8px' }}>
              <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#FFA726', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Missing Information</div>
              {form.missing_information.map((item, i) => (
                <div key={i} style={{ fontFamily: ff, fontSize: '12px', color: '#D97706', marginBottom: '3px' }}>○ {item}</div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button onClick={handleCopy} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', color: copied ? '#16A34A' : '#475569', cursor: 'pointer', fontFamily: ff }}>
              {copied ? '✓ Copied' : 'Copy all'}
            </button>
            <button onClick={handleExportPDF} disabled={exporting} style={{ background: exporting ? 'rgba(27,79,216,0.06)' : '#1B4FD8', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: exporting ? '#6B7A9A' : '#ffffff', cursor: exporting ? 'default' : 'pointer', fontFamily: ff }}>
              {exporting ? '⏳ Generating PDF…' : '⬇ Download PA Form (PDF)'}
            </button>
            <button onClick={() => setActiveTab('submit')} style={{ background: '#EBF2FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', color: '#1D4ED8', cursor: 'pointer', fontFamily: ff }}>
              Log submission →
            </button>
          </div>
        </>
      )}

      {/* ── Tab: Submit & Track ── */}
      {activeTab === 'submit' && (
        <div>
          {/* Submission method */}
          {status === 'draft' && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>How are you submitting?</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
                {(['portal', 'fax', 'phone', 'mail'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setSubMethod(m)}
                    style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${subMethod === m ? '#1B4FD8' : '#E2E8F0'}`, background: subMethod === m ? '#EBF2FF' : '#F8FAFC', color: subMethod === m ? '#1D4ED8' : '#64748B', fontFamily: ff, fontSize: '12px', fontWeight: subMethod === m ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}
                  >
                    {m === 'portal' ? '🌐 Portal' : m === 'fax' ? '📠 Fax' : m === 'phone' ? '📞 Phone' : '✉ Mail'}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Confirmation # / Reference # (optional)</div>
                <input
                  value={subConfirmation}
                  onChange={e => setSubConfirmation(e.target.value)}
                  placeholder="e.g. REF-20240411-0042"
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
                />
              </div>
              <button
                onClick={handleMarkSubmitted}
                disabled={savingSubmit}
                style={{ width: '100%', background: '#1B4FD8', border: 'none', borderRadius: '8px', padding: '11px', fontFamily: ff, fontSize: '13px', fontWeight: 600, color: '#ffffff', cursor: 'pointer' }}
              >
                {savingSubmit ? 'Saving...' : submitSaved ? '✓ Marked as submitted' : 'Mark as submitted →'}
              </button>
            </div>
          )}

          {/* Auth number section */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Log approval / auth number</div>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Authorization number *</div>
              <input
                value={authNumber}
                onChange={e => setAuthNumber(e.target.value)}
                placeholder="e.g. AUTH-2024-123456"
                style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Valid from</div>
                <input type="date" value={authFrom} onChange={e => setAuthFrom(e.target.value)} style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 10px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none', colorScheme: 'light' }} />
              </div>
              <div>
                <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Valid through</div>
                <input type="date" value={authThrough} onChange={e => setAuthThrough(e.target.value)} style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 10px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none', colorScheme: 'light' }} />
              </div>
            </div>
            <button
              onClick={handleSaveAuth}
              disabled={savingAuth || !authNumber.trim()}
              style={{ width: '100%', background: authNumber.trim() ? 'rgba(22,163,74,0.08)' : '#F8FAFC', border: `1px solid ${authNumber.trim() ? 'rgba(22,163,74,0.2)' : '#E2E8F0'}`, borderRadius: '8px', padding: '10px', fontFamily: ff, fontSize: '12px', fontWeight: 600, color: authSaved ? '#16A34A' : authNumber.trim() ? '#16A34A' : '#94A3B8', cursor: authNumber.trim() ? 'pointer' : 'default' }}
            >
              {savingAuth ? 'Saving...' : authSaved ? '✓ Approved & logged' : 'Save auth number & mark approved'}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Follow-up ── */}
      {activeTab === 'followup' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Payer case / reference number</div>
            <input
              value={payerCaseNumber}
              onChange={e => setPayerCaseNumber(e.target.value)}
              placeholder="Payer-assigned case number"
              style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Follow-up date</div>
            <input
              type="date"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none', colorScheme: 'light' }}
            />
            <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>This PA will appear in your queue on this date</div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Notes (call log, contact name, etc.)</div>
            <textarea
              value={followUpNotes}
              onChange={e => setFollowUpNotes(e.target.value)}
              placeholder="e.g. Spoke with Jane at BCBS IL, case escalated, callback expected by 4/15"
              rows={3}
              style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none', resize: 'vertical' }}
            />
          </div>

          {/* Denial section */}
          <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Log denial</div>
            <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Denial code (if denied)</div>
            <select
              value={denialCode}
              onChange={e => setDenialCode(e.target.value)}
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none', marginBottom: '8px' }}
            >
              <option value="">Not denied</option>
              {DENIAL_CODES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            {denialCode && (
              <div style={{ fontFamily: ff, fontSize: '11px', color: '#FFA726', background: 'rgba(255,167,38,0.08)', border: '1px solid rgba(255,167,38,0.15)', borderRadius: '6px', padding: '8px 10px' }}>
                Saving this will mark the PA as denied and move it to the Appeals queue.
              </div>
            )}
          </div>

          {/* Peer-to-peer */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <input
              type="checkbox"
              id="p2p"
              checked={p2pRequested}
              onChange={e => setP2pRequested(e.target.checked)}
              style={{ accentColor: '#1B4FD8', width: '14px', height: '14px', cursor: 'pointer' }}
            />
            <label htmlFor="p2p" style={{ fontFamily: ff, fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
              Peer-to-peer review requested — track this for follow-up
            </label>
          </div>

          <button
            onClick={handleSaveFollowUp}
            disabled={savingFollowUp}
            style={{ width: '100%', background: '#EBF2FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '11px', fontFamily: ff, fontSize: '13px', fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}
          >
            {savingFollowUp ? 'Saving...' : followUpSaved ? '✓ Saved' : 'Save follow-up info'}
          </button>
        </div>
      )}
    </div>
  )
}
