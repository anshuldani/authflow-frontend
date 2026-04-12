'use client'
import { useState } from 'react'
import type { PriorAuth, Appeal } from '@/lib/types'

interface AppealGeneratorProps {
  pa: PriorAuth
  onDone: (appeal: Appeal) => void
}

export default function AppealGenerator({ pa, onDone }: AppealGeneratorProps) {
  const [denialReason, setDenialReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [result, setResult] = useState<Appeal | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [marking, setMarking] = useState(false)

  const handleGenerate = async () => {
    if (!denialReason.trim()) return
    setLoading(true)
    setError('')
    setLoadingText('Reading denial reason...')
    const timer = setTimeout(() => setLoadingText('Writing appeal letter...'), 2000)
    try {
      const res = await fetch('/api/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paId: pa.id, denialReason }),
      })
      const data = await res.json() as { success: boolean; appeal?: Appeal; error?: string }
      if (!data.success || !data.appeal) { setError(data.error ?? 'Generation failed'); return }
      setResult(data.appeal)
      onDone(data.appeal)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      clearTimeout(timer)
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.generated_appeal)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMarkSubmitted = async () => {
    if (!result) return
    setMarking(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('appeals').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', result.id)
    setMarking(false)
  }

  return (
    <div style={{ padding: '16px', background: '#EBF2FF', border: '1px solid #BFDBFE', borderRadius: '8px', marginTop: '8px' }}>
      {!result ? (
        <>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Reason for denial
          </div>
          <textarea
            value={denialReason}
            onChange={e => setDenialReason(e.target.value)}
            placeholder="e.g. 'Conservative treatment not adequately documented as exhausted per clinical criteria §3.1'"
            style={{ width: '100%', minHeight: '80px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#0F172A', fontFamily: 'var(--font-inter)', resize: 'vertical', outline: 'none', marginBottom: '10px' }}
          />
          {error && <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#EF5350', marginBottom: '8px' }}>{error}</div>}
          <button
            onClick={handleGenerate}
            disabled={loading || !denialReason.trim()}
            style={{ background: loading || !denialReason.trim() ? 'rgba(27,79,216,0.3)' : '#1B4FD8', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: loading || !denialReason.trim() ? 'not-allowed' : 'pointer' }}
          >
            {loading ? loadingText : 'Generate appeal letter →'}
          </button>
        </>
      ) : (
        <div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: '#1B4FD8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Appeal Letter — {pa.payer}
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto', marginBottom: '12px' }}>
            {result.generated_appeal}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 12px', fontSize: '12px', color: copied ? '#16A34A' : '#475569', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
            >
              {copied ? '✓ Copied' : 'Copy letter'}
            </button>
            <button
              onClick={handleMarkSubmitted}
              disabled={marking}
              style={{ background: '#EBF2FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '7px 12px', fontSize: '12px', color: '#1D4ED8', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
            >
              {marking ? 'Saving...' : 'Mark appeal as submitted'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
