# LY-028 — Resultados reportados por el negocio

- **Prioridad:** P1
- **Fecha:** 2026-09-13
- **Estado:** Listo, pendiente correr la migración y revisar en el panel

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

- Un mes por vez, con los últimos cuatro a un clic. **Por defecto el mes
  pasado**, que es el único que el negocio puede responder completo.
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
no manejo. Se verificó que la ruta compila y que sin sesión redirige al login en
vez de reventar. Falta que Willson corra la migración y la mire.

## Lo que queda para después

- Pantalla para que el dueño reporte solo, cuando haya dueños entrando.
- Recordatorio automático a principio de mes con la lista de a quién preguntar.
- Cruzar lo reportado con el plan: si los Premium reconocen más clientes que los
  Básicos, ese número es el argumento de venta.
