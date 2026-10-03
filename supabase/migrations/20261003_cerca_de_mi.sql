-- UX-04.3 — Modo geográfico real de "Cerca de mí"
-- Alcance: solo crea la función de consulta geográfica.
-- No modifica la tabla public.negocios ni agrega columnas.
--
-- La función recibe la ubicación del usuario y devuelve IDs de negocios
-- activos con coordenadas válidas, ordenados por distancia ascendente.
-- La aplicación podrá usar estos IDs para cargar las fichas con su consulta
-- normal y mantener la lógica existente de tarjetas, ratings y filtros.
--
-- Seguridad:
-- - SECURITY INVOKER: respeta los permisos/RLS del rol que ejecuta la función.
-- - No guarda ni registra la ubicación del usuario.
-- - No usa SECURITY DEFINER ni la secret key.

create or replace function public.get_negocios_cerca_de_mi(
  p_lat double precision,
  p_lng double precision,
  p_limite integer default 50
)
returns table (
  negocio_id uuid,
  distancia_km double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    n.id as negocio_id,
    (
      6371.0 * 2.0 * asin(
        sqrt(
          power(
            sin(radians(n.lat - p_lat) / 2.0),
            2
          )
          +
          cos(radians(p_lat))
          * cos(radians(n.lat))
          * power(
            sin(radians(n.lng - p_lng) / 2.0),
            2
          )
        )
      )
    )::double precision as distancia_km
  from public.negocios as n
  where n.activo = true
    and n.lat is not null
    and n.lng is not null
    and n.lat between -90 and 90
    and n.lng between -180 and 180
    and p_lat between -90 and 90
    and p_lng between -180 and 180
  order by distancia_km asc
  limit greatest(1, least(coalesce(p_limite, 50), 50));
$$;

comment on function public.get_negocios_cerca_de_mi(double precision, double precision, integer)
is 'UX-04.3: devuelve hasta 50 negocios activos con coordenadas válidas, ordenados por distancia respecto de la ubicación recibida. No almacena la ubicación del usuario.';

grant execute on function public.get_negocios_cerca_de_mi(double precision, double precision, integer)
to anon, authenticated;
