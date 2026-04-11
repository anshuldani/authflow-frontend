'use client';

import { useIntersection } from '@/hooks/useIntersection';

const PILLARS = [
  { title: 'No PHI stored', desc: 'Clinical notes are processed in-memory and never written to disk. Zero retention.', icon: 'circle' },
  { title: 'In-memory processing', desc: 'Your data lives only for the duration of the request. Then it is gone.', icon: 'square' },
  { title: 'BAA available', desc: 'Business Associate Agreements on all plans. HIPAA-ready from day one.', icon: 'doc' },
];

function Icon({ type }: { type: string }) {
  if (type === 'circle') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#1B4FD8" strokeWidth="2" />
      </svg>
    );
  }
  if (type === 'square') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="3" stroke="#1B4FD8" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="2" width="12" height="16" rx="2" stroke="#1B4FD8" strokeWidth="2" />
      <line x1="7" y1="7" x2="13" y2="7" stroke="#1B4FD8" strokeWidth="1.5" />
      <line x1="7" y1="10" x2="13" y2="10" stroke="#1B4FD8" strokeWidth="1.5" />
      <line x1="7" y1="13" x2="11" y2="13" stroke="#1B4FD8" strokeWidth="1.5" />
    </svg>
  );
}

export default function Hipaa() {
  const [sectionRef, isVisible] = useIntersection(0.15);

  return (
    <section ref={sectionRef} style={{ background: '#F0F4F8', padding: '100px 24px', textAlign: 'center' }}>
      <h2 className={`fade-up${isVisible ? ' visible' : ''}`} style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '40px', color: '#0B0F1A', letterSpacing: '-1.5px', lineHeight: 1.1, maxWidth: '560px', margin: '0 auto 56px' }}>
        Built with your patients&apos;<br />privacy in mind.
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '720px', margin: '0 auto' }}>
        {PILLARS.map((pillar, i) => (
          <div key={i} className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
            <div style={{ width: '48px', height: '48px', background: '#E8EFFF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon type={pillar.icon} />
            </div>
            <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '14px', color: '#0B0F1A', marginBottom: '6px' }}>{pillar.title}</div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#7B8A9A', lineHeight: 1.6 }}>{pillar.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
