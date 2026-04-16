'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HumatrixLogo } from '@/components/HumatrixLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message === 'Invalid login credentials' ? 'E-Mail oder Passwort ist falsch.' : authError.message)
        setLoading(false)
        return
      }
      if (!data.user) {
        setError('Login fehlgeschlagen')
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Ein Fehler ist aufgetreten')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen hm-page flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:flex flex-col justify-between rounded-[32px] border border-slate-200/80 bg-white/75 p-10 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div>
            <HumatrixLogo size={52} showText={true} />
            <div className="mt-12 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Player & Coach Analytics
            </div>
            <h1 className="mt-6 max-w-xl text-5xl font-black leading-[1.02] text-slate-900">
              Die moderne Plattform für Spieler, Trainer und Teamsteuerung.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
              Klare Dashboards, persönliche Profile, Befragungen und Auswertungen in einer ruhigen, hochwertigen Oberfläche.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              ['Profile', 'Spieler & Trainer'],
              ['Feedback', 'sichtbar und strukturiert'],
              ['Trends', 'schnell erfassbar'],
            ].map(([title, subtitle]) => (
              <div key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                <div className="text-2xl font-black text-slate-900">{title}</div>
                <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hm-card p-8 md:p-10">
          <div className="lg:hidden mb-8">
            <HumatrixLogo size={48} showText={true} />
          </div>

          <div className="mb-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Anmeldung
            </div>
            <h2 className="mt-5 text-4xl font-black text-slate-900">Willkommen zurück</h2>
            <p className="mt-3 text-base text-slate-500">
              Melde dich an, um dein Dashboard, dein Profil und deine Teamdaten zu öffnen.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="hm-label">E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="hm-input" placeholder="name@verein.at" />
            </div>
            <div>
              <label className="hm-label">Passwort</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="hm-input" placeholder="••••••••" />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="hm-btn-primary w-full">
              {loading ? 'Wird geladen…' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <Link href="/reset-password" className="hover:text-slate-900">Passwort vergessen?</Link>
            <Link href="/register" className="hover:text-slate-900">Noch kein Konto? <span className="font-semibold text-slate-900">Jetzt registrieren</span></Link>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-400">
            <Link href="/legal" className="hover:text-slate-700">Impressum & Datenschutz</Link>
            <span className="mx-2">·</span>
            © Humatrix by Bernhard Lampl
          </div>
        </div>
      </div>
    </div>
  )
}
