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
        <div key={card.label} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
