# LY-032 — Estrategia de caché del service worker

- **Prioridad:** P2
- **Fecha:** 2026-09-12
- **Estado:** Verificado por tests, pendiente de revisión en producción

## Por qué ahora

Verificando la medición antes de la campaña, el cache de producción tenía **81
entradas y 3,54 MB**, de las cuales **62 eran páginas y 51 traían query string**:
casi todas eran la misma ficha guardada una vez por cada combinación de UTM que
se probó.

Una campaña hace exactamente eso a escala: un link por publicación, con
`utm_content` distinto, multiplica copias de 100 KB de la misma página.

## El problema real

No es el espacio en un computador. Es que **el navegador borra el origen
completo cuando se acerca a la cuota**, y en un teléfono esa cuota es chica. El
cache existe para que alguien sin señal todavía pueda abrir la ficha que vio
ayer; si crece sin techo, el navegador lo borra entero y esa persona se queda
sin nada. El cache se sabotea solo.

## Cambio

Un cache pasa a ser dos, porque son dos problemas distintos:

| Cache | Qué guarda | Estrategia | Tope |
|---|---|---|---|
| `linaresya-estaticos-v3` | `/_next/static/`, imágenes, fuentes | cache-first | 80 entradas |
| `linaresya-paginas-v3` | HTML de páginas | **network-first** | 30 entradas |

- **Las páginas siguen siendo network-first.** Nunca se le sirve una página
  vieja a alguien con conexión: si un negocio pasa a Premium, se ve en la
  siguiente carga. La copia guardada es el plan B de quien se quedó sin señal.
- **Los parámetros de medición no crean entradas nuevas.** `utm_*`, `fbclid`,
  `gclid`, `mc_cid`, `mc_eid` y `ref` se sacan de la clave del cache. `q` de la
  búsqueda y cualquier otro parámetro que sí cambie la página se respetan.
- **Los dos caches se recortan** botando lo más viejo primero.
- **Al activar se borran las versiones anteriores**, así que los 3,54 MB de
  basura acumulada desaparecen solos en la primera visita después del deploy.
- **`install` tolera fallas.** Antes usaba `addAll`: un solo 404 en la lista de
  precarga tiraba abajo la instalación completa y el sitio se quedaba sin
  service worker.
- **`/sw.js` nunca se cachea a sí mismo**, para que una versión nueva pueda
  entrar.

## Un bug que encontró el test

La primera versión del recorte hacía `claves.slice(0, claves.length - tope)`.
Mientras hubiera **menos** entradas que el tope, esa resta da negativo y
`slice(0, -n)` devuelve casi toda la lista: el recorte borraba justo lo que
había que conservar. En la prueba, 45 páginas visitadas dejaban 15 en vez de 30.

Es exactamente el tipo de falla que no se ve: el sitio funciona igual, solo que
el modo sin conexión queda casi vacío. Se arregló con `Math.max(0, ...)` y quedó
un test que lo cubre.

## Pruebas

`lib/sw.test.mjs` (7 casos). `public/sw.js` corre en el navegador y no se puede
importar, así que se carga en un contexto aparte con lo mínimo que un service
worker espera encontrar.

| Caso | Qué asegura |
|---|---|
| Links de campaña | 4 URL con UTM distintos dejan **1** entrada |
| Parámetros reales | `?q=pizza` y `?q=peluqueria` siguen siendo dos páginas |
| Techo | 45 visitas dejan 30, y se botan las viejas, no las recientes |
| Sin conexión | Entrando por un link con UTM se encuentra igual la copia |
| Sin conexión y sin copia | Se sirve `/offline` |
| Tracking | `/api/track` no se cachea nunca |
| Activación | Las caches de versiones anteriores se borran |

**Sin probar en un navegador:** el panel de esta sesión no permite registrar un
service worker en `localhost` (falla al buscar el script). Hay que revisar en
producción después del deploy: que aparezcan `linaresya-estaticos-v3` y
`linaresya-paginas-v3`, que `linaresya-v2` ya no esté, y que entrar a una ficha
con dos UTM distintos deje una sola entrada.

## Riesgos

- Bajo para quien navega con conexión: las páginas ya eran network-first y lo
  siguen siendo.
- La primera visita después del deploy vuelve a descargar los estáticos, porque
  el cache cambia de nombre. Una vez.
