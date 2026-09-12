// Tests de lib/peticion.ts. Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { esBot, mismoOrigen, claveLimite, ipDeCabeceras } from "./peticion.ts";

const CHROME_ANDROID =
  "Mozilla/5.0 (Linux; Android 13; SM-A536E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const SAFARI_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";

test("esBot: los navegadores de verdad pasan", () => {
  assert.equal(esBot(CHROME_ANDROID), false);
  assert.equal(esBot(SAFARI_IOS), false);
  assert.equal(
    esBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"),
    false,
  );
});

test("esBot: scripts y crawlers no cuentan como visita", () => {
  // El caso real que inflo 346 visitas el 2026-09-11.
  assert.equal(esBot("curl/8.4.0"), true);
  assert.equal(esBot("Wget/1.21"), true);
  assert.equal(esBot("python-requests/2.31.0"), true);
  assert.equal(esBot("PostmanRuntime/7.36.0"), true);
  assert.equal(esBot("node-fetch/1.0"), true);
  assert.equal(esBot("Googlebot/2.1 (+http://www.google.com/bot.html)"), true);
  assert.equal(esBot("facebookexternalhit/1.1"), true);
  assert.equal(esBot("WhatsApp/2.23"), true);
  assert.equal(esBot("HeadlessChrome/120.0.0.0"), true);
  assert.equal(esBot("Mozilla/5.0 (compatible; AhrefsBot/7.0)"), true);
});

test("esBot: sin user-agent se descarta", () => {
  assert.equal(esBot(""), true);
  assert.equal(esBot("   "), true);
  assert.equal(esBot(null), true);
  assert.equal(esBot(undefined), true);
});

test("mismoOrigen: acepta el sitio y sus previews", () => {
  const siteUrl = "https://linaresya.cl";
  assert.equal(mismoOrigen({ origin: "https://linaresya.cl", siteUrl }), true);
  assert.equal(mismoOrigen({ origin: "https://www.linaresya.cl", siteUrl }), true);
  // Sin Origin se cae al Referer, que es la URL completa de la ficha.
  assert.equal(
    mismoOrigen({ referer: "https://linaresya.cl/gastronomia/churraskeitor-churrascas", siteUrl }),
    true,
  );
  assert.equal(mismoOrigen({ origin: "https://linaresya-abc123.vercel.app", siteUrl }), true);
});

test("mismoOrigen: rechaza lo de afuera", () => {
  const siteUrl = "https://linaresya.cl";
  assert.equal(mismoOrigen({ origin: "https://otro-sitio.cl", siteUrl }), false);
  // Dominio que solo contiene el nombre: no alcanza.
  assert.equal(mismoOrigen({ origin: "https://linaresya.cl.atacante.com", siteUrl }), false);
  assert.equal(mismoOrigen({ origin: "no-es-una-url", siteUrl }), false);
  // Un script sin cabeceras no pasa.
  assert.equal(mismoOrigen({ siteUrl }), false);
  assert.equal(mismoOrigen({ origin: "", referer: "", siteUrl }), false);
});

test("mismoOrigen: localhost solo cuando se permite", () => {
  assert.equal(mismoOrigen({ origin: "http://localhost:3000", permitirLocal: true }), true);
  assert.equal(mismoOrigen({ origin: "http://localhost:3000" }), false);
});

test("claveLimite: no guarda la IP y es estable", () => {
  const a = claveLimite("190.0.0.1", "sal");
  const b = claveLimite("190.0.0.1", "sal");
  const c = claveLimite("190.0.0.2", "sal");
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.equal(a.length, 32);
  // La IP no aparece en la clave.
  assert.equal(a.includes("190.0.0.1"), false);
  // Otra sal, otra clave: un volcado de la tabla no sirve para rastrear.
  assert.notEqual(a, claveLimite("190.0.0.1", "otra-sal"));
  assert.equal(claveLimite(null, "sal"), "sin-ip");
  assert.equal(claveLimite("", "sal"), "sin-ip");
});

test("ipDeCabeceras: toma la primera de la cadena", () => {
  assert.equal(
    ipDeCabeceras({ xForwardedFor: "190.0.0.1, 10.0.0.1, 172.16.0.1" }),
    "190.0.0.1",
  );
  assert.equal(ipDeCabeceras({ xForwardedFor: null, xRealIp: "190.0.0.9" }), "190.0.0.9");
  assert.equal(ipDeCabeceras({}), null);
});
