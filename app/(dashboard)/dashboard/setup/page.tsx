'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SPECIALTIES } from '@/lib/types'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

const CREDENTIALS = ['MD', 'DO', 'NP (Nurse Practitioner)', 'PA (Physician Assistant)', 'DPT', 'Other']

const PAYER_OPTIONS = [
  { id: 'bcbs_il', name: 'Blue Cross IL', note: "Illinois's largest insurer" },
  { id: 'aetna', name: 'Aetna', note: 'CVS Health network' },
  { id: 'uhc', name: 'UnitedHealthcare', note: 'Largest US insurer' },
  { id: 'cigna', name: 'Cigna', note: 'Often routes to eviCore' },
  { id: 'humana', name: 'Humana', note: 'Strong Medicare Advantage' },
  { id: 'medicare', name: 'Medicare', note: 'CMS direct (coming soon)', disabled: true },
]

type Step = 1 | 2 | 3

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '11px 14px',
  fontSize: '14px',
  color: '#0F172A',
  fontFamily: 'var(--font-inter)',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: '12px',
  fontWeight: 600,
  color: '#64748B',
  display: 'block',
  marginBottom: '6px',
}

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Step 1
  const [practiceName, setPracticeName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [practiceType, setPracticeType] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('IL')
  const [zip, setZip] = useState('')
  const [phone, setPhone] = useState('')
  const [fax, setFax] = useState('')
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({})

  // Step 2
  const [physicianName, setPhysicianName] = useState('')
  const [credentials, setCredentials] = useState('')
  const [npi, setNpi] = useState('')
  const [taxId, setTaxId] = useState('')
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({})

  // Step 3
  const [selectedPayers, setSelectedPayers] = useState<string[]>(['bcbs_il', 'aetna', 'uhc', 'cigna', 'humana'])

  const validateStep1 = () => {
    const errors: Record<string, string> = {}
    if (!practiceName.trim()) errors.practiceName = 'Required'
    if (!specialty) errors.specialty = 'Required'
    if (!address.trim()) errors.address = 'Required'
    if (!city.trim()) errors.city = 'Required'
    if (!state) errors.state = 'Required'
    if (!zip.trim() || zip.replace(/\D/g, '').length < 5) errors.zip = 'Enter a valid ZIP'
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid 10-digit phone'
    setStep1Errors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors: Record<string, string> = {}
    if (!physicianName.trim()) errors.physicianName = 'Required'
    if (!credentials) errors.credentials = 'Required'
    if (!npi.trim() || npi.replace(/\D/g, '').length !== 10) errors.npi = 'NPI must be exactly 10 digits'
    setStep2Errors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext1 = () => {
    if (validateStep1()) setStep(2)
  }

  const handleNext2 = () => {
    if (validateStep2()) setStep(3)
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practice_name: practiceName,
          practice_type: practiceType || null,
          specialty,
          physician_name: physicianName,
          physician_npi: npi.replace(/\D/g, ''),
          physician_credentials: credentials,
          practice_address: address,
          practice_city: city,
          practice_state: state,
          practice_zip: zip,
          practice_phone: phone,
          practice_fax: fax || null,
          practice_tax_id: taxId || null,
          in_network_payers: selectedPayers,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard/new'), 1500)
      } else {
        setSaving(false)
        alert('Something went wrong. Please try again.')
      }
    } catch {
      setSaving(false)
      alert('Something went wrong. Please try again.')
    }
  }

  const togglePayer = (id: string) => {
    setSelectedPayers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#1B4FD8'
  }
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#E2E8F0'
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
            Practice set up.
          </div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#64748B' }}>
            Let&apos;s generate your first PA.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: '680px' }}>
        {/* Wordmark */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#1A56DB', marginBottom: '8px' }}>
          Authflow.
        </div>
        {/* Progress */}
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#64748B', marginBottom: '32px' }}>
          Step {step} of 3
        </div>

        {/* ───── STEP 1 ───── */}
        {step === 1 && (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#0F172A', letterSpacing: '-1px', marginBottom: '8px' }}>
              Let&apos;s set up your practice.
            </h1>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: '#475569', marginBottom: '36px' }}>
              We&apos;ll use this to automatically fill in your provider information on every prior authorization. You&apos;ll never need to enter it again.
            </p>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {/* Practice name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Practice name *</label>
                <input
                  value={practiceName}
                  onChange={e => setPracticeName(e.target.value)}
                  placeholder="Chicago Orthopedic Associates"
                  style={{ ...inputStyle, borderColor: step1Errors.practiceName ? '#EF5350' : '#E2E8F0' }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                {step1Errors.practiceName && <div style={{ fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{step1Errors.practiceName}</div>}
              </div>
              {/* Specialty + Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Specialty *</label>
                  <select
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    style={{ ...inputStyle, borderColor: step1Errors.specialty ? '#EF5350' : '#E2E8F0' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  >
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  {step1Errors.specialty && <div style={{ fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{step1Errors.specialty}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Practice type</label>
                  <select
                    value={practiceType}
                    onChange={e => setPracticeType(e.target.value)}
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  >
                    <option value="">Select type</option>
                    <option value="solo">Solo practice</option>
                    <option value="group">Group practice</option>
                    <option value="clinic">Clinic</option>
                    <option value="hospital_affiliated">Hospital-affiliated</option>
                  </select>
                </div>
              </div>
              {/* Address */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Practice address *</label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 N Michigan Ave"
                  style={{ ...inputStyle, borderColor: step1Errors.address ? '#EF5350' : '#E2E8F0' }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                {step1Errors.address && <div style={{ fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{step1Errors.address}</div>}
              </div>
              {/* City / State / ZIP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Chicago"
                    style={{ ...inputStyle, borderColor: step1Errors.city ? '#EF5350' : '#E2E8F0' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  {step1Errors.city && <div style={{ fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{step1Errors.city}</div>}
                </div>
                <div>
                  <label style={labelStyle}>State *</label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  >
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>ZIP *</label>
                  <input
                    value={zip}
                    onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="60601"
                    maxLength={10}
                    style={{ ...inputStyle, borderColor: step1Errors.zip ? '#EF5350' : '#E2E8F0' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  {step1Errors.zip && <div style={{ fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{step1Errors.zip}</div>}
                </div>
              </div>
              {/* Phone + Fax */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    placeholder="(312) 555-0100"
                    style={{ ...inputStyle, borderColor: step1Errors.phone ? '#EF5350' : '#E2E8F0' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  {step1Errors.phone && <div style={{ fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{step1Errors.phone}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Fax</label>
                  <input
                    value={fax}
                    onChange={e => setFax(formatPhone(e.target.value))}
                    placeholder="(312) 555-0101"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleNext1}
              style={{ width: '100%', background: '#1B4FD8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-inter)', cursor: 'pointer', marginTop: '24px' }}
            >
              Next: Your physician →
            </button>
          </>
        )}

        {/* ───── STEP 2 ───── */}
        {step === 2 && (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#0F172A', letterSpacing: '-1px', marginBottom: '8px' }}>
              About the ordering physician.
            </h1>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: '#475569', marginBottom: '36px' }}>
              This is the doctor whose name will appear on every prior authorization request.
            </p>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {/* Name + Credentials */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Physician full name *</label>
                  <input
                    value={physicianName}
                    onChange={e => setPhysicianName(e.target.value)}
                    placeholder="Dr. Sarah Chen"
                    style={{ ...inputStyle, borderColor: step2Errors.physicianName ? '#EF5350' : '#E2E8F0' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  {step2Errors.physicianName && <div style={{ fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{step2Errors.physicianName}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Credentials *</label>
                  <select
                    value={credentials}
                    onChange={e => setCredentials(e.target.value)}
                    style={{ ...inputStyle, borderColor: step2Errors.credentials ? '#EF5350' : '#E2E8F0' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  >
                    <option value="">Select credentials</option>
                    {CREDENTIALS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {step2Errors.credentials && <div style={{ fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{step2Errors.credentials}</div>}
                </div>
              </div>
              {/* NPI */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>NPI Number *</label>
                <input
                  value={npi}
                  onChange={e => setNpi(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="1234567890"
                  maxLength={10}
                  style={{ ...inputStyle, borderColor: step2Errors.npi ? '#EF5350' : '#E2E8F0' }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                {step2Errors.npi && <div style={{ fontSize: '11px', color: '#EF5350', marginTop: '4px' }}>{step2Errors.npi}</div>}
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#6B7A9A', marginTop: '6px' }}>
                  Your NPI is a 10-digit number assigned by CMS. Find yours at{' '}
                  <a href="https://npiregistry.cms.hhs.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#7BA3FF', textDecoration: 'none' }}>
                    npiregistry.cms.hhs.gov
                  </a>
                </div>
              </div>
              {/* Tax ID */}
              <div>
                <label style={labelStyle}>Federal Tax ID (EIN)</label>
                <input
                  value={taxId}
                  onChange={e => setTaxId(e.target.value)}
                  placeholder="XX-XXXXXXX"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#6B7A9A', marginTop: '6px' }}>
                  Optional — used for billing. Format: XX-XXXXXXX
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setStep(1)}
                style={{ flex: '0 0 auto', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 20px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                onClick={handleNext2}
                style={{ flex: 1, background: '#1B4FD8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}
              >
                Next: Your payers →
              </button>
            </div>
          </>
        )}

        {/* ───── STEP 3 ───── */}
        {step === 3 && (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#0F172A', letterSpacing: '-1px', marginBottom: '8px' }}>
              Select your payers.
            </h1>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: '#475569', marginBottom: '36px' }}>
              We&apos;ll prioritize these payers in your workflow. You can always change this in settings.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
              {PAYER_OPTIONS.map(payer => {
                const isSelected = selectedPayers.includes(payer.id)
                return (
                  <button
                    key={payer.id}
                    onClick={() => !payer.disabled && togglePayer(payer.id)}
                    disabled={payer.disabled}
                    style={{
                      background: payer.disabled ? '#F8FAFC' : isSelected ? '#EBF2FF' : '#FFFFFF',
                      border: `1px solid ${payer.disabled ? '#F1F5F9' : isSelected ? '#1B4FD8' : '#E2E8F0'}`,
                      borderRadius: '12px',
                      padding: '16px 20px',
                      cursor: payer.disabled ? 'default' : 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      opacity: payer.disabled ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {isSelected && !payer.disabled && (
                      <div style={{ position: 'absolute', top: '10px', right: '12px', color: '#1B4FD8', fontSize: '14px' }}>✓</div>
                    )}
                    <div style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                      {payer.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#64748B' }}>
                      {payer.note}
                    </div>
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(2)}
                style={{ flex: '0 0 auto', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 20px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                disabled={saving}
                style={{ flex: 1, background: saving ? 'rgba(27,79,216,0.5)' : '#1B4FD8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-inter)', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Setting up...' : 'Complete setup →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
