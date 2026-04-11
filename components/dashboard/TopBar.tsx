interface TopBarProps {
  title: string
  showUpgrade?: boolean
}

export default function TopBar({ title, showUpgrade = false }: TopBarProps) {
  return (
    <div style={{
      height: '52px',
      background: 'rgba(11,15,26,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', position: 'sticky', top: 0, zIndex: 10,
    }}>
      <h1 style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '15px', color: '#ffffff' }}>
        {title}
      </h1>
      {showUpgrade && (
        <a
          href="/dashboard/settings"
          style={{ background: '#1B4FD8', color: '#ffffff', textDecoration: 'none', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-inter)', padding: '6px 14px', borderRadius: '6px' }}
        >
          Upgrade to Pro
        </a>
      )}
    </div>
  )
}
