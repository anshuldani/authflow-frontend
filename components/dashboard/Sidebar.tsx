'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, PlusCircle, ClipboardList, FileWarning, Settings, ShieldCheck, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  userInfo: { plan: string; pa_count_this_month: number; pa_quota: number | null; email: string }
  onMobileClose?: () => void
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New Request', href: '/dashboard/new', icon: PlusCircle },
  { label: 'Active Approvals', href: '/dashboard/renewals', icon: ShieldCheck },
  { label: 'Request History', href: '/dashboard/history', icon: ClipboardList },
  { label: 'Appeals', href: '/dashboard/appeals', icon: FileWarning },
  { label: 'Insurance Plans', href: '/dashboard/payers', icon: BookOpen },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar({ userInfo, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const used = userInfo.pa_count_this_month
  const quota = userInfo.pa_quota ?? 10
  const usagePercent = Math.min((used / quota) * 100, 100)
  const barColor = usagePercent >= 100 ? '#DC2626' : usagePercent >= 80 ? '#D97706' : '#1A56DB'

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside style={{
      width: '240px',
      flexShrink: 0,
      background: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '4px 10px 24px', borderBottom: '1px solid #EEF2F7', marginBottom: '12px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '20px', color: '#1A56DB', letterSpacing: '-0.5px' }}>
          Authflow
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>
          Prior Authorization Assistant
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                background: isActive ? '#EBF2FF' : 'transparent',
                color: isActive ? '#1A56DB' : '#475569',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#F4F7FB'; e.currentTarget.style.color = '#0F172A' } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' } }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #EEF2F7' }}>
        {userInfo.plan === 'free' && (
          <div style={{ marginBottom: '16px', background: '#F4F7FB', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#475569' }}>
                {used} of {quota} requests used
              </span>
              {usagePercent >= 100 && (
                <Link href="/dashboard/settings" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1A56DB', textDecoration: 'none', fontWeight: 600 }}>
                  Upgrade
                </Link>
              )}
            </div>
            <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${usagePercent}%`, background: barColor, borderRadius: '99px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '4px 4px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', color: '#1A56DB', fontWeight: 700, flexShrink: 0,
          }}>
            {userInfo.email.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {userInfo.email}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#94A3B8', textTransform: 'capitalize' }}>
              {userInfo.plan} plan
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          style={{
            width: '100%', background: 'transparent',
            border: '1px solid #E2E8F0', borderRadius: '7px',
            padding: '8px', fontFamily: 'Inter, sans-serif',
            fontSize: '13px', color: '#475569', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FCA5A5' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#E2E8F0' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
