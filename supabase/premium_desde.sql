-- =============================================================================
-- LinaresYa - Cuando empezo el Premium
-- =============================================================================
-- Ejecutar entero en el SQL editor de Supabase (una sola vez). Es idempotente.
--
-- Para que: hasta ahora solo se guardaba `premium_hasta`. Sin fecha de inicio
-- no se puede calcular un periodo cobrado, ni saber cuantos meses lleva un
-- cliente, ni conciliar un pago. Es el paso previo a cobrar de verdad.
--
-- La escribe el panel cuando un negocio SUBE a Premium, y la borra cuando
-- vuelve a Basico. El codigo funciona con o sin esta columna: si no existe,
-- reintenta el cambio de plan sin ella y lo avisa en el log.
-- =============================================================================

ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS premium_desde TIMESTAMPTZ;

COMMENT ON COLUMN public.negocios.premium_desde IS
  'Inicio del Premium vigente. Null si el negocio es Basico. La escribe el panel al subir el plan';

-- A proposito NO se rellenan los que ya son Premium: no sabemos cuando
-- empezaron, y poner una fecha inventada seria peor que dejarla vacia.
-- Hoy en produccion no hay ningun negocio Premium, asi que no queda nada sin dato.

-- =============================================================================
-- Verificar:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'negocios'
--     AND column_name = 'premium_desde';
-- =============================================================================
