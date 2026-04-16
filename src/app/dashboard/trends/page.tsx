'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ANCHOR_METRICS } from '@/lib/sporttyp-constants'

const MONTH_NAMES = ['', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']
const ANCHOR_KEYS = ['anchor_satisfaction', 'anchor_psych_safety', 'anchor_commitment', 'anchor_alignment', 'anchor_motivation']
const ANCHOR_COLORS = ['#3DBA6F', '#2FA7BC', '#E05555', '#C8922A', '#A78BFA']

function scoreColor(v: number | null): string {
  if (v === null) return 'var(--muted)'
  if (v >= 6) return '#3DBA6F'
  if (v >= 4) return '#C8922A'
  return '#E05555'
}

function riskBadge(risk: string | null) {
  if (risk === 'low') return { bg: 'rgba(61,186,111,0.12)', border: 'rgba(61,186,111,0.3)', color: '#3DBA6F', text: '🟢 Gering' }
  if (risk === 'mid') return { bg: 'rgba(200,146,42,0.12)', border: 'rgba(200,146,42,0.3)', color: '#C8922A', text: '🟡 Mittel' }
  return { bg: 'rgba(224,85,85,0.08)', border: 'rgba(224,85,85,0.2)', color: '#E05555', text: '🔴 Hoch' }
}

export default function TrendsPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [batteries, setBatteries] = useState<any[]>([])
  const [teamAvg, setTeamAvg] = useState<any[]>([])
  const [showInfo, setShowInfo] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: myTeams } = await supabase.from('team_memberships').select('team_id')
        .eq('user_id', user.id).eq('role_in_team', 'coach')
      if (!myTeams?.length) return
      const teamIds = myTeams.map((t: any) => t.team_id)

      // Get all players
      const { data: members } = await supabase.from('team_memberships').select('user_id, profiles(id, first_name, last_name)')
        .in('team_id', teamIds).eq('role_in_team', 'player')
      if (members) setPlayers(members.map((m: any) => m.profiles).filter(Boolean))

      // Get ALL battery responses for this team
      const { data: allBatteries } = await supabase.from('battery_responses').select('*')
        .in('team_id', teamIds).order('season_month')
      if (allBatteries) {
        setBatteries(allBatteries)

        // Calculate team averages per month
        const byMonth: Record<number, any[]> = {}
        allBatteries.forEach((b: any) => {
          if (!byMonth[b.season_month]) byMonth[b.season_month] = []
          byMonth[b.season_month].push(b)
        })
        const avgs = Object.entries(byMonth).map(([month, responses]) => {
          const avg: any = { season_month: Number(month), count: responses.length }
          ANCHOR_KEYS.forEach(k => {
            const vals = responses.map(r => r[k]).filter((v: any) => v !== null)
            avg[k] = vals.length ? Math.round(vals.reduce((s: number, v: number) => s + v, 0) / vals.length * 10) / 10 : null
          })
          return avg
        })
        setTeamAvg(avgs.sort((a, b) => a.season_month - b.season_month))
      }
    } catch (err) { console.error("Load error:", err) }
    }
    load()
  }, [])

  const playerBatteries = selectedPlayer
    ? batteries.filter(b => b.user_id === selectedPlayer).sort((a, b) => a.season_month - b.season_month)
    : []

  // Max height for sparklines
  const sparkH = 60

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
        Verlaufs-<span style={{ color: 'var(--cyan)' }}>Trends</span>
      </h1>
      <p className="mb-8" style={{ color: 'var(--muted)' }}>5 Ankermetriken über die Saison – Team und Einzelspieler.</p>

      {/* Team Average Trend */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>
          📊 Team-Durchschnitt · Saison 2025/26
        </div>
        {teamAvg.length === 0 ? (
          <div className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>Noch keine Monatsdaten vorhanden.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th className="text-left text-xs font-bold pb-3" style={{ color: 'var(--muted)' }}>Monat</th>
                  {ANCHOR_METRICS.map((a, i) => (
                    <th key={a.key} className="text-center text-xs font-bold pb-3 cursor-pointer"
                      style={{ color: ANCHOR_COLORS[i] }}
                      onClick={() => setShowInfo(showInfo === a.key ? null : a.key)}>
                      {a.icon} {a.label}
                    </th>
                  ))}
                  <th className="text-center text-xs font-bold pb-3" style={{ color: 'var(--muted)' }}>N</th>
                </tr>
              </thead>
              <tbody>
                {teamAvg.map(row => (
                  <tr key={row.season_month} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2 font-bold">{MONTH_NAMES[row.season_month]}</td>
                    {ANCHOR_KEYS.map(k => (
                      <td key={k} className="text-center py-2">
                        {row[k] !== null ? (
                          <span className="font-bold" style={{ color: scoreColor(row[k]) }}>{row[k].toFixed(1)}</span>
                        ) : <span style={{ color: 'rgba(255,255,255,0.15)' }}>–</span>}
                      </td>
                    ))}
                    <td className="text-center py-2" style={{ color: 'var(--muted)' }}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info panel */}
        {showInfo && (() => {
          const a = ANCHOR_METRICS.find(m => m.key === showInfo)!
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

      {/* Player Selection + Individual Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>Spieler wählen</div>
          {players.map(p => {
            const pb = batteries.filter(b => b.user_id === p.id)
            const latest = pb.length ? pb[pb.length - 1] : null
            const risk = latest?.turnover_risk
            const rb = risk ? riskBadge(risk) : null
            return (
              <button key={p.id} onClick={() => setSelectedPlayer(p.id)}
                className="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-all" style={{
                  background: selectedPlayer === p.id ? 'rgba(47,167,188,0.08)' : 'var(--navy2)',
                  border: selectedPlayer === p.id ? '1px solid rgba(47,167,188,0.3)' : '1px solid rgba(255,255,255,0.06)'
                }}>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{p.first_name} {p.last_name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{pb.length} Befragungen</div>
                </div>
                {rb && <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: rb.bg, color: rb.color, border: `1px solid ${rb.border}` }}>{rb.text}</span>}
              </button>
            )
          })}
        </div>

        <div className="lg:col-span-3">
          {selectedPlayer && playerBatteries.length > 0 ? (
            <div className="rounded-xl p-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>
                📈 Verlauf · {players.find(p => p.id === selectedPlayer)?.first_name} {players.find(p => p.id === selectedPlayer)?.last_name}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-bold pb-3" style={{ color: 'var(--muted)' }}>Monat</th>
                      <th className="text-center text-xs font-bold pb-3" style={{ color: 'var(--muted)' }}>Bat.</th>
                      {ANCHOR_METRICS.map((a, i) => (
                        <th key={a.key} className="text-center text-xs font-bold pb-3" style={{ color: ANCHOR_COLORS[i] }}>{a.icon}</th>
                      ))}
                      <th className="text-center text-xs font-bold pb-3" style={{ color: 'var(--muted)' }}>Risiko</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerBatteries.map((b, idx) => {
                      const prev = idx > 0 ? playerBatteries[idx - 1] : null
                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td className="py-2 font-bold">{MONTH_NAMES[b.season_month]}</td>
                          <td className="text-center py-2"><span className="text-xs font-bold px-2 py-0.5 rounded" style={{
                            background: 'rgba(255,255,255,0.05)', color: 'var(--text)'
                          }}>{b.battery}</span></td>
                          {ANCHOR_KEYS.map(k => {
                            const v = b[k]
                            const pv = prev ? prev[k] : null
                            const trend = v && pv ? (v - pv >= 1 ? '↑' : v - pv <= -1 ? '↓' : '') : ''
                            return (
                              <td key={k} className="text-center py-2">
                                {v !== null ? (
                                  <span className="font-bold" style={{ color: scoreColor(v) }}>
                                    {v.toFixed(1)}{trend && <span className="text-xs ml-0.5">{trend}</span>}
                                  </span>
                                ) : <span style={{ color: 'rgba(255,255,255,0.15)' }}>–</span>}
                              </td>
                            )
                          })}
                          <td className="text-center py-2">
                            {(() => { const rb = riskBadge(b.turnover_risk); return <span className="text-xs font-bold" style={{ color: rb.color }}>{rb.text}</span> })()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Trend warnings */}
              {playerBatteries.length >= 2 && (() => {
                const latest = playerBatteries[playerBatteries.length - 1]
                const prev = playerBatteries[playerBatteries.length - 2]
                const warnings: string[] = []
                ANCHOR_KEYS.forEach((k, i) => {
                  if (latest[k] && prev[k] && (prev[k] - latest[k]) >= 2) {
                    warnings.push(`${ANCHOR_METRICS[i].icon} ${ANCHOR_METRICS[i].label}: Abfall von ${prev[k].toFixed(1)} auf ${latest[k].toFixed(1)} (−${(prev[k] - latest[k]).toFixed(1)})`)
                  }
                })
                if (warnings.length === 0) return null
                return (
                  <div className="mt-4 rounded-lg p-4" style={{ background: 'rgba(224,85,85,0.06)', border: '1px solid rgba(224,85,85,0.15)' }}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#E05555' }}>⚠ Trend-Warnung</div>
                    {warnings.map((w, i) => <div key={i} className="text-sm mb-1" style={{ color: 'var(--text)' }}>{w}</div>)}
                    <div className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Abfall ≥2 Punkte in einem Monat → Einzelgespräch empfohlen</div>
                  </div>
                )
              })()}
            </div>
          ) : selectedPlayer ? (
            <div className="rounded-xl p-12 text-center" style={{ background: 'var(--navy2)', color: 'var(--muted)' }}>
              Noch keine Befragungsdaten für diesen Spieler.
            </div>
          ) : (
            <div className="rounded-xl p-12 text-center" style={{ background: 'var(--navy2)', color: 'var(--muted)' }}>
              <div className="text-4xl mb-4 opacity-30">👈</div>Wähle einen Spieler um den Verlauf zu sehen.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
