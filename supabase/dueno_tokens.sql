-- ============================================================================
-- LinaresYa - Tabla de magic links para dueños
-- Permite a un dueño editar su negocio sin pasar por el admin, mediante un
-- link unico enviado al email registrado.
-- Aplicar en SQL Editor de Supabase. Idempotente.
-- ============================================================================

create table if not exists public.dueno_tokens (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  token text unique not null,
  email_solicitado text not null,
  creado_en timestamptz default now() not null,
  expira_en timestamptz not null,
  usado_por_primera_vez timestamptz,
  ip text
);

create index if not exists idx_dueno_tokens_token on public.dueno_tokens(token);
create index if not exists idx_dueno_tokens_negocio on public.dueno_tokens(negocio_id);
create index if not exists idx_dueno_tokens_expira on public.dueno_tokens(expira_en);

-- RLS: SIN policies = solo service_role accede. anon nunca lee tokens.
-- Toda la logica de validacion vive en server actions con supabaseAdmin.
alter table public.dueno_tokens enable row level security;

-- Funcion auxiliar para limpiar tokens expirados (opcional, podes correrla
-- manualmente o con un cron). No bloqueante: tokens expirados igualmente
-- son rechazados por la logica del action.
create or replace function public.limpiar_dueno_tokens_expirados()
returns void
language sql
as $$
  delete from public.dueno_tokens
  where expira_en < now() - interval '7 days';
$$;

-- ============================================================================
-- LISTO. Verificar:
--   select * from public.dueno_tokens limit 1;
--   select limpiar_dueno_tokens_expirados();
-- ============================================================================
