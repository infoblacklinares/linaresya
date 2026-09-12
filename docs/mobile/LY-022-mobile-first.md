# LY-022 — Mobile first

- **Prioridad:** P0
- **Fecha:** 2026-09-12
- **Depende de:** LY-003 (implementada)
- **Estado final:** En pruebas — verificado en local, falta deploy y revisión en un celular real
- **Siguiente tarea:** LY-023 — Permisos

## Objetivo

Que los negocios locales se puedan contactar desde el celular sin buscar el botón.

## Problema actual

En la ficha, el bloque de contacto vivía dentro del `<aside>`, que en móvil se renderiza **después** de todo el contenido. Medido en la ficha de Mariano Lastra (viewport 375×812):

| Elemento | Antes | Después |
|---|---|---|
| Botones Llamar / Llegar | y = **1.648** | y = **537** |
| Ubicación + mapa | y = 1.900 aprox | y = 693 |
| Acerca de | y = 575 | y = 1.153 |
| Horarios | y = 643 | y = 1.255 |
| Reseñas | y = 1.273 | y = 1.885 |

Con una pantalla de 812 px, el botón para llamar quedaba a **dos pantallas de scroll**, debajo de las reseñas.

Además, al entrar a una ficha se apilaban dos banners sobre la primera pantalla: el de instalación de la PWA (`fixed bottom-20`) y el de cookies (`fixed bottom-0`).

## Cambio implementado

| Archivo | Cambio |
|---|---|
| `app/[slug]/[negocio]/page.tsx` | El contenedor pasa a `flex flex-col` en móvil y sigue siendo `grid` en `lg`. El `<aside>` lleva `order-first lg:order-none` y ambos bloques tienen columna y fila fijas (`lg:col-start-1/4`, `lg:row-start-1`), así el escritorio no cambia |
| `components/PwaInit.tsx` | El banner de instalación sale **solo en la portada** y **solo si el visitante ya respondió el banner de cookies**. Antes salía en cualquier página |

Es un cambio de CSS y de condiciones de visibilidad: no se movió ningún dato ni consulta.

## Verificado (local, `npm run dev`)

**Móvil (375×812), ficha de Mariano Lastra:**
- Llamar y Llegar en y = 537, dentro de la primera pantalla.
- Alto de los botones principales: **62 px** (el mínimo recomendable es 44).
- Sin scroll horizontal.
- El banner de la PWA ya no aparece en la ficha.

**Escritorio (1280×900), misma ficha:**
- Contenido en x = 56, ancho 868. `aside` en x = 956, ancho 268, misma fila.
- El `aside` sigue a la derecha y pegajoso. Sin scroll horizontal.

**Calidad:** `npm test` 9/9, `tsc` 0 errores, `eslint` 0 errores.

## Criterios de aceptación

- [x] Los CTA principales se ven sin hacer scroll en móvil.
- [x] Botones fáciles de pulsar (62 px).
- [x] Sin scroll horizontal en móvil ni en escritorio.
- [x] El escritorio no cambia.
- [x] No hay dos banners tapando la ficha al entrar.
- [ ] Revisión en un celular real después del deploy.
- [ ] Dashboard del dueño en móvil: no verificado, requiere un token de dueño.

## Pruebas

- Medición por DOM en móvil y escritorio (posiciones y tamaños reales, no a ojo).
- Regresión de tipos y lint en todo el proyecto. El barrido de las 163 fichas se hizo en LY-003; este cambio es solo CSS y condiciones de visibilidad.

## Riesgos y hallazgos

1. **Riesgo bajo en el layout:** si en el futuro se agrega un tercer bloque al grid, hay que darle su `col-start` / `row-start`, porque ahora las posiciones son explícitas.
2. **El service worker sirve caché vieja.** Para verificar en local hubo que desregistrarlo y borrar el caché `linaresya-v2`: estaba devolviendo la versión anterior de la página. **Después del deploy, un visitante que ya entró antes puede seguir viendo la ficha vieja hasta que el service worker se actualice.** Revisar la estrategia de caché de `public/sw.js` (candidato a LY-032).
3. **Popup "Registra tu negocio" en las fichas.** Aparece también sobre las fichas (las rutas excluidas son `/publicar`, `/admin`, `/dueno`, `/qr` y `/offline`), con un retardo y esperando la respuesta de cookies. Tapa la ficha en móvil. **No se tocó**: es la palanca de altas del directorio y esa decisión es comercial, no técnica. Si se decide sacarlo de las fichas, hay que mover también el denominador del embudo (`lib/popup-rutas.ts` lo comparte con el contador de visitas).
