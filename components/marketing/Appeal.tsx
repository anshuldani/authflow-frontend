'use client';

import { useIntersection } from '@/hooks/useIntersection';

export default function Appeal() {
  const [sectionRef, isVisible] = useIntersection(0.15);

  return (
    <section ref={sectionRef} style={{ background: '#ffffff', padding: '120px 24px', textAlign: 'center' }}>
      <div className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '0ms', fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '11px', color: '#C62828', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>
        The appeal engine
      </div>

      <h2 className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '0ms', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '52px', color: '#0B0F1A', letterSpacing: '-2px', lineHeight: 1.08, marginBottom: '20px' }}>
        Denied?<br />Fight back in seconds.
      </h2>

      <p className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '100ms', fontFamily: 'var(--font-inter)', fontSize: '15px', color: '#6B7A9A', lineHeight: 1.65, maxWidth: '540px', margin: '0 auto 56px' }}>
        Near 100% of Medicare Advantage denials are overturned on appeal. Authflow writes the letter — quoting their own policy against them — before you&apos;ve finished reading the denial.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '820px', margin: '0 auto', textAlign: 'left' }}>
        <div className={`fade-left${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '200ms', background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '10px', color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Insurance denial</span>
          </div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#7F1D1D', lineHeight: 1.7 }}>
            Request for CT myelogram (CPT 72265) has been denied. Conservative treatment has not been adequately documented as exhausted per our clinical criteria.
          </p>
        </div>

        <div className={`fade-right${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '200ms', background: '#EFF4FF', border: '1px solid #BFCFFD', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1B4FD8', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '10px', color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Authflow appeal — generated in 8 seconds</span>
          </div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#1E3A6E', lineHeight: 1.7, marginBottom: '14px' }}>
            We formally appeal the denial. Per{' '}
            <span style={{ background: '#DBEAFE', borderRadius: '3px', padding: '0 3px' }}>Blue Cross policy §4.2.3</span>
            , conservative treatment is defined as ≥4 weeks of NSAIDs and physical therapy. Records confirm{' '}
            <span style={{ background: '#DBEAFE', borderRadius: '3px', padding: '0 3px' }}>6 weeks of documented treatment with objective failure</span>
            . The denial criteria have not been met. Immediate reconsideration is requested.
          </p>
          <span style={{ display: 'inline-block', background: '#1B4FD8', color: '#ffffff', fontFamily: 'var(--font-inter)', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>
            Generated in 8.2s
          </span>
        </div>
      </div>
    </section>
  );
}
