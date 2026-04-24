-- =============================================================================
-- LinaresYa - Tracking de vistas y clicks por negocio
-- =============================================================================
-- Ejecutar este archivo entero en el SQL editor de Supabase (una sola vez).
-- Crea:
--   - tabla estadisticas_diarias (1 fila por negocio por dia)
--   - funcion incrementar_estadistica (upsert atomico)
--   - RLS bloqueando acceso publico (solo service role lee/escribe)
-- =============================================================================

-- 1. Tabla agregada por dia. Una fila por (negocio, fecha).
CREATE TABLE IF NOT EXISTS public.estadisticas_diarias (
  id BIGSERIAL PRIMARY KEY,
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  vistas INTEGER NOT NULL DEFAULT 0,
  clicks_whatsapp INTEGER NOT NULL DEFAULT 0,
  clicks_telefono INTEGER NOT NULL DEFAULT 0,
  clicks_maps INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT estadisticas_diarias_negocio_fecha_unique UNIQUE (negocio_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_estadisticas_diarias_negocio_fecha
  ON public.estadisticas_diarias (negocio_id, fecha DESC);

-- 2. Funcion atomica para incrementar contadores.
-- SECURITY DEFINER permite que se ejecute con privilegios del owner (saltando RLS)
-- pero solo aceptamos los 4 eventos validos para evitar abuso.
CREATE OR REPLACE FUNCTION public.incrementar_estadistica(
  p_negocio_id UUID,
  p_evento TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_evento NOT IN ('vista', 'whatsapp', 'telefono', 'maps') THEN
    RAISE EXCEPTION 'Evento invalido: %', p_evento;
  END IF;

  INSERT INTO public.estadisticas_diarias (
    negocio_id, fecha,
    vistas, clicks_whatsapp, clicks_telefono, clicks_maps
  )
  VALUES (
    p_negocio_id,
    (NOW() AT TIME ZONE 'America/Santiago')::DATE,
    CASE WHEN p_evento = 'vista' THEN 1 ELSE 0 END,
    CASE WHEN p_evento = 'whatsapp' THEN 1 ELSE 0 END,
    CASE WHEN p_evento = 'telefono' THEN 1 ELSE 0 END,
    CASE WHEN p_evento = 'maps' THEN 1 ELSE 0 END
  )
  ON CONFLICT (negocio_id, fecha) DO UPDATE SET
    vistas          = public.estadisticas_diarias.vistas          + EXCLUDED.vistas,
    clicks_whatsapp = public.estadisticas_diarias.clicks_whatsapp + EXCLUDED.clicks_whatsapp,
    clicks_telefono = public.estadisticas_diarias.clicks_telefono + EXCLUDED.clicks_telefono,
    clicks_maps     = public.estadisticas_diarias.clicks_maps     + EXCLUDED.clicks_maps;
END;
$$;

-- 3. RLS: nadie lee ni escribe directo. Solo service role (que salta RLS)
-- puede acceder. La funcion incrementar_estadistica corre como SECURITY DEFINER
-- asi que cualquiera la puede invocar (la llamamos desde la API route con anon).
ALTER TABLE public.estadisticas_diarias ENABLE ROW LEVEL SECURITY;

-- 4. Permitir que el rol anon (cliente publico) ejecute la funcion.
-- Esto es lo que habilita /api/track sin necesidad de service role en el cliente.
GRANT EXECUTE ON FUNCTION public.incrementar_estadistica(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.incrementar_estadistica(UUID, TEXT) TO authenticated;

-- =============================================================================
-- Listo. Verificar con:
--   SELECT * FROM public.estadisticas_diarias LIMIT 1;
--   SELECT public.incrementar_estadistica('UUID-DE-PRUEBA'::UUID, 'vista');
-- =============================================================================
