# Decisiones de arquitectura abiertas

Registro vivo. Cada punto es algo **verificado en el código o en producción**, no una sospecha. Si algo se resuelve, se marca acá con fecha y se deja escrito por qué.

> **Estado actual:** 2026-10-03. La referencia rápida del proyecto está en `docs/estado-actual.md`. Los documentos históricos conservan el contexto de las etapas anteriores y no deben usarse por sí solos para determinar qué sigue pendiente.

- **Creado:** 2026-09-12, al cerrar la Fase 1 del plan (LY-001 a LY-024) más LY-026 y LY-027.
- **Regla:** ninguna de estas decisiones se toma sola mientras se programa. Las de negocio las toma Willson; las técnicas se proponen acá antes de tocar código.

## Estado técnico cerrado al 2026-10-03

- Estado unificado de ficha integrado en Admin, Calidad y ficha individual.
- Cola operativa de administración y reglas de prioridad integradas.
- Data Auditor conectado como fuente complementaria, sin desactivar las reglas internas.
- CI de GitHub ejecuta tests y build; el último run revisado está exitoso.
- Migración de claves Supabase completada en código y CI: Publishable para cliente y Secret para servidor/CI.
- La documentación de variables de entorno y despliegue se mantiene alineada con esos nombres.
- Auditoria administrativa validada en produccion el 2026-10-03: una edicion real genero registros en `audit_logs`.
- La migracion `20261002_audit_logs_v2.sql` fue ejecutada y verificada en Supabase.
- No hay issues abiertos registrados en el repositorio al momento del corte.

## Regla de migraciones (aprendida a golpes el 2026-09-12)

Toda migración se entrega **diciendo en qué orden va respecto del deploy**, y por qué:

| Tipo de migración | Orden | Motivo |
|---|---|---|
| **Agrega** una columna, tabla o función | **Antes** del deploy, o en cualquier momento | El código viejo la ignora; el nuevo la encuentra lista |
| **Borra** o **renombra** algo que el código usa | **Después** del deploy | Si se corre antes, el código que está en producción se rompe |

**Qué pasó:** se entregó `quitar_ip_reportes.sql` sin decir que iba después del deploy. Willson la corrió, y el código en producción seguía escribiendo y leyendo esa columna: reportar un dato incorrecto falló y el panel de reportes se veía vacío durante unos minutos, hasta desplegar el código que ya no la usaba.

**Además:** todo código que dependa de una columna nueva se escribe tolerando que no exista todavía (reintentar sin ese campo y avisar en el log). Eso ya se hace con `origen`, `instagram`, `facebook`, `premium_desde` y la función del límite de eventos. Esa tolerancia es lo que permite desplegar y migrar en distinto momento sin romper nada.

## Cómo leer las prioridades

| Nivel | Significado |
|---|---|
| **P0 — bloquea cobrar** | Si no se resuelve, no se puede vender Premium con honestidad |
| **P1 — bloquea crecer** | Aguanta hoy con 164 fichas, se rompe con 500 o con clientes pagando |
| **P2 — deuda** | Cuesta tiempo cada vez que se toca esa zona |

## P0 — Antes de cobrar

### 1. `/api/track` es público y sin límite — RESUELTO 2026-09-12 (migración corrida y desplegado)

**Cómo quedó:** tres puertas antes de contar — user-agent de navegador real, mismo origen, y límite por minuto en Postgres (no en memoria, que en Vercel no sirve). La clave del límite es un hash con sal, no la IP. Ver `docs/seguridad/proteger-tracking.md`. Migración corrida el 2026-09-12 y verificada en producción: a partir del evento 30 en un minuto la respuesta es `contado:false`.

**Pendiente que sigue vigente:** límites distribuidos para búsqueda, reseñas y reportes. El tracking ya no depende del `Map` en memoria.

## P1 — Antes de crecer

### 2. El esquema de la base no está versionado

La definición base vive fuera del repo (`linaresya_database_final.sql`) y está desactualizada. Los SQL nuevos se corren a mano desde el editor de Supabase, sin orden ni registro completo de qué se aplicó.

**Decisión pendiente:** volcar el esquema real al repo y adoptar migraciones numeradas. Requiere acceso de lectura al catálogo o un `pg_dump`.

### 3. Auditoría administrativa — RESUELTO 2026-10-03

La auditoría administrativa quedó integrada mediante `lib/audit-server.ts`. Las acciones sensibles de negocios, reseñas, reportes y resultados reportados registran cambios relevantes; la aprobación mediante link firmado registra `actor_type = signed_link`.

La migración segura `supabase/migrations/20261002_audit_logs_v2.sql` fue ejecutada y verificada en Supabase. Una edición administrativa real en producción genero registros correctos en `audit_logs`.

**Pendiente separado:** rotar la `SUPABASE_SECRET_KEY` anterior que fue expuesta durante el trabajo. No bloquea el funcionamiento actual, pero queda como saneamiento de seguridad.

### 4. La revalidación de caché depende de que alguien se acuerde

Cada acción tiene que listar a mano qué rutas revalidar.

**Decisión propuesta:** un solo helper `revalidarNegocio(id)` que sepa todas las rutas donde se ve un negocio, y que todas las acciones usen ese helper.

### 5. El service worker sirve la versión vieja

El caché `linaresya-v2` puede devolver páginas anteriores durante las pruebas locales.

**Decisión pendiente:** estrategia network-first para HTML, dejando el caché solo para estáticos.

### 6. Privacidad / reportes

El código actual dejó de guardar la IP del reportante. El historial de la decisión y la migración correspondiente se conservan en la documentación.

### 7. El acceso del dueño es un link reusable

El dueño entra por un token en la URL, reusable hasta 30 días, sin cuenta. `owner_id` existe en la base y no se usa.

**Decisión tomada:** se acepta para el piloto, con el riesgo documentado de que quien tenga el link puede entrar.

### 8. El bucket de imágenes acepta subidas anónimas

La política de Storage permite que cualquiera suba al bucket `negocios`.

**Decisión pendiente:** aceptarlo explícitamente o mover las subidas al servidor.

## P2 — Deuda

### 9. Admin de un solo factor, y esa clave firma otras cosas

La contraseña del panel también firma los links de aprobación por correo. Cambiarla invalida todos los links viejos.

### 10. El color de los títulos está clavado en el CSS global

Se conserva como deuda técnica hasta poder eliminar la regla global sin introducir regresiones visuales.

### 11. Tipos duplicados

El tipo `Negocio` estaba redefinido en varias páginas. Se unifica gradualmente.

### 12. `SITE_URL` con destino equivocado por defecto

Varios archivos caen a `linaresya.vercel.app` si falta la variable de entorno.

### 13. Sin pruebas fuera de la lógica pura

Los tests actuales cubren principalmente funciones puras. No hay una cobertura equivalente de integración/UI.

### 14. No hay API de lectura de analítica

Todo se renderiza en el servidor. Sirve hoy; un dashboard externo podría requerir un endpoint.

### 15. Calidad de datos del directorio

Se conserva como línea de trabajo de calidad del catálogo y debe contrastarse nuevamente antes de usar números históricos como estado actual.

## Decisión sobre `pagos` (2026-09-12)

**La tabla no se borra y no se usa todavía. No se construye módulo de pagos hasta que exista el primer pago real.**

Por qué, en orden de peso:

1. **Hay 0 clientes pagando.** Construir el módulo de cobros antes de cobrarle al primero es expandir sin cerrar.
2. **La tabla está diseñada para Flow** y hoy el cobro es transferencia.
3. **El diseño correcto se conoce recién con el primer cobro.**

**Qué se hace mientras tanto:** el primer pago se registra donde ya vive la plata del negocio, en `crm/pipeline.md` y en la bitácora.

**Cuándo se retoma:** cuando entre el primer pago.

## Decisiones de producto que condicionan la arquitectura

### 16. Premium hoy son dos cosas

WhatsApp y salir destacado. Las estadísticas quedaron gratis a propósito (2026-09-12).

### 17. El popup de altas compite con los CTA

El popup "Registra tu negocio" aparece también sobre las fichas y tapa la pantalla en móvil. La decisión comercial se mantiene hasta tener datos del piloto.

## Próximos bloques técnicos sugeridos

Estos no se ejecutan automáticamente por aparecer aquí:

1. Versionado real del esquema Supabase.
2. Rate limiting distribuido para endpoints públicos.
3. Estrategia de caché/service worker.
4. Consolidación de tipos y pruebas de integración/UI.

La prioridad concreta debe definirse en un bloque **ANALIZA/PROPÓN** antes de ejecutar código nuevo.
