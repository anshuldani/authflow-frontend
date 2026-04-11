'use client';

import { useEffect, useRef, useState } from 'react';
import { useIntersection } from '@/hooks/useIntersection';

const CLINICAL_NOTE =
  'Patient: 52F, 6 weeks progressive lower back pain radiating to left leg. Failed NSAIDs and PT ×4 weeks. Decreased sensation L4-L5 dermatome. Assessment: lumbar radiculopathy, suspected herniated disc. Plan: CT myelogram lumbar spine.';

export default function Hero() {
  const [sectionRef, sectionVisible] = useIntersection(0.1);
  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sectionVisible) return;
    const cardTimer = setTimeout(() => setCardVisible(true), 400);
    const startTimer = setTimeout(() => {
      setTyping(true);
      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setTyped(CLINICAL_NOTE.slice(0, i));
        if (i >= CLINICAL_NOTE.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTyping(false);
          setTimeout(() => setFormVisible(true), 500);
        }
      }, 24);
    }, 1000);

    return () => {
      clearTimeout(cardTimer);
      clearTimeout(startTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sectionVisible]);

  // suppress unused variable warning
  void cardVisible;

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#0B0F1A',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(ellipse at center top, rgba(27,79,216,0.20) 0%, transparent 68%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          className={`fade-up${sectionVisible ? ' visible' : ''}`}
          style={{
            transitionDelay: '0ms',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(27,79,216,0.14)',
            border: '1px solid rgba(27,79,216,0.32)',
            borderRadius: '99px',
            padding: '6px 14px',
            marginBottom: '28px',
          }}
        >
          <span
            className="pulse-dot"
            style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1B4FD8', flexShrink: 0 }}
          />
          <a href="/waitlist" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 500, color: '#7BA3FF', textDecoration: 'none' }}>
            Now in beta — join the waitlist
          </a>
        </div>

        <h1
          className={`fade-up${sectionVisible ? ' visible' : ''}`}
          style={{
            transitionDelay: '100ms',
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontWeight: 800,
            fontSize: '72px',
            color: '#ffffff',
            letterSpacing: '-2.5px',
            lineHeight: 1.04,
            marginBottom: '24px',
            maxWidth: '720px',
          }}
        >
          Prior auth.<br />Done in 30 seconds.
        </h1>

        <p
          className={`fade-up${sectionVisible ? ' visible' : ''}`}
          style={{
            transitionDelay: '200ms',
            fontFamily: 'var(--font-inter)',
            fontWeight: 400,
            fontSize: '17px',
            color: '#5A6A8A',
            lineHeight: 1.6,
            maxWidth: '440px',
            marginBottom: '36px',
          }}
        >
          Stop spending 35 minutes per request on the phone with insurance. Paste a note. Pick a payer. Get a completed form.
        </p>

        <div
          className={`fade-up${sectionVisible ? ' visible' : ''}`}
          style={{ transitionDelay: '300ms', display: 'flex', gap: '12px', marginBottom: '56px' }}
        >
          <a
            href="/signup"
            style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 500,
              fontSize: '14px',
              color: '#ffffff',
              background: '#1B4FD8',
              border: 'none',
              borderRadius: '8px',
              padding: '13px 28px',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'background 0.2s',
              display: 'inline-block',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#3D6AE8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1B4FD8')}
          >
            Start free — no card needed
          </a>
          <a
            href="#how-it-works"
            onClick={e => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 500,
              fontSize: '14px',
              color: '#7BA3FF',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '8px',
              padding: '13px 28px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            See how it works ↓
          </a>
        </div>

        <div
          className={`fade-up${sectionVisible ? ' visible' : ''}`}
          style={{ transitionDelay: '400ms', width: '100%', maxWidth: '740px', margin: '0 auto' }}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.09)',
              borderBottom: 'none',
              borderRadius: '14px 14px 0 0',
              overflow: 'hidden',
            }}
          >
            <div style={{ background: '#0B0F1A', padding: '10px 16px', display: 'flex', alignItems: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57', display: 'block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E', display: 'block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840', display: 'block' }} />
              </div>
              <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#2D3A4A' }}>
                app.authflow.ai
              </span>
            </div>

            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1, background: '#0F1420', padding: '16px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '9px', color: '#2D3A4A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                  Clinical note
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4A5A6A', lineHeight: 1.6, minHeight: '80px', marginBottom: '12px', wordBreak: 'break-word' }}>
                  {typed}
                  {typing && (
                    <span
                      className="blink-cursor"
                      style={{ display: 'inline-block', width: '1px', height: '11px', background: '#1B4FD8', verticalAlign: 'text-bottom', marginLeft: '1px' }}
                    />
                  )}
                </div>
                <div style={{ background: 'rgba(27,79,216,0.14)', border: '1px solid rgba(27,79,216,0.28)', borderRadius: '6px', padding: '6px 10px', fontFamily: 'var(--font-inter)', fontSize: '10px', color: '#7BA3FF', marginBottom: '10px' }}>
                  Blue Cross Illinois ▾
                </div>
                <button style={{ width: '100%', background: '#1B4FD8', border: 'none', borderRadius: '6px', padding: '7px', fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 700, color: '#ffffff', cursor: 'pointer' }}>
                  Generate prior auth →
                </button>
              </div>

              <div style={{ flex: 1, background: '#0B1020', padding: '16px', opacity: formVisible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '9px', color: '#2D3A4A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                  Generated form
                </div>
                {[
                  { label: 'Diagnosis', text: 'Lumbar radiculopathy with suspected herniated disc at L4-L5', cite: 'Blue Cross IL §4.1 — Diagnostic criteria met' },
                  { label: 'Clinical justification', text: '6 weeks conservative treatment failed. NSAIDs and PT documented. Neurological deficit confirmed.', cite: 'Policy §4.2.3 — Conservative treatment threshold satisfied' },
                  { label: 'Medical necessity', text: 'CT myelogram required for surgical planning and definitive diagnosis.', cite: 'Blue Cross IL §4.2 — Imaging criteria met' },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1B4FD8', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '9px', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: '#6B7A9A', lineHeight: 1.5, paddingLeft: '12px', marginBottom: '2px' }}>{item.text}</div>
                    <div style={{ fontFamily: 'var(--font-inter)', fontSize: '9px', color: '#2D3A4A', fontStyle: 'italic', paddingLeft: '12px' }}>{item.cite}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
