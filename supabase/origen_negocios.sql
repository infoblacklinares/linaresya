-- =============================================================================
-- LinaresYa - De donde viene cada negocio publicado
-- =============================================================================
-- Ejecutar entero en el SQL editor de Supabase (una sola vez).
--
-- Para que: el popup de la portada y el formulario de /publicar usan el mismo
-- server action, asi que hasta ahora las altas quedaban identicas y no habia
-- forma de saber cuantas trae el popup. Esta columna lo responde.
--
-- Se puede correr antes o despues de desplegar el codigo: el alta funciona
-- igual si la columna todavia no existe (reintenta sin ella), solo que esas
-- filas quedan con origen NULL.
-- =============================================================================

ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS origen TEXT;

-- Los negocios que ya estaban antes de esta columna quedan en NULL a
-- proposito: no sabemos de donde vinieron y no conviene inventarlo.
ALTER TABLE public.negocios
  DROP CONSTRAINT IF EXISTS negocios_origen_check;

ALTER TABLE public.negocios
  ADD CONSTRAINT negocios_origen_check
  CHECK (origen IS NULL OR origen IN ('popup', 'formulario', 'admin'));

CREATE INDEX IF NOT EXISTS idx_negocios_origen_creado
  ON public.negocios (origen, creado_en DESC);

-- =============================================================================
-- Como leer los numeros
--
--   -- Altas por origen, historico
--   SELECT COALESCE(origen, 'antes de medir') AS origen, COUNT(*)
--   FROM public.negocios
--   GROUP BY 1 ORDER BY 2 DESC;
--
--   -- Ultimos 30 dias
--   SELECT COALESCE(origen, 'antes de medir') AS origen, COUNT(*)
--   FROM public.negocios
--   WHERE creado_en >= NOW() - INTERVAL '30 days'
--   GROUP BY 1 ORDER BY 2 DESC;
--
-- El panel /admin muestra el conteo del popup de los ultimos 7 dias.
-- =============================================================================
