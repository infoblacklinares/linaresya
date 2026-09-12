-- =============================================================================
-- LinaresYa - Eventos de ficha (LY-005)
-- =============================================================================
-- ORDEN: esta migracion solo AGREGA, asi que se puede correr antes del deploy
-- o en cualquier momento. El codigo tolera que la tabla no exista todavia:
-- mientras no este, sigue contando en `estadisticas_diarias` como siempre.
--
-- Para que: hasta ahora se guardaba 1 fila por negocio por dia con 4
-- contadores. Eso no puede responder cuantas personas distintas visitaron, a
-- que hora, ni de donde llegaron: la hora y el origen se perdian al sumar.
--
-- Esta tabla pasa a ser la fuente de verdad. `estadisticas_diarias` se sigue
-- alimentando desde aca, para que los dos paneles que ya funcionan no se
-- rompan. Dos fuentes de verdad para el mismo numero es como se llega a un
-- dashboard que se contradice: la de arriba es esta.
--
-- Privacidad (LY-030): no hay IP ni nada personal. `sesion` es un
-- identificador al azar que vive en el navegador y se olvida al cerrar la
-- pestana. Del referer se guarda solo el dominio.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.eventos_negocio (
  id           BIGSERIAL PRIMARY KEY,
  negocio_id   UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  evento       TEXT NOT NULL,
  creado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Sesion de navegador. Null si el evento llego sin ella.
  sesion       TEXT,
  -- De donde llego: instagram, facebook, google, qr, directo, interno...
  fuente       TEXT,
  -- Campania interna de LinaresYa: C001, C002...
  campana      TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  -- Solo el dominio que refirio, nunca la URL completa.
  referer_host TEXT
);

-- Consultas previstas: por negocio y fecha (panel), por campania (piloto) y
-- por sesion (visitantes unicos).
CREATE INDEX IF NOT EXISTS idx_eventos_negocio_negocio_fecha
  ON public.eventos_negocio (negocio_id, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_negocio_fecha
  ON public.eventos_negocio (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_negocio_campana
  ON public.eventos_negocio (campana) WHERE campana IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_eventos_negocio_sesion
  ON public.eventos_negocio (sesion) WHERE sesion IS NOT NULL;

-- Tabla sensible: RLS activo y sin politicas = nadie entra con la llave
-- publica. Solo el servidor (service role) y las funciones SECURITY DEFINER.
ALTER TABLE public.eventos_negocio ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- registrar_evento: la unica puerta de entrada
-- =============================================================================
-- Hace, en este orden:
--   1. valida el evento contra la lista blanca;
--   2. aplica el mismo limite por minuto que ya protege el tracking;
--   3. exige que el negocio exista y este activo;
--   4. guarda el evento con su hora, sesion y origen;
--   5. mantiene al dia los contadores diarios de siempre, para los 4 eventos
--      historicos (vista, whatsapp, telefono, maps).
-- Devuelve true solo si se conto.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.registrar_evento(
  p_negocio_id UUID,
  p_evento     TEXT,
  p_sesion     TEXT DEFAULT NULL,
  p_fuente     TEXT DEFAULT NULL,
  p_datos      JSONB DEFAULT NULL,
  p_clave      TEXT DEFAULT NULL,
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
  IF p_evento NOT IN (
    'vista', 'telefono', 'whatsapp', 'maps',
    'instagram', 'facebook', 'web', 'compartir', 'qr'
  ) THEN
    RAISE EXCEPTION 'Evento invalido: %', p_evento;
  END IF;

  -- Mismo esquema de limite que incrementar_estadistica_limitado: una cuota
  -- por (origen, evento) y ventana de un minuto.
  v_clave := coalesce(p_clave, 'sin-ip') || ':ev:' || p_evento;

  INSERT INTO public.eventos_limite (clave, ventana, conteo)
  VALUES (v_clave, now(), 0)
  ON CONFLICT (clave) DO NOTHING;

  SELECT ventana, conteo INTO v_ventana, v_conteo
  FROM public.eventos_limite WHERE clave = v_clave FOR UPDATE;

  IF v_ventana < now() - INTERVAL '1 minute' THEN
    UPDATE public.eventos_limite SET ventana = now(), conteo = 1 WHERE clave = v_clave;
  ELSIF v_conteo >= p_max THEN
    RETURN false;
  ELSE
    UPDATE public.eventos_limite SET conteo = v_conteo + 1 WHERE clave = v_clave;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.negocios WHERE id = p_negocio_id AND activo
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.eventos_negocio (
    negocio_id, evento, sesion, fuente, campana,
    utm_source, utm_medium, utm_campaign, utm_content, referer_host
  ) VALUES (
    p_negocio_id,
    p_evento,
    nullif(left(coalesce(p_sesion, ''), 24), ''),
    nullif(left(coalesce(p_fuente, ''), 40), ''),
    nullif(left(coalesce(p_datos->>'campana', ''), 40), ''),
    nullif(left(coalesce(p_datos->>'utm_source', ''), 40), ''),
    nullif(left(coalesce(p_datos->>'utm_medium', ''), 40), ''),
    nullif(left(coalesce(p_datos->>'utm_campaign', ''), 40), ''),
    nullif(left(coalesce(p_datos->>'utm_content', ''), 40), ''),
    nullif(left(coalesce(p_datos->>'referer_host', ''), 80), '')
  );

  -- Los cuatro de siempre siguen sumando en los contadores diarios, que es de
  -- donde leen el panel del admin y el del dueno.
  IF p_evento IN ('vista', 'whatsapp', 'telefono', 'maps') THEN
    PERFORM public.incrementar_estadistica(p_negocio_id, p_evento);
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_evento(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, INTEGER)
  TO anon, authenticated;

-- =============================================================================
-- Verificar:
--   SELECT count(*) FROM public.eventos_negocio;
--   SELECT evento, count(*) FROM public.eventos_negocio GROUP BY evento ORDER BY 2 DESC;
--   -- visitantes unicos de un negocio en 7 dias:
--   SELECT count(DISTINCT sesion) FROM public.eventos_negocio
--   WHERE negocio_id = 'UUID' AND evento = 'vista'
--     AND creado_en > now() - INTERVAL '7 days';
-- =============================================================================
