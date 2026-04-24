-- ============================================================================
-- Busqueda full-text con Postgres tsvector
-- ============================================================================
--
-- Que hace:
--   - Habilita la extension unaccent (sin acentos: "cafe" matchea "cafe" y "café")
--   - Crea una config de text search llamada spanish_unaccent que combina:
--       * Diccionario spanish (stemming para que "pizzas" matchee "pizza")
--       * Filtro unaccent (acentos normalizados)
--   - Agrega la columna busqueda (tsvector) a negocios, con pesos:
--       A = nombre (maximo peso, matchea aca => rank alto)
--       B = descripcion
--       C = direccion + zona_cobertura
--   - Trigger que actualiza la columna cuando cambian esos campos
--   - Indice GIN para que las consultas sean instantaneas aunque haya miles de negocios
--
-- Como se usa desde la app:
--   supabase.from("negocios")
--     .select(...)
--     .textSearch("busqueda", q, { type: "websearch", config: "spanish_unaccent" })
--
-- websearch acepta sintaxis amigable: "pizza -pollo", "comida OR almacen", '"don vittorio"'.
--
-- Como aplicarlo:
--   1. Copiar este archivo entero
--   2. Pegar en Supabase Dashboard -> SQL Editor -> New query -> Run
--   3. Deberia terminar sin errores; si hay negocios existentes, se hace
--      backfill automatico al final del script
-- ============================================================================

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Config de text search: spanish + unaccent.
-- Si ya existia, la recreamos para asegurar el pipeline correcto.
DROP TEXT SEARCH CONFIGURATION IF EXISTS public.spanish_unaccent;
CREATE TEXT SEARCH CONFIGURATION public.spanish_unaccent ( COPY = pg_catalog.spanish );
ALTER TEXT SEARCH CONFIGURATION public.spanish_unaccent
  ALTER MAPPING FOR hword, hword_part, word
  WITH public.unaccent, spanish_stem;

-- 3. Columna busqueda (tsvector)
ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS busqueda tsvector;

-- 4. Funcion que rellena el tsvector combinando campos con pesos
CREATE OR REPLACE FUNCTION public.negocios_busqueda_refresh()
RETURNS trigger AS $$
BEGIN
  NEW.busqueda :=
    setweight(to_tsvector('public.spanish_unaccent', coalesce(NEW.nombre, '')), 'A') ||
    setweight(to_tsvector('public.spanish_unaccent', coalesce(NEW.descripcion, '')), 'B') ||
    setweight(to_tsvector('public.spanish_unaccent', coalesce(NEW.zona_cobertura, '')), 'C') ||
    setweight(to_tsvector('public.spanish_unaccent', coalesce(NEW.direccion, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger: se dispara cuando cambian los campos relevantes
DROP TRIGGER IF EXISTS trg_negocios_busqueda ON public.negocios;
CREATE TRIGGER trg_negocios_busqueda
  BEFORE INSERT OR UPDATE OF nombre, descripcion, zona_cobertura, direccion
  ON public.negocios
  FOR EACH ROW
  EXECUTE FUNCTION public.negocios_busqueda_refresh();

-- 6. Indice GIN (el que hace que las queries sean rapidas)
CREATE INDEX IF NOT EXISTS idx_negocios_busqueda
  ON public.negocios USING GIN (busqueda);

-- 7. Backfill: actualiza la columna busqueda en todos los negocios existentes.
-- Se dispara el trigger porque tocamos nombre (aunque el valor no cambie).
UPDATE public.negocios SET nombre = nombre;

-- 8. Sanity check: contar cuantos negocios tienen busqueda != null.
-- No es bloqueante, solo para ver en los logs del SQL editor.
SELECT
  count(*) FILTER (WHERE busqueda IS NOT NULL) AS con_busqueda,
  count(*) AS total
FROM public.negocios;
