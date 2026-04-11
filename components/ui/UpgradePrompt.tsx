'use client'
import { useRouter } from 'next/navigation'
import Modal from './Modal'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradePrompt({ isOpen, onClose }: UpgradePromptProps) {
  const router = useRouter()
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={440}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 800, fontSize: '26px', color: '#ffffff', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          You&apos;ve used all 10 free prior auths
        </h2>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#6B7A9A', marginBottom: '28px', lineHeight: 1.6 }}>
          Upgrade to Pro for unlimited prior authorizations, appeal letters, and priority support.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={() => { router.push('/waitlist'); onClose() }}
            style={{ width: '100%', background: '#1B4FD8', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}
          >
            Join Pro waitlist →
          </button>
          <button
            onClick={onClose}
            style={{ width: '100%', background: 'transparent', color: '#6B7A9A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontSize: '14px', fontFamily: 'var(--font-inter)', cursor: 'pointer' }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  )
}
