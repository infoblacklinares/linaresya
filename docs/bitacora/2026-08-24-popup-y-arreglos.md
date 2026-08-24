# 24 de agosto de 2026 — Popup de ingreso de negocios y arreglos que salieron en el camino

Registro de la sesión. Empezó con un pedido chico ("un popup para que al ingresar
ingresen su negocio") y terminó tocando el build, el SEO y el limitador de
búsquedas, porque al revisar el sitio ruta por ruta aparecieron cosas rotas de
antes.

Todo esto ya está en `main` y desplegado.

## Commits

| Commit | Qué |
| --- | --- |
| `3c5da01` | Popup de entrada para sumar el negocio en 3 campos |
| `13cddfd` | Arregla el build, unifica el estilo de los formularios y limpia el lint |
| `aa89b2f` | Arregla que el popup no apareciera en la primera visita |
| `412e22f` | Tipa los parámetros de `app/actions/negocios.ts` (después se borró el archivo) |
| `f1cdaa8` | Arregla 404 falsos y el limitador que bloqueaba buscar |
| `c987b8f` | Merge de main: acepta el borrado de `app/actions/negocios.ts` |
| `af9da02` | Merge del PR #2 a `main` |

PR #1 y PR #2, ambos mergeados.

---

## 1. El popup (`components/PopupNegocio.tsx`)

Invita a sumar el negocio y deja enviarlo ahí mismo con lo mínimo: nombre,
categoría y WhatsApp. Usa **el mismo server action que `/publicar`**
(`publicarNegocio`), así que el negocio entra igual que siempre: inactivo hasta
que lo revises, con Turnstile si está la key, con el consentimiento de la Ley
21.719 y con aviso por correo al admin.

Reglas para que no moleste:

- Aparece a los **5 s** de la visita. Nunca de golpe al cargar: para entonces el
  splash de la portada ya terminó.
- Espera a que respondan el banner de cookies, **pero como máximo 5 s**. Si no lo
  tocan, sale igual. En total: ~5 s para quien ya respondió cookies antes, ~10 s
  en el peor caso.
- Una sola vez: si lo cierran vuelve en 7 días; si envían el negocio, no vuelve
  nunca. La marca vive en `localStorage`, clave `linaresya_popup_negocio`.
- No aparece en `/publicar`, `/admin`, `/dueno`, `/qr` ni `/offline`.
- Si la pestaña está en segundo plano, espera a que vuelvan.
- Se cierra con Esc, tocando el fondo o con "Ahora no". Atrapa el foco dentro del
  modal y enfoca el contenedor, no el input, para no abrir el teclado del celular
  de golpe.

**Para probarlo sin esperar ni limpiar el navegador: `linaresya.cl/?popup=1`.**
Fuerza el popup al instante e ignora la marca de "ya lo cerré".

Las categorías las pide a `/api/categorias` (ruta nueva) recién **cuando el popup
se abre**, para no agregarle una consulta a Supabase al render de todas las
páginas del sitio.

### El bug que lo dejaba invisible

La primera versión esperaba a que el visitante respondiera el banner de cookies,
sin tope. Como casi nadie toca el banner, el popup **no salía nunca** — justo en
la primera visita, que es a quien apunta. Reproducido en el navegador: visitante
nuevo que ignora el banner, sin popup ni a los 30 s. De ahí salió el tope de 5 s.

---

## 2. El build estaba roto

`next build` fallaba en el type-check, o sea que **cualquier deploy fallaba**:

- `sentry.client.config.ts` seguía importando `@sentry/nextjs`, que no está
  instalado. Sus tres hermanos (`sentry.server`, `sentry.edge`,
  `instrumentation`) ya estaban como no-op por el rollback de Sentry contra
  Next 16; este quedó igual, siguiendo esa misma decisión.
- `window.dataLayer` sin tipar en `CookieConsent.tsx`.
- `app/actions/negocios.ts` con cinco parámetros en `any` implícito (ese archivo
  después lo borraste vos en main; el borrado mandó).
- Faltaba `actualizado_en` en el tipo `Negocio` de `lib/supabase.ts`.

---

## 3. Formularios del admin sin estilo

`.input-ue` y `.paso-ue` estaban definidos a mano dentro de un `<style>` en tres
formularios, **cada copia con valores distintos**, y los formularios del admin
(eventos e historias) se quedaban sin ninguna: sus campos se veían como inputs
pelados del navegador.

La definición pasó a `app/globals.css` una sola vez y se borraron las tres
copias. Verificado en el navegador: los 6 inputs de `/admin/eventos` pasaron a
tener el estilo de la marca.

---

## 4. Google Analytics con el ID de ejemplo

El banner de cookies inyectaba `gtag` con el id `G-XXXXXXXXXX` (el de ejemplo),
que además el CSP bloqueaba: una petición muerta y errores en consola cada vez
que alguien aceptaba cookies.

Ahora solo carga si existe `NEXT_PUBLIC_GA_ID`, no se carga dos veces, y el CSP
de `next.config.ts` habilita los dominios de Google **solo cuando esa variable
está definida**. Si algún día querés medición, basta con definirla.

---

## 5. Next 16: `middleware.ts` → `proxy.ts`

La convención `middleware` quedó deprecada en Next 16. Archivo renombrado y
función renombrada a `proxy`. Confirmado que corre: el log del server muestra
`proxy.ts` en el pipeline de `/buscar`.

---

## 6. Lint: 37 errores a 0

Los que eran bugs o descuidos de verdad:

- **`StoriesBar`** — bug latente encontrado acá: el índice se reiniciaba en un
  efecto, así que al pasar a un grupo con **menos** historias quedaba un render
  con el índice viejo apuntando fuera del arreglo (`historia.texto` sobre
  `undefined`). Ahora se ajusta durante el render y queda acotado al largo del
  grupo.
- **`FavoritoButton`** — pasó a `useSyncExternalStore`, que es exactamente el
  caso (el store de favoritos ya exponía subscribe + snapshot). Se fue el
  placeholder de hidratación: el corazón se pinta de inmediato.
- **`MapaExplorar`** — los refs de Leaflet usan `@types/leaflet` en vez de `any`.
- Varios `<a>` internos → `<Link>`, comillas escapadas, `const` en vez de `let`,
  imports y props sin usar, `Record<string, unknown>` en el audit log.

Además quedaron **6 `eslint-disable` puntuales**, no reescrituras: donde el
patrón ya era correcto (leer `localStorage`, `sessionStorage`, `matchMedia` al
montar, y `Date.now()` en Server Components, que se renderizan una vez por
request). Cada uno lleva el motivo escrito al lado.

---

## 7. 404 falsos (soft 404)

Una URL de categoría inexistente respondía **200** con contenido de "no
encontrado". El `notFound()` vive en la page, y para entonces el streaming que
abre `loading.tsx` ya mandó la respuesta con 200: alcanza a cambiar el contenido,
no el status. Google indexa eso como página válida.

- El chequeo se movió a un `layout.tsx` por segmento, que corre **antes** del
  streaming.
- Las consultas pasaron a `lib/consultas.ts` envueltas en `cache()` de React:
  layout, `generateMetadata` y page comparten una sola. Una ficha de negocio bajó
  de **4 consultas a 2** — verificado contando peticiones contra un Supabase de
  prueba.

### Limitación que queda anotada

En `/[slug]/[negocio]` **no se puede fijar el status**: el `loading.tsx` de la
categoría abre el streaming más arriba que el layout de la ficha. Una ficha
inexistente responde 200 con contenido de 404, y su `generateMetadata` devuelve
`noindex`, que evita el daño real (que Google indexe URLs que no existen).

Para que ahí también sea 404 real hay dos caminos, los dos con costo:

1. Sacar `app/[slug]/loading.tsx` → se pierde el skeleton de las portadas de
   categoría, que son las páginas más visitadas.
2. Mover ese skeleton a un `<Suspense>` dentro de la page → hay que partir la
   página en dos (el encabezado usa `items.length`, así que el conteo tendría que
   salir aparte).

No lo hice por mi cuenta porque cambia UX que nadie pidió. Queda a tu decisión.

Caso menor relacionado: la portada de una categoría **desactivada** (`activa =
false`) sigue devolviendo 200 con contenido de 404, por el mismo motivo. El
layout solo chequea que la categoría exista, no que esté activa, para no cambiar
el comportamiento de las fichas que cuelgan de ella.

---

## 8. El limitador dejaba sin buscar

`proxy.ts` contaba los **prefetch de Next**. El footer enlaza a `/buscar` desde
todas las páginas, así que navegar un rato agotaba la cuota de 30/minuto y la
búsqueda siguiente respondía **429**. Medido: bastaban 32 prefetch.

Ahora solo cuentan las búsquedas reales (con `q` y sin cabecera de prefetch).
Verificado: 40 prefetch y la búsqueda siguiente responde 200; la 35ª búsqueda de
verdad sigue dando 429, o sea que el límite real quedó intacto.

Nota preexistente que sigue vigente: el limitador es **en memoria**, así que en
Vercel (varias instancias, sin estado compartido) es poco efectivo. El propio
archivo dice que para producción conviene Cloudflare Rate Limiting.

---

## Cómo se verificó

- `next build`, `eslint .` y `tsc --noEmit`: los tres limpios (antes el build
  fallaba y había 37 errores de lint).
- **19 rutas** recorridas en Chromium sin errores de consola ni excepciones, con
  los status esperados.
- Contra un **Supabase de prueba local** con datos realistas (categorías,
  negocios, historias):
  - el popup carga las categorías reales, se envía y llega a la pantalla de
    éxito, y después no vuelve a aparecer;
  - el corazón de favoritos se pinta desde el servidor, guarda y persiste al
    recargar;
  - el visor de historias pasa a un grupo con menos historias sin romperse (el
    caso que antes dejaba el índice fuera del arreglo) y cierra solo al terminar;
  - la ficha de negocio renderiza sin un solo error de consola.

### Lo que NO se pudo verificar desde acá

La política de red de la sesión bloquea `vercel.app` y `linaresya.cl`, así que
**nunca se vio el sitio real ni el preview**. Toda la verificación fue local.
Lo único que depende de tu Supabase de producción y quedó sin probar contra él es
`/api/categorias`, o sea el select de categorías del popup.

---

## Pendientes / decisiones tuyas

1. Confirmar en `linaresya.cl/?popup=1` que el popup aparece y que el select de
   categorías se llena.
2. Decidir si querés 404 real en fichas inexistentes, sabiendo el costo (sección
   7).
3. Si querés analytics, definir `NEXT_PUBLIC_GA_ID`.
4. Si el sitio crece, mover el rate limiting a Cloudflare.
