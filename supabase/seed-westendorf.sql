-- ═══════════════════════════════════════════════════════════════════
-- SV WESTENDORF – Testdaten mit 20 Spielern
-- ═══════════════════════════════════════════════════════════════════

-- Verein
INSERT INTO clubs (id, name, country) VALUES
  ('00000000-0000-0000-0000-000000000030', 'SV Westendorf', 'AT')
ON CONFLICT DO NOTHING;

-- Mannschaft mit Invite-Code
INSERT INTO teams (id, name, season, club_id, invite_code) VALUES
  ('00000000-0000-0000-0000-000000000031', 'KM 1', '2025/26', '00000000-0000-0000-0000-000000000030', 'WEST26')
ON CONFLICT DO NOTHING;

-- 20 Spieler-Profile (UUIDs fest, damit Referenzen stimmen)
INSERT INTO profiles (id, email, first_name, last_name, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'lukas.hofer@test.at', 'Lukas', 'Hofer', 'player'),
  ('a0000000-0000-0000-0000-000000000002', 'thomas.gruber@test.at', 'Thomas', 'Gruber', 'player'),
  ('a0000000-0000-0000-0000-000000000003', 'stefan.maier@test.at', 'Stefan', 'Maier', 'player'),
  ('a0000000-0000-0000-0000-000000000004', 'michael.auer@test.at', 'Michael', 'Auer', 'player'),
  ('a0000000-0000-0000-0000-000000000005', 'daniel.egger@test.at', 'Daniel', 'Egger', 'player'),
  ('a0000000-0000-0000-0000-000000000006', 'markus.bacher@test.at', 'Markus', 'Bacher', 'player'),
  ('a0000000-0000-0000-0000-000000000007', 'florian.pichler@test.at', 'Florian', 'Pichler', 'player'),
  ('a0000000-0000-0000-0000-000000000008', 'patrick.koller@test.at', 'Patrick', 'Koller', 'player'),
  ('a0000000-0000-0000-0000-000000000009', 'david.winkler@test.at', 'David', 'Winkler', 'player'),
  ('a0000000-0000-0000-0000-000000000010', 'jakob.steiner@test.at', 'Jakob', 'Steiner', 'player'),
  ('a0000000-0000-0000-0000-000000000011', 'simon.huber@test.at', 'Simon', 'Huber', 'player'),
  ('a0000000-0000-0000-0000-000000000012', 'kevin.berger@test.at', 'Kevin', 'Berger', 'player'),
  ('a0000000-0000-0000-0000-000000000013', 'tobias.fuchs@test.at', 'Tobias', 'Fuchs', 'player'),
  ('a0000000-0000-0000-0000-000000000014', 'alexander.wolf@test.at', 'Alexander', 'Wolf', 'player'),
  ('a0000000-0000-0000-0000-000000000015', 'matthias.reiter@test.at', 'Matthias', 'Reiter', 'player'),
  ('a0000000-0000-0000-0000-000000000016', 'christoph.lang@test.at', 'Christoph', 'Lang', 'player'),
  ('a0000000-0000-0000-0000-000000000017', 'julian.moser@test.at', 'Julian', 'Moser', 'player'),
  ('a0000000-0000-0000-0000-000000000018', 'fabian.stock@test.at', 'Fabian', 'Stock', 'player'),
  ('a0000000-0000-0000-0000-000000000019', 'andreas.eder@test.at', 'Andreas', 'Eder', 'player'),
  ('a0000000-0000-0000-0000-000000000020', 'manuel.brunner@test.at', 'Manuel', 'Brunner', 'player')
ON CONFLICT (id) DO NOTHING;

-- Spielerprofile mit Position + Rückennummer
INSERT INTO player_profiles (user_id, club_id, team_id, position, jersey_number, birth_date, preferred_foot, height_cm, weight_kg, previous_clubs) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Tor', 1, '1998-03-15', 'rechts', 188, 84, 'FC Kirchberg'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Abwehr', 2, '2000-07-22', 'rechts', 182, 78, 'SV Hopfgarten'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Abwehr', 4, '1999-11-08', 'links', 185, 80, 'SC Kitzbühel'),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Abwehr', 5, '2001-01-30', 'rechts', 190, 85, 'FC Brixen'),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Abwehr', 3, '1997-05-12', 'rechts', 180, 76, 'SV Itter, WSG Tirol U18'),
  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Mittelfeld', 6, '2002-09-04', 'rechts', 175, 72, 'FC Söll'),
  ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Mittelfeld', 8, '2000-12-19', 'beidfüßig', 178, 74, 'SV Wörgl U18'),
  ('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Mittelfeld', 10, '1999-04-07', 'links', 176, 71, 'FC Kufstein'),
  ('a0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Mittelfeld', 14, '2003-08-25', 'rechts', 173, 68, 'SC Kundl'),
  ('a0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Mittelfeld', 7, '2001-06-11', 'rechts', 180, 75, 'SV Kirchdorf'),
  ('a0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Sturm', 9, '2000-02-28', 'rechts', 183, 79, 'FC Wacker Innsbruck U18'),
  ('a0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Sturm', 11, '2002-10-15', 'links', 177, 73, 'SV Hall'),
  ('a0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Abwehr', 13, '1998-07-03', 'rechts', 186, 82, 'SK Jenbach'),
  ('a0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Mittelfeld', 16, '2004-01-20', 'rechts', 172, 67, NULL),
  ('a0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Sturm', 17, '2001-11-09', 'rechts', 181, 77, 'SV Kramsach'),
  ('a0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Mittelfeld', 20, '2003-03-14', 'beidfüßig', 174, 70, NULL),
  ('a0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Abwehr', 22, '2002-06-28', 'links', 184, 79, 'FC Wildschönau'),
  ('a0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Sturm', 19, '2004-04-17', 'rechts', 179, 74, NULL),
  ('a0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Tor', 25, '2003-12-05', 'rechts', 191, 86, 'SV Breitenbach'),
  ('a0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000031', 'Mittelfeld', 21, '2001-08-22', 'rechts', 177, 73, 'FC Kelchsau')
ON CONFLICT DO NOTHING;

-- Team-Zuordnung alle 20 Spieler
INSERT INTO team_memberships (user_id, team_id, role_in_team) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000031', 'player'),
  ('a0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000031', 'player')
ON CONFLICT DO NOTHING;

-- ═══ TYPE RESULTS für 16 von 20 Spielern (4 noch offen) ═══
-- Verschiedene Typen für realistische Team-DNA

INSERT INTO type_results (user_id, result_type, result_label, confidence_score, scoring_json, category_scores) VALUES
-- Strategen (4)
('a0000000-0000-0000-0000-000000000001', 'ESAF', 'Der Architekt', 82, '{"emoji":"🏗️","family":"str","source":"self","dimensions":{"drive":{"pct":73,"letter":"E","label":"Entwicklung","aRaw":0.72,"bRaw":0.74,"aCount":9,"bCount":8},"energy":{"pct":68,"letter":"S","label":"Eigenständig","aRaw":0.65,"bRaw":0.71,"aCount":9,"bCount":8},"mental":{"pct":81,"letter":"A","label":"Stabil","aRaw":0.80,"bRaw":0.82,"aCount":9,"bCount":8},"role":{"pct":71,"letter":"F","label":"Führend","aRaw":0.70,"bRaw":0.72,"aCount":9,"bCount":8}}}', '{"drive":73,"energy":68,"mental":81,"role":71}'),
('a0000000-0000-0000-0000-000000000003', 'ESAD', 'Der Perfektionist', 76, '{"emoji":"🔬","family":"str","source":"self","dimensions":{"drive":{"pct":71,"letter":"E","label":"Entwicklung","aRaw":0.70,"bRaw":0.72,"aCount":9,"bCount":8},"energy":{"pct":65,"letter":"S","label":"Eigenständig","aRaw":0.63,"bRaw":0.67,"aCount":9,"bCount":8},"mental":{"pct":78,"letter":"A","label":"Stabil","aRaw":0.76,"bRaw":0.80,"aCount":9,"bCount":8},"role":{"pct":35,"letter":"D","label":"Adaptiv","aRaw":0.33,"bRaw":0.37,"aCount":9,"bCount":8}}}', '{"drive":71,"energy":65,"mental":78,"role":35}'),
('a0000000-0000-0000-0000-000000000008', 'ESIF', 'Der Innovator', 71, '{"emoji":"⚡","family":"str","source":"self","dimensions":{"drive":{"pct":67,"letter":"E","label":"Entwicklung","aRaw":0.65,"bRaw":0.69,"aCount":9,"bCount":8},"energy":{"pct":62,"letter":"S","label":"Eigenständig","aRaw":0.60,"bRaw":0.64,"aCount":9,"bCount":8},"mental":{"pct":38,"letter":"I","label":"Intensiv","aRaw":0.36,"bRaw":0.40,"aCount":9,"bCount":8},"role":{"pct":69,"letter":"F","label":"Führend","aRaw":0.67,"bRaw":0.71,"aCount":9,"bCount":8}}}', '{"drive":67,"energy":62,"mental":38,"role":69}'),
('a0000000-0000-0000-0000-000000000014', 'ESID', 'Der Künstler', 68, '{"emoji":"🎨","family":"str","source":"self","dimensions":{"drive":{"pct":64,"letter":"E","label":"Entwicklung","aRaw":0.62,"bRaw":0.66,"aCount":9,"bCount":8},"energy":{"pct":59,"letter":"S","label":"Eigenständig","aRaw":0.57,"bRaw":0.61,"aCount":9,"bCount":8},"mental":{"pct":33,"letter":"I","label":"Intensiv","aRaw":0.31,"bRaw":0.35,"aCount":9,"bCount":8},"role":{"pct":31,"letter":"D","label":"Adaptiv","aRaw":0.29,"bRaw":0.33,"aCount":9,"bCount":8}}}', '{"drive":64,"energy":59,"mental":33,"role":31}'),
-- Teamformer (4)
('a0000000-0000-0000-0000-000000000002', 'ETAF', 'Der Mentor', 85, '{"emoji":"🧭","family":"tfo","source":"self","dimensions":{"drive":{"pct":76,"letter":"E","label":"Entwicklung","aRaw":0.74,"bRaw":0.78,"aCount":9,"bCount":8},"energy":{"pct":32,"letter":"T","label":"Teamgebunden","aRaw":0.30,"bRaw":0.34,"aCount":9,"bCount":8},"mental":{"pct":82,"letter":"A","label":"Stabil","aRaw":0.80,"bRaw":0.84,"aCount":9,"bCount":8},"role":{"pct":74,"letter":"F","label":"Führend","aRaw":0.72,"bRaw":0.76,"aCount":9,"bCount":8}}}', '{"drive":76,"energy":32,"mental":82,"role":74}'),
('a0000000-0000-0000-0000-000000000006', 'ETAD', 'Der Teamarchitekt', 74, '{"emoji":"🏛️","family":"tfo","source":"self","dimensions":{"drive":{"pct":69,"letter":"E","label":"Entwicklung","aRaw":0.67,"bRaw":0.71,"aCount":9,"bCount":8},"energy":{"pct":28,"letter":"T","label":"Teamgebunden","aRaw":0.26,"bRaw":0.30,"aCount":9,"bCount":8},"mental":{"pct":75,"letter":"A","label":"Stabil","aRaw":0.73,"bRaw":0.77,"aCount":9,"bCount":8},"role":{"pct":38,"letter":"D","label":"Adaptiv","aRaw":0.36,"bRaw":0.40,"aCount":9,"bCount":8}}}', '{"drive":69,"energy":28,"mental":75,"role":38}'),
('a0000000-0000-0000-0000-000000000009', 'ETIF', 'Der Katalysator', 79, '{"emoji":"🔥","family":"tfo","source":"self","dimensions":{"drive":{"pct":72,"letter":"E","label":"Entwicklung","aRaw":0.70,"bRaw":0.74,"aCount":9,"bCount":8},"energy":{"pct":25,"letter":"T","label":"Teamgebunden","aRaw":0.23,"bRaw":0.27,"aCount":9,"bCount":8},"mental":{"pct":30,"letter":"I","label":"Intensiv","aRaw":0.28,"bRaw":0.32,"aCount":9,"bCount":8},"role":{"pct":77,"letter":"F","label":"Führend","aRaw":0.75,"bRaw":0.79,"aCount":9,"bCount":8}}}', '{"drive":72,"energy":25,"mental":30,"role":77}'),
('a0000000-0000-0000-0000-000000000013', 'ETID', 'Der Verbinder', 72, '{"emoji":"🤝","family":"tfo","source":"self","dimensions":{"drive":{"pct":66,"letter":"E","label":"Entwicklung","aRaw":0.64,"bRaw":0.68,"aCount":9,"bCount":8},"energy":{"pct":22,"letter":"T","label":"Teamgebunden","aRaw":0.20,"bRaw":0.24,"aCount":9,"bCount":8},"mental":{"pct":35,"letter":"I","label":"Intensiv","aRaw":0.33,"bRaw":0.37,"aCount":9,"bCount":8},"role":{"pct":29,"letter":"D","label":"Adaptiv","aRaw":0.27,"bRaw":0.31,"aCount":9,"bCount":8}}}', '{"drive":66,"energy":22,"mental":35,"role":29}'),
-- Performer (4)
('a0000000-0000-0000-0000-000000000004', 'WSAF', 'Der Commander', 88, '{"emoji":"👑","family":"per","source":"self","dimensions":{"drive":{"pct":28,"letter":"W","label":"Wettkampf","aRaw":0.26,"bRaw":0.30,"aCount":9,"bCount":8},"energy":{"pct":75,"letter":"S","label":"Eigenständig","aRaw":0.73,"bRaw":0.77,"aCount":9,"bCount":8},"mental":{"pct":85,"letter":"A","label":"Stabil","aRaw":0.83,"bRaw":0.87,"aCount":9,"bCount":8},"role":{"pct":80,"letter":"F","label":"Führend","aRaw":0.78,"bRaw":0.82,"aCount":9,"bCount":8}}}', '{"drive":28,"energy":75,"mental":85,"role":80}'),
('a0000000-0000-0000-0000-000000000007', 'WSAD', 'Der Analyst', 73, '{"emoji":"📊","family":"per","source":"self","dimensions":{"drive":{"pct":32,"letter":"W","label":"Wettkampf","aRaw":0.30,"bRaw":0.34,"aCount":9,"bCount":8},"energy":{"pct":70,"letter":"S","label":"Eigenständig","aRaw":0.68,"bRaw":0.72,"aCount":9,"bCount":8},"mental":{"pct":79,"letter":"A","label":"Stabil","aRaw":0.77,"bRaw":0.81,"aCount":9,"bCount":8},"role":{"pct":36,"letter":"D","label":"Adaptiv","aRaw":0.34,"bRaw":0.38,"aCount":9,"bCount":8}}}', '{"drive":32,"energy":70,"mental":79,"role":36}'),
('a0000000-0000-0000-0000-000000000011', 'WSIF', 'Der Gladiator', 84, '{"emoji":"⚔️","family":"per","source":"self","dimensions":{"drive":{"pct":22,"letter":"W","label":"Wettkampf","aRaw":0.20,"bRaw":0.24,"aCount":9,"bCount":8},"energy":{"pct":72,"letter":"S","label":"Eigenständig","aRaw":0.70,"bRaw":0.74,"aCount":9,"bCount":8},"mental":{"pct":25,"letter":"I","label":"Intensiv","aRaw":0.23,"bRaw":0.27,"aCount":9,"bCount":8},"role":{"pct":78,"letter":"F","label":"Führend","aRaw":0.76,"bRaw":0.80,"aCount":9,"bCount":8}}}', '{"drive":22,"energy":72,"mental":25,"role":78}'),
('a0000000-0000-0000-0000-000000000015', 'WSID', 'Der Taktiker', 70, '{"emoji":"🎯","family":"per","source":"self","dimensions":{"drive":{"pct":30,"letter":"W","label":"Wettkampf","aRaw":0.28,"bRaw":0.32,"aCount":9,"bCount":8},"energy":{"pct":67,"letter":"S","label":"Eigenständig","aRaw":0.65,"bRaw":0.69,"aCount":9,"bCount":8},"mental":{"pct":28,"letter":"I","label":"Intensiv","aRaw":0.26,"bRaw":0.30,"aCount":9,"bCount":8},"role":{"pct":33,"letter":"D","label":"Adaptiv","aRaw":0.31,"bRaw":0.35,"aCount":9,"bCount":8}}}', '{"drive":30,"energy":67,"mental":28,"role":33}'),
-- Anführer (4)
('a0000000-0000-0000-0000-000000000005', 'WTAF', 'Der Kapitän', 90, '{"emoji":"🛡️","family":"lea","source":"self","dimensions":{"drive":{"pct":25,"letter":"W","label":"Wettkampf","aRaw":0.23,"bRaw":0.27,"aCount":9,"bCount":8},"energy":{"pct":20,"letter":"T","label":"Teamgebunden","aRaw":0.18,"bRaw":0.22,"aCount":9,"bCount":8},"mental":{"pct":88,"letter":"A","label":"Stabil","aRaw":0.86,"bRaw":0.90,"aCount":9,"bCount":8},"role":{"pct":85,"letter":"F","label":"Führend","aRaw":0.83,"bRaw":0.87,"aCount":9,"bCount":8}}}', '{"drive":25,"energy":20,"mental":88,"role":85}'),
('a0000000-0000-0000-0000-000000000010', 'WTAD', 'Der Mannschaftsspieler', 77, '{"emoji":"🔄","family":"lea","source":"self","dimensions":{"drive":{"pct":35,"letter":"W","label":"Wettkampf","aRaw":0.33,"bRaw":0.37,"aCount":9,"bCount":8},"energy":{"pct":30,"letter":"T","label":"Teamgebunden","aRaw":0.28,"bRaw":0.32,"aCount":9,"bCount":8},"mental":{"pct":76,"letter":"A","label":"Stabil","aRaw":0.74,"bRaw":0.78,"aCount":9,"bCount":8},"role":{"pct":40,"letter":"D","label":"Adaptiv","aRaw":0.38,"bRaw":0.42,"aCount":9,"bCount":8}}}', '{"drive":35,"energy":30,"mental":76,"role":40}'),
('a0000000-0000-0000-0000-000000000012', 'WTIF', 'Der Motivator', 81, '{"emoji":"📣","family":"lea","source":"self","dimensions":{"drive":{"pct":27,"letter":"W","label":"Wettkampf","aRaw":0.25,"bRaw":0.29,"aCount":9,"bCount":8},"energy":{"pct":24,"letter":"T","label":"Teamgebunden","aRaw":0.22,"bRaw":0.26,"aCount":9,"bCount":8},"mental":{"pct":29,"letter":"I","label":"Intensiv","aRaw":0.27,"bRaw":0.31,"aCount":9,"bCount":8},"role":{"pct":82,"letter":"F","label":"Führend","aRaw":0.80,"bRaw":0.84,"aCount":9,"bCount":8}}}', '{"drive":27,"energy":24,"mental":29,"role":82}'),
('a0000000-0000-0000-0000-000000000020', 'WTID', 'Der Mitreißer', 69, '{"emoji":"💫","family":"lea","source":"self","dimensions":{"drive":{"pct":33,"letter":"W","label":"Wettkampf","aRaw":0.31,"bRaw":0.35,"aCount":9,"bCount":8},"energy":{"pct":27,"letter":"T","label":"Teamgebunden","aRaw":0.25,"bRaw":0.29,"aCount":9,"bCount":8},"mental":{"pct":31,"letter":"I","label":"Intensiv","aRaw":0.29,"bRaw":0.33,"aCount":9,"bCount":8},"role":{"pct":34,"letter":"D","label":"Adaptiv","aRaw":0.32,"bRaw":0.36,"aCount":9,"bCount":8}}}', '{"drive":33,"energy":27,"mental":31,"role":34}')
ON CONFLICT DO NOTHING;

-- ═══ BATTERY RESPONSES: 3 Monate Verlaufsdaten für 12 Spieler ═══

INSERT INTO battery_responses (user_id, team_id, battery, season_month, season, anchor_satisfaction, anchor_psych_safety, anchor_commitment, anchor_alignment, anchor_motivation, answers_json, focus_scores, turnover_risk) VALUES
-- Monat 2 (August) - Batterie A
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 6.0, 5.5, 6.5, 6.0, 6.5, '{}', '{"average":5.8}', 'low'),
('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 5.5, 5.0, 5.0, 4.5, 5.5, '{}', '{"average":5.1}', 'mid'),
('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 6.5, 6.0, 7.0, 6.5, 6.0, '{}', '{"average":6.4}', 'low'),
('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 7.0, 6.5, 7.0, 6.0, 7.0, '{}', '{"average":6.7}', 'low'),
('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 4.0, 3.5, 4.0, 3.5, 4.5, '{}', '{"average":3.9}', 'high'),
('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 5.0, 5.5, 5.5, 5.0, 5.0, '{}', '{"average":5.2}', 'mid'),
('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 6.0, 6.0, 6.0, 5.5, 6.0, '{}', '{"average":5.9}', 'low'),
('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 5.5, 4.5, 5.5, 5.0, 5.0, '{}', '{"average":5.1}', 'mid'),
('a0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 6.5, 6.0, 6.5, 6.0, 6.5, '{}', '{"average":6.3}', 'low'),
('a0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 5.0, 5.0, 5.0, 4.5, 5.5, '{}', '{"average":5.0}', 'mid'),
('a0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 6.0, 5.5, 6.0, 5.5, 6.0, '{}', '{"average":5.8}', 'low'),
('a0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000031', 'A', 2, '2025/26', 4.5, 4.0, 4.5, 4.0, 4.5, '{}', '{"average":4.3}', 'mid'),
-- Monat 3 (September) - Batterie B
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 6.5, 6.0, 6.5, 6.5, 7.0, '{}', '{"average":6.5}', 'low'),
('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 5.0, 4.5, 4.5, 4.0, 5.0, '{}', '{"average":4.6}', 'mid'),
('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 6.0, 5.5, 6.5, 6.0, 6.0, '{}', '{"average":6.0}', 'low'),
('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 6.5, 6.0, 6.5, 6.0, 6.5, '{}', '{"average":6.3}', 'low'),
('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 3.5, 3.0, 3.0, 3.0, 3.5, '{}', '{"average":3.2}', 'high'),
('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 5.5, 5.5, 6.0, 5.5, 5.5, '{}', '{"average":5.6}', 'low'),
('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 6.0, 6.0, 6.0, 5.5, 5.5, '{}', '{"average":5.8}', 'low'),
('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 4.5, 4.0, 5.0, 4.5, 4.0, '{}', '{"average":4.4}', 'mid'),
('a0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 5.5, 5.0, 5.5, 5.0, 5.5, '{}', '{"average":5.3}', 'mid'),
('a0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000031', 'B', 3, '2025/26', 4.0, 3.5, 3.5, 3.5, 4.0, '{}', '{"average":3.7}', 'high'),
-- Monat 4 (Oktober) - Batterie C
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', 'C', 4, '2025/26', 6.0, 5.5, 6.0, 6.0, 6.5, '{}', '{"average":6.0}', 'low'),
('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000031', 'C', 4, '2025/26', 4.5, 4.0, 4.0, 3.5, 4.5, '{}', '{"average":4.1}', 'high'),
('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000031', 'C', 4, '2025/26', 6.0, 6.0, 6.5, 5.5, 6.0, '{}', '{"average":6.0}', 'low'),
('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000031', 'C', 4, '2025/26', 3.0, 2.5, 2.5, 2.5, 3.0, '{}', '{"average":2.7}', 'high'),
('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000031', 'C', 4, '2025/26', 5.5, 5.5, 5.5, 5.0, 5.0, '{}', '{"average":5.3}', 'mid'),
('a0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000031', 'C', 4, '2025/26', 5.0, 4.5, 5.0, 4.5, 5.0, '{}', '{"average":4.8}', 'mid')
ON CONFLICT DO NOTHING;

-- ═══ Trainer-Zuordnung: Dein Account wird dem SV Westendorf zugeordnet ═══
-- (Wird ausgeführt nachdem du deine User-ID einträgst)
-- INSERT INTO team_memberships (user_id, team_id, role_in_team)
-- VALUES ('DEINE-TRAINER-ID', '00000000-0000-0000-0000-000000000031', 'coach');

-- Alle bestehenden Coaches dem SV Westendorf zuordnen
INSERT INTO team_memberships (user_id, team_id, role_in_team)
SELECT p.id, '00000000-0000-0000-0000-000000000031', 'coach'
FROM profiles p
WHERE p.role = 'coach'
AND NOT EXISTS (
  SELECT 1 FROM team_memberships tm
  WHERE tm.user_id = p.id AND tm.team_id = '00000000-0000-0000-0000-000000000031'
);
