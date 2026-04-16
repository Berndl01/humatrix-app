# HUMATRIX Web-App – Schritt-für-Schritt Anleitung

## Was du brauchst
- Einen Browser
- Ein kostenloses Supabase-Konto (supabase.com)
- Ein kostenloses Vercel-Konto (vercel.com) ODER Node.js auf deinem Rechner
- Die Dateien aus diesem Paket (humatrix-app Ordner)

---

## SCHRITT 1: Supabase Projekt erstellen (5 Minuten)

1. Gehe zu https://supabase.com → "Start your project"
2. Melde dich an (GitHub oder E-Mail)
3. Klicke "New Project"
4. Fülle aus:
   - **Name:** humatrix
   - **Database Password:** ein sicheres Passwort (aufschreiben!)
   - **Region:** Frankfurt (eu-central-1) ← WICHTIG: Daten in Deutschland
5. Klicke "Create new project"
6. Warte 1-2 Minuten bis "Project is ready" erscheint

---

## SCHRITT 2: Datenbank einrichten (3 Minuten)

1. Im Supabase Dashboard: klicke links auf **"SQL Editor"**
2. Klicke **"New Query"**
3. Öffne die Datei `supabase/schema.sql` mit einem Texteditor
4. Kopiere den GESAMTEN Inhalt → Füge ihn im SQL Editor ein
5. Klicke den grünen **"Run"** Button
6. Du solltest "Success" sehen

7. Klicke nochmal **"New Query"**
8. Öffne die Datei `supabase/seed.sql`
9. Kopiere den GESAMTEN Inhalt → Füge ihn ein
10. Klicke **"Run"**
11. Du solltest "Success" sehen

**Prüfung:** Klicke links auf "Table Editor" → Du solltest Tabellen sehen:
profiles, clubs, teams, questionnaires, questions, etc.

---

## SCHRITT 3: Supabase Keys kopieren (1 Minute)

1. Klicke links auf **"Settings"** (Zahnrad unten)
2. Klicke auf **"API"**
3. Du siehst zwei wichtige Werte:

   **Project URL** → sieht aus wie:
   ```
   https://abcdefghijk.supabase.co
   ```

   **anon public** Key → langer Text der mit `eyJ...` beginnt

4. Kopiere BEIDE Werte (du brauchst sie gleich)

---

## SCHRITT 4: App starten

### Option A: Lokal auf deinem Rechner (zum Testen)

1. Stelle sicher dass Node.js installiert ist (nodejs.org → LTS Version)
2. Öffne ein Terminal/Kommandozeile
3. Gehe in den humatrix-app Ordner:
   ```
   cd pfad/zu/humatrix-app
   ```
4. Erstelle eine Datei `.env.local` im Ordner mit diesem Inhalt:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key-hier
   ```
   (ersetze mit deinen echten Werten aus Schritt 3)

5. Installiere die Abhängigkeiten:
   ```
   npm install
   ```
6. Starte die App:
   ```
   npm run dev
   ```
7. Öffne im Browser: **http://localhost:3000**

### Option B: Online stellen mit Vercel (empfohlen)

1. Gehe zu https://vercel.com → "Sign Up" (mit GitHub)
2. Lade den humatrix-app Ordner als GitHub Repository hoch
   ODER nutze die Vercel CLI:
   ```
   cd humatrix-app
   npx vercel
   ```
3. Bei der Konfiguration:
   - **Framework:** Next.js (wird automatisch erkannt)
   - **Environment Variables:** Füge hinzu:
     - `NEXT_PUBLIC_SUPABASE_URL` = deine Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = dein anon Key
4. Deploy → du bekommst eine URL wie `humatrix-app.vercel.app`


### Option C: Online stellen mit Netlify (du kennst das bereits)

1. Gehe zu https://app.netlify.com
2. **"Add new site"** → **"Deploy manually"**

   ABER: Next.js ist kein einfaches HTML — du kannst es NICHT einfach per Drag & Drop hochladen.
   Stattdessen:

   **Variante 1: Über GitHub (empfohlen)**
   1. Lade den humatrix-app Ordner als GitHub Repository hoch
   2. In Netlify: "Import from Git" → Repository wählen
   3. Build settings werden automatisch erkannt (netlify.toml)
   4. Unter "Environment Variables" eintragen:
      - `NEXT_PUBLIC_SUPABASE_URL` = deine Supabase URL
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = dein anon Key
   5. "Deploy" → fertig

   **Variante 2: Über Netlify CLI**
   ```
   npm install -g netlify-cli
   cd humatrix-app
   netlify login
   netlify init
   netlify deploy --build --prod
   ```
   Bei der Konfiguration die Environment Variables eintragen.

   **Custom Domain:** Unter Site Settings → Domain Management
   z.B. `app.humatrix.cc` als CNAME auf die Netlify-URL zeigen (World4You DNS)

---

## SCHRITT 5: Ersten Trainer anlegen (2 Minuten)

1. Öffne die App im Browser (localhost:3000 oder Vercel-URL)
2. Klicke **"Jetzt registrieren"**
3. Wähle **"Trainer"**
4. Gib ein:
   - Vorname: Bernhard
   - Nachname: Lampl
   - E-Mail: bernhard@humatrix.cc
   - Passwort: (mindestens 6 Zeichen)
5. Klicke "Konto erstellen"

6. Jetzt muss der Trainer dem SV Zams zugeordnet werden:
   - Gehe zurück zu Supabase Dashboard
   - Klicke auf **"Authentication"** (links)
   - Du siehst deinen neuen User → kopiere die **User ID** (UUID)
   - Gehe zu **"SQL Editor"** → "New Query"
   - Füge ein:
   ```sql
   INSERT INTO team_memberships (user_id, team_id, role_in_team)
   VALUES ('HIER-DEINE-USER-ID', '00000000-0000-0000-0000-000000000020', 'coach');
   ```
   - Ersetze `HIER-DEINE-USER-ID` mit der kopierten UUID
   - Klicke "Run"

7. Gehe zurück zur App → Lade die Seite neu → Du siehst das Trainer-Dashboard

---

## SCHRITT 6: Test-Spieler anlegen (2 Minuten)

1. Öffne die App in einem **anderen Browser** oder **Inkognito-Fenster**
2. Registriere dich als **"Spieler"**
   - z.B. Max Muster, spieler1@test.com
3. In Supabase → Authentication → User ID kopieren
4. SQL Editor:
   ```sql
   INSERT INTO team_memberships (user_id, team_id, role_in_team)
   VALUES ('SPIELER-USER-ID', '00000000-0000-0000-0000-000000000020', 'player');
   ```
5. Spieler-App neu laden → Spieler sieht sein Dashboard
6. Spieler kann jetzt den Selbsttest starten

Wiederhole für weitere Spieler.

---

## SCHRITT 7: Testen

### Als Spieler:
1. Selbsttest starten (68 Fragen)
2. Ergebnis ansehen → Sporttyp + 4 Dimensionen
3. Profil bearbeiten (Position, Rückennummer)

### Als Trainer:
1. Dashboard → Spielerliste sehen
2. Auf Spieler klicken → Detail-Seite
3. Bewertung starten (20 Fragen)
4. Vergleich Self vs. Coach sehen
5. Feedback senden (sichtbar/intern)
6. Befragung versenden (Batterie A-E)
7. Trends ansehen

---

## Zusammenfassung

| Was | Wo |
|-----|-----|
| Datenbank | Supabase (Frankfurt, Deutschland) |
| Frontend | Vercel oder lokal |
| Daten | PostgreSQL, verschlüsselt, DSGVO-konform |
| Zugang | E-Mail + Passwort |
| Rechte | Row Level Security auf allen Tabellen |
