# LY-036 — Visor de fotos y rendimiento

- **Fecha:** 2026-09-13
- **Estado:** Verificado en build de producción local, pendiente deploy

## 1. Visor de fotos en la ficha

Las fotos de la galería eran miniaturas y nada más: se veían a 160 píxeles de
ancho y no había forma de mirarlas de cerca. En un directorio la foto **es** el
producto —el plato, el corte de pelo, el trabajo terminado—, así que no poder
agrandarla se come buena parte de lo que la ficha viene a mostrar.

`components/GaleriaFotos.tsx`: al tocar una foto se abre a pantalla completa.

| Detalle | Por qué |
|---|---|
| Miniaturas diferidas; la grande se pide al abrir | Abrir una ficha no puede costar la descarga de 8 fotos completas |
| Se precarga **solo la siguiente** | Pasar de foto es instantáneo sin bajar las 8 |
| Cierra con Escape, con el botón y tocando el fondo | Las tres cosas que la gente intenta |
| Flechas del teclado y deslizar en el teléfono | En móvil, deslizar es lo primero que se prueba |
| El fondo no hace scroll mientras está abierto | Si no, cerrar el visor te deja en otra parte de la página |
| Da la vuelta: de la última a la primera | Sin callejón sin salida |

También se corrigió que las fotos tenían `alt=""`. Ahora dicen el nombre del
negocio y el número de foto: eso lo lee Google y lo lee un lector de pantalla.

## 2. La portada: de 742 KB a 412 KB, y ahora se cachea

Medido en producción antes del cambio:

| Página | Peso | TTFB |
|---|---|---|
| **Portada** | **742 KB** | **1,4 – 2,2 s** (6 s en frío) |
| Ficha | 105 KB | 0,5 – 1,1 s |
| Página de rubro | 57 KB | 0,2 s |

La portada era, por lejos, la página más lenta del sitio. Dos causas:

**No se cacheaba nada.** Estaba en `revalidate = 0`: cada visita obligaba a
renderizarla entera contra la base. El motivo era que "Destacados" se baraja al
azar y con caché quedaba congelado desde el build. Ahora son **5 minutos**: se
sigue barajando varias veces por hora y la página se sirve cacheada. Nadie nota
la diferencia entre un orden que cambia en cada recarga y uno que cambia cada 5
minutos; todos notan dos segundos de espera. Un negocio nuevo tarda como mucho 5
minutos en salir en la portada — su ficha y su categoría aparecen al instante,
como siempre.

**Renderizaba 120 tarjetas.** Dos carruseles horizontales de 60 negocios cada
uno, que nadie recorre entero, con una imagen por tarjeta. Bajaron a 24 cada uno.

Resultado local: **412 KB** y 114 imágenes en vez de 240.

## 3. Resto de imágenes y prioridades

- `/buscar` mostraba hasta 100 resultados con todas las imágenes sin diferir.
  Ahora van diferidas.
- La foto de portada de la ficha ahora se pide con `fetchPriority="high"`: es la
  imagen más grande y la primera que se ve, así que es la que decide cuán rápido
  *se siente* la página.
- El avatar circular de la ficha repite esa misma foto. Pasó a ser decorativo
  (`alt=""`, `aria-hidden`): un lector de pantalla anunciaba el nombre del
  negocio dos veces seguidas.

## Verificado

En un build de producción local, con el visor abierto de verdad en el navegador:

- Abre en la foto correcta (3 de 8), con el contador y los tres botones.
- Siguiente y anterior avanzan y retroceden; las flechas del teclado también.
- Da la vuelta de la 8 a la 1.
- Escape cierra y **devuelve el scroll** al fondo.
- Portada: 114 imágenes, 99 diferidas. Categoría: 24 de 24 diferidas.
  `/buscar?q=restaurante`: 10 de 10.
- Portada, buscar, mapa, blog, categoría, ficha, rubro, premium, ofertas y
  publicar responden 200. `npm test` 74/74.

## Lo que queda anotado, sin hacer

- **`/buscar` sin filtros pesa 604 KB**: lista 100 negocios de una vez. Las
  imágenes ya van diferidas, pero el HTML sigue siendo grande. Bajar ese tope o
  paginar es una decisión de producto, no técnica.
- **El sitio no usa `next/image` en ningún listado**, aunque `next.config.ts` ya
  tiene configurado el dominio de Supabase. Migrar daría formatos modernos y un
  tamaño por dispositivo. Es el siguiente salto de rendimiento y es un cambio
  grande.
- **`components/BusinessCard.tsx` no lo usa nadie.** Código muerto.
