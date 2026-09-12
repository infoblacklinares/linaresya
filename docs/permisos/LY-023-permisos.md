# LY-023 — Permisos

- **Prioridad:** P0
- **Fecha:** 2026-09-12
- **Depende de:** LY-002 (completada)
- **Estado final:** En pruebas — auditoría de permisos cerrada, 1 corrección aplicada
- **Siguiente tarea:** LY-024 — Sistema de planes

## Objetivo

Dejar escrito y verificado qué puede hacer cada rol, y cerrar lo que quedaba abierto.

## Estado actual

LinaresYa no tiene cuentas de usuario. Hay tres formas de autorización:

| Mecanismo | Dónde | Qué protege |
|---|---|---|
| Cookie firmada con HMAC (`ADMIN_PASSWORD`), 7 días | `lib/admin-auth.ts` | Todo `/admin` |
| Token aleatorio en la URL (`dueno_tokens`), 72 h o 30 días | `lib/dueno-token.ts` | Editar y ver estadísticas del propio negocio |
| Link firmado con HMAC (`ADMIN_PASSWORD`), 7 días, un negocio y una acción | `lib/admin-link.ts` | Aprobar un negocio desde el correo |

La escritura en la base siempre pasa por el servidor con la service role key. El rol público (`anon`) solo puede **leer** lo activo o aprobado, por RLS.

## Matriz de permisos (verificada en el código)

| Acción | Visitante | Dueño Básico | Dueño Premium | Admin |
|---|---|---|---|---|
| Ver ficha, llamar, cómo llegar, compartir, QR | Sí | Sí | Sí | Sí |
| Botón WhatsApp en la ficha | Solo si el negocio es Premium | — | Sí | Sí |
| Dejar reseña | Sí, queda pendiente de aprobación | Sí | Sí | Sí |
| Reportar dato incorrecto | Sí | Sí | Sí | Sí |
| Editar nombre, descripción, teléfono, WhatsApp, email, dirección, Instagram, Facebook, sitio web, horarios, fotos | No | Sí | Sí | Sí |
| Cambiar `activo`, `verificado`, `plan`, `premium_hasta`, `categoria_id`, `slug`, coordenadas | No | **No** | **No** | Sí |
| Ver estadísticas del negocio | No | Sí (30 días) | Sí (30 días) | Sí |
| Aprobar, verificar, desactivar, eliminar negocios | No | No | No | Sí |
| Moderar reseñas, gestionar reportes, eventos e historias | No | No | No | Sí |

El bloqueo de campos del dueño está en `app/dueno/editar/[token]/actions.ts`: el update nombra solo las columnas permitidas, así que no alcanza con mandar un campo extra en el formulario.

## Verificado

**En el código:** las 13 páginas y archivos de acciones de `/admin` llaman a `isAdminAuthenticated()` o a `requireAdmin()`. No quedó ninguna ruta de `/admin` sin control.

**En producción, sin sesión:**

| Ruta | Respuesta |
|---|---|
| `/admin`, `/admin/reportes`, `/admin/negocio/<id>/editar` | 307 a `/admin/login` |
| `/api/cron/expire-premium`, `weekly-digest`, `cleanup-orphans` | 401 (exigen `CRON_SECRET`) |
| `/dueno/editar/<token falso>`, `/dueno/estadisticas/<token falso>` | 200 con la pantalla de "link inválido" |
| `/api/track` (GET) | 200, es su health check |

**Reseñas y reportes:** honeypot, límite por IP, se exige que el negocio exista y esté activo, y la reseña entra con `aprobada = false`.

**Link de aprobación por correo:** firmado, comparación en tiempo constante, vence a los 7 días, y aprobar exige un POST con botón (un escáner de correos que abra el link no aprueba nada).

## Cambio implementado

| Archivo | Cambio |
|---|---|
| `app/robots.ts` | Se pasa de `disallow: /dueno/editar/` a `/dueno/` completo. Las URLs de estadísticas también llevan el token del dueño; ya tenían `noindex`, pero no estaban en robots |

Nada más. El resto de la tarea era verificar, y lo que falta son decisiones que no corresponden a LY-023.

## Criterios de aceptación

- [x] Matriz de permisos escrita y contrastada con el código.
- [x] Ninguna ruta de `/admin` sin control de sesión.
- [x] El dueño no puede tocar plan, verificado, activo, categoría ni slug.
- [x] Los crons exigen secreto.
- [x] Las URLs con token del dueño quedan fuera de robots.
- [x] `npm test` 9/9, `tsc` y `eslint` limpios.
- [ ] Prueba manual con un token de dueño real (requiere generarlo desde el panel).

## Hallazgos que quedan abiertos

1. **El registro de auditoría es código muerto.** `lib/audit.ts` define `logAudit()` y existe la tabla `audit_logs`, pero **ninguna acción lo llama**. Hoy no queda rastro de quién aprobó, cambió de plan o eliminó un negocio. Candidato a LY-026/LY-027.
2. **Los límites por IP no sirven en producción.** Los de reseñas, reportes y búsqueda son en memoria, y en Vercel cada instancia tiene la suya. Hay que moverlos a Cloudflare o a un almacén compartido (LY-005 / LY-030).
3. **`/api/track` no tiene ninguna protección.** Cualquiera puede inflar las métricas (LY-005).
4. **La tabla `reportes` guarda la IP del que reporta.** Es dato personal: revisar si hace falta y por cuánto tiempo se conserva (LY-030).
5. **El bucket de Storage acepta subidas anónimas.** Lo limita el tamaño, el tipo de archivo y el cron que borra huérfanos, pero sigue abierto (LY-017).
6. **Admin de un solo factor.** Una sola contraseña, sin segundo factor, y la cookie dura 7 días. Aceptable para un operador, pero la contraseña es también la llave de los links de aprobación: cambiarla invalida todo lo viejo.
7. **El token del dueño se puede reusar** hasta que vence (30 días en el alta) y viaja en la URL. Es la decisión que hace que un dueño sin email pueda entrar; queda registrado como aceptado.
8. **`owner_id` sigue sin uso.** Si algún día hay cuentas, ese es el camino.
