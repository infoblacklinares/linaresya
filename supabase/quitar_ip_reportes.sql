-- =============================================================================
-- LinaresYa - Quitar la IP de los reportes (privacidad, Ley 21.719)
-- =============================================================================
-- OJO: esto BORRA de forma permanente las IPs ya guardadas. Es justamente el
-- objetivo, pero no se puede deshacer.
--
-- Por que: la tabla `reportes` guardaba la IP de quien reporta un dato
-- incorrecto. Es un dato personal que no se usaba para nada: el panel solo la
-- mostraba, y el limite por IP para evitar spam vive en la aplicacion y no
-- necesita almacenarla.
--
-- El codigo ya dejo de escribirla y de leerla, asi que se puede correr cuando
-- quieras. Si no la corres, la columna queda ahi con las IPs viejas.
-- =============================================================================

ALTER TABLE public.reportes
  DROP COLUMN IF EXISTS ip;

-- =============================================================================
-- Verificar (no deberia devolver ninguna fila):
--   SELECT column_name FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'reportes' AND column_name = 'ip';
-- =============================================================================
