'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SPORTTYP_TYPES, FAMILY_META } from '@/lib/sporttyp-constants'
import { getFamily } from '@/services/scoring/calculate'

export default function CoachDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedTeam) loadPlayers(selectedTeam)
  }, [selectedTeam])

  async function loadData() {
    try {
      if (!supabase) { setError('Keine Verbindung'); setLoading(false); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Nicht eingeloggt'); setLoading(false); return }

      // Profile laden
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) setProfile(prof)

      // Teams laden wo ich Coach bin
      const { data: myTeams, error: teamErr } = await supabase
        .from('team_memberships')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('role_in_team', 'coach')

      if (teamErr) { setError('Fehler beim Laden der Teams: ' + teamErr.message); setLoading(false); return }
      if (!myTeams?.length) { setError('Du bist noch keiner Mannschaft als Trainer zugeordnet.'); setLoading(false); return }

      // Team-Details laden
      const teamIds = myTeams.map((t: any) => t.team_id)
      const { data: teamDetails } = await supabase
        .from('teams')
        .select('id, name, season, club_id, clubs(name)')
        .in('id', teamIds)

      if (teamDetails?.length) {
        setTeams(teamDetails)
        setSelectedTeam(teamDetails[0].id)
      }
    } catch (e: any) {
      setError('Fehler: ' + (e?.message || String(e)))
    }
    setLoading(false)
  }

  async function loadPlayers(teamId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Alle Spieler dieser Mannschaft
      const { data: members, error: memErr } = await supabase
        .from('team_memberships')
        .select('user_id')
        .eq('team_id', teamId)
        .eq('role_in_team', 'player')

      if (memErr || !members?.length) { setPlayers([]); return }

      const playerIds = members.map((m: any) => m.user_id)

      // Profile laden
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', playerIds)

      // Typ-Ergebnisse laden
      const { data: types } = await supabase
        .from('type_results')
        .select('*')
        .in('user_id', playerIds)
        .order('created_at', { ascending: false })

      // Spieler zusammenbauen
      const playerList = (profiles || []).map((p: any) => {
        const latestType = (types || []).find((t: any) => t.user_id === p.id)
        return {
          profile: p,
          latestType,
          selfTestDone: !!latestType,
          coachRatingDone: !!(types || []).find((t: any) => t.user_id === p.id && t.scoring_json?.source === 'coach')
        }
      })

      setPlayers(playerList)
    } catch (e: any) {
      console.error('Error loading players:', e)
    }
  }

  // Team-DNA berechnen
  const famCounts: Record<string, { count: number; names: string[] }> = {
    str: { count: 0, names: [] }, tfo: { count: 0, names: [] },
    per: { count: 0, names: [] }, lea: { count: 0, names: [] }
  }
  players.forEach(p => {
    if (!p.latestType) return
    const fam = getFamily(p.latestType.result_type)
    if (fam && famCounts[fam]) {
      famCounts[fam].count++
      famCounts[fam].names.push(p.profile.first_name)
    }
  })

  // Filter
  const filteredPlayers = players.filter(p => {
    if (filterType && p.latestType) {
      if (getFamily(p.latestType.result_type) !== filterType) return false
    }
    if (filterType && !p.latestType) return false
    if (filterStatus === 'tested' && !p.selfTestDone) return false
    if (filterStatus === 'open' && p.selfTestDone) return false
    if (filterStatus === 'rated' && !p.coachRatingDone) return false
    if (filterStatus === 'unrated' && p.coachRatingDone) return false
    return true
  })

  if (loading) return (
    <div className="text-center py-20 fade-in">
      <div className="flex justify-center gap-1 mb-6">
        <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: 'var(--cyan)', animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: 'var(--cyan)', animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: 'var(--cyan)', animationDelay: '0.4s' }} />
      </div>
      <div className="text-sm" style={{ color: 'var(--muted)' }}>Dashboard wird geladen...</div>
    </div>
  )

  if (error) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="text-4xl mb-4">⚠️</div>
      <div className="text-lg font-bold mb-4" style={{ color: '#E05555' }}>{error}</div>
      <div className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        Gehe zur <a href="/dashboard/admin" className="underline" style={{ color: 'var(--cyan)' }}>Verwaltung</a> um einen Verein und eine Mannschaft anzulegen.
      </div>
    </div>
  )

  const currentTeam = teams.find(t => t.id === selectedTeam)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: 'Barlow Condensed' }}>
          Trainer-<span style={{ color: 'var(--gold)' }}>Dashboard</span>
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          {currentTeam ? `${(currentTeam as any).clubs?.name || ''} · ${currentTeam.name} · ${currentTeam.season}` : ''}
        </p>
      </div>

      {/* Team-Auswahl */}
      {teams.length > 1 && (
        <div className="mb-6">
          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}
            className="rounded-lg px-4 py-3 text-white font-semibold outline-none"
            style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {teams.map(t => (
              <option key={t.id} value={t.id} style={{ background: '#061828' }}>
                {(t as any).clubs?.name || ''} – {t.name} ({t.season})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { val: players.length, label: 'Spieler', color: 'var(--cyan)' },
          { val: players.filter(p => p.selfTestDone).length, label: 'Tests fertig', color: '#3DBA6F' },
          { val: players.filter(p => p.coachRatingDone).length, label: 'Bewertet', color: 'var(--gold)' },
          { val: players.filter(p => !p.selfTestDone).length, label: 'Test offen', color: '#E05555' },
        ].map((kpi, i) => (
          <div key={i} className="card p-5 text-center">
            <div className="hm-kpi-value" style={{ color: kpi.color }}>{kpi.val}</div>
            <div className="hm-kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Team-DNA */}
      {players.some(p => p.latestType) && (
        <div className="card p-6 mb-8">
          <div className="hm-section">Team-DNA · Typenverteilung</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(FAMILY_META).map(([k, fam]) => {
              const fc = famCounts[k]
              const pct = players.length ? Math.round((fc.count / players.length) * 100) : 0
              return (
                <div key={k} className="card-flat p-4 text-center" style={{ borderTop: `3px solid ${fam.color}` }}>
                  <div className="text-2xl mb-1">{fam.icon}</div>
                  <div className="text-xl font-extrabold" style={{ fontFamily: 'Barlow Condensed', color: fam.color }}>{fc.count}</div>
                  <div className="text-xs font-bold" style={{ color: fam.color }}>{fam.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{pct}%</div>
                  {fc.names.length > 0 && <div className="text-xs mt-1" style={{ color: 'var(--text)' }}>{fc.names.join(', ')}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter + Spielerliste */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Barlow Condensed' }}>
          Alle <span style={{ color: 'var(--cyan)' }}>Spieler</span>
          <span className="text-sm font-normal ml-2" style={{ color: 'var(--muted)' }}>({filteredPlayers.length})</span>
        </h2>
        <div className="flex-1" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="rounded-lg px-3 py-2 text-xs text-white outline-none card-flat">
          <option value="" style={{ background: '#061828' }}>Alle Typen</option>
          <option value="str" style={{ background: '#061828' }}>💜 Strategen</option>
          <option value="tfo" style={{ background: '#061828' }}>💙 Teamformer</option>
          <option value="per" style={{ background: '#061828' }}>💛 Performer</option>
          <option value="lea" style={{ background: '#061828' }}>❤️ Anführer</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="rounded-lg px-3 py-2 text-xs text-white outline-none card-flat">
          <option value="" style={{ background: '#061828' }}>Alle Status</option>
          <option value="tested" style={{ background: '#061828' }}>✅ Test fertig</option>
          <option value="open" style={{ background: '#061828' }}>⭕ Test offen</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredPlayers.map(p => {
          const ty = p.latestType ? SPORTTYP_TYPES[p.latestType.result_type] : null
          const fam = p.latestType ? FAMILY_META[getFamily(p.latestType.result_type) as keyof typeof FAMILY_META] : null
          return (
            <a key={p.profile.id} href={`/dashboard/players/${p.profile.id}`}
              className="card p-4 flex items-center gap-4 block">
              <div className="text-2xl">{ty?.emoji || '👤'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{p.profile.first_name} {p.profile.last_name}</div>
                <div className="text-xs" style={{ color: ty?.color || 'var(--muted)' }}>
                  {p.latestType ? `${p.latestType.result_label} (${p.latestType.result_type})` : 'Typ noch nicht ermittelt'}
                  {fam ? ` · ${fam.icon} ${fam.name}` : ''}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={`hm-badge ${p.selfTestDone ? "hm-badge-green" : "hm-badge-red"}`}>
                  {p.selfTestDone ? '✓ Test' : '○ Test'}
                </span>
              </div>
            </a>
          )
        })}
        {filteredPlayers.length === 0 && (
          <div className="card p-8 text-center" style={{ color: 'var(--muted)' }}>
            {players.length === 0
              ? 'Noch keine Spieler in dieser Mannschaft. Lade Spieler über einen Einladungslink ein (Verwaltung).'
              : 'Keine Spieler für diesen Filter.'}
          </div>
        )}
      </div>
    </div>
  )
}
