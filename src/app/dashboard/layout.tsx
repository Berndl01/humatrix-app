'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { HumatrixLogo } from '@/components/HumatrixLogo'

const NAV_PLAYER = [
  { href: '/dashboard/player', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/test', label: 'Selbsttest', icon: '🧬' },
  { href: '/dashboard/battery', label: 'Befragung', icon: '📋' },
  { href: '/dashboard/results', label: 'Ergebnisse', icon: '📈' },
  { href: '/dashboard/feedback', label: 'Feedback', icon: '💬' },
  { href: '/dashboard/history', label: 'Historie', icon: '📚' },
  { href: '/dashboard/profile', label: 'Profil', icon: '👤' },
]

const NAV_COACH = [
  { href: '/dashboard/coach', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/team', label: 'Mannschaft', icon: '👥' },
  { href: '/dashboard/send-battery', label: 'Befragung', icon: '📤' },
  { href: '/dashboard/trends', label: 'Trends', icon: '📈' },
  { href: '/dashboard/test', label: 'Mein Typ', icon: '🧬' },
  { href: '/dashboard/admin', label: 'Verwaltung', icon: '⚙️' },
  { href: '/dashboard/profile', label: 'Profil', icon: '👤' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        if (!supabase) { setLoading(false); return }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setProfile(data)
        } else {
          // Fallback: create profile object from auth metadata
          const meta = user.user_metadata || {}
          setProfile({
            id: user.id,
            email: user.email,
            first_name: meta.first_name || '',
            last_name: meta.last_name || '',
            role: meta.role || 'player'
          })
        }

        // Double-check: if profile says player but user has coach memberships, override
        const { data: coachCheck } = await supabase
          .from('team_memberships')
          .select('id')
          .eq('user_id', user.id)
          .eq('role_in_team', 'coach')
          .limit(1)
        if (coachCheck && coachCheck.length > 0) {
          setProfile((prev: any) => prev ? { ...prev, role: 'coach' } : prev)
        }

        // Load unread notifications
        const { data: notifs } = await supabase.from('notifications').select('*')
          .eq('user_id', user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(5)
        if (notifs) setNotifications(notifs)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  async function dismissNotification(id: string) {
    await supabase?.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  async function handleLogout() {
    await supabase?.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen hm-page flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div style={{ color: 'var(--text)' }}>Wird geladen...</div>
      </div>
    </div>
  )

  const isCoach = profile?.role === 'coach'
  const nav = isCoach ? NAV_COACH : NAV_PLAYER

  return (
    <div className="min-h-screen hm-page" style={{ background: 'var(--page-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-3"
        style={{ background: 'rgba(248,250,252,0.9)', borderBottom: '1px solid rgba(15,23,42,0.08)', backdropFilter: 'blur(14px)', boxShadow: '0 8px 32px rgba(15,23,42,0.04)' }}>
        <Link href={isCoach ? '/dashboard/coach' : '/dashboard/player'} className="flex items-center gap-2">
          <HumatrixLogo size={32} showText={true} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className="px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all"
              style={{
                background: pathname === item.href ? 'linear-gradient(180deg, #101938 0%, #0b1430 100%)' : 'rgba(255,255,255,0.66)',
                color: pathname === item.href ? '#ffffff' : 'var(--text)',
                border: pathname === item.href ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(15,23,42,0.08)',
                boxShadow: pathname === item.href ? '0 10px 24px rgba(15,23,42,0.12)' : '0 4px 14px rgba(15,23,42,0.04)'
              }}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{profile.first_name} {profile.last_name}</div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: isCoach ? 'var(--gold)' : 'var(--cyan)', fontWeight: 700 }}>{isCoach ? 'Trainer' : 'Spieler'}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn-secondary text-sm font-semibold">
            Abmelden
          </button>
          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-xl" style={{ color: 'var(--text)' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden px-4 py-3 space-y-1" style={{ background: 'rgba(248,250,252,0.96)', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
          {nav.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-bold"
              style={{
                background: pathname === item.href ? 'linear-gradient(180deg, #101938 0%, #0b1430 100%)' : 'rgba(255,255,255,0.72)',
                color: pathname === item.href ? '#ffffff' : 'var(--text)'
              }}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Notification Banner */}
      {notifications.length > 0 && (
        <div className="px-4 md:px-8 py-2 space-y-2" style={{ background: 'var(--page-bg)' }}>
          {notifications.map(n => (
            <div key={n.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{
              background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.3)',
            }}>
              <div className="text-xl">📋</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{n.title}</div>
                <div className="text-xs" style={{ color: 'var(--text)' }}>{n.message}</div>
              </div>
              {n.action_url && (
                <Link href={n.action_url} onClick={() => dismissNotification(n.id)}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0"
                  style={{ background: 'linear-gradient(180deg, #101938 0%, #0b1430 100%)', color: '#fff', boxShadow: '0 8px 18px rgba(15,23,42,0.14)' }}>
                  → Ausfüllen
                </Link>
              )}
              <button onClick={() => dismissNotification(n.id)} className="text-lg shrink-0" style={{ color: 'var(--text)' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <main className="px-4 md:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
