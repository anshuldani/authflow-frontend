'use client';

import { useEffect, useRef, useState } from 'react';
import { useIntersection } from '@/hooks/useIntersection';

const STEPS = [
  {
    num: 'Step 01',
    title: 'Paste your note.',
    desc: 'Copy the clinical note from your EHR or type it directly. Any format. Any specialty. No templates required.',
  },
  {
    num: 'Step 02',
    title: 'Pick the payer.',
    desc: "Select from Blue Cross, Aetna, UnitedHealthcare, Cigna, or Humana. We know their exact prior authorization criteria.",
  },
  {
    num: 'Step 03',
    title: 'Get the form.',
    desc: "Authflow reads the payer's policy, writes the justification in their language, and hands you a completed form in 30 seconds.",
  },
];

function useStepObserver(refs: React.RefObject<HTMLDivElement | null>[]): number {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i); },
        { threshold: 0.5 }
      );
      obs.observe(ref.current);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [refs]);

  return activeStep;
}

export default function HowItWorks() {
  const [sectionRef, isVisible] = useIntersection(0.05);
  const panel1Ref = useRef<HTMLDivElement | null>(null);
  const panel2Ref = useRef<HTMLDivElement | null>(null);
  const panel3Ref = useRef<HTMLDivElement | null>(null);
  const panelRefs = [panel1Ref, panel2Ref, panel3Ref];
  const activeStep = useStepObserver(panelRefs);

  return (
    <section ref={sectionRef} id="how-it-works" style={{ background: '#0B0F1A', padding: '120px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
        {/* Left sticky */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '11px', color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '32px' }}>
            How it works
          </div>
          {STEPS.map((step, i) => (
            <div key={i} style={{ padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: activeStep === i ? 1 : 0.28, transition: 'opacity 0.4s ease' }}>
              <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '11px', color: '#1B4FD8', marginBottom: '6px' }}>{step.num}</div>
              <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '28px', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '10px' }}>{step.title}</div>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#6B7A9A', lineHeight: 1.7 }}>{step.desc}</div>
            </div>
          ))}
        </div>

        {/* Right panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '48px' }}>
          <div ref={panel1Ref} className={`fade-right${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '0ms', background: '#141E2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '10px', color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Note input</div>
            {[100, 85, 72, 90, 60].map((w, i) => (
              <div key={i} style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', width: `${w}%`, marginBottom: '8px' }} />
            ))}
            <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
              {['Blue Cross IL', 'Aetna', 'UHC', 'Cigna'].map((payer, i) => (
                <span key={payer} style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: '99px', background: i === 0 ? '#1B4FD8' : 'transparent', border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.12)', color: i === 0 ? '#ffffff' : '#4A5A7A' }}>
                  {payer}
                </span>
              ))}
            </div>
          </div>

          <div ref={panel2Ref} className={`fade-right${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '200ms', background: '#141E2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '10px', color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Payer policy retrieved</div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#6B7A9A', fontStyle: 'italic', marginBottom: '8px' }}>Blue Cross IL Clinical Policy §4.2 — CT Myelogram</div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#4A5A7A', lineHeight: 1.6, marginBottom: '14px' }}>Criteria: conservative treatment ≥4 weeks, neurological deficit documented, prior imaging reviewed...</div>
            <div style={{ background: 'rgba(27,79,216,0.10)', border: '1px solid rgba(27,79,216,0.18)', borderRadius: '6px', padding: '8px 12px', fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#7BA3FF', fontWeight: 600 }}>
              3 of 3 criteria matched — approval likely
            </div>
          </div>

          <div ref={panel3Ref} className={`fade-right${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '400ms', background: '#141E2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '10px', color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Completed PA form</div>
            {[
              { label: 'ICD-10', value: 'M54.4 — Lumbago with sciatica, left side' },
              { label: 'Justification', value: '6 weeks conservative treatment without improvement. Neurological deficits confirmed. CT myelogram indicated per §4.2.3.' },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: '12px' }}>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: '#4A5A7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{row.label}</div>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#8899BB', lineHeight: 1.5 }}>{row.value}</div>
              </div>
            ))}
            <button style={{ width: '100%', background: '#1B4FD8', border: 'none', borderRadius: '6px', padding: '9px', fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 700, color: '#ffffff', cursor: 'pointer', marginTop: '8px' }}>
              Ready to submit →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
