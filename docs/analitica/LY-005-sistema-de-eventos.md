# LY-005 — Sistema de eventos

- **Prioridad:** P0
- **Fecha:** 2026-09-12
- **Depende de:** la protección de `/api/track` (hecha)
- **Estado final:** En pruebas — verificado en local, **falta correr la migración** y desplegar
- **Siguiente tarea:** LY-006 / LY-008 — visitantes únicos y campañas en el panel

## Objetivo

Poder responder, con datos reales: cuántas personas distintas vieron una ficha, a qué hora, de dónde llegaron y qué hicieron.

## Problema

Se guardaba **1 fila por negocio por día con 4 contadores**. Al sumar se perdían la hora, la persona y el origen para siempre. Con eso es imposible:

- distinguir una visita de diez recargas;
- saber si la visita vino de Instagram, de Google o del QR;
- comparar la campaña C001 contra la C002, que es justo el piloto;
- medir Instagram, compartir, sitio web o QR: esos clics no se registraban en ninguna parte.

## Lo que ahora se guarda

Tabla `eventos_negocio`, una fila por evento:

| Campo | Para qué |
|---|---|
| `negocio_id`, `evento`, `creado_en` | qué pasó, en qué ficha, a qué hora exacta |
| `sesion` | identificador al azar del navegador → visitantes únicos |
| `fuente` | instagram, facebook, google, qr, directo, interno... |
| `campana` | C001, C002 (viene del `utm_campaign`) |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` | el link exacto de la publicación |
| `referer_host` | solo el dominio que refirió, nunca la URL completa |

**Eventos:** `vista`, `telefono`, `whatsapp`, `maps`, `instagram`, `facebook`, `web`, `compartir`, `qr`.
**Cuentan como acción** (LY-028): todos menos `vista` y `qr`. La vista es la oportunidad, no el resultado; el QR es la forma de llegar.

### `eventos_negocio` es la fuente de verdad

La función `registrar_evento` guarda el evento **y** mantiene al día los contadores diarios de siempre, para los 4 eventos históricos. Así el panel del admin y el del dueño siguen funcionando sin cambios. Dos fuentes de verdad para el mismo número es como se llega a un dashboard que se contradice: manda la tabla de eventos.

### Qué significa "visitante único"

**Una sesión de navegador.** Se genera un identificador al azar que vive mientras la pestaña esté abierta y se olvida al cerrarla. La misma persona entrando hoy y mañana son dos. No hay cookie persistente, ni IP, ni nada que identifique a nadie (LY-030). Hay que decirlo así en el panel: prometer "personas" sería mentir.

## Cambios

| Archivo | Cambio |
|---|---|
| `supabase/eventos_negocio.sql` | Nueva tabla + `registrar_evento` (con el mismo límite por minuto que ya protege el tracking) |
| `lib/eventos.ts` + test | Eventos, acciones, limpieza de UTM, deducción de la fuente, sesión anónima. 11 tests |
| `lib/tracking-cliente.ts` | Guarda sesión y origen en la pestaña, y manda los eventos con `sendBeacon` |
| `components/RegistrarVista.tsx` | Registra la vista desde el navegador |
| `components/EnlaceMedido.tsx` | Enlace que registra el clic antes de abrirse |
| `app/[slug]/[negocio]/page.tsx` | Usa los dos anteriores. **Instagram, Facebook y sitio web ahora se miden** |
| `app/[slug]/[negocio]/ShareButton.tsx` | Registra `compartir` cuando se comparte de verdad, no al abrir el menú |
| `app/[slug]/[negocio]/TrackedActionButton.tsx` | Pasa por la capa nueva (llamar, WhatsApp, cómo llegar) |
| `app/api/track/route.ts` | Acepta sesión y origen, llama a `registrar_evento` y cae a las funciones viejas si la migración no está |
| `app/qr/[categoria]/[negocio]/page.tsx` | El QR apunta a la ficha **con UTM** (`utm_source=qr`), así un escaneo se distingue de una visita cualquiera (LY-019) |

## Un cambio de fondo: la vista se cuenta en el navegador

Antes se contaba en el servidor, al renderizar el HTML. Se movió al cliente porque en el servidor no existe la sesión —no se podía separar una persona de diez recargas— y porque cualquier cosa que pidiera el HTML contaba como visita.

**Consecuencia honesta: desde este cambio habrá menos vistas que antes, y serán más reales.** No se comparan con los números de agosto. Lo que no ejecuta JavaScript ya no cuenta, y eso incluye a los bots.

No se deduplican las recargas a propósito: `vista` son visualizaciones y `sesion` son únicos, que es exactamente la distinción pedida.

## Orden de la migración

`eventos_negocio.sql` **solo agrega**, así que se puede correr antes del deploy o después. El código tolera que la tabla no exista: mientras falte, cuenta los 4 eventos históricos como siempre y avisa en el log. Los eventos nuevos (Instagram, compartir, web, QR) empiezan a guardarse cuando la migración esté.

## Verificación (local)

- `npm test` 43/43 (11 nuevos), `tsc` y `eslint` limpios.
- En el navegador, entrando a una ficha con `?utm_source=instagram&utm_medium=social&utm_campaign=c001&utm_content=slide1`:
  - la sesión se creó con el formato esperado (24 caracteres);
  - el origen quedó como `instagram` y los cuatro UTM parseados;
  - salieron los beacons a `/api/track`, los dos con respuesta 200;
  - el log del servidor mostró `[track] Falta registrar_evento` y el evento se contó por la vía antigua. Eso es exactamente el respaldo funcionando: la migración todavía no está corrida y nada se rompió.

## Lo que falta

1. **Correr `supabase/eventos_negocio.sql`** y desplegar.
2. **Mostrar lo nuevo en el panel:** visitantes únicos, Instagram, compartir, y el desglose por campaña. Eso es LY-006 y LY-008; la pantalla actual sigue mostrando lo que ya mostraba.
3. **Resultados reportados por el negocio** (consultas y clientes que el negocio dice haber recibido): tabla aparte, LY-036 del prompt. Sin mezclar con lo automático.
