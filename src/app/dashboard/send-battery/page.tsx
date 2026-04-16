'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const BATTERIES = [
  { key: 'A', label: 'Führung & Alignment', icon: '🎯', color: '#2FA7BC', desc: 'Trainerkommunikation, Rollenklarheit, Fairness, Feedback' },
  { key: 'B', label: 'Team & Klima', icon: '🤝', color: '#3DBA6F', desc: 'Stimmung, Zusammenhalt, Integration, Konflikte, Vertrauen' },
  { key: 'C', label: 'Entwicklung & Energie', icon: '⚡', color: '#C8922A', desc: 'Fortschritt, Spielzeit, Perspektive, Balance' },
  { key: 'D', label: 'Vertrauen & Wohlbefinden', icon: '💜', color: '#5B3FA0', desc: 'Fitness, Mental, Druck, Wertschätzung, Identifikation' },
  { key: 'E', label: 'Spieltag-Reflexion', icon: '⚽', color: '#E05555', desc: 'Nach dem Spiel: Leistung, Taktik, Reaktion, Stimmung, Bereitschaft' },
]

const MONTH_NAMES = ['', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']

export default function SendBatteryPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [teamId, setTeamId] = useState<string>('')
  const [selectedBattery, setSelectedBattery] = useState<string>('A')
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [matchContext, setMatchContext] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const supabase = createClient()

  function getCurrentMonth(): number {
    const m = new Date().getMonth() + 1
    const map: Record<number, number> = {7:1,8:2,9:3,10:4,11:5,12:6,1:7,2:8,3:9,4:10,5:11,6:12}
    return map[m] || 1
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: teams } = await supabase.from('team_memberships').select('team_id')
        .eq('user_id', user.id).eq('role_in_team', 'coach')
      if (!teams?.length) return
      setTeamId(teams[0].team_id)

      const { data: members } = await supabase.from('team_memberships').select('user_id, profiles(id, first_name, last_name)')
        .eq('team_id', teams[0].team_id).eq('role_in_team', 'player')
      if (members) setPlayers(members.map((m: any) => m.profiles).filter(Boolean))
    }
    load()
  }, [])

  async function handleSend() {
    if (!players.length || !teamId) return
    setSending(true)

    const bat = BATTERIES.find(b => b.key === selectedBattery)!
    const monthName = MONTH_NAMES[selectedMonth]
    const title = selectedBattery === 'E'
      ? `⚽ Spieltag-Reflexion${matchContext ? ': ' + matchContext : ''}`
      : `📋 Monatsbefragung ${monthName}: ${bat.label}`
    const message = selectedBattery === 'E'
      ? `Bitte fülle die kurze Spieltag-Reflexion aus (ca. 3 Min).${matchContext ? ' Zum Spiel: ' + matchContext : ''}`
      : `Dein Trainer hat die Befragung "${bat.label}" für ${monthName} freigeschaltet. Bitte fülle sie aus (ca. 5 Min).`

    let count = 0
    for (const player of players) {
      try {
        await supabase.from('notifications').insert({
          user_id: player.id,
          team_id: teamId,
          type: 'battery_request',
          title,
          message,
          action_url: `/dashboard/battery?bat=${selectedBattery}&month=${selectedMonth}`,
        })
        count++
      } catch (e) { console.error('Notification failed for', player.id) }
    }

    setSentCount(count)
    setSent(true)
    setSending(false)
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-7xl mb-6">✅</div>
        <h2 className="text-3xl font-extrabold mb-3" style={{ fontFamily: 'Barlow Condensed' }}>
          Befragung verschickt!
        </h2>
        <p className="mb-2" style={{ color: 'var(--text)' }}>
          {sentCount} Spieler haben eine Benachrichtigung erhalten.
        </p>
        <p className="mb-8" style={{ color: 'var(--muted)' }}>
          Die Spieler sehen die Anfrage beim nächsten Öffnen der App.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSent(false); setMatchContext('') }}
            className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider"
            style={{ background: 'var(--cyan)', color: 'var(--navy)' }}>
            Weitere senden
          </button>
          <a href="/dashboard/trends" className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'var(--muted)' }}>
            Trends ansehen
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
        Befragung <span style={{ color: 'var(--gold)' }}>versenden</span>
      </h1>
      <p className="mb-8" style={{ color: 'var(--muted)' }}>
        Wähle eine Batterie und einen Monat. Alle {players.length} Spieler erhalten eine Benachrichtigung.
      </p>

      {/* Battery Selection */}
      <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--cyan)' }}>Batterie wählen</div>
      <div className="space-y-2 mb-6">
        {BATTERIES.map(b => (
          <button key={b.key} onClick={() => setSelectedBattery(b.key)}
            className="w-full text-left rounded-xl p-4 flex items-center gap-4 transition-all" style={{
              background: selectedBattery === b.key ? `${b.color}10` : 'var(--navy2)',
              border: selectedBattery === b.key ? `2px solid ${b.color}` : '1px solid rgba(255,255,255,0.06)'
            }}>
            <span className="text-2xl">{b.icon}</span>
            <div className="flex-1">
              <div className="font-bold" style={{ color: selectedBattery === b.key ? b.color : 'white' }}>
                Batterie {b.key}: {b.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{b.desc}</div>
            </div>
            <div className="text-xs font-bold px-3 py-1 rounded-full" style={{
              background: selectedBattery === b.key ? `${b.color}20` : 'transparent',
              color: selectedBattery === b.key ? b.color : 'var(--muted)'
            }}>{b.key === 'E' ? '11 Fragen' : '13 Fragen'}</div>
          </button>
        ))}
      </div>

      {/* Month selection (not for Battery E) */}
      {selectedBattery !== 'E' ? (
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--cyan)' }}>Monat zuordnen</div>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {MONTH_NAMES.slice(1).map((name, i) => {
              const month = i + 1
              return (
                <button key={month} onClick={() => setSelectedMonth(month)}
                  className="rounded-lg p-2 text-center transition-all" style={{
                    background: selectedMonth === month ? 'rgba(47,167,188,0.15)' : 'var(--navy3)',
                    border: selectedMonth === month ? '2px solid var(--cyan)' : '1px solid rgba(255,255,255,0.04)'
                  }}>
                  <div className="text-xs font-bold" style={{ color: selectedMonth === month ? 'var(--cyan)' : 'var(--muted)' }}>{name}</div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--red)' }}>Spieltag-Kontext (optional)</div>
          <input type="text" value={matchContext} onChange={e => setMatchContext(e.target.value)}
            placeholder="z.B. Heimspiel vs. FC Innsbruck – 1:3 Niederlage"
            className="w-full rounded-lg px-4 py-3 text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }} />
        </div>
      )}

      {/* Summary + Send */}
      <div className="rounded-xl p-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>Zusammenfassung</div>
        <div className="text-sm mb-1" style={{ color: 'var(--text)' }}>
          <strong>Batterie {selectedBattery}:</strong> {BATTERIES.find(b => b.key === selectedBattery)?.label}
        </div>
        {selectedBattery !== 'E' && (
          <div className="text-sm mb-1" style={{ color: 'var(--text)' }}>
            <strong>Monat:</strong> {MONTH_NAMES[selectedMonth]}
          </div>
        )}
        {selectedBattery === 'E' && matchContext && (
          <div className="text-sm mb-1" style={{ color: 'var(--text)' }}>
            <strong>Kontext:</strong> {matchContext}
          </div>
        )}
        <div className="text-sm mb-4" style={{ color: 'var(--text)' }}>
          <strong>Empfänger:</strong> {players.length} Spieler
        </div>

        <button onClick={handleSend} disabled={sending || !players.length}
          className="w-full py-3.5 rounded-lg font-bold text-sm uppercase tracking-widest disabled:opacity-50 transition-all"
          style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
          {sending ? '⏳ Wird versendet...' : `→ An ${players.length} Spieler versenden`}
        </button>
      </div>
    </div>
  )
}
