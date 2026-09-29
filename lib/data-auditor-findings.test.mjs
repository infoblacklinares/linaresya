import test from "node:test";
import assert from "node:assert/strict";
import { validateDataAuditorFindings } from "./data-auditor-findings.ts";

test("valida un reporte del Data Auditor y conserva trazabilidad", () => {
  const payload = {
    source: "linaresya-data-auditor",
    generated_at: "2026-09-29T20:00:00.000Z",
    findings: [
      {
        business_id: "rancho-linares",
        business_name: "Rancho Linares",
        rule: "LOCATION_NOT_ACTIONABLE",
        severity: "HIGH",
        message: "La ubicación es demasiado genérica.",
      },
    ],
  };

  const result = validateDataAuditorFindings(payload);

  assert.deepEqual(result, payload);
});

test("rechaza hallazgos sin business_id, regla, severidad o mensaje", () => {
  assert.throws(
    () =>
      validateDataAuditorFindings({
        source: "linaresya-data-auditor",
        generated_at: "2026-09-29T20:00:00.000Z",
        findings: [{ business_id: "x", rule: "RULE", severity: "HIGH" }],
      }),
    /Hallazgo inválido/,
  );
});

test("rechaza una fuente distinta al Data Auditor", () => {
  assert.throws(
    () =>
      validateDataAuditorFindings({
        source: "otra-fuente",
        generated_at: "2026-09-29T20:00:00.000Z",
        findings: [],
      }),
    /no pertenece al Data Auditor/,
  );
});
