'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HumatrixLogo } from '@/components/HumatrixLogo'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    })

    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen hm-page flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg hm-card p-8 md:p-10">
        <HumatrixLogo size={46} showText={true} />
        <div className="mt-8">
          <h1 className="text-3xl font-black text-slate-900">Passwort zurücksetzen</h1>
          <p className="mt-3 text-slate-500">Wir senden dir einen Link an deine E-Mail-Adresse.</p>
        </div>

        {success ? (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
            Der Link wurde versendet. Prüfe jetzt dein Postfach.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="hm-label">E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="hm-input" placeholder="name@verein.at" />
            </div>

            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            <button type="submit" disabled={loading} className="hm-btn-primary w-full">
              {loading ? 'Sende Link…' : 'Link senden'}
            </button>
          </form>
        )}

        <div className="mt-6 text-sm text-slate-500">
          <Link href="/login" className="hover:text-slate-900">← Zurück zum Login</Link>
        </div>
      </div>
    </div>
  )
}
