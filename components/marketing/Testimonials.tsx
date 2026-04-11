'use client';

import { useIntersection } from '@/hooks/useIntersection';

const TESTIMONIALS = [
  {
    quote: "We have two staff members spending their entire morning on prior auth every single day. That's $1,700 a month in labor — just on paperwork.",
    attribution: 'Office Manager · Chicago Orthopedics',
  },
  {
    quote: "I've had patients cry in my office because their insurance denied a procedure we both know they need. The appeals process alone takes a week.",
    attribution: 'Practice Administrator · Dermatology, Chicago',
  },
  {
    quote: 'Every payer has different forms, different criteria, different portals. My staff has to relearn the process every single time. It\'s exhausting.',
    attribution: 'Office Manager · Oncology Practice, Evanston',
  },
];

export default function Testimonials() {
  const [sectionRef, isVisible] = useIntersection(0.15);

  return (
    <section ref={sectionRef} style={{ background: '#F0F4F8', padding: '120px 24px', textAlign: 'center' }}>
      <div className={`fade-up${isVisible ? ' visible' : ''}`} style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '11px', color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>
        From practices like yours
      </div>

      <h2 className={`fade-up${isVisible ? ' visible' : ''}`} style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '38px', color: '#0B0F1A', letterSpacing: '-1px', marginBottom: '56px' }}>
        What office managers are saying
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '920px', margin: '0 auto', textAlign: 'left' }}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className={`fade-up${isVisible ? ' visible' : ''}`} style={{ transitionDelay: `${i * 100}ms`, background: '#ffffff', border: '1px solid #E0E6EE', borderRadius: '14px', padding: '28px' }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '52px', color: '#1B4FD8', lineHeight: 0.7, marginBottom: '12px' }}>
              &ldquo;
            </span>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#374151', lineHeight: 1.75, marginBottom: '16px' }}>{t.quote}</p>
            <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '11px', color: '#9CA3AF' }}>{t.attribution}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
