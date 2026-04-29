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

-- Insert publico: anon puede subir SOLO al bucket 'negocios' (no a otros).
-- Esto es necesario porque los uploads se hacen client-side (browser ->
-- Storage directo) para no pasar por Vercel y evitar el limite de 4.5MB
-- de body en funciones. El bucket tiene file_size_limit y allowed_mime_types
-- que ya filtran abuso a nivel Storage.
drop policy if exists "negocios_anon_insert" on storage.objects;
create policy "negocios_anon_insert" on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'negocios');

-- service_role bypasea RLS automaticamente para update/delete (admin desde
-- backend cuando hay que limpiar archivos). No necesita policy explicita.

-- ============================================================================
-- LISTO. Verificar:
--   select * from storage.buckets where id = 'negocios';
--   select * from storage.objects where bucket_id = 'negocios' limit 5;
-- ============================================================================
