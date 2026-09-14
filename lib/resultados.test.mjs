// Tests de lib/resultados.ts (LY-028). Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  periodoDe,
  esPeriodoValido,
  periodoLegible,
  periodoAnterior,
  mesesRecientes,
  contarReportado,
  limpiarNota,
  tasaDeRespuesta,
  tasaDeCierre,
  avisoDeCoherencia,
  totalesReportados,
  negociosAPreguntar,
} from "./resultados.ts";

test("el periodo es el primer dia del mes en hora de Chile", () => {
  assert.equal(periodoDe("2026-09-13T15:00:00Z"), "2026-09-01");
  // 1 de octubre 01:00 UTC son todavia las 22:00 del 30 de septiembre en Chile:
  // armar la fecha en UTC daria octubre y el reporte quedaria en el mes que no es.
  assert.equal(periodoDe("2026-10-01T01:00:00Z"), "2026-09-01");
  // Y al reves: 30 de septiembre 23:00 UTC ya es 30 de septiembre 20:00 en Chile.
  assert.equal(periodoDe("2026-09-30T23:00:00Z"), "2026-09-01");
  assert.equal(periodoDe("fecha mala"), "");
});

test("solo entra el primer dia de un mes real", () => {
  assert.equal(esPeriodoValido("2026-09-01"), true);
  assert.equal(esPeriodoValido("2026-09-15"), false, "un dia cualquiera no es un periodo");
  assert.equal(esPeriodoValido("2026-13-01"), false, "no existe el mes 13");
  assert.equal(esPeriodoValido("2026-00-01"), false);
  assert.equal(esPeriodoValido("1999-09-01"), false);
  assert.equal(esPeriodoValido(""), false);
  assert.equal(esPeriodoValido(null), false);
  assert.equal(esPeriodoValido(20260901), false);
});

test("el periodo se lee en castellano y sabe retroceder de anio", () => {
  assert.equal(periodoLegible("2026-09-01"), "septiembre 2026");
  assert.equal(periodoLegible("2026-01-01"), "enero 2026");
  assert.equal(periodoAnterior("2026-09-01"), "2026-08-01");
  assert.equal(periodoAnterior("2026-01-01"), "2025-12-01");
  assert.equal(periodoAnterior("2026-10-01"), "2026-09-01");
});

test("los meses que ofrece el panel empiezan por el mes en curso", () => {
  // El mes en curso tiene que estar: sin el, con la medicion recien empezada
  // la pantalla abria en un mes sin un solo dato y el actual no se podia elegir.
  const meses = mesesRecientes(4, "2026-09-13T20:00:00Z");
  assert.deepEqual(meses, ["2026-09-01", "2026-08-01", "2026-07-01", "2026-06-01"]);
  // Cruza el anio sin inventar un mes cero.
  assert.deepEqual(mesesRecientes(3, "2026-02-10T12:00:00Z"), [
    "2026-02-01",
    "2026-01-01",
    "2025-12-01",
  ]);
  assert.deepEqual(mesesRecientes(1, "2026-09-13T20:00:00Z"), ["2026-09-01"]);
  assert.deepEqual(mesesRecientes(4, "fecha mala"), []);
});

test("vacio es 'no supo decir', no cero", () => {
  assert.equal(contarReportado(""), null);
  assert.equal(contarReportado("   "), null);
  assert.equal(contarReportado(null), null);
  assert.equal(contarReportado(undefined), null);
  // Cero explicito si es un cero.
  assert.equal(contarReportado("0"), 0);
  assert.equal(contarReportado("12"), 12);
  assert.equal(contarReportado(" 7 "), 7);
  // Basura no entra a la base.
  assert.equal(contarReportado("-3"), null);
  assert.equal(contarReportado("3.5"), null);
  assert.equal(contarReportado("muchos"), null);
  assert.equal(contarReportado("9999999"), null);
});

test("la nota se recorta a lo que acepta la base", () => {
  assert.equal(limpiarNota("  dijo que le fue bien  "), "dijo que le fue bien");
  assert.equal(limpiarNota("   "), null);
  assert.equal(limpiarNota(null), null);
  assert.equal(limpiarNota("x".repeat(600)).length, 500);
});

test("tasa de respuesta: reportado contra lo que midio el sitio", () => {
  assert.equal(tasaDeRespuesta({ vistas: 100, acciones: 20 }, r({ consultas: 10 })), 50);
  // Puede pasar de 100 y no se recorta: es informacion, no un error.
  assert.equal(tasaDeRespuesta({ vistas: 100, acciones: 4 }, r({ consultas: 6 })), 150);
  // Sin dato reportado no hay tasa que calcular.
  assert.equal(tasaDeRespuesta({ vistas: 100, acciones: 20 }, r({ consultas: null })), null);
  // Sin acciones medidas no se divide por cero.
  assert.equal(tasaDeRespuesta({ vistas: 100, acciones: 0 }, r({ consultas: 5 })), null);
});

test("tasa de cierre: de las consultas, cuantas compraron", () => {
  assert.equal(tasaDeCierre(r({ consultas: 10, clientes: 3 })), 30);
  assert.equal(tasaDeCierre(r({ consultas: 3, clientes: 0 })), 0);
  assert.equal(tasaDeCierre(r({ consultas: 0, clientes: 0 })), null);
  assert.equal(tasaDeCierre(r({ consultas: 10, clientes: null })), null);
  assert.equal(tasaDeCierre(r({ consultas: null, clientes: 2 })), null);
});

test("avisa cuando los numeros no se sostienen, pero no bloquea", () => {
  const sinAcciones = { vistas: 40, acciones: 0 };
  const conAcciones = { vistas: 40, acciones: 12 };

  assert.match(
    avisoDeCoherencia(conAcciones, r({ consultas: 3, clientes: 5 })),
    /mas clientes que consultas/
  );
  assert.match(
    avisoDeCoherencia(sinAcciones, r({ consultas: 4, clientes: 1 })),
    /ni un clic de contacto/
  );
  // Lo normal no molesta.
  assert.equal(avisoDeCoherencia(conAcciones, r({ consultas: 8, clientes: 2 })), null);
  // Sin datos tampoco.
  assert.equal(avisoDeCoherencia(sinAcciones, r({ consultas: null, clientes: null })), null);
  // Cero consultas y cero clientes es coherente.
  assert.equal(avisoDeCoherencia(conAcciones, r({ consultas: 0, clientes: 0 })), null);
});

test("los totales distinguen cero de 'sin dato'", () => {
  const t = totalesReportados([
    r({ consultas: 10, clientes: 3 }),
    r({ consultas: 0, clientes: 0 }),
    r({ consultas: null, clientes: null }),
    r({ consultas: 5, clientes: null }),
  ]);
  assert.deepEqual(t, { negocios: 4, consultas: 15, clientes: 3, sinDato: 1 });
});

test("el cron solo le pregunta a quien corresponde", () => {
  const candidatos = [
    { id: "con-todo", email: "a@b.cl", vistas: 20, yaReporto: false },
    { id: "sin-email", email: null, vistas: 50, yaReporto: false },
    { id: "email-vacio", email: "", vistas: 50, yaReporto: false },
    { id: "sin-movimiento", email: "c@d.cl", vistas: 0, yaReporto: false },
    { id: "ya-respondio", email: "e@f.cl", vistas: 30, yaReporto: true },
  ];
  assert.deepEqual(
    negociosAPreguntar(candidatos).map((c) => c.id),
    ["con-todo"]
  );
  assert.deepEqual(negociosAPreguntar([]), []);
});

function r(campos) {
  return {
    negocio_id: "n1",
    periodo: "2026-09-01",
    consultas: null,
    clientes: null,
    nota: null,
    ...campos,
  };
}
