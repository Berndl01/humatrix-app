'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SPORTTYP_TYPES, FAMILY_META, DIMENSION_META, ANCHOR_METRICS } from '@/lib/sporttyp-constants'
import { TYPE_FAMILY } from '@/lib/scoring/engine'

export default function TeamPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAnchorInfo, setShowAnchorInfo] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: memberships } = await supabase.from('team_memberships').select('team_id')
        .eq('user_id', user.id).eq('role_in_team', 'coach')
      if (!memberships?.length) return
      const teamIds = memberships.map((m: any) => m.team_id)
      const { data: playerMembers } = await supabase.from('team_memberships').select('user_id, team_id, profiles(*)')
        .in('team_id', teamIds).eq('role_in_team', 'player')
      if (!playerMembers) return

      const enriched = await Promise.all(playerMembers.map(async (pm: any) => {
        const p = pm.profiles; if (!p) return null
        const { data: types } = await supabase.from('type_results').select('*')
          .eq('user_id', p.id).order('created_at', { ascending: false }).limit(1)
        const { data: comparisons } = await supabase.from('assessment_comparisons').select('*')
          .eq('player_user_id', p.id).order('created_at', { ascending: false }).limit(1)
        const { data: feedback } = await supabase.from('coach_feedback').select('*')
          .eq('player_user_id', p.id).eq('coach_user_id', user.id).order('created_at', { ascending: false })
        return { profile: p, teamId: pm.team_id, latestType: types?.[0], comparison: comparisons?.[0], feedback: feedback || [] }
      }))
      setPlayers(enriched.filter(Boolean))
    } catch (err) { console.error("Load error:", err) }
    }
    load()
  }, [])

  // Team-DNA: count by family
  const famCounts: Record<string, {count: number, players: string[]}> = { str: {count:0,players:[]}, tfo: {count:0,players:[]}, per: {count:0,players:[]}, lea: {count:0,players:[]} }
  players.forEach(p => {
    if (!p.latestType) return
    const fam = TYPE_FAMILY[p.latestType.result_type]
    if (fam && famCounts[fam]) { famCounts[fam].count++; famCounts[fam].players.push(p.profile.first_name) }
  })

  async function sendFeedback() {
    if (!selected || !feedbackText.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('coach_feedback').insert({
      player_user_id: selected.profile.id, coach_user_id: user.id,
      team_id: selected.teamId, feedback_text: feedbackText.trim(),
      is_visible_to_player: feedbackVisible
    })
    setFeedbackText(''); setSaving(false); window.location.reload()
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
        Mannschafts-<span style={{ color: 'var(--cyan)' }}>Übersicht</span>
      </h1>

      {/* Team-DNA */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>Team-DNA · Typenverteilung</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {Object.entries(FAMILY_META).map(([k, fam]) => {
            const fc = famCounts[k]
            const pct = players.length ? Math.round((fc.count / players.length) * 100) : 0
            return (
              <div key={k} className="rounded-xl p-4 text-center" style={{ background: 'var(--navy3)', borderTop: `3px solid ${fam.color}` }}>
                <div className="text-2xl mb-1">{fam.icon}</div>
                <div className="text-2xl font-extrabold" style={{ fontFamily: 'Barlow Condensed', color: fam.color }}>{fc.count}</div>
                <div className="text-xs font-bold" style={{ color: fam.color }}>{fam.name}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{pct}%</div>
                {fc.players.length > 0 && <div className="text-xs mt-2" style={{ color: 'var(--text)' }}>{fc.players.join(', ')}</div>}
              </div>
            )
          })}
        </div>
        {/* Warnings */}
        {Object.entries(famCounts).map(([k, fc]) => {
          const fam = FAMILY_META[k as keyof typeof FAMILY_META]
          const pct = players.length ? fc.count / players.length : 0
          if (pct === 0 && players.length > 3) return (
            <div key={k+'-warn'} className="rounded-lg p-3 mb-2 text-sm" style={{ background: 'rgba(224,85,85,0.06)', border: '1px solid rgba(224,85,85,0.15)', color: 'var(--text)' }}>
              <span style={{ color: '#E05555' }}>⚠</span> Keine {fam.name} im Team: {fam.lack}
            </div>
          )
          if (pct > 0.5) return (
            <div key={k+'-warn'} className="rounded-lg p-3 mb-2 text-sm" style={{ background: 'rgba(200,146,42,0.06)', border: '1px solid rgba(200,146,42,0.15)', color: 'var(--text)' }}>
              <span style={{ color: '#C8922A' }}>⚠</span> Überrepräsentation {fam.name} ({Math.round(pct*100)}%): {fam.excess}
            </div>
          )
          return null
        })}
      </div>

      {/* 5 Anchor Metrics Info */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>5 Ankermetriken · Monatliches Monitoring</div>
        <div className="grid grid-cols-5 gap-2">
          {ANCHOR_METRICS.map(a => (
            <button key={a.key} onClick={() => setShowAnchorInfo(showAnchorInfo === a.key ? null : a.key)}
              className="rounded-lg p-3 text-center transition-all" style={{
                background: showAnchorInfo === a.key ? 'rgba(47,167,188,0.08)' : 'var(--navy3)',
                border: showAnchorInfo === a.key ? '1px solid rgba(47,167,188,0.3)' : '1px solid rgba(255,255,255,0.04)'
              }}>
              <div className="text-xl">{a.icon}</div>
              <div className="text-xs font-bold mt-1" style={{ color: 'var(--text)' }}>{a.label}</div>
            </button>
          ))}
        </div>
        {showAnchorInfo && (() => {
          const a = ANCHOR_METRICS.find(m => m.key === showAnchorInfo)!
          return (
            <div className="mt-4 rounded-lg p-4" style={{ background: 'var(--navy3)', border: '1px solid rgba(47,167,188,0.15)' }}>
              <div className="font-bold mb-2">{a.icon} {a.label}</div>
              <div className="text-sm mb-2" style={{ color: 'var(--text)' }}>{a.what}</div>
              <div className="text-xs mb-3" style={{ color: 'var(--muted)' }}>Basis: {a.basis}</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded p-2" style={{ background: 'rgba(61,186,111,0.08)', border: '1px solid rgba(61,186,111,0.2)' }}>
                  <div className="font-bold mb-1" style={{ color: '#3DBA6F' }}>🟢 6–7</div>{a.high}
                </div>
                <div className="rounded p-2" style={{ background: 'rgba(200,146,42,0.08)', border: '1px solid rgba(200,146,42,0.2)' }}>
                  <div className="font-bold mb-1" style={{ color: '#C8922A' }}>🟡 4–5</div>{a.mid}
                </div>
                <div className="rounded p-2" style={{ background: 'rgba(224,85,85,0.06)', border: '1px solid rgba(224,85,85,0.15)' }}>
                  <div className="font-bold mb-1" style={{ color: '#E05555' }}>🔴 1–3</div>{a.low}
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Player list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>Spieler ({players.length})</div>
          {players.map(p => {
            const ty = p.latestType ? SPORTTYP_TYPES[p.latestType.result_type] : null
            const isSelected = selected?.profile.id === p.profile.id
            return (
              <button key={p.profile.id} onClick={() => window.location.href = `/dashboard/players/${p.profile.id}`}
                className="w-full text-left rounded-xl p-4 flex items-center gap-3 transition-all" style={{
                  background: isSelected ? 'rgba(47,167,188,0.08)' : 'var(--navy2)',
                  border: isSelected ? '1px solid rgba(47,167,188,0.3)' : '1px solid rgba(255,255,255,0.06)'
                }}>
                <div className="text-xl">{ty?.emoji || '👤'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{p.profile.first_name} {p.profile.last_name}</div>
                  <div className="text-xs truncate" style={{ color: ty?.color || 'var(--muted)' }}>
                    {p.latestType ? `${p.latestType.result_label} (${p.latestType.result_type})` : 'Kein Test'}
                  </div>
                </div>
                {p.comparison && (
                  <div className="text-xs font-bold px-2 py-1 rounded" style={{
                    background: p.comparison.match_score >= 80 ? 'rgba(61,186,111,0.12)' : p.comparison.match_score >= 60 ? 'rgba(200,146,42,0.12)' : 'rgba(224,85,85,0.08)',
                    color: p.comparison.match_score >= 80 ? '#3DBA6F' : p.comparison.match_score >= 60 ? '#C8922A' : '#E05555'
                  }}>{p.comparison.match_score}%</div>
                )}
              </button>
            )
          })}
        </div>

        <div className="lg:col-span-2">
          {selected ? (() => {
            const ty = selected.latestType ? SPORTTYP_TYPES[selected.latestType.result_type] : null
            const fam = selected.latestType ? FAMILY_META[TYPE_FAMILY[selected.latestType.result_type] as keyof typeof FAMILY_META] : null
            return (
              <div>
                {/* Player header */}
                <div className="rounded-xl p-6 mb-4" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{ty?.emoji || '👤'}</div>
                    <div>
                      <h2 className="text-2xl font-extrabold" style={{ fontFamily: 'Barlow Condensed' }}>
                        {selected.profile.first_name} {selected.profile.last_name}
                      </h2>
                      {ty && <div className="text-sm font-bold" style={{ color: ty.color }}>{ty.name} · {selected.latestType.result_type}</div>}
                      {fam && <div className="text-xs" style={{ color: fam.color }}>{fam.icon} {fam.name}</div>}
                    </div>
                    <div className="ml-auto">
                      <a href={`/dashboard/rate?player=${selected.profile.id}`}
                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                        style={{ background: 'var(--gold)', color: 'var(--navy)' }}>→ Bewerten</a>
                    </div>
                  </div>

                  {/* Dimension scores */}
                  {selected.latestType?.scoring_json?.dimScores && (
                    <div className="space-y-3 mt-4">
                      {Object.entries(DIMENSION_META).map(([k, meta]) => {
                        const sc = selected.latestType.scoring_json.dimScores[k]
                        if (!sc) return null
                        return (
                          <div key={k}>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span style={{ color: meta.colorA }}>{meta.poleA}</span>
                              <span style={{ color: 'var(--muted)' }}>{meta.label}</span>
                              <span style={{ color: meta.colorB }}>{meta.poleB}</span>
                            </div>
                            <div className="relative h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div className="absolute h-full rounded-full" style={{ width: `${sc.pct}%`, background: sc.pct >= 50 ? meta.colorA : meta.colorB }} />
                              <div className="absolute top-0 left-1/2 w-0.5 h-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Alignment */}
                  {selected.comparison && (
                    <div className="mt-4 p-3 rounded-lg" style={{
                      background: selected.comparison.match_score >= 80 ? 'rgba(61,186,111,0.06)' : 'rgba(200,146,42,0.06)',
                      border: `1px solid ${selected.comparison.match_score >= 80 ? 'rgba(61,186,111,0.2)' : 'rgba(200,146,42,0.2)'}`
                    }}>
                      <div className="text-xs font-bold" style={{ color: selected.comparison.match_score >= 80 ? '#3DBA6F' : '#C8922A' }}>
                        Self-vs-Coach Alignment: {selected.comparison.match_score}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Coaching cards */}
                {ty && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl p-4" style={{ background: 'rgba(61,186,111,0.04)', border: '1px solid rgba(61,186,111,0.12)' }}>
                      <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#3DBA6F' }}>✓ So coachen</div>
                      {ty.coachDo.map((t: string, i: number) => (
                        <div key={i} className="text-xs mb-2 pl-3 relative" style={{ color: 'var(--text)' }}>
                          <span className="absolute left-0" style={{ color: '#3DBA6F' }}>→</span>{t}
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(224,85,85,0.03)', border: '1px solid rgba(224,85,85,0.1)' }}>
                      <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#E05555' }}>✕ Vermeiden</div>
                      {ty.coachDont.map((t: string, i: number) => (
                        <div key={i} className="text-xs mb-2 pl-3 relative" style={{ color: 'var(--text)' }}>
                          <span className="absolute left-0" style={{ color: '#E05555' }}>!</span>{t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
                    💬 Feedback an {selected.profile.first_name}
                  </div>
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

                {selected.feedback?.length > 0 && (
                  <div className="rounded-xl p-5" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Bisheriges Feedback</div>
                    {selected.feedback.map((fb: any) => (
                      <div key={fb.id} className="py-2 text-sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--text)' }}>
                        <span className="text-xs mr-2" style={{ color: fb.is_visible_to_player ? '#3DBA6F' : 'var(--muted)' }}>
                          {fb.is_visible_to_player ? '👁' : '🔒'}
                        </span>{fb.feedback_text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })() : (
            <div className="rounded-xl p-12 text-center" style={{ background: 'var(--navy2)' }}>
              <div className="text-4xl mb-4 opacity-30">👈</div>
              <div style={{ color: 'var(--muted)' }}>Wähle einen Spieler</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
