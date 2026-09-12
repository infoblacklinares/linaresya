# LY-024 — Sistema de planes

- **Prioridad:** P0
- **Fecha:** 2026-09-12
- **Depende de:** LY-023 (completada)
- **Estado final:** En pruebas — verificado en local, falta deploy
- **Cierra:** Fase 1 del plan (Entender)
- **Siguiente tarea:** LY-005 — Sistema de eventos (Fase 2, Medir)

## Objetivo

Que la oferta comercial se pueda cambiar en un solo archivo, en vez de en diez pantallas.

## Problema actual

1. **`plan === "premium"` repetido en 10 archivos.** Ficha, categoría, búsqueda, portada, mapa, favoritos, imagen de Open Graph, estadísticas del dueño y el panel. Para mover qué incluye cada plan había que editar todas.
2. **Un Premium vencido seguía viéndose como Premium.** La única cosa que bajaba el plan era el cron `/api/cron/expire-premium`, que corre a las 07:00. Entre el vencimiento y el cron, el negocio mostraba el botón de WhatsApp, el sello ⭐ y la prioridad en la búsqueda sin haber pagado. En el peor caso, casi un día entero.
3. **No existía separación entre plan y función.** El plan estaba mezclado con la decisión de qué habilita.

## Cambio implementado

### `lib/planes.ts` (nuevo)

| Función | Qué responde |
|---|---|
| `planVigente(negocio)` | Qué plan corre **hoy**, mirando `premium_hasta` |
| `esPremium(negocio)` | Atajo de lo más consultado |
| `canUseFeature(negocio, feature)` | Si ese plan habilita esa función |

Tabla de capacidades, que es lo único que hay que tocar para cambiar la oferta:

| Función | Básico | Premium |
|---|---|---|
| `whatsapp` | — | Sí |
| `destacado` | — | Sí |
| `estadisticas` | Sí | Sí |
| `galeria` | Sí, hasta **3 fotos** | Sí, hasta **8 fotos** |
| `ofertas` | Sí | Sí |

**La tabla refleja cómo funciona el sitio hoy, no la lista de deseos.** El plan comercial dice que las estadísticas deberían ser de Premium, pero hoy las tiene cualquier negocio: quitárselas a 164 negocios es una decisión de Willson, no técnica. Cuando la tome, se cambia esa tabla y nada más.

Reglas de `premium_hasta`:
- `null` → Premium sin vencimiento (así lo deja el panel si el admin no pone fecha).
- fecha futura → Premium.
- fecha pasada → **Básico de inmediato**, sin esperar el cron.
- La consulta no trajo la columna → se confía en el plan guardado.
- Fecha inválida → se respeta el plan guardado (no se castiga al negocio por un dato mal escrito).

### Archivos que ahora preguntan por la capa central

| Archivo | Qué usa |
|---|---|
| `app/[slug]/[negocio]/page.tsx` | `canUseFeature(n, "whatsapp")` para el botón, `esPremium` para el sello |
| `app/[slug]/page.tsx`, `app/buscar/page.tsx` | Botón de WhatsApp y sello en las tarjetas |
| `app/buscar/page.tsx` | El desempate del orden usa `canUseFeature(n, "destacado")` |
| `app/page.tsx` | Banner del destacado y sello en la portada |
| `app/mapa/page.tsx` | Marcador Premium (ahora la consulta trae `premium_hasta`) |
| `app/favoritos/FavoritosList.tsx` | Sello |
| `app/[slug]/[negocio]/opengraph-image.tsx` | Sello de la imagen que se ve al compartir |
| `app/dueno/estadisticas/[token]/page.tsx` | El dueño ve su plan vigente y, si venció, la oferta de Premium |
| `app/dueno/editar/[token]/DuenoEditForm.tsx` | El aviso de "tu WhatsApp sale con Premium" |

**El panel de administración se deja como está, a propósito:** ahí el admin tiene que ver el plan **guardado** y su fecha de vencimiento, no el efectivo. Es la pantalla donde se arregla, no donde se aplica.

## Base de datos

Sin cambios. Se agregó `premium_hasta` a tres consultas que no lo traían (mapa, imagen Open Graph, estadísticas del dueño).

## Autorización

Sin cambios en quién puede editar. Cambia **cuándo** se considera Premium a un negocio: ahora el vencimiento aplica al instante.

## Criterios de aceptación

- [x] Una sola función decide el plan vigente.
- [x] Una sola tabla decide qué habilita cada plan.
- [x] Un Premium vencido pierde WhatsApp, sello y prioridad al instante.
- [x] El admin sigue viendo el plan guardado y la fecha.
- [x] Ningún `plan === "premium"` suelto fuera del panel.
- [x] `npm test` 14/14 (5 casos nuevos), `tsc` y `eslint` limpios.
- [ ] Deploy y revisión con un negocio Premium real (hoy no hay ninguno).

## Pruebas

`lib/planes.test.mjs`: básico, plan desconocido, Premium sin fecha, Premium vigente, Premium vencido, columna ausente, fecha inválida, y las capacidades de cada plan.

**Sin probar en vivo:** no hay ningún negocio Premium en producción, así que el camino Premium no se puede ver en el sitio. Se probó por tests. Cuando se venda el primero, hay que mirar la ficha de verdad.

## Riesgos

- Bajo. Hoy los 164 negocios son Básicos, así que en producción el comportamiento visible no cambia.
- El cron de las 07:00 sigue siendo necesario: es el que escribe el cambio en la base. La capa nueva solo evita mostrar de más entremedio.

## Nota para LY-025

La separación que pide LY-025 (plan versus función) quedó hecha acá: `Feature` y la tabla `FEATURES`. Lo que falta de esa tarea es decidir la oferta comercial, no programar.
