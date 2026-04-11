'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import type { PriorAuth, GeneratedForm } from '@/lib/types'

interface PATableProps {
  pas: PriorAuth[]
  showFilters?: boolean
}

const PAYER_OPTIONS = [
  { id: 'bcbs_il', name: 'Blue Cross IL' },
  { id: 'aetna', name: 'Aetna' },
  { id: 'uhc', name: 'UHC' },
  { id: 'cigna', name: 'Cigna' },
  { id: 'humana', name: 'Humana' },
]

const STATUS_OPTIONS = ['draft', 'submitted', 'approved', 'denied', 'appealed']

export default function PATable({ pas, showFilters = false }: PATableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayer, setFilterPayer] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PER_PAGE = 20

  let filtered = pas
  if (filterStatus !== 'all') filtered = filtered.filter(p => p.status === filterStatus)
  if (filterPayer !== 'all') filtered = filtered.filter(p => p.payer_id === filterPayer)
  if (search) filtered = filtered.filter(p => p.procedure_name.toLowerCase().includes(search.toLowerCase()))

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  if (pas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6B7A9A', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
        No prior authorizations yet.{' '}
        <Link href="/dashboard/new" style={{ color: '#7BA3FF', textDecoration: 'none' }}>Generate your first one.</Link>
      </div>
    )
  }

  return (
    <div>
      {showFilters && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            placeholder="Search procedure..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '7px 12px', fontSize: '12px', color: '#ffffff', fontFamily: 'var(--font-inter)', outline: 'none', minWidth: '180px' }}
          />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0) }}
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '7px 12px', fontSize: '12px', color: '#6B7A9A', fontFamily: 'var(--font-inter)' }}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={filterPayer}
            onChange={e => { setFilterPayer(e.target.value); setPage(0) }}
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '7px 12px', fontSize: '12px', color: '#6B7A9A', fontFamily: 'var(--font-inter)' }}
          >
            <option value="all">All payers</option>
            {PAYER_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Payer', 'Procedure', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((pa, i) => (
              <React.Fragment key={pa.id}>
                <tr style={{ borderBottom: expandedId === pa.id ? 'none' : '1px solid rgba(255,255,255,0.04)', background: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#ffffff' }}>{pa.payer}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#6B7A9A', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pa.procedure_name}</td>
                  <td style={{ padding: '12px 16px' }}><Badge variant={pa.status}>{pa.status}</Badge></td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#4A5A7A' }}>{new Date(pa.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {pa.status === 'denied' && (
                        <Link href="/dashboard/appeals" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#7BA3FF', textDecoration: 'none' }}>Generate appeal →</Link>
                      )}
                      <button
                        onClick={() => setExpandedId(expandedId === pa.id ? null : pa.id)}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', color: '#6B7A9A', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
                      >
                        {expandedId === pa.id ? 'Hide' : 'View'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === pa.id && pa.generated_form && (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', background: 'rgba(27,79,216,0.05)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <FormDetails form={pa.generated_form as GeneratedForm} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '5px 10px', fontSize: '12px', color: page === 0 ? '#374151' : '#6B7A9A', cursor: page === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter)' }}
            >
              ← Prev
            </button>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#6B7A9A', padding: '5px 10px' }}>{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '5px 10px', fontSize: '12px', color: page >= totalPages - 1 ? '#374151' : '#6B7A9A', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter)' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FormDetails({ form }: { form: GeneratedForm }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {[
        { label: 'ICD-10', value: `${form.icd10_code} — ${form.icd10_description}` },
        { label: 'CPT Code', value: `${form.cpt_code} — ${form.cpt_description}` },
        { label: 'Clinical Justification', value: form.clinical_justification },
        { label: 'Medical Necessity', value: form.medical_necessity },
        { label: 'Supporting Evidence', value: form.supporting_evidence },
        { label: 'Policy Cited', value: form.policy_sections_cited.join(', ') },
      ].map(item => (
        <div key={item.label}>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{item.label}</div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#8899BB', lineHeight: 1.5 }}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}
