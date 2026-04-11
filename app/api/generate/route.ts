import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePriorAuth } from '@/lib/gemini'
import { generatePriorAuthViaBackend, isBackendAvailable } from '@/lib/backend-client'
import { PAYERS } from '@/lib/types'
import type { GeneratedForm, PatientInfo, CompletePAForm, PracticeProfile, DrugPAInfo } from '@/lib/types'

interface GenerateRequestBody {
  clinicalNote?: string
  payerId?: string
  procedureName?: string
  procedureCategory?: string
  patientInfo?: PatientInfo
  urgency?: string
  drugPAInfo?: DrugPAInfo
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as GenerateRequestBody
    const { clinicalNote, payerId, procedureName, procedureCategory, patientInfo, urgency, drugPAInfo } = body

    if (!clinicalNote || clinicalNote.trim().length < 40) {
      return NextResponse.json({ success: false, error: 'Clinical note must be at least 40 characters' }, { status: 400 })
    }
    if (!payerId || !PAYERS.find(p => p.id === payerId)) {
      return NextResponse.json({ success: false, error: 'Invalid payer' }, { status: 400 })
    }
    if (!procedureName || procedureName.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Procedure name is required' }, { status: 400 })
    }

    // Check quota
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan, pa_count_this_month, pa_quota')
      .eq('id', user.id)
      .single()
    if (userError) throw userError

    if (
      userData.plan === 'free' &&
      userData.pa_quota !== null &&
      userData.pa_count_this_month >= userData.pa_quota
    ) {
      return NextResponse.json(
        { success: false, error: 'quota_exceeded', message: 'Upgrade to Pro for unlimited prior auths' },
        { status: 402 }
      )
    }

    // Fetch practice profile
    const { data: practiceData } = await supabase
      .from('practice_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const practice = practiceData as PracticeProfile | null

    const payer = PAYERS.find(p => p.id === payerId)!

    // Generate clinical fields — use FastAPI backend if configured, else Claude direct
    let generatedForm: GeneratedForm

    if (isBackendAvailable()) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        generatedForm = await generatePriorAuthViaBackend(
          clinicalNote, payerId, procedureName, procedureCategory ?? '',
          urgency ?? 'routine', patientInfo, session?.access_token
        )
      } catch (backendErr) {
        console.warn('[/api/generate] Backend unavailable, falling back to Claude direct:', backendErr)
        generatedForm = await generatePriorAuth(
          clinicalNote, payerId, procedureName, procedureCategory ?? '',
          urgency ?? 'routine', patientInfo, drugPAInfo
        )
      }
    } else {
      generatedForm = await generatePriorAuth(
        clinicalNote, payerId, procedureName, procedureCategory ?? '',
        urgency ?? 'routine', patientInfo, drugPAInfo
      )
    }

    // Build CompletePAForm combining all data sources
    const completePAForm: CompletePAForm = {
      // Practice info (auto-filled from DB — never asked again)
      practice_name: practice?.practice_name ?? '',
      physician_name: practice?.physician_name ?? '',
      physician_npi: practice?.physician_npi ?? '',
      physician_credentials: practice?.physician_credentials,
      practice_address: practice?.practice_address ?? '',
      practice_city: practice?.practice_city ?? '',
      practice_state: practice?.practice_state ?? '',
      practice_zip: practice?.practice_zip ?? '',
      practice_phone: practice?.practice_phone ?? '',
      practice_fax: practice?.practice_fax,

      // Patient info (from request body)
      patient_name: patientInfo?.patient_name ?? '',
      patient_dob: patientInfo?.patient_dob ?? '',
      patient_member_id: patientInfo?.patient_member_id ?? '',
      patient_group_number: patientInfo?.patient_group_number ?? '',
      patient_plan_name: patientInfo?.patient_plan_name,

      // Service details
      payer_name: payer.name,
      payer_id: payerId,
      procedure_name: procedureName,
      procedure_category: procedureCategory,
      requested_service_date: patientInfo?.requested_service_date,
      urgency: urgency ?? 'routine',
      place_of_service: 'outpatient',
      rendering_provider_name: patientInfo?.rendering_provider_name,
      rendering_facility_name: patientInfo?.rendering_facility_name,

      // AI-generated clinical content
      icd10_code: generatedForm.icd10_code,
      icd10_description: generatedForm.icd10_description,
      cpt_code: generatedForm.cpt_code,
      cpt_description: generatedForm.cpt_description,
      clinical_justification: generatedForm.clinical_justification,
      medical_necessity: generatedForm.medical_necessity,
      supporting_evidence: generatedForm.supporting_evidence,
      policy_sections_cited: generatedForm.policy_sections_cited,
      criteria_met: generatedForm.criteria_met,
      criteria_total: generatedForm.criteria_total,
      criteria_details: generatedForm.criteria_details,
      approval_likelihood: generatedForm.approval_likelihood,
      approval_reasoning: generatedForm.approval_reasoning,
      missing_information: generatedForm.missing_information,

      // Metadata
      generated_at: new Date().toISOString(),
    }

    // Store PA — never store raw clinical note
    // Build insert payload — only include columns confirmed to exist in the DB.
    // Extended columns (patient_name, urgency, complete_pa_form, etc.) are added by
    // migration 003_all_columns.sql. Until that migration is run, store everything
    // inside generated_form JSONB so the PA is still fully viewable.
    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      payer: payer.name,
      payer_id: payerId,
      procedure_name: procedureName,
      icd10_code: generatedForm.icd10_code,
      generated_form: { ...generatedForm, _complete: completePAForm },
      status: 'draft',
    }

    // Opportunistically add extended columns — Supabase will reject unknown columns
    // so we catch that error and retry with just the base columns.
    let pa: unknown = null
    let insertError: unknown = null

    const tryInsert = async (payload: Record<string, unknown>) => {
      const result = await supabase.from('prior_auths').insert(payload).select().single()
      return result
    }

    // First attempt: full payload (works once migrations are run)
    const fullPayload = {
      ...insertPayload,
      complete_pa_form: completePAForm,
      patient_name: patientInfo?.patient_name ?? null,
      patient_dob: patientInfo?.patient_dob ?? null,
      patient_member_id: patientInfo?.patient_member_id ?? null,
      patient_group_number: patientInfo?.patient_group_number ?? null,
      patient_plan_name: patientInfo?.patient_plan_name ?? null,
      urgency: urgency ?? 'routine',
    }

    let result = await tryInsert(fullPayload)
    if (result.error && (result.error.code === '42703' || result.error.message?.includes('does not exist'))) {
      // Migration not run yet — fall back to base columns only
      console.warn('[/api/generate] Extended columns missing, falling back to base insert. Run migrations/003_all_columns.sql in Supabase.')
      result = await tryInsert(insertPayload)
    }
    pa = result.data
    insertError = result.error

    if (insertError) throw insertError

    await supabase
      .from('users')
      .update({ pa_count_this_month: userData.pa_count_this_month + 1 })
      .eq('id', user.id)

    return NextResponse.json({ success: true, pa, completePAForm })
  } catch (err) {
    console.error('[/api/generate] error:', err)
    return NextResponse.json({ success: false, error: 'Generation failed. Please try again.' }, { status: 503 })
  }
}

// Re-export for convenience
export const dynamic = 'force-dynamic'
