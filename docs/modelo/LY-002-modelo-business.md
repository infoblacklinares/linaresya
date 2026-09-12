# LY-002 — Modelo Business

- **Prioridad:** P0
- **Fecha:** 2026-09-11
- **Depende de:** LY-001 (completada)
- **Estado final:** Completada — migración corrida en producción el 2026-09-11 (`facebook | text` verificado)
- **Siguiente tarea:** LY-003 — Contactos y CTA

## Objetivo

Que la ficha tenga un modelo único y conocido, alineado con producción, que cubra los campos del plan sin duplicar lo que ya existe.

## Problema actual

1. El tipo `Negocio` de `lib/supabase.ts` no calzaba con producción. Le faltaban `comuna`, `region`, `origen` y `owner_id`; marcaba `instagram` como opcional aunque la columna existe; y declaraba `descripcion` y `categoria_id` como obligatorios cuando en la BD aceptan null.
2. Hay 8 tipos locales `Negocio` redefinidos en páginas (ficha, categoría, dueño, admin).
3. El esquema base (`../linaresya_database_final.sql`, fuera del repo) está obsoleto: tiene otra definición de `estadisticas_diarias`.
4. No existe la columna `facebook`.

## Mapeo: modelo conceptual del plan → producción

| Campo del plan | Columna real | Estado |
|---|---|---|
| id | `id uuid` | Existe |
| nombre | `nombre` | Existe |
| slug | `slug` (único) | Existe. **No cambiar slugs** (163 URLs indexadas) |
| categoría | `categoria_id → categorias` | Existe |
| descripción | `descripcion` | Existe |
| teléfono | `telefono` | Existe |
| whatsapp | `whatsapp` | Existe |
| email | `email` | Existe |
| instagram | `instagram` (usuario, con CHECK) | Existe |
| **facebook** | — | **Falta → `supabase/facebook_negocios.sql`** |
| website | `sitio_web` | Existe (se mantiene el nombre) |
| dirección | `direccion`, `ciudad`, `comuna`, `region` | Existe |
| latitud / longitud | `lat`, `lng` | Existe |
| horarios | tabla `horarios` | Existe |
| fotos | `foto_portada` + tabla `fotos` | Existe |
| estado | `activo` | Existe (se mantiene el nombre) |
| plan | `plan` + `premium_hasta` | Existe |
| verified | `verificado` | Existe |
| fecha_actualizacion | `actualizado_en` (trigger `trg_negocios_updated_at`) | Existe |

Campos reales fuera del plan que se conservan: `tipo`, `a_domicilio`, `zona_cobertura`, `disponibilidad`, `origen`, `owner_id` (sin uso), `busqueda` (tsvector, trigger).

**Decisión:** no se renombra ninguna columna. Renombrar rompería código, datos y URLs sin aportar valor. El plan pide adaptar el modelo a la arquitectura real.

## Cambio mínimo implementado

| Archivo | Cambio |
|---|---|
| `lib/supabase.ts` | Tipo `Negocio` alineado con producción. `facebook?` opcional hasta correr la migración |
| `supabase/facebook_negocios.sql` | Nueva migración idempotente: columna `facebook` + CHECK de formato. Mismo patrón que `instagram_negocios.sql` |
| `docs/modelo/LY-002-modelo-business.md` | Este documento |

**Fuera de alcance (para no inflar la tarea):**
- Reemplazar los 8 tipos locales por `Pick<Negocio, ...>`: se hace en cada tarea que toque esos archivos (LY-003 empieza por la ficha).
- Formulario, normalización y botón de Facebook: LY-003.
- Volcado completo del esquema (constraints, índices, policies) a `supabase/schema.sql`: requiere `pg_dump` o acceso de lectura al catálogo. Se deja como deuda, sin inventar DDL.

## Base de datos

- Tabla: `negocios`
- Campo nuevo: `facebook text null`, CHECK `^https://(sub.)facebook.com/.+`
- Sin índices nuevos. Sin cambios de relaciones.
- Migración: `supabase/facebook_negocios.sql`. Idempotente, solo agrega; no toca datos existentes.

## Autorización

Sin cambios. Cuando LY-003 agregue Facebook al formulario: lo edita el dueño (Básico y Premium) y el admin. El visitante solo lo ve.

## Criterios de aceptación

- [x] El tipo `Negocio` declara todas las columnas de producción que la app usa.
- [x] `tsc --noEmit` sin errores.
- [x] `eslint` sin errores.
- [x] `facebook_negocios.sql` corrido en producción y verificado con la consulta del final del archivo.

## Pruebas

- Regresión: `tsc` y `eslint` sobre todo el proyecto. El cambio es de tipos; no cambia el comportamiento en runtime.
- Migración: es idempotente (`ADD COLUMN IF NOT EXISTS` + CHECK condicionado). Los 164 negocios quedan con `facebook = null`, que cumple el CHECK.

## Riesgos

- Bajo. La columna nueva acepta null; ningún código la lee todavía.
- El código funciona igual con o sin la migración corrida.
