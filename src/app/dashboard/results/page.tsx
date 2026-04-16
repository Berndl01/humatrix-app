'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TypeResult, PlayerTypeDefinition } from '@/lib/types'
import { DIMENSION_META, FAMILY_META } from '@/lib/sporttyp-constants'
import { getFamily } from '@/services/scoring/calculate'

const CAT_LABELS: Record<string, string> = {
  drive: 'Antrieb', energy: 'Energie', mental: 'Mentalität', role: 'Rolle',
  // Legacy compatibility
  extraversion: 'Extraversion', vertraeglichkeit: 'Verträglichkeit',
  gewissenhaftigkeit: 'Gewissenhaftigkeit', offenheit: 'Offenheit',
  fuehrung: 'Führung', team: 'Teamorientierung',
  disziplin: 'Disziplin', autonomie: 'Autonomie', kommunikation: 'Kommunikation',
  kreativitaet: 'Kreativität'
}

export default function ResultsPage() {
  const [result, setResult] = useState<TypeResult | null>(null)
  const [typeDef, setTypeDef] = useState<PlayerTypeDefinition | null>(null)
  const [history, setHistory] = useState<TypeResult[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: results } = await supabase
        .from('type_results').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (results?.length) {
        setResult(results[0])
        setHistory(results)

        const { data: def } = await supabase
          .from('player_type_definitions').select('*')
          .eq('code', results[0].result_type)
          .single()
        if (def) setTypeDef(def)
      }
    } catch (err) { console.error("Load error:", err) }
    }
    load()
  }, [])

  if (!result) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-4 opacity-30">🧬</div>
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
          Noch keine Ergebnisse
        </h2>
        <p className="mb-6" style={{ color: 'var(--muted)' }}>
          Schließe zuerst den Selbsttest ab um deinen Spielertyp zu erfahren.
        </p>
        <a href="/dashboard/test" className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider inline-block"
          style={{ background: 'var(--cyan)', color: 'var(--navy)' }}>
          → Selbsttest starten
        </a>
      </div>
    )
  }

  const catScores = result.category_scores || {}
  const emoji = result.scoring_json?.emoji || '🧬'

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8" style={{ fontFamily: 'Barlow Condensed' }}>
        Meine <span style={{ color: 'var(--cyan)' }}>Ergebnisse</span>
      </h1>

      {/* Type Hero Card */}
      <div className="rounded-xl p-8 mb-8 text-center" style={{
        background: 'var(--navy2)',
        border: `2px solid ${typeDef?.color || 'var(--cyan)'}44`
      }}>
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-3xl font-extrabold mb-2" style={{
          fontFamily: 'Barlow Condensed', color: typeDef?.color || 'var(--cyan)'
        }}>
          {result.result_label}
        </h2>
        {typeDef && (
          <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text)' }}>
            {typeDef.description}
          </p>
        )}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(47,167,188,0.1)', border: '1px solid rgba(47,167,188,0.3)', color: 'var(--cyan)' }}>
          Konfidenz: {result.confidence_score?.toFixed(0)}%
        </div>

        <div className="mt-6 rounded-lg p-4 text-left max-w-lg mx-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Was bedeutet das?</div>
          <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
            <strong style={{ color: 'white' }}>{result.result_label}</strong> ist dein <strong style={{ color: 'white' }}>dominanter Spielertyp</strong> — deine stärkste Ausprägung.
            Das heißt nicht, dass du NUR so bist. Dein Profil zeigt Anteile auf allen 4 Dimensionen.
            Die Balken unten zeigen genau, wie stark jede Seite bei dir ausgeprägt ist.
            Jeder Mensch ist eine einzigartige Mischung — der Typ beschreibt deinen natürlichen Schwerpunkt.
          </div>
        </div>
      </div>

      {/* 4 Sporttyp-Dimensionen */}
      {result.scoring_json?.dimensions && (
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-6" style={{ color: 'var(--cyan)' }}>
            Dein Profil · 4 Dimensionen
          </div>
          {Object.entries(DIMENSION_META).map(([k, meta]) => {
            const sc = (result.scoring_json.dimensions as any)?.[k]
            if (!sc) return null
            return (
              <div key={k} className="mb-5">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span style={{ color: meta.colorA }}>{meta.poleA}</span>
                  <span style={{ color: 'var(--muted)' }}>{meta.label}</span>
                  <span style={{ color: meta.colorB }}>{meta.poleB}</span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="absolute h-full rounded-full transition-all" style={{
                    width: `${sc.pct}%`, background: sc.pct >= 50 ? meta.colorA : meta.colorB
                  }} />
                  <div className="absolute top-0 left-1/2 w-0.5 h-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                </div>
                <div className="text-center text-xs font-bold mt-1" style={{ color: sc.pct >= 50 ? meta.colorA : meta.colorB }}>
                  {sc.label} ({sc.pct}%)
                </div>
              </div>
            )
          })}
          <div className="text-xs mt-4 pt-3 text-center" style={{ color: 'var(--muted)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {(() => { const fam = FAMILY_META[getFamily(result.result_type) as keyof typeof FAMILY_META]; return fam ? `${fam.icon} Gruppe: ${fam.name} — ${fam.desc}` : '' })()}
          </div>
        </div>
      )}

      {/* Category Scores (Fallback) */}
      <div className="rounded-xl p-6 mb-8" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-xs font-bold uppercase tracking-wider mb-6" style={{ color: 'var(--cyan)' }}>
          Dein Profil nach Kategorien
        </div>
        <div className="space-y-3">
          {Object.entries(catScores)
            .filter(([k]) => k !== 'offen')
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([cat, score]: [string, any]) => (
              <div key={cat} className="flex items-center gap-4">
                <div className="text-sm w-36" style={{ color: 'var(--text)' }}>{CAT_LABELS[cat] || cat}</div>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${(score / 7) * 100}%`,
                    background: score >= 5 ? 'var(--green)' : score >= 3.5 ? 'var(--gold)' : 'var(--red)'
                  }} />
                </div>
                <div className="text-sm font-bold w-10 text-right">{score.toFixed(1)}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Coaching Tips */}
      {typeDef && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl p-5" style={{ background: 'rgba(61,186,111,0.05)', border: '1px solid rgba(61,186,111,0.15)' }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--green)' }}>
              ✓ Stärken & Coaching-Tipps
            </div>
            {typeDef.coaching_tips.map((tip, i) => (
              <div key={i} className="text-sm mb-3 pl-4 relative leading-relaxed" style={{ color: 'var(--text)' }}>
                <span className="absolute left-0" style={{ color: 'var(--green)' }}>→</span>{tip}
              </div>
            ))}
          </div>
          <div className="rounded-xl p-5" style={{ background: 'rgba(224,85,85,0.04)', border: '1px solid rgba(224,85,85,0.12)' }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--red)' }}>
              ⚠ Warnsignale
            </div>
            {typeDef.warning_signs.map((sign, i) => (
              <div key={i} className="text-sm mb-3 pl-4 relative leading-relaxed" style={{ color: 'var(--text)' }}>
                <span className="absolute left-0" style={{ color: 'var(--red)' }}>!</span>{sign}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test History */}
      {history.length > 1 && (
        <div className="rounded-xl p-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cyan)' }}>
            Verlauf
          </div>
          {history.map((h, i) => (
            <div key={h.id} className="flex items-center gap-4 py-3" style={{ borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div className="text-xl">{h.scoring_json?.emoji || '🧬'}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{h.result_label}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  {new Date(h.created_at).toLocaleDateString('de-AT')}
                </div>
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--cyan)' }}>
                {h.confidence_score?.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
