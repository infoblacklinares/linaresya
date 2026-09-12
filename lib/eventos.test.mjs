// Tests de lib/eventos.ts (LY-005). Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EVENTOS_NEGOCIO,
  EVENTOS_ACCION,
  EVENTOS_HISTORICOS,
  esEventoNegocio,
  esAccion,
  normalizarUtm,
  tieneUtm,
  hostDeReferer,
  fuenteDesde,
  nuevaSesion,
  esSesionValida,
  UTM_VACIO,
} from "./eventos.ts";

test("eventos: lista blanca", () => {
  assert.equal(esEventoNegocio("vista"), true);
  assert.equal(esEventoNegocio("instagram"), true);
  assert.equal(esEventoNegocio("compartir"), true);
  assert.equal(esEventoNegocio("qr"), true);
  assert.equal(esEventoNegocio("inventado"), false);
  assert.equal(esEventoNegocio(""), false);
  assert.equal(esEventoNegocio(null), false);
  assert.equal(esEventoNegocio(123), false);
});

test("acciones: la vista no es una accion, el QR tampoco", () => {
  assert.equal(esAccion("telefono"), true);
  assert.equal(esAccion("whatsapp"), true);
  assert.equal(esAccion("compartir"), true);
  assert.equal(esAccion("vista"), false);
  assert.equal(esAccion("qr"), false);
  // Toda accion tiene que estar en la lista blanca.
  for (const e of EVENTOS_ACCION) assert.ok(EVENTOS_NEGOCIO.includes(e), e);
  for (const e of EVENTOS_HISTORICOS) assert.ok(EVENTOS_NEGOCIO.includes(e), e);
});

test("utm: se limpia lo que venga en la URL", () => {
  const utm = normalizarUtm({
    utm_source: "  Instagram  ",
    utm_medium: "SOCIAL",
    utm_campaign: "C001",
    utm_content: "slide1",
  });
  assert.deepEqual(utm, {
    source: "instagram",
    medium: "social",
    campaign: "c001",
    content: "slide1",
  });
});

test("utm: rechaza basura y acota el largo", () => {
  const utm = normalizarUtm({
    utm_source: "<script>alert(1)</script>",
    utm_medium: "a".repeat(200),
    utm_campaign: "",
    utm_content: null,
  });
  assert.equal(utm.source, "scriptalert1script");
  assert.equal(utm.medium.length, 40);
  assert.equal(utm.campaign, null);
  assert.equal(utm.content, null);
});

test("utm: funciona con URLSearchParams y detecta si hay alguno", () => {
  const params = new URLSearchParams("?utm_source=instagram&utm_campaign=c002");
  const utm = normalizarUtm(params);
  assert.equal(utm.source, "instagram");
  assert.equal(utm.campaign, "c002");
  assert.equal(tieneUtm(utm), true);
  assert.equal(tieneUtm(normalizarUtm({})), false);
  assert.equal(tieneUtm(UTM_VACIO), false);
  assert.equal(tieneUtm(null), false);
});

test("referer: solo el dominio, sin www", () => {
  assert.equal(hostDeReferer("https://www.instagram.com/p/abc123/"), "instagram.com");
  assert.equal(hostDeReferer("https://l.facebook.com/l.php?u=algo"), "l.facebook.com");
  assert.equal(hostDeReferer("no-es-url"), null);
  assert.equal(hostDeReferer(null), null);
  assert.equal(hostDeReferer(""), null);
});

test("fuente: manda el utm_source si vino", () => {
  assert.equal(
    fuenteDesde({ utm: normalizarUtm({ utm_source: "qr" }), refererHost: "instagram.com" }),
    "qr",
  );
});

test("fuente: si no hay utm se deduce del dominio", () => {
  assert.equal(fuenteDesde({ refererHost: "instagram.com" }), "instagram");
  assert.equal(fuenteDesde({ refererHost: "l.instagram.com" }), "instagram");
  assert.equal(fuenteDesde({ refererHost: "facebook.com" }), "facebook");
  assert.equal(fuenteDesde({ refererHost: "l.facebook.com" }), "facebook");
  assert.equal(fuenteDesde({ refererHost: "google.cl" }), "google");
  assert.equal(fuenteDesde({ refererHost: "duckduckgo.com" }), "buscador");
  assert.equal(fuenteDesde({ refererHost: "tiktok.com" }), "tiktok");
  // Navegar dentro del propio sitio no es una fuente externa.
  assert.equal(fuenteDesde({ refererHost: "linaresya.cl" }), "interno");
  // Sin referer ni utm: directo.
  assert.equal(fuenteDesde({}), "directo");
  assert.equal(fuenteDesde({ refererHost: "" }), "directo");
  // Dominio desconocido: se guarda tal cual.
  assert.equal(fuenteDesde({ refererHost: "diariolinares.cl" }), "diariolinares.cl");
});

test("sesion: formato estable y distinta cada vez", () => {
  const a = nuevaSesion();
  const b = nuevaSesion();
  assert.match(a, /^[a-z0-9]{24}$/);
  assert.notEqual(a, b);
  assert.equal(esSesionValida(a), true);
  // Lo que llegue por la API se valida.
  assert.equal(esSesionValida("corta"), false);
  assert.equal(esSesionValida("MAYUSCULAS1234567890abcd"), false);
  assert.equal(esSesionValida(null), false);
  assert.equal(esSesionValida("a".repeat(25)), false);
});

test("sesion: con un generador fijo es reproducible", () => {
  const fija = nuevaSesion(() => 0);
  assert.equal(fija, "a".repeat(24));
});
