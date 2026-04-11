/**
 * Adapter between the Next.js frontend and Sanjana's FastAPI backend.
 *
 * The backend returns PAResponse with form_sections[] + flat top-level fields.
 * This adapter maps that to the GeneratedForm shape the frontend already uses
 * everywhere, so no other file needs to change.
 *
 * Falls back to parsing form_sections content if any flat field is missing
 * (handles older backend versions or partial responses).
 */

import type { GeneratedForm, PatientInfo } from './types'

const BACKEND_URL = process.env.AUTHFLOW_BACKEND_URL?.replace(/\/$/, '') ?? ''

export function isBackendAvailable(): boolean {
  return BACKEND_URL.length > 0
}

// ── Backend response shape (Sanjana's models.py) ─────────────────────────────

interface FormSection {
  label: string
  content: string
  policy_citation?: string | null
}

interface CriterionDetail {
  criterion: string
  met: boolean
  evidence: string
}

interface PABackendResponse {
  success: boolean
  payer_name: string
  procedure?: string | null
  form_sections: FormSection[]
  raw_justification: string
  confidence: string
  processing_time_ms?: number | null
  demo_mode: boolean
  // Flat GeneratedForm-compatible fields
  icd10_code?: string | null
  icd10_description?: string | null
  cpt_code?: string | null
  cpt_description?: string | null
  clinical_justification?: string | null
  medical_necessity?: string | null
  supporting_evidence?: string | null
  policy_sections_cited?: string[]
  criteria_met?: number | null
  criteria_total?: number | null
  criteria_details?: CriterionDetail[]
  approval_likelihood?: string | null
  approval_reasoning?: string | null
  missing_information?: string[]
}

// ── Section label → field mapping ────────────────────────────────────────────

function findSection(sections: FormSection[], ...keywords: string[]): FormSection | undefined {
  return sections.find(s =>
    keywords.some(k => s.label.toLowerCase().includes(k.toLowerCase()))
  )
}

/**
 * Parse icd10 code + description out of the "Patient Diagnosis" section content.
 * Content is freeform text like "M54.42 — Lumbago with sciatica, left side\n..."
 */
function parseIcd10(content: string): { code: string; description: string } {
  const match = content.match(/([A-Z]\d{2}\.?\w*)\s*[—\-–]\s*([^\n]+)/)
  if (match) return { code: match[1].trim(), description: match[2].trim() }
  return { code: '', description: content.split('\n')[0].trim() }
}

/**
 * Parse CPT code + description out of the "Requested Procedure" section content.
 */
function parseCpt(content: string): { code: string; description: string } {
  const match = content.match(/(\d{5})\s*[—\-–]?\s*([^\n]+)?/)
  if (match) return { code: match[1].trim(), description: (match[2] ?? '').trim() }
  return { code: '', description: content.split('\n')[0].trim() }
}

/**
 * Extract policy section citations from all form_sections.
 */
function extractCitations(sections: FormSection[]): string[] {
  return sections
    .filter(s => s.policy_citation)
    .map(s => s.policy_citation!)
    .filter(Boolean)
}

// ── Adapter ───────────────────────────────────────────────────────────────────

function adaptResponse(res: PABackendResponse): GeneratedForm {
  // Use flat top-level fields directly (backend returns these since latest version)
  // Fall back to parsing form_sections content if flat fields are absent (older backend)
  const diagnosisSection = findSection(res.form_sections, 'diagnosis', 'patient')
  const procedureSection = findSection(res.form_sections, 'procedure', 'requested service')
  const justificationSection = findSection(res.form_sections, 'justification')
  const necessitySection = findSection(res.form_sections, 'necessity')
  const evidenceSection = findSection(res.form_sections, 'evidence', 'supporting')

  const icd10Raw = parseIcd10(diagnosisSection?.content ?? '')
  const cptRaw = parseCpt(procedureSection?.content ?? '')

  const approval_likelihood =
    (res.approval_likelihood as 'high' | 'medium' | 'low') ??
    (res.confidence === 'high' ? 'high' : res.confidence === 'medium' ? 'medium' : 'low')

  return {
    icd10_code: res.icd10_code ?? icd10Raw.code,
    icd10_description: res.icd10_description ?? icd10Raw.description,
    cpt_code: res.cpt_code ?? cptRaw.code,
    cpt_description: res.cpt_description ?? cptRaw.description,
    clinical_justification: res.clinical_justification ?? justificationSection?.content ?? res.raw_justification ?? '',
    medical_necessity: res.medical_necessity ?? necessitySection?.content ?? '',
    supporting_evidence: res.supporting_evidence ?? evidenceSection?.content ?? '',
    policy_sections_cited: res.policy_sections_cited ?? extractCitations(res.form_sections),
    criteria_met: res.criteria_met ?? 0,
    criteria_total: res.criteria_total ?? 0,
    criteria_details: (res.criteria_details ?? []).map(c => ({
      criterion: c.criterion,
      met: c.met,
      evidence: c.evidence,
    })),
    approval_likelihood,
    approval_reasoning: res.approval_reasoning ?? res.raw_justification ?? '',
    missing_information: res.missing_information ?? [],
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generatePriorAuthViaBackend(
  clinicalNote: string,
  payerId: string,
  procedureName: string,
  procedureCategory: string,
  urgency: string,
  patientInfo: PatientInfo | undefined,
  accessToken: string | undefined
): Promise<GeneratedForm> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${BACKEND_URL}/generate-pa`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      clinical_note: clinicalNote,
      payer: payerId,
      procedure_type: procedureCategory.split('_')[0] || 'general',
      procedure_category: procedureCategory,
      patient_info: patientInfo
        ? {
            patient_name: patientInfo.patient_name,
            patient_dob: patientInfo.patient_dob,
            patient_member_id: patientInfo.patient_member_id,
            patient_group_number: patientInfo.patient_group_number,
            patient_plan_name: patientInfo.patient_plan_name,
            urgency,
            rendering_provider_name: patientInfo.rendering_provider_name,
            rendering_facility_name: patientInfo.rendering_facility_name,
          }
        : null,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Backend /generate-pa failed (${response.status}): ${err}`)
  }

  const data = (await response.json()) as PABackendResponse
  if (!data.success) {
    throw new Error('Backend returned success=false')
  }

  return adaptResponse(data)
}
