import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Security', href: '/security' },
  { label: 'Contact', href: 'mailto:hello@authflow.ai' },
];

export default function Footer() {
  return (
    <footer style={{ background: '#060810', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <Link href="/" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '17px', color: '#ffffff', textDecoration: 'none', display: 'block' }}>Authflow.</Link>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#2A3550', marginTop: '3px' }}>Built in Chicago · 2026</div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {FOOTER_LINKS.map(link => (
          <a key={link.label} href={link.href} style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#2A3550', textDecoration: 'none' }}>{link.label}</a>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#1A2540' }}>
        © 2026 Authflow. All rights reserved.
      </div>
    </footer>
  );
}
