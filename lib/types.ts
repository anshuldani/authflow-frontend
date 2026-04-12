export type Plan = 'free' | 'pro' | 'clinic'
export type PAStatus = 'draft' | 'submitted' | 'approved' | 'denied' | 'appealed'
export type AppealStatus = 'draft' | 'submitted' | 'overturned' | 'upheld'

export interface StepTherapyEntry {
  drug_name: string
  dose: string
  start_date?: string
  end_date?: string
  duration_weeks?: number
  outcome: 'inadequate_response' | 'adverse_effect' | 'contraindicated' | 'not_covered' | 'other'
  reason_stopped?: string
}

export interface DrugPAInfo {
  brand_name: string
  generic_name: string
  ndc_code?: string
  dosage_strength: string
  quantity_requested: number
  days_supply: number
  refills_requested: number
  route_of_administration: string
  prescriber_name: string
  prescriber_npi: string
  prescriber_dea?: string
  prescriber_phone?: string
  prescriber_specialty?: string
  exception_basis: 'step_therapy_failure' | 'medical_necessity' | 'contraindication' | 'no_alternative'
  quantity_override_justification?: string
  step_therapy: StepTherapyEntry[]
}

export interface PASubmission {
  submitted_at: string
  method: 'fax' | 'portal' | 'phone' | 'mail'
  confirmation_number?: string
}

export interface PAFollowUp {
  follow_up_date?: string
  payer_case_number?: string
  notes?: string
  peer_to_peer_requested?: boolean
  peer_to_peer_scheduled_at?: string
}

export interface PADenial {
  denial_code?: string
  denial_reason: string
  denial_date?: string
  appeal_deadline?: string
}

export const DENIAL_CODES = [
  { code: 'CO-50', label: 'CO-50 — Not medically necessary' },
  { code: 'CO-4', label: 'CO-4 — Service not covered' },
  { code: 'CO-197', label: 'CO-197 — PA required but not obtained' },
  { code: 'CO-96', label: 'CO-96 — Non-covered charge' },
  { code: 'N-130', label: 'N-130 — Step therapy not completed' },
  { code: 'N-522', label: 'N-522 — Duplicate claim' },
  { code: 'OA-23', label: 'OA-23 — Information requested not provided' },
  { code: 'PI-15', label: 'PI-15 — Claim not covered by this payer' },
  { code: 'PR-1', label: 'PR-1 — Deductible amount' },
  { code: 'CUSTOM', label: 'Other / Custom' },
]

export interface User {
  id: string
  email: string
  full_name?: string
  practice_name?: string
  plan: Plan
  pa_count_this_month: number
  pa_quota: number | null
  stripe_customer_id?: string
  stripe_subscription_id?: string
  practice_setup_completed?: boolean
  created_at: string
  updated_at?: string
}

export interface GeneratedForm {
  icd10_code: string
  icd10_description: string
  cpt_code: string
  cpt_description: string
  clinical_justification: string
  medical_necessity: string
  supporting_evidence: string
  policy_sections_cited: string[]
  criteria_met: number
  criteria_total: number
  criteria_details?: Array<{ criterion: string; met: boolean; evidence: string }>
  approval_likelihood: 'high' | 'medium' | 'low'
  approval_reasoning?: string
  missing_information?: string[]
}

export interface PriorAuth {
  id: string
  user_id: string
  payer: string
  payer_id: string
  procedure_name: string
  procedure_code?: string
  icd10_code?: string
  generated_form?: GeneratedForm
  complete_pa_form?: CompletePAForm
  extracted_clinical_data?: ExtractedClinicalData
  drug_pa_info?: DrugPAInfo
  status: PAStatus
  submitted_at?: string
  decision_at?: string
  notes?: string
  auth_number?: string
  auth_valid_from?: string
  auth_valid_through?: string
  patient_name?: string
  patient_dob?: string
  patient_member_id?: string
  patient_group_number?: string
  patient_plan_name?: string
  urgency?: string
  // Lifecycle tracking
  submission_method?: 'fax' | 'portal' | 'phone' | 'mail'
  submission_confirmation?: string
  payer_case_number?: string
  follow_up_date?: string
  follow_up_notes?: string
  peer_to_peer_requested?: boolean
  denial_code?: string
  created_at: string
  updated_at?: string
}

export interface Appeal {
  id: string
  user_id: string
  pa_id: string
  denial_reason: string
  generated_appeal: string
  status: AppealStatus
  submitted_at?: string
  decision_at?: string
  created_at: string
}

export interface Payer {
  id: string
  name: string
  shortName: string
  color: string
}

export const PAYERS: Payer[] = [
  { id: 'bcbs_il', name: 'Blue Cross Blue Shield Illinois', shortName: 'Blue Cross IL', color: '#003087' },
  { id: 'aetna', name: 'Aetna', shortName: 'Aetna', color: '#7B1FA2' },
  { id: 'uhc', name: 'UnitedHealthcare', shortName: 'UHC', color: '#D32F2F' },
  { id: 'cigna', name: 'Cigna', shortName: 'Cigna', color: '#00695C' },
  { id: 'humana', name: 'Humana', shortName: 'Humana', color: '#1565C0' },
]

export interface PracticeProfile {
  id: string
  user_id: string
  practice_name: string
  practice_type?: string
  specialty?: string
  physician_name: string
  physician_npi: string
  physician_credentials?: string
  practice_address: string
  practice_city: string
  practice_state: string
  practice_zip: string
  practice_phone: string
  practice_fax?: string
  practice_tax_id?: string
  in_network_payers: string[]
  setup_completed: boolean
  created_at: string
  updated_at?: string
}

export interface PatientInfo {
  patient_name: string
  patient_dob: string
  patient_member_id: string
  patient_group_number: string
  patient_plan_name?: string
  requested_service_date?: string
  urgency: 'routine' | 'urgent' | 'emergent'
  rendering_provider_name?: string
  rendering_facility_name?: string
}

export interface ExtractedClinicalData {
  patient_name?: string
  patient_dob?: string
  diagnosis?: string
  icd10_codes?: string[]
  procedure_requested?: string
  cpt_codes?: string[]
  symptoms?: string
  duration_of_symptoms?: string
  treatments_tried?: string[]
  clinical_findings?: string
  ordering_provider?: string
  visit_date?: string
  raw_text?: string
  extraction_confidence: 'high' | 'medium' | 'low'
  generic_drug_name?: string
  prescriber_npi?: string
}

export interface CompletePAForm {
  // Practice info (from practice_profiles)
  practice_name: string
  physician_name: string
  physician_npi: string
  physician_credentials?: string
  practice_address: string
  practice_city: string
  practice_state: string
  practice_zip: string
  practice_phone: string
  practice_fax?: string

  // Patient info (entered per PA)
  patient_name: string
  patient_dob: string
  patient_member_id: string
  patient_group_number: string
  patient_plan_name?: string

  // Service details
  payer_name: string
  payer_id: string
  procedure_name: string
  procedure_category?: string
  requested_service_date?: string
  urgency: string
  place_of_service: string
  rendering_provider_name?: string
  rendering_facility_name?: string

  // AI-generated clinical content
  icd10_code: string
  icd10_description: string
  cpt_code: string
  cpt_description: string
  clinical_justification: string
  medical_necessity: string
  supporting_evidence: string
  policy_sections_cited: string[]
  criteria_met: number
  criteria_total: number
  criteria_details?: Array<{ criterion: string; met: boolean; evidence: string }>
  approval_likelihood: 'high' | 'medium' | 'low'
  approval_reasoning?: string
  missing_information?: string[]

  // Metadata
  generated_at: string
  auth_number?: string
  auth_valid_through?: string
}

export const SPECIALTIES = [
  { value: 'primary_care', label: 'Primary Care / Family Medicine' },
  { value: 'internal_medicine', label: 'Internal Medicine' },
  { value: 'orthopedics', label: 'Orthopedics / Orthopedic Surgery' },
  { value: 'neurology', label: 'Neurology / Neurosurgery' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'oncology', label: 'Oncology / Hematology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'rheumatology', label: 'Rheumatology' },
  { value: 'pulmonology', label: 'Pulmonology' },
  { value: 'urology', label: 'Urology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'psychiatry', label: 'Psychiatry / Mental Health' },
  { value: 'physical_therapy', label: 'Physical / Occupational Therapy' },
  { value: 'pain_management', label: 'Pain Management' },
  { value: 'other', label: 'Other' },
]

export const PROCEDURE_CATEGORIES = [
  { value: 'imaging_mri', label: 'MRI', group: 'Imaging' },
  { value: 'imaging_ct', label: 'CT Scan', group: 'Imaging' },
  { value: 'imaging_pet', label: 'PET Scan', group: 'Imaging' },
  { value: 'imaging_xray', label: 'X-Ray / Fluoroscopy', group: 'Imaging' },
  { value: 'imaging_ultrasound', label: 'Ultrasound', group: 'Imaging' },
  { value: 'surgery_orthopedic', label: 'Orthopedic Surgery', group: 'Surgery' },
  { value: 'surgery_spinal', label: 'Spinal Surgery', group: 'Surgery' },
  { value: 'surgery_general', label: 'General Surgery', group: 'Surgery' },
  { value: 'surgery_cardiac', label: 'Cardiac / Vascular Surgery', group: 'Surgery' },
  { value: 'drug_biologic', label: 'Biologic / Specialty Drug (e.g. Humira, Keytruda)', group: 'Medication' },
  { value: 'drug_specialty', label: 'Specialty Medication (non-biologic)', group: 'Medication' },
  { value: 'therapy_physical', label: 'Physical Therapy', group: 'Therapy' },
  { value: 'therapy_occupational', label: 'Occupational Therapy', group: 'Therapy' },
  { value: 'therapy_speech', label: 'Speech Therapy', group: 'Therapy' },
  { value: 'procedure_injection', label: 'Injection / Nerve Block', group: 'Other Procedure' },
  { value: 'procedure_endoscopy', label: 'Endoscopy / Colonoscopy', group: 'Other Procedure' },
  { value: 'procedure_cardiac', label: 'Cardiac Procedure / Cath', group: 'Other Procedure' },
  { value: 'procedure_other', label: 'Other Procedure', group: 'Other Procedure' },
]

export const PLACES_OF_SERVICE = [
  { value: 'outpatient', label: 'Outpatient / Office (POS 11 or 22)' },
  { value: 'inpatient', label: 'Inpatient Hospital (POS 21)' },
  { value: 'ambulatory_surgery', label: 'Ambulatory Surgery Center (POS 24)' },
  { value: 'emergency', label: 'Emergency Room (POS 23)' },
  { value: 'home', label: 'Home (POS 12)' },
  { value: 'telehealth', label: 'Telehealth (POS 02)' },
]
