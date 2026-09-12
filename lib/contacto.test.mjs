// Tests de lib/contacto.ts (LY-003). Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizarTelefono,
  normalizarWhatsApp,
  normalizarFacebook,
  normalizarSitioWeb,
  telefonoInternacional,
  telLink,
  whatsAppLink,
  MENSAJE_WHATSAPP,
} from "./contacto.ts";

const ok = (valor) => ({ ok: true, valor });

test("telefono: formatos chilenos validos", () => {
  assert.deepEqual(normalizarTelefono("+56 9 1234 5678"), ok("+56912345678"));
  assert.deepEqual(normalizarTelefono("912345678"), ok("+56912345678"));
  assert.deepEqual(normalizarTelefono("73 221 1234"), ok("+56732211234"));
  assert.deepEqual(normalizarTelefono("(073) 221 1234"), ok("+56732211234"));
  assert.deepEqual(normalizarTelefono("2 2345 6789"), ok("+56223456789"));
  assert.deepEqual(normalizarTelefono("600 360 0000"), ok("6003600000"));
  assert.deepEqual(normalizarTelefono("800 123 456"), ok("800123456"));
  assert.deepEqual(normalizarTelefono("  "), ok(null));
});

test("telefono: invalidos dan error", () => {
  assert.equal(normalizarTelefono("1234 5678").ok, false); // 8 digitos, sin 9 ni area
  assert.equal(normalizarTelefono("5621234567").ok, false); // le falta un digito
  assert.equal(normalizarTelefono("hola").ok, false);
});

test("whatsapp: solo celulares", () => {
  assert.deepEqual(normalizarWhatsApp("9 1234 5678"), ok("56912345678"));
  assert.deepEqual(normalizarWhatsApp("+56 9 1234 5678"), ok("56912345678"));
  assert.deepEqual(normalizarWhatsApp("56912345678"), ok("56912345678"));
  assert.deepEqual(normalizarWhatsApp(""), ok(null));
  assert.equal(normalizarWhatsApp("73 221 1234").ok, false); // fijo
  assert.equal(normalizarWhatsApp("12345").ok, false);
});

test("telLink: formato internacional y tolera datos viejos", () => {
  assert.equal(telLink("+56 9 1234 5678"), "tel:+56912345678");
  assert.equal(telLink("732211234"), "tel:+56732211234");
  assert.equal(telLink("600 360 0000"), "tel:6003600000");
  assert.equal(telLink("5621234567"), "tel:5621234567"); // raro, pero se puede marcar
  assert.equal(telLink(null), null);
  assert.equal(telLink(""), null);
  assert.equal(telLink("sin numero"), null);
});

test("whatsAppLink: wa.me con mensaje, null si no es celular", () => {
  assert.equal(
    whatsAppLink("912345678"),
    `https://wa.me/56912345678?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`,
  );
  // Dato guardado con 56: antes el banner armaba wa.me/5656...
  assert.ok(whatsAppLink("56912345678").startsWith("https://wa.me/56912345678?"));
  assert.equal(whatsAppLink("732211234"), null);
  assert.equal(whatsAppLink(null), null);
});

test("telefonoInternacional: null si no calza", () => {
  assert.equal(telefonoInternacional("+56912345678"), "+56912345678");
  assert.equal(telefonoInternacional("12"), null);
  assert.equal(telefonoInternacional(undefined), null);
});

test("facebook: link canonico", () => {
  const CHECK_SQL = /^https:\/\/([a-z0-9-]+\.)*facebook\.com\/.+/i; // supabase/facebook_negocios.sql
  const casos = [
    ["https://www.facebook.com/panaderia.laespiga/?ref=bookmarks", "https://www.facebook.com/panaderia.laespiga"],
    ["m.facebook.com/minegocio", "https://www.facebook.com/minegocio"],
    ["fb.com/minegocio", "https://www.facebook.com/minegocio"],
    ["https://web.facebook.com/minegocio/", "https://www.facebook.com/minegocio"],
    ["https://www.facebook.com/profile.php?id=100012345&sk=about", "https://www.facebook.com/profile.php?id=100012345"],
    ["minegocio", "https://www.facebook.com/minegocio"],
    ["@panaderia.laespiga", "https://www.facebook.com/panaderia.laespiga"],
  ];
  for (const [entrada, esperado] of casos) {
    const r = normalizarFacebook(entrada);
    assert.deepEqual(r, ok(esperado), entrada);
    assert.match(r.valor, CHECK_SQL, entrada);
  }
  assert.deepEqual(normalizarFacebook(""), ok(null));
});

test("facebook: invalidos dan error", () => {
  assert.equal(normalizarFacebook("https://instagram.com/minegocio").ok, false);
  assert.equal(normalizarFacebook("facebook.com").ok, false);
  assert.equal(normalizarFacebook("abc").ok, false); // usuario muy corto
});

test("sitio web: agrega https y rechaza redes sociales", () => {
  assert.deepEqual(normalizarSitioWeb("minegocio.cl"), ok("https://minegocio.cl/"));
  assert.deepEqual(normalizarSitioWeb("http://minegocio.cl/menu"), ok("http://minegocio.cl/menu"));
  assert.deepEqual(normalizarSitioWeb(""), ok(null));
  assert.equal(normalizarSitioWeb("instagram.com/minegocio").ok, false);
  assert.equal(normalizarSitioWeb("https://www.facebook.com/minegocio").ok, false);
  assert.equal(normalizarSitioWeb("hola").ok, false);
});
