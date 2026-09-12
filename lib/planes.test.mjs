// Tests de lib/planes.ts (LY-024). Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { planVigente, esPremium, canUseFeature, vencimientoEnDias } from "./planes.ts";

const enDias = (dias) => new Date(Date.now() + dias * 86_400_000).toISOString();

test("plan vigente: basico", () => {
  assert.equal(planVigente({ plan: "basico" }), "basico");
  assert.equal(planVigente({ plan: null }), "basico");
  assert.equal(planVigente({ plan: "" }), "basico");
  // Un plan desconocido nunca abre funciones de pago.
  assert.equal(planVigente({ plan: "pro" }), "basico");
});

test("plan vigente: premium segun la fecha de vencimiento", () => {
  // Sin fecha = premium sin vencimiento (asi lo deja el panel).
  assert.equal(planVigente({ plan: "premium", premium_hasta: null }), "premium");
  assert.equal(planVigente({ plan: "premium", premium_hasta: enDias(30) }), "premium");
  // Vencido: cuenta como basico desde el minuto que vence, sin esperar al cron.
  assert.equal(planVigente({ plan: "premium", premium_hasta: enDias(-1) }), "basico");
  // La consulta no trajo la columna: se confia en el plan guardado.
  assert.equal(planVigente({ plan: "premium" }), "premium");
  // Fecha basura: no se le quita el plan a un negocio por un dato mal escrito.
  assert.equal(planVigente({ plan: "premium", premium_hasta: "cualquier cosa" }), "premium");
});

test("esPremium es el atajo de planVigente", () => {
  assert.equal(esPremium({ plan: "premium", premium_hasta: enDias(5) }), true);
  assert.equal(esPremium({ plan: "premium", premium_hasta: enDias(-5) }), false);
  assert.equal(esPremium({ plan: "basico" }), false);
});

test("canUseFeature: WhatsApp y destacado son de Premium", () => {
  const basico = { plan: "basico" };
  const premium = { plan: "premium", premium_hasta: null };
  const vencido = { plan: "premium", premium_hasta: enDias(-1) };

  for (const feature of ["whatsapp", "destacado"]) {
    assert.equal(canUseFeature(basico, feature), false, feature);
    assert.equal(canUseFeature(premium, feature), true, feature);
    assert.equal(canUseFeature(vencido, feature), false, `${feature} vencido`);
  }
});

test("vencimientoEnDias sirve para activar un Premium a plazo", () => {
  const en30 = vencimientoEnDias(30);
  assert.match(en30, /^\d{4}-\d{2}-\d{2}T/);
  const dias = Math.round((Date.parse(en30) - Date.now()) / 86_400_000);
  assert.equal(dias, 30);
  // Lo que produce tiene que leerse como Premium vigente.
  assert.equal(planVigente({ plan: "premium", premium_hasta: en30 }), "premium");
  // Y al reves, una fecha pasada no.
  assert.equal(planVigente({ plan: "premium", premium_hasta: vencimientoEnDias(-1) }), "basico");
});

test("canUseFeature: estadisticas, galeria y ofertas hoy son de los dos planes", () => {
  for (const feature of ["estadisticas", "galeria", "ofertas"]) {
    assert.equal(canUseFeature({ plan: "basico" }, feature), true, feature);
    assert.equal(canUseFeature({ plan: "premium" }, feature), true, feature);
  }
});
