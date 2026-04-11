'use client';

import { useEffect, useRef, useState } from 'react';
import { useIntersection } from '@/hooks/useIntersection';

function useCountUp(target: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const progress = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(progress * target));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start, target, duration]);

  return value;
}

export default function Stats() {
  const [sectionRef, isVisible] = useIntersection(0.15);
  const stat1 = useCountUp(39, 1400, isVisible);
  const stat2 = useCountUp(35, 1400, isVisible);
  const stat3 = useCountUp(82, 1400, isVisible);

  return (
    <section ref={sectionRef} style={{ background: '#ffffff', padding: '120px 24px', textAlign: 'center' }}>
      <div
        className={`fade-up${isVisible ? ' visible' : ''}`}
        style={{ transitionDelay: '0ms', fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '11px', color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '56px' }}
      >
        The problem in numbers
      </div>

      <div style={{ display: 'flex', maxWidth: '820px', margin: '0 auto 64px', justifyContent: 'center' }}>
        {[
          { value: stat1, suffix: '', label: 'prior auth requests per physician, every week', delay: 0 },
          { value: stat2, suffix: 'min', label: 'average time to complete one request manually', delay: 100 },
          { value: stat3, suffix: '%', label: 'of physicians have had a patient give up on treatment', delay: 200 },
        ].map((stat, i) => (
          <div
            key={i}
            className={`fade-up${isVisible ? ' visible' : ''}`}
            style={{ transitionDelay: `${stat.delay}ms`, flex: 1, padding: '40px 32px', borderRight: i < 2 ? '1px solid #E8ECF0' : 'none' }}
          >
            <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '72px', color: '#0B0F1A', letterSpacing: '-3px', lineHeight: 1, marginBottom: '12px' }}>
              {stat.value}
              {stat.suffix && <span style={{ fontSize: '36px', letterSpacing: '-1px', marginLeft: '4px' }}>{stat.suffix}</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#8090A8', lineHeight: 1.5, maxWidth: '180px', margin: '0 auto' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <p
        className={`fade-up${isVisible ? ' visible' : ''}`}
        style={{ transitionDelay: '300ms', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '30px', color: '#0B0F1A', maxWidth: '640px', margin: '0 auto', lineHeight: 1.3 }}
      >
        This is the{' '}
        <span style={{ color: '#1B4FD8' }}>$35 billion problem</span>
        {' '}nobody built a simple fix for. Until now.
      </p>
    </section>
  );
}
