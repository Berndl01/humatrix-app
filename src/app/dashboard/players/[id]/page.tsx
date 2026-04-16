'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SPORTTYP_TYPES, DIMENSION_META, FAMILY_META, ANCHOR_METRICS } from '@/lib/sporttyp-constants'
import { getFamily as getFamilyKey } from '@/services/scoring/calculate'

export default function PlayerDetailPage() {
  const params = useParams()
  const playerId = params.id as string
  const [player, setPlayer] = useState<any>(null)
  const [playerProfile, setPlayerProfile] = useState<any>(null)
  const [selfType, setSelfType] = useState<any>(null)
  const [coachType, setCoachType] = useState<any>(null)
  const [comparison, setComparison] = useState<any>(null)
  const [feedback, setFeedback] = useState<any[]>([])
  const [batteries, setBatteries] = useState<any[]>([])
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
      if (!playerId) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Auth check: is current user coach of player's team?
      const { data: coachTeams } = await supabase.from('team_memberships').select('team_id')
        .eq('user_id', user.id).eq('role_in_team', 'coach')
      if (!coachTeams?.length) return
      const teamIds = coachTeams.map((t: any) => t.team_id)
      const { data: playerTeam } = await supabase.from('team_memberships').select('team_id')
        .eq('user_id', playerId).in('team_id', teamIds).limit(1)
      if (!playerTeam?.length) return
      setAuthorized(true)

      // Load player profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', playerId).single()
      if (prof) setPlayer(prof)
      const { data: pp } = await supabase.from('player_profiles').select('*').eq('user_id', playerId).limit(1)
      if (pp?.length) setPlayerProfile(pp[0])

      // Load type results (self + coach)
      const { data: types } = await supabase.from('type_results').select('*')
        .eq('user_id', playerId).order('created_at', { ascending: false })
      if (types) {
        const self = types.find((t: any) => t.scoring_json?.source === 'self')
        const coach = types.find((t: any) => t.scoring_json?.source === 'coach')
        if (self) setSelfType(self)
        if (coach) setCoachType(coach)
      }

      // Load comparison
      const { data: comp } = await supabase.from('assessment_comparisons').select('*')
        .eq('player_user_id', playerId).order('created_at', { ascending: false }).limit(1)
      if (comp?.length) setComparison(comp[0])

      // Load feedback
      const { data: fb } = await supabase.from('coach_feedback').select('*')
        .eq('player_user_id', playerId).eq('coach_user_id', user.id)
        .order('created_at', { ascending: false })
      if (fb) setFeedback(fb)

      // Load battery responses
      const { data: bat } = await supabase.from('battery_responses').select('*')
        .eq('user_id', playerId).order('season_month')
      if (bat) setBatteries(bat)
    } catch (err) { console.error("Load error:", err) }
    }
    load()
  }, [playerId])

  async function sendFeedback() {
    if (!feedbackText.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: mem } = await supabase.from('team_memberships').select('team_id')
      .eq('user_id', playerId).limit(1)
    await supabase.from('coach_feedback').insert({
      player_user_id: playerId, coach_user_id: user.id,
      team_id: mem?.[0]?.team_id || null,
      feedback_text: feedbackText.trim(), is_visible_to_player: feedbackVisible
    })
    setFeedbackText('')
    setSaving(false)
    window.location.reload()
  }

  if (!authorized) return <div className="text-center py-20" style={{ color: 'var(--muted)' }}>Keine Berechtigung oder Spieler nicht gefunden.</div>
  if (!player) return <div className="text-center py-20" style={{ color: 'var(--muted)' }}>Lade Spieler...</div>

  const selfTy = selfType ? SPORTTYP_TYPES[selfType.result_type] : null
  const coachTy = coachType ? SPORTTYP_TYPES[coachType.result_type] : null
  const selfFam = selfType ? FAMILY_META[getFamilyKey(selfType.result_type) as keyof typeof FAMILY_META] : null
  const MONTH_NAMES = ['', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']
  const ANCHOR_KEYS = ['anchor_satisfaction', 'anchor_psych_safety', 'anchor_commitment', 'anchor_alignment', 'anchor_motivation']

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <a href="/dashboard/team" className="text-sm mb-6 inline-block" style={{ color: 'var(--muted)' }}>← Zurück zur Mannschaft</a>

      {/* Header */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="text-5xl">{selfTy?.emoji || '👤'}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold" style={{ fontFamily: 'Barlow Condensed' }}>
              {player.first_name} {player.last_name}
            </h1>
            {selfTy && <div className="text-lg font-bold mt-1" style={{ color: selfTy.color }}>{selfTy.name} · {selfType.result_type}</div>}
            {selfFam && <div className="text-sm" style={{ color: selfFam.color }}>{selfFam.icon} {selfFam.name}</div>}
          </div>
          <div className="flex gap-2">
            <a href={`/dashboard/rate?player=${playerId}`}
              className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
              style={{ background: 'var(--gold)', color: 'var(--navy)' }}>→ Bewerten</a>
          </div>
        </div>

        {/* Stammdaten */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>Position</div><div className="font-bold">{playerProfile?.position || '–'}</div></div>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>Rückennummer</div><div className="font-bold">#{playerProfile?.jersey_number || '–'}</div></div>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>Starker Fuß</div><div className="font-bold">{playerProfile?.preferred_foot || '–'}</div></div>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>Geburtsdatum</div><div className="font-bold">{playerProfile?.birth_date ? new Date(playerProfile.birth_date).toLocaleDateString('de-AT') : '–'}</div></div>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>Größe</div><div className="font-bold">{playerProfile?.height_cm ? `${playerProfile.height_cm} cm` : '–'}</div></div>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>Gewicht</div><div className="font-bold">{playerProfile?.weight_kg ? `${playerProfile.weight_kg} kg` : '–'}</div></div>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>Bisherige Vereine</div><div className="font-bold text-sm truncate">{playerProfile?.previous_clubs || '–'}</div></div>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>E-Mail</div><div className="font-bold text-sm truncate">{player.email}</div></div>
        </div>
      </div>

      {/* Dimension Profile */}
      {selfType?.scoring_json?.dimensions && (
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--cyan)' }}>Sporttyp-Profil (Selbsttest)</div>
          {Object.entries(DIMENSION_META).map(([k, meta]) => {
            const sc = selfType.scoring_json.dimensions[k]
            if (!sc) return null
            return (
              <div key={k} className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span style={{ color: meta.colorA }}>{meta.poleA}</span>
                  <span style={{ color: 'var(--muted)' }}>{meta.label}</span>
                  <span style={{ color: meta.colorB }}>{meta.poleB}</span>
                </div>
                <div className="relative h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="absolute h-full rounded-full transition-all" style={{ width: `${sc.pct}%`, background: sc.pct >= 50 ? meta.colorA : meta.colorB }} />
                  <div className="absolute top-0 left-1/2 w-0.5 h-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                </div>
                <div className="text-center text-xs font-bold mt-1" style={{ color: sc.pct >= 50 ? meta.colorA : meta.colorB }}>
                  {sc.label} ({sc.pct}%)
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ SELF vs COACH COMPARISON ═══ */}
      {comparison && selfType?.scoring_json?.dimensions && coachType?.scoring_json?.dimensions && (
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: `2px solid ${comparison.match_score >= 80 ? 'rgba(61,186,111,0.3)' : comparison.match_score >= 60 ? 'rgba(200,146,42,0.3)' : 'rgba(224,85,85,0.3)'}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>Self vs. Coach Vergleich</div>
            <div className="text-2xl font-extrabold" style={{
              fontFamily: 'Barlow Condensed',
              color: comparison.match_score >= 80 ? '#3DBA6F' : comparison.match_score >= 60 ? '#C8922A' : '#E05555'
            }}>{comparison.match_score}%</div>
          </div>

          {/* Type comparison */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(47,167,188,0.06)', border: '1px solid rgba(47,167,188,0.15)' }}>
              <div className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--cyan)' }}>Selbstbild</div>
              <div className="text-2xl mb-1">{selfTy?.emoji}</div>
              <div className="font-bold text-sm" style={{ color: selfTy?.color }}>{selfTy?.name}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{selfType.result_type}</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(200,146,42,0.06)', border: '1px solid rgba(200,146,42,0.15)' }}>
              <div className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--gold)' }}>Fremdbild</div>
              <div className="text-2xl mb-1">{coachTy?.emoji}</div>
              <div className="font-bold text-sm" style={{ color: coachTy?.color }}>{coachTy?.name}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{coachType.result_type}</div>
            </div>
          </div>

          {/* Dimension-by-dimension comparison bars */}
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Vergleich pro Dimension</div>
          {Object.entries(DIMENSION_META).map(([k, meta]) => {
            const selfDim = selfType.scoring_json.dimensions[k]
            const coachDim = coachType.scoring_json.dimensions[k]
            if (!selfDim || !coachDim) return null
            const diff = Math.abs(selfDim.pct - coachDim.pct)
            const severity = diff > 35 ? 'gap' : diff > 20 ? 'attention' : 'match'
            const sevColor = severity === 'gap' ? '#E05555' : severity === 'attention' ? '#C8922A' : '#3DBA6F'

            return (
              <div key={k} className="mb-4 rounded-lg p-3" style={{ background: `${sevColor}06`, border: `1px solid ${sevColor}20` }}>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>{meta.icon} {meta.label}</span>
                  <span style={{ color: sevColor }}>Δ {diff}%{severity === 'gap' ? ' ⚠' : severity === 'attention' ? ' ●' : ' ✓'}</span>
                </div>
                {/* Self bar */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs w-14" style={{ color: 'var(--cyan)' }}>Self</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${selfDim.pct}%`, background: 'var(--cyan)' }} />
                  </div>
                  <span className="text-xs w-16 text-right font-bold">{selfDim.label} {selfDim.pct}%</span>
                </div>
                {/* Coach bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-14" style={{ color: 'var(--gold)' }}>Coach</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${coachDim.pct}%`, background: 'var(--gold)' }} />
                  </div>
                  <span className="text-xs w-16 text-right font-bold">{coachDim.label} {coachDim.pct}%</span>
                </div>
              </div>
            )
          })}

          {/* Summary */}
          {comparison.differences_json?.summary && (
            <div className="rounded-lg p-3 mt-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--muted)' }}>Einschätzung</div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{comparison.differences_json.summary}</div>
            </div>
          )}
        </div>
      )}

      {/* Coaching Cards */}
      {selfTy && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ background: 'rgba(61,186,111,0.04)', border: '1px solid rgba(61,186,111,0.12)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#3DBA6F' }}>✓ So coachen</div>
            {selfTy.coachDo.map((t: string, i: number) => (
              <div key={i} className="text-sm mb-2 pl-4 relative leading-relaxed" style={{ color: 'var(--text)' }}>
                <span className="absolute left-0" style={{ color: '#3DBA6F' }}>→</span>{t}
              </div>
            ))}
          </div>
          <div className="rounded-xl p-5" style={{ background: 'rgba(224,85,85,0.03)', border: '1px solid rgba(224,85,85,0.1)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#E05555' }}>✕ Vermeiden</div>
            {selfTy.coachDont.map((t: string, i: number) => (
              <div key={i} className="text-sm mb-2 pl-4 relative leading-relaxed" style={{ color: 'var(--text)' }}>
                <span className="absolute left-0" style={{ color: '#E05555' }}>!</span>{t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anchor Trend */}
      {batteries.length > 0 && (
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>📈 Ankerwerte im Verlauf</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 400 }}>
              <thead>
                <tr>
                  <th className="text-left text-xs pb-2" style={{ color: 'var(--muted)' }}>Monat</th>
                  {ANCHOR_METRICS.map(a => <th key={a.key} className="text-center text-xs pb-2" style={{ color: 'var(--muted)' }}>{a.icon}</th>)}
                  <th className="text-center text-xs pb-2" style={{ color: 'var(--muted)' }}>Risiko</th>
                </tr>
              </thead>
              <tbody>
                {batteries.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2 font-bold">{MONTH_NAMES[b.season_month]} <span className="text-xs font-normal" style={{ color: 'var(--muted)' }}>{b.battery}</span></td>
                    {ANCHOR_KEYS.map(k => {
                      const v = b[k]
                      const col = v >= 6 ? '#3DBA6F' : v >= 4 ? '#C8922A' : v ? '#E05555' : 'var(--muted)'
                      return <td key={k} className="text-center py-2 font-bold" style={{ color: col }}>{v?.toFixed(1) || '–'}</td>
                    })}
                    <td className="text-center py-2 text-xs font-bold" style={{
                      color: b.turnover_risk === 'low' ? '#3DBA6F' : b.turnover_risk === 'mid' ? '#C8922A' : '#E05555'
                    }}>{b.turnover_risk === 'low' ? '🟢' : b.turnover_risk === 'mid' ? '🟡' : '🔴'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>💬 Feedback an {player.first_name}</div>
        <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Dein Feedback..." rows={3}
          className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none resize-y mb-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={feedbackVisible} onChange={e => setFeedbackVisible(e.target.checked)} className="w-4 h-4" />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Für Spieler sichtbar</span>
          </label>
          <button onClick={sendFeedback} disabled={saving || !feedbackText.trim()}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-40"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}>{saving ? '...' : '→ Senden'}</button>
        </div>
      </div>

      {/* Feedback History */}
      {feedback.length > 0 && (
        <div className="rounded-xl p-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Bisheriges Feedback ({feedback.length})</div>
          {feedback.map((fb: any) => (
            <div key={fb.id} className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs" style={{ color: fb.is_visible_to_player ? '#3DBA6F' : 'var(--muted)' }}>
                  {fb.is_visible_to_player ? '👁 Sichtbar' : '🔒 Intern'}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>· {new Date(fb.created_at).toLocaleDateString('de-AT')}</span>
              </div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{fb.feedback_text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
