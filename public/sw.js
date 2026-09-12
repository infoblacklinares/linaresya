// LinaresYa Service Worker (LY-032)
//
// Dos caches con reglas distintas, porque son dos problemas distintos:
//
//   - `linaresya-estaticos`: los archivos de /_next/static/, las imagenes y
//     las fuentes. La URL lleva un hash del contenido, asi que un archivo
//     nunca cambia sin cambiar de nombre: cache-first sin revalidar es
//     correcto y es lo que hace que la segunda visita cargue al instante.
//
//   - `linaresya-paginas`: el HTML de las paginas. Network-first, y la copia
//     guardada sirve **solo** para cuando no hay red. Nunca se sirve una
//     pagina vieja a alguien que si tiene conexion: si un negocio pasa a
//     Premium, se ve en la siguiente carga.
//
// Los dos tienen tope de entradas. Sin tope, el cache crece para siempre y
// el navegador termina borrando TODO el origen de una vez, que es justo lo
// que deja a la persona sin la version sin conexion que el cache existia
// para darle. En un telefono eso pasa mucho antes que en un computador.
const VERSION = "v3";
const ESTATICOS = `linaresya-estaticos-${VERSION}`;
const PAGINAS = `linaresya-paginas-${VERSION}`;
const NUESTRAS = [ESTATICOS, PAGINAS];

const OFFLINE_URL = "/offline";

// Topes. Una ficha pesa ~100 KB de HTML: 30 paginas son ~3 MB, que es lo que
// se puede pedir sin arriesgar que el navegador limpie el origen entero.
const TOPE_PAGINAS = 30;
const TOPE_ESTATICOS = 80;

const PRECACHE = [
  "/",
  "/buscar",
  OFFLINE_URL,
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/web-app-manifest-maskable-512x512.png",
  "/apple-touch-icon.png",
];

// Parametros que solo sirven para medir de donde vino la persona y no cambian
// ni una letra de la pagina. Si no se sacan, cada link de campana guarda otra
// copia entera de la misma ficha: 51 de 62 paginas cacheadas eran esto.
// `q` de la busqueda y cualquier otro parametro real NO se tocan.
const PARAMS_DE_MEDICION = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "ref",
];

/** La misma pagina con o sin parametros de campana es una sola entrada. */
function claveDeCache(request) {
  const url = new URL(request.url);
  for (const p of PARAMS_DE_MEDICION) url.searchParams.delete(p);
  return new Request(url.toString(), { method: "GET" });
}

/** Deja el cache en su tope, botando lo mas viejo primero. */
async function recortar(nombre, tope) {
  const cache = await caches.open(nombre);
  const claves = await cache.keys();
  // keys() devuelve en orden de insercion: los primeros son los mas viejos.
  // El Math.max no es adorno: sin el, mientras haya MENOS entradas que el
  // tope la resta da negativo y `slice(0, -n)` devuelve casi toda la lista,
  // asi que el recorte borraria justo lo que hay que conservar.
  const sobran = Math.max(0, claves.length - tope);
  for (const vieja of claves.slice(0, sobran)) {
    await cache.delete(vieja);
  }
}

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(ESTATICOS);
      // Uno por uno y tolerando fallas: con `addAll`, un solo 404 tira abajo
      // la instalacion completa y el sitio se queda sin service worker.
      await Promise.all(
        PRECACHE.map((url) => cache.add(url).catch(() => {}))
      );
      await self.skipWaiting();
    })()
  );
});

// ── Activate: fuera las caches de versiones anteriores ───────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const nombres = await caches.keys();
      await Promise.all(
        nombres.filter((n) => !NUESTRAS.includes(n)).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  const { request } = e;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // El tracking, las rutas de datos de Next y el propio service worker nunca
  // se cachean: guardar una respuesta de /api/track seria contar de mas.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.pathname.includes("__nextjs") ||
    url.pathname === "/sw.js"
  ) {
    return;
  }

  const esEstatico =
    url.pathname.startsWith("/_next/static/") ||
    request.destination === "image" ||
    request.destination === "font";

  if (esEstatico) {
    e.respondWith(
      (async () => {
        const guardado = await caches.match(request, { cacheName: ESTATICOS });
        if (guardado) return guardado;

        const resp = await fetch(request);
        // Basta con `ok`: mas arriba ya se descarto todo lo que no sea GET del
        // mismo origen, y una respuesta opaca nunca trae `ok` en true.
        if (resp.ok) {
          const copia = resp.clone();
          e.waitUntil(
            (async () => {
              const cache = await caches.open(ESTATICOS);
              await cache.put(request, copia);
              await recortar(ESTATICOS, TOPE_ESTATICOS);
            })()
          );
        }
        return resp;
      })()
    );
    return;
  }

  // Paginas: siempre red primero. El cache es el plan B de quien se quedo sin
  // senal, no una forma de ahorrar una peticion.
  e.respondWith(
    (async () => {
      const clave = claveDeCache(request);
      try {
        const resp = await fetch(request);
        // Basta con `ok`: mas arriba ya se descarto todo lo que no sea GET del
        // mismo origen, y una respuesta opaca nunca trae `ok` en true.
        if (resp.ok) {
          const copia = resp.clone();
          e.waitUntil(
            (async () => {
              const cache = await caches.open(PAGINAS);
              await cache.put(clave, copia);
              await recortar(PAGINAS, TOPE_PAGINAS);
            })()
          );
        }
        return resp;
      } catch {
        const guardado = await caches.match(clave, { cacheName: PAGINAS });
        if (guardado) return guardado;
        const offline = await caches.match(OFFLINE_URL, { cacheName: ESTATICOS });
        return offline || Response.error();
      }
    })()
  );
});
