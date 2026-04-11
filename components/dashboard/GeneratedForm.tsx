'use client'
import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { PriorAuth, GeneratedForm as GeneratedFormType } from '@/lib/types'

interface GeneratedFormProps {
  pa: PriorAuth
  form: GeneratedFormType
}

export default function GeneratedFormComponent({ pa, form }: GeneratedFormProps) {
  const [status, setStatus] = useState(pa.status)
  const [copied, setCopied] = useState(false)
  const [marking, setMarking] = useState(false)

  const approvalConfig = {
    high: { label: '✓ High likelihood of approval', bg: 'rgba(46,125,50,0.15)', color: '#66BB6A', border: 'rgba(46,125,50,0.3)' },
    medium: { label: '⚠ Medium likelihood of approval', bg: 'rgba(186,117,23,0.15)', color: '#FFA726', border: 'rgba(186,117,23,0.3)' },
    low: { label: '✗ Low likelihood of approval', bg: 'rgba(198,40,40,0.15)', color: '#EF5350', border: 'rgba(198,40,40,0.3)' },
  }[form.approval_likelihood]

  const criteriaLabel = form.criteria_met === form.criteria_total
    ? `✓ ${form.criteria_met} of ${form.criteria_total} criteria met`
    : form.criteria_met >= form.criteria_total * 0.6
    ? `⚠ ${form.criteria_met} of ${form.criteria_total} criteria met`
    : `✗ ${form.criteria_met} of ${form.criteria_total} criteria met`

  const criteriaColor = form.criteria_met === form.criteria_total ? '#66BB6A'
    : form.criteria_met >= form.criteria_total * 0.6 ? '#FFA726' : '#EF5350'

  const allText = `Prior Authorization Form\n\nICD-10: ${form.icd10_code} — ${form.icd10_description}\nCPT: ${form.cpt_code} — ${form.cpt_description}\n\nClinical Justification:\n${form.clinical_justification}\n\nMedical Necessity:\n${form.medical_necessity}\n\nSupporting Evidence:\n${form.supporting_evidence}\n\nPolicy References:\n${form.policy_sections_cited.join('\n')}`

  const handleCopy = () => {
    navigator.clipboard.writeText(allText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMarkSubmitted = async () => {
    setMarking(true)
    const supabase = createClient()
    await supabase.from('prior_auths').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', pa.id)
    setStatus('submitted')
    setMarking(false)
  }

  const handlePrint = () => {
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`<pre style="font-family:monospace;padding:40px;white-space:pre-wrap;">${allText}</pre>`)
      w.print()
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '13px', color: criteriaColor, marginBottom: '6px' }}>{criteriaLabel}</div>
          <div style={{ background: approvalConfig.bg, border: `1px solid ${approvalConfig.border}`, color: approvalConfig.color, display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', fontFamily: 'var(--font-inter)' }}>
            {approvalConfig.label}
          </div>
        </div>
        <Badge variant={status}>{status}</Badge>
      </div>
      {[
        { label: 'Diagnosis', value: `${form.icd10_code} — ${form.icd10_description}` },
        { label: 'Procedure', value: `${form.cpt_code} — ${form.cpt_description}` },
        { label: 'Clinical Justification', value: form.clinical_justification },
        { label: 'Medical Necessity', value: form.medical_necessity },
        { label: 'Supporting Evidence', value: form.supporting_evidence },
        { label: 'Policy References', value: form.policy_sections_cited.join(' · ') },
      ].map(section => (
        <div key={section.label} style={{ marginBottom: '12px', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', borderLeft: '2px solid #1B4FD8' }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{section.label}</div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#8899BB', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{section.value}</div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={handleCopy}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', color: copied ? '#66BB6A' : '#ffffff', cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'all 0.2s' }}
        >
          {copied ? '✓ Copied' : 'Copy form'}
        </button>
        {status === 'draft' && (
          <button
            onClick={handleMarkSubmitted}
            disabled={marking}
            style={{ background: 'rgba(27,79,216,0.15)', border: '1px solid rgba(27,79,216,0.3)', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', color: '#7BA3FF', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
          >
            {marking ? 'Saving...' : 'Mark as submitted'}
          </button>
        )}
        {status === 'submitted' && (
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#66BB6A', padding: '8px 0' }}>
            Status: Submitted
          </span>
        )}
        <button
          onClick={handlePrint}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', color: '#6B7A9A', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
        >
          Download
        </button>
      </div>
    </div>
  )
}
