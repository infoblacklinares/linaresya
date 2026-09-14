# LY-035 — Correcciones de presencia digital

- **Fecha:** 2026-09-13
- **Sigue a:** LY-034 (páginas por rubro)
- **Estado:** Verificado en build de producción local, pendiente deploy

Auditoría del sitio en producción después de LY-034. Lo que estaba bien:
`robots.txt`, sitemap de 252 URL, títulos y descripciones en fichas y
categorías, JSON-LD, `lang="es"`, Open Graph. Lo que no:

## 1. La portada cargaba 225 imágenes de golpe

Ninguna de las 7 etiquetas `<img>` de la portada y los listados tenía
`loading="lazy"`. Con 164 negocios, la portada pedía **225 imágenes al abrirse**,
todas a la vez, antes de que la persona hubiera bajado un pixel. En un teléfono
con datos móviles eso es la diferencia entre que el sitio cargue y que lo
cierren.

Se agregó `loading="lazy"` y `decoding="async"`. El HTML de la portada ya pesaba
740 KB por su cuenta; esto ataca lo que se puede atacar sin rehacer la página.

**Pendiente relacionado:** el sitio no usa `next/image` en ningún listado, aunque
`next.config.ts` ya tiene configurado el dominio de Supabase. Migrar los 7 `<img>`
daría formatos modernos y tamaños por dispositivo. Es un cambio más grande y se
deja anotado, no hecho.

## 2. La portada no tenía canonical

Las fichas y las categorías sí; la portada no. Sin él,
`linaresya.cl/?utm_source=instagram` —justo el link que se publica en una
campaña— se le puede presentar a Google como una página distinta de
`linaresya.cl/`, y la fuerza queda repartida entre las dos.

Se puso **en la portada, no en el layout**: en el layout lo heredarían `/buscar`,
`/blog` y todas las demás, que quedarían declarándose copias de la portada. Eso
es peor que no tener canonical.

## 3. El dominio por defecto era el de Vercel

Cinco archivos tenían `process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.vercel.app"`.
Hoy la variable está configurada y el sitio responde bien, pero si llegara a
faltar en un deploy, **cada canonical, cada URL de Open Graph y el sitemap
completo apuntarían a linaresya.vercel.app**: el sitio entero declarándose copia
de otro dominio. Un olvido de configuración no puede costar el posicionamiento.
El valor por defecto ahora es `https://linaresya.cl`.

## 4. Las búsquedas con filtros se indexaban

`/buscar?q=pizza` respondía `index, follow` y sin canonical. La pantalla combina
siete filtros (texto, categoría, tipo, premium, verificado, domicilio, abierto
ahora), así que son **miles de URLs casi iguales**, casi todas con dos o tres
resultados. Google gasta ahí su presupuesto de rastreo en vez de en las fichas, y
esas páginas flacas compiten con las de rubro, que sí están hechas para
posicionar.

Ahora `/buscar` se indexa y `/buscar?...` responde `noindex, follow`. Sigue
siendo `follow`: los enlaces a las fichas se aprovechan igual.

**Un defecto que encontró la verificación:** la primera versión leía
`searchParams` sin `await`. En Next 16 llega como promesa, así que el objeto
salía vacío y **toda** búsqueda seguía declarándose indexable — sin que nada
fallara a la vista. Se detectó porque se comprobó el HTML servido, no el código.

## 5. Los rubros ahora se enlazan desde la portada

"Lo más buscado en Linares", con los 15 rubros, arriba del grid de categorías. La
portada es la página con más fuerza del sitio: enlazar desde ahí es lo que hace
que Google encuentre las páginas nuevas y las tome en serio.

## Verificado

En un build de producción local: portada, categoría, ficha, rubro, índice de
rubros, `/buscar`, `/premium`, `/blog` y `/mapa` responden 200. La portada trae
225 imágenes diferidas y 0 sin diferir, y 15 enlaces a rubros. `/buscar` se
indexa, `/buscar?q=pizza` y `/buscar?premium=1` no.

## Lo que depende de Willson, no del código

- **Ficha duplicada:** `saffirio-restaurant` aparece en `/gastronomia` y
  `saffirio-restaurant-2` en `/restaurante`. Dos URLs para el mismo negocio se
  reparten la fuerza. Hay que borrar una.
- **Categorías que se pisan:** existen `gastronomia` y `restaurante` como
  categorías separadas. Conviene decidir si `restaurante` se fusiona.
- **Fichas flacas:** una ficha sin descripción ni teléfono no posiciona. El panel
  ya tiene los filtros para encontrarlas (`?falta=descripcion`, `?falta=telefono`).
