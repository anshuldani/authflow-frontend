interface StatsCardsProps {
  paCount: number
  approvedCount: number
  totalSubmitted: number
  appealsCount: number
}

export default function StatsCards({ paCount, approvedCount, totalSubmitted, appealsCount }: StatsCardsProps) {
  const minutesSaved = paCount * 32
  const timeSaved = minutesSaved >= 60 ? `${(minutesSaved / 60).toFixed(1)}h` : `${minutesSaved}m`
  const approvalRate = totalSubmitted > 0 ? `${Math.round((approvedCount / totalSubmitted) * 100)}%` : '—'

  const cards = [
    { label: 'Prior auths this month', value: String(paCount), color: '#1B4FD8' },
    { label: 'Time saved', value: timeSaved, color: '#1B4FD8' },
    { label: 'Approval rate', value: approvalRate, color: '#66BB6A' },
    { label: 'Appeals filed', value: String(appealsCount), color: '#FFA726' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
      {cards.map(card => (
        <div key={card.label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#6B7A9A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {card.label}
          </div>
          <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '36px', color: card.color, letterSpacing: '-1px', lineHeight: 1 }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}
