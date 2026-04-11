'use client';

import Link from 'next/link';

const NAV_LINKS = [
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'For practices', id: 'comparison' },
  { label: 'Payers', id: 'payers' },
];

export default function Nav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '48px',
        background: 'rgba(11,15,26,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontWeight: 700,
          fontSize: '19px',
          color: '#ffffff',
          letterSpacing: '-0.5px',
          textDecoration: 'none',
        }}
      >
        Authflow.
      </Link>

      <div
        style={{
          display: 'flex',
          gap: '28px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {NAV_LINKS.map(link => (
          <a
            key={link.label}
            href={`#${link.id}`}
            onClick={e => { e.preventDefault(); scrollTo(link.id); }}
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 500,
              fontSize: '12px',
              color: '#6B7A9A',
              textDecoration: 'none',
              transition: 'color 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7A9A')}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <a
          href="/signin"
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: '#ffffff',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '6px',
            padding: '5px 12px',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'border-color 0.2s',
            display: 'inline-block',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
        >
          Sign in
        </a>
        <a
          href="/signup"
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: '#ffffff',
            background: '#1B4FD8',
            border: 'none',
            borderRadius: '6px',
            padding: '5px 12px',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'background 0.2s',
            display: 'inline-block',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#3D6AE8')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1B4FD8')}
        >
          Start free
        </a>
      </div>
    </nav>
  );
}
