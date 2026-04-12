'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PAYERS, PROCEDURE_CATEGORIES } from '@/lib/types'
import type { CompletePAForm, PracticeProfile, ExtractedClinicalData, PriorAuth, StepTherapyEntry, DrugPAInfo } from '@/lib/types'

// ─── helpers ───────────────────────────────────────────────────────────────

const ff = 'var(--font-inter)'

function sLabel(text: string) {
  return (
    <div style={{ fontFamily: ff, fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '10px' }}>
      {text}
    </div>
  )
}

function fieldInput(
  value: string,
  onChange: (v: string) => void,
  placeholder: string,
  type = 'text',
  helper?: string,
) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '7px',
          padding: '9px 12px',
          fontSize: '13px',
          color: '#0F172A',
          fontFamily: ff,
          outline: 'none',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = '#1B4FD8')}
        onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
      />
      {helper && <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>{helper}</div>}
    </div>
  )
}

function divider() {
  return <div style={{ borderTop: '1px solid #E2E8F0', margin: '16px 0' }} />
}

// ─── checklist logic ────────────────────────────────────────────────────────

type ChecklistItem = { label: string; check: (note: string) => boolean }

function getChecklist(procedureCategory: string): ChecklistItem[] {
  const cat = procedureCategory.split('_')[0]
  if (cat === 'imaging') {
    return [
      { label: 'Diagnosis mentioned', check: n => n.length > 10 },
      { label: 'Duration of symptoms', check: n => /\d+\s*(week|month|day|year)/i.test(n) },
      { label: 'Conservative treatment tried', check: n => /(PT|physical therapy|NSAID|medication|injection|ibuprofen|naproxen|meloxicam)/i.test(n) },
      { label: 'Treatment duration', check: n => /\d+\s*(week|month).*(therapy|PT|treatment|medication)/i.test(n) || /(therapy|PT|treatment|medication).{1,30}\d+\s*(week|month)/i.test(n) },
      { label: 'Clinical findings', check: n => /(exam|deficit|finding|tender|positive|negative|MRI|X-ray|weakness|sensation)/i.test(n) },
      { label: 'Why imaging needed', check: n => /(rule out|evaluate|plan|surgical|confirm|needed|indicated)/i.test(n) },
    ]
  }
  if (cat === 'surgery') {
    return [
      { label: 'Diagnosis mentioned', check: n => n.length > 10 },
      { label: 'Conservative treatment ≥3 months', check: n => /(3\s*month|six\s*week|12\s*week|3\s*mo|PT|physical therapy)/i.test(n) },
      { label: 'Functional limitation documented', check: n => /(limit|unable|difficulty|impair|ADL|walk|stand|function)/i.test(n) },
      { label: 'Imaging confirmation', check: n => /(MRI|CT|X-ray|imaging|scan|showed|reveals|confirms)/i.test(n) },
      { label: 'Failed treatments listed', check: n => /(failed|no improvement|ineffective|exhausted|tried)/i.test(n) },
    ]
  }
  if (cat === 'drug') {
    return [
      { label: 'Diagnosis with specificity', check: n => n.length > 20 },
      { label: 'Prior medications tried', check: n => /(methotrexate|MTX|prior|failed|tried|inadequate|conventional|first.line|DMARD|csDMARD|hydroxychloroquine|sulfasalazine)/i.test(n) },
      { label: 'Medication duration', check: n => /\d+\s*(week|month|mo\b|wk\b|yr\b|year)/i.test(n) },
      { label: 'Specialist involvement', check: n => /(rheumatologist|dermatologist|specialist|oncologist|physician)/i.test(n) },
      { label: 'Clinical necessity stated', check: n => /(necessary|indicated|required|biologic|refractory)/i.test(n) },
    ]
  }
  if (cat === 'therapy') {
    return [
      { label: 'Diagnosis mentioned', check: n => n.length > 10 },
      { label: 'Functional deficits listed', check: n => /(deficit|weakness|impair|limit|ROM|range|mobility)/i.test(n) },
      { label: 'Goals mentioned', check: n => /(goal|improve|restore|strengthen|increase)/i.test(n) },
      { label: 'Physician referral noted', check: n => /(referral|ordered|physician|recommend|prescribed)/i.test(n) },
    ]
  }
  return [
    { label: 'Diagnosis mentioned', check: n => n.length > 10 },
    { label: 'Clinical indication described', check: n => n.length > 60 },
    { label: 'Relevant history included', check: n => n.length > 150 },
    { label: 'Medical necessity stated', check: n => /(necessary|indicated|required|needed)/i.test(n) },
  ]
}

function getNotePlaceholder(procedureCategory: string): string {
  const cat = procedureCategory.split('_')[0]
  if (cat === 'imaging') {
    return 'Include: diagnosis, duration of symptoms, conservative treatments tried (physical therapy, medications, duration), neurological findings, and why imaging is needed now.'
  }
  if (cat === 'surgery') {
    return 'Include: diagnosis, conservative treatment history (minimum duration and what was tried), functional limitations, failed treatments, and why surgery is the appropriate next step.'
  }
  if (cat === 'drug') {
    return 'Include: diagnosis, medications previously tried and failed (generic alternatives, dosages, duration), contraindications to alternatives, and why this specific medication is required.'
  }
  if (cat === 'therapy') {
    return 'Include: diagnosis, functional deficits, why therapy is medically necessary, and expected functional goals.'
  }
  return 'Paste the clinical note from your EHR, or type what you know about this patient\'s case. Include: diagnosis, symptoms, duration, treatments tried, and why this procedure is needed.'
}

// ─── loading messages ────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  'Checking payer requirements...',
  'Matching clinical criteria...',
  'Writing justification...',
  'Building your form...',
  'Almost done...',
]

// ─── main component ──────────────────────────────────────────────────────────

type LoadingPhase = 'idle' | 'generating' | 'done' | 'error'

export default function NewPAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Practice profile
  const [practice, setPractice] = useState<PracticeProfile | null>(null)
  const [practiceLoading, setPracticeLoading] = useState(true)

  // Left panel — patient (pre-filled from renewal query params if present)
  const [patientName, setPatientName] = useState(searchParams.get('patient_name') ?? '')
  const [patientDob, setPatientDob] = useState(searchParams.get('patient_dob') ?? '')
  const [memberId, setMemberId] = useState(searchParams.get('member_id') ?? '')
  const [groupNumber, setGroupNumber] = useState(searchParams.get('group_number') ?? '')

  // Left panel — service
  const [payerId, setPayerId] = useState<string | null>(searchParams.get('payer_id') ?? null)
  const [procedureCategory, setProcedureCategory] = useState('')
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'emergent'>('routine')
  const [serviceDate, setServiceDate] = useState('')

  // Left panel — rendering provider (collapsible)
  const [renderingExpanded, setRenderingExpanded] = useState(false)
  const [renderingProvider, setRenderingProvider] = useState('')
  const [renderingFacility, setRenderingFacility] = useState('')

  // Center panel — note
  const [noteTab, setNoteTab] = useState<'type' | 'upload'>('type')
  const [note, setNote] = useState('')
  const [dragging, setDragging] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extraction, setExtraction] = useState<ExtractedClinicalData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardInputRef = useRef<HTMLInputElement>(null)

  // Right panel
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('idle')
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [result, setResult] = useState<{ pa: PriorAuth; form: CompletePAForm } | null>(null)
  const [error, setError] = useState('')

  // Auth number after submit
  const [authNumber, setAuthNumber] = useState('')
  const [savingAuth, setSavingAuth] = useState(false)
  const [authSaved, setAuthSaved] = useState(false)

  // User plan info (for quota)
  const [userPlan, setUserPlan] = useState<{ plan: string; pa_count_this_month: number; pa_quota: number | null } | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Drug PA fields (shown when procedureCategory starts with 'drug_')
  const [drugBrandName, setDrugBrandName] = useState('')
  const [drugGenericName, setDrugGenericName] = useState('')
  const [drugNdc, setDrugNdc] = useState('')
  const [drugDosage, setDrugDosage] = useState('')
  const [drugQuantity, setDrugQuantity] = useState('')
  const [drugDaysSupply, setDrugDaysSupply] = useState('')
  const [drugRefills, setDrugRefills] = useState('0')
  const [drugRoute, setDrugRoute] = useState('oral')
  const [drugExceptionBasis, setDrugExceptionBasis] = useState<DrugPAInfo['exception_basis']>('step_therapy_failure')
  const [prescriberName, setPrescriberName] = useState('')
  const [prescriberNpi, setPrescriberNpi] = useState('')
  const [prescriberDea, setPrescriberDea] = useState('')
  const [prescriberPhone, setPrescriberPhone] = useState('')
  const [prescriberSpecialty, setPrescriberSpecialty] = useState('')
  const [stepTherapy, setStepTherapy] = useState<StepTherapyEntry[]>([
    { drug_name: '', dose: '', outcome: 'inadequate_response', reason_stopped: '' },
  ])
  const [drugSectionExpanded, setDrugSectionExpanded] = useState(true)
  const [stepTherapyExpanded, setStepTherapyExpanded] = useState(true)

  // Fetch practice + user data
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/signin'); return }
      const [practiceRes, userRes] = await Promise.all([
        fetch('/api/practice'),
        supabase.from('users').select('plan, pa_count_this_month, pa_quota').eq('id', user.id).single(),
      ])
      const practiceData = await practiceRes.json() as { success: boolean; practice: PracticeProfile | null }
      if (practiceData.success && practiceData.practice) {
        setPractice(practiceData.practice)
        // Pre-select payers from practice profile
        if (practiceData.practice.in_network_payers?.length > 0 && !payerId) {
          // don't auto-select — let user choose
        }
      }
      if (!userRes.error) setUserPlan(userRes.data)
      setPracticeLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  // Loading message cycle
  useEffect(() => {
    if (loadingPhase !== 'generating') return
    setLoadingMsgIdx(0)
    const intervals = LOADING_MESSAGES.map((_, i) =>
      setTimeout(() => setLoadingMsgIdx(i), i * 2000)
    )
    return () => intervals.forEach(clearTimeout)
  }, [loadingPhase])

  // Checklist
  const checklist = getChecklist(procedureCategory)
  const checkedCount = checklist.filter(item => item.check(note)).length

  const isDrugPA = procedureCategory.startsWith('drug_')

  // Build drug PA info for submission
  const buildDrugPAInfo = (): DrugPAInfo | undefined => {
    if (!isDrugPA) return undefined
    return {
      brand_name: drugBrandName,
      generic_name: drugGenericName,
      ndc_code: drugNdc || undefined,
      dosage_strength: drugDosage,
      quantity_requested: parseInt(drugQuantity) || 0,
      days_supply: parseInt(drugDaysSupply) || 30,
      refills_requested: parseInt(drugRefills) || 0,
      route_of_administration: drugRoute,
      prescriber_name: prescriberName,
      prescriber_npi: prescriberNpi,
      prescriber_dea: prescriberDea || undefined,
      prescriber_phone: prescriberPhone || undefined,
      prescriber_specialty: prescriberSpecialty || undefined,
      exception_basis: drugExceptionBasis,
      step_therapy: stepTherapy.filter(s => s.drug_name.trim()),
    }
  }

  // Step therapy note: auto-generate text from structured entries
  const stepTherapyText = stepTherapy
    .filter(s => s.drug_name.trim())
    .map((s, i) => {
      const durationStr = s.duration_weeks ? ` for ${s.duration_weeks} weeks` : (s.start_date && s.end_date ? ` from ${s.start_date} to ${s.end_date}` : '')
      const outcomeMap: Record<string, string> = {
        inadequate_response: 'inadequate response',
        adverse_effect: 'adverse effect',
        contraindicated: 'contraindicated',
        not_covered: 'not covered by plan',
        other: s.reason_stopped ?? 'discontinued',
      }
      return `${i + 1}. ${s.drug_name} ${s.dose}${durationStr} — ${outcomeMap[s.outcome]}${s.reason_stopped && s.outcome !== 'other' ? ` (${s.reason_stopped})` : ''}`
    })
    .join('\n')

  // Form completeness (separate from loading state)
  const formComplete =
    patientName.trim().length > 0 &&
    memberId.trim().length > 0 &&
    !!payerId &&
    procedureCategory !== '' &&
    note.trim().length >= 40 &&
    (!isDrugPA || (drugGenericName.trim().length > 0 && prescriberNpi.trim().length > 0))

  const canGenerate = formComplete && loadingPhase === 'idle'

  const missingItems: string[] = []
  if (!patientName.trim()) missingItems.push('Add patient name')
  if (!memberId.trim()) missingItems.push('Add member ID')
  if (!payerId) missingItems.push('Select a payer')
  if (!procedureCategory) missingItems.push('Select procedure type')
  if (note.trim().length < 40) missingItems.push('Add a clinical note (min 40 chars)')
  if (isDrugPA && !drugGenericName.trim()) missingItems.push('Add generic drug name')
  if (isDrugPA && !prescriberNpi.trim()) missingItems.push('Add prescriber NPI')

  const isAtQuota = userPlan?.plan === 'free' && (userPlan.pa_quota !== null) && (userPlan.pa_count_this_month >= (userPlan.pa_quota ?? 10))

  const availablePayers = practice
    ? PAYERS.filter(p => practice.in_network_payers.includes(p.id))
    : PAYERS

  // ─── handlers ───────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!canGenerate || !payerId) return
    setLoadingPhase('generating')
    setError('')
    setResult(null)

    const procedureLabel = PROCEDURE_CATEGORIES.find(p => p.value === procedureCategory)?.label ?? procedureCategory

    try {
      const drugInfo = buildDrugPAInfo()
      // For drug PAs, append structured step therapy to the clinical note for AI context
      const fullNote = isDrugPA && stepTherapyText
        ? `${note}\n\nSTEP THERAPY HISTORY:\n${stepTherapyText}`
        : note

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicalNote: fullNote,
          payerId,
          procedureName: procedureLabel,
          procedureCategory,
          urgency,
          drugPAInfo: drugInfo,
          patientInfo: {
            patient_name: patientName,
            patient_dob: patientDob,
            patient_member_id: memberId,
            patient_group_number: groupNumber,
            requested_service_date: serviceDate || undefined,
            urgency,
            rendering_provider_name: renderingProvider || undefined,
            rendering_facility_name: renderingFacility || undefined,
          },
        }),
      })
      const data = await res.json() as { success: boolean; pa?: PriorAuth; completePAForm?: CompletePAForm; error?: string }
      if (res.status === 402) { setShowUpgrade(true); setLoadingPhase('idle'); return }
      if (!data.success || !data.pa || !data.completePAForm) {
        setError(data.error ?? 'Generation failed')
        setLoadingPhase('error')
        return
      }
      setResult({ pa: data.pa, form: data.completePAForm })
      setLoadingPhase('done')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoadingPhase('error')
    }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    setExtracting(true)
    setNoteTab('upload')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('procedure_type', PROCEDURE_CATEGORIES.find(p => p.value === procedureCategory)?.label ?? 'general')
    try {
      const res = await fetch('/api/extract-note', { method: 'POST', body: formData })
      const data = await res.json() as { success: boolean; extraction?: ExtractedClinicalData }
      if (data.success && data.extraction) {
        setExtraction(data.extraction)
        if (data.extraction.raw_text) setNote(data.extraction.raw_text)
        if (data.extraction.patient_name && !patientName) setPatientName(data.extraction.patient_name)
        if (data.extraction.patient_dob && !patientDob) setPatientDob(data.extraction.patient_dob)
        if (data.extraction.generic_drug_name) setDrugGenericName(data.extraction.generic_drug_name)
        if (data.extraction.prescriber_npi) setPrescriberNpi(data.extraction.prescriber_npi)
      }
    } catch { /* silent */ }
    setExtracting(false)
  }, [procedureCategory, patientName, patientDob])

  const handleCardUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/extract-card', { method: 'POST', body: formData })
      const data = await res.json() as { success: boolean; card?: { patient_name?: string; patient_dob?: string; member_id?: string; group_number?: string; plan_name?: string; payer_name?: string } }
      if (data.success && data.card) {
        if (data.card.patient_name && !patientName) setPatientName(data.card.patient_name)
        if (data.card.patient_dob && !patientDob) setPatientDob(data.card.patient_dob)
        if (data.card.member_id) setMemberId(data.card.member_id)
        if (data.card.group_number) setGroupNumber(data.card.group_number)
        if (data.card.payer_name && !payerId) {
          const pn = data.card.payer_name.toLowerCase()
          if (pn.includes('blue cross') || pn.includes('bcbs') || pn.includes('bluecross')) setPayerId('bcbs_il')
          else if (pn.includes('aetna')) setPayerId('aetna')
          else if (pn.includes('united') || pn.includes('uhc')) setPayerId('uhc')
          else if (pn.includes('cigna')) setPayerId('cigna')
          else if (pn.includes('humana')) setPayerId('humana')
          else if (pn.includes('medicare')) setPayerId('medicare')
          else if (pn.includes('medicaid')) setPayerId('medicaid')
        }
      }
    } catch { /* silent */ }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  const handleMarkSubmitted = async () => {
    if (!result) return
    const supabase = createClient()
    await supabase.from('prior_auths').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', result.pa.id)
    setResult(prev => prev ? { ...prev, pa: { ...prev.pa, status: 'submitted' } } : prev)
  }

  const handleSaveAuth = async () => {
    if (!result || !authNumber.trim()) return
    setSavingAuth(true)
    const supabase = createClient()
    await supabase.from('prior_auths').update({ auth_number: authNumber }).eq('id', result.pa.id)
    setSavingAuth(false)
    setAuthSaved(true)
  }

  const handleCopyAll = () => {
    if (!result) return
    const f = result.form
    const text = `PRIOR AUTHORIZATION REQUEST
Generated: ${new Date(f.generated_at).toLocaleDateString()}
Payer: ${f.payer_name}

PATIENT
Name: ${f.patient_name}
Date of birth: ${f.patient_dob}
Member ID: ${f.patient_member_id}
Group: ${f.patient_group_number || '—'}

ORDERING PROVIDER
${f.physician_name}${f.physician_credentials ? `, ${f.physician_credentials}` : ''}
NPI: ${f.physician_npi}
${f.practice_name}
${f.practice_address}, ${f.practice_city}, ${f.practice_state} ${f.practice_zip}
Phone: ${f.practice_phone}

SERVICE
Diagnosis: ${f.icd10_code} — ${f.icd10_description}
Procedure: ${f.cpt_code} — ${f.cpt_description}
Urgency: ${f.urgency}

CLINICAL JUSTIFICATION
${f.clinical_justification}

MEDICAL NECESSITY
${f.medical_necessity}

SUPPORTING EVIDENCE
${f.supporting_evidence}

POLICY REFERENCES
${f.policy_sections_cited.join(' · ')}`
    navigator.clipboard.writeText(text)
  }

  // ─── grouped procedure categories ───────────────────────────────────────

  const groups: Record<string, typeof PROCEDURE_CATEGORIES> = {}
  for (const p of PROCEDURE_CATEGORIES) {
    if (!groups[p.group]) groups[p.group] = []
    groups[p.group].push(p)
  }

  // ─── render ─────────────────────────────────────────────────────────────

  if (practiceLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontFamily: ff }}>Loading...</div>
  }

  const isSubmitted = result?.pa.status === 'submitted'

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = '' }}
      />
      <input
        ref={cardInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleCardUpload(f); e.target.value = '' }}
      />

      {/* Three-panel layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ─── LEFT PANEL ─── */}
        <div style={{ width: '320px', flexShrink: 0, background: '#FFFFFF', borderRight: '1px solid #E2E8F0', padding: '20px', overflowY: 'auto' }}>

          {sLabel('Patient')}

          {fieldInput(patientName, setPatientName, 'Jane Smith')}
          {fieldInput(patientDob, setPatientDob, 'MM/DD/YYYY')}
          {fieldInput(memberId, setMemberId, 'XYZ123456789', 'text', 'On the front of their insurance card')}
          {fieldInput(groupNumber, setGroupNumber, 'GRP001234', 'text', 'On the insurance card — optional')}

          {/* Insurance card upload hint */}
          <button
            onClick={() => cardInputRef.current?.click()}
            style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '4px' }}
          >
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>📷</span>
            <span style={{ fontFamily: ff, fontSize: '11px', color: '#64748B' }}>Upload insurance card to auto-fill</span>
          </button>

          {divider()}
          {sLabel('Service')}

          {/* Payer selection */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>Insurance payer *</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {availablePayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPayerId(p.id)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '99px',
                    border: `1px solid ${payerId === p.id ? '#1B4FD8' : '#E2E8F0'}`,
                    background: payerId === p.id ? '#1B4FD8' : 'transparent',
                    color: payerId === p.id ? '#fff' : '#475569',
                    fontFamily: ff,
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {p.shortName}
                </button>
              ))}
            </div>
            {payerId === 'cigna' && (
              <div style={{ fontFamily: ff, fontSize: '10px', color: '#D97706', marginTop: '4px' }}>Routes through eviCore for imaging</div>
            )}
          </div>

          {/* Procedure type */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>Procedure type *</div>
            <select
              value={procedureCategory}
              onChange={e => setProcedureCategory(e.target.value)}
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#1B4FD8')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              <option value="">Select procedure...</option>
              {Object.entries(groups).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>Urgency</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['routine', 'urgent', 'emergent'] as const).map(u => {
                const colors = { routine: '#475569', urgent: '#D97706', emergent: '#EF5350' }
                return (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    title={u === 'routine' ? 'Up to 15 business days' : u === 'urgent' ? '72-hour turnaround' : '24-hour turnaround'}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '6px',
                      border: `1px solid ${urgency === u ? colors[u] : '#E2E8F0'}`,
                      background: urgency === u ? `${colors[u]}18` : 'transparent',
                      color: urgency === u ? colors[u] : '#64748B',
                      fontFamily: ff,
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {u}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Service date */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Requested service date</div>
            <input
              type="date"
              value={serviceDate}
              onChange={e => setServiceDate(e.target.value)}
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none', colorScheme: 'light' }}
            />
            <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>Leave blank if date not yet scheduled</div>
          </div>

          {divider()}

          {/* Rendering provider — collapsible */}
          <button
            onClick={() => setRenderingExpanded(v => !v)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', width: '100%', textAlign: 'left' }}
          >
            <span style={{ fontFamily: ff, fontSize: '11px', color: '#64748B' }}>Where will this be performed? (optional)</span>
            <span style={{ color: '#94A3B8', fontSize: '10px' }}>{renderingExpanded ? '▲' : '▼'}</span>
          </button>
          {renderingExpanded && (
            <>
              {fieldInput(renderingFacility, setRenderingFacility, 'Rush University Medical Center')}
              {fieldInput(renderingProvider, setRenderingProvider, 'Rendering provider name')}
              <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', marginTop: '-8px', marginBottom: '8px' }}>Only needed if different from your practice</div>
            </>
          )}

          {/* ── DRUG PA FIELDS ── */}
          {isDrugPA && (
            <>
              {divider()}
              <button
                onClick={() => setDrugSectionExpanded(v => !v)}
                style={{ background: 'none', border: 'none', padding: '0 0 10px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', textAlign: 'left' }}
              >
                <span style={{ fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Drug information *</span>
                <span style={{ color: '#94A3B8', fontSize: '10px', marginLeft: 'auto' }}>{drugSectionExpanded ? '▲' : '▼'}</span>
              </button>
              {drugSectionExpanded && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div>
                      {sLabel('Brand name')}
                      {fieldInput(drugBrandName, setDrugBrandName, 'e.g. Humira')}
                    </div>
                    <div>
                      {sLabel('Generic name *')}
                      {fieldInput(drugGenericName, setDrugGenericName, 'e.g. adalimumab')}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div>
                      {sLabel('Dosage / strength')}
                      {fieldInput(drugDosage, setDrugDosage, 'e.g. 40mg/0.8mL')}
                    </div>
                    <div>
                      {sLabel('NDC code')}
                      {fieldInput(drugNdc, setDrugNdc, '00074-3799-02')}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div>
                      {sLabel('Quantity')}
                      {fieldInput(drugQuantity, setDrugQuantity, '2', 'number')}
                    </div>
                    <div>
                      {sLabel('Days supply')}
                      {fieldInput(drugDaysSupply, setDrugDaysSupply, '28', 'number')}
                    </div>
                    <div>
                      {sLabel('Refills')}
                      {fieldInput(drugRefills, setDrugRefills, '0', 'number')}
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    {sLabel('Route of administration')}
                    <select
                      value={drugRoute}
                      onChange={e => setDrugRoute(e.target.value)}
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
                    >
                      {['Oral', 'Subcutaneous injection', 'IV infusion', 'Intramuscular', 'Topical', 'Inhalation', 'Ophthalmic', 'Other'].map(r => (
                        <option key={r} value={r.toLowerCase()}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    {sLabel('Exception basis')}
                    <select
                      value={drugExceptionBasis}
                      onChange={e => setDrugExceptionBasis(e.target.value as DrugPAInfo['exception_basis'])}
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
                    >
                      <option value="step_therapy_failure">Step therapy failure</option>
                      <option value="medical_necessity">Medical necessity</option>
                      <option value="contraindication">Contraindication to alternatives</option>
                      <option value="no_alternative">No therapeutic alternative</option>
                    </select>
                  </div>
                </>
              )}

              {divider()}
              <button
                onClick={() => setStepTherapyExpanded(v => !v)}
                style={{ background: 'none', border: 'none', padding: '0 0 10px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', textAlign: 'left' }}
              >
                <span style={{ fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step therapy history</span>
                <span style={{ background: 'rgba(27,79,216,0.1)', color: '#1D4ED8', fontSize: '10px', fontFamily: ff, padding: '1px 6px', borderRadius: '99px', marginLeft: '6px' }}>{stepTherapy.filter(s => s.drug_name.trim()).length} drugs</span>
                <span style={{ color: '#94A3B8', fontSize: '10px', marginLeft: 'auto' }}>{stepTherapyExpanded ? '▲' : '▼'}</span>
              </button>
              {stepTherapyExpanded && (
                <div>
                  <div style={{ fontFamily: ff, fontSize: '10px', color: '#64748B', marginBottom: '10px' }}>
                    List all prior drugs tried — this is the most common reason drug PAs get denied.
                  </div>
                  {stepTherapy.map((entry, idx) => (
                    <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Drug {idx + 1}</span>
                        {stepTherapy.length > 1 && (
                          <button
                            onClick={() => setStepTherapy(prev => prev.filter((_, i) => i !== idx))}
                            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                          >✕</button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                        <input
                          value={entry.drug_name}
                          onChange={e => setStepTherapy(prev => prev.map((s, i) => i === idx ? { ...s, drug_name: e.target.value } : s))}
                          placeholder="Drug name"
                          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
                        />
                        <input
                          value={entry.dose}
                          onChange={e => setStepTherapy(prev => prev.map((s, i) => i === idx ? { ...s, dose: e.target.value } : s))}
                          placeholder="Dose (e.g. 15mg QD)"
                          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                        <input
                          type="date"
                          value={entry.start_date ?? ''}
                          onChange={e => setStepTherapy(prev => prev.map((s, i) => i === idx ? { ...s, start_date: e.target.value } : s))}
                          placeholder="Start date"
                          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: entry.start_date ? '#0F172A' : '#94A3B8', fontFamily: ff, outline: 'none', colorScheme: 'light' }}
                        />
                        <input
                          type="date"
                          value={entry.end_date ?? ''}
                          onChange={e => setStepTherapy(prev => prev.map((s, i) => i === idx ? { ...s, end_date: e.target.value } : s))}
                          placeholder="End date"
                          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: entry.end_date ? '#0F172A' : '#94A3B8', fontFamily: ff, outline: 'none', colorScheme: 'light' }}
                        />
                      </div>
                      <select
                        value={entry.outcome}
                        onChange={e => setStepTherapy(prev => prev.map((s, i) => i === idx ? { ...s, outcome: e.target.value as StepTherapyEntry['outcome'] } : s))}
                        style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none', marginBottom: '6px' }}
                      >
                        <option value="inadequate_response">Inadequate response</option>
                        <option value="adverse_effect">Adverse effect / intolerance</option>
                        <option value="contraindicated">Contraindicated</option>
                        <option value="not_covered">Not covered by plan</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        value={entry.reason_stopped ?? ''}
                        onChange={e => setStepTherapy(prev => prev.map((s, i) => i === idx ? { ...s, reason_stopped: e.target.value } : s))}
                        placeholder="Notes (optional)"
                        style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setStepTherapy(prev => [...prev, { drug_name: '', dose: '', outcome: 'inadequate_response', reason_stopped: '' }])}
                    style={{ width: '100%', background: 'rgba(27,79,216,0.06)', border: '1px dashed rgba(27,79,216,0.25)', borderRadius: '6px', padding: '8px', fontFamily: ff, fontSize: '11px', color: '#1D4ED8', cursor: 'pointer' }}
                  >
                    + Add another drug
                  </button>
                </div>
              )}

              {divider()}
              <button
                onClick={() => setRenderingExpanded(v => !v)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', width: '100%', textAlign: 'left' }}
              >
                <span style={{ fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Prescriber info *</span>
                <span style={{ color: '#94A3B8', fontSize: '10px', marginLeft: 'auto' }}>{renderingExpanded ? '▲' : '▼'}</span>
              </button>
              {renderingExpanded && (
                <>
                  {sLabel('Prescriber name')}
                  {fieldInput(prescriberName, setPrescriberName, 'Dr. Jane Smith, MD')}
                  {sLabel('Prescriber NPI *')}
                  {fieldInput(prescriberNpi, setPrescriberNpi, '1234567890')}
                  {sLabel('DEA number')}
                  {fieldInput(prescriberDea, setPrescriberDea, 'AS1234563')}
                  {sLabel('Prescriber phone')}
                  {fieldInput(prescriberPhone, setPrescriberPhone, '(312) 555-0100')}
                  {sLabel('Specialty')}
                  {fieldInput(prescriberSpecialty, setPrescriberSpecialty, 'Rheumatology')}
                </>
              )}
            </>
          )}
        </div>

        {/* ─── CENTER PANEL ─── */}
        <div style={{ flex: 1, background: '#F8FAFC', padding: '20px 24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #E2E8F0', marginBottom: '16px' }}>
            {(['type', 'upload'] as const).map(t => (
              <button
                key={t}
                onClick={() => setNoteTab(t)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: noteTab === t ? '2px solid #1B4FD8' : '2px solid transparent',
                  padding: '8px 16px',
                  fontFamily: ff,
                  fontSize: '13px',
                  fontWeight: noteTab === t ? 600 : 400,
                  color: noteTab === t ? '#0F172A' : '#64748B',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                }}
              >
                {t === 'type' ? '✏ Type or paste' : '⬆ Upload document'}
              </button>
            ))}
          </div>

          {/* TAB: type */}
          {noteTab === 'type' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={procedureCategory ? getNotePlaceholder(procedureCategory) : 'Paste the clinical note from your EHR, or type what you know about this patient\'s case. Include: diagnosis, symptoms, duration, treatments tried, and why this procedure is needed.'}
                style={{
                  flex: 1,
                  width: '100%',
                  minHeight: '240px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '14px',
                  color: '#0F172A',
                  fontFamily: 'monospace',
                  lineHeight: 1.7,
                  resize: 'none',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#1B4FD8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />

              {/* Smart checklist */}
              {procedureCategory && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {checklist.map(item => {
                      const checked = item.check(note)
                      return (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '99px', background: checked ? '#22c55e' : '#CBD5E1', flexShrink: 0 }} />
                          <span style={{ fontFamily: ff, fontSize: '11px', color: checked ? '#22c55e' : '#64748B' }}>{item.label}</span>
                        </div>
                      )
                    })}
                    {checkedCount === checklist.length && checklist.length > 0 && (
                      <span style={{ fontFamily: ff, fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>Ready to generate ✓</span>
                    )}
                  </div>
                  <div style={{ fontFamily: ff, fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>{note.trim().length} characters</div>
                </div>
              )}
            </div>
          )}

          {/* TAB: upload */}
          {noteTab === 'upload' && (
            <div style={{ flex: 1 }}>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? '#1B4FD8' : '#CBD5E1'}`,
                  background: dragging ? 'rgba(27,79,216,0.04)' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '12px' }}>⬆</div>
                <div style={{ fontFamily: ff, fontSize: '15px', color: '#0F172A', marginBottom: '4px' }}>Drop your clinical document here</div>
                <div style={{ fontFamily: ff, fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>or click to browse</div>
                <div style={{ fontFamily: ff, fontSize: '11px', color: '#94A3B8' }}>Supports: Photos, PDFs, scanned documents</div>
              </div>

              {extracting && (
                <div style={{ marginTop: '16px', fontFamily: ff, fontSize: '13px', color: '#1D4ED8' }}>Reading your document...</div>
              )}

              {extraction && !extracting && (
                <div style={{ marginTop: '16px', background: 'rgba(27,79,216,0.04)', border: '1px solid rgba(27,79,216,0.12)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontFamily: ff, fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Extracted from your document</div>
                    <div style={{
                      fontFamily: ff, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
                      background: extraction.extraction_confidence === 'high' ? 'rgba(34,197,94,0.15)' : extraction.extraction_confidence === 'medium' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
                      color: extraction.extraction_confidence === 'high' ? '#22c55e' : extraction.extraction_confidence === 'medium' ? '#fbbf24' : '#ef4444',
                    }}>
                      {extraction.extraction_confidence} confidence
                    </div>
                  </div>
                  {[
                    ['Patient', extraction.patient_name],
                    ['Date of visit', extraction.visit_date],
                    ['Diagnosis', extraction.diagnosis],
                    ['Symptoms', extraction.symptoms],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label as string} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontFamily: ff, fontSize: '11px', color: '#64748B', minWidth: '70px' }}>{label}</span>
                      <span style={{ fontFamily: ff, fontSize: '11px', color: '#0F172A' }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ fontFamily: ff, fontSize: '10px', color: '#64748B', marginTop: '8px', marginBottom: '4px' }}>Full text extracted (editable in Type tab)</div>
                  <div style={{ maxHeight: '80px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '10px', color: '#64748B', background: 'rgba(0,0,0,0.04)', borderRadius: '4px', padding: '6px' }}>
                    {extraction.raw_text}
                  </div>
                  <button
                    onClick={() => setNoteTab('type')}
                    style={{ marginTop: '10px', background: 'none', border: 'none', color: '#1D4ED8', fontFamily: ff, fontSize: '11px', cursor: 'pointer', padding: 0 }}
                  >
                    Edit extracted text →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Generate button — sticky bottom of center panel */}
          <div style={{ marginTop: '16px', flexShrink: 0 }}>
            {isAtQuota ? (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontFamily: ff, fontSize: '13px', color: '#EF5350', marginBottom: '10px' }}>You&apos;ve used all free prior auths</div>
                <a href="/dashboard/settings" style={{ background: '#1B4FD8', color: '#ffffff', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontFamily: ff, fontSize: '12px', fontWeight: 600 }}>
                  Upgrade to Pro →
                </a>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  style={{
                    width: '100%',
                    background: canGenerate ? '#1B4FD8' : '#E2E8F0',
                    color: canGenerate ? '#ffffff' : '#94A3B8',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: 600,
                    fontFamily: ff,
                    cursor: canGenerate ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                  }}
                >
                  {loadingPhase === 'generating' ? LOADING_MESSAGES[loadingMsgIdx] : 'Generate prior authorization →'}
                </button>
                {missingItems.length > 0 && loadingPhase === 'idle' && (
                  <div style={{ marginTop: '8px' }}>
                    {missingItems.map(item => (
                      <div key={item} style={{ fontFamily: ff, fontSize: '11px', color: '#D97706', marginBottom: '2px' }}>○ {item}</div>
                    ))}
                  </div>
                )}
                {loadingPhase === 'error' && (
                  <div style={{ marginTop: '8px', fontFamily: ff, fontSize: '12px', color: '#EF5350' }}>
                    {error}{' '}
                    <button onClick={() => setLoadingPhase('idle')} style={{ background: 'none', border: 'none', color: '#1D4ED8', cursor: 'pointer', fontFamily: ff, fontSize: '12px' }}>Try again</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="right-panel" style={{ width: '440px', flexShrink: 0, background: '#FFFFFF', borderLeft: '1px solid #E2E8F0', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Renewal banner */}
          {searchParams.get('renew') === '1' && (
            <div style={{ background: 'rgba(74,222,128,0.08)', borderBottom: '1px solid rgba(74,222,128,0.15)', padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>🔄</span>
              <div>
                <div style={{ fontFamily: ff, fontSize: '12px', fontWeight: 600, color: '#4ade80', marginBottom: '1px' }}>Renewal — patient info pre-filled</div>
                {searchParams.get('prev_auth') && (
                  <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B' }}>Previous auth: {searchParams.get('prev_auth')}</div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {loadingPhase === 'idle' && !result && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', opacity: 0.15, marginBottom: '16px' }}>📋</div>
              <div style={{ fontFamily: ff, fontSize: '14px', color: '#64748B', marginBottom: '6px' }}>Your complete PA form will appear here</div>
              <div style={{ fontFamily: ff, fontSize: '12px', color: '#94A3B8' }}>Fill in patient details and the clinical note to get started</div>
            </div>
          )}

          {/* Loading skeleton */}
          {loadingPhase === 'generating' && (
            <div style={{ padding: '20px' }}>
              {[100, 80, 90, 60, 75, 85, 65].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: '12px', background: '#E2E8F0', borderRadius: '3px', width: `${w}%`, marginBottom: '10px' }} />
              ))}
            </div>
          )}

          {/* Result */}
          {result && (loadingPhase === 'done' || loadingPhase === 'idle') && (
            <div className="pa-form-output" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Form header */}
              <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '0', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: ff, fontWeight: 700, fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Prior Authorization Request</div>
                  <div style={{ fontFamily: ff, fontSize: '16px', fontWeight: 600, color: '#1D4ED8' }}>{result.form.payer_name}</div>
                </div>
                <div style={{ fontFamily: ff, fontSize: '11px', color: '#94A3B8', textAlign: 'right' }}>
                  {new Date(result.form.generated_at).toLocaleDateString()}
                </div>
              </div>

              {/* Approval likelihood banner */}
              {(() => {
                const cfg = {
                  high: { icon: '✓', text: `High likelihood of approval — ${result.form.criteria_met} of ${result.form.criteria_total} criteria met`, bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)', color: '#16a34a' },
                  medium: { icon: '⚠', text: `Review recommended — ${result.form.criteria_met} of ${result.form.criteria_total} criteria met`, bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)', color: '#d97706' },
                  low: { icon: '✗', text: `Low likelihood — consider peer-to-peer review`, bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#dc2626' },
                }[result.form.approval_likelihood]
                return (
                  <div style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}`, padding: '10px 20px', fontFamily: ff, fontSize: '12px', fontWeight: 500, color: cfg.color }}>
                    {cfg.icon} {cfg.text}
                  </div>
                )
              })()}

              {/* Form body */}
              <div style={{ padding: '16px 20px', flex: 1 }}>

                {/* Patient info */}
                <FormSection label="Patient information">
                  <Grid2>
                    <FormField label="Patient name" value={result.form.patient_name} />
                    <FormField label="Date of birth" value={result.form.patient_dob} />
                    <FormField label="Member ID" value={result.form.patient_member_id} />
                    <FormField label="Group number" value={result.form.patient_group_number || '—'} />
                    <FormField label="Plan" value={result.form.payer_name} />
                    <FormField label="Service date" value={result.form.requested_service_date || 'TBD'} />
                  </Grid2>
                </FormSection>

                {/* Ordering provider — auto-filled */}
                <FormSection label="Ordering provider">
                  <Grid2>
                    <FormField label="Physician" value={`${result.form.physician_name}${result.form.physician_credentials ? `, ${result.form.physician_credentials}` : ''}`} />
                    <FormField label="NPI" value={result.form.physician_npi} />
                    <FormField label="Practice" value={result.form.practice_name} />
                    <FormField label="Address" value={`${result.form.practice_address}, ${result.form.practice_city}, ${result.form.practice_state} ${result.form.practice_zip}`} />
                    <FormField label="Phone" value={result.form.practice_phone} />
                    <FormField label="Fax" value={result.form.practice_fax || '—'} />
                  </Grid2>
                  <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🔒 Auto-filled from your practice settings</span>
                    <a href="/dashboard/settings" style={{ color: '#64748B', textDecoration: 'none' }}>Edit in Settings →</a>
                  </div>
                </FormSection>

                {/* Requested service */}
                <FormSection label="Requested service">
                  <FormField label="Diagnosis (ICD-10)" value={`${result.form.icd10_code} — ${result.form.icd10_description}`} />
                  <FormField label="Procedure (CPT)" value={`${result.form.cpt_code} — ${result.form.cpt_description}`} />
                  <Grid2>
                    <FormField label="Place of service" value={result.form.place_of_service} />
                    <FormField label="Urgency" value={result.form.urgency} />
                  </Grid2>
                </FormSection>

                {/* Clinical justification */}
                <FormSection label="Clinical justification">
                  <p style={{ fontFamily: ff, fontSize: '13px', color: '#334155', lineHeight: 1.75, margin: 0 }}>{result.form.clinical_justification}</p>
                  {result.form.policy_sections_cited.length > 0 && (
                    <div style={{ fontFamily: ff, fontSize: '10px', color: '#64748B', marginTop: '6px' }}>
                      Per {result.form.payer_name} policy: {result.form.policy_sections_cited.slice(0, 2).join(' · ')}
                    </div>
                  )}
                </FormSection>

                {/* Medical necessity */}
                <FormSection label="Medical necessity">
                  <p style={{ fontFamily: ff, fontSize: '13px', color: '#334155', lineHeight: 1.75, margin: 0 }}>{result.form.medical_necessity}</p>
                </FormSection>

                {/* Supporting evidence */}
                <FormSection label="Supporting evidence">
                  <div style={{ fontFamily: ff, fontSize: '13px', color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{result.form.supporting_evidence}</div>
                </FormSection>

                {/* Criteria met */}
                {result.form.criteria_details && result.form.criteria_details.length > 0 && (
                  <FormSection label="Criteria met">
                    {result.form.criteria_details.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                        <span style={{ color: c.met ? '#22c55e' : '#ef4444', fontSize: '12px', flexShrink: 0 }}>{c.met ? '✓' : '✗'}</span>
                        <div>
                          <div style={{ fontFamily: ff, fontSize: '12px', color: c.met ? '#334155' : '#94A3B8' }}>{c.criterion}</div>
                          {c.evidence && <div style={{ fontFamily: ff, fontSize: '10px', color: '#64748B' }}>{c.evidence}</div>}
                        </div>
                      </div>
                    ))}
                  </FormSection>
                )}

                {/* Policy references */}
                {result.form.policy_sections_cited.length > 0 && (
                  <FormSection label="Policy references">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.form.policy_sections_cited.map((s, i) => (
                        <span key={i} style={{ fontFamily: ff, fontSize: '10px', background: 'rgba(27,79,216,0.08)', color: '#1D4ED8', border: '1px solid rgba(27,79,216,0.15)', borderRadius: '4px', padding: '2px 8px' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </FormSection>
                )}

                {/* Missing info — if any */}
                {result.form.missing_information && result.form.missing_information.length > 0 && (
                  <FormSection label="Suggestions to strengthen">
                    {result.form.missing_information.map((item, i) => (
                      <div key={i} style={{ fontFamily: ff, fontSize: '12px', color: '#D97706', marginBottom: '4px' }}>• {item}</div>
                    ))}
                  </FormSection>
                )}
              </div>

              {/* Form footer */}
              <div style={{ background: '#F8FAFC', padding: '12px 20px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
                <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8' }}>
                  Generated by Authflow · Prior auths processed in-memory only · No PHI stored
                </div>
              </div>

              {/* Action bar */}
              <div className="action-bar" style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '14px 20px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: isSubmitted ? '12px' : '0' }}>
                  <ActionBtn onClick={handleCopyAll} icon="⎘" label="Copy all" />
                  <ActionBtn onClick={() => window.print()} icon="🖨" label="Print / Fax" />
                  {!isSubmitted ? (
                    <ActionBtn onClick={handleMarkSubmitted} icon="✓" label="Mark submitted" primary />
                  ) : (
                    <div style={{ fontFamily: ff, fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px' }}>
                      ✓ Submitted {result.pa.submitted_at ? new Date(result.pa.submitted_at).toLocaleDateString() : ''}
                    </div>
                  )}
                </div>

                {/* Auth number input — show after submitted */}
                {isSubmitted && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      value={authNumber}
                      onChange={e => setAuthNumber(e.target.value)}
                      placeholder="Authorization number (from payer)"
                      style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', color: '#0F172A', fontFamily: ff, outline: 'none' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#1B4FD8')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                    />
                    <button
                      onClick={handleSaveAuth}
                      disabled={savingAuth || !authNumber.trim()}
                      style={{ background: authSaved ? 'rgba(34,197,94,0.1)' : 'rgba(27,79,216,0.08)', border: '1px solid rgba(27,79,216,0.2)', borderRadius: '6px', padding: '8px 12px', fontFamily: ff, fontSize: '12px', color: authSaved ? '#22c55e' : '#1D4ED8', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      {authSaved ? '✓ Authorized' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showUpgrade && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '380px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontFamily: ff, fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Quota reached</div>
            <div style={{ fontFamily: ff, fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Upgrade to Pro for unlimited prior authorizations.</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowUpgrade(false)} style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 20px', color: '#475569', cursor: 'pointer', fontFamily: ff }}>Cancel</button>
              <a href="/dashboard/settings" style={{ background: '#1B4FD8', color: '#ffffff', textDecoration: 'none', borderRadius: '8px', padding: '10px 20px', fontFamily: ff, fontWeight: 600, fontSize: '14px' }}>Upgrade →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── small helper components ─────────────────────────────────────────────────

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pa-form-section" style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #EEF2F7' }}>
      <div className="pa-form-label" style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</div>
      {children}
    </div>
  )
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>{children}</div>
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: '#94A3B8', marginBottom: '2px' }}>{label}</div>
      <div className="pa-form-value" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#0F172A' }}>{value}</div>
    </div>
  )
}

function ActionBtn({ onClick, icon, label, primary }: { onClick: () => void; icon: string; label: string; primary?: boolean }) {
  const [active, setActive] = useState(false)
  return (
    <button
      onClick={() => { onClick(); if (!primary) { setActive(true); setTimeout(() => setActive(false), 2000) } }}
      style={{
        background: primary ? 'rgba(27,79,216,0.08)' : '#F8FAFC',
        border: primary ? '1px solid rgba(27,79,216,0.2)' : '1px solid #E2E8F0',
        borderRadius: '6px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        fontFamily: 'var(--font-inter)',
        fontSize: '12px',
        color: primary ? '#1D4ED8' : active ? '#22c55e' : '#334155',
        transition: 'color 0.2s',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
