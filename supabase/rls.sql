-- LinaresYa - Row Level Security
-- Esta migracion es IDEMPOTENTE: se puede correr multiples veces sin romper nada.
--
-- Objetivo:
--   - Habilitar RLS en todas las tablas.
--   - Permitir SELECT publico solo de datos "activos" / "aprobados" / "publicados".
--   - NO permitir INSERT/UPDATE/DELETE desde anon. Todas las escrituras pasan por
--     server actions con la service_role key, que bypasea RLS.
--   - Cerrar totalmente las tablas sensibles (pagos, estadisticas_*).
--
-- El service_role key SIEMPRE bypasea RLS y estas politicas, asi que el admin
-- y /publicar siguen funcionando sin cambios.
--
-- Como ejecutar:
--   Supabase Dashboard > SQL Editor > New query > pega todo > Run.

-- ============================================================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================
alter table if exists public.categorias          enable row level security;
alter table if exists public.negocios            enable row level security;
alter table if exists public.horarios            enable row level security;
alter table if exists public.ofertas             enable row level security;
alter table if exists public.fotos               enable row level security;
alter table if exists public.resenas             enable row level security;
alter table if exists public.pagos               enable row level security;
alter table if exists public.estadisticas_diarias enable row level security;

-- ============================================================================
-- 2. LIMPIAR POLITICAS ANTERIORES (si ya corriste este script antes)
-- ============================================================================
drop policy if exists "public_read_active_categorias"   on public.categorias;
drop policy if exists "public_read_active_negocios"     on public.negocios;
drop policy if exists "public_read_horarios_of_active"  on public.horarios;
drop policy if exists "public_read_active_ofertas"      on public.ofertas;
drop policy if exists "public_read_fotos_of_active"     on public.fotos;
drop policy if exists "public_read_approved_resenas"    on public.resenas;

-- ============================================================================
-- 3. POLITICAS DE LECTURA PUBLICA (rol anon y authenticated)
-- ============================================================================

-- CATEGORIAS: cualquiera puede ver las categorias activas.
create policy "public_read_active_categorias" on public.categorias
  for select
  to anon, authenticated
  using (activa = true);

-- NEGOCIOS: cualquiera puede ver los negocios activos. Los pendientes
-- (activo=false) NO se exponen a nadie sin service_role.
create policy "public_read_active_negocios" on public.negocios
  for select
  to anon, authenticated
  using (activo = true);

-- HORARIOS: solo se pueden leer horarios de negocios que ya estan activos.
-- Esto evita que alguien escanee horarios y descubra ids de negocios pendientes.
create policy "public_read_horarios_of_active" on public.horarios
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.negocios n
      where n.id = horarios.negocio_id
        and n.activo = true
    )
  );

-- OFERTAS: solo ofertas activas de negocios activos.
create policy "public_read_active_ofertas" on public.ofertas
  for select
  to anon, authenticated
  using (
    activa = true
    and exists (
      select 1 from public.negocios n
      where n.id = ofertas.negocio_id
        and n.activo = true
    )
  );

-- FOTOS: solo fotos de negocios activos.
create policy "public_read_fotos_of_active" on public.fotos
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.negocios n
      where n.id = fotos.negocio_id
        and n.activo = true
    )
  );

-- RESENAS: solo reseñas aprobadas de negocios activos.
create policy "public_read_approved_resenas" on public.resenas
  for select
  to anon, authenticated
  using (
    aprobada = true
    and exists (
      select 1 from public.negocios n
      where n.id = resenas.negocio_id
        and n.activo = true
    )
  );

-- ============================================================================
-- 4. TABLAS SENSIBLES: SIN POLITICAS = CERO ACCESO PARA ANON
-- ============================================================================
-- pagos y estadisticas_* no reciben politicas. Con RLS habilitado y sin
-- ninguna politica, el rol anon queda bloqueado completamente. El service_role
-- bypasea RLS, asi que el admin (cuando lo agregues a esas tablas) funciona.

-- ============================================================================
-- 5. VERIFICACION
-- ============================================================================
-- Para confirmar que todo quedo bien, corre despues:
--   select schemaname, tablename, rowsecurity from pg_tables
--   where schemaname = 'public' order by tablename;
-- Todas las tablas deben decir rowsecurity = true.
--
-- Y para ver las politicas:
--   select tablename, policyname, cmd, roles from pg_policies
--   where schemaname = 'public' order by tablename, policyname;
