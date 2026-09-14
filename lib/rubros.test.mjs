// Tests de lib/rubros.ts (LY-034). Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RUBROS,
  MINIMO_NEGOCIOS,
  rubroPorSlug,
  merecePagina,
  rubrosRelacionados,
} from "./rubros.ts";

test("el catalogo esta sano", () => {
  const slugs = RUBROS.map((r) => r.slug);
  assert.equal(new Set(slugs).size, slugs.length, "hay slugs repetidos");
  for (const r of RUBROS) {
    // El slug va en la URL: si trae mayusculas, acentos o espacios, el link se rompe.
    assert.match(r.slug, /^[a-z0-9-]+$/, r.slug);
    assert.ok(r.titulo.includes("Linares"), `${r.slug}: el titulo tiene que decir Linares`);
    assert.ok(r.consulta.trim().length > 0, r.slug);
    assert.ok(r.descripcion.trim().length > 0, r.slug);
    // Un termino repetido en la consulta no suma y delata un copiar-pegar.
    const terminos = r.consulta.split(/\s+OR\s+/).map((t) => t.trim().toLowerCase());
    assert.equal(new Set(terminos).size, terminos.length, `${r.slug}: termino repetido`);
  }
});

test("rubroPorSlug encuentra o devuelve null", () => {
  assert.equal(rubroPorSlug("restaurantes")?.titulo, "Restaurantes en Linares");
  assert.equal(rubroPorSlug("no-existe"), null);
  assert.equal(rubroPorSlug(""), null);
});

test("una pagina con uno o dos negocios no se publica", () => {
  assert.equal(merecePagina(0), false);
  assert.equal(merecePagina(1), false);
  assert.equal(merecePagina(2), false);
  assert.equal(merecePagina(MINIMO_NEGOCIOS), true);
  assert.equal(merecePagina(30), true);
});

test("los relacionados enlazan a otros rubros, sin repetirse ni apuntarse a si mismo", () => {
  for (const r of RUBROS) {
    const rel = rubrosRelacionados(r.slug, 4);
    assert.equal(rel.length, 4, r.slug);
    assert.ok(!rel.some((x) => x.slug === r.slug), `${r.slug} se enlaza a si mismo`);
    assert.equal(new Set(rel.map((x) => x.slug)).size, 4, `${r.slug}: relacionados repetidos`);
  }
});

test("el ultimo rubro enlaza al primero: nadie queda sin enlaces entrantes", () => {
  const ultimo = RUBROS[RUBROS.length - 1];
  const rel = rubrosRelacionados(ultimo.slug, 2).map((r) => r.slug);
  assert.deepEqual(rel, [RUBROS[0].slug, RUBROS[1].slug]);
  // Un slug desconocido no revienta.
  assert.equal(rubrosRelacionados("no-existe", 3).length, 3);
});
