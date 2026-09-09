-- =============================================================================
-- LinaresYa - Instagram del negocio
-- =============================================================================
-- Ejecutar entero en el SQL editor de Supabase (una sola vez). Es idempotente:
-- correrlo dos veces no rompe nada.
--
-- Para que: es la red donde estan los negocios de Linares, y hasta ahora la
-- ficha no tenia donde mostrarla. Se guarda el nombre de usuario
-- ("panaderia.laespiga"), no la URL: la gente escribe esto con arroba, sin
-- arroba o pegando el link del navegador con el `?igshid=...` adentro, y
-- guardar el usuario deja una sola forma canonica. El link se arma al
-- mostrarlo, en lib/instagram.ts.
--
-- Se puede correr antes o despues de desplegar: si la columna no existe
-- todavia, el alta se guarda igual sin el campo (ver app/publicar/actions.ts).
-- =============================================================================

ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS instagram TEXT;

-- Mismas reglas que Instagram: 1 a 30 caracteres, letras, numeros, punto y
-- guion bajo, sin punto al principio ni al final. La app ya valida y normaliza
-- antes de escribir; esto es la red de seguridad para lo que entre por otro
-- lado (el panel, una carga a mano, un script).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'negocios_instagram_formato'
  ) THEN
    ALTER TABLE public.negocios
      ADD CONSTRAINT negocios_instagram_formato
      CHECK (instagram IS NULL OR instagram ~ '^[a-z0-9_](\.?[a-z0-9_]){0,29}$');
  END IF;
END $$;

COMMENT ON COLUMN public.negocios.instagram IS
  'Usuario de Instagram sin arroba y en minuscula. El link se arma con lib/instagram.ts';

-- =============================================================================
-- Para revisar cuantos negocios lo cargaron:
--
--   SELECT count(*) FILTER (WHERE instagram IS NOT NULL) AS con_ig,
--          count(*) AS total
--   FROM public.negocios;
-- =============================================================================
