'use client'

const COL_LINKS: { heading: string; links: string[]; extra?: { heading: string; links: string[] } }[] = [
  {
    heading: 'Home page',
    links: ['How it works', 'Letters', 'Transcribe', 'Practices', 'Testimonials', 'Safety', 'Pricing', 'Devices'],
  },
  {
    heading: 'Navigation',
    links: ['Transcribe', 'Letters', 'Blog', 'Pricing'],
  },
  {
    heading: 'Use Cases',
    links: ['Doctors', 'Specialists', 'Allied Health', 'Psychologists', 'General Practitioners', 'Medical Practices'],
  },
  {
    heading: 'Socials',
    links: ['LinkedIn'],
    extra: { heading: 'Legal', links: ['Privacy Policy', 'Terms of use'] },
  },
]

const linkStyle: React.CSSProperties = {
  display: 'block',
  color: '#64748b',
  fontSize: '0.875rem',
  marginBottom: 10,
  cursor: 'pointer',
  transition: 'color 0.15s',
  textDecoration: 'none',
}

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(255,255,255,0.6)',
      borderTop: '1px solid rgba(59,130,246,0.1)',
      backdropFilter: 'blur(20px)',
      padding: '60px 40px 32px',
      fontFamily: 'var(--font-inter)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(4, 1fr)',
          gap: 48,
          marginBottom: 40,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>AuthFlow</span>
            </div>
          </div>

          {COL_LINKS.map(col => (
            <div key={col.heading}>
              <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem', marginBottom: 16 }}>
                {col.heading}
              </p>
              {col.links.map(link => (
                <a
                  key={link}
                  href="#"
                  style={linkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = '#1d4ed8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >
                  {link}
                </a>
              ))}
              {col.extra && (
                <>
                  <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem', marginTop: 24, marginBottom: 16 }}>
                    {col.extra.heading}
                  </p>
                  {col.extra.links.map(link => (
                    <a
                      key={link}
                      href="#"
                      style={linkStyle}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                    >
                      {link}
                    </a>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgba(59,130,246,0.08)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>© 2026 AuthFlow. All rights reserved.</span>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Built for medical practices everywhere.</span>
        </div>
      </div>
    </footer>
  )
}
