'use client'
import { useState } from 'react'
import TopBar from '@/components/dashboard/TopBar'

const ff = 'var(--font-inter)'

interface PayerInfo {
  id: string
  name: string
  shortName: string
  color: string
  pa_phone: string
  pa_phone_hours: string
  pa_fax: string
  portal_url: string
  portal_name: string
  turnaround_routine: string
  turnaround_urgent: string
  step_therapy_note: string
  common_denials: { code: string; reason: string; tip: string }[]
  drug_classes: { name: string; requirements: string }[]
  tips: string[]
}

const PAYER_DIRECTORY: PayerInfo[] = [
  {
    id: 'bcbs_il',
    name: 'Blue Cross Blue Shield Illinois',
    shortName: 'BCBS IL',
    color: '#1565C0',
    pa_phone: '1-800-972-8088',
    pa_phone_hours: 'Mon–Fri 8am–5pm CT',
    pa_fax: '1-800-368-7983',
    portal_url: 'https://www.bcbsil.com/provider/tools-and-resources/authorizations',
    portal_name: 'Availity — BCBS IL',
    turnaround_routine: '15 business days',
    turnaround_urgent: '72 hours',
    step_therapy_note: 'Requires trial and failure of 2+ conventional agents for biologics. TB test required before anti-TNF agents. Document via BCBS IL Provider Portal.',
    common_denials: [
      { code: 'CO-50', reason: 'Not medically necessary', tip: 'Cite BCBSIl MP-1.001 directly. Add "change in clinical management" language.' },
      { code: 'N-130', reason: 'Step therapy not completed', tip: 'Upload documentation of all prior drug trials with dates and outcomes.' },
      { code: 'OA-23', reason: 'Missing information', tip: 'Check fax confirmation — BCBS IL frequently loses faxed documentation.' },
    ],
    drug_classes: [
      { name: 'Anti-TNF biologics (Humira, Enbrel)', requirements: 'Trial/failure of methotrexate ≥3 months + DMARD ≥3 months. TB test, CBC, CMP required. Specialist (rheumatologist/dermatologist) must prescribe.' },
      { name: 'JAK inhibitors (Xeljanz, Rinvoq)', requirements: 'Failure of ≥1 biologic required. Boxed warning acknowledgment needed. Labs: CBC, LFTs, lipids.' },
      { name: 'Oncology (Keytruda, Opdivo)', requirements: 'Pathology report required. NCCN guideline citation mandatory. Oncologist prescriber only.' },
      { name: 'GLP-1 agonists (Ozempic, Wegovy)', requirements: 'BMI ≥30 (or ≥27 with comorbidity). Failure of 6+ months supervised diet program. Endocrinologist/PCP prescriber.' },
    ],
    tips: [
      'BCBS IL auto-approves ~60% of imaging PAs if criteria language matches their policy exactly — use "medically necessary" and cite the MP number.',
      'Peer-to-peer reviews must be requested within 30 days of denial. Call the Medical Director line, not the PA line.',
      'Cigna-managed PAs route through eviCore for imaging — use eviCore\'s portal, not BCBS IL directly.',
    ],
  },
  {
    id: 'aetna',
    name: 'Aetna',
    shortName: 'Aetna',
    color: '#7B1FA2',
    pa_phone: '1-800-624-0756',
    pa_phone_hours: 'Mon–Fri 8am–6pm ET',
    pa_fax: '1-860-273-8460',
    portal_url: 'https://www.aetna.com/health-care-professionals/clinical-policy-bulletins.html',
    portal_name: 'Availity — Aetna',
    turnaround_routine: '10 business days',
    turnaround_urgent: '72 hours',
    step_therapy_note: 'Aetna uses CPB (Clinical Policy Bulletins) numbers. Always cite the specific CPB. Auto-approves frequently when CPB criteria are clearly met.',
    common_denials: [
      { code: 'CO-50', reason: 'Not medically necessary', tip: 'Cite exact CPB number. Use "clinically necessary" and "expected to improve health outcomes" language.' },
      { code: 'CO-4', reason: 'Not covered service', tip: 'Verify CPB coverage first at aetna.com/cpb. Many biologics require specialty pharmacy routing.' },
      { code: 'N-130', reason: 'Step therapy not completed', tip: 'Document exact dates and outcomes. Aetna requires 84-day (12-week) trials for most step therapy.' },
    ],
    drug_classes: [
      { name: 'Biologics for RA/PsA', requirements: 'Failure of methotrexate ≥84 days. Aetna often requires csDMARD + methotrexate combo trial. Cite CPB 0204.' },
      { name: 'MS treatments (Ocrevus, Tysabri)', requirements: 'Diagnosis confirmed by MRI + neurologist. JC virus test for Tysabri. Cite CPB 0366.' },
      { name: 'PCSK9 inhibitors (Repatha, Praluent)', requirements: 'LDL >70 mg/dL despite max-tolerated statin ≥3 months. Cite CPB 0657. Statin intolerance requires documentation.' },
      { name: 'Humira biosimilars', requirements: 'Aetna preferring biosimilars (Hadlima, Hyrimoz) over reference Humira. Expect non-preferred denial if Humira requested without biosimilar failure.' },
    ],
    tips: [
      'Aetna has the fastest auto-approval rate of the major payers when CPB language is matched exactly.',
      'Specialty medications route through CVS Caremark — confirm pharmacy benefit vs medical benefit before submitting.',
      'Appeal window is 180 days from denial date. Aetna\'s standard for overturning: show any criteria missed or misapplied.',
    ],
  },
  {
    id: 'uhc',
    name: 'UnitedHealthcare',
    shortName: 'UHC',
    color: '#C62828',
    pa_phone: '1-866-889-8054',
    pa_phone_hours: 'Mon–Fri 7am–7pm CT',
    pa_fax: '1-866-889-8054',
    portal_url: 'https://www.unitedhealthcareonline.com',
    portal_name: 'UHC Provider Portal',
    turnaround_routine: '15 business days',
    turnaround_urgent: '72 hours',
    step_therapy_note: 'UHC uses Gold Carding — providers with high approval rates get expedited review. Most specialty drugs go through OptumRx for pharmacy benefit.',
    common_denials: [
      { code: 'CO-50', reason: 'Not medically necessary', tip: 'UHC cites "UnitedHealthcare Community Plan Medical Policy" — find and cite the specific policy ID on uhcprovider.com.' },
      { code: 'CO-197', reason: 'PA not obtained in advance', tip: 'UHC is strict on retro auth — always get PA before service. Retro window is 72 hours for urgent.' },
      { code: 'N-130', reason: 'Step therapy', tip: 'UHC Step Therapy Exception: patient safety, clinical indication, or prior failure on another plan are valid exceptions.' },
    ],
    drug_classes: [
      { name: 'Growth hormone (Norditropin, Genotropin)', requirements: 'IGF-1 level required, growth chart documentation, endocrinologist prescriber. UHC is strict — height/weight percentiles must be documented.' },
      { name: 'Anti-IL biologics (Dupixent, Skyrizi)', requirements: 'Topical treatment failure ≥12 weeks for dermatology. Respiratory indication requires spirometry. Cite UHC Medical Policy.' },
      { name: 'CAR-T therapy', requirements: 'Oncology tumor board review required. Treatment at UHC-designated facility preferred. Prior chemo regimen documentation mandatory.' },
      { name: 'Opioid MAT (Sublocade, Vivitrol)', requirements: 'Substance use disorder diagnosis + treatment program enrollment. UHC has specific MAT policy — cite it explicitly.' },
    ],
    tips: [
      'UHC has the most aggressive step therapy requirements. Assume 2+ conventional agents required for any biologic.',
      'Submit via UHC\'s online portal — fax submissions are 3× slower and frequently lost.',
      'Peer-to-peer must be requested within 60 days. Request directly from the denial letter\'s contact number.',
    ],
  },
  {
    id: 'cigna',
    name: 'Cigna',
    shortName: 'Cigna',
    color: '#00695C',
    pa_phone: '1-800-244-6224',
    pa_phone_hours: 'Mon–Fri 8am–8pm ET',
    pa_fax: '1-860-900-7995',
    portal_url: 'https://cignaforhcp.cigna.com',
    portal_name: 'CignaforHCP',
    turnaround_routine: '14 business days',
    turnaround_urgent: '72 hours',
    step_therapy_note: 'Cigna routes imaging PAs through eviCore — submit at evicore.com/cigna, not Cigna directly. Specialty drugs managed through Express Scripts/Evernorth.',
    common_denials: [
      { code: 'CO-50', reason: 'Not medically necessary', tip: 'Cigna uses "Coverage Policy" numbers. Find the exact policy at cigna.com/coveragepolicies and cite it.' },
      { code: 'CO-4', reason: 'Excluded service', tip: 'Check plan exclusions first — Cigna employer plans vary significantly. Call to confirm coverage before submitting.' },
      { code: 'OA-23', reason: 'Info not provided', tip: 'Cigna\'s eviCore platform requires documentation upload at submission — attach clinical notes at the same time, not separately.' },
    ],
    drug_classes: [
      { name: 'Oncology specialty drugs', requirements: 'Routes through eviCore Oncology. NCCN category 1 or 2A recommendation required. Pathology and staging mandatory.' },
      { name: 'MS biologics (Ocrevus, Kesimpta)', requirements: 'Cigna requires neurologist attestation + EDSS score documentation. MRI with T2 lesions required.' },
      { name: 'Humira / biosimilars', requirements: 'Cigna actively converting to biosimilars. Cite formulary preferred — adalimumab-adaz (Hyrimoz) preferred over Humira. Medical exception for Humira requires biosimilar failure.' },
      { name: 'Sleep (Xyrem, Lumryz)', requirements: 'PSG-confirmed diagnosis required. Sleep specialist must prescribe. REMS program enrollment required for Xyrem.' },
    ],
    tips: [
      'For imaging: always submit through eviCore, not Cigna directly — it will be rejected if sent to Cigna PA line.',
      'Cigna\'s appeal rate is the highest among major payers — ~35% of denials get overturned on first-level appeal.',
      'Gold carding available for Cigna after 90% approval rate — reduces PA burden significantly for qualifying providers.',
    ],
  },
  {
    id: 'humana',
    name: 'Humana',
    shortName: 'Humana',
    color: '#1565C0',
    pa_phone: '1-800-523-0023',
    pa_phone_hours: 'Mon–Fri 8am–8pm ET',
    pa_fax: '1-800-621-0073',
    portal_url: 'https://www.humana.com/provider/medical-resources/authorizations-referrals',
    portal_name: 'Availity — Humana',
    turnaround_routine: '14 business days',
    turnaround_urgent: '72 hours',
    step_therapy_note: 'Humana Medicare Advantage plans have additional CMS-mandated step therapy exception criteria. Commercial plans follow Humana CPT policy guidelines.',
    common_denials: [
      { code: 'CO-50', reason: 'Not medically necessary', tip: 'Humana uses Milliman/InterQual criteria. Use "clinically appropriate" and cite the Humana Coverage Determination Guideline (CDG).' },
      { code: 'N-130', reason: 'Step therapy', tip: 'Medicare Advantage step therapy exceptions: prior coverage, patient safety, clinical exception, or continuity of care are valid grounds.' },
      { code: 'CO-197', reason: 'No PA obtained', tip: 'Humana retro auth window is 14 days for non-emergency. Document urgency clearly if requesting retro.' },
    ],
    drug_classes: [
      { name: 'Diabetes (Ozempic, Mounjaro, Jardiance)', requirements: 'A1C ≥7.0 required. Prior metformin + lifestyle modification trial documented. Cardiologist/endocrinologist for SGLT2 inhibitors with cardiac indication.' },
      { name: 'Inflammatory (Skyrizi, Rinvoq)', requirements: 'Conventional DMARD failure ≥84 days. Humana requires TB screening + varicella immunity check. Labs: CBC, LFTs.' },
      { name: 'Respiratory (Dupixent, Nucala)', requirements: 'Uncontrolled asthma on high-dose ICS + LABA documented. Eosinophil count required for anti-IL-5. Pulmonologist or allergist prescriber.' },
      { name: 'Alzheimer\'s (Leqembi, Kisunla)', requirements: 'MRI without microhemorrhages required. APOE-ε4 genotype testing recommended. Neurologist prescriber. REMS enrollment mandatory.' },
    ],
    tips: [
      'Humana Medicare Advantage: CMS requires 72-hour urgent and 7-day standard turnaround — follow up aggressively after day 5.',
      'Availity portal is the fastest submission method — fax adds 2–3 business days.',
      'Humana peer-to-peer line: 1-877-320-6823, available Mon–Fri 9am–5pm ET. Request within 30 days of denial.',
    ],
  },
]

export default function PayersPage() {
  const [selectedPayer, setSelectedPayer] = useState<string>(PAYER_DIRECTORY[0].id)
  const [activeTab, setActiveTab] = useState<'contacts' | 'drugs' | 'denials' | 'tips'>('contacts')

  const payer = PAYER_DIRECTORY.find(p => p.id === selectedPayer)!

  return (
    <div>
      <TopBar title="Payer Directory" />
      <div style={{ padding: '24px 32px', maxWidth: '1100px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>

        {/* Payer selector sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {PAYER_DIRECTORY.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPayer(p.id)}
              style={{
                background: selectedPayer === p.id ? '#EBF2FF' : '#F8FAFC',
                border: `1px solid ${selectedPayer === p.id ? '#BFDBFE' : '#E2E8F0'}`,
                borderLeft: `3px solid ${selectedPayer === p.id ? p.color : 'transparent'}`,
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontFamily: ff, fontSize: '13px', fontWeight: 500, color: selectedPayer === p.id ? '#1D4ED8' : '#475569' }}>{p.shortName}</div>
              <div style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{p.pa_phone}</div>
            </button>
          ))}
        </div>

        {/* Main payer content */}
        <div>
          {/* Header */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: payer.color, flexShrink: 0 }} />
                  <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '22px', color: '#0F172A', letterSpacing: '-0.5px' }}>{payer.name}</h1>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <InfoChip label="Routine" value={payer.turnaround_routine} />
                  <InfoChip label="Urgent" value={payer.turnaround_urgent} />
                </div>
              </div>
              <a
                href={payer.portal_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#1B4FD8', color: '#ffffff', textDecoration: 'none', padding: '9px 16px', borderRadius: '8px', fontFamily: ff, fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                Open PA portal →
              </a>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '20px', gap: '0' }}>
            {([
              { key: 'contacts', label: 'Contacts & Submit' },
              { key: 'drugs', label: 'Drug Classes' },
              { key: 'denials', label: 'Common Denials' },
              { key: 'tips', label: 'Tips' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid #1B4FD8' : '2px solid transparent',
                  padding: '8px 16px', fontFamily: ff, fontSize: '13px',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  color: activeTab === tab.key ? '#1D4ED8' : '#64748B',
                  cursor: 'pointer', marginBottom: '-1px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Contacts */}
          {activeTab === 'contacts' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <ContactCard
                icon="📞"
                title="PA Phone"
                primary={payer.pa_phone}
                secondary={payer.pa_phone_hours}
                copyValue={payer.pa_phone}
              />
              <ContactCard
                icon="📠"
                title="PA Fax"
                primary={payer.pa_fax}
                secondary="PA submissions & documents"
                copyValue={payer.pa_fax}
              />
              <div style={{ gridColumn: '1 / -1', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 18px' }}>
                <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Online Portal</div>
                <div style={{ fontFamily: ff, fontSize: '14px', color: '#0F172A', marginBottom: '4px' }}>{payer.portal_name}</div>
                <a href={payer.portal_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: ff, fontSize: '12px', color: '#1D4ED8', textDecoration: 'none' }}>
                  {payer.portal_url} →
                </a>
              </div>
              <div style={{ gridColumn: '1 / -1', background: '#EBF2FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '16px 18px' }}>
                <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Step Therapy Note</div>
                <p style={{ fontFamily: ff, fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>{payer.step_therapy_note}</p>
              </div>
            </div>
          )}

          {/* Tab: Drug Classes */}
          {activeTab === 'drugs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {payer.drug_classes.map(dc => (
                <div key={dc.name} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '3px solid #1B4FD8', borderRadius: '8px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontFamily: ff, fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>{dc.name}</div>
                  <p style={{ fontFamily: ff, fontSize: '12px', color: '#475569', lineHeight: 1.65, margin: 0 }}>{dc.requirements}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Common Denials */}
          {activeTab === 'denials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {payer.common_denials.map(d => (
                <div key={d.code} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '3px solid #EF5350', borderRadius: '8px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ background: 'rgba(239,83,80,0.1)', color: '#DC2626', fontSize: '11px', fontFamily: ff, fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>{d.code}</span>
                    <span style={{ fontFamily: ff, fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{d.reason}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '12px', flexShrink: 0, marginTop: '1px' }}>💡</span>
                    <p style={{ fontFamily: ff, fontSize: '12px', color: '#475569', lineHeight: 1.65, margin: 0 }}>{d.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Tips */}
          {activeTab === 'tips' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {payer.tips.map((tip, i) => (
                <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '3px solid #16A34A', borderRadius: '8px', padding: '14px 16px', display: 'flex', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <span style={{ fontFamily: ff, fontSize: '11px', fontWeight: 700, color: '#16A34A', background: 'rgba(22,163,74,0.1)', padding: '2px 8px', borderRadius: '6px', height: 'fit-content', flexShrink: 0 }}>#{i + 1}</span>
                  <p style={{ fontFamily: ff, fontSize: '13px', color: '#334155', lineHeight: 1.65, margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <span style={{ fontFamily: ff, fontSize: '10px', color: '#94A3B8' }}>{label}:</span>
      <span style={{ fontFamily: ff, fontSize: '12px', fontWeight: 500, color: '#475569' }}>{value}</span>
    </div>
  )
}

function ContactCard({ icon, title, primary, secondary, copyValue }: {
  icon: string; title: string; primary: string; secondary: string; copyValue: string
}) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(copyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <div>
          <div style={{ fontFamily: ff, fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontFamily: ff, fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '2px' }}>{primary}</div>
          <div style={{ fontFamily: ff, fontSize: '11px', color: '#64748B' }}>{secondary}</div>
        </div>
      </div>
      <button
        onClick={handleCopy}
        style={{ background: copied ? 'rgba(22,163,74,0.08)' : '#F8FAFC', border: `1px solid ${copied ? 'rgba(22,163,74,0.2)' : '#E2E8F0'}`, borderRadius: '6px', padding: '6px 12px', fontFamily: ff, fontSize: '11px', color: copied ? '#16A34A' : '#64748B', cursor: 'pointer' }}
      >
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </div>
  )
}
