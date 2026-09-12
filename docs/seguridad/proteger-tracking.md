# Proteger el registro de eventos (`/api/track`)

- **Prioridad:** P0 del registro de arquitectura
- **Fecha:** 2026-09-12
- **Estado final:** Implementado y verificado en local. **Falta correr una migración en producción** y desplegar
- **Siguiente tarea:** LY-005 — Sistema de eventos

## Problema

`/api/track` era público y sin límite. Con una línea en la consola del navegador, cualquiera podía sumar visitas, llamadas o clics de WhatsApp a cualquier negocio. Y el filtro de bots solo miraba crawlers conocidos: **`curl` contaba como visita**. La evidencia no es teórica: los barridos de auditoría del 11-sep sumaron **346 visitas falsas** a fichas reales, y hubo que corregirlas a mano en la base.

Eso rompía el requisito más importante del piloto: que los números se puedan defender delante de un negocio al que se le va a cobrar.

## Tres puertas antes de contar

| Puerta | Qué rechaza | Dónde |
|---|---|---|
| 1. User-agent de navegador real | `curl`, `wget`, `python-requests`, Postman, headless, crawlers, y también el user-agent vacío | `lib/peticion.ts` → `esBot()` |
| 2. Mismo origen | Peticiones que no vienen de linaresya.cl (ni de un preview del proyecto). Se mira `Origin` y, si falta, `Referer` | `lib/peticion.ts` → `mismoOrigen()` |
| 3. Límite en la base | Más de 30 eventos del mismo origen y mismo tipo por minuto, y eventos de negocios inexistentes o inactivos | `supabase/rate_limite_eventos.sql` |

**El límite vive en Postgres a propósito.** Los límites en memoria de la aplicación no sirven en Vercel: cada instancia tiene su propio contador, así que el tope real es "el que toque". La base es la única pieza compartida.

**No se guarda la IP.** La clave del límite es un hash truncado con sal (`claveLimite()`), que alcanza para frenar a quien repite y no es un dato personal almacenado (Ley 21.719). Con otra sal, la tabla no sirve para rastrear a nadie.

Al que no pasa una puerta se le responde `ok` igual: una métrica no tiene por qué explicarle a un script cómo esquivarla, y no puede ensuciar la consola de quien está navegando. Un negocio inexistente tampoco devuelve error: se registra en el log y no se cuenta.

## Archivos

| Archivo | Cambio |
|---|---|
| `lib/peticion.ts` | Nuevo. `esBot`, `mismoOrigen`, `claveLimite`, `ipDeCabeceras` |
| `lib/peticion.test.mjs` | Nuevo. 8 tests |
| `supabase/rate_limite_eventos.sql` | Nueva migración: tabla `eventos_limite` + `incrementar_estadistica_limitado` |
| `app/api/track/route.ts` | Las tres puertas y el llamado a la función con límite |
| `app/[slug]/[negocio]/page.tsx` | La vista de ficha usa el mismo filtro de bots y el mismo límite |

El código funciona **con o sin la migración corrida**: si la función todavía no existe, avisa en el log y cuenta como antes. Así no se pierden eventos entre el deploy y la migración.

## Verificación (local)

| Caso | Resultado |
|---|---|
| POST con user-agent `curl` | `{"ok":true,"contado":false}` — ignorado |
| POST de navegador sin `Origin` ni `Referer` | 403 |
| POST de navegador con `Origin` de otro sitio | 403 |
| POST con evento inventado | 400 |
| POST con negocio inexistente | no se cuenta, queda en el log |
| GET de health check | 200 |

Más `npm test` 33/33 (8 tests nuevos), `tsc` y `eslint` limpios.

## Lo que falta

1. **Correr `supabase/rate_limite_eventos.sql` en producción.** Hasta que eso pase, las puertas 1 y 2 ya protegen, pero no hay tope por minuto.
2. **Los otros límites siguen en memoria:** búsqueda, reseñas y reportes. Mismo problema, distinta puerta. Se resuelven con el mismo patrón o con reglas en Cloudflare.
3. **Recargar la misma ficha sigue sumando vistas.** Para distinguir una visita de diez recargas hace falta identificador de sesión, y eso es LY-005.
4. **Opcional:** definir `TRACK_SALT` en Vercel. Sin eso se usa una sal por defecto, que funciona igual pero es conocida por cualquiera que lea el repo.
