'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/dashboard/TopBar'
import { createClient } from '@/lib/supabase/client'
import { SPECIALTIES } from '@/lib/types'
import type { PracticeProfile } from '@/lib/types'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

interface UserData {
  email: string
  full_name: string | null
  practice_name: string | null
  plan: string
  pa_count_this_month: number
  pa_quota: number | null
}

const inputSt: React.CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-inter)',
  fontSize: '13px',
  color: '#0F172A',
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '10px 14px',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const labelSt: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: '6px',
}

export default function SettingsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [fullName, setFullName] = useState('')
  const [practiceName, setPracticeName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  // Practice profile
  const [practice, setPractice] = useState<Partial<PracticeProfile>>({})
  const [practiceLoaded, setPracticeLoaded] = useState(false)
  const [savingPractice, setSavingPractice] = useState(false)
  const [practiceSaved, setPracticeSaved] = useState(false)
  const [practiceError, setPracticeError] = useState('')

  const fetchUserData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/signin'); return }
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (data) {
      setUserData({ ...data, email: user.email ?? '' })
      setFullName(data.full_name ?? '')
      setPracticeName(data.practice_name ?? '')
    }
  }, [router])

  const fetchPractice = useCallback(async () => {
    const res = await fetch('/api/practice')
    const data = await res.json() as { success: boolean; practice: PracticeProfile | null }
    if (data.success && data.practice) {
      setPractice(data.practice)
    }
    setPracticeLoaded(true)
  }, [])

  useEffect(() => { fetchUserData(); fetchPractice() }, [fetchUserData, fetchPractice])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('users').update({ full_name: fullName || null, practice_name: practiceName || null }).eq('id', user.id)
    if (err) { setError('Failed to save changes.'); setSaving(false); return }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setUserData(prev => prev ? { ...prev, full_name: fullName || null, practice_name: practiceName || null } : prev)
  }

  const handleSavePractice = async () => {
    setSavingPractice(true)
    setPracticeError('')
    try {
      const res = await fetch('/api/practice', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(practice),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) { setPracticeError(data.error ?? 'Failed to save'); setSavingPractice(false); return }
      setSavingPractice(false)
      setPracticeSaved(true)
      setTimeout(() => setPracticeSaved(false), 2500)
    } catch {
      setPracticeError('Failed to save practice information.')
      setSavingPractice(false)
    }
  }

  const setPracticeField = (field: keyof PracticeProfile, value: string) => {
    setPractice(prev => ({ ...prev, [field]: value }))
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('appeals').delete().eq('user_id', user.id)
      await supabase.from('prior_auths').delete().eq('user_id', user.id)
      await supabase.from('practice_profiles').delete().eq('user_id', user.id)
      await supabase.from('users').delete().eq('id', user.id)
    }
    await supabase.auth.signOut()
    router.push('/')
  }

  const planBadgeColor = userData?.plan === 'pro' ? '#7BA3FF' : userData?.plan === 'clinic' ? '#66BB6A' : '#4A5A7A'

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#1B4FD8')
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = '#E2E8F0')

  return (
    <div>
      <TopBar title="Settings" showUpgrade={userData?.plan === 'free'} />
      <div style={{ padding: '32px', maxWidth: '680px' }}>

        {/* ─── Practice information ─── */}
        {practiceLoaded && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              Practice information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              <div>
                <label style={labelSt}>Practice name</label>
                <input value={practice.practice_name ?? ''} onChange={e => setPracticeField('practice_name', e.target.value)} placeholder="Chicago Orthopedic Associates" style={inputSt} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelSt}>Specialty</label>
                  <select value={practice.specialty ?? ''} onChange={e => setPracticeField('specialty', e.target.value)} style={inputSt} onFocus={focusInput} onBlur={blurInput}>
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Practice type</label>
                  <select value={practice.practice_type ?? ''} onChange={e => setPracticeField('practice_type', e.target.value)} style={inputSt} onFocus={focusInput} onBlur={blurInput}>
                    <option value="">Select type</option>
                    <option value="solo">Solo practice</option>
                    <option value="group">Group practice</option>
                    <option value="clinic">Clinic</option>
                    <option value="hospital_affiliated">Hospital-affiliated</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelSt}>Practice address</label>
                <input value={practice.practice_address ?? ''} onChange={e => setPracticeField('practice_address', e.target.value)} placeholder="123 N Michigan Ave" style={inputSt} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: '14px' }}>
                <div>
                  <label style={labelSt}>City</label>
                  <input value={practice.practice_city ?? ''} onChange={e => setPracticeField('practice_city', e.target.value)} placeholder="Chicago" style={inputSt} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div>
                  <label style={labelSt}>State</label>
                  <select value={practice.practice_state ?? 'IL'} onChange={e => setPracticeField('practice_state', e.target.value)} style={inputSt} onFocus={focusInput} onBlur={blurInput}>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>ZIP</label>
                  <input value={practice.practice_zip ?? ''} onChange={e => setPracticeField('practice_zip', e.target.value)} placeholder="60601" maxLength={10} style={inputSt} onFocus={focusInput} onBlur={blurInput} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelSt}>Phone</label>
                  <input value={practice.practice_phone ?? ''} onChange={e => setPracticeField('practice_phone', e.target.value)} placeholder="(312) 555-0100" style={inputSt} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div>
                  <label style={labelSt}>Fax</label>
                  <input value={practice.practice_fax ?? ''} onChange={e => setPracticeField('practice_fax', e.target.value)} placeholder="(312) 555-0101" style={inputSt} onFocus={focusInput} onBlur={blurInput} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelSt}>Physician name</label>
                  <input value={practice.physician_name ?? ''} onChange={e => setPracticeField('physician_name', e.target.value)} placeholder="Dr. Sarah Chen" style={inputSt} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div>
                  <label style={labelSt}>Credentials</label>
                  <select value={practice.physician_credentials ?? ''} onChange={e => setPracticeField('physician_credentials', e.target.value)} style={inputSt} onFocus={focusInput} onBlur={blurInput}>
                    <option value="">Select</option>
                    {['MD','DO','NP (Nurse Practitioner)','PA (Physician Assistant)','DPT','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelSt}>NPI Number</label>
                <input value={practice.physician_npi ?? ''} onChange={e => setPracticeField('physician_npi', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="1234567890" maxLength={10} style={inputSt} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={labelSt}>Federal Tax ID (EIN)</label>
                <input value={practice.practice_tax_id ?? ''} onChange={e => setPracticeField('practice_tax_id', e.target.value)} placeholder="XX-XXXXXXX" style={inputSt} onFocus={focusInput} onBlur={blurInput} />
              </div>
            </div>

            {practiceError && <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#EF5350', margin: '12px 0' }}>{practiceError}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <button
                onClick={handleSavePractice}
                disabled={savingPractice}
                style={{ background: savingPractice ? 'rgba(27,79,216,0.4)' : '#1B4FD8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: savingPractice ? 'not-allowed' : 'pointer' }}
              >
                {practiceSaved ? '✓ Saved' : savingPractice ? 'Saving...' : 'Save changes'}
              </button>
              {practice.updated_at && (
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#94A3B8' }}>
                  Last updated {new Date(practice.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <div style={{ marginTop: '12px' }}>
              <a href="/dashboard/setup" style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#4A5A7A', textDecoration: 'none' }}>
                Re-run setup wizard →
              </a>
            </div>
          </section>
        )}

        {/* Profile */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
            Profile
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelSt}>Email</label>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#64748B', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              {userData?.email ?? '—'}
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelSt}>Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Jane Smith" style={inputSt} onFocus={focusInput} onBlur={blurInput} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelSt}>Practice name (display)</label>
            <input value={practiceName} onChange={e => setPracticeName(e.target.value)} placeholder="Chicago Orthopedics" style={inputSt} onFocus={focusInput} onBlur={blurInput} />
          </div>
          {error && <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#EF5350', marginBottom: '12px' }}>{error}</div>}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: saving ? 'rgba(27,79,216,0.4)' : '#1B4FD8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save changes'}
          </button>
        </section>

        {/* Plan & billing */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
            Plan & billing
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#0F172A', fontWeight: 500 }}>Current plan</span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 700, color: planBadgeColor, textTransform: 'capitalize', background: `${planBadgeColor}18`, border: `1px solid ${planBadgeColor}40`, borderRadius: '99px', padding: '3px 10px' }}>
                {userData?.plan ?? 'free'}
              </span>
            </div>
            {userData?.plan === 'free' && (
              <>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                  {userData.pa_count_this_month} of {userData.pa_quota ?? 10} free prior auths used this month
                </div>
                <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ height: '100%', background: '#1B4FD8', borderRadius: '99px', width: `${Math.min(((userData.pa_count_this_month) / (userData.pa_quota ?? 10)) * 100, 100)}%`, transition: 'width 0.4s' }} />
                </div>
                <a href="/waitlist" style={{ display: 'inline-block', background: '#1B4FD8', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600 }}>
                  Join Pro waitlist →
                </a>
              </>
            )}
            {userData?.plan === 'pro' && (
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#4A5A7A' }}>Unlimited prior auths · All payers · Appeal generator</div>
            )}
            {userData?.plan === 'clinic' && (
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#4A5A7A' }}>Everything in Pro · Multi-provider · BAA included</div>
            )}
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: '#EF5350', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(198,40,40,0.2)' }}>
            Account
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              style={{ background: confirmDelete ? 'rgba(198,40,40,0.15)' : 'transparent', border: `1px solid ${confirmDelete ? 'rgba(198,40,40,0.4)' : 'rgba(198,40,40,0.2)'}`, borderRadius: '8px', padding: '10px 20px', fontSize: '13px', color: '#EF5350', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
            >
              {deleting ? 'Deleting...' : confirmDelete ? 'Click again to confirm deletion' : 'Delete account'}
            </button>
          </div>
          {confirmDelete && (
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#EF5350', marginTop: '8px' }}>
              This will permanently delete all your data. This cannot be undone.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Settings | AuthFlow',
}
