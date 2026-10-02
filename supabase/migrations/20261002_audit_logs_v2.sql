-- Auditoría administrativa: versión segura y mínima.
-- No registra IP, no activa alertas automáticas y no depende de Supabase Auth.
-- Las escrituras se harán exclusivamente desde el servidor con supabaseAdmin.

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id TEXT NOT NULL,
  user_id UUID,
  actor_type VARCHAR(30) NOT NULL DEFAULT 'admin_panel',
  changes JSONB,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compatibilidad con una posible ejecución previa de audit_logs.sql.
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS actor_type VARCHAR(30) NOT NULL DEFAULT 'admin_panel';

ALTER TABLE audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_entity_fk;

-- entity_id es texto para permitir UUID, enteros u otros identificadores
-- sin acoplar la auditoría a un tipo de PK concreto.
ALTER TABLE audit_logs
  ALTER COLUMN entity_id TYPE TEXT USING entity_id::text;

ALTER TABLE audit_logs
  DROP COLUMN IF EXISTS user_ip;

ALTER TABLE audit_logs
  ALTER COLUMN actor_type SET DEFAULT 'admin_panel';

CREATE INDEX IF NOT EXISTS idx_audit_entity
  ON audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp
  ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_user
  ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_action
  ON audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_audit_actor_type
  ON audit_logs(actor_type);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- La escritura no necesita una policy INSERT: supabaseAdmin usa la secret key
-- en servidor y bypassa RLS. La lectura desde UI se resolverá en un bloque
-- posterior cuando definamos la visualización administrativa.
DROP POLICY IF EXISTS "audit_logs_admin_only" ON audit_logs;

COMMENT ON TABLE audit_logs IS
  'Registro de acciones administrativas sensibles de LinaresYa. Escritura solo desde servidor.';
COMMENT ON COLUMN audit_logs.actor_type IS
  'Origen de la acción: admin_panel, signed_link o system.';
COMMENT ON COLUMN audit_logs.changes IS
  'Solo cambios relevantes: before/after de campos auditados, no snapshots completos.';
