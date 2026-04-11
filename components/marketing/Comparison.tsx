'use client';

import { useIntersection } from '@/hooks/useIntersection';

const OTHER_ITEMS = [
  '$50,000+ implementation fee',
  '6-month onboarding process',
  'Requires Epic or Cerner EHR',
  'Built for 500-bed hospitals',
  'Enterprise sales team required',
  '12-month locked contracts',
];

const AUTHFLOW_ITEMS = [
  '$299/month. No setup fees.',
  'Live in 5 minutes',
  'No EHR required — paste and go',
  'Built for 3-doctor practices',
  'Sign up yourself, right now',
  'Cancel anytime',
];

export default function Comparison() {
  const [sectionRef, isVisible] = useIntersection(0.15);

  return (
    <section ref={sectionRef} id="comparison" style={{ background: '#0B0F1A', padding: '120px 24px', textAlign: 'center' }}>
      <span id="payers" style={{ display: 'block', position: 'relative', top: '-80px', visibility: 'hidden' }} />
      <div className={`fade-up${isVisible ? ' visible' : ''}`} style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '11px', color: '#3D5A8A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>
        Why Authflow
      </div>

      <h2 className={`fade-up${isVisible ? ' visible' : ''}`} style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '48px', color: '#ffffff', letterSpacing: '-2px', lineHeight: 1.08, maxWidth: '640px', margin: '0 auto 56px' }}>
        Everyone else built for hospitals.<br />We built for you.
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '880px', margin: '0 auto', textAlign: 'left' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '11px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Other solutions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {OTHER_ITEMS.map((item, i) => (
              <div key={item} className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: `${i * 60}ms`, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#374151', fontSize: '11px', flexShrink: 0, width: '16px' }}>✕</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '11px', color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Authflow</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {AUTHFLOW_ITEMS.map((item, i) => (
              <div key={item} className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: `${i * 60}ms`, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(27,79,216,0.10)', border: '1px solid rgba(27,79,216,0.18)' }}>
                <span style={{ color: '#1B4FD8', fontSize: '11px', flexShrink: 0, width: '16px' }}>✓</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#7BA3FF', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
