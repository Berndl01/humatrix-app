'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Club { id: string; name: string; country: string }
interface Team { id: string; name: string; season: string; club_id: string; invite_code: string | null }
interface Member { user_id: string; role_in_team: string; profiles: any }

export default function AdminPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedClub, setSelectedClub] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [allUsers, setAllUsers] = useState<any[]>([])

  // Forms
  const [newClubName, setNewClubName] = useState('')
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamSeason, setNewTeamSeason] = useState('2025/26')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'player' | 'coach'>('player')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const supabase = createClient()

  function showMsg(type: 'ok' | 'err', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  useEffect(() => { loadClubs() }, [])
  useEffect(() => { if (selectedClub) loadTeams(selectedClub) }, [selectedClub])
  useEffect(() => { if (selectedTeam) loadMembers(selectedTeam) }, [selectedTeam])

  async function loadClubs() {
    const { data } = await supabase.from('clubs').select('*').order('name')
    if (data) {
      setClubs(data)
      if (data.length && !selectedClub) setSelectedClub(data[0].id)
    }
  }

  async function loadTeams(clubId: string) {
    const { data } = await supabase.from('teams').select('*').eq('club_id', clubId).order('name')
    if (data) {
      setTeams(data)
      if (data.length) setSelectedTeam(data[0].id)
      else setSelectedTeam('')
    }
  }

  async function loadMembers(teamId: string) {
    const { data } = await supabase.from('team_memberships').select('user_id, role_in_team, profiles(id, first_name, last_name, email, role)')
      .eq('team_id', teamId)
    if (data) setMembers(data as any)

    // Load all users not yet in this team
    const { data: all } = await supabase.from('profiles').select('id, first_name, last_name, email, role')
    if (all && data) {
      const memberIds = new Set(data.map((m: any) => m.user_id))
      setAllUsers(all.filter((u: any) => !memberIds.has(u.id)))
    }
  }

  function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  async function generateInviteLink(teamId: string) {
    const code = generateCode()
    const { error } = await supabase.from('teams').update({ invite_code: code }).eq('id', teamId)
    if (error) showMsg('err', 'Fehler beim Erstellen des Einladungslinks')
    else { showMsg('ok', 'Einladungslink erstellt!'); loadTeams(selectedClub) }
  }

  function getInviteUrl(code: string) {
    return `${window.location.origin}/invite/${code}`
  }

  async function copyInvite(code: string) {
    const url = getInviteUrl(code)
    await navigator.clipboard.writeText(url)
    showMsg('ok', 'Link kopiert! Sende ihn per WhatsApp an deine Spieler.')
  }

  async function createClub() {
    if (!newClubName.trim()) return
    setSaving(true)
    const { error } = await supabase.from('clubs').insert({ name: newClubName.trim(), country: 'AT' })
    if (error) showMsg('err', `Fehler: ${error.message}`)
    else { showMsg('ok', `Verein "${newClubName}" erstellt`); setNewClubName(''); loadClubs() }
    setSaving(false)
  }

  async function createTeam() {
    if (!newTeamName.trim() || !selectedClub) return
    setSaving(true)
    const { error } = await supabase.from('teams').insert({ name: newTeamName.trim(), season: newTeamSeason, club_id: selectedClub, invite_code: generateCode() })
    if (error) showMsg('err', `Fehler: ${error.message}`)
    else { showMsg('ok', `Mannschaft "${newTeamName}" erstellt`); setNewTeamName(''); loadTeams(selectedClub) }
    setSaving(false)
  }

  async function addMember(userId: string, role: 'player' | 'coach') {
    if (!selectedTeam) return
    setSaving(true)
    const { error } = await supabase.from('team_memberships').insert({ user_id: userId, team_id: selectedTeam, role_in_team: role })
    if (error) showMsg('err', `Fehler: ${error.message}`)
    else { showMsg('ok', 'Zuordnung gespeichert'); loadMembers(selectedTeam) }
    setSaving(false)
  }

  async function removeMember(userId: string) {
    if (!selectedTeam || !confirm('Wirklich aus der Mannschaft entfernen?')) return
    const { error } = await supabase.from('team_memberships').delete().eq('user_id', userId).eq('team_id', selectedTeam)
    if (error) showMsg('err', `Fehler: ${error.message}`)
    else { showMsg('ok', 'Entfernt'); loadMembers(selectedTeam) }
  }

  async function deleteTeam(teamId: string) {
    if (!confirm('Mannschaft wirklich löschen? Alle Zuordnungen gehen verloren.')) return
    await supabase.from('team_memberships').delete().eq('team_id', teamId)
    await supabase.from('teams').delete().eq('id', teamId)
    showMsg('ok', 'Mannschaft gelöscht')
    loadTeams(selectedClub)
  }

  const coaches = members.filter(m => m.role_in_team === 'coach')
  const players = members.filter(m => m.role_in_team === 'player')

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
        Vereins-<span style={{ color: 'var(--gold)' }}>Verwaltung</span>
      </h1>
      <p className="mb-6" style={{ color: 'var(--muted)' }}>Vereine, Mannschaften und Spieler verwalten.</p>

      {/* Message */}
      {message && (
        <div className="rounded-lg px-4 py-3 mb-6 text-sm font-bold" style={{
          background: message.type === 'ok' ? 'rgba(61,186,111,0.1)' : 'rgba(224,85,85,0.1)',
          border: `1px solid ${message.type === 'ok' ? 'rgba(61,186,111,0.3)' : 'rgba(224,85,85,0.3)'}`,
          color: message.type === 'ok' ? '#3DBA6F' : '#E05555'
        }}>{message.text}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Vereine */}
        <div>
          <div className="card p-5">
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>Vereine</div>
            
            <div className="space-y-2 mb-4">
              {clubs.map(c => (
                <button key={c.id} onClick={() => setSelectedClub(c.id)}
                  className="w-full text-left rounded-lg p-3 transition-all" style={{
                    background: selectedClub === c.id ? 'rgba(47,167,188,0.1)' : 'var(--navy3)',
                    border: selectedClub === c.id ? '1px solid rgba(47,167,188,0.3)' : '1px solid rgba(255,255,255,0.04)'
                  }}>
                  <div className="font-bold text-sm">{c.name}</div>
                </button>
              ))}
              {clubs.length === 0 && <div className="text-sm py-4 text-center" style={{ color: 'var(--muted)' }}>Noch keine Vereine.</div>}
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>Neuer Verein</div>
              <input type="text" value={newClubName} onChange={e => setNewClubName(e.target.value)}
                placeholder="Vereinsname" className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none mb-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={createClub} disabled={saving || !newClubName.trim()}
                className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                style={{ background: 'var(--gold)', color: 'var(--navy)' }}>+ Verein erstellen</button>
            </div>
          </div>
        </div>

        {/* Column 2: Mannschaften */}
        <div>
          <div className="card p-5">
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>
              Mannschaften {selectedClub ? `· ${clubs.find(c => c.id === selectedClub)?.name}` : ''}
            </div>

            <div className="space-y-2 mb-4">
              {teams.map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <button onClick={() => setSelectedTeam(t.id)}
                    className="flex-1 text-left rounded-lg p-3 transition-all" style={{
                      background: selectedTeam === t.id ? 'rgba(47,167,188,0.1)' : 'var(--navy3)',
                      border: selectedTeam === t.id ? '1px solid rgba(47,167,188,0.3)' : '1px solid rgba(255,255,255,0.04)'
                    }}>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{t.season}</div>
                    {t.invite_code && (
                      <button onClick={(e) => { e.stopPropagation(); copyInvite(t.invite_code!) }}
                        className="text-xs mt-1 px-2 py-0.5 rounded" style={{ background: 'rgba(47,167,188,0.1)', color: 'var(--cyan)', border: '1px solid rgba(47,167,188,0.2)' }}>
                        📋 Link kopieren
                      </button>
                    )}
                  </button>
                  <button onClick={() => deleteTeam(t.id)} className="text-xs px-2 py-1 rounded" style={{ color: '#E05555' }}>✕</button>
                </div>
              ))}
              {teams.length === 0 && <div className="text-sm py-4 text-center" style={{ color: 'var(--muted)' }}>Noch keine Mannschaften.</div>}
            </div>

            {/* Invite Link for selected team */}
            {selectedTeam && (() => {
              const team = teams.find(t => t.id === selectedTeam)
              if (!team) return null
              return (
                <div className="mb-4 rounded-lg p-3" style={{ background: 'rgba(47,167,188,0.06)', border: '1px solid rgba(47,167,188,0.15)' }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--cyan)' }}>Einladungslink · {team.name}</div>
                  {team.invite_code ? (
                    <div>
                      <div className="text-xs mb-2 font-mono p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text)', wordBreak: 'break-all' }}>
                        {typeof window !== 'undefined' ? getInviteUrl(team.invite_code) : ''}
                      </div>
                      <button onClick={() => copyInvite(team.invite_code!)}
                        className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                        style={{ background: 'var(--cyan)', color: 'var(--navy)' }}>
                        📋 Link kopieren und per WhatsApp senden
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => generateInviteLink(team.id)}
                      className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                      style={{ background: 'var(--cyan)', color: 'var(--navy)' }}>
                      🔗 Einladungslink erstellen
                    </button>
                  )}
                </div>
              )
            })()}

            <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>Neue Mannschaft</div>
              <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                placeholder="Mannschaftsname" className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none mb-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <input type="text" value={newTeamSeason} onChange={e => setNewTeamSeason(e.target.value)}
                placeholder="Saison z.B. 2025/26" className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none mb-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={createTeam} disabled={saving || !newTeamName.trim() || !selectedClub}
                className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                style={{ background: 'var(--gold)', color: 'var(--navy)' }}>+ Mannschaft erstellen</button>
            </div>
          </div>
        </div>

        {/* Column 3: Spieler & Trainer */}
        <div>
          <div className="card p-5">
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>
              Kader {selectedTeam ? `· ${teams.find(t => t.id === selectedTeam)?.name}` : ''}
            </div>

            {!selectedTeam ? (
              <div className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>Wähle eine Mannschaft.</div>
            ) : (
              <>
                {/* Coaches */}
                {coaches.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-bold mb-2" style={{ color: 'var(--gold)' }}>Trainer ({coaches.length})</div>
                    {coaches.map(m => (
                      <div key={m.user_id} className="flex items-center gap-2 rounded-lg p-2 mb-1" style={{ background: 'var(--navy3)' }}>
                        <span className="text-sm">🏅</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{m.profiles?.first_name} {m.profiles?.last_name}</div>
                          <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{m.profiles?.email}</div>
                        </div>
                        <button onClick={() => removeMember(m.user_id)} className="text-xs" style={{ color: '#E05555' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Players */}
                <div className="mb-4">
                  <div className="text-xs font-bold mb-2" style={{ color: '#3DBA6F' }}>Spieler ({players.length})</div>
                  {players.map(m => (
                    <div key={m.user_id} className="flex items-center gap-2 rounded-lg p-2 mb-1" style={{ background: 'var(--navy3)' }}>
                      <span className="text-sm">⚽</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{m.profiles?.first_name} {m.profiles?.last_name}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{m.profiles?.email}</div>
                      </div>
                      <button onClick={() => removeMember(m.user_id)} className="text-xs" style={{ color: '#E05555' }}>✕</button>
                    </div>
                  ))}
                  {players.length === 0 && <div className="text-xs py-2" style={{ color: 'var(--muted)' }}>Noch keine Spieler.</div>}
                </div>

                {/* Add existing user */}
                {allUsers.length > 0 && (
                  <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>Person zuordnen</div>
                    {allUsers.slice(0, 10).map(u => (
                      <div key={u.id} className="flex items-center gap-2 rounded-lg p-2 mb-1" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{u.first_name} {u.last_name}</div>
                          <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{u.email}</div>
                        </div>
                        <button onClick={() => addMember(u.id, 'player')}
                          className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(61,186,111,0.12)', color: '#3DBA6F' }}>+ Spieler</button>
                        <button onClick={() => addMember(u.id, 'coach')}
                          className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(200,146,42,0.12)', color: '#C8922A' }}>+ Trainer</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
