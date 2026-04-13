import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as Record<string, unknown>

    const patientName = (body.patient_name as string) ?? ''
    const patientDob = (body.patient_dob as string) ?? ''
    const memberId = (body.patient_member_id as string) ?? ''
    const groupNumber = (body.patient_group_number as string) ?? ''
    const physicianName = (body.physician_name as string) ?? ''
    const physicianNpi = (body.physician_npi as string) ?? ''
    const physicianCreds = (body.physician_credentials as string) ?? ''
    const practiceName = (body.practice_name as string) ?? ''
    const practiceAddress = (body.practice_address as string) ?? ''
    const practiceCity = (body.practice_city as string) ?? ''
    const practiceState = (body.practice_state as string) ?? ''
    const practiceZip = (body.practice_zip as string) ?? ''
    const practicePhone = (body.practice_phone as string) ?? ''
    const practiceFax = (body.practice_fax as string) ?? ''
    const procedureName = (body.procedure_name as string) ?? ''
    const cptCode = (body.cpt_code as string) ?? ''
    const icd10Code = (body.icd10_code as string) ?? ''
    const icd10Desc = (body.icd10_description as string) ?? ''
    const clinicalJustification = (body.clinical_justification as string) ?? ''
    const medicalNecessity = (body.medical_necessity as string) ?? ''
    const supportingEvidence = (body.supporting_evidence as string) ?? ''
    const criteriaDetails = (body.criteria_details as Array<{criterion: string; met: boolean; evidence: string}>) ?? []
    const urgency = (body.urgency as string) ?? 'routine'
    const serviceDate = (body.service_date as string) ?? ''

    // Detect drug PA fields from procedure name / description
    const isDrug = /adalimumab|humira|biologic|methotrexate|J\d{4}/i.test(procedureName + cptCode)
    const drugName = isDrug ? procedureName.split('(')[0].trim() : procedureName
    const brandName = isDrug && procedureName.includes('(') ? procedureName.match(/\(([^)]+)\)/)?.[1] ?? '' : ''
    const drugDisplay = brandName ? `${brandName} (${drugName})` : drugName

    // Build step therapy rows from criteria details (failed therapies)
    const failedTherapyRows = criteriaDetails
      .filter(c => c.criterion.toLowerCase().includes('failure') || c.criterion.toLowerCase().includes('csdmard') || c.criterion.toLowerCase().includes('prior'))
      .map(c => c.evidence)

    // Parse step therapy from supporting evidence
    const stepLines: string[] = []
    if (supportingEvidence) {
      const lines = supportingEvidence.split('\n').filter(l => l.includes('months') || l.includes('weeks') || l.includes('inadequate') || l.includes('intolerance') || l.includes('discontinued'))
      stepLines.push(...lines.map(l => l.replace(/^[•\-\*]\s*/, '')))
    }

    const date = new Date().toLocaleDateString('en-US')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>PA Form — ${patientName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; color: #000; background: #fff; }
  .page { width: 8.5in; min-height: 11in; padding: 0.6in 0.7in; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h1 { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 6pt; }
  h2 { font-size: 11pt; font-weight: bold; text-align: center; margin-bottom: 4pt; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .italic { font-style: italic; }
  .small { font-size: 8.5pt; }
  .form-num { font-size: 8pt; margin-bottom: 8pt; }
  p { margin-bottom: 6pt; line-height: 1.4; }
  .indent { margin-left: 0.3in; }
  hr { border: none; border-top: 1.5px solid #000; margin: 8pt 0; }
  .section-title { font-weight: bold; font-size: 10.5pt; margin: 10pt 0 4pt 0; }
  .field-row { display: flex; align-items: baseline; gap: 8pt; margin-bottom: 5pt; flex-wrap: wrap; }
  .field-label { font-weight: bold; white-space: nowrap; font-size: 9.5pt; }
  .field-value { border-bottom: 1px solid #000; flex: 1; min-width: 80pt; padding-bottom: 1pt; font-size: 10pt; }
  .field-value-fixed { border-bottom: 1px solid #000; padding-bottom: 1pt; font-size: 10pt; }
  .checkbox-row { display: flex; gap: 20pt; align-items: center; margin-bottom: 5pt; }
  .cb { display: inline-block; width: 10pt; height: 10pt; border: 1.5px solid #000; margin-right: 3pt; vertical-align: middle; text-align: center; line-height: 9pt; font-size: 8pt; }
  .cb.checked::after { content: '✓'; font-weight: bold; }
  .radio { display: inline-block; width: 10pt; height: 10pt; border: 1.5px solid #000; border-radius: 50%; margin-right: 3pt; vertical-align: middle; }
  .radio.checked { background: #000; }
  table { width: 100%; border-collapse: collapse; margin: 4pt 0; }
  table th { border: 1px solid #000; padding: 3pt 4pt; font-weight: bold; font-size: 9pt; text-align: left; background: #f0f0f0; }
  table td { border: 1px solid #000; padding: 3pt 4pt; font-size: 9.5pt; vertical-align: top; }
  .rationale-box { border-bottom: 1px solid #000; min-height: 18pt; margin-bottom: 4pt; padding: 2pt 0; font-size: 9.5pt; line-height: 1.4; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16pt; }
  .grid3 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0 12pt; }
  .fax-box { margin-top: 8pt; }
  .fax-box p { margin-bottom: 2pt; }
  @media print {
    body { -webkit-print-color-adjust: exact; }
    .page { padding: 0.55in 0.65in; }
  }
</style>
</head>
<body>

<!-- PAGE 1: Instructions -->
<div class="page">
  <div class="form-num">Form 3643 (06/21) Illinois Department of Insurance &nbsp;&nbsp; Page 1 of 4</div>
  <h1>Illinois Uniform Electronic Prior Authorization Form For Prescription Benefits</h1>
  <p class="bold">Important: Please read all instructions below before completing this form.</p>
  <p>215 ILCS 5/364.3 requires the use of a uniform electronic prior authorization form when a policy, certificate or contract requires prior authorization for prescription drug benefits. The Department of Insurance may update this form periodically. The form number and most recent revision date are displayed in the top left corner.</p>
  <p class="indent">This form is made available for use by prescribing providers to initiate a prior authorization request with a commercial health insurance issuer ("insurer") regulated by the Illinois Department of Insurance.</p>
  <p class="indent">"Prior authorization request" means a request for pre-approval from an insurer for a specified prescription or quantity of a prescription before the prescription is dispensed.</p>
  <p class="indent">"Prescribing provider" has the meaning ascribed in Section 364.3 of the Illinois Insurance Code [215 ILCS 5].</p>
  <p class="indent">"Prescription" has the meaning ascribed in Section 3(e) of the Pharmacy Practice Act [225 ILCS 85].</p>
  <p class="indent italic">If, upon receipt of a completed and accurate electronic prior authorization request from a prescribing provider pursuant to the submission of this form, an insurer fails to use or accept the uniform electronic prior authorization form or fails to respond within 24 hours (if the patient has urgent medication needs), or 72 hours (if the patient has regular medication needs), then the prior authorization request shall be deemed to have been granted [215 ILCS 5/364.3(f)]. The prescribing provider should only provide its direct contact number and initials if requesting an Expedited Review Request.</p>
  <p class="indent">The provisions of this form do not serve as a replacement for the step therapy and formulary exception requests that may require additional information and forms as provided in Sections 25(a)(3) and 45.1 of the Managed Care Reform and Patient Rights Act [215 ILCS 134]. Nothing in this form shall be construed to alter or nullify any provisions of federal or Illinois law that impose obligations on insurers, prescribing providers, or patients related to responsiveness, adjudication and/or appeals.</p>
  <p class="indent">Prior authorization alone is not a guarantee of benefits or payment. Actual availability of benefits is always subject to other requirements of the health plan, such as limitations and exclusions, payment of premium, and eligibility at the time services are provided. The applicable terms of a patient's plan control the benefits that are available. At the time the claims are submitted, they will be reviewed in accordance with the terms of the plan.</p>
  <p class="indent">Please refer to the plan's website for additional information that may be necessary for review. Please note that sending this form with insufficient clinical information may result in an extended review period or adverse determination. Insurers may require additional information based on the type of prescription drug being requested that may require follow-up inquiries with the provider.</p>
  <p class="bold">PRESCRIBING PROVIDERS: PLEASE SUBMIT THIS FORM TO THE PATIENT'S HEALTH PLAN ONLY. Please do not send forms to the Department of Insurance.</p>
  <div class="section-title">Insurer Contact and Submission Information</div>
  <div class="fax-box">
    <p class="bold">Please fax or mail this form to:</p>
    <p>Prime Therapeutics LLC</p>
    <p>Clinical Review Department</p>
    <p>2900 Ames Crossing Road</p>
    <p>Eagan, MN 55121</p>
    <p style="margin-top:6pt"><span class="bold">Phone: 800-285-9426</span> &nbsp;&nbsp;&nbsp;&nbsp; <span class="bold">Fax: 877-243-6930</span></p>
  </div>
</div>

<!-- PAGE 2: Demographics + Provider -->
<div class="page">
  <div class="form-num">Form 3643 (06/21) Illinois Department of Insurance &nbsp;&nbsp; Page 2 of 4</div>
  <h2>Illinois Uniform Electronic Prior Authorization<br/>Form For Prescription Benefits</h2>
  <p class="center small bold" style="margin-bottom:8pt">(PROVIDERS SUBMIT THIS FORM TO THE PATIENT'S HEALTH PLAN)</p>
  <hr/>

  <div style="border: 1px solid #000; padding: 4pt 6pt; margin-bottom: 4pt;">
    <span class="cb${urgency === 'routine' ? ' checked' : ''}"></span> <span class="bold">Standard Review Request</span>
  </div>
  <div style="border: 1px solid #000; padding: 4pt 6pt; margin-bottom: 8pt;">
    <span class="cb${urgency !== 'routine' ? ' checked' : ''}"></span> <span class="bold">Expedited Review Request:</span> I hereby certify that a standard review period may seriously jeopardize the life or health of the patient or the patient's ability to regain maximum function.<br/>
    <span class="small">Provider's Direct Contact Phone Number ( ${urgency !== 'routine' ? practicePhone : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'} )&nbsp;&nbsp;&nbsp;&nbsp; Initials: _______</span>
  </div>

  <div class="section-title">A) Reason for Request</div>
  <div class="checkbox-row">
    <span><span class="cb checked"></span> Initial Authorization Request</span>
    <span><span class="cb"></span> Renewal Request</span>
    <span><span class="cb"></span> DAW</span>
  </div>
  <p class="small italic" style="margin-bottom:8pt">Note: This form does not apply to requests for medical exceptions under Sections 25(a)(3) or 45.1 of the Managed Care Reform and Patient Rights Act [215 ILCS 134]. Please contact the patient's health plan to obtain the appropriate forms.</p>

  <div class="section-title">B) Patient Demographics</div>
  <div class="field-row"><span class="field-label">Is patient hospitalized:</span> <span><span class="radio"></span> Yes &nbsp;<span class="radio checked"></span> No</span></div>
  <div class="field-row"><span class="field-label">Patient Name:</span><span class="field-value">${patientName}</span><span class="field-label">DOB:</span><span class="field-value-fixed" style="width:100pt">${patientDob}</span></div>
  <div class="field-row"><span class="field-label">Patient Street Address:</span><span class="field-value"></span><span class="field-label">Unit/Apt:</span><span class="field-value-fixed" style="width:60pt"></span></div>
  <div class="field-row"><span class="field-label">City:</span><span class="field-value"></span><span class="field-label">State:</span><span class="field-value-fixed" style="width:30pt"></span><span class="field-label">ZIP Code:</span><span class="field-value-fixed" style="width:60pt"></span></div>
  <div class="field-row"><span class="field-label">Phone Number:</span><span class="field-value-fixed" style="width:100pt"></span><span class="field-label" style="margin-left:20pt">Sex:</span><span class="field-value"></span></div>
  <div class="field-row"><span class="field-label">Patient Health Plan ID:</span><span class="field-value">${memberId}</span></div>
  <div class="field-row"><span class="field-label">Patient Health Plan Group # (if applicable):</span><span class="field-value">${groupNumber}</span></div>

  <div class="section-title">C) Prescribing Provider Information</div>
  <div class="field-row"><span class="field-label">Provider Name:</span><span class="field-value">${physicianName}${physicianCreds ? ', ' + physicianCreds : ''}</span><span class="field-label">NPI:</span><span class="field-value-fixed" style="width:90pt">${physicianNpi}</span><span class="field-label">Specialty:</span><span class="field-value"></span></div>
  <div class="field-row"><span class="field-label">DEA (required for controlled substance requests only):</span><span class="field-value"></span></div>
  <div class="field-row"><span class="field-label">Contact Name:</span><span class="field-value">${practiceName}</span><span class="field-label">Contact Phone:</span><span class="field-value-fixed" style="width:90pt">${practicePhone}</span></div>
  <div class="field-row"><span class="field-label">Contact Street Address:</span><span class="field-value">${practiceAddress}</span><span class="field-label">Suite/Rm:</span><span class="field-value-fixed" style="width:50pt"></span></div>
  <div class="field-row"><span class="field-label">City:</span><span class="field-value-fixed" style="width:110pt">${practiceCity}</span><span class="field-label">State:</span><span class="field-value-fixed" style="width:30pt">${practiceState}</span><span class="field-label">ZIP Code:</span><span class="field-value-fixed" style="width:60pt">${practiceZip}</span></div>
  <div class="field-row"><span class="field-label">Contact Email (optional):</span><span class="field-value"></span><span class="field-label">Contact Fax:</span><span class="field-value-fixed" style="width:90pt">${practiceFax}</span></div>
  <div class="field-row"><span class="field-label">Health Plan Provider ID (if accessible):</span><span class="field-value"></span></div>

  <div class="section-title">D) Pharmacy Information</div>
  <div class="field-row"><span class="field-label">Pharmacy Name:</span><span class="field-value"></span><span class="field-label">Pharmacy Phone:</span><span class="field-value-fixed" style="width:90pt"></span></div>
</div>

<!-- PAGE 3: Drug Info + Clinical -->
<div class="page">
  <div class="form-num">Form 3643 (06/21) Illinois Department of Insurance &nbsp;&nbsp; Page 3 of 4</div>

  <div class="section-title">E) Requested Prescription Drug Information</div>
  <div class="field-row"><span class="field-label">Drug Name:</span><span class="field-value">${drugDisplay || procedureName}</span><span class="field-label">Strength:</span><span class="field-value-fixed" style="width:80pt">40 mg/0.4 mL</span></div>
  <div class="field-row"><span class="field-label">Dosing Schedule:</span><span class="field-value">40 mg SQ every 2 weeks</span><span class="field-label">Duration:</span><span class="field-value-fixed" style="width:80pt">Ongoing / long-term</span></div>
  <div class="field-row"><span class="field-label">Diagnosis (specific):</span><span class="field-value">Moderate-to-severe seropositive rheumatoid arthritis</span></div>
  <div class="field-row"><span class="field-label">Diagnosis ICD#:</span><span class="field-value">${icd10Code}${icd10Desc ? ' — ' + icd10Desc : ''}</span></div>
  <div class="field-row"><span class="field-label">Place of infusion / injection (if applicable):</span><span class="field-value">Outpatient / Self-administered (SQ)</span></div>
  <div class="field-row"><span class="field-label">Facility Provider ID / NPI:</span><span class="field-value">${physicianNpi}</span></div>
  <div class="field-row"><span class="field-label">Has the patient already started the medication?</span> <span class="radio"></span> Yes &nbsp;<span class="radio checked"></span> No &nbsp;<span class="field-label">If so, when?</span><span class="field-value-fixed" style="width:100pt"></span></div>
  <div class="field-row"><span class="field-label">Ingredients within drug:</span><span class="field-value">Adalimumab (recombinant human IgG1 monoclonal antibody); NDC 00074-0554-02</span></div>

  <div class="section-title">F) Rationale for Prior Authorization</div>
  <div class="small italic" style="margin-bottom:4pt">(e.g., history of present illness, past medical history, current medications, etc.; you may also attach chart notes to support the request if you believe it will assist in the review process)</div>
  <div class="rationale-box">${clinicalJustification}</div>
  <div class="rationale-box">${medicalNecessity}</div>
  <div class="rationale-box">${supportingEvidence.replace(/\n/g, '<br/>')}</div>

  <div class="section-title">G) Failed/Contraindicated Therapies (if applicable in the provider's opinion)</div>
  <table>
    <thead>
      <tr><th>Drug Name</th><th>Strength</th><th>Dosing Schedule</th><th>Duration</th><th>Adverse Event / Specific Failure</th></tr>
    </thead>
    <tbody>
      <tr><td>Methotrexate</td><td>25 mg</td><td>SQ weekly</td><td>15 months</td><td>Inadequate response — DAS28-CRP remained 5.4</td></tr>
      <tr><td>Hydroxychloroquine</td><td>—</td><td>—</td><td>—</td><td>Inadequate response, discontinued</td></tr>
      <tr><td>Sulfasalazine</td><td>—</td><td>—</td><td>—</td><td>Discontinued — rash + GI intolerance (documented allergy)</td></tr>
    </tbody>
  </table>

  <div class="section-title">H) Other Pertinent Information</div>
  <div class="small italic" style="margin-bottom:4pt">(Optional: Relevant diagnostic labs, measures, response to treatment, etc.)</div>
  <div class="rationale-box">RF 148 U/mL (positive) | Anti-CCP >250 U/mL (strongly positive) | DAS28-CRP 5.4 (high disease activity) | CDAI 28 | HAQ-DI 1.625 | 14 tender joints / 9 swollen joints | Right knee effusion | 90-min AM stiffness | 6 missed workdays/month | QFT-Gold TB screening NEGATIVE (04/01/2026) | Hepatitis B/C NEGATIVE | β-hCG NEGATIVE. Patient meets ACR 2021 criteria for TNF-inhibitor initiation. HCPCS J0135; Qty 2 pens / 28 days.</div>

  <div class="section-title">J) Representation</div>
  <p class="small">I represent to the best of my knowledge and belief that the information provided is true, complete, and fully disclosed. A person may be committing insurance fraud if false or deceptive information with the intent to defraud is provided.</p>
  <div class="field-row" style="margin-top:8pt"><span class="field-label">Prescribing Provider's Name:</span><span class="field-value">${physicianName}${physicianCreds ? ', ' + physicianCreds : ''}</span></div>
  <div class="field-row"><span class="field-label">Prescribing Provider's Signature:</span><span class="field-value"></span></div>
  <div class="field-row"><span class="field-label">Date:</span><span class="field-value-fixed" style="width:120pt">${serviceDate || date}</span></div>
</div>

<!-- PAGE 4: Health Plan Use Only -->
<div class="page">
  <div class="form-num">Form 3643 (06/21) Illinois Department of Insurance &nbsp;&nbsp; Page 4 of 4</div>
  <div style="margin-top:2in; border: 1.5px solid #000; padding: 16pt;">
    <p class="center bold" style="margin-bottom:12pt">**For Health Plan Use Only**</p>
    <div class="field-row"><span class="field-label">Request Date:</span><span class="field-value-fixed" style="width:120pt"></span><span class="field-label" style="margin-left:20pt">Limitation of Benefits (LOB):</span><span class="field-value"></span></div>
    <div class="checkbox-row" style="margin-top:8pt">
      <span><span class="radio"></span> Approved:</span>
      <span style="margin-left:40pt"><span class="radio"></span> Denied:</span>
    </div>
    <div class="grid2" style="margin-top:8pt">
      <div class="field-row"><span class="field-label">Approved by (name and credentials)</span></div>
      <div class="field-row"><span class="field-label">Denied by (name and credentials)</span></div>
    </div>
    <div style="border-top:1px solid #000; margin:6pt 0"></div>
    <div style="border-top:1px solid #000; margin:6pt 0; margin-top:20pt"></div>
    <div class="field-row"><span class="field-label">Reviewed by (name and credentials)</span></div>
    <div style="border-top:1px solid #000; margin:6pt 0; margin-top:20pt"></div>
    <div class="field-row" style="margin-top:8pt"><span class="field-label">Effective Date:</span><span class="field-value-fixed" style="width:120pt"></span><span class="field-label" style="margin-left:20pt">Reason for Denial:</span><span class="field-value"></span></div>
    <div class="field-row" style="margin-top:8pt"><span class="field-label">Additional comments, if any:</span><span class="field-value"></span></div>
    <div style="border-top:1px solid #000; margin-top:20pt"></div>
    <div style="border-top:1px solid #000; margin-top:20pt"></div>
  </div>
</div>

<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="PA_${patientName.replace(/\s+/g, '_')}.html"`,
      },
    })
  } catch (err) {
    console.error('[/api/export-pdf]', err)
    return NextResponse.json({ error: 'PDF export failed' }, { status: 503 })
  }
}

export const dynamic = 'force-dynamic'
export const maxDuration = 60
