-- UX-04.3.1 — Cerca de mí respeta la búsqueda y filtros actuales
-- La lista opcional p_negocio_ids limita el cálculo geográfico a los resultados
-- que /buscar ya determinó. Así "mueblería + Cerca de mí" ordena las
-- mueblerías por distancia en vez de buscar 50 negocios y filtrarlos después.

drop function if exists public.get_negocios_cerca_de_mi(double precision, double precision, integer);

create function public.get_negocios_cerca_de_mi(
  p_lat double precision,
  p_lng double precision,
  p_limite integer default 50,
  p_negocio_ids uuid[] default null
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
    and (
      p_negocio_ids is null
      or n.id = any(p_negocio_ids)
    )
  order by distancia_km asc
  limit greatest(1, least(coalesce(p_limite, 50), 50));
$$;

comment on function public.get_negocios_cerca_de_mi(double precision, double precision, integer, uuid[])
is 'UX-04.3.1: devuelve negocios activos con coordenadas válidas ordenados por distancia; opcionalmente limita el cálculo a los resultados actuales de búsqueda. No almacena la ubicación del usuario.';

grant execute on function public.get_negocios_cerca_de_mi(double precision, double precision, integer, uuid[])
to anon, authenticated;
