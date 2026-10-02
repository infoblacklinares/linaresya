import test from "node:test";
import assert from "node:assert/strict";

import { AUDIT_EVENTS, getAuditDefinition } from "./audit-events.ts";

test("los eventos administrativos tienen una definición de auditoría", () => {
  const eventos = Object.keys(AUDIT_EVENTS);

  assert.ok(eventos.length > 0);
  for (const evento of eventos) {
    const definicion = getAuditDefinition(evento);
    assert.ok(definicion.action);
    assert.ok(definicion.entityType);
  }
});

test("las acciones destructivas usan DELETE", () => {
  assert.equal(AUDIT_EVENTS["negocio.eliminar"].action, "DELETE");
  assert.equal(AUDIT_EVENTS["resena.rechazar"].action, "DELETE");
  assert.equal(AUDIT_EVENTS["reporte.eliminar"].action, "DELETE");
  assert.equal(AUDIT_EVENTS["resultado.eliminar"].action, "DELETE");
});

test("los resultados reportados tienen entidad de auditoría propia", () => {
  assert.equal(
    AUDIT_EVENTS["resultado.guardar"].entityType,
    "resultados_negocio",
  );
  assert.equal(
    AUDIT_EVENTS["resultado.eliminar"].entityType,
    "resultados_negocio",
  );
});
