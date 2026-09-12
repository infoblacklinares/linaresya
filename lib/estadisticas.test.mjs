// Tests de lib/estadisticas.ts (LY-027). Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fechaCL,
  diaCorto,
  esFechaISO,
  resolverRango,
  diasDelRango,
  totalesDelRango,
  agregarPorNegocio,
  serieDiaria,
  ordenValido,
  ordenarNegocios,
  filtrarPorNombre,
  MAX_DIAS_RANGO,
} from "./estadisticas.ts";

const fila = (negocio_id, fecha, v, tel = 0, wa = 0, maps = 0) => ({
  negocio_id,
  fecha,
  vistas: v,
  clicks_telefono: tel,
  clicks_whatsapp: wa,
  clicks_maps: maps,
});

const conNegocio = (f, nombre) => ({
  ...f,
  nombre,
  slug: nombre.toLowerCase().replace(/ /g, "-"),
  categoriaSlug: "gastronomia",
  categoriaNombre: "Gastronomia",
});

test("fechas: formato y validacion", () => {
  assert.match(fechaCL(0), /^\d{4}-\d{2}-\d{2}$/);
  assert.match(diaCorto("2026-09-12"), /^12\/09$/);
  assert.equal(esFechaISO("2026-09-12"), true);
  assert.equal(esFechaISO("12-09-2026"), false);
  assert.equal(esFechaISO(""), false);
});

test("rango: hoy, 7 y 30 dias", () => {
  const hoy = resolverRango({ periodo: "hoy" });
  assert.equal(hoy.dias, 1);
  assert.equal(hoy.desde, hoy.hasta);
  assert.equal(hoy.desde, fechaCL(0));

  assert.equal(resolverRango({ periodo: "7" }).dias, 7);
  assert.equal(resolverRango({ periodo: "30" }).dias, 30);
  // El default, y tambien la red para parametros basura.
  assert.equal(resolverRango({}).periodo, "7");
  assert.equal(resolverRango({ periodo: "cualquiera" }).periodo, "7");
});

test("rango personalizado: valido, invertido e invalido", () => {
  const r = resolverRango({ periodo: "rango", desde: "2026-09-01", hasta: "2026-09-10" });
  assert.deepEqual([r.desde, r.hasta, r.dias], ["2026-09-01", "2026-09-10", 10]);

  // Al reves: se ordena en vez de devolver un rango vacio.
  const inv = resolverRango({ periodo: "rango", desde: "2026-09-10", hasta: "2026-09-01" });
  assert.deepEqual([inv.desde, inv.hasta], ["2026-09-01", "2026-09-10"]);

  // Fecha mal escrita: cae en 7 dias, no en pantalla vacia.
  assert.equal(resolverRango({ periodo: "rango", desde: "ayer", hasta: "hoy" }).periodo, "7");
  assert.equal(resolverRango({ periodo: "rango", desde: "2026-09-01" }).periodo, "7");

  // Rango gigante: se recorta y conserva el final.
  const gigante = resolverRango({ periodo: "rango", desde: "2020-01-01", hasta: "2026-09-10" });
  assert.equal(gigante.dias, MAX_DIAS_RANGO);
  assert.equal(gigante.hasta, "2026-09-10");
});

test("diasDelRango devuelve todos los dias, en orden", () => {
  const dias = diasDelRango(resolverRango({ periodo: "rango", desde: "2026-09-01", hasta: "2026-09-04" }));
  assert.deepEqual(dias, ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04"]);
});

test("totales: suma y tasa de accion", () => {
  const t = totalesDelRango([
    fila("a", "2026-09-11", 100, 5, 3, 2),
    fila("b", "2026-09-11", 100, 0, 0, 0),
  ]);
  assert.equal(t.vistas, 200);
  assert.equal(t.llamadas, 5);
  assert.equal(t.whatsapp, 3);
  assert.equal(t.maps, 2);
  assert.equal(t.acciones, 10);
  assert.equal(t.tasaAccion, 5);
});

test("totales: sin vistas no se inventa tasa", () => {
  const t = totalesDelRango([]);
  assert.equal(t.vistas, 0);
  assert.equal(t.tasaAccion, null);
});

test("agregar por negocio: junta los dias de cada uno", () => {
  const agg = agregarPorNegocio([
    conNegocio(fila("a", "2026-09-11", 10, 1), "Churraskeitor"),
    conNegocio(fila("a", "2026-09-12", 5, 0, 0, 2), "Churraskeitor"),
    conNegocio(fila("b", "2026-09-12", 40, 0), "Volantines Juan"),
  ]);
  assert.equal(agg.length, 2);
  const a = agg.find((x) => x.negocio_id === "a");
  assert.equal(a.vistas, 15);
  assert.equal(a.llamadas, 1);
  assert.equal(a.maps, 2);
  assert.equal(a.acciones, 3);
});

test("serie diaria: rellena los dias sin datos y filtra fuera de rango", () => {
  const dias = ["2026-09-11", "2026-09-12", "2026-09-13"];
  const serie = serieDiaria(
    [
      fila("a", "2026-09-11", 10, 2),
      fila("b", "2026-09-11", 5, 0, 1),
      fila("a", "2026-09-13", 7),
      fila("a", "2026-08-01", 999), // fuera del rango: se ignora
    ],
    dias,
  );
  assert.deepEqual(serie.map((s) => s.fecha), dias);
  assert.deepEqual(serie.map((s) => s.vistas), [15, 0, 7]);
  assert.deepEqual(serie.map((s) => s.acciones), [3, 0, 0]);
});

test("orden: por vistas, acciones y nombre", () => {
  const lista = agregarPorNegocio([
    conNegocio(fila("a", "2026-09-11", 10, 5), "Zeta"),
    conNegocio(fila("b", "2026-09-11", 40, 1), "Alfa"),
  ]);
  assert.equal(ordenValido(undefined), "vistas");
  assert.equal(ordenValido("nombre"), "nombre");
  assert.equal(ordenValido("cualquiera"), "vistas");

  assert.deepEqual(ordenarNegocios(lista, "vistas").map((n) => n.nombre), ["Alfa", "Zeta"]);
  assert.deepEqual(ordenarNegocios(lista, "acciones").map((n) => n.nombre), ["Zeta", "Alfa"]);
  assert.deepEqual(ordenarNegocios(lista, "nombre").map((n) => n.nombre), ["Alfa", "Zeta"]);
  // No muta la lista original.
  assert.equal(lista[0].nombre, "Zeta");
});

test("busqueda por nombre: sin tildes ni mayusculas", () => {
  const lista = agregarPorNegocio([
    conNegocio(fila("a", "2026-09-11", 1), "Panaderia La Espiga"),
    conNegocio(fila("b", "2026-09-11", 1), "Volantines Juan"),
  ]);
  assert.equal(filtrarPorNombre(lista, "panaderia").length, 1);
  assert.equal(filtrarPorNombre(lista, "PANADERÍA").length, 1);
  assert.equal(filtrarPorNombre(lista, "   ").length, 2);
  assert.equal(filtrarPorNombre(lista, "ferreteria").length, 0);
});
