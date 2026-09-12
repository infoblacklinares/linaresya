# Decisiones de arquitectura abiertas

Registro vivo. Cada punto es algo **verificado en el código o en producción**, no una sospecha. Si algo se resuelve, se marca acá con fecha y se deja escrito por qué.

- **Creado:** 2026-09-12, al cerrar la Fase 1 del plan (LY-001 a LY-024) más LY-026 y LY-027.
- **Regla:** ninguna de estas decisiones se toma sola mientras se programa. Las de negocio las toma Willson; las técnicas se proponen acá antes de tocar código.

## Cómo leer las prioridades

| Nivel | Significado |
|---|---|
| **P0 — bloquea cobrar** | Si no se resuelve, no se puede vender Premium con honestidad |
| **P1 — bloquea crecer** | Aguanta hoy con 164 fichas, se rompe con 500 o con clientes pagando |
| **P2 — deuda** | Cuesta tiempo cada vez que se toca esa zona |

---

## P0 — Antes de cobrar

### 1. `/api/track` es público y sin límite — RESUELTO 2026-09-12 (falta la migración en producción)

**Cómo quedó:** tres puertas antes de contar — user-agent de navegador real, mismo origen, y límite por minuto en Postgres (no en memoria, que en Vercel no sirve). La clave del límite es un hash con sal, no la IP. Ver `docs/seguridad/proteger-tracking.md`. **Pendiente:** correr `supabase/rate_limite_eventos.sql`.

**Lo que decía cuando se abrió:**
**Qué pasa:** cualquiera puede inflar las métricas de cualquier negocio desde la consola del navegador. Ya hay evidencia real: los barridos de auditoría con `curl` del 11-sep sumaron 346 visitas falsas, porque el filtro de bots mira el user-agent y no reconoce `curl`.
**Por qué importa:** esas cifras son el argumento de venta del Plan Estrella. Un número que no se puede defender no sirve para cobrar.
**Decisión pendiente:** límite por IP real (Cloudflare, no en memoria), filtro de bots ampliado, y validar que el evento venga de una ficha existente.

### 2. Los límites por IP no funcionan en producción
**Qué pasa:** búsqueda, reseñas y reportes limitan con un `Map` en memoria. En Vercel cada instancia tiene su propio mapa, así que el límite real es "el que toque".
**Decisión pendiente:** mover a Cloudflare Rate Limiting o a un almacén compartido. Está escrito en el propio código (`proxy.ts` lo admite en un comentario).
**Avance 2026-09-12:** el tracking ya no depende de memoria, usa un límite en Postgres (punto 1). El mismo patrón sirve para búsqueda, reseñas y reportes, que siguen pendientes.

### 3. La analítica no puede responder lo que se le va a preguntar
**Qué pasa:** hoy se guarda 1 fila por negocio por día con 4 contadores. No hay hora, ni sesión, ni origen.
**Consecuencia:** no existen visitantes únicos, ni campañas, ni embudo por publicación. Y el histórico no se puede convertir: lo que no se guardó, no se recupera.
**Decisión de arquitectura propuesta:** la **tabla de eventos pasa a ser la fuente de verdad**, y los contadores diarios quedan como resumen derivado de ella. Dos fuentes de verdad para el mismo número es cómo se llega a un dashboard que se contradice.

---

## P1 — Antes de crecer

### 4. El esquema de la base no está versionado
**Qué pasa:** la definición base vive fuera del repo (`linaresya_database_final.sql`) y está desactualizada: tenía otra versión de `estadisticas_diarias` que ya no es la de producción. Los SQL nuevos se corren a mano desde el editor de Supabase, sin orden ni registro de qué se aplicó.
**Riesgo:** el código asume columnas que pueden no existir. Ya hay parches que lo demuestran: `/publicar` reintenta el alta sacando columnas opcionales de a una si Supabase las rechaza.
**Decisión pendiente:** volcar el esquema real al repo y adoptar migraciones numeradas. Requiere un `pg_dump` o acceso de lectura al catálogo.

### 5. No se guarda desde cuándo un negocio es Premium — RESUELTO 2026-09-12 (falta la migración en producción)

**Cómo quedó:** se agrega `premium_desde`, que el panel escribe **solo cuando el plan sube** (no en cada guardado) y limpia al volver a Básico. Migración: `supabase/premium_desde.sql`. El código funciona con o sin la columna: si no existe, reintenta el cambio de plan sin ella y lo avisa en el log. **Sigue abierto:** decidir si la tabla `pagos` se usa o se borra.

**Lo que decía cuando se abrió:**
**Qué pasa:** solo existe `premium_hasta`. La tabla `pagos` (con campos de Flow) existe y **nadie la usa**.
**Consecuencia:** no se puede calcular un periodo cobrado, ni saber cuántos meses lleva un cliente, ni conciliar un pago.
**Decisión pendiente, antes del primer cobro:** agregar `premium_desde` o una tabla de historial de plan, y decidir si `pagos` se usa o se elimina.

### 6. No queda rastro de quién hizo qué
**Qué pasa:** `lib/audit.ts` define `logAudit()` y existe la tabla `audit_logs`, pero **ninguna acción lo llama**. Aprobar, verificar, cambiar de plan, desactivar y eliminar no dejan registro.
**Consecuencia:** con un solo operador se aguanta; con un cliente reclamando "yo no pedí esto", no.
**Decisión pendiente:** llamar a `logAudit` en las acciones sensibles del panel.

### 7. La revalidación de caché depende de que alguien se acuerde
**Qué pasa:** cada acción tiene que listar a mano qué rutas revalidar. Ese olvido fue exactamente el bug de "activé Premium y no aparece": faltaban la ficha, la categoría y el mapa.
**Decisión propuesta:** un solo helper `revalidarNegocio(id)` que sepa todas las rutas donde se ve un negocio, y que todas las acciones usen ese.

### 8. El service worker sirve la versión vieja
**Qué pasa:** el caché `linaresya-v2` devolvió páginas anteriores durante las pruebas locales. Tras un deploy, un visitante que ya entró puede seguir viendo la ficha vieja.
**Decisión pendiente:** estrategia *network-first* para el HTML, dejando el caché solo para lo estático.

### 9. Privacidad: hay una IP guardada — RESUELTO 2026-09-12 (falta la migración en producción)

**Cómo quedó:** el código dejó de escribirla y de leerla; el panel ya no la muestra y la consulta ya no la pide. El límite por IP para frenar spam sigue funcionando en memoria, sin almacenar nada. Para borrar las IPs ya guardadas hay que correr `supabase/quitar_ip_reportes.sql`, que **elimina la columna y su contenido de forma permanente**.

**Lo que decía cuando se abrió:**
**Qué pasa:** la analítica no guarda IP (bien), pero la tabla `reportes` sí guarda la del que reporta. Con la Ley 21.719 encima, eso es dato personal con finalidad y plazo que hay que justificar.
**Decisión pendiente:** decidir si se necesita, y si sí, por cuánto tiempo se conserva. Si no, se borra la columna.

### 10. El acceso del dueño es un link reusable
**Qué pasa:** el dueño entra por un token en la URL, reusable hasta 30 días, sin cuenta. `owner_id` existe en la base y no se usa.
**Es una decisión tomada, no un olvido:** es lo que permite que un negocio sin correo pueda editar su ficha. Queda registrado como aceptado, con su riesgo: quien tenga el link, entra.

### 11. El bucket de imágenes acepta subidas anónimas
**Qué pasa:** la política de Storage permite que cualquiera suba al bucket `negocios`. Lo limita el tamaño, el tipo de archivo y un cron que borra huérfanos.
**Decisión pendiente:** aceptarlo explícitamente o mover las subidas al servidor.

---

## P2 — Deuda

### 12. Admin de un solo factor, y esa clave firma otras cosas
La contraseña del panel también firma los links de aprobación por correo. Cambiarla invalida todos los links viejos: es correcto, pero hay que saberlo.

### 13. Tipos duplicados
El tipo `Negocio` estaba redefinido en 8 páginas. Se van unificando a medida que cada tarea toca su archivo (ya se hizo en la ficha). Quedan las del panel.

### 14. `SITE_URL` con destino equivocado por defecto
Varios archivos caen a `linaresya.vercel.app` si falta la variable de entorno. En producción está bien seteada, pero un preview mal configurado genera links y canonicals al dominio equivocado.

### 15. Sin pruebas fuera de la lógica pura
Hay 25 tests, todos de funciones puras (contactos, planes, estadísticas). No hay pruebas de integración ni de interfaz, así que nada verifica automáticamente los formularios del panel ni del dueño.

### 16. No hay API de lectura de analítica
Todo se renderiza en el servidor. Sirve hoy; el día que haya una app, un informe externo o un dashboard para el cliente, hace falta endpoint.

### 17. Calidad de datos del directorio
Verificado en producción: 2 teléfonos con un dígito de menos, 1 negocio que no aparece en el sitemap por no tener categoría válida, 60 fichas sin teléfono y solo 1 con Instagram. Es LY-033, y es lo que hace que una ficha se vea abandonada.

---

## Decisiones de producto que condicionan la arquitectura

### 18. Premium hoy son dos cosas
WhatsApp y salir destacado. Las estadísticas quedaron gratis a propósito (2026-09-12): son la prueba con la que se vende. Si algún día WhatsApp pasa a ser gratis, Premium queda sin contenido hasta que existan productos (LY-009) y ofertas de pago (LY-012).

### 19. El popup de altas compite con los CTA
El popup "Registra tu negocio" aparece también sobre las fichas y tapa la pantalla en móvil, justo donde ahora están los botones de contacto. No se tocó: es la palanca de altas y la decisión es comercial. Si se saca de las fichas, hay que mover también el denominador del embudo, que comparte la misma lista de rutas.

---

## Resueltas

| Fecha | Decisión |
|---|---|
| 2026-09-11 | `estadisticas_diarias`: producción usa la definición del repo. El SQL base quedó obsoleto |
| 2026-09-11 | No se renombra ninguna columna: el modelo del plan se adapta al real |
| 2026-09-11 | Los datos viejos mal formateados no se tocan al normalizar contactos; se corrigen al guardar (y en LY-033) |
| 2026-09-12 | El plan vigente se decide en un solo archivo, y un Premium vencido baja al instante sin esperar al cron |
| 2026-09-12 | Las estadísticas quedan gratis para los dos planes, y WhatsApp no se regala al Básico |
| 2026-09-12 | El panel muestra el plan **guardado**; el resto del sitio usa el **vigente** |
| 2026-09-12 | El tracking exige navegador real, mismo origen y un tope por minuto en Postgres. La clave del límite es un hash con sal, no la IP |
| 2026-09-12 | La IP de quien reporta **no se guarda**. El límite antispam no la necesita almacenada |
| 2026-09-12 | Se guarda `premium_desde`, escrito solo cuando el plan sube. Paso previo a cobrar por periodo |
| 2026-09-12 | El popup de altas **se queda** en las fichas hasta tener datos del piloto (cuántos lo ven contra cuántas acciones se pierden) |
