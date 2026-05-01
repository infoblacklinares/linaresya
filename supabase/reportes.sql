-- ============================================================================
-- LinaresYa - Tabla de reportes (moderacion comunitaria)
-- Permite a los usuarios reportar negocios con info incorrecta, duplicados,
-- spam, etc. El admin recibe un email y puede tomar accion desde /admin.
-- Aplicar en SQL Editor de Supabase. Idempotente.
-- ============================================================================

create table if not exists public.reportes (
  id bigserial primary key,
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  motivo text not null check (motivo in (
    'info_incorrecta',
    'duplicado',
    'cerrado_definitivo',
    'no_existe',
    'spam_o_falso',
    'contenido_inapropiado',
    'otro'
  )),
  descripcion text,
  ip text,
  creado_en timestamptz default now() not null,
  resuelto boolean default false not null,
  resuelto_en timestamptz
);

create index if not exists idx_reportes_negocio on public.reportes(negocio_id);
create index if not exists idx_reportes_resuelto on public.reportes(resuelto, creado_en desc);

-- RLS sin policies = solo service_role accede. anon no lee ni escribe.
alter table public.reportes enable row level security;

-- ============================================================================
-- Verificar:
--   select * from public.reportes order by creado_en desc limit 5;
-- ============================================================================
