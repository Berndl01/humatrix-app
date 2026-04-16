-- ═══════════════════════════════════════════════════════════════
-- HUMATRIX – Test User Setup
-- Run AFTER a user has registered via the app
-- Replace the UUIDs with actual user IDs from auth.users
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Find your user IDs
-- SELECT id, email, raw_user_meta_data->>'role' as role FROM auth.users;

-- Step 2: Assign trainer to SV Zams
-- INSERT INTO team_memberships (user_id, team_id, role_in_team)
-- VALUES ('TRAINER-UUID-HERE', '00000000-0000-0000-0000-000000000020', 'coach');

-- Step 3: Assign players to SV Zams
-- INSERT INTO team_memberships (user_id, team_id, role_in_team)
-- VALUES
--   ('SPIELER-1-UUID', '00000000-0000-0000-0000-000000000020', 'player'),
--   ('SPIELER-2-UUID', '00000000-0000-0000-0000-000000000020', 'player'),
--   ('SPIELER-3-UUID', '00000000-0000-0000-0000-000000000020', 'player');

-- Step 4: Create player profiles
-- INSERT INTO player_profiles (user_id, club_id, team_id, position, jersey_number)
-- VALUES
--   ('SPIELER-1-UUID', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', 'Mittelfeld', 10),
--   ('SPIELER-2-UUID', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', 'Sturm', 9),
--   ('SPIELER-3-UUID', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', 'Abwehr', 4);

-- ═══ Empfohlene Test-Accounts ═══
-- 1. bernhard@humatrix.cc  → Trainer (Coach)
-- 2. spieler1@test.com     → Spieler (macht Selbsttest → wird WSAF Commander)
-- 3. spieler2@test.com     → Spieler (macht Selbsttest → wird ETID Verbinder)
-- 4. spieler3@test.com     → Spieler (macht Selbsttest → wird ESAF Architekt)
