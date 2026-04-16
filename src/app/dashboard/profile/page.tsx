'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', birth_date: '', position: '', jersey_number: '', preferred_foot: '', height_cm: '', weight_kg: '', previous_clubs: '' })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm(prev => ({ ...prev, first_name: data.first_name || '', last_name: data.last_name || '', phone: data.phone || '', birth_date: '', position: '', jersey_number: '' }))
        // Load player profile details
        const { data: pp } = await supabase.from('player_profiles').select('*').eq('user_id', user.id).limit(1)
        if (pp?.length) {
          setForm(f => ({ ...f, birth_date: pp[0].birth_date || '', position: pp[0].position || '', jersey_number: pp[0].jersey_number ? String(pp[0].jersey_number) : '', preferred_foot: pp[0].preferred_foot || '', height_cm: pp[0].height_cm ? String(pp[0].height_cm) : '', weight_kg: pp[0].weight_kg ? String(pp[0].weight_kg) : '', previous_clubs: pp[0].previous_clubs || '' }))
        }
      }
    } catch (err) { console.error("Load error:", err) }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone || null,
    }).eq('id', profile.id)
    // Update player profile if exists
    if (form.birth_date || form.position || form.jersey_number || form.preferred_foot || form.height_cm || form.weight_kg) {
      // Find team membership for club/team context
      const { data: membership } = await supabase.from('team_memberships').select('team_id').eq('user_id', profile.id).limit(1)
      const teamId = membership?.[0]?.team_id || null
      const { data: teamData } = teamId ? await supabase.from('teams').select('club_id').eq('id', teamId).single() : { data: null }
      await supabase.from('player_profiles').upsert({
        user_id: profile.id,
        club_id: teamData?.club_id || null,
        team_id: teamId,
  
        birth_date: form.birth_date || null,
        position: form.position || null,
        jersey_number: form.jersey_number ? parseInt(form.jersey_number) : null,
        preferred_foot: form.preferred_foot || null,
        height_cm: form.height_cm ? parseInt(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseInt(form.weight_kg) : null,
        previous_clubs: form.previous_clubs || null,
      }, { onConflict: 'user_id' })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!profile) return <div style={{ color: 'var(--muted)' }}>Lade Profil...</div>

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8" style={{ fontFamily: 'Barlow Condensed' }}>
        Mein <span style={{ color: 'var(--cyan)' }}>Profil</span>
      </h1>

      <div className="rounded-xl p-6" style={{ background: 'var(--navy2)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: 'rgba(47,167,188,0.12)', border: '2px solid rgba(47,167,188,0.3)', color: 'var(--cyan)' }}>
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
          <div>
            <div className="text-lg font-bold">{profile.first_name} {profile.last_name}</div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>{profile.email}</div>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase"
              style={{
                background: profile.role === 'coach' ? 'rgba(200,146,42,0.12)' : 'rgba(47,167,188,0.12)',
                color: profile.role === 'coach' ? 'var(--gold)' : 'var(--cyan)',
                border: `1px solid ${profile.role === 'coach' ? 'rgba(200,146,42,0.3)' : 'rgba(47,167,188,0.3)'}`
              }}>
              {profile.role === 'coach' ? 'Trainer' : 'Spieler'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Vorname</label>
              <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Nachname</label>
              <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Telefon</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+43 676 ..."
              className="w-full rounded-lg px-4 py-3 text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Geburtsdatum</label>
              <input type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Position</label>
              <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <option value="" style={{ background: '#061828' }}>–</option>
                <option value="Tor" style={{ background: '#061828' }}>Tor</option>
                <option value="Abwehr" style={{ background: '#061828' }}>Abwehr</option>
                <option value="Mittelfeld" style={{ background: '#061828' }}>Mittelfeld</option>
                <option value="Sturm" style={{ background: '#061828' }}>Sturm</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Rückennummer</label>
              <input type="number" min="1" max="99" value={form.jersey_number} onChange={e => setForm({ ...form, jersey_number: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                placeholder="#" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Starker Fuß</label>
              <select value={form.preferred_foot} onChange={e => setForm({ ...form, preferred_foot: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <option value="" style={{ background: '#061828' }}>–</option>
                <option value="rechts" style={{ background: '#061828' }}>Rechts</option>
                <option value="links" style={{ background: '#061828' }}>Links</option>
                <option value="beidfüßig" style={{ background: '#061828' }}>Beidfüßig</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Größe (cm)</label>
              <input type="number" min="150" max="210" value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                placeholder="178" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Gewicht (kg)</label>
              <input type="number" min="50" max="120" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                placeholder="75" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>Bisherige Vereine</label>
            <input type="text" value={form.previous_clubs} onChange={e => setForm({ ...form, previous_clubs: e.target.value })}
              className="w-full rounded-lg px-4 py-3 text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
              placeholder="z.B. SV Innsbruck, FC Wacker" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>E-Mail</label>
            <input type="email" value={profile.email} disabled
              className="w-full rounded-lg px-4 py-3 text-white outline-none opacity-50"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving}
              className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
              style={{ background: 'var(--cyan)', color: 'var(--navy)' }}>
              {saving ? '⏳ Speichern...' : '→ Speichern'}
            </button>
            {saved && (
              <span className="text-sm font-bold" style={{ color: 'var(--green)' }}>✓ Gespeichert</span>
            )}
          </div>
        </form>
      </div>

      <div className="text-xs mt-8" style={{ color: 'rgba(255,255,255,0.15)' }}>
        Konto erstellt: {new Date(profile.created_at).toLocaleDateString('de-AT')}
      </div>
    </div>
  )
}
