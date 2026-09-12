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
  fechaSantiagoDe,
  filtrarPorFechas,
  resumenEventos,
  porFuente,
  porCampana,
  unicosPorNegocio,
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

// --- Resumenes del panel (LY-006 / LY-008) ---------------------------------

const ev = (evento, sesion, extra = {}) => ({
  evento,
  sesion,
  fuente: extra.fuente ?? null,
  campana: extra.campana ?? null,
  negocio_id: extra.negocio ?? null,
  creado_en: extra.creado_en ?? "2026-09-12T15:00:00.000Z",
});

test("fecha en hora de Chile, no en UTC", () => {
  // 02:00 UTC del 13 son las 22:00 del 12 en Chile: el dia no es el mismo.
  assert.equal(fechaSantiagoDe("2026-09-13T02:00:00.000Z"), "2026-09-12");
  assert.equal(fechaSantiagoDe("2026-09-12T15:00:00.000Z"), "2026-09-12");
  assert.equal(fechaSantiagoDe("no-es-fecha"), "");
});

test("filtrar por fechas usa el dia chileno", () => {
  const filas = [
    ev("vista", "s1", { creado_en: "2026-09-13T02:00:00.000Z" }), // 12 en Chile
    ev("vista", "s2", { creado_en: "2026-09-14T15:00:00.000Z" }), // 14, fuera
  ];
  const dentro = filtrarPorFechas(filas, "2026-09-12", "2026-09-12");
  assert.equal(dentro.length, 1);
  assert.equal(dentro[0].sesion, "s1");
});

test("resumen: los unicos son sesiones distintas, no vistas", () => {
  const r = resumenEventos([
    ev("vista", "s1"),
    ev("vista", "s1"), // misma persona recargando
    ev("vista", "s2"),
    ev("telefono", "s1"),
    ev("instagram", "s2"),
    ev("qr", "s3"), // llegar por QR no es una accion
  ]);
  assert.equal(r.vistas, 3);
  assert.equal(r.unicos, 2);
  assert.equal(r.acciones, 2);
  assert.equal(r.sesionesConAccion, 2);
  assert.equal(r.porEvento.vista, 3);
  assert.equal(r.porEvento.instagram, 1);
  assert.equal(r.tasaAccion, 100);
});

test("resumen: sin unicos no hay tasa", () => {
  const r = resumenEventos([]);
  assert.equal(r.unicos, 0);
  assert.equal(r.tasaAccion, null);
  // Eventos sin sesion no rompen el calculo.
  const sinSesion = resumenEventos([ev("vista", null), ev("telefono", null)]);
  assert.equal(sinSesion.vistas, 1);
  assert.equal(sinSesion.unicos, 0);
  assert.equal(sinSesion.tasaAccion, null);
});

test("por fuente: ordena por vistas y junta lo que no trae dato", () => {
  const cortes = porFuente([
    ev("vista", "s1", { fuente: "instagram" }),
    ev("vista", "s2", { fuente: "instagram" }),
    ev("telefono", "s1", { fuente: "instagram" }),
    ev("vista", "s3", { fuente: "google" }),
    ev("vista", "s4", {}),
  ]);
  assert.deepEqual(cortes.map((c) => c.clave), ["instagram", "google", "sin dato"]);
  assert.equal(cortes[0].vistas, 2);
  assert.equal(cortes[0].unicos, 2);
  assert.equal(cortes[0].acciones, 1);
});

test("por campana: solo las que tienen una", () => {
  const cortes = porCampana([
    ev("vista", "s1", { campana: "c001" }),
    ev("whatsapp", "s1", { campana: "c001" }),
    ev("vista", "s2", { campana: "c002" }),
    ev("vista", "s3", {}),
  ]);
  assert.deepEqual(cortes.map((c) => c.clave), ["c001", "c002"]);
  assert.equal(cortes[0].acciones, 1);
  assert.equal(cortes[1].vistas, 1);
});

test("unicos por negocio", () => {
  const mapa = unicosPorNegocio([
    ev("vista", "s1", { negocio: "a" }),
    ev("vista", "s1", { negocio: "a" }),
    ev("vista", "s2", { negocio: "a" }),
    ev("vista", "s3", { negocio: "b" }),
    ev("telefono", "s9", { negocio: "b" }), // no es vista
  ]);
  assert.equal(mapa.get("a"), 2);
  assert.equal(mapa.get("b"), 1);
});
