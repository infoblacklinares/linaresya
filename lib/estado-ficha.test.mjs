import test from "node:test";
import assert from "node:assert/strict";
import { calcularEstadoFicha } from "./estado-ficha.ts";

const base = {
  activo: true,
  verificado: true,
  descripcion: "Descripción",
  telefono: "987654321",
  whatsapp: null,
  direccion: "Maipú 123",
  lat: -35.85,
  lng: -71.60,
  a_domicilio: false,
  categoriaId: 1,
  tieneFotografias: true,
  tieneHorariosCompletos: true,
};

test("ficha completa y sin hallazgos queda VERDE", () => {
  assert.equal(calcularEstadoFicha(base).estado, "VERDE");
});

test("ficha activa con dato faltante queda AMARILLO", () => {
  assert.equal(calcularEstadoFicha({ ...base, telefono: null }).estado, "AMARILLO");
});

test("ficha no verificada queda ROJO", () => {
  assert.equal(calcularEstadoFicha({ ...base, verificado: false }).estado, "ROJO");
});

test("ubicación incompleta queda ROJO", () => {
  assert.equal(calcularEstadoFicha({ ...base, lat: null }).estado, "ROJO");
});

test("hallazgo HIGH queda ROJO", () => {
  assert.equal(
    calcularEstadoFicha(base, [{ severity: "HIGH", rule: "X", message: "Problema" }]).estado,
    "ROJO",
  );
});

test("Data Auditor MEDIUM no apaga las reglas internas", () => {
  const result = calcularEstadoFicha(
    { ...base, descripcion: null },
    [{ severity: "MEDIUM", rule: "X", message: "Observación" }],
  );
  assert.equal(result.estado, "AMARILLO");
  assert.equal(result.faltantes.includes("Falta descripción"), true);
});
