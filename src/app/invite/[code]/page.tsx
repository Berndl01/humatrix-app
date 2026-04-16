'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { HumatrixLogo } from '@/components/HumatrixLogo'

export default function InvitePage() {
  const params = useParams()
  const code = params.code as string
  const supabase = createClient()

  const [team, setTeam] = useState<any>(null)
  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')

  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        if (!supabase) {
          setError('Verbindung nicht möglich')
          setLoading(false)
          return
        }

        const { data: teamData } = await supabase
          .from('teams')
          .select('*, clubs(name)')
          .eq('invite_code', code)
          .single()

        if (!teamData) {
          setError('Ungültiger Einladungslink.')
          setLoading(false)
          return
        }

        setTeam(teamData)
        setClub((teamData as any).clubs)

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: existing } = await supabase
            .from('team_memberships')
            .select('id')
            .eq('user_id', user.id)
            .eq('team_id', teamData.id)
            .limit(1)

          if (existing?.length) setJoined(true)
        }
      } catch {
        setError('Fehler beim Laden der Einladung.')
      }
      setLoading(false)
    }
    load()
  }, [code, supabase])

  async function joinTeam(userId: string) {
    if (!team) return false
    setJoining(true)
    const { error } = await supabase.from('team_memberships').insert({
      user_id: userId,
      team_id: team.id,
      role_in_team: 'player'
    })

    if (error && !error.message.includes('duplicate')) {
      setFormError('Fehler beim Beitreten: ' + error.message)
      setJoining(false)
      return false
    }

    setJoined(true)
    setJoining(false)
    return true
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { first_name: form.first_name, last_name: form.last_name, role: 'player' } }
    })

    if (error) {
      setFormError(error.message)
      setFormLoading(false)
      return
    }
    if (data.user) await joinTeam(data.user.id)
    setFormLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })

    if (error) {
      setFormError(error.message)
      setFormLoading(false)
      return
    }
    if (data.user) await joinTeam(data.user.id)
    setFormLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen hm-page flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div style={{ color: 'var(--muted)' }}>Einladung wird geladen...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen hm-page flex items-center justify-center px-4">
        <div className="hm-card max-w-lg p-8 text-center">
          <div className="text-5xl mb-4">❌</div>
          <div className="text-2xl font-black text-slate-900">{error}</div>
          <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-slate-700 hover:text-slate-900">
            Zur Anmeldung
          </Link>
        </div>
      </div>
    )
  }

  if (joined) {
    return (
      <div className="min-h-screen hm-page flex items-center justify-center px-4 py-10">
        <div className="hm-card w-full max-w-xl p-10 text-center">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-4xl font-black text-slate-900">Willkommen im Team</h1>
          <p className="mt-4 text-lg text-slate-600">
            Du bist jetzt Mitglied bei <strong className="text-slate-900">{team?.name}</strong>
          </p>
          <p className="mt-1 text-slate-500">{club?.name}</p>
          <a href="/dashboard/player" className="hm-btn-primary mt-8 inline-flex items-center justify-center">
            Zum Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen hm-page px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden lg:flex flex-col justify-between rounded-[32px] border border-slate-200 bg-white/75 p-10 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div>
            <HumatrixLogo size={52} showText={true} />
            <div className="mt-10 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Team-Einladung
            </div>
            <h1 className="mt-6 text-5xl font-black leading-[1.03] text-slate-900">
              Beitreten, Profil anlegen und direkt loslegen.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-500">
              Über diesen Link wirst du als Spieler dem Team hinzugefügt. Danach kannst du dein Profil vervollständigen und deine ersten Befragungen ausfüllen.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Einladung für</div>
            <div className="mt-3 text-3xl font-black text-slate-900">{team?.name}</div>
            <div className="mt-2 text-slate-500">{club?.name} · {team?.season}</div>
          </div>
        </div>

        <div className="hm-card p-8 md:p-10">
          <div className="lg:hidden mb-8">
            <HumatrixLogo size={48} showText={true} />
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Einladung</div>
            <h2 className="mt-3 text-3xl font-black text-slate-900">{team?.name}</h2>
            <div className="mt-2 text-slate-500">{club?.name} · {team?.season}</div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-[22px] bg-slate-100 p-1.5">
            <button
              onClick={() => setMode('register')}
              className="rounded-[18px] px-4 py-3 text-sm font-semibold transition"
              style={{
                background: mode === 'register' ? 'linear-gradient(180deg, #101938 0%, #0b1430 100%)' : 'transparent',
                color: mode === 'register' ? '#ffffff' : 'var(--muted)',
                boxShadow: mode === 'register' ? '0 12px 24px rgba(15,23,42,0.14)' : 'none'
              }}
            >
              Neu registrieren
            </button>
            <button
              onClick={() => setMode('login')}
              className="rounded-[18px] px-4 py-3 text-sm font-semibold transition"
              style={{
                background: mode === 'login' ? 'linear-gradient(180deg, #101938 0%, #0b1430 100%)' : 'transparent',
                color: mode === 'login' ? '#ffffff' : 'var(--muted)',
                boxShadow: mode === 'login' ? '0 12px 24px rgba(15,23,42,0.14)' : 'none'
              }}
            >
              Bereits registriert
            </button>
          </div>

          <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="hm-label">Vorname</label>
                  <input type="text" required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="hm-input" />
                </div>
                <div>
                  <label className="hm-label">Nachname</label>
                  <input type="text" required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="hm-input" />
                </div>
              </div>
            )}

            <div>
              <label className="hm-label">E-Mail</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="hm-input" />
            </div>

            <div>
              <label className="hm-label">Passwort</label>
              <input type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="hm-input" />
            </div>

            {formError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</div>}

            <button type="submit" disabled={formLoading || joining} className="hm-btn-primary w-full">
              {formLoading || joining ? 'Bitte warten…' : mode === 'register' ? 'Registrieren & Team beitreten' : 'Anmelden & Team beitreten'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
