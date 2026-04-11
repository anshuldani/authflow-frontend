const variantStyles: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'rgba(255,255,255,0.08)', color: '#6B7A9A' },
  submitted: { bg: 'rgba(27,79,216,0.15)', color: '#7BA3FF' },
  approved: { bg: 'rgba(46,125,50,0.15)', color: '#66BB6A' },
  denied: { bg: 'rgba(198,40,40,0.15)', color: '#EF5350' },
  appealed: { bg: 'rgba(186,117,23,0.15)', color: '#FFA726' },
  overturned: { bg: 'rgba(46,125,50,0.15)', color: '#66BB6A' },
  upheld: { bg: 'rgba(198,40,40,0.15)', color: '#EF5350' },
  free: { bg: 'rgba(255,255,255,0.08)', color: '#6B7A9A' },
  pro: { bg: 'rgba(27,79,216,0.15)', color: '#7BA3FF' },
  clinic: { bg: 'rgba(83,58,183,0.15)', color: '#B39DDB' },
}

interface BadgeProps {
  variant: string
  children: React.ReactNode
}

export default function Badge({ variant, children }: BadgeProps) {
  const s = variantStyles[variant] ?? variantStyles.draft
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: '11px',
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: '99px',
      fontFamily: 'var(--font-inter)',
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
