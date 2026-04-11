'use client'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

interface DashboardShellProps {
  userInfo: { plan: string; pa_count_this_month: number; pa_quota: number | null; email: string }
  children: React.ReactNode
}

export default function DashboardShell({ userInfo, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false)
  }, [isMobile])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F4F7FB' }}>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
            zIndex: 100, cursor: 'pointer',
          }}
        />
      )}

      {/* Sidebar wrapper */}
      <div style={isMobile ? {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 200,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
      } : { flexShrink: 0 }}>
        <Sidebar userInfo={userInfo} onMobileClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: '#F4F7FB',
        marginLeft: isMobile ? 0 : undefined,
        position: 'relative',
      }}>
        {/* Mobile hamburger button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{
              position: 'fixed', top: '14px', left: '16px', zIndex: 50,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '7px 10px',
              cursor: 'pointer',
              color: '#0F172A',
              fontSize: '14px',
              lineHeight: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            ☰
          </button>
        )}
        {children}
      </main>
    </div>
  )
}
