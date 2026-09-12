# LY-026 — Administración de planes (y aviso al dueño)

- **Prioridad:** P1
- **Fecha:** 2026-09-12
- **Depende de:** LY-024 (completada)
- **Estado final:** En pruebas — verificado en local, falta deploy y una prueba con sesión de admin
- **Siguiente tarea:** proteger `/api/track`, después LY-005

## Problema

Willson no encontraba dónde activar Premium, y cuando lo activaba no se veía "enseguida". Tres causas distintas:

1. **El control estaba al final del formulario.** La sección "Plan y estado" venía después de datos básicos, contacto, ubicación, fotos, galería, QR y el generador de link del dueño. Había que scrollear todo para llegar.
2. **No había forma rápida de hacerlo.** Para dar Premium 30 días había que entrar a editar, marcar la pastilla, calcular la fecha a mano, escribirla y guardar.
3. **El cambio no se propagaba.** Al guardar desde el panel se revalidaban `/admin`, la portada y la propia pantalla de edición, **pero no la ficha ni el listado de la categoría**. La ficha se re-renderiza en cada visita, así que ahí sí aparecía; el listado de `/gastronomia` (y el mapa) quedaban cacheados mostrando al negocio como Básico. Eso es exactamente el "debería aparecer enseguida".

Y no existía ningún aviso al dueño: se le activaba un beneficio y nadie se lo decía.

## Cambios

| Archivo | Cambio |
|---|---|
| `app/admin/negocio/[id]/editar/EditForm.tsx` | La sección "Plan y estado" pasa **al principio** del formulario, en un bloque destacado, con una explicación de qué hace Premium y cómo funciona el vencimiento |
| `app/admin/actions.ts` | Dos acciones nuevas: `activarPremium30Dias` y `quitarPremium`. Centralizan el cambio de plan, revalidan donde se ve y avisan al dueño |
| `app/admin/page.tsx` | Botón **⭐ Premium 30 días** (o **Quitar Premium**) en cada negocio, tanto en las filas compactas como en las tarjetas. Un clic, sin entrar a editar |
| `app/admin/negocio/[id]/editar/actions.ts` | Al guardar se revalidan también la ficha, el listado de su categoría y el mapa |
| `app/dueno/editar/[token]/actions.ts` | Igual: se agrega el listado de la categoría, que mostraba datos viejos |
| `lib/email.ts` | `sendOwnerPremiumNotification`: aviso al dueño de que su ficha quedó Premium |
| `lib/planes.ts` + test | `vencimientoEnDias(30)` para no escribir fechas a mano |

### El aviso al dueño

Se manda **solo** cuando el plan realmente sube (no en cada guardado) y **solo** si el negocio tiene correo cargado. Si falla el correo, el cambio de plan se mantiene igual: el aviso nunca voltea la operación.

El correo dice qué cambia (botón de WhatsApp, destacado, sello ⭐), hasta cuándo dura, y lleva a la ficha, a sus estadísticas y a editar su negocio con un link de dueño recién generado.

Detalle útil: **si el negocio no tiene WhatsApp cargado**, el correo no promete un botón que no va a ver. En su lugar le pide que lo cargue, porque sin ese dato el beneficio principal de Premium no aparece.

## Criterios de aceptación (LY-026 del plan)

- [x] Ver el plan de cada negocio: badge ⭐ en las listas y sección propia en el formulario.
- [x] Cambiar Básico → Premium: un clic (30 días) o con fecha propia en el formulario.
- [x] Cambiar Premium → Básico: un clic.
- [x] Ver el vencimiento: campo "Premium hasta" y badges "Vence en Xd" / "Vencido" que ya existían.
- [x] El cambio se ve al instante en la ficha, la categoría, la portada y el mapa.
- [x] Avisar al dueño cuando se le activa.
- [ ] **Fecha de inicio del plan: no se guarda.** Hoy la BD solo tiene `premium_hasta`. Si se quiere saber desde cuándo es Premium (y cobrar por periodo), hay que agregar una columna o una tabla de historial. Decisión pendiente, ligada a `pagos`, que existe sin uso.
- [ ] Pagos automáticos: fuera de alcance por decisión del plan.

## Verificación

- `npm test` 25/25 (1 test nuevo: el helper de vencimiento produce una fecha que se lee como Premium vigente, y una pasada como Básico).
- `tsc` y `eslint` limpios.
- En local, las rutas del panel (`/admin`, estadísticas, editar y estadísticas por negocio) responden redirigiendo al login, sin errores de servidor.
- **Sin verificar:** el flujo completo con sesión de admin, y el envío real del correo. Eso lo prueba Willson: necesita su contraseña y un negocio con correo cargado. Si el negocio no tiene correo, el aviso se omite y queda anotado en el log del servidor.

## Riesgos

- El botón de un clic cambia el plan **sin confirmación**. Es reversible con el botón de al lado, y por eso no se le puso diálogo: para Willson es una acción de todos los días. Eliminar un negocio sí tiene confirmación, porque eso no se deshace.
- Si el negocio no tiene correo, el dueño no se enterará por email. Se puede resolver generando el link de dueño y mandándoselo por WhatsApp, que el panel ya permite.
