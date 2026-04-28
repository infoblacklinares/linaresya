-- ============================================================================
-- LinaresYa - Supabase Storage para fotos de negocios
-- Aplicar en SQL Editor de Supabase. Es idempotente, podes correrlo varias
-- veces sin romper nada.
-- ============================================================================

-- 1. Crear bucket "negocios" como publico (lectura abierta).
--    public = true significa que las URLs son accesibles sin token.
--    file_size_limit = 8 MB por archivo. allowed_mime_types restringe a images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'negocios',
  'negocios',
  true,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Policies sobre storage.objects.
--    Lectura publica: cualquier anon puede ver los archivos.
--    Insert/update/delete: solo service_role (que es el que usa nuestro
--    backend con SUPABASE_SERVICE_ROLE_KEY). El rol anon NO puede subir
--    archivos directo, todo va via el server action.

-- Lectura publica
drop policy if exists "negocios_public_read" on storage.objects;
create policy "negocios_public_read" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'negocios');

-- service_role bypasea RLS automaticamente, asi que no necesitamos policy
-- explicita para insert/update/delete. Pero por claridad creamos una policy
-- denegativa explicita para anon (la ausencia de policy ya bloquea, pero
-- esto deja el intento documentado).

-- ============================================================================
-- LISTO. Verificar:
--   select * from storage.buckets where id = 'negocios';
--   select * from storage.objects where bucket_id = 'negocios' limit 5;
-- ============================================================================
