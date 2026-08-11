-- Tabla de auditoría para registrar cambios en datos críticos
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  entity_type VARCHAR(50) NOT NULL, -- 'negocio', 'review', 'usuario', etc
  entity_id UUID NOT NULL,
  user_id UUID, -- NULL si es anónimo
  user_ip INET, -- IP del cliente
  changes JSONB, -- {before: {campo: valor}, after: {campo: valor}}
  reason VARCHAR(255), -- Motivo del cambio (opcional)
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT audit_logs_entity_fk FOREIGN KEY (entity_type) REFERENCES information_schema.tables(table_name)
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- Tabla de alertas (actividad sospechosa)
CREATE TABLE IF NOT EXISTS audit_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL, -- 'mass_changes', 'suspicious_access', etc
  entity_type VARCHAR(50),
  entity_id UUID,
  message TEXT,
  severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_severity ON audit_alerts(severity, resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON audit_alerts(created_at DESC);

-- Función para detectar actividad sospechosa
CREATE OR REPLACE FUNCTION check_suspicious_activity()
RETURNS TRIGGER AS $$
DECLARE
  change_count INT;
BEGIN
  -- Si >50 cambios en 5 min del mismo negocio, alertar
  SELECT COUNT(*) INTO change_count
  FROM audit_logs
  WHERE entity_type = 'negocios'
    AND entity_id = NEW.entity_id
    AND created_at > NOW() - INTERVAL '5 minutes';

  IF change_count > 50 THEN
    INSERT INTO audit_alerts (alert_type, entity_type, entity_id, message, severity)
    VALUES ('mass_changes', 'negocios', NEW.entity_id,
            'Más de 50 cambios en 5 minutos', 'high');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para detectar actividad sospechosa
CREATE TRIGGER trigger_suspicious_activity
AFTER INSERT ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION check_suspicious_activity();

-- RLS: Solo admins pueden ver audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_admin_only" ON audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "audit_alerts_admin_only" ON audit_alerts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
