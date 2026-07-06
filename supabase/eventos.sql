-- LinaresYa - Eventos locales (conciertos, ferias, actividades municipales)
-- IDEMPOTENTE: se puede correr varias veces.
--
-- Como ejecutar: Supabase Dashboard > SQL Editor > pegar todo > Run.

create table if not exists public.eventos (
  id           bigint generated always as identity primary key,
  titulo       text not null,
  descripcion  text,
  emoji        text not null default '🎉',
  lugar        text not null,
  direccion    text,
  fecha_inicio timestamptz not null,
  fecha_fin    timestamptz,
  imagen_url   text,
  link         text,
  destacado    boolean not null default false,
  creado_en    timestamptz not null default now()
);

create index if not exists eventos_fecha_idx on public.eventos (fecha_inicio);

alter table public.eventos enable row level security;

-- Lectura publica de eventos que no han terminado (o sin fecha_fin, que no
-- hayan pasado mas de 1 dia desde su inicio). Escrituras via service_role.
drop policy if exists "public_read_eventos_vigentes" on public.eventos;
create policy "public_read_eventos_vigentes" on public.eventos
  for select
  to anon, authenticated
  using (coalesce(fecha_fin, fecha_inicio + interval '1 day') > now());
