# LY-006 + LY-008 — Visitantes únicos, origen y campañas en el panel

- **Prioridad:** P0 / P1
- **Fecha:** 2026-09-12
- **Depende de:** LY-005 (en producción)
- **Estado final:** En pruebas — verificado en local, falta deploy y una mirada con sesión de admin
- **Siguiente tarea:** resultados reportados por el negocio (tabla aparte), y LY-010/011 productos

## Objetivo

Que el panel muestre lo que la tabla de eventos ya sabe y los contadores diarios nunca pudieron: personas distintas, clics nuevos, de dónde llegaron y qué campaña funcionó.

## Qué se agregó a `/admin/estadisticas`

### 1. Detalle de eventos
- **Visitantes únicos:** sesiones distintas que vieron una ficha.
- **Vistas (eventos):** cuántas veces se abrió, con recargas incluidas.
- **Tasa de acción:** acciones / visitantes únicos. Si no hay únicos muestra "—", nunca 0 %.
- **Tabla por tipo de evento**, con nombres legibles: llamadas, WhatsApp, cómo llegar, **Instagram, Facebook, sitio web, compartidos y escaneos de QR** — los cinco últimos no se medían hasta hoy.

### 2. Cómo llegaron (LY-008)
Tabla por origen con vistas, únicos y acciones: instagram, facebook, google, qr, directo, interno, o el dominio que haya referido.

Dice explícitamente qué significan los dos casos que siempre confunden: **directo** es quien escribió la dirección, la tenía guardada o llegó sin que el navegador informe de dónde; **interno** es navegación dentro del propio sitio.

### 3. Campañas (LY-008)
Solo aparece si hay campañas. Tabla con vistas, únicos, acciones y tasa por campaña, que sale del `utm_campaign` del link publicado. Con eso se compara **C001 contra C002** directamente.

Deja escrito que **el alcance de Instagram o Facebook no aparece ahí**: LinaresYa no lo puede medir y se anota a mano desde las estadísticas de Meta. Es el requisito del prompt de no inventar métricas externas.

### 4. Columna "Únicos" por negocio
La tabla de negocios ahora muestra, además de vistas y acciones, las sesiones distintas de cada ficha.

## Dos fuentes, separadas a propósito

| Bloque | De dónde sale | Cobertura |
|---|---|---|
| Totales de arriba | `estadisticas_diarias` (contadores) | Todo el historial |
| Detalle, origen y campañas | `eventos_negocio` | **Desde el 12-09-2026** |

La pantalla lo dice en su propio aviso. Mezclarlos en un solo número sería la forma más rápida de tener un panel que se contradice: antes del 12-sep no hay hora, ni sesión, ni origen, y eso no se puede reconstruir.

## Detalle técnico que importa

**El filtro por fecha se hace en código, no en la consulta.** El desfase de Chile cambia con el horario de verano, así que pedirle a Postgres un rango con offset fijo dejaría fuera (o de más) un par de horas dos veces al año. Se pide con margen y se filtra por día chileno con `fechaSantiagoDe`, que está probado.

**Si la tabla de eventos no existe, el panel no se cae:** esa consulta falla sola y los bloques nuevos simplemente no se muestran.

## Cambios

| Archivo | Cambio |
|---|---|
| `lib/eventos.ts` | `fechaSantiagoDe`, `filtrarPorFechas`, `resumenEventos`, `porFuente`, `porCampana`, `unicosPorNegocio` |
| `lib/eventos.test.mjs` | 7 tests nuevos (18 en total en ese archivo) |
| `app/admin/estadisticas/page.tsx` | Consulta de eventos + los tres bloques + la columna de únicos |

## Criterios de aceptación

- [x] Visitantes únicos visibles, y definidos como sesión de navegador.
- [x] Los eventos nuevos (Instagram, Facebook, web, compartir, QR) aparecen con nombre legible.
- [x] Desglose por origen del tráfico.
- [x] Desglose por campaña, con tasa por campaña.
- [x] Sin tasas cuando el denominador es 0.
- [x] La pantalla dice desde cuándo hay datos de eventos.
- [x] `npm test` 50/50, `tsc` y `eslint` limpios; las 5 variantes de la ruta responden bien en local.
- [ ] Revisión con sesión de admin (la hace Willson).
- [ ] Deploy.

## La pantalla del dueño (misma tarde)

Es la pantalla que Willson le muestra a un negocio para venderle Premium, así que ahí importa más el lenguaje que el número.

Qué se agregó a `/dueno/estadisticas/<token>`:

- **Personas distintas** y **Acciones generadas**, en grande. Son las dos cifras que contestan "¿esto me sirve?".
- **La frase que vende, dicha sin exagerar:** "De cada 100 personas que vieron tu ficha, N hicieron algo: llamarte, escribirte, pedir cómo llegar, ver tus redes o compartir tu ficha". Sale de la tasa real; si no hay acciones, no se muestra.
- **Desglose de lo que antes no se medía:** Instagram, Facebook, sitio web, compartidos y escaneos de QR. Solo los que tienen al menos uno.
- **De dónde llegaron**, con vistas y acciones por origen. Es lo que le dice al dueño si su Instagram funciona o si la gente lo encuentra buscando.
- **Aclaración de privacidad en su idioma:** "una persona distinta es una visita desde un navegador; si alguien vuelve otro día, cuenta de nuevo. No guardamos datos personales de quien te visita".
- "Clicks totales" pasó a llamarse **Acciones**, igual que en el panel del admin y que el plan.

También se eliminaron las copias locales de `fechaCL` y `diaCorto` de esa pantalla: ahora usa las de `lib/estadisticas.ts`, que están probadas. Y la tabla de nombres de eventos (`ETIQUETA_EVENTO`) se movió a `lib/eventos.ts` para que el admin y el dueño muestren siempre lo mismo.

Igual que en el panel: si la tabla de eventos no existe o no hay eventos, esos bloques no se muestran. El dueño nunca ve una pantalla de ceros.

## Lo que falta para cerrar el prompt de analítica

1. **Resultados reportados por el negocio:** consultas y clientes que el negocio dice haber recibido, en tabla aparte y claramente separados de lo automático. Es lo último que queda del prompt.
2. ~~Estadísticas del dueño con lo nuevo~~ — hecho el 2026-09-12.
