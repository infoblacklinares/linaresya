// LinaresYa Service Worker — cache-first para assets, network-first para páginas
const CACHE = "linaresya-v1";
const OFFLINE_URL = "/offline";

const PRECACHE = [
  "/",
  "/buscar",
  "/offline",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/apple-touch-icon.png",
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// ── Activate: limpia caches viejas ───────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Solo GET y mismo origen
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Ignora rutas de API y Next.js internals
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.pathname.includes("__nextjs")
  ) return;

  // Cache-first: assets estáticos (_next/static, imágenes, fuentes)
  if (
    url.pathname.startsWith("/_next/static/") ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    e.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((resp) => {
            if (resp.ok) {
              const clone = resp.clone();
              caches.open(CACHE).then((c) => c.put(request, clone));
            }
            return resp;
          })
      )
    );
    return;
  }

  // Network-first con fallback a cache para páginas navegables
  e.respondWith(
    fetch(request)
      .then((resp) => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return resp;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});
