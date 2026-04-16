'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { HumatrixLogo } from '@/components/HumatrixLogo'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'player' | 'coach'>('player')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, role }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen hm-page px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="hm-card p-8 md:p-10">
          <HumatrixLogo size={48} showText={true} />

          <div className="mt-8 mb-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Registrierung
            </div>
            <h1 className="mt-5 text-4xl font-black text-slate-900">Konto erstellen</h1>
            <p className="mt-3 text-base text-slate-500">
              Registriere dich als Spieler oder Trainer und starte direkt in dein persönliches Humatrix-Dashboard.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 rounded-[22px] bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => setRole('player')}
              className="rounded-[18px] px-4 py-3 text-sm font-semibold transition"
              style={{
                background: role === 'player' ? 'linear-gradient(180deg, #101938 0%, #0b1430 100%)' : 'transparent',
                color: role === 'player' ? '#ffffff' : 'var(--muted)',
                boxShadow: role === 'player' ? '0 12px 24px rgba(15,23,42,0.14)' : 'none'
              }}
            >
              Spieler
            </button>
            <button
              type="button"
              onClick={() => setRole('coach')}
              className="rounded-[18px] px-4 py-3 text-sm font-semibold transition"
              style={{
                background: role === 'coach' ? 'linear-gradient(180deg, #101938 0%, #0b1430 100%)' : 'transparent',
                color: role === 'coach' ? '#ffffff' : 'var(--muted)',
                boxShadow: role === 'coach' ? '0 12px 24px rgba(15,23,42,0.14)' : 'none'
              }}
            >
              Trainer
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="hm-label">Vorname</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="hm-input" placeholder="Max" />
              </div>
              <div>
                <label className="hm-label">Nachname</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="hm-input" placeholder="Muster" />
              </div>
            </div>

            <div>
              <label className="hm-label">E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="hm-input" placeholder="max@verein.at" />
            </div>

            <div>
              <label className="hm-label">Passwort</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="hm-input" placeholder="Mindestens 6 Zeichen" />
            </div>

            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            <button type="submit" disabled={loading} className="hm-btn-primary w-full">
              {loading ? 'Konto wird erstellt…' : 'Konto erstellen'}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-slate-900">
              Bereits registriert? <span className="font-semibold text-slate-900">Anmelden</span>
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex flex-col justify-between rounded-[32px] border border-slate-200/90 bg-white/70 p-10 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Premium Experience
            </div>
            <h2 className="mt-6 text-5xl font-black leading-[1.03] text-slate-900">
              Ruhiges, helles Design mit klarer Struktur für Spieler und Trainer.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-500">
              Die Oberfläche orientiert sich an einer modernen Club- und Dashboard-Ästhetik: helle Flächen, weiche Cards, starke Typografie und klare Aktionspunkte.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Profile', 'Spieler & Coach'],
              ['Befragung', 'sauber geführt'],
              ['Verwaltung', 'klar aufgebaut'],
            ].map(([title, subtitle]) => (
              <div key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-2xl font-black text-slate-900">{title}</div>
                <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
