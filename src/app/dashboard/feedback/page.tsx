'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('coach_feedback').select('*')
        .eq('player_user_id', user.id).eq('is_visible_to_player', true)
        .order('created_at', { ascending: false })
      if (data) setFeedback(data)
      setLoading(false)
    } catch (err) { console.error(err) }
    }
    load()
  }, [])

  if (loading) return <div style={{ color: 'var(--muted)' }}>Lade Feedback...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
        Trainer-<span style={{ color: 'var(--cyan)' }}>Feedback</span>
      </h1>
      <p className="mb-8" style={{ color: 'var(--muted)' }}>Rückmeldungen deines Trainers, die für dich freigegeben wurden.</p>

      {feedback.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-5xl mb-4 opacity-30">💬</div>
          <div className="text-lg font-bold mb-2">Noch kein Feedback</div>
          <div style={{ color: 'var(--muted)' }}>Sobald dein Trainer dir Feedback freigibt, erscheint es hier.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map(fb => (
            <div key={fb.id} className="rounded-xl p-5" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {fb.title && <div className="font-bold mb-2 text-lg">{fb.title}</div>}
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{fb.feedback_text}</div>
              <div className="text-xs mt-4 pt-3" style={{ color: 'var(--muted)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {new Date(fb.created_at).toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
