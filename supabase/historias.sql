-- LinaresYa - Historias tipo Instagram para negocios premium
-- IDEMPOTENTE: se puede correr varias veces.
--
-- Como ejecutar: Supabase Dashboard > SQL Editor > pegar todo > Run.

create table if not exists public.historias (
  id         bigint generated always as identity primary key,
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  imagen_url text not null,
  texto      text,
  creada_en  timestamptz not null default now(),
  expira_en  timestamptz not null default now() + interval '24 hours'
);

create index if not exists historias_expira_idx on public.historias (expira_en desc);
create index if not exists historias_negocio_idx on public.historias (negocio_id);

alter table public.historias enable row level security;

-- Lectura publica solo de historias vigentes. Las escrituras van por
-- server actions con service_role (bypasea RLS), igual que el resto.
drop policy if exists "public_read_historias_vigentes" on public.historias;
create policy "public_read_historias_vigentes" on public.historias
  for select
  to anon, authenticated
  using (expira_en > now());
