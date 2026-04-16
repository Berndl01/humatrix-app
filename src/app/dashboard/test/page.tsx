'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DIMENSION_META, FAMILY_META } from '@/lib/sporttyp-constants'
import { getQuestionnaire, getQuestionsByDimension, getScoringQuestions, validateAnswers } from '@/services/questionnaires/questionnaires'
import { calculateType, DIMENSIONS } from '@/services/scoring/calculate'
import { getType } from '@/services/scoring/types'

const DIM_ORDER = ['drive', 'energy', 'mental', 'role'] as const

export default function SelfTestPage() {
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    // Restore draft from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('humatrix_test_draft')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {}
  })

  // Auto-save draft on every answer change
  function setAnswerAndSave(qId: number, val: number) {
    setAnswers(prev => {
      const next = { ...prev, [qId]: val }
      try { localStorage.setItem('humatrix_test_draft', JSON.stringify(next)) } catch {}
      return next
    })
  }
  const [currentDim, setCurrentDim] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isCoach, setIsCoach] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        if (data.role === 'coach') setIsCoach(true)
      }
      // Double-check via team_memberships
      const { data: cm } = await supabase.from('team_memberships').select('id').eq('user_id', user.id).eq('role_in_team', 'coach').limit(1)
      if (cm && cm.length > 0) setIsCoach(true)
    }
    load()
  }, [])

  const qKey = isCoach ? 'trainer_personality' as const : 'player_selftest' as const
  const questionnaire = getQuestionnaire(qKey)
  const questions = questionnaire.questions

  const dim = DIM_ORDER[currentDim]
  const dimMeta = DIMENSION_META[dim]
  const dimQuestions = questions.filter(q => q.dimension === dim)
  const totalDims = DIM_ORDER.length
  const progress = Math.round(((currentDim + 1) / totalDims) * 100)

  const answeredInDim = dimQuestions.filter(q => answers[q.id] !== undefined).length
  const allAnsweredInDim = answeredInDim === dimQuestions.length

  function setAnswer(qId: number, val: number) {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    // Calculate type using service layer
    const scoringQs = getScoringQuestions(qKey)
    const scoring = calculateType(answers, scoringQs)
    const code = scoring.code
    const typeData = getType(code)
    const family = scoring.family
    const dimScores = scoring.dimensions

    // Save to Supabase
    const qId = isCoach ? '00000000-0000-0000-0000-000000000003' : '00000000-0000-0000-0000-000000000001'
    const { data: sub } = await supabase.from('survey_submissions').insert({
      questionnaire_id: qId, submitted_by: user.id,
      subject_user_id: user.id, status: 'submitted',
      submitted_at: new Date().toISOString()
    }).select().single()

    if (sub) {
      // Save type result with complete answer data
      await supabase.from('type_results').insert({
        submission_id: sub.id, user_id: user.id,
        result_type: code, result_label: typeData?.name || code,
        confidence_score: Math.round(
          DIMENSIONS.reduce((s, d) => s + Math.abs(dimScores[d.key as keyof typeof dimScores].pct - 50), 0) / 4 * 2
        ),
        scoring_json: { emoji: typeData?.emoji, family, dimScores, answers },
        category_scores: Object.fromEntries(
          DIMENSIONS.map(d => [d.key, dimScores[d.key as keyof typeof dimScores].pct])
        )
      })
    }

    try { localStorage.removeItem('humatrix_test_draft') } catch {}
    setResult({ code, typeData, family, dimScores })
    } catch (err) { console.error('Submit error:', err); alert('Fehler beim Speichern. Bitte erneut versuchen.') }
    setSubmitting(false)
  }

  // ── RESULT SCREEN ──
  if (result) {
    const ty = result.typeData || {}
    const fam = FAMILY_META[result.family as keyof typeof FAMILY_META]
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{ty.emoji || '🧬'}</div>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: fam?.color }}>{fam?.icon} {fam?.name}</div>
          <h2 className="text-4xl font-extrabold mb-2" style={{ fontFamily: 'Barlow Condensed', color: ty.color }}>
            {ty.name}
          </h2>
          <div className="text-lg font-semibold mb-1" style={{ color: 'var(--muted)' }}>{result.code}</div>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text)' }}>{ty.desc}</p>
          <div className="mt-4 rounded-lg p-3 text-sm max-w-md mx-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--muted)' }}>
            Das ist dein <strong style={{ color: 'white' }}>dominanter Typ</strong> — deine stärkste Ausprägung. Die Balken zeigen dein vollständiges Profil auf allen 4 Dimensionen.
          </div>
        </div>

        {/* Dimension Bars */}
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--cyan)' }}>Dein Profil</div>
          {DIMENSIONS.map(d => {
            const sc = result.dimScores[d.key]
            const meta = DIMENSION_META[d.key as keyof typeof DIMENSION_META]
            return (
              <div key={d.key} className="mb-5">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span style={{ color: meta.colorA }}>{meta.poleA}</span>
                  <span style={{ color: 'var(--muted)' }}>{meta.label}</span>
                  <span style={{ color: meta.colorB }}>{meta.poleB}</span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="absolute h-full rounded-full transition-all duration-700" style={{
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
        </div>

        {/* Coaching Cards */}
        {ty.coachDo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-5" style={{ background: 'rgba(61,186,111,0.05)', border: '1px solid rgba(61,186,111,0.15)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#3DBA6F' }}>✓ Stärken</div>
              {ty.strengths?.map((s: string, i: number) => (
                <div key={i} className="text-sm mb-2 pl-4 relative" style={{ color: 'var(--text)' }}>
                  <span className="absolute left-0" style={{ color: '#3DBA6F' }}>→</span>{s}
                </div>
              ))}
            </div>
            <div className="rounded-xl p-5" style={{ background: 'rgba(224,85,85,0.04)', border: '1px solid rgba(224,85,85,0.12)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#E05555' }}>⚠ Risiken</div>
              {ty.risks?.map((r: string, i: number) => (
                <div key={i} className="text-sm mb-2 pl-4 relative" style={{ color: 'var(--text)' }}>
                  <span className="absolute left-0" style={{ color: '#E05555' }}>!</span>{r}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <a href="/dashboard/results" className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider"
            style={{ background: 'var(--cyan)', color: 'var(--navy)' }}>Ergebnisse ansehen</a>
          <a href="/dashboard" className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'var(--muted)' }}>Dashboard</a>
        </div>
      </div>
    )
  }

  // ── TEST UI ──
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: dimMeta.colorA }}>
          {dimMeta.icon} {dimMeta.label} · Block {currentDim + 1}/{totalDims}
        </div>
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Barlow Condensed' }}>
          {isCoach ? 'Trainer' : 'Spieler'}-<span style={{ color: 'var(--cyan)' }}>Selbsttest</span>
        {Object.keys(answers).length > 0 && Object.keys(answers).length < questions.length && (
          <span className="ml-3 text-xs font-normal px-2 py-1 rounded" style={{ background: 'rgba(200,146,42,0.12)', color: 'var(--gold)', border: '1px solid rgba(200,146,42,0.3)' }}>
            Entwurf · {Object.keys(answers).length} gespeichert
          </span>
        )}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {dimMeta.poleA} vs. {dimMeta.poleB} · {dimQuestions.length} Fragen
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {DIM_ORDER.map((d, i) => (
          <div key={d} className="flex-1 h-1.5 rounded-full" style={{
            background: i <= currentDim ? DIMENSION_META[d].colorA : 'rgba(255,255,255,0.06)'
          }} />
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {dimQuestions.map(q => (
          <div key={q.id} className="rounded-xl p-4" style={{
            background: answers[q.id] !== undefined ? `${dimMeta.colorA}08` : 'var(--navy2)',
            border: answers[q.id] !== undefined ? `1px solid ${dimMeta.colorA}30` : '1px solid rgba(255,255,255,0.06)'
          }}>
            <div className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>
              <span className="text-xs font-bold mr-2" style={{ color: dimMeta.colorA, opacity: 0.5 }}>{q.id}</span>
              {q.text}
            </div>
            <div className="flex gap-0">
              {[1,2,3,4,5,6,7].map(val => (
                <button key={val} onClick={() => setAnswerAndSave(q.id, val)}
                  className="flex-1 py-2.5 text-center transition-all"
                  style={{
                    background: answers[q.id] === val ? `${dimMeta.colorA}20` : 'transparent',
                    borderBottom: answers[q.id] === val ? `2px solid ${dimMeta.colorA}` : '2px solid rgba(255,255,255,0.06)',
                    color: answers[q.id] === val ? dimMeta.colorA : 'rgba(255,255,255,0.3)',
                    fontFamily: 'Barlow Condensed', fontSize: 17, fontWeight: 700
                  }}>{val}</button>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-1 px-1" style={{ color: 'rgba(255,255,255,0.15)' }}>
              <span>Trifft gar nicht zu</span><span>Trifft voll zu</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pb-8">
        <button onClick={() => setCurrentDim(Math.max(0, currentDim - 1))} disabled={currentDim === 0}
          className="px-5 py-3 rounded-lg text-sm font-bold disabled:opacity-30"
          style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'var(--muted)' }}>← Zurück</button>
        {currentDim < totalDims - 1 ? (
          <button onClick={() => setCurrentDim(currentDim + 1)}
            className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider"
            style={{ background: dimMeta.colorA, color: 'var(--navy)' }}>Weiter →</button>
        ) : (() => {
            const totalAnswered = Object.keys(answers).length
            const totalRequired = questions.length
            const allDone = totalAnswered >= totalRequired
            return (
              <div className="text-right">
                {!allDone && <div className="text-xs mb-2" style={{ color: 'var(--gold)' }}>
                  {totalAnswered}/{totalRequired} Fragen beantwortet
                </div>}
                <button onClick={() => { if (confirm('Test wirklich abschließen? Antworten können danach nicht mehr geändert werden.')) handleSubmit() }}
                  disabled={submitting || !allDone}
                  className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider disabled:opacity-50"
                  style={{ background: allDone ? '#3DBA6F' : 'rgba(255,255,255,0.1)', color: allDone ? 'var(--navy)' : 'var(--muted)' }}>
                  {submitting ? '⏳ Wird berechnet...' : allDone ? '✓ Test abschließen' : `Noch ${totalRequired - totalAnswered} Fragen offen`}</button>
              </div>
            )
          })()}
      </div>
    </div>
  )
}
