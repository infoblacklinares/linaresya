# LY-003 — Contactos y CTA

- **Prioridad:** P0
- **Fecha:** 2026-09-11
- **Depende de:** LY-002 (completada)
- **Estado final:** En pruebas — verificado en local, falta deploy
- **Siguiente tarea:** LY-022 — Mobile first

## Objetivo

Normalizar teléfono, WhatsApp, Instagram, Facebook, sitio web y email, y que cada botón aparezca solo cuando existe el dato.

## Problema actual (antes del cambio)

1. **60 de 163 fichas mostraban "Llamar" deshabilitado** y 5 mostraban "Sin dirección". Eran botones vacíos.
2. `normalizarWhatsApp` estaba copiada en 3 archivos (publicar, admin, dueño). Aceptaba cualquier cantidad de dígitos, incluso números fijos.
3. El teléfono no se validaba: se guardaba el texto tal cual y el `tel:` solo quitaba espacios.
4. `AdvertisementBanner` armaba `wa.me/56` + un número que ya traía `56` (`wa.me/5656…`).
5. El JSON-LD publicaba el WhatsApp en `sameAs` **aunque el negocio fuera Básico**. El WhatsApp es de Premium, así que eso exponía un dato que no correspondía.
6. El JSON-LD armaba el teléfono anteponiendo `+56` a cualquier cosa, incluso a números 600/800.
7. El dueño no podía editar su sitio web. Facebook no existía en ninguna parte.
8. El mensaje de WhatsApp no era el del plan.

## Datos reales (163 fichas, en vivo)

103 tienen teléfono: 65 celulares con 56, 28 fijos con 56, 5 números 600/800, 1 fijo sin 56, 2 celulares sin 56 y 2 con un dígito de menos (`562…` con 10 dígitos).

## Cambio implementado

| Archivo | Cambio |
|---|---|
| `lib/contacto.ts` (nuevo) | Único normalizador: `normalizarTelefono`, `normalizarWhatsApp`, `normalizarFacebook`, `normalizarSitioWeb`. Links: `telLink`, `whatsAppLink`, `telefonoInternacional`. Mensaje `MENSAJE_WHATSAPP` |
| `lib/contacto.test.mjs` (nuevo) | 9 tests con `node:test`. Primer test del proyecto |
| `package.json` | Script `npm test` |
| `app/[slug]/[negocio]/page.tsx` | Botones solo con dato (grid de 1-3 columnas). Se eliminan los botones deshabilitados. Botón Facebook. Usa el tipo `Negocio` central (LY-002). WhatsApp al JSON-LD solo si es Premium |
| `lib/jsonld.ts` | Facebook en `sameAs`. Teléfono con `telefonoInternacional`: si no calza con un formato chileno, se omite. WhatsApp normalizado |
| `app/[slug]/page.tsx`, `app/buscar/page.tsx` | `wa.me` con `whatsAppLink` |
| `components/AdvertisementBanner.tsx` | Arreglado el `wa.me/5656…` |
| `app/page.tsx` | `tel:` con `telLink` |
| `app/publicar/actions.ts` + `PublishForm.tsx` | Mismas reglas en el servidor y en pantalla. Se eliminan `PHONE_RE` y `URL_RE` |
| `app/admin/negocio/[id]/editar/actions.ts` + `EditForm.tsx` | Normalizador central. Campo Facebook. Errores visibles en teléfono y WhatsApp. El sitio web acepta `minegocio.cl` sin https |
| `app/dueno/editar/[token]/*` | Normalizador central. **El dueño ahora puede editar el sitio web y Facebook.** Aviso de que el WhatsApp sale con Premium |

### Formatos guardados

| Campo | Formato |
|---|---|
| telefono | `+56912345678`, `+56732211234`; 600/800 sin +56 (`6003600000`) |
| whatsapp | `56912345678` (solo celulares) |
| facebook | `https://www.facebook.com/pagina` (cumple el CHECK de la BD) |
| sitio_web | `https://minegocio.cl/` (rechaza links de Instagram/Facebook) |

Los datos viejos no se tocan. Los links toleran formatos antiguos: un teléfono raro igual se puede marcar. Corregir esos datos es tarea de LY-033.

## Autorización

| Rol | Teléfono / web / redes | WhatsApp |
|---|---|---|
| Visitante | Ve los botones con dato | Solo si el negocio es Premium |
| Dueño Básico | Edita todo | Lo puede guardar; la ficha no lo muestra (se le avisa) |
| Dueño Premium | Edita todo | Se muestra |
| Admin | Edita todo | Edita todo |

## Tracking

Sin cambios de eventos (eso es LY-005). Llamar, WhatsApp y Llegar siguen registrados. Instagram, Facebook y web todavía no se registran.

## Criterios de aceptación

- [x] No hay botones vacíos: 0 de 163 fichas con botón deshabilitado (verificado en local).
- [x] Llamar funciona: 103/103 con `tel:` válido (98 `+56…`, 5 números 600/800).
- [x] WhatsApp respeta el plan: 0 botones con 0 negocios Premium. Tampoco se filtra al JSON-LD.
- [x] Instagram, Facebook y web solo aparecen si hay dato.
- [x] Validaciones iguales en publicar, admin y dueño.
- [x] `npm test` 9/9, `tsc` 0 errores, `eslint` 0 errores.
- [ ] Deploy a producción y revisión en un celular real.

## Pruebas

- **Normal / vacío / inválido:** cubiertos en `lib/contacto.test.mjs`.
- **Regresión:** las 163 fichas renderizadas en local responden 200.
- **Básico / Premium:** WhatsApp solo con `plan = premium`, en la ficha, las tarjetas, la búsqueda y el JSON-LD.
- **Móvil:** el orden de los CTA no cambió (sigue abajo). Eso es LY-022.
- **Admin y dueño:** verificados por tipos y tests. No se probaron en el navegador (requieren clave de admin o token).

## Riesgos

- **Validación más estricta:** un dueño o el admin con un teléfono viejo mal escrito (2 casos `562…`) va a ver un error al guardar hasta que lo corrija. Es intencional.
- 1 ficha queda sin ningún botón principal (sin teléfono ni dirección). Es un problema del dato (LY-033).

## Hallazgo lateral (para LY-005 / LY-030)

El filtro de bots de la ficha (`BOT_UA_RE`) **no reconoce `curl`, `wget` ni scripts**. Durante la auditoría de LY-001/LY-003 los barridos con `curl` a producción se contaron como visitas. Esto se corrige en LY-005.
