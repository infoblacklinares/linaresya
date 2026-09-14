# LY-034 — Páginas por rubro

- **Prioridad:** P0 comercial
- **Fecha:** 2026-09-13
- **Estado:** Verificado en build de producción local, pendiente deploy

## De dónde salió

Willson dijo que a los dos negocios Premium **no les ha llegado ningún cliente**.
Eso no es un problema de medición: el sitio registró 7 vistas de 5 sesiones en un
día. Con ese tráfico, Premium no puede entregar clientes porque no hay a quién
entregarle.

Al revisar por qué no llega tráfico apareció el agujero:

- Las 19 categorías del sitio son baldes anchos — `gastronomia`, `belleza`,
  `servicios-y-oficios`, `comercio`.
- **Nadie busca eso en Google.** La gente escribe "restaurantes en Linares",
  "peluquerías en Linares", "veterinaria Linares".
- `linaresya.cl/restaurantes` y `linaresya.cl/peluquerias` daban **404**. No
  existía una sola página apuntando a lo que la gente escribe.

Lo técnico estaba bien: robots, sitemap de 252 URL, títulos, descripciones y
JSON-LD. El problema no era la higiene, era que faltaban las páginas.

## El cambio

Una página por rubro en `/en-linares/<rubro>`, más un índice en `/en-linares`.

**Se arman solas.** Cada página corre la misma búsqueda de texto completo que ya
usa el buscador (`busqueda` tsvector, config `spanish_unaccent`). Consecuencias:

- No hay ningún campo nuevo que cargar en los 164 negocios.
- Cuando entra una peluquería nueva, aparece en su página sin tocar código.
- Agregar un rubro es agregar una línea en `lib/rubros.ts`.

**Mínimo tres negocios.** Una página con uno o dos resultados no le sirve a nadie
que la encuentre, y Google la trata como página vacía hecha para posicionar. Si
no llega a tres, responde 404; el día que se cargue el tercero, empieza a
funcionar sola.

**Enlaces internos.** Cada página enlaza a cuatro rubros vecinos, en círculo, y
el índice las enlaza a todas. Una página a la que solo se llega por el sitemap
tarda mucho más en entrar a Google, y varias nunca entran.

## Estado al momento del deploy

De 15 rubros definidos, **13 tienen material suficiente**:

| Rubro | Negocios | Rubro | Negocios |
|---|---|---|---|
| mecanicos | 21 | farmacias | 9 |
| restaurantes | 14 | kinesiologia | 5 |
| peluquerias | 13 | gimnasios | 6 |
| dentistas | 11 | cafeterias | 5 |
| ferreterias | 9 | abogados | 4 |
| veterinarias | 8 | carnicerias | 3 |
| panaderias | 6 | | |

`jardines-infantiles` y `contadores` responden 404 por ahora, a propósito.

## Verificado

En un build de producción local:

- Las 13 páginas con material responden 200; las 2 sin material, 404.
- `/en-linares` responde 200 y enlaza a todas.
- Una página de ejemplo trae `<title>`, meta description con el número real de
  negocios, `<link rel="canonical">`, `<h1>` y JSON-LD `ItemList`.
- Un rubro inventado responde 404.
- El sitemap incluye las 17 URL nuevas.
- La portada y una ficha siguen en 200.

Se corrigió un defecto encontrado en la verificación: el título salía duplicado
(`... | LinaresYa | LinaresYa`) porque el layout ya agrega el sufijo.

## Riesgos y lo que falta

- **Solapamiento con el blog.** Ya existe `/blog/restaurantes-en-linares`. Son
  cosas distintas (un artículo contra un listado), pero compiten por la misma
  búsqueda. Hay que mirar en unas semanas cuál posiciona y, si se estorban,
  dejar una.
- **Esto no da tráfico mañana.** Google tarda semanas en indexar y posicionar
  páginas nuevas. Lo que cambia hoy es que las páginas existen; antes no había
  ni dónde posicionar.
- El índice quedó enlazado desde el pie de página ("Negocios por rubro"), para
  que no sea una página huérfana. Más adelante conviene enlazar los rubros con
  más negocios directamente desde la portada.
