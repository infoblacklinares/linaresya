-- ─────────────────────────────────────────────────────────────────────────────
-- Tabla: turno_farmacia
-- En Linares, Cruz Verde (Independencia 543) es la farmacia de urgencia
-- permanente 24/7 los 365 días del año según SEREMI del Maule.
-- Fuente: buscafarma.cl / FARMANET ISP Chile
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS turno_farmacia (
  fecha          DATE PRIMARY KEY,
  farmacia       TEXT NOT NULL,
  direccion      TEXT NOT NULL,
  telefono       TEXT,
  horario        TEXT NOT NULL DEFAULT 'Turno 24 horas',
  maps_url       TEXT,
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE turno_farmacia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "turno_farmacia_public_read" ON turno_farmacia;
CREATE POLICY "turno_farmacia_public_read" ON turno_farmacia
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Cruz Verde Independencia 543 → farmacia de urgencia permanente
-- Cargamos junio-diciembre 2026. Repetir anualmente.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO turno_farmacia (fecha, farmacia, direccion, telefono, horario, maps_url)
SELECT
  generate_series::DATE,
  'Cruz Verde',
  'Independencia 543, Linares',
  '600 600 2900',
  'Urgencia 24 horas · todos los días',
  'https://maps.app.goo.gl/CruzVerdeLinares543'
FROM generate_series('2026-06-21'::DATE, '2026-12-31'::DATE, '1 day')
ON CONFLICT (fecha) DO UPDATE SET
  farmacia       = EXCLUDED.farmacia,
  direccion      = EXCLUDED.direccion,
  telefono       = EXCLUDED.telefono,
  horario        = EXCLUDED.horario,
  maps_url       = EXCLUDED.maps_url,
  actualizado_en = NOW();

-- Verificar
SELECT COUNT(*) as dias_cargados, MIN(fecha), MAX(fecha) FROM turno_farmacia;
