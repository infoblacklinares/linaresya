# LY-027 — Panel de estadísticas del administrador

- **Prioridad:** P1
- **Fecha:** 2026-09-12
- **Depende de:** LY-024 (completada)
- **Estado final:** En pruebas — verificado en local, falta deploy y una revisión con sesión de admin
- **Siguiente tarea:** LY-005 — Sistema de eventos (proteger `/api/track` primero)

## Objetivo

Que Willson pueda ver las estadísticas de LinaresYa en una sola pantalla, con filtros de fecha, sin buscar negocio por negocio.

## Problema actual

Las estadísticas existían pero estaban repartidas y sin puerta de entrada clara:

- El bloque "Esta semana" del panel mostraba vistas y clics de 7 días, sin poder cambiar el periodo.
- "Top 5 más vistos" **solo aparecía si hubo actividad en los últimos 7 días**. Entrando en un día flojo, no se veía nada.
- Las estadísticas por negocio (30 días, gráfico y tabla diaria) existían en `/admin/negocio/<id>/estadisticas`, pero solo se llegaba scrolleando la lista de 164 negocios hasta encontrar la tarjeta.
- No había forma de ver "hoy", ni un mes, ni un rango propio.

## Cambio implementado

| Archivo | Qué es |
|---|---|
| `lib/estadisticas.ts` | Nuevo. Todo el cálculo puro: rangos de fecha en hora de Chile, totales, agregado por negocio, serie diaria, orden y búsqueda |
| `lib/estadisticas.test.mjs` | Nuevo. 10 tests sobre esa lógica |
| `components/BarrasDiarias.tsx` | Nuevo. Gráfico de barras en SVG, sin librerías |
| `app/admin/estadisticas/page.tsx` | Nuevo. La pantalla |
| `app/admin/page.tsx` | Botón "📊 Estadisticas" arriba, junto a "Agregar negocio" |

### Qué muestra la pantalla

- **Filtros:** Hoy, 7 días, 30 días y rango personalizado con dos fechas.
- **Totales del periodo:** vistas de fichas, acciones (llamar + WhatsApp + llegar), tasa de acción, llamadas, WhatsApp y cómo llegar.
- **Sesiones del sitio** en el periodo, etiquetadas como lo que son: una por sesión de navegador y del sitio completo, no de una ficha.
- **Gráfico** de vistas por día del periodo elegido.
- **Tabla por negocio** con buscador por nombre y orden por vistas, acciones o nombre. Cada fila enlaza al detalle de 30 días que ya existía.

### Decisiones

- **La tasa de acción no se calcula si no hay vistas**: muestra "—" en vez de 0 %. Es tu requisito de no inventar métricas.
- **Se omiten de la tabla los negocios sin ninguna actividad** en el periodo, y se dice cuántos se omitieron. Con 164 fichas, una tabla de ceros no se lee.
- **Un parámetro inválido en la URL cae en "7 días"**, no en una pantalla vacía. Un rango invertido se ordena solo. Un rango mayor a 180 días se recorta conservando el final.
- **`diaCorto` se formatea a mano.** Con `Intl` y `es-CL`, según la versión de ICU, el mes salía sin cero ("12/9"), así que el formato cambiaba entre servidor y navegador. Lo detectó un test.
- Todo el cálculo quedó fuera de la pantalla, en `lib/estadisticas.ts`, para que se pueda probar sin navegador.

## Base de datos

Sin cambios. Lee `estadisticas_diarias` (contadores por negocio por día) y `eventos_sitio` (sesiones). Si `eventos_sitio` no existiera, la consulta falla sola y el resto de la pantalla sigue funcionando.

## Autorización

Reutiliza la sesión de admin existente (`isAdminAuthenticated`). Nada nuevo. Verificado: sin sesión, todas las variantes de la ruta redirigen al login.

## Lo que esta pantalla todavía NO puede mostrar

Y no por falta de pantalla, sino porque el dato no se guarda:

- Visitantes únicos por negocio (no hay identificador de sesión por ficha).
- Clics de Instagram, compartidos, sitio web y QR (los botones no registran evento).
- Hora de cada evento (los contadores son por día).
- Origen de la visita y campañas (no se capturan UTM).

Todo eso es LY-005 y LY-008. La pantalla lo dice en su propio aviso, para que ningún número se lea como algo que no es.

## Criterios de aceptación

- [x] Una sola pantalla con los totales del sitio.
- [x] Filtros Hoy / 7 / 30 / rango personalizado.
- [x] Tabla por negocio con buscador y orden.
- [x] Enlace visible desde el panel.
- [x] Sin tasas con denominador 0.
- [x] Solo admin con sesión.
- [x] `npm test` 24/24, `tsc` y `eslint` limpios.
- [ ] Revisión con sesión de admin (la hace Willson: la analítica no se puede ver sin su contraseña).
- [ ] Deploy.

## Pruebas

- **Unitarias:** rangos válidos, invertidos, inválidos y gigantes; totales; tasa sin vistas; agregado por negocio; serie con días vacíos y filas fuera de rango; orden por las tres columnas sin mutar la lista; búsqueda sin tildes ni mayúsculas.
- **Ruta, en local:** 6 variantes de URL (incluyendo parámetros basura) responden 307 al login, y el servidor no registró ningún error.
- **Sin probar:** el render con sesión. No puedo autenticarme como admin porque eso implica escribir tu contraseña.

## Riesgos

- Un rango personalizado muy grande trae muchas filas. Se acotó a 180 días y a 20.000 filas por consulta; con 164 negocios eso da de sobra.
- La consulta trae las filas y agrega en el servidor. Si algún día el directorio crece mucho, esto pasa a ser una vista agregada en Postgres. Hoy no hace falta.

---

# Anexo — Mejoras al panel principal (`/admin`), 2026-09-12

Pedido de Willson: que el panel muestre información que sirva y que se pueda **encontrar un negocio rápido para editarlo**.

## 1. Buscador de negocios

Con 164 fichas, editar una implicaba abrir la categoría correcta y scrollear. Ahora hay un buscador arriba del listado que filtra por **nombre, slug, teléfono o dirección**, sin tildes ni mayúsculas (`normalizarTexto`, probado).

Cuando hay búsqueda, el listado deja de estar agrupado por categoría y muestra una lista plana con las acciones de cada negocio (editar, Premium 30 días, verificar, desactivar). Es la diferencia entre tres clics y diez.

## 2. Filtros de calidad, que además son la lista de trabajo

Bloque nuevo "Fichas a las que les falta algo", con el conteo de fichas activas **sin teléfono, sin dirección, sin descripción o sin categoría**. Cada número es un enlace que filtra el listado.

No es una métrica para mirar: es una cola de trabajo. Una ficha sin teléfono no puede generar llamadas, y una sin dirección no genera "cómo llegar" — o sea, no puede producir las acciones que después se le muestran al negocio. **Solo aparecen los filtros con al menos una ficha**, así que cuando el directorio esté limpio, el bloque desaparece solo.

## 3. Bloque "Hoy", con los eventos

Cuatro números del día: **visitantes** (sesiones distintas), vistas, acciones y eventos totales; más de dónde llegaron. Es el dato más fresco que existe: el resto del panel habla de los últimos 7 días.

Aparece **solo si hay eventos hoy**. Sin datos no se muestra una fila de ceros, que es exactamente lo que hacía parecer que el panel estaba roto.

## 4. Premium a la vista

Línea fija bajo los accesos rápidos: "Premium activos: 0 de 164. Ninguno está pagando todavía". Es el número que importa del negocio, y estaba escondido.

## Criterio que se siguió

**Ningún bloque se muestra vacío.** El popup, el Top 5, los filtros de calidad y el bloque de hoy aparecen solo cuando tienen algo que decir. Un panel con cuatro bloques en cero enseña a ignorarlo.

## Verificación

- `npm test` 50/50, `tsc` y `eslint` limpios.
- Las 6 variantes de la ruta responden bien en local, incluido un valor de filtro inventado (`?falta=inventado`), que se ignora sin romper la página.
- **Sin verificar:** cómo se ve con sesión de admin. Lo revisa Willson.
