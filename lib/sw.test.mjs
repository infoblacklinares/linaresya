// Tests del service worker (LY-032). Correr con: npm test
//
// El archivo public/sw.js corre en el navegador y no se puede importar: se
// carga en un contexto aparte con lo minimo que un service worker espera
// encontrar (self, caches, fetch), y se maneja el handler de fetch a mano.
//
// Lo que se prueba es lo que rompe en silencio: que los links de campana no
// dupliquen paginas en el cache, y que el cache no crezca sin techo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

// El navegador resuelve las URL relativas contra el alcance del service
// worker: "/offline" y "https://linaresya.cl/offline" son la misma entrada.
function absoluta(request) {
  const url = typeof request === "string" ? request : request.url;
  return new URL(url, "https://linaresya.cl").toString();
}

/** Cache minimo, con el orden de insercion que usa el recorte. */
class CacheFalso {
  constructor() {
    this.entradas = new Map(); // url -> Response
  }
  async put(request, response) {
    const url = absoluta(request);
    this.entradas.delete(url); // reinsertar lo mueve al final, como el navegador
    this.entradas.set(url, response);
  }
  async match(request) {
    return this.entradas.get(absoluta(request));
  }
  async keys() {
    return [...this.entradas.keys()].map((u) => new Request(u));
  }
  async delete(request) {
    return this.entradas.delete(absoluta(request));
  }
  async add(url) {
    this.entradas.set(absoluta(url), new Response("ok"));
  }
}

class CachesFalso {
  constructor() {
    this.almacen = new Map();
  }
  async open(nombre) {
    if (!this.almacen.has(nombre)) this.almacen.set(nombre, new CacheFalso());
    return this.almacen.get(nombre);
  }
  async keys() {
    return [...this.almacen.keys()];
  }
  async delete(nombre) {
    return this.almacen.delete(nombre);
  }
  async match(request, opciones = {}) {
    const nombres = opciones.cacheName ? [opciones.cacheName] : [...this.almacen.keys()];
    for (const n of nombres) {
      const c = this.almacen.get(n);
      if (!c) continue;
      const hit = await c.match(request);
      if (hit) return hit;
    }
    return undefined;
  }
}

/** Levanta sw.js y devuelve con que manejar los eventos. */
function cargarSw({ responder }) {
  const handlers = {};
  const cachesFalso = new CachesFalso();
  const pendientes = [];

  const self_ = {
    location: { origin: "https://linaresya.cl" },
    addEventListener: (tipo, fn) => { handlers[tipo] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };

  const contexto = createContext({
    self: self_,
    caches: cachesFalso,
    fetch: responder,
    Request,
    Response,
    URL,
    Promise,
    console,
  });
  runInContext(readFileSync("public/sw.js", "utf8"), contexto);

  const evento = (request) => {
    let respuesta;
    return {
      request,
      respondWith(p) { respuesta = p; },
      waitUntil(p) { pendientes.push(p); },
      async resultado() { return respuesta; },
    };
  };

  return {
    caches: cachesFalso,
    async navegar(url) {
      const e = evento(new Request(url));
      handlers.fetch(e);
      const r = await e.resultado();
      await Promise.all(pendientes.splice(0));
      return r;
    },
    async activar() {
      const e = { waitUntil: (p) => pendientes.push(p) };
      handlers.activate(e);
      await Promise.all(pendientes.splice(0));
    },
    async instalar() {
      const e = { waitUntil: (p) => pendientes.push(p) };
      handlers.install(e);
      await Promise.all(pendientes.splice(0));
    },
  };
}

const conRed = () => async () => new Response("<html>pagina</html>", { status: 200 });
const sinRed = () => async () => { throw new Error("sin conexion"); };

test("los links de campana no duplican la pagina en el cache", async () => {
  const sw = cargarSw({ responder: conRed() });
  await sw.navegar("https://linaresya.cl/eventos/volantines-juan");
  await sw.navegar("https://linaresya.cl/eventos/volantines-juan?utm_source=instagram&utm_campaign=c001");
  await sw.navegar("https://linaresya.cl/eventos/volantines-juan?utm_source=facebook&utm_content=historia");
  await sw.navegar("https://linaresya.cl/eventos/volantines-juan?fbclid=abc123");

  const paginas = await sw.caches.open("linaresya-paginas-v3");
  const urls = [...paginas.entradas.keys()];
  assert.equal(urls.length, 1, `4 links de campana deben dejar 1 entrada, dejaron ${urls.length}`);
  assert.equal(urls[0], "https://linaresya.cl/eventos/volantines-juan");
});

test("los parametros que si cambian la pagina se respetan", async () => {
  const sw = cargarSw({ responder: conRed() });
  await sw.navegar("https://linaresya.cl/buscar?q=pizza");
  await sw.navegar("https://linaresya.cl/buscar?q=peluqueria");
  await sw.navegar("https://linaresya.cl/buscar?q=pizza&utm_source=instagram");

  const paginas = await sw.caches.open("linaresya-paginas-v3");
  const urls = [...paginas.entradas.keys()].sort();
  assert.deepEqual(urls, [
    "https://linaresya.cl/buscar?q=peluqueria",
    "https://linaresya.cl/buscar?q=pizza",
  ]);
});

test("el cache de paginas tiene techo", async () => {
  const sw = cargarSw({ responder: conRed() });
  for (let i = 0; i < 45; i++) await sw.navegar(`https://linaresya.cl/negocio-${i}`);

  const paginas = await sw.caches.open("linaresya-paginas-v3");
  assert.equal(paginas.entradas.size, 30);
  // Se botan las mas viejas, no las recien visitadas.
  assert.ok(!paginas.entradas.has("https://linaresya.cl/negocio-0"));
  assert.ok(paginas.entradas.has("https://linaresya.cl/negocio-44"));
});

test("sin conexion se sirve la copia guardada de esa misma pagina", async () => {
  let hayRed = true;
  const sw = cargarSw({
    responder: async () => {
      if (!hayRed) throw new Error("sin conexion");
      return new Response("<html>pagina</html>", { status: 200 });
    },
  });
  await sw.navegar("https://linaresya.cl/eventos/volantines-juan");
  hayRed = false;
  // Entra por un link de campana: tiene que encontrar igual la copia.
  const r = await sw.navegar("https://linaresya.cl/eventos/volantines-juan?utm_source=instagram");
  assert.equal(await r.text(), "<html>pagina</html>");
});

test("sin conexion y sin copia se sirve la pagina de offline", async () => {
  const sw = cargarSw({ responder: sinRed() });
  await sw.instalar();
  const r = await sw.navegar("https://linaresya.cl/no-visitada-nunca");
  assert.equal(await r.text(), "ok"); // lo que precacheo el falso para /offline
});

test("el tracking nunca se cachea", async () => {
  const sw = cargarSw({ responder: conRed() });
  await sw.navegar("https://linaresya.cl/api/track");
  const nombres = await sw.caches.keys();
  for (const n of nombres) {
    const c = await sw.caches.open(n);
    for (const u of c.entradas.keys()) assert.ok(!u.includes("/api/track"), u);
  }
});

test("al activar se borran las caches de versiones anteriores", async () => {
  const sw = cargarSw({ responder: conRed() });
  await sw.caches.open("linaresya-v2");
  await sw.caches.open("linaresya-paginas-v3");
  await sw.activar();
  const nombres = await sw.caches.keys();
  assert.ok(!nombres.includes("linaresya-v2"), "la cache vieja debe desaparecer");
  assert.ok(nombres.includes("linaresya-paginas-v3"));
});
