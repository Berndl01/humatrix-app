'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SPORTTYP_TYPES } from '@/lib/sporttyp-constants'
import { getFamily } from '@/services/scoring/calculate'
import { FAMILIES } from '@/services/scoring/types'
import Link from 'next/link'

export default function PlayerDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [latestType, setLatestType] = useState<any>(null)
  const [feedback, setFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        if (!supabase) { setLoading(false); return }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (prof) setProfile(prof)
        else {
          const meta = user.user_metadata || {}
          setProfile({ first_name: meta.first_name || '', last_name: meta.last_name || '' })
        }

        const { data: types } = await supabase.from('type_results').select('*')
          .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
        if (types?.length) setLatestType(types[0])

        const { data: fb } = await supabase.from('coach_feedback').select('*')
          .eq('player_user_id', user.id).eq('is_visible_to_player', true)
          .order('created_at', { ascending: false }).limit(5)
        if (fb) setFeedback(fb)
      } catch (e) { console.error('Dashboard load error:', e) }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-center py-20 fade-in">
      <div className="flex justify-center gap-1 mb-6">
        <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: 'var(--cyan)', animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: 'var(--cyan)', animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: 'var(--cyan)', animationDelay: '0.4s' }} />
      </div>
      <div className="text-sm" style={{ color: 'var(--muted)' }}>Wird geladen...</div>
    </div>

  const ty = latestType ? SPORTTYP_TYPES[latestType.result_type] : null
  const fam = latestType ? FAMILIES[getFamily(latestType.result_type)] : null
  const firstName = profile?.first_name || 'Spieler'

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: 'Barlow Condensed' }}>
          Hallo, <span style={{ color: 'var(--cyan)' }}>{firstName}</span>
        </h1>
        <p style={{ color: 'var(--muted)' }}>Dein persönliches Humatrix Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Typ-Karte */}
        <div className="card p-6 text-center glow-cyan" style={{ borderColor: ty ? `${ty.color}44` : 'rgba(47,167,188,0.15)' }}>
          {ty ? (
            <>
              <div className="text-5xl mb-3">{ty.emoji}</div>
              <div className="text-xl font-extrabold" style={{ fontFamily: 'Barlow Condensed', color: ty.color }}>{ty.name}</div>
              <div className="text-xs mt-1" style={{ color: fam?.color }}>{fam?.icon} {fam?.name}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{latestType.result_type} · Konfidenz {latestType.confidence_score}%</div>
              <Link href="/dashboard/results" className="inline-block mt-4 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                style={{ background: 'rgba(47,167,188,0.12)', color: 'var(--cyan)', border: '1px solid rgba(47,167,188,0.3)' }}>
                → Details ansehen
              </Link>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3 opacity-30">❓</div>
              <div className="font-bold mb-1">Noch kein Typ ermittelt</div>
              <Link href="/dashboard/test" className="inline-block mt-3 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                style={{ background: 'var(--cyan)', color: 'var(--navy)' }}>
                → Selbsttest starten
              </Link>
            </>
          )}
        </div>

        {/* Selbsttest Status */}
        <div className="card p-6">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--cyan)' }}>Selbsttest</div>
          {latestType ? (
            <div>
              <div className="text-2xl mb-2">✅</div>
              <div className="font-bold">Abgeschlossen</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                {new Date(latestType.created_at).toLocaleDateString('de-AT')}
              </div>
              <Link href="/dashboard/test" className="text-xs mt-3 inline-block" style={{ color: 'var(--cyan)' }}>Erneut machen →</Link>
            </div>
          ) : (
            <div>
              <div className="text-2xl mb-2">⏳</div>
              <div className="font-bold">Noch offen</div>
              <Link href="/dashboard/test" className="text-xs mt-2 inline-block" style={{ color: 'var(--cyan)' }}>Jetzt starten →</Link>
            </div>
          )}
        </div>

        {/* Trainer-Feedback */}
        <div className="card p-6">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>Trainer-Feedback</div>
          <div className="text-2xl mb-2">{feedback.length > 0 ? '💬' : '📭'}</div>
          <div className="font-bold">{feedback.length > 0 ? `${feedback.length} Rückmeldung${feedback.length > 1 ? 'en' : ''}` : 'Noch keine Rückmeldungen'}</div>
          {feedback.length > 0 && (
            <Link href="/dashboard/feedback" className="text-xs mt-2 inline-block" style={{ color: 'var(--gold)' }}>Ansehen →</Link>
          )}
        </div>
      </div>

      {/* Typ-Erklärung wenn vorhanden */}
      {ty && (
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: ty.color }}>
            {ty.emoji} Dein Typ: {ty.name}
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text)' }}>{ty.desc}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-flat p-4" style={{ borderColor: 'rgba(61,186,111,0.15)' }}>
              <div className="text-xs font-bold uppercase mb-2" style={{ color: '#3DBA6F' }}>✓ Deine Stärken</div>
              {ty.strengths?.map((s: string, i: number) => (
                <div key={i} className="text-sm mb-1 pl-3 relative" style={{ color: 'var(--text)' }}>
                  <span className="absolute left-0" style={{ color: '#3DBA6F' }}>→</span>{s}
                </div>
              ))}
            </div>
            <div className="card-flat p-4" style={{ borderColor: 'rgba(224,85,85,0.12)' }}>
              <div className="text-xs font-bold uppercase mb-2" style={{ color: '#E05555' }}>⚠ Risiken</div>
              {ty.risks?.map((r: string, i: number) => (
                <div key={i} className="text-sm mb-1 pl-3 relative" style={{ color: 'var(--text)' }}>
                  <span className="absolute left-0" style={{ color: '#E05555' }}>!</span>{r}
                </div>
              ))}
            </div>
          </div>
          {ty.selfDev?.length > 0 && (
            <div className="mt-4 rounded-lg p-4" style={{ background: 'rgba(47,167,188,0.04)', border: '1px solid rgba(47,167,188,0.12)' }}>
              <div className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--cyan)' }}>📋 Daran arbeiten</div>
              {ty.selfDev.map((s: string, i: number) => (
                <div key={i} className="text-sm mb-1 pl-3 relative" style={{ color: 'var(--text)' }}>
                  <span className="absolute left-0" style={{ color: 'var(--cyan)' }}>•</span>{s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Letzte Feedbacks */}
      {feedback.length > 0 && (
        <div className="card p-6">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>Aktuelle Rückmeldungen</div>
          {feedback.slice(0, 3).map(fb => (
            <div key={fb.id} className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{fb.feedback_text}</div>
              <div className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                {new Date(fb.created_at).toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
