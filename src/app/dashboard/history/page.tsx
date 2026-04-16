'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SPORTTYP_TYPES, DIMENSION_META, FAMILY_META } from '@/lib/sporttyp-constants'
import { getFamily } from '@/services/scoring/calculate'

export default function HistoryPage() {
  const [results, setResults] = useState<any[]>([])
  const [batteries, setBatteries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const MONTH_NAMES = ['', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']
  const ANCHOR_KEYS = ['anchor_satisfaction', 'anchor_psych_safety', 'anchor_commitment', 'anchor_alignment', 'anchor_motivation']
  const ANCHOR_LABELS = ['Zufriedenheit', 'Psych. Sicherheit', 'Bindung', 'Alignment', 'Motivation']

  useEffect(() => {
    async function load() {
      try {
        if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: types } = await supabase.from('type_results').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false })
      if (types) setResults(types)
      const { data: bat } = await supabase.from('battery_responses').select('*')
        .eq('user_id', user.id).order('season_month')
      if (bat) setBatteries(bat)
      setLoading(false)
    } catch (err) { console.error(err) }
    }
    load()
  }, [])

  if (loading) return <div style={{ color: 'var(--muted)' }}>Lade Historie...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
        Test-<span style={{ color: 'var(--cyan)' }}>Historie</span>
      </h1>
      <p className="mb-8" style={{ color: 'var(--muted)' }}>Alle bisherigen Tests und Befragungen im Überblick.</p>

      {/* Type Results */}
      <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>🧬 Sporttyp-Tests</div>
      {results.length === 0 ? (
        <div className="rounded-xl p-8 text-center mb-8" style={{ background: 'var(--navy2)', color: 'var(--muted)' }}>
          Noch keine Sporttyp-Tests abgeschlossen.
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {results.map((r, idx) => {
            const ty = SPORTTYP_TYPES[r.result_type]
            const fam = FAMILY_META[getFamily(r.result_type) as keyof typeof FAMILY_META]
            const isLatest = idx === 0
            const source = r.scoring_json?.source === 'coach' ? 'Trainerbewertung' : 'Selbsttest'
            return (
              <div key={r.id} className="rounded-xl p-5 flex items-center gap-4" style={{
                background: 'var(--navy2)',
                border: isLatest ? `2px solid ${ty?.color || 'var(--cyan)'}44` : '1px solid rgba(255,255,255,0.06)'
              }}>
                <div className="text-3xl">{ty?.emoji || '🧬'}</div>
                <div className="flex-1">
                  <div className="font-bold">{ty?.name || r.result_type}
                    <span className="text-xs font-normal ml-2" style={{ color: 'var(--muted)' }}>{r.result_type}</span>
                  </div>
                  <div className="text-xs" style={{ color: fam?.color || 'var(--muted)' }}>
                    {fam?.icon} {fam?.name} · {source}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {new Date(r.created_at).toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold" style={{ fontFamily: 'Barlow Condensed', color: 'var(--cyan)' }}>
                    {r.confidence_score?.toFixed(0) || '–'}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>Konfidenz</div>
                </div>
                {isLatest && <span className="text-xs font-bold px-2 py-1 rounded-full" style={{
                  background: 'rgba(47,167,188,0.12)', color: 'var(--cyan)', border: '1px solid rgba(47,167,188,0.3)'
                }}>Aktuell</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Battery Responses */}
      <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>📋 Monatsbefragungen</div>
      {batteries.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--navy2)', color: 'var(--muted)' }}>
          Noch keine Monatsbefragungen abgeschlossen.
        </div>
      ) : (
        <div className="rounded-xl p-5" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 450 }}>
              <thead>
                <tr>
                  <th className="text-left text-xs pb-3" style={{ color: 'var(--muted)' }}>Monat</th>
                  <th className="text-center text-xs pb-3" style={{ color: 'var(--muted)' }}>Bat.</th>
                  {ANCHOR_LABELS.map(l => <th key={l} className="text-center text-xs pb-3" style={{ color: 'var(--muted)' }}>{l.substring(0, 5)}.</th>)}
                </tr>
              </thead>
              <tbody>
                {batteries.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2 font-bold">{MONTH_NAMES[b.season_month]}</td>
                    <td className="text-center py-2 text-xs font-bold">{b.battery}</td>
                    {ANCHOR_KEYS.map(k => {
                      const v = b[k]
                      return <td key={k} className="text-center py-2 font-bold" style={{
                        color: v >= 6 ? '#3DBA6F' : v >= 4 ? '#C8922A' : v ? '#E05555' : 'var(--muted)'
                      }}>{v?.toFixed(1) || '–'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
