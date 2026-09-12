# LY-001 — Auditoría técnica de LinaresYa

- **Prioridad:** P0
- **Fecha:** 2026-09-11
- **Base auditada:** `main` @ `e472c3b` (09-sep-2026), producción `linaresya.cl`
- **Estado final:** Completada. El `VERIFICAR` del esquema se cerró el 2026-09-11 con la consulta de §12
- **Siguiente tarea:** LY-002 — Modelo Business

---

## 1. Objetivo

Entender cómo funciona LinaresYa hoy antes de modificarlo. No se cambió código en esta tarea.

## 2. Método

1. Lectura del código en `main` (repo local estaba 30 commits atrás, se actualizó con fast-forward).
2. Revisión de los SQL del repo y del esquema base `../linaresya_database_final.sql` (fuera del repo).
3. Barrido de las **163 fichas públicas** en vivo desde `sitemap.xml` (HTML servido).
4. Revisión móvil (375×812) de una ficha en el navegador.
5. `tsc --noEmit` y `eslint .`.
6. La BD de producción no se consultó directo (la lectura con service role quedó bloqueada por permisos). Willson corrió la consulta de solo lectura de §12 en el SQL Editor de Supabase.

---

## 3. Arquitectura actual

| Capa | Tecnología | Nota |
|---|---|---|
| Frontend + backend | Next.js 16 (App Router), React 19, Tailwind 4 | Server Components + Server Actions. `middleware.ts` pasó a `proxy.ts` |
| Base de datos | Supabase Postgres | RLS: lectura pública de lo activo/aprobado, escrituras solo con service role |
| Imágenes | Supabase Storage, bucket público `negocios` | 8 MB máx en bucket, 4 MB en `lib/storage.ts`, jpg/png/webp |
| Auth admin | Password única + cookie HMAC firmada 7 días | `lib/admin-auth.ts` |
| Auth dueño | Magic link por token (`dueno_tokens`), sin cuenta | 72 h (aprobación/admin) o 30 días (alta web). `owner_id` existe en BD y no se usa |
| Email | Resend | Avisos al admin, digest semanal |
| Captcha | Cloudflare Turnstile | En `/publicar` |
| Errores | Sentry | client/server/edge |
| Mapas | Leaflet + OpenStreetMap | |
| Deploy | Vercel | 3 crons: `weekly-digest` (lun 12:00), `cleanup-orphans` (06:00), `expire-premium` (07:00) |
| Seguridad HTTP | CSP estricta, HSTS preload, `frame-ancestors 'none'` | Verificado en headers de producción |

## 4. Mapa de archivos principal

| Área | Archivos |
|---|---|
| Ficha pública | `app/[slug]/[negocio]/page.tsx`, `TrackedActionButton.tsx`, `ShareButton.tsx`, `ReportarButton.tsx`, `LeaveReviewForm.tsx`, `opengraph-image.tsx` |
| Categoría / búsqueda | `app/[slug]/page.tsx`, `app/buscar/page.tsx`, `components/SearchAutocomplete.tsx` |
| Alta de negocio | `app/publicar/*` (form progresivo, fotos, horarios) + `components/PopupNegocio.tsx` |
| Panel dueño | `app/dueno/editar/[token]/*`, `app/dueno/estadisticas/[token]/page.tsx`, `app/dueno/solicitar/*` |
| Panel admin | `app/admin/*` (negocios, editar, estadísticas, reseñas, reportes, eventos, historias) |
| Tracking | `app/api/track/route.ts`, `supabase/estadisticas.sql`, `supabase/eventos_sitio.sql`, `components/ContadorVisita.tsx` |
| Planes | `app/api/cron/expire-premium/route.ts`, `app/premium/page.tsx`, campo `plan` |
| SEO | `app/sitemap.ts`, `app/robots.ts`, `lib/jsonld.ts`, `components/JsonLd.tsx` |
| Utilidades | `lib/supabase.ts` (tipos), `lib/consultas.ts`, `lib/horarios.ts`, `lib/instagram.ts`, `lib/storage.ts`, `lib/dueno-token.ts` |

## 5. Modelos (según esquema base + SQL del repo)

`categorias`, `negocios`, `horarios`, `fotos`, `ofertas`, `resenas`, `pagos`, `estadisticas_diarias`, `boost_historial`, `dueno_tokens`, `reportes`, `eventos`, `historias`, `turno_farmacia`, `eventos_sitio`, `audit_logs`, `audit_alerts`.

Campos de `negocios` relevantes para el plan: `plan ('basico'|'premium')`, `premium_hasta`, `verificado`, `activo`, `whatsapp`, `instagram` (agregado a mano), `origen` (agregado a mano), `owner_id` (sin uso), `actualizado_en`.

**No existen:** `productos`/`servicios`, eventos individuales con `source`/UTM.

## 6. Endpoints

| Ruta | Método | Uso | Protección |
|---|---|---|---|
| `/api/track` | POST | Contadores de ficha (`vista`, `whatsapp`, `telefono`, `maps`) y del sitio (popup, visita) | **Ninguna.** Sin rate limit |
| `/api/sugerencias` | GET | Autocompletar búsqueda | — |
| `/api/cron/*` | GET | Crons de Vercel | Revisar `CRON_SECRET` (VERIFICAR) |
| Server Actions | POST | publicar, editar (admin / dueño), reseñas, reportes, newsletter | Admin: cookie. Dueño: token. Público: Turnstile en `/publicar` |

---

## 7. Inventario de funciones

| Campo/función | Existe | BD | Backend | Ficha pública | Panel dueño | Plan | Observaciones |
|---|---|---|---|---|---|---|---|
| Nombre, categoría, descripción | Sí | `negocios` | validación largo | Sí | nombre y descripción; no categoría ni slug | Básico | OK |
| Dirección / coordenadas | Sí | `direccion`, `lat`, `lng` | admin valida coords | Sí + mapa | solo dirección | Básico | 5/163 fichas muestran botón "Sin dirección" deshabilitado |
| Horarios / abierto-cerrado | Sí | `horarios` | delete + insert, no atómico | Sí | Sí | Básico | OK |
| Teléfono | Sí | `telefono` | sin validación de formato | `tel:` | Sí | Básico | **60/163 fichas muestran "Llamar" deshabilitado** (botón vacío) |
| WhatsApp | Sí | `whatsapp` | `normalizarWhatsApp` duplicada en 2 archivos; acepta cualquier cantidad de dígitos | solo si `plan = premium` | se puede cargar siendo Básico (se guarda, no se ve) | Premium | Mensaje: "Hola! Te contacto desde LinaresYa por X." `AdvertisementBanner` antepone `56` a un número que ya viene con `56` |
| Email | Sí | `email` | regex | no se muestra | Sí | — | Sirve para pedir link nuevo |
| Instagram | Sí | `instagram` | `normalizarInstagram` | link al perfil | Sí | Básico | 1/163 fichas lo tiene. Sin tracking |
| Sitio web | Sí | `sitio_web` | admin exige http(s) | botón | **dueño no lo puede editar** | Básico | Sin tracking |
| Cómo llegar | Sí | — | — | Sí (tracked `maps`) | — | Básico | OK |
| Compartir | Sí | — | — | `ShareButton` | — | Básico | Sin tracking |
| QR | Sí | — | — | `/qr/[cat]/[negocio]` imprimible | link desde estadísticas | Básico | No registra `qr_scan` |
| Reseñas | Sí | `resenas.aprobada` | moderación admin | últimas 5 | ve todas | Básico | **Bug:** el promedio y el contador "Reseñas" se calculan sobre las últimas 5, nunca muestran más de 5 |
| Galería | Sí | `fotos` + Storage | hasta 4 por envío, sin tope total | carrusel | Sí | sin límite por plan | El upsell promete "subes fotos" como Premium, pero Básico ya puede |
| Verificado | Sí | `verificado` | admin | ícono | — | — | Existe (LY-014 casi listo) |
| Fecha de actualización | Sí | `actualizado_en` | trigger `trg_negocios_updated_at` (confirmado) | "Hace X días" hasta 60 días | — | — | OK |
| Reportar dato incorrecto | Sí | `reportes` | `/admin/reportes` | botón | — | — | Existe (LY-016 casi listo) |
| Ofertas | Sí | `ofertas` (+ boost) | — | sección en ficha + `/ofertas` | no | sin gating | Expiran por consulta. **Bug:** fecha en UTC, se ocultan 3-4 h antes |
| Plan | Sí | `plan`, `premium_hasta` | cron `expire-premium` | badge | solo lectura | — | `plan === "premium"` repetido en ~10 archivos. Premium sin fecha = permanente |
| Estadísticas | Parcial | `estadisticas_diarias` (agregado diario) | `/api/track` + RPC | — | `/dueno/estadisticas` 30 días | **disponible para todos** | Sin selector de periodo. Voseo |
| Eventos de ficha | Parcial | 4 contadores | lista blanca en API y SQL | — | — | — | Faltan instagram, website, share, qr, product_view, review_created |
| Origen del tráfico / UTM | No | — | — | — | — | — | `origen` guarda cómo se dio de alta el negocio, no de dónde viene el visitante |
| Productos/servicios | No | — | — | — | — | — | Hay que crearlo (LY-009) |
| Pagos | Solo esquema | `pagos` (Flow) | sin uso | — | — | — | |
| Tests | No | — | — | — | — | — | No hay script ni archivos de test |

## 8. Tres tipos de negocio (producción)

| Tipo | Ficha | Teléfono | WhatsApp | Dirección | Horarios | Galería | Web |
|---|---|---|---|---|---|---|---|
| Restaurante | `/gastronomia/del-melado-al-nevado` | — | — | Sí + geo | Sí | — | — |
| Servicio/oficio | `/servicios-y-oficios/mariano-lastra-hijo` | Sí | No (Básico) | Sí | Sí | Sí | No |
| Comercio | `/comercio/n-y-f-madre-e-hija` | Sí | No (Básico) | **No: botón deshabilitado** | Sí | Sí | Sí |

Todas usan JSON-LD `LocalBusiness`; ninguna usa un subtipo (`Restaurant`, `Store`).

---

## 9. Problemas encontrados

### Críticos
1. **Esquema no versionado.** La definición base vive fuera del repo y está desactualizada. `estadisticas_diarias` tenía 2 definiciones; **confirmado 2026-09-11: producción usa la del repo** (`vistas`, `clicks_whatsapp`, `clicks_telefono`, `clicks_maps`). El SQL base (`vistas_perfil`, `clicks_web`, `clicks_mapa`) es obsoleto. Además producción tiene columnas que el tipo TS no declara (`comuna`, `region`, `owner_id`, `origen`, `busqueda`).
2. **Botones de contacto al fondo en móvil.** El bloque de CTAs está en el `<aside>`, que en móvil se renderiza después de todo el contenido. En la ficha de Mariano Lastra, "Llamar" queda en y=1.648 px con viewport de 812 px, bajo horarios y reseñas. Además el banner de instalación de la PWA y el de cookies tapan la primera pantalla.
3. **Métricas inflables.** `/api/track` es público y sin rate limit. El limitador de `proxy.ts` es en memoria y solo aplica a `/buscar`. Antes de vender estadísticas hay que proteger esto.
4. **Secreto de Turnstile en el repo público** (`.env.example`, desde el 22-abr). No coincide con `.env.local`; no se pudo comparar con Vercel. Rotar igual.

### Medios
5. Storage: `anon` puede subir directo al bucket `negocios`. Lo mitiga el cron `cleanup-orphans`.
6. Botones vacíos: "Llamar" deshabilitado en 60 fichas, "Sin dirección" en 5 (contra LY-003).
7. Comprobaciones de plan dispersas y sin capa central (contra LY-024).
8. Reseñas: promedio y contador calculados sobre las últimas 5.
9. Ofertas: comparación de fecha en UTC.
10. `AdvertisementBanner` arma `wa.me/56` + número que ya trae `56`.
11. El dueño no puede editar su sitio web.
12. Voseo en `/dueno/estadisticas` ("Pedile", "Mostrá", "conseguí", "Solicitá") y en `/premium`.

### Deuda técnica
- El tipo `Negocio` está definido en `lib/supabase.ts` y redefinido localmente en la ficha y en otras páginas.
- `normalizarWhatsApp` está duplicada (admin y dueño).
- Varias constantes `SITE_URL` caen a `linaresya.vercel.app` si falta la variable de entorno.
- La home no tiene `canonical`.
- Sin tests.
- Lo bueno: `tsc` 0 errores, `eslint` 0 errores, CSP y HSTS bien puestos, RLS bien planteada, el tracking no guarda IP ni datos personales.

## 10. Riesgos para el roadmap

- Construir LY-005 (eventos) sin cerrar el punto 1 puede escribir contra columnas que no existen.
- Vender estadísticas (LY-006) con métricas inflables expone a reclamos.
- Cambiar slugs rompe 163 URLs indexadas (sitemap 250 URLs, canonical correcto en 163/163). No tocar slugs.

## 11. Recomendación de implementación (orden del plan, Fase 1)

1. **LY-002 Modelo Business:** versionar el esquema real en `supabase/schema.sql`, resolver el conflicto de `estadisticas_diarias` y unificar el tipo `Negocio`.
2. **LY-003 Contactos y CTA:** un solo normalizador de teléfono/WhatsApp, esconder botones sin dato, dejar editar el sitio web al dueño.
3. **LY-022 Mobile:** CTAs visibles en la primera pantalla en móvil.
4. **LY-023 Permisos** y **LY-024 Sistema de planes:** `canUseFeature(negocio, feature)`.

## 12. Verificación del esquema en producción — CERRADA 2026-09-11

Resultado (consulta de solo lectura corrida por Willson en el SQL Editor):

- `estadisticas_diarias`: `id bigint, negocio_id, fecha, vistas, clicks_whatsapp, clicks_telefono, clicks_maps` → versión del repo.
- `eventos_sitio`: `id, fecha, evento, conteo` → existe.
- `negocios`: todas las columnas del tipo TS + `comuna`, `region`, `owner_id`, `busqueda (tsvector)`, `origen`, `instagram`. **No existe `facebook`.**
- `pagos`: existe con campos de Flow, sin uso en el código.
- Planes: **164 negocios, todos `basico`, todos activos, 0 premium.** Hoy el botón WhatsApp no aparece en ninguna ficha.
- Triggers: `trg_negocios_updated_at`, `trg_negocios_busqueda` (negocios), `trigger_suspicious_activity` (audit_logs).
- Diferencia a revisar: 164 negocios activos vs 163 fichas en el sitemap → 1 negocio sin categoría o con categoría inactiva (el sitemap lo descarta).

Consulta usada (se consolidó en una sola):

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('negocios', 'estadisticas_diarias', 'fotos', 'ofertas', 'pagos', 'eventos_sitio')
order by table_name, ordinal_position;

select plan, count(*) from negocios group by plan;

select event_object_table, trigger_name
from information_schema.triggers
where trigger_schema = 'public';
```
