import Link from 'next/link'

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '22px', color: '#ffffff', letterSpacing: '-0.5px', textDecoration: 'none', display: 'block', marginBottom: '40px' }}>
          Authflow.
        </Link>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '20px', color: '#ffffff', marginBottom: '16px' }}>Terms of Service</h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#6B7A9A', lineHeight: 1.7, marginBottom: '20px' }}>
            This page is coming soon. For questions about our terms of service, email us at{' '}
            <a href="mailto:hello@authflow.ai" style={{ color: '#7BA3FF', textDecoration: 'none' }}>hello@authflow.ai</a>
          </p>
          <Link href="/" style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#6B7A9A', textDecoration: 'none' }}>← Back to Authflow</Link>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Terms of Service | AuthFlow',
  description: 'AuthFlow terms of service.',
}
