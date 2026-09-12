-- =============================================================================
-- LinaresYa - Limite de eventos del lado de Postgres
-- =============================================================================
-- Ejecutar entero en el SQL editor de Supabase (una sola vez). Es idempotente.
--
-- Para que: /api/track era publico y sin limite, asi que cualquiera podia
-- inflar las metricas de cualquier negocio desde la consola del navegador. Los
-- limites en memoria de la aplicacion no sirven en Vercel, porque cada
-- instancia tiene su propio contador. Este limite vive en la base, que es la
-- unica pieza compartida por todas las instancias.
--
-- Que hace incrementar_estadistica_limitado:
--   1. rechaza eventos que no estan en la lista blanca;
--   2. cuenta cuantos eventos mando esa clave en el ultimo minuto y corta;
--   3. verifica que el negocio exista y este activo;
--   4. solo entonces llama a incrementar_estadistica.
--
-- La clave NO es la IP: la aplicacion manda un hash truncado con sal
-- (lib/peticion.ts). Alcanza para frenar a quien repite y no guarda un dato
-- personal (Ley 21.719).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.eventos_limite (
  clave   TEXT PRIMARY KEY,
  ventana TIMESTAMPTZ NOT NULL DEFAULT now(),
  conteo  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_eventos_limite_ventana
  ON public.eventos_limite (ventana);

-- Nadie accede directo: la funcion corre como SECURITY DEFINER.
ALTER TABLE public.eventos_limite ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.incrementar_estadistica_limitado(
  p_negocio_id UUID,
  p_evento     TEXT,
  p_clave      TEXT,
  p_max        INTEGER DEFAULT 30
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clave   TEXT;
  v_ventana TIMESTAMPTZ;
  v_conteo  INTEGER;
BEGIN
  IF p_evento NOT IN ('vista', 'whatsapp', 'telefono', 'maps') THEN
    RAISE EXCEPTION 'Evento invalido: %', p_evento;
  END IF;

  -- Una cuota por (origen, evento): que alguien mire muchas fichas no tiene
  -- por que gastarle la cuota de los clicks, y al reves tampoco.
  v_clave := coalesce(p_clave, 'sin-ip') || ':' || p_evento;

  INSERT INTO public.eventos_limite (clave, ventana, conteo)
  VALUES (v_clave, now(), 0)
  ON CONFLICT (clave) DO NOTHING;

  SELECT ventana, conteo INTO v_ventana, v_conteo
  FROM public.eventos_limite
  WHERE clave = v_clave
  FOR UPDATE;

  IF v_ventana < now() - INTERVAL '1 minute' THEN
    -- Ventana nueva: se reinicia la cuenta.
    UPDATE public.eventos_limite
    SET ventana = now(), conteo = 1
    WHERE clave = v_clave;
  ELSIF v_conteo >= p_max THEN
    -- Sobre el limite: no se cuenta y no se avisa al cliente.
    RETURN false;
  ELSE
    UPDATE public.eventos_limite
    SET conteo = v_conteo + 1
    WHERE clave = v_clave;
  END IF;

  -- Un negocio inexistente o inactivo no acumula estadisticas: sin esto se
  -- podian crear filas para cualquier UUID.
  IF NOT EXISTS (
    SELECT 1 FROM public.negocios WHERE id = p_negocio_id AND activo
  ) THEN
    RETURN false;
  END IF;

  PERFORM public.incrementar_estadistica(p_negocio_id, p_evento);
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.incrementar_estadistica_limitado(UUID, TEXT, TEXT, INTEGER)
  TO anon, authenticated;

-- Limpieza de claves viejas. No es urgente (la tabla es chica), pero conviene
-- correrlo de vez en cuando o agregarlo a un cron:
--   DELETE FROM public.eventos_limite WHERE ventana < now() - INTERVAL '1 day';

-- =============================================================================
-- Verificar:
--   SELECT public.incrementar_estadistica_limitado(
--     (SELECT id FROM negocios WHERE activo LIMIT 1), 'vista', 'prueba-manual');
--   -- true la primera vez, y false al pasar de 30 en un minuto.
--   SELECT * FROM public.eventos_limite ORDER BY ventana DESC LIMIT 5;
-- =============================================================================
