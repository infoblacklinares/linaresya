-- =============================================================================
-- LinaresYa - Facebook del negocio (LY-002)
-- =============================================================================
-- Ejecutar entero en el SQL editor de Supabase (una sola vez). Es idempotente:
-- correrlo dos veces no rompe nada.
--
-- Para que: el modelo Business del plan pide Facebook junto a Instagram, y
-- produccion no tenia la columna (verificado 2026-09-11). Solo agrega la
-- columna: el formulario, la normalizacion y el boton en la ficha son LY-003.
--
-- Se guarda la URL completa de la pagina, no un usuario: Facebook no tiene una
-- forma canonica unica como Instagram (hay /nombre, /profile.php?id=..., /p/...).
-- La normalizacion y validacion van en la app (LY-003). Aca solo se exige que,
-- si hay valor, sea un link a facebook.com.
-- =============================================================================

ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS facebook TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'negocios_facebook_formato'
  ) THEN
    ALTER TABLE public.negocios
      ADD CONSTRAINT negocios_facebook_formato
      CHECK (facebook IS NULL OR facebook ~* '^https://([a-z0-9-]+\.)*facebook\.com/.+');
  END IF;
END $$;

COMMENT ON COLUMN public.negocios.facebook IS
  'URL de la pagina de Facebook del negocio (https://facebook.com/...). Se normaliza en la app';

-- =============================================================================
-- Para revisar:
--
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'negocios' AND column_name = 'facebook';
-- =============================================================================
