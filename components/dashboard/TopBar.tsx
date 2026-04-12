'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PriorAuth } from '@/lib/types'

interface TopBarProps {
  title: string
  showUpgrade?: boolean
}

const ff = 'Inter, system-ui, sans-serif'

const STATUS_COLORS: Record<string, { text: string; bg: string; label: string }> = {
  draft:     { text: '#475569', bg: '#F1F5F9', label: 'Draft' },
  submitted: { text: '#D97706', bg: '#FEF3C7', label: 'Submitted' },
  approved:  { text: '#16A34A', bg: '#DCFCE7', label: 'Approved' },
  denied:    { text: '#DC2626', bg: '#FEE2E2', label: 'Denied' },
  appealed:  { text: '#7C3AED', bg: '#EDE9FE', label: 'Appealed' },
}

export default function TopBar({ title, showUpgrade = false }: TopBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PriorAuth[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('prior_auths')
      .select('id, patient_name, patient_member_id, procedure_name, payer, status, auth_number, created_at, urgency')
      .or(`patient_name.ilike.%${q}%,patient_member_id.ilike.%${q}%,auth_number.ilike.%${q}%,procedure_name.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(8)
    setResults((data ?? []) as PriorAuth[])
    setSearching(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(() => { search(query); setOpen(true) }, 220)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); inputRef.current?.select() }
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleSelect = (pa: PriorAuth) => {
    setQuery(''); setOpen(false); setResults([])
    router.push(`/dashboard/pa/${pa.id}`)
  }

  return (
    <div style={{
      height: '56px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
      gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <h1 style={{ fontFamily: ff, fontWeight: 600, fontSize: '16px', color: '#0F172A', flexShrink: 0 }}>
        {title}
      </h1>

      {/* Search */}
      <div ref={containerRef} style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '14px', pointerEvents: 'none' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by patient name, member ID..."
            style={{
              width: '100%',
              background: '#F4F7FB',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '8px 12px 8px 32px',
              fontSize: '13px',
              color: '#0F172A',
              fontFamily: ff,
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => { if (results.length > 0) setOpen(true); e.currentTarget.style.borderColor = '#1A56DB'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,86,219,0.1)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F4F7FB'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {searching && (
            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '11px' }}>…</span>
          )}
        </div>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: '10px', overflow: 'hidden', zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}>
            {results.length === 0 && !searching ? (
              <div style={{ padding: '16px', fontFamily: ff, fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
                No patients found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              results.map(pa => {
                const s = STATUS_COLORS[pa.status] ?? STATUS_COLORS.draft
                return (
                  <button
                    key={pa.id}
                    onClick={() => handleSelect(pa)}
                    style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid #EEF2F7', padding: '11px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F4F7FB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: ff, fontSize: '13px', fontWeight: 500, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                        {pa.patient_name ?? 'Unknown patient'}
                        {pa.patient_member_id && <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: '6px' }}>#{pa.patient_member_id}</span>}
                      </div>
                      <div style={{ fontFamily: ff, fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pa.procedure_name} · {pa.payer}
                        {pa.auth_number && <span style={{ color: '#94A3B8' }}> · Auth #{pa.auth_number}</span>}
                      </div>
                    </div>
                    <span style={{ fontFamily: ff, fontSize: '11px', fontWeight: 600, color: s.text, background: s.bg, padding: '2px 8px', borderRadius: '20px', flexShrink: 0 }}>
                      {s.label}
                    </span>
                  </button>
                )
              })
            )}
            <div style={{ padding: '8px 14px', borderTop: '1px solid #EEF2F7', fontFamily: ff, fontSize: '11px', color: '#94A3B8' }}>
              Search by patient name, member ID, or authorization number
            </div>
          </div>
        )}
      </div>

      {showUpgrade && (
        <a
          href="/dashboard/settings"
          style={{ background: '#1A56DB', color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: 600, fontFamily: ff, padding: '7px 16px', borderRadius: '7px', flexShrink: 0 }}
        >
          Upgrade Plan
        </a>
      )}
    </div>
  )
}
