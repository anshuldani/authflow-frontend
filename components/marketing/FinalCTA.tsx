'use client';

import { useIntersection } from '@/hooks/useIntersection';

export default function FinalCTA() {
  const [sectionRef, isVisible] = useIntersection(0.15);

  return (
    <section ref={sectionRef} style={{ background: '#0B0F1A', padding: '160px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse at center bottom, rgba(27,79,216,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '0ms', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '64px', color: '#ffffff', letterSpacing: '-2.5px', lineHeight: 1.04, maxWidth: '640px', margin: '0 auto 20px' }}>
          Your next prior auth<br />takes 30 seconds.
        </h2>

        <p className={`fade-in${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '200ms', fontFamily: 'var(--font-inter)', fontSize: '16px', color: '#4A5A7A', marginBottom: '40px' }}>
          Join practices across Chicago already saving hours every week.
        </p>

        <div className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '300ms' }}>
          <a
            href="/signup"
            style={{ display: 'inline-block', background: '#1B4FD8', color: '#ffffff', fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '16px', padding: '16px 40px', borderRadius: '10px', border: 'none', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3D6AE8'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1B4FD8'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Start free — no card needed
          </a>
          <span className={`fade-in${isVisible ? ' visible' : ''}`} style={{ transitionDelay: '500ms', display: 'block', fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#2A3550', marginTop: '12px' }}>
            Free plan includes 10 prior auths per month.{' '}
            <a href="/waitlist" style={{ color: '#3D5A8A', textDecoration: 'none' }}>Upgrade anytime.</a>
          </span>
        </div>
      </div>
    </section>
  );
}
