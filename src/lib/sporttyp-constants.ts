// Auto-generated from sporttyp.humatrix.cc
import typesData from './sporttyp-data.json'
import questionsData from './sporttyp-questions.json'

export const SPORTTYP_TYPES = typesData as Record<string, SporttypType>
export const SPORTTYP_QUESTIONS = questionsData as {
  player_selftest: SporttypQuestion[]
  external_assessment: SporttypQuestion[]
  trainer_personality: SporttypQuestion[]
  trainer_coaching: SporttypQuestion[]
}

export interface SporttypType {
  name: string; family: string; tagline: string; emoji: string
  color: string; desc: string; strengths: string[]; risks: string[]
  playerDo: string[]; playerDont: string[]; coachDo: string[]
  coachDont: string[]; why: string[]; whyNot: string[]; selfDev: string[]
}

export interface SporttypQuestion {
  id: number; dim: string; pole: string; text: string
}

export const DIMENSION_META = {
  drive:  { label: 'Antrieb',    poleA: 'Entwicklung',  poleB: 'Wettkampf',    colorA: '#34D399', colorB: '#F59E0B', icon: '🎯' },
  energy: { label: 'Energie',    poleA: 'Eigenständig', poleB: 'Teamgebunden', colorA: '#A78BFA', colorB: '#60A5FA', icon: '⚡' },
  mental: { label: 'Mentalität', poleA: 'Stabil',       poleB: 'Intensiv',     colorA: '#2FA7BC', colorB: '#FB923C', icon: '🧠' },
  role:   { label: 'Rolle',      poleA: 'Führend',      poleB: 'Adaptiv',      colorA: '#F87171', colorB: '#34D399', icon: '👑' },
} as const

export const FAMILY_META = {
  str: { name: 'Strategen',   color: '#A78BFA', icon: '💜', desc: 'Strategische Tiefe — taktisches Denken, individuelle Entwicklung, Spielintelligenz.',
    lack: 'Ohne sie fehlt taktische Variabilität und langfristige Spielerentwicklung.',
    excess: 'Zu viele → Überanalyse, zu wenig Zweikampfhärte und emotionale Intensität.' },
  tfo: { name: 'Teamformer',  color: '#60A5FA', icon: '💙', desc: 'Sozialer Kitt — Kabine zusammenhalten, Vertrauen aufbauen, integrieren.',
    lack: 'Ohne sie zerfällt die Mannschaftschemie — Grüppchenbildung und gescheiterte Neuzugänge.',
    excess: 'Zu viele → Harmoniebedürfnis überwiegt, zu wenig Leistungsdruck.' },
  per: { name: 'Performer',   color: '#F59E0B', icon: '💛', desc: 'Wettkampfkraft — in den entscheidenden 90 Minuten den Unterschied machen.',
    lack: 'Ohne sie fehlen Spieler die in Drucksituationen liefern.',
    excess: 'Zu viele → Ego-Konflikte, Konkurrenzkampf statt Zusammenarbeit.' },
  lea: { name: 'Anführer',    color: '#F87171', icon: '❤️', desc: 'Emotionale Führung — vorangehen, Kabinenansprache, in Krisen aufstehen.',
    lack: 'Ohne sie fehlt emotionale Führung — nach Rückständen bricht die Mannschaft ein.',
    excess: 'Zu viele → Machtkämpfe, zu viele Alphatiere.' },
} as const

export const ANCHOR_METRICS = [
  { key: 'satisfaction', label: 'Zufriedenheit', icon: '😊',
    question: 'Wie zufrieden bist du aktuell insgesamt mit deiner Situation im Team?',
    what: 'Wie wohl fühlen sich die Spieler im Team- und Trainingsalltag?',
    basis: 'Athlete Satisfaction Questionnaire (Riemer & Chelladurai, 1998)',
    high: 'Spieler fühlt sich wohl, ist im Flow. Keine Intervention nötig.',
    mid: 'Ambivalenz. Irgendetwas stimmt nicht. Zeitpunkt für ein kurzes Gespräch.',
    low: 'Aktiver Handlungsbedarf. Ursache klären.' },
  { key: 'psych_safety', label: 'Psych. Sicherheit', icon: '🛡️',
    question: 'Ich kann im Team offen sagen, was ich denke, ohne negative Folgen befürchten zu müssen.',
    what: 'Trauen sich Spieler ehrlich zu sprechen, Fehler zuzugeben, Fragen zu stellen?',
    basis: 'Team Psychological Safety (Edmondson, 1999)',
    high: 'Offene Fehlerkultur. Spieler sprechen Probleme an.',
    mid: 'Oberflächliche Harmonie. Spieler sagen was der Trainer hören will.',
    low: 'Angstklima. Spieler verstecken Fehler, vermeiden Feedback.' },
  { key: 'commitment', label: 'Bindung', icon: '🔗',
    question: 'Ich sehe mich auch in der nächsten Phase / Saison noch in diesem Team.',
    what: 'Gibt es innere Distanz, Frust oder mentale Abmeldung?',
    basis: 'Turnover Intention (Cuskelly & Boag, 2001)',
    high: 'Spieler ist committed. Sieht Zukunft im Verein.',
    mid: 'Ambivalenz. Jetzt ist der Moment für ein Bindungsgespräch.',
    low: 'Innerlich bereits gekündigt. Ohne Intervention ist Abgang wahrscheinlich.' },
  { key: 'alignment', label: 'Alignment', icon: '🧭',
    question: 'Ich weiß genau, was meine Rolle ist und was das Team aktuell von mir erwartet.',
    what: 'Versteht der Spieler Rolle, Erwartungen, Spielidee und Prioritäten?',
    basis: 'Role Clarity (Beauchamp et al., 2002) · Leadership Alignment (r≈.69, R²≈.49)',
    high: 'Klare Kommunikation. Spieler weiß was er tun soll und warum.',
    mid: 'Unschärfe. Spieler ahnt Rolle aber Details unklar. Nachschärfen.',
    low: 'Spieler tappt im Dunkeln. Dringendes Klärungsgespräch.' },
  { key: 'motivation', label: 'Motivation', icon: '🔥',
    question: 'Ich bin aktuell hoch motiviert, für dieses Team Leistung zu bringen.',
    what: 'Wie hoch sind Einsatzbereitschaft, Zugkraft und täglicher Drive?',
    basis: 'Self-Determination Theory (Deci & Ryan, 2000)',
    high: 'Spieler ist voll da. Hohe intrinsische Motivation.',
    mid: 'Motivation funktional aber nicht optimal. Routinegefahr.',
    low: 'Antriebslosigkeit. Mögliche Ursachen: Unter-/Überforderung, fehlende Wertschätzung.' },
] as const
