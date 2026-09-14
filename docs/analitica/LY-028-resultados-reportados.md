# LY-028 — Resultados reportados por el negocio

- **Prioridad:** P1
- **Fecha:** 2026-09-13
- **Estado:** Desplegado. Migración corrida el 2026-09-13. Falta la revisión visual de Willson en el panel

## El agujero que tapa

El sitio ya sabe cuántas personas vieron una ficha y cuántas tocaron "Llamar" o
"WhatsApp". Lo que no puede saber, y es **lo único que el negocio siente**, es
cuántas de esas personas terminaron comprando. Eso pasa en el local, por
teléfono o por WhatsApp: no hay forma de medirlo desde el navegador.

Sin ese dato, la conversación de venta es "te mandamos 40 clics". Con ese dato
es "te mandamos 40 clics, tú reconociste 12 consultas y 3 clientes". La segunda
cierra ventas; la primera no.

## La decisión: lo carga Willson, no el dueño

Se evaluó darle al dueño una pantalla para que reporte solo. Se descartó: hay
**cero dueños** usando su pantalla de estadísticas hoy, así que una pantalla más
que nadie abre es trabajo tirado. Willson ya les habla por WhatsApp; anotar lo
que le dicen toma diez segundos.

Cuando haya dueños entrando solos, la tabla ya está y la pantalla del dueño se
puede agregar sin migrar nada.

## Regla que gobierna el diseño

**Reportado no es medido.** Un número que el dueño dio de memoria no aparece
nunca junto a uno del sitio sin decir cuál es cuál. La pantalla lo dice con esas
palabras, la tabla vive aparte de `estadisticas_diarias` y de `eventos_negocio`,
y el archivo de lógica lo repite arriba de todo.

## Base de datos

`supabase/resultados_negocio.sql` — **solo agrega**, se puede correr antes o
después del deploy.

| Columna | Para qué |
|---|---|
| `periodo` | Primer día del mes, en hora de Chile |
| `consultas` | Cuántos lo contactaron. `NULL` = no supo decir |
| `clientes` | De esos, cuántos compraron |
| `nota` | Lo que dijo, en sus palabras. Máximo 500 |

- `UNIQUE (negocio_id, periodo)`: volver a preguntar **corrige**, no duplica.
- RLS activo y sin políticas: son datos comerciales de terceros, la llave
  pública no entra.
- Un trigger mantiene `actualizado_en` sin depender de que el código se acuerde.

**Por qué el mes y no la semana:** un mes es el período más chico que un dueño
puede responder de memoria. Por semana la respuesta sería inventada.

**Por qué `NULL` y no cero:** "no supo decirme" y "me dijo que ninguno" son
respuestas distintas. Confundirlas arruina cualquier promedio que se saque
después. El formulario deja el campo vacío a propósito.

## Pantalla

`/admin/resultados`, enlazada desde el panel.

- Un mes por vez, con cuatro a un clic. **Por defecto el mes en curso**, marcado
  como tal.

  La primera versión abría en el mes pasado, razonando que es el único que el
  negocio puede responder completo. Al verla con datos reales quedó claro que
  estaba mal: la medición empezó el 12 de septiembre de 2026, así que los cuatro
  meses ofrecidos (agosto a mayo) estaban todos vacíos, y el mes actual **no se
  podía elegir**. Un mes a medias se corrige después: el reporte se pisa, no se
  duplica.
- Cada negocio muestra en una línea lo que midió el sitio y, al lado, los campos
  para anotar lo que reportó.
- Dos tasas, cuando hay con qué calcularlas:
  - **Tasa de respuesta:** de los contactos que midió el sitio, cuántos
    reconoce. Puede pasar de 100% y no se recorta: alguien guarda el número y
    llama al otro día, o llega por el directorio y avisa a un amigo. Ese exceso
    es información, no un error.
  - **Tasa de cierre:** de las consultas que reconoce, cuántas compraron.
- Un aviso cuando los números no se sostienen (más clientes que consultas, o
  consultas sin ni un clic medido). **Avisa, no bloquea:** el dato es del
  negocio, no nuestro.
- Arriba los negocios con movimiento o con reporte; el resto queda plegado, para
  que ciento y tanto de fichas sin actividad no tapen la pantalla.

## Pruebas

`lib/resultados.test.mjs` (9 casos). Lo que cubren y por qué:

| Caso | Qué evita |
|---|---|
| Período en hora de Chile | Que un reporte del 30 de septiembre a las 22:00 quede guardado en octubre |
| Validación de período | Que entre a la base un día cualquiera o un mes 13 |
| Vacío es `null`, no cero | Que "no supo decirme" se lea después como "no le llegó nadie" |
| Basura en los campos | Negativos, decimales y texto no llegan a la base |
| Tasa de respuesta | Que no se divida por cero, y que sobre 100% no se recorte |
| Tasa de cierre | Lo mismo, con consultas en cero |
| Aviso de coherencia | Que avise sin bloquear |
| Totales | Que cero y "sin dato" no se sumen igual |

`npm test` 67/67, `tsc` y `eslint` limpios.

**Sin probar en el panel:** entrar requiere la contraseña de administrador, que
no manejo. Lo verificado en producción después del deploy:

- `/admin/resultados` responde 307 al login en vez de reventar.
- La portada y una ficha siguen en 200: el cambio no rompió nada del sitio.

Falta que Willson abra la pantalla y la mire.

## Segunda parte: que se pregunte solo (2026-09-13)

Willson planteó el problema correcto: preguntar uno por uno no escala. **Pero el
número clave era otro: de 164 negocios activos, 13 tienen correo.** Los otros 151
los cargó él desde datos públicos y no hay dueño al otro lado.

Eso cambia la conclusión. Un cron por correo hoy alcanza a 13 negocios; con una
tasa de respuesta normal (20-40%) son unas 4 respuestas al mes. **El cuello de
botella real no es cómo se pregunta: es que 151 negocios no saben que están en el
sitio.** Así que se construyó el automatismo armado para crecer solo a medida que
los dueños reclaman su ficha, con una salida usable hoy para los que no tienen
correo.

### 1. Pantalla del dueño — `/dueno/resultados/[token]`

Dos campos y una nota. Funciona con link, tenga correo el negocio o no.

Primero le muestra **sus** números del mes y después pregunta. El orden no es
cosmético: sin él es una encuesta más; con él es un reporte de lo que el
directorio le dio, y la pregunta se gana el derecho a estar ahí.

**Autorización:** el `negocio_id` sale del token, nunca del formulario. Si se
confiara en un campo oculto, cualquier dueño con un link válido podría escribir
sobre la ficha de otro. El token dura 45 días: el correo sale el día 1 y tiene
que seguir sirviendo tres semanas después.

Le pregunta por el **mes pasado**, al revés que el panel. El panel lo usa Willson
para anotar lo que le acaban de decir; este link llega por correo el día 1 y
pregunta por el mes que cerró, que es el que se responde de memoria.

### 2. Cron mensual — `/api/cron/pedir-resultados`, día 1 a las 13:00 UTC

Le escribe solo a quien cumple las tres condiciones:

| Regla | Por qué |
|---|---|
| Tiene correo | Hoy 13 de 164. La lista crece sola cuando reclaman su ficha |
| Tuvo movimiento | Escribirle a alguien con cero visitas es pedirle que confirme que no le sirvió. Ese correo hace daño |
| No respondió aún | Nadie recibe dos veces lo mismo |

La regla vive en `negociosAPreguntar()`, en `lib/resultados.ts`, con test propio:
es la decisión que, mal hecha, manda correos no deseados.

### 3. Botón de WhatsApp en el panel

Para los 151 sin correo. Genera el link al apretar y abre WhatsApp con el mensaje
escrito: un toque, sin redactar ni copiar. Solo aparece en los negocios con
movimiento y sin reporte todavía.

El token se crea recién al apretar, no para los 164 de antemano: un link que
nadie va a usar es un link de más dando vueltas.

### Verificado

- Token inválido muestra "Este link ya no sirve"; token válido abre la pantalla
  con los datos reales del negocio.
- Se llenó y envió el formulario: la fila quedó en `resultados_negocio` con
  `consultas: 7, clientes: 2`. **Los datos de prueba se borraron**, y también el
  token de prueba.
- El cron sin el secreto responde 401.

## Lo que queda para después

- **Lo que de verdad desbloquea todo esto:** que los 151 negocios sin dueño
  reclamen su ficha. Mientras no pase, el automatismo le habla a 13.
- Cruzar lo reportado con el plan: si los Premium reconocen más clientes que los
  Básicos, ese número es el argumento de venta.
