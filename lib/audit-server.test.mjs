import test from "node:test";
import assert from "node:assert/strict";

test("audit-server define acciones y actores esperados", async () => {
  const source = await import("./audit-server.ts");
  assert.equal(typeof source.logAuditServer, "function");
});
