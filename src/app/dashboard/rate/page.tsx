'use client'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { SPORTTYP_QUESTIONS, SPORTTYP_TYPES, DIMENSION_META, FAMILY_META } from '@/lib/sporttyp-constants'
import { calculateDimensionScores, makeTypeCode, DIMENSIONS, TYPE_FAMILY } from '@/lib/scoring/engine'
import type { Question } from '@/lib/types'

const DIM_ORDER = ['drive', 'energy', 'mental', 'role'] as const

function RatePlayerInner() {
  const [player, setPlayer] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentDim, setCurrentDim] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selfResult, setSelfResult] = useState<any>(null)
  const searchParams = useSearchParams()
  const playerId = searchParams.get('player')
  const supabase = createClient()

  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    async function load() {
      try {
      if (!playerId) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Verify current user is coach AND player is in their team
      const { data: coachTeams } = await supabase
        .from('team_memberships').select('team_id')
        .eq('user_id', user.id).eq('role_in_team', 'coach')
      if (!coachTeams?.length) return

      const teamIds = coachTeams.map((t: any) => t.team_id)
      const { data: playerMembership } = await supabase
        .from('team_memberships').select('team_id')
        .eq('user_id', playerId).in('team_id', teamIds).limit(1)
      if (!playerMembership?.length) return // Not authorized

      setAuthorized(true)
      const { data } = await supabase.from('profiles').select('*').eq('id', playerId).single()
      if (data) setPlayer(data)

      // Load player's self-test result for comparison
      const { data: selfTypes } = await supabase.from('type_results').select('*')
        .eq('user_id', playerId).order('created_at', { ascending: false }).limit(1)
      if (selfTypes?.length) setSelfResult(selfTypes[0])
    } catch (err) { console.error("Load error:", err) }
    }
    load()
  }, [playerId])

  const questions = SPORTTYP_QUESTIONS.external_assessment
  const dim = DIM_ORDER[currentDim]
  const dimMeta = DIMENSION_META[dim]
  const dimQuestions = questions.filter(q => q.dim === dim)

  function setAnswer(qId: number, val: number) {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !playerId) return

    const engineQs: Question[] = questions.map(q => ({
      id: String(q.id), questionnaire_id: '', text: q.text,
      category: q.dim, question_type: 'scale' as const,
      scale_min: 1, scale_max: 7, scale_min_label: '', scale_max_label: '',
      is_reversed: q.pole === 'B', sort_order: q.id, is_required: true
    }))

    const dimScores = calculateDimensionScores(answers, engineQs)
    const code = makeTypeCode(dimScores)
    const typeData = SPORTTYP_TYPES[code]

    const { data: sub } = await supabase.from('survey_submissions').insert({
      questionnaire_id: '00000000-0000-0000-0000-000000000002',
      submitted_by: user.id, subject_user_id: playerId,
      status: 'submitted', submitted_at: new Date().toISOString()
    }).select().single()

    if (sub) {
      await supabase.from('type_results').insert({
        submission_id: sub.id, user_id: playerId,
        result_type: code, result_label: typeData?.name || code,
        confidence_score: null,
        scoring_json: { emoji: typeData?.emoji, source: 'coach', dimScores, answers },
        category_scores: Object.fromEntries(DIMENSIONS.map(d => [d.key, dimScores[d.key as keyof typeof dimScores].pct]))
      })

      // Create comparison if self-test exists
      if (selfResult) {
        const selfScores = selfResult.scoring_json?.dimScores || selfResult.category_scores
        if (selfScores) {
          let totalDiff = 0
          const diffs: Record<string, number> = {}
          for (const d of DIMENSIONS) {
            const selfPct = typeof selfScores[d.key] === 'object' ? selfScores[d.key].pct : (selfScores[d.key] || 50)
            const coachPct = dimScores[d.key as keyof typeof dimScores].pct
            diffs[d.key] = Math.abs(selfPct - coachPct)
            totalDiff += Math.abs(selfPct - coachPct)
          }
          await supabase.from('assessment_comparisons').insert({
            player_user_id: playerId,
            self_submission_id: selfResult.submission_id,
            coach_submission_id: sub.id,
            match_score: Math.round((1 - totalDiff / 400) * 100),
            differences_json: diffs
          })
        }
      }
    }

    setResult({ code, typeData, dimScores })
    setSubmitting(false)
  }

  if (!player && !authorized) return <div style={{ color: 'var(--muted)' }}>Keine Berechtigung oder Spieler nicht gefunden.</div>
  if (!player) return <div style={{ color: 'var(--muted)' }}>Lade Spieler...</div>

  if (result) {
    const ty = result.typeData || {}
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">{ty.emoji}</div>
        <h2 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Barlow Condensed', color: ty.color }}>
          {ty.name} ({result.code})
        </h2>
        <p className="mb-6" style={{ color: 'var(--muted)' }}>
          Deine Einschätzung von {player.first_name} {player.last_name}
        </p>
        {selfResult && (
          <div className="rounded-xl p-5 mb-6 text-left" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--cyan)' }}>Self vs. Coach Vergleich</div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm" style={{ color: 'var(--muted)' }}>Selbstbild:</span>
              <span className="font-bold">{selfResult.result_label} ({selfResult.result_type})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: 'var(--muted)' }}>Fremdbild:</span>
              <span className="font-bold">{ty.name} ({result.code})</span>
            </div>
          </div>
        )}
        <a href="/dashboard/team" className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider inline-block"
          style={{ background: 'var(--gold)', color: 'var(--navy)' }}>← Zurück zur Mannschaft</a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>
          Fremdeinschätzung · {player.first_name} {player.last_name}
        </div>
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Barlow Condensed' }}>
          Spieler-<span style={{ color: 'var(--gold)' }}>Bewertung</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {dimMeta.icon} {dimMeta.label} · {dimQuestions.length} Fragen · Block {currentDim+1}/4
        </p>
      </div>

      <div className="flex gap-1 mb-6">
        {DIM_ORDER.map((d, i) => (
          <div key={d} className="flex-1 h-1.5 rounded-full" style={{
            background: i <= currentDim ? 'var(--gold)' : 'rgba(255,255,255,0.06)'
          }} />
        ))}
      </div>

      <div className="space-y-3">
        {dimQuestions.map(q => (
          <div key={q.id} className="rounded-xl p-4" style={{
            background: answers[q.id] !== undefined ? 'rgba(200,146,42,0.06)' : 'var(--navy2)',
            border: answers[q.id] !== undefined ? '1px solid rgba(200,146,42,0.2)' : '1px solid rgba(255,255,255,0.06)'
          }}>
            <div className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>{q.text}</div>
            <div className="flex gap-0">
              {[1,2,3,4,5,6,7].map(val => (
                <button key={val} onClick={() => setAnswer(q.id, val)}
                  className="flex-1 py-2.5 text-center transition-all"
                  style={{
                    background: answers[q.id] === val ? 'rgba(200,146,42,0.15)' : 'transparent',
                    borderBottom: answers[q.id] === val ? '2px solid var(--gold)' : '2px solid rgba(255,255,255,0.06)',
                    color: answers[q.id] === val ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                    fontFamily: 'Barlow Condensed', fontSize: 17, fontWeight: 700
                  }}>{val}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8 pb-8">
        <button onClick={() => setCurrentDim(Math.max(0, currentDim - 1))} disabled={currentDim === 0}
          className="px-5 py-3 rounded-lg text-sm font-bold disabled:opacity-30"
          style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'var(--muted)' }}>← Zurück</button>
        {currentDim < 3 ? (
          <button onClick={() => setCurrentDim(currentDim + 1)}
            className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}>Weiter →</button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider disabled:opacity-50"
            style={{ background: '#3DBA6F', color: 'var(--navy)' }}>
            {submitting ? '⏳ ...' : '✓ Bewertung abschließen'}</button>
        )}
      </div>
    </div>
  )
}

export default function RatePlayerPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--muted)' }}>Lade...</div>}>
      <RatePlayerInner />
    </Suspense>
  )
}
