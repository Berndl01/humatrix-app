# Humatrix Web-App – Deployment Anleitung

## Schritt 1: Supabase Projekt erstellen

1. Gehe zu https://supabase.com → "Start your project"
2. Erstelle ein neues Projekt (Name: "humatrix", Region: Frankfurt)
3. Warte bis das Projekt bereit ist (~2 Minuten)

## Schritt 2: Datenbank einrichten

1. Gehe zu **SQL Editor** im Supabase Dashboard
2. Klicke "New Query"
3. Kopiere den GESAMTEN Inhalt von `supabase/schema.sql` → Execute
4. Neue Query → Kopiere den GESAMTEN Inhalt von `supabase/seed.sql` → Execute
5. Prüfe unter **Table Editor** ob die Tabellen erstellt wurden

## Schritt 3: Supabase Keys kopieren

1. Gehe zu **Settings → API**
2. Kopiere "Project URL" (z.B. https://abc123.supabase.co)
3. Kopiere "anon public" Key

## Schritt 4: App konfigurieren

Erstelle eine `.env.local` Datei im Projektordner:

```
NEXT_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key-hier
```

## Schritt 5: Lokal testen

```bash
npm install
npm run dev
```

Öffne http://localhost:3000

## Schritt 6: Deployment auf Vercel (empfohlen)

1. Gehe zu https://vercel.com
2. "Import Project" → wähle den humatrix-app Ordner
3. Unter "Environment Variables" die beiden Supabase-Werte eintragen
4. Deploy

Alternativ via CLI:
```bash
npx vercel
```

## Schritt 7: Ersten Benutzer anlegen

1. Registriere dich auf der App als **Trainer**
2. In Supabase Dashboard → SQL Editor:

```sql
-- Deine User-ID findest du unter Authentication → Users
INSERT INTO team_memberships (user_id, team_id, role_in_team)
VALUES ('DEINE-USER-ID', '00000000-0000-0000-0000-000000000020', 'coach');
```

3. Registriere einen **Spieler** und ordne ihn ebenso zu:

```sql
INSERT INTO team_memberships (user_id, team_id, role_in_team)
VALUES ('SPIELER-USER-ID', '00000000-0000-0000-0000-000000000020', 'player');
```

## Projektstruktur

```
humatrix-app/
├── supabase/
│   ├── schema.sql              # 15 Tabellen + RLS + 16 Typen
│   └── seed.sql                # 128 Fragen + SV Zams
├── src/
│   ├── app/
│   │   ├── login/              # Anmeldung
│   │   ├── register/           # Registrierung (Spieler/Trainer)
│   │   ├── reset-password/     # Passwort vergessen
│   │   └── dashboard/
│   │       ├── player/         # Spieler-Dashboard
│   │       ├── coach/          # Trainer-Dashboard
│   │       ├── test/           # Selbsttest (68 Fragen / 16 Trainer)
│   │       ├── rate/           # Spieler bewerten (20 Fragen)
│   │       ├── team/           # Mannschaft + Team-DNA
│   │       ├── results/        # Ergebnisse + Verlauf
│   │       └── profile/        # Profil bearbeiten
│   ├── lib/
│   │   ├── scoring/engine.ts   # Sporttyp Scoring (doCalc/makeCode)
│   │   ├── sporttyp-data.json  # 16 Typen komplett
│   │   ├── sporttyp-questions.json  # 128 Fragen
│   │   ├── sporttyp-constants.ts    # Dimensionen, Gruppen, Anker
│   │   ├── types.ts            # TypeScript Typen
│   │   └── supabase/           # Client + Server
│   └── middleware.ts           # Auth-Schutz
├── DEPLOYMENT.md               # Diese Anleitung
└── .env.local.example          # Vorlage
```
