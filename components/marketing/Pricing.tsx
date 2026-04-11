'use client';

import { useState } from 'react';
import { useIntersection } from '@/hooks/useIntersection';

const FREE_FEATURES = ['10 prior auths / month', 'Top 5 payers', 'No EHR required', 'No credit card required'];
const PRO_FEATURES = ['Unlimited prior auths', 'All major payers', 'Appeal letter generator', 'Denial tracking + status log', 'Priority support'];
const CLINIC_FEATURES = ['Everything in Pro', 'Multi-provider team seats', 'Analytics dashboard', 'BAA included'];

export default function Pricing() {
  const [sectionRef, isVisible] = useIntersection(0.1);
  const [paCount, setPaCount] = useState(39);
  const savings = Math.round(paCount * 32 * (20 / 60) * 4.3);

  return (
    <section ref={sectionRef} id="pricing" style={{ background: '#0B0F1A', padding: '120px 24px', textAlign: 'center' }}>
      <div className={`fade-up${isVisible ? ' visible' : ''}`} style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '11px', color: '#3D5A8A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>
        Pricing
      </div>

      <h2 className={`fade-up${isVisible ? ' visible' : ''}`} style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '48px', color: '#ffffff', letterSpacing: '-2px', lineHeight: 1.08, marginBottom: '16px' }}>
        Pricing that makes<br />the math obvious.
      </h2>

      <p className={`fade-in${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '150ms', fontFamily: 'var(--font-inter)', fontSize: '15px', color: '#4A5A7A', maxWidth: '540px', margin: '0 auto 56px', lineHeight: 1.6 }}>
        Authflow Pro costs $299/month. It saves $1,700/month in staff time. You don&apos;t need a calculator. But we built one anyway.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '880px', margin: '0 auto 48px', textAlign: 'left' }}>
        {/* Free */}
        <div className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '0ms', background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '28px' }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '11px', color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Free</div>
          <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '44px', color: '#ffffff', letterSpacing: '-1px', lineHeight: 1 }}>$0</div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#374151', marginBottom: '24px', marginTop: '4px' }}>per month, forever</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '24px' }}>
            {FREE_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1B4FD8', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#6B7A9A' }}>{f}</span>
              </div>
            ))}
          </div>
          <a href="/signup" style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '11px', fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 700, color: '#6B7A9A', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
            Get started free
          </a>
        </div>

        {/* Pro */}
        <div className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '100ms', background: '#0E1B38', border: '2px solid #1B4FD8', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '11px', color: '#7BA3FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pro — most popular</div>
            <span style={{ background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', color: '#FCD34D', fontSize: '10px', fontFamily: 'var(--font-inter)', fontWeight: 600, padding: '2px 8px', borderRadius: '99px' }}>Now in beta</span>
          </div>
          <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '44px', color: '#7BA3FF', letterSpacing: '-1px', lineHeight: 1 }}>$299</div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#3A5A8A', marginBottom: '24px', marginTop: '4px' }}>per month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '24px' }}>
            {PRO_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1B4FD8', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#8899BB' }}>{f}</span>
              </div>
            ))}
          </div>
          <a
            href="/waitlist"
            style={{ display: 'block', width: '100%', background: '#1B4FD8', border: 'none', borderRadius: '8px', padding: '11px', fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 700, color: '#ffffff', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#3D6AE8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1B4FD8')}
          >
            Join the waitlist
          </a>
        </div>

        {/* Clinic */}
        <div className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '200ms', background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '28px' }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '11px', color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Clinic</div>
          <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '44px', color: '#ffffff', letterSpacing: '-1px', lineHeight: 1 }}>$799</div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#374151', marginBottom: '24px', marginTop: '4px' }}>per month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '24px' }}>
            {CLINIC_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1B4FD8', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#6B7A9A' }}>{f}</span>
              </div>
            ))}
          </div>
          <a
            href="mailto:hello@authflow.ai"
            style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '11px', fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 700, color: '#6B7A9A', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}
          >
            Talk to us
          </a>
        </div>
      </div>

      {/* ROI Calculator */}
      <div className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '300ms', background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '28px', maxWidth: '520px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#6B7A9A', marginBottom: '16px' }}>
          My practice does{' '}
          <strong style={{ color: '#ffffff' }}>{paCount}</strong>
          {' '}prior auths per week
        </p>
        <input type="range" min={5} max={100} step={1} value={paCount} onChange={e => setPaCount(Number(e.target.value))} style={{ width: '100%', marginBottom: '16px', accentColor: '#1B4FD8' }} />
        <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '36px', color: '#1B4FD8', letterSpacing: '-1px', marginBottom: '6px' }}>
          ${savings.toLocaleString()}
        </div>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#374151' }}>
          saved per month in staff time with Authflow Pro
        </div>
      </div>
    </section>
  );
}
