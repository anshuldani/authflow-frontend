import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/dashboard/TopBar'
import GeneratedForm from '@/components/dashboard/GeneratedForm'
import Badge from '@/components/ui/Badge'
import type { PriorAuth, GeneratedForm as GeneratedFormType, CompletePAForm } from '@/lib/types'

const ff = 'var(--font-inter)'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PADetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: paData } = await supabase
    .from('prior_auths')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!paData) notFound()

  const pa = paData as PriorAuth
  const form = (pa.generated_form ?? pa.complete_pa_form) as GeneratedFormType | null
  const completePAForm = pa.complete_pa_form as CompletePAForm | null

  return (
    <div>
      <TopBar title="Prior Authorization" />
      <div style={{ padding: '24px 32px', maxWidth: '1100px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
          <Link href="/dashboard" style={{ fontFamily: ff, fontSize: '12px', color: '#4A5A7A', textDecoration: 'none' }}>Work Queue</Link>
          <span style={{ color: '#2D3A4A', fontSize: '12px' }}>›</span>
          <span style={{ fontFamily: ff, fontSize: '12px', color: '#6B7A9A' }}>
            {pa.patient_name ?? 'Unknown patient'}
          </span>
        </div>

        {/* Header */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '20px', color: '#0F172A', letterSpacing: '-0.5px' }}>
                  {pa.patient_name ?? 'Unknown patient'}
                </h1>
                <Badge variant={pa.status}>{pa.status}</Badge>
                {pa.urgency && pa.urgency !== 'routine' && (
                  <span style={{ background: pa.urgency === 'emergent' ? 'rgba(239,68,68,0.15)' : 'rgba(255,167,38,0.15)', color: pa.urgency === 'emergent' ? '#f87171' : '#FFA726', fontFamily: ff, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>
                    {pa.urgency}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {([
                  ['Payer', pa.payer],
                  ['Procedure', pa.procedure_name],
                  ['Member ID', pa.patient_member_id],
                  ['DOB', pa.patient_dob],
                  ['Created', new Date(pa.created_at).toLocaleDateString()],
                  pa.auth_number ? ['Auth #', pa.auth_number] : null,
                  pa.auth_valid_through ? ['Expires', new Date(pa.auth_valid_through).toLocaleDateString()] : null,
                ] as ([string, string | undefined] | null)[]).filter((x): x is [string, string] => !!x && !!x[1]).map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    <div style={{ fontFamily: ff, fontSize: '12px', color: '#475569' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/dashboard/new" style={{ background: '#1B4FD8', color: '#ffffff', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontFamily: ff, fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
              + New PA
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>

          {/* Left: generated form */}
          <div>
            {form ? (
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <GeneratedForm pa={pa} form={form} />
              </div>
            ) : (
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontFamily: ff, fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>
                  This PA was saved as a draft without a generated form.
                </div>
                <Link href={`/dashboard/new?patient_name=${encodeURIComponent(pa.patient_name ?? '')}&member_id=${encodeURIComponent(pa.patient_member_id ?? '')}&payer_id=${pa.payer_id}&patient_dob=${encodeURIComponent(pa.patient_dob ?? '')}`}
                  style={{ background: '#1B4FD8', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontFamily: ff, fontSize: '13px', fontWeight: 600, display: 'inline-block' }}>
                  Generate PA for this patient →
                </Link>
              </div>
            )}
          </div>

          {/* Right: complete form details */}
          {completePAForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Practice info */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Ordering Provider</div>
                {[
                  [completePAForm.physician_name, completePAForm.physician_credentials ? `, ${completePAForm.physician_credentials}` : ''].join(''),
                  `NPI: ${completePAForm.physician_npi}`,
                  completePAForm.practice_name,
                  `${completePAForm.practice_address}, ${completePAForm.practice_city}, ${completePAForm.practice_state} ${completePAForm.practice_zip}`,
                  `Ph: ${completePAForm.practice_phone}`,
                  completePAForm.practice_fax ? `Fax: ${completePAForm.practice_fax}` : '',
                ].filter(Boolean).map((line, i) => (
                  <div key={i} style={{ fontFamily: ff, fontSize: '12px', color: '#475569', marginBottom: '2px' }}>{line}</div>
                ))}
              </div>

              {/* Patient info */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Patient</div>
                {([
                  ['Name', completePAForm.patient_name],
                  ['DOB', completePAForm.patient_dob],
                  ['Member ID', completePAForm.patient_member_id],
                  ['Group #', completePAForm.patient_group_number],
                  completePAForm.patient_plan_name ? ['Plan', completePAForm.patient_plan_name] : null,
                ] as ([string, string | undefined] | null)[]).filter((x): x is [string, string] => !!x && !!x[1]).map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: ff, fontSize: '11px', color: '#94A3B8' }}>{label}</span>
                    <span style={{ fontFamily: ff, fontSize: '11px', color: '#475569' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Drug PA info */}
              {pa.drug_pa_info && (
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Drug Info</div>
                  {[
                    ['Brand', pa.drug_pa_info.brand_name],
                    ['Generic', pa.drug_pa_info.generic_name],
                    ['Dosage', pa.drug_pa_info.dosage_strength],
                    ['Quantity', String(pa.drug_pa_info.quantity_requested)],
                    ['Days supply', String(pa.drug_pa_info.days_supply)],
                    ['Prescriber NPI', pa.drug_pa_info.prescriber_npi],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: ff, fontSize: '11px', color: '#4A5A7A' }}>{label}</span>
                      <span style={{ fontFamily: ff, fontSize: '11px', color: '#9BA8C0' }}>{value}</span>
                    </div>
                  ))}
                  {pa.drug_pa_info.step_therapy.length > 0 && (
                    <div style={{ marginTop: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                      <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#4A5A7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Step therapy</div>
                      {pa.drug_pa_info.step_therapy.map((s, i) => (
                        <div key={i} style={{ fontFamily: ff, fontSize: '11px', color: '#475569', marginBottom: '3px' }}>
                          {i + 1}. {s.drug_name} {s.dose} — <span style={{ color: '#94A3B8' }}>{s.outcome.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submission status */}
              {(pa.submission_method || pa.payer_case_number || pa.follow_up_notes) && (
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Submission</div>
                  {([
                    pa.submission_method ? ['Method', pa.submission_method] : null,
                    pa.submission_confirmation ? ['Confirmation #', pa.submission_confirmation] : null,
                    pa.payer_case_number ? ['Case #', pa.payer_case_number] : null,
                    pa.follow_up_date ? ['Follow-up', pa.follow_up_date] : null,
                  ] as ([string, string] | null)[]).filter((x): x is [string, string] => !!x).map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: ff, fontSize: '11px', color: '#4A5A7A' }}>{label}</span>
                      <span style={{ fontFamily: ff, fontSize: '11px', color: '#9BA8C0' }}>{value}</span>
                    </div>
                  ))}
                  {pa.follow_up_notes && (
                    <div style={{ marginTop: '8px', fontFamily: ff, fontSize: '11px', color: '#475569', background: '#F8FAFC', borderRadius: '6px', padding: '8px' }}>
                      {pa.follow_up_notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
