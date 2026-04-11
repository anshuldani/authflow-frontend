export const PAYER_POLICIES: Record<string, Record<string, string>> = {
  bcbs_il: {
    imaging_mri: `Blue Cross IL Clinical Policy for MRI Authorization:
Required criteria (ALL must be met):
1. Clinical indication: specific diagnosis requiring MRI for evaluation
2. Conservative treatment: minimum 4-6 weeks of conservative care documented (unless neurological deficit present)
3. Failed conservative treatment: documented failure of physical therapy and/or medications
4. Ordering provider: must be treating physician, not radiologist
5. Medical necessity: MRI must change clinical management
Key language: use "medically necessary" and "change in clinical management" and cite "BCBSIl MP-1.001"
Common denial reasons: insufficient conservative treatment duration, lack of neurological findings, prior imaging not reviewed`,

    imaging_ct: `Blue Cross IL Clinical Policy for CT Authorization:
Required criteria:
1. Specific clinical indication — CT preferred over MRI for bone pathology, vascular, acute trauma
2. Prior imaging reviewed if available
3. Clinical urgency or specific indication where CT is preferred modality
Key language: cite "BCBSIl MP-1.002" and note why CT is preferred modality over alternatives`,

    surgery_orthopedic: `Blue Cross IL Orthopedic Surgery Authorization:
Required criteria:
1. Conservative treatment failure: minimum 3 months for elective procedures
2. Documentation: physical therapy records, medication trials, injection history
3. Functional limitation: ADL impairment documented
4. Imaging: supporting imaging showing pathology
5. Surgical consultation: documented discussion of risks/benefits/alternatives
Key language: "failure of conservative management", "functional limitation", cite "BCBSIl MP-7.001"`,

    surgery_spinal: `Blue Cross IL Spinal Surgery Authorization:
Required criteria:
1. Conservative treatment failure: minimum 3-6 months
2. Imaging confirming surgical pathology (herniation, stenosis, instability)
3. Neurological deficit or myelopathy documented
4. Functional assessment documented
5. Neurosurgery or orthopedic spine consultation
Key language: "failure of conservative management", "progressive neurological deficit", cite "BCBSIl MP-7.002"`,

    drug_biologic: `Blue Cross IL Biologic/Specialty Drug Authorization:
Required criteria:
1. Diagnosis confirmed: specific ICD-10, appropriate diagnostic workup
2. Step therapy: trial and failure of 2+ conventional therapies (methotrexate for RA, etc.)
3. Prescriber: rheumatologist, dermatologist, or appropriate specialist
4. Baseline labs: required labs documented (TB test for anti-TNF, etc.)
5. Drug-specific criteria met (varies by medication)
Key language: "inadequate response to conventional therapy", cite specific BCBS drug policy`,

    therapy_physical: `Blue Cross IL Physical Therapy Authorization:
Required criteria:
1. Specific functional deficits documented
2. Measurable functional goals established
3. Skilled therapy required (not maintenance)
4. Expected improvement within reasonable timeframe
Key language: "skilled physical therapy", "functional improvement expected", cite "BCBSIl MP-8.001"`,
  },

  aetna: {
    imaging_mri: `Aetna Clinical Policy Bulletin for MRI (CPB 0510):
Required criteria:
1. Medical necessity established for specific body part
2. Conservative treatment documented (≥6 weeks for musculoskeletal)
3. Symptoms not responding to conservative care
4. MRI will change clinical management
Aetna-specific: uses CPB numbers — cite the specific CPB for the body region
Key language: "clinically necessary", "expected to improve health outcomes"
Aetna often auto-approves if criteria clearly met in submission`,

    imaging_ct: `Aetna Clinical Policy Bulletin for CT:
Required criteria:
1. Specific clinical indication documented
2. CT preferred modality documented with clinical rationale
3. Prior conservative treatment or appropriate indication
Key language: cite Aetna CPB 0157 or body-specific CPB, "clinically necessary"`,

    surgery_orthopedic: `Aetna Clinical Policy for Musculoskeletal Surgery:
Required criteria:
1. Conservative treatment failure: ≥3 months documented
2. Imaging confirming surgical indication
3. Functional assessment
4. BMI consideration for joint replacement
Key language: cite Aetna CPB numbers, "medically necessary surgery"`,

    surgery_spinal: `Aetna Spinal Surgery Policy (CPB 0230):
Required criteria:
1. Conservative treatment failure ≥3 months
2. MRI or CT confirming surgical indication
3. Neurological findings documented
4. Functional impairment documented
Key language: "failed conservative management", "neurological compromise", cite CPB 0230`,

    drug_biologic: `Aetna Step Therapy Requirements for Biologics:
Required criteria:
1. Conventional therapy trials: specific agents by condition (varies)
2. Duration of trials: minimum 3 months each
3. Specialist involvement required
4. Safety labs documented
Aetna-specific: CVS Caremark manages pharmacy benefits — separate auth may be needed`,

    therapy_physical: `Aetna Physical Therapy Policy (CPB 0325):
Required criteria:
1. Initial 12 visits typically without PA
2. Further visits: documentation of measurable functional progress
3. Skilled therapy necessity documented
4. Functional goals with expected timeline
Key language: cite CPB 0325, "functional improvement documented"`,
  },

  uhc: {
    imaging_mri: `UnitedHealthcare Imaging Prior Authorization (uses MCG criteria):
Required criteria:
1. Meets MCG imaging appropriateness criteria
2. Conservative treatment trial unless neurological emergency
3. Specific indication — UHC uses eviCore for complex imaging
Key note: UHC has a "Gold Card" program — practices meeting quality metrics get auto-approval
Key language: "meets MCG criteria", "clinically appropriate imaging"`,

    imaging_ct: `UnitedHealthcare CT Authorization:
Same MCG-based criteria as MRI with CT-specific indications
eviCore manages many CT requests — their portal is separate from UHC portal
Key language: "meets MCG criteria", specific CT indication documented`,

    surgery_orthopedic: `UHC Musculoskeletal Surgery Requirements:
Required criteria:
1. 3+ months conservative care
2. Physical therapy records
3. Imaging confirming diagnosis
4. Functional impairment documented (pain scale, functional assessment)
Key language: "meets UHC clinical criteria", "conservative treatment exhausted"`,

    surgery_spinal: `UHC Spinal Surgery Requirements:
Required criteria:
1. Conservative treatment ≥3 months
2. Advanced imaging confirming surgical pathology
3. Neurological exam findings documented
4. Functional limitation assessment
Key language: "meets UHC clinical criteria", "appropriate surgical candidate"`,

    drug_biologic: `UHC/Optum Specialty Drug Prior Authorization:
Managed through Optum Rx
Step therapy requirements vary by condition and drug class
Key: include REMS enrollment for applicable drugs
Prior step therapy at least 90 days with documented failure`,

    therapy_physical: `UHC Physical Therapy Authorization (CCP 01.01.32):
Required criteria:
1. Medically necessary — skilled therapy required
2. Functional goals documented
3. Progress notes from previous visits (for extensions)
Key language: cite CCP 01.01.32, "skilled PT medically necessary"`,
  },

  cigna: {
    imaging_mri: `Cigna/eviCore Imaging Authorization:
IMPORTANT: Cigna routes most imaging PA requests to eviCore, not Cigna directly.
eviCore uses their own proprietary criteria — submit at eviCore.com/providers
Required criteria:
1. Clinical indication with ICD-10
2. Relevant history and physical
3. Prior conservative treatment
4. Why imaging will change management
eviCore key language: "clinically indicated", "expected to impact treatment plan"`,

    imaging_ct: `Cigna/eviCore CT Authorization:
Routes through eviCore for most outpatient CT requests
Required: specific indication, clinical history, relevant physical findings
Key language: cite eviCore pathway, "clinically indicated advanced imaging"`,

    surgery_orthopedic: `Cigna Musculoskeletal Surgery Policy:
Required criteria:
1. Conservative treatment failure ≥3 months
2. Imaging supporting surgical diagnosis
3. Specialist consultation documented
4. Functional impairment documented
Key language: cite Cigna Coverage Policy, "medically necessary surgical intervention"`,

    drug_biologic: `Cigna Specialty Pharmacy PA:
Managed through Express Scripts (ESI) or Accredo
Condition-specific criteria apply
Step therapy required for most biologics
Key language: cite Cigna drug-specific coverage policy`,

    therapy_physical: `Cigna Physical Therapy Policy:
Required criteria:
1. Physician referral documented
2. Specific functional deficits
3. Goals-oriented treatment plan
4. Expected functional improvement
Key language: "physician-supervised skilled therapy", cite Cigna Coverage Policy 0326`,
  },

  humana: {
    imaging_mri: `Humana Prior Authorization for MRI:
Required criteria similar to other major payers
Medicare Advantage plans have CMS-aligned criteria
Key: specify Medicare vs commercial plan — criteria differ significantly
Medicare Advantage: must meet CMS coverage criteria AND Humana criteria
Key language: cite "HUM-0423", "clinically necessary advanced imaging"`,

    imaging_ct: `Humana CT Authorization:
Required criteria aligned with CMS for Medicare Advantage
Commercial: standard medical necessity documentation
Key language: cite "HUM-0424", "medically necessary diagnostic imaging"`,

    surgery_orthopedic: `Humana Orthopedic Surgery Policy:
Required criteria:
1. Conservative treatment failure ≥3 months
2. Imaging confirmation
3. Functional limitation documented
4. Medicare Advantage: must meet LCD criteria
Key language: cite "HUM-0271", "conservative treatment exhausted"`,

    drug_biologic: `Humana Specialty Drug Authorization:
Managed through Humana Pharmacy or specialty pharmacy
Strong Medicare Advantage focus — CMS step therapy rules apply
Required: diagnosis, prior therapy, prescriber specialty
Key language: cite "HUM-0589", "inadequate response to prior therapy"`,

    therapy_physical: `Humana Physical Therapy Policy:
Required criteria:
1. Physician referral
2. Functional deficit documentation
3. Skilled therapy necessity
4. Medicare Advantage: CMS criteria apply
Key language: cite "HUM-0312", "skilled physical therapy medically necessary"`,
  },
}

export function getPolicyForRequest(payerId: string, procedureCategory: string): string {
  const payerPolicies = PAYER_POLICIES[payerId]
  if (!payerPolicies) {
    return 'Standard prior authorization criteria apply. Document medical necessity, diagnosis, and relevant clinical history.'
  }

  // Try exact match first
  if (payerPolicies[procedureCategory]) return payerPolicies[procedureCategory]

  // Try category prefix match (e.g. 'imaging_ct' falls back to 'imaging_mri' template)
  const category = procedureCategory.split('_')[0]
  const fallback = Object.keys(payerPolicies).find(k => k.startsWith(category))
  if (fallback) return payerPolicies[fallback]

  return `Standard ${payerId} prior authorization criteria: document diagnosis, medical necessity, conservative treatment history, and clinical indication.`
}
