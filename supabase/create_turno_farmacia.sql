-- ─────────────────────────────────────────────────────────────────────────────
-- Tabla: turno_farmacia
-- Farmacias de turno en Linares — actualizar semanalmente
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS turno_farmacia (
  fecha       DATE PRIMARY KEY,
  farmacia    TEXT NOT NULL,
  direccion   TEXT NOT NULL,
  telefono    TEXT,
  horario     TEXT NOT NULL DEFAULT 'Turno 24 horas',
  maps_url    TEXT,
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (solo lectura pública)
ALTER TABLE turno_farmacia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "turno_farmacia_public_read" ON turno_farmacia
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Datos: Junio – Julio 2026
-- Rotación aproximada de 4 farmacias. Verificar con SEREMI del Maule.
-- Para corregir un día: UPDATE turno_farmacia SET farmacia='...', direccion='...' WHERE fecha='2026-06-XX';
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO turno_farmacia (fecha, farmacia, direccion, telefono, horario, maps_url) VALUES
-- Junio 2026
('2026-06-21', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-06-22', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
('2026-06-23', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-06-24', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-06-25', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-06-26', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
('2026-06-27', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-06-28', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-06-29', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-06-30', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
-- Julio 2026
('2026-07-01', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-07-02', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-07-03', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-07-04', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
('2026-07-05', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-07-06', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-07-07', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-07-08', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
('2026-07-09', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-07-10', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-07-11', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-07-12', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
('2026-07-13', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-07-14', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-07-15', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-07-16', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
('2026-07-17', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-07-18', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-07-19', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-07-20', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
('2026-07-21', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-07-22', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-07-23', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-07-24', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
('2026-07-25', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-07-26', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-07-27', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares'),
('2026-07-28', 'Salcobrand',          'Independencia 535, Linares',       '600 600 7000', 'Turno 24 horas', 'https://maps.app.goo.gl/SalcobrandLinares'),
('2026-07-29', 'Farmacias Ahumada',   'Independencia 461, Linares',       '600 601 9000', 'Turno 24 horas', 'https://maps.app.goo.gl/AhumadaLinares'),
('2026-07-30', 'Dr. Simi',            'Manuel Rodríguez 355, Linares',    '800 900 130',  'Turno 24 horas', 'https://maps.app.goo.gl/DrSimiLinares'),
('2026-07-31', 'Cruz Verde',          'Manuel Rodríguez 395, Linares',   '600 600 2900', 'Turno 24 horas', 'https://maps.app.goo.gl/CruzVerdeLinares')

ON CONFLICT (fecha) DO UPDATE SET
  farmacia    = EXCLUDED.farmacia,
  direccion   = EXCLUDED.direccion,
  telefono    = EXCLUDED.telefono,
  horario     = EXCLUDED.horario,
  maps_url    = EXCLUDED.maps_url,
  actualizado_en = NOW();

-- Ver resultado
SELECT fecha, farmacia, horario FROM turno_farmacia ORDER BY fecha;
