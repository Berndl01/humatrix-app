# Humatrix – Web-App MVP

Spielertypen systematisch erfassen, vergleichen und auswerten.

## Schnellstart

### 1. Supabase Projekt erstellen
1. supabase.com → neues Projekt
2. SQL Editor → `supabase/schema.sql` ausführen
3. SQL Editor → `supabase/seed.sql` ausführen
4. Settings → API → URL + anon key kopieren

### 2. Konfigurieren
```bash
cp .env.local.example .env.local
# URL und Key eintragen
```

### 3. Starten
```bash
npm install
npm run dev
```

### 4. Deployment
```bash
# Vercel (empfohlen)
npx vercel
```

## Tech Stack
- Next.js 15 + TypeScript + Tailwind
- Supabase (PostgreSQL + Auth + RLS)
- Modulare Scoring Engine
- Humatrix Design System
