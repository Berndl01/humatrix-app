'use client'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { ANCHOR_METRICS } from '@/lib/sporttyp-constants'

const BATTERIES = [
  { key: 'A', label: 'Führung & Alignment', icon: '🎯', color: '#2FA7BC', months: [2, 6, 10], monthNames: ['Aug', 'Dez', 'Apr'] },
  { key: 'B', label: 'Team & Klima', icon: '🤝', color: '#3DBA6F', months: [3, 7, 11], monthNames: ['Sep', 'Jän', 'Mai'] },
  { key: 'C', label: 'Entwicklung & Energie', icon: '⚡', color: '#C8922A', months: [4, 8, 12], monthNames: ['Okt', 'Feb', 'Jun'] },
  { key: 'D', label: 'Vertrauen & Wohlbefinden', icon: '💜', color: '#5B3FA0', months: [5, 9], monthNames: ['Nov', 'Mär'] },
  { key: 'E', label: 'Spieltag-Reflexion', icon: '⚽', color: '#E05555', months: [], monthNames: [] },
] as const

const MONTH_NAMES = ['', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']

// Focus questions per battery (without anchors)
const FOCUS_QUESTIONS: Record<string, {id: number; text: string}[]> = {
  A: [
    {id: 211, text: 'Mein Trainer kommuniziert klar, was er von mir erwartet.'},
    {id: 212, text: 'Ich verstehe die taktische Idee und meinen Beitrag darin.'},
    {id: 213, text: 'Die Entscheidungen meines Trainers kann ich nachvollziehen.'},
    {id: 214, text: 'Ich bekomme regelmäßig hilfreiches Feedback.'},
    {id: 215, text: 'Mein Trainer behandelt alle Spieler fair und gerecht.'},
    {id: 216, text: 'Ich fühle mich als Person wahrgenommen, nicht nur als Spieler.'},
    {id: 217, text: 'Die Art wie mein Trainer führt, passt zu mir.'},
    {id: 218, text: 'Ich werde in Entscheidungen einbezogen die mich betreffen.'},
  ],
  B: [
    {id: 221, text: 'Die Stimmung in der Mannschaft ist aktuell gut.'},
    {id: 222, text: 'Wir halten als Team zusammen, auch wenn es schwierig wird.'},
    {id: 223, text: 'Neue Spieler werden bei uns gut aufgenommen und integriert.'},
    {id: 224, text: 'Konflikte im Team werden offen und fair gelöst.'},
    {id: 225, text: 'Ich vertraue meinen Mitspielern auf und neben dem Platz.'},
    {id: 226, text: 'Wir haben Spieler im Team die in schwierigen Momenten vorangehen.'},
    {id: 227, text: 'Ich fühle mich als Teil dieser Mannschaft wohl.'},
    {id: 228, text: 'Wir sprechen Probleme im Team direkt an.'},
  ],
  C: [
    {id: 231, text: 'Ich habe das Gefühl, mich weiterentwickelt zu haben.'},
    {id: 232, text: 'Das Training fordert mich auf dem richtigen Niveau.'},
    {id: 233, text: 'Ich bekomme die Spielzeit die meiner Leistung entspricht.'},
    {id: 234, text: 'Ich weiß, woran ich konkret arbeiten muss.'},
    {id: 235, text: 'Mein Trainer investiert Zeit in meine Entwicklung.'},
    {id: 236, text: 'Training und Spiele kosten mir aktuell mehr Energie als üblich.'},
    {id: 237, text: 'Ich sehe eine klare sportliche Perspektive für mich.'},
    {id: 238, text: 'Die Balance zwischen Fußball und Leben stimmt aktuell.'},
  ],
  D: [
    {id: 241, text: 'Ich fühle mich aktuell körperlich fit und belastbar.'},
    {id: 242, text: 'Ich schlafe gut und fühle mich erholt.'},
    {id: 243, text: 'Mein mentaler Zustand ist stabil und positiv.'},
    {id: 244, text: 'Ich kann mit Druck und Rückschlägen gut umgehen.'},
    {id: 245, text: 'Ich vertraue meinem Trainer als Person.'},
    {id: 246, text: 'Ich fühle mich im Verein wertgeschätzt und respektiert.'},
    {id: 247, text: 'Ich kann bei Problemen jemanden ansprechen.'},
    {id: 248, text: 'Ich identifiziere mich mit den Zielen des Vereins.'},
  ],
  E: [
    {id: 251, text: 'Ich war mit meiner persönlichen Leistung am Spieltag zufrieden.'},
    {id: 252, text: 'Die Mannschaft hat als Einheit funktioniert.'},
    {id: 253, text: 'Die taktische Vorgabe war klar und umsetzbar.'},
    {id: 254, text: 'Die Reaktion des Trainers nach dem Spiel war angemessen und fair.'},
    {id: 255, text: 'Ich bin bereit, im nächsten Spiel noch mehr zu geben.'},
    {id: 256, text: 'Die Stimmung in der Kabine nach dem Spiel war konstruktiv.'},
  ],
}

function BatteryInner() {
  const searchParams = useSearchParams()
  const urlBat = searchParams.get('bat')
  const urlMonth = searchParams.get('month')
  const [profile, setProfile] = useState<any>(null)
  const [membership, setMembership] = useState<any>(null)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [activeBattery, setActiveBattery] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const supabase = createClient()

  function getCurrentMonth(): number {
    const now = new Date()
    const m = now.getMonth() + 1 // 1=Jan
    // Season calendar: Jul=1, Aug=2, Sep=3 ... Jun=12
    const map: Record<number, number> = {7:1, 8:2, 9:3, 10:4, 11:5, 12:6, 1:7, 2:8, 3:9, 4:10, 5:11, 6:12}
    return map[m] || 1
  }

  function getBatteryForMonth(month: number): string {
    for (const b of BATTERIES) {
      if ((b.months as readonly number[]).includes(month)) return b.key
    }
    return 'A'
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) setProfile(prof)

      const { data: mem } = await supabase.from('team_memberships').select('team_id').eq('user_id', user.id).limit(1)
      if (mem?.length) setMembership(mem[0])

      // Check which months are already completed
      const { data: responses } = await supabase.from('battery_responses').select('season_month').eq('user_id', user.id).eq('season', '2025/26')
      const done: Record<string, boolean> = {}
      responses?.forEach((r: any) => { done[String(r.season_month)] = true })
      setCompleted(done)
      // Auto-open from notification URL
      if (urlBat && !done[String(urlMonth || getCurrentMonth())]) {
        setActiveBattery(urlBat)
        if (urlMonth) setSelectedMonth(Number(urlMonth))
      }
    }
    load()
  }, [])

  function setAnswer(qId: number, val: number) {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  async function handleSubmit() {
    if (!profile || !activeBattery) return
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    // Calculate anchor values
    const anchorMap: Record<string, number> = {
      201: answers[201], 202: answers[202], 203: answers[203],
      204: answers[204], 205: answers[205],
    }

    // Calculate focus scores
    const focusQs = FOCUS_QUESTIONS[activeBattery] || []
    const focusVals = focusQs.map(q => answers[q.id]).filter(v => v !== undefined)
    const focusAvg = focusVals.length > 0 ? focusVals.reduce((s, v) => s + v, 0) / focusVals.length : null

    // Turnover risk based on commitment + satisfaction
    const commitment = answers[203] || 4
    const satisfaction = answers[201] || 4
    const motivation = answers[205] || 4
    const riskScore = (commitment + satisfaction + motivation) / 3
    const turnoverRisk = riskScore <= 3 ? 'high' : riskScore <= 5 ? 'mid' : 'low'

    try {
      await supabase.from('battery_responses').insert({
        user_id: user.id,
        team_id: membership?.team_id || null,
        battery: activeBattery,
        season_month: selectedMonth,
        season: '2025/26',
        anchor_satisfaction: answers[201] || null,
        anchor_psych_safety: answers[202] || null,
        anchor_commitment: answers[203] || null,
        anchor_alignment: answers[204] || null,
        anchor_motivation: answers[205] || null,
        answers_json: answers,
        focus_scores: { average: focusAvg ? Math.round(focusAvg * 10) / 10 : null, battery: activeBattery },
        turnover_risk: turnoverRisk,
      })
      setDone(true)
    } catch (err) {
      alert('Fehler beim Speichern. Bitte erneut versuchen.')
    }
    setSubmitting(false)
  }

  // Done screen
  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-7xl mb-6">✅</div>
        <h2 className="text-3xl font-extrabold mb-3" style={{ fontFamily: 'Barlow Condensed' }}>Danke!</h2>
        <p className="mb-6" style={{ color: 'var(--text)' }}>Deine Antworten wurden gespeichert. Dein Trainer erhält die Daten automatisch.</p>
        <a href="/dashboard/player" className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider inline-block"
          style={{ background: 'var(--cyan)', color: 'var(--navy)' }}>→ Dashboard</a>
      </div>
    )
  }

  // Battery selection
  if (!activeBattery) {
    const currentBattery = getBatteryForMonth(selectedMonth)
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
          Monats-<span style={{ color: 'var(--cyan)' }}>Befragung</span>
        </h1>
        <p className="mb-8" style={{ color: 'var(--muted)' }}>5 Minuten · 13 Fragen · Monatlich über die Saison</p>

        {/* Season Calendar */}
        <div className="rounded-xl p-5 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>Saison 2025/26</div>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {MONTH_NAMES.slice(1).map((name, i) => {
              const month = i + 1
              const bat = getBatteryForMonth(month)
              const batDef = BATTERIES.find(b => b.key === bat)
              const isDone = completed[String(month)]
              const isCurrent = month === selectedMonth
              return (
                <button key={month} onClick={() => !isDone && setSelectedMonth(month)}
                  className="rounded-lg p-2 text-center transition-all" style={{
                    background: isCurrent ? `${batDef?.color}20` : isDone ? 'rgba(61,186,111,0.08)' : 'var(--navy3)',
                    border: isCurrent ? `2px solid ${batDef?.color}` : isDone ? '1px solid rgba(61,186,111,0.2)' : '1px solid rgba(255,255,255,0.04)',
                    opacity: isDone ? 0.6 : 1
                  }}>
                  <div className="text-xs font-bold" style={{ color: isDone ? '#3DBA6F' : batDef?.color }}>{name}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{isDone ? '✓' : bat}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Current Battery */}
        {(() => {
          const bat = BATTERIES.find(b => b.key === currentBattery)!
          const isAlreadyDone = completed[String(selectedMonth)]
          return (
            <div className="rounded-xl p-6" style={{ background: 'var(--navy2)', border: `2px solid ${bat.color}30` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{bat.icon}</span>
                <div>
                  <div className="text-xl font-extrabold" style={{ fontFamily: 'Barlow Condensed', color: bat.color }}>
                    Batterie {bat.key}: {bat.label}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    {MONTH_NAMES[selectedMonth]} · 5 Ankerfragen + 8 Schwerpunktfragen
                  </div>
                </div>
              </div>
              {isAlreadyDone ? (
                <div className="text-sm" style={{ color: '#3DBA6F' }}>✓ Bereits ausgefüllt für diesen Monat.</div>
              ) : (
                <button onClick={() => setActiveBattery(currentBattery)}
                  className="w-full py-3.5 rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
                  style={{ background: bat.color, color: 'var(--navy)' }}>
                  → Befragung starten
                </button>
              )}
            </div>
          )
        })()}
      </div>
    )
  }

  // Active battery questionnaire
  const bat = BATTERIES.find(b => b.key === activeBattery)!
  const anchorQs = ANCHOR_METRICS
  const focusQs = FOCUS_QUESTIONS[activeBattery] || []
  const totalQs = 5 + focusQs.length
  const answeredCount = Object.keys(answers).filter(k => answers[Number(k)] !== undefined).length
  const allDone = answeredCount >= totalQs

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: bat.color }}>
        {bat.icon} Batterie {bat.key} · {MONTH_NAMES[selectedMonth]}
      </div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Barlow Condensed' }}>
        {bat.label}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>{answeredCount}/{totalQs} beantwortet</p>

      {/* Progress */}
      <div className="h-1.5 rounded-full overflow-hidden mb-8" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{
          width: `${(answeredCount / totalQs) * 100}%`, background: bat.color
        }} />
      </div>

      {/* Anchor Questions */}
      <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--cyan)' }}>
        🧭 5 Ankerfragen
      </div>
      <div className="space-y-3 mb-8">
        {anchorQs.map((a, idx) => {
          const qId = 201 + idx
          return (
            <div key={qId} className="rounded-xl p-4" style={{
              background: answers[qId] !== undefined ? 'rgba(47,167,188,0.05)' : 'var(--navy2)',
              border: answers[qId] !== undefined ? '1px solid rgba(47,167,188,0.2)' : '1px solid rgba(255,255,255,0.06)'
            }}>
              <div className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>
                <span className="text-xs mr-2" style={{ color: 'var(--cyan)', opacity: 0.5 }}>{a.icon}</span>
                {a.question}
              </div>
              <div className="flex gap-0">
                {[1,2,3,4,5,6,7].map(val => (
                  <button key={val} onClick={() => setAnswer(qId, val)}
                    className="flex-1 py-2.5 text-center transition-all"
                    style={{
                      background: answers[qId] === val ? 'rgba(47,167,188,0.15)' : 'transparent',
                      borderBottom: answers[qId] === val ? '2px solid var(--cyan)' : '2px solid rgba(255,255,255,0.06)',
                      color: answers[qId] === val ? 'var(--cyan)' : 'rgba(255,255,255,0.3)',
                      fontFamily: 'Barlow Condensed', fontSize: 17, fontWeight: 700
                    }}>{val}</button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Focus Questions */}
      <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: bat.color }}>
        {bat.icon} {bat.label} · 8 Schwerpunktfragen
      </div>
      <div className="space-y-3 mb-8">
        {focusQs.map(q => (
          <div key={q.id} className="rounded-xl p-4" style={{
            background: answers[q.id] !== undefined ? `${bat.color}08` : 'var(--navy2)',
            border: answers[q.id] !== undefined ? `1px solid ${bat.color}30` : '1px solid rgba(255,255,255,0.06)'
          }}>
            <div className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>{q.text}</div>
            <div className="flex gap-0">
              {[1,2,3,4,5,6,7].map(val => (
                <button key={val} onClick={() => setAnswer(q.id, val)}
                  className="flex-1 py-2.5 text-center transition-all"
                  style={{
                    background: answers[q.id] === val ? `${bat.color}20` : 'transparent',
                    borderBottom: answers[q.id] === val ? `2px solid ${bat.color}` : '2px solid rgba(255,255,255,0.06)',
                    color: answers[q.id] === val ? bat.color : 'rgba(255,255,255,0.3)',
                    fontFamily: 'Barlow Condensed', fontSize: 17, fontWeight: 700
                  }}>{val}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="text-right pb-8">
        {!allDone && <div className="text-xs mb-2" style={{ color: 'var(--gold)' }}>Noch {totalQs - answeredCount} Fragen offen</div>}
        <button onClick={() => { if (allDone && confirm('Antworten abschicken?')) handleSubmit() }}
          disabled={submitting || !allDone}
          className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider disabled:opacity-40"
          style={{ background: allDone ? '#3DBA6F' : 'rgba(255,255,255,0.1)', color: allDone ? 'var(--navy)' : 'var(--muted)' }}>
          {submitting ? '⏳ Wird gespeichert...' : allDone ? '✓ Befragung abschließen' : `Noch ${totalQs - answeredCount} offen`}
        </button>
      </div>
    </div>
  )
}

export default function BatteryPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--muted)' }}>Lade...</div>}>
      <BatteryInner />
    </Suspense>
  )
}
