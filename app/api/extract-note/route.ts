import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractClinicalDocument } from '@/lib/gemini'
import type { ExtractedClinicalData } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const procedureType = (formData.get('procedure_type') as string) ?? 'general'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File too large. Maximum 10MB.' }, { status: 413 })
    }

    const mimeType = file.type || 'image/jpeg'
    const supported = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!supported.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload a PDF, JPEG, or PNG. (iPhone HEIC photos: open in Photos app → Share → Save as JPEG)' },
        { status: 415 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const rawResult = await extractClinicalDocument(base64, mimeType, procedureType, file.name)

    const result: ExtractedClinicalData = {
      patient_name: (rawResult.patient_name as string) ?? undefined,
      patient_dob: (rawResult.patient_dob as string) ?? undefined,
      diagnosis: (rawResult.diagnosis as string) ?? undefined,
      icd10_codes: (rawResult.icd10_codes as string[]) ?? [],
      procedure_requested: (rawResult.procedure_requested as string) ?? undefined,
      cpt_codes: (rawResult.cpt_codes as string[]) ?? [],
      symptoms: (rawResult.symptoms as string) ?? undefined,
      duration_of_symptoms: (rawResult.duration_of_symptoms as string) ?? undefined,
      treatments_tried: (rawResult.treatments_tried as string[]) ?? [],
      clinical_findings: (rawResult.clinical_findings as string) ?? undefined,
      ordering_provider: (rawResult.ordering_provider as string) ?? undefined,
      visit_date: (rawResult.visit_date as string) ?? undefined,
      raw_text: (rawResult.raw_text as string) ?? undefined,
      extraction_confidence: ((rawResult.extraction_confidence as string) ?? 'low') as 'high' | 'medium' | 'low',
      generic_drug_name: (rawResult.generic_drug_name as string) ?? undefined,
      prescriber_npi: (rawResult.prescriber_npi as string) ?? undefined,
    }

    return NextResponse.json({ success: true, extraction: result })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Extraction failed. Please type or paste the clinical note.' },
      { status: 503 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const maxDuration = 30
