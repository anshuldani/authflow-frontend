'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, PlusCircle, ClipboardList, FileWarning, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  userInfo: { plan: string; pa_count_this_month: number; pa_quota: number | null; email: string }
  onMobileClose?: () => void
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New PA', href: '/dashboard/new', icon: PlusCircle },
  { label: 'History', href: '/dashboard/history', icon: ClipboardList },
  { label: 'Appeals', href: '/dashboard/appeals', icon: FileWarning },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar({ userInfo, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const used = userInfo.pa_count_this_month
  const quota = userInfo.pa_quota ?? 10
  const usagePercent = Math.min((used / quota) * 100, 100)
  const barColor = usagePercent >= 100 ? '#EF5350' : usagePercent >= 80 ? '#FFA726' : '#1B4FD8'

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside style={{
      width: '240px', flexShrink: 0, background: '#0B0F1A',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
    }}>
      <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '18px', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '32px', paddingLeft: '8px' }}>
        Authflow.
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '8px', textDecoration: 'none',
                background: isActive ? 'rgba(27,79,216,0.15)' : 'transparent',
                borderLeft: isActive ? '2px solid #1B4FD8' : '2px solid transparent',
                color: isActive ? '#ffffff' : '#6B7A9A',
                fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#6B7A9A' }}
            >
              <Icon size={15} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {userInfo.plan === 'free' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#6B7A9A' }}>{used} of {quota} PAs used</span>
              {usagePercent >= 100 && (
                <Link href="/dashboard/settings" style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#7BA3FF', textDecoration: 'none' }}>Upgrade</Link>
              )}
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${usagePercent}%`, background: barColor, borderRadius: '99px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(27,79,216,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#7BA3FF', fontWeight: 700, flexShrink: 0 }}>
            {userInfo.email.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userInfo.email}</div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{userInfo.plan}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '7px', fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#6B7A9A', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7A9A')}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
