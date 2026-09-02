-- =============================================================================
-- LinaresYa - Eventos del sitio que no cuelgan de un negocio
-- =============================================================================
-- Ejecutar entero en el SQL editor de Supabase (una sola vez).
--
-- Para que: estadisticas_diarias cuenta por negocio (negocio_id NOT NULL), asi
-- que no sirve para medir el popup de la portada, que se ve antes de que
-- exista ningun negocio. Sin esto solo sabiamos cuantas altas trae el popup
-- (columna `origen`), no cuantos lo vieron ni cuantos lo cerraron.
--
-- ACTUALIZACION 29/08: se agrega `popup_click`. El popup ya no trae el
-- formulario adentro: ahora invita y lleva a /publicar, asi que la etapa del
-- medio del embudo pasa a ser el clic. Lo que termina publicando sale de la
-- columna `origen` de negocios, no de aca. `popup_enviado` se deja en la
-- lista para no invalidar las filas viejas.
--
-- ACTUALIZACION 28/08: se agrega `visita_portada`. Sin ese denominador, saber
-- que 7 personas vieron el popup no dice nada: no se distingue "vino poca
-- gente" de "vino mucha y el popup no aparece". Si ya corriste este archivo
-- antes, correlo de nuevo entero: es idempotente y lo unico que cambia es la
-- lista blanca de la funcion.
--
-- Se puede correr antes o despues de desplegar: si la tabla no existe todavia,
-- /api/track responde ok igual y el panel esconde el embudo.
-- =============================================================================

-- 1. Contador por dia y evento. Una fila por (fecha, evento).
CREATE TABLE IF NOT EXISTS public.eventos_sitio (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  evento TEXT NOT NULL,
  conteo INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT eventos_sitio_fecha_evento_unique UNIQUE (fecha, evento)
);

CREATE INDEX IF NOT EXISTS idx_eventos_sitio_fecha
  ON public.eventos_sitio (fecha DESC);

-- 2. Incremento atomico. Igual que incrementar_estadistica: SECURITY DEFINER
-- para saltar RLS, con lista blanca de eventos para que nadie invente filas.
CREATE OR REPLACE FUNCTION public.incrementar_evento_sitio(
  p_evento TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_evento NOT IN (
    'popup_visto', 'popup_cerrado', 'popup_enviado', 'popup_click',
    'visita_portada'
  ) THEN
    RAISE EXCEPTION 'Evento de sitio invalido: %', p_evento;
  END IF;

  INSERT INTO public.eventos_sitio (fecha, evento, conteo)
  VALUES ((NOW() AT TIME ZONE 'America/Santiago')::DATE, p_evento, 1)
  ON CONFLICT (fecha, evento) DO UPDATE SET
    conteo = public.eventos_sitio.conteo + 1;
END;
$$;

-- 3. RLS: nadie lee ni escribe directo. El panel lee con service role y el
-- navegador solo puede llamar a la funcion.
ALTER TABLE public.eventos_sitio ENABLE ROW LEVEL SECURITY;

GRANT EXECUTE ON FUNCTION public.incrementar_evento_sitio(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.incrementar_evento_sitio(TEXT) TO authenticated;

-- =============================================================================
-- Como leer el embudo
--
--   SELECT evento, SUM(conteo)
--   FROM public.eventos_sitio
--   WHERE fecha >= CURRENT_DATE - 30
--   GROUP BY 1 ORDER BY 2 DESC;
--
-- El panel /admin muestra visitas, vistos, publicados y el % de conversion de
-- la semana.
--
-- Ojo al comparar: `visita_portada` se cuenta una vez por sesion del navegador
-- y el popup aparece una vez cada 7 dias por navegador, asi que vistos/visitas
-- no es una division exacta. Sirve para el orden de magnitud, no para un
-- porcentaje fino.
-- =============================================================================
