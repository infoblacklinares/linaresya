/**
 * Segunda pasada de geocodificacion: para las direcciones que Nominatim no
 * encontro tal cual (oficinas, pisos, esquinas, abreviaturas, sector rural).
 *
 * NO inventa coordenadas. Genera variantes REALES de la misma direccion
 * (quitando "Of. 3", "2° piso", expandiendo "Cam." a "Camino", tomando la
 * calle principal de una esquina, etc.) y usa la primera que Nominatim
 * reconozca. Informa el nivel de precision de cada resultado.
 *
 * Uso:
 *   node scripts/geocodificar2.mjs            -> prueba en seco
 *   node scripts/geocodificar2.mjs --escribir -> guarda en la BD
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const ESCRIBIR = process.argv.includes("--escribir");

const LINARES = { lat: -35.846, lng: -71.593 };
const MAX_KM = 25;

function distanciaKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const l1 = (a.lat * Math.PI) / 180;
  const l2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(l1) * Math.cos(l2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** Limpieza base: abreviaturas y ruido que confunde al geocodificador. */
function normalizar(d) {
  return d
    .replace(/\bCam\./gi, "Camino")
    .replace(/\bAv\./gi, "Avenida")
    .replace(/\bNúmero\b/gi, "")
    .replace(/\bN°\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Quita sufijos de unidad: "Of. 3", "local 8", "2° piso", "depto 4". */
function sinUnidad(d) {
  return d
    .replace(/,?\s*(of\.?|oficina|local|depto\.?|departamento|piso)\s*\.?\s*[\w°º]*\s*$/gi, "")
    .replace(/,?\s*\d+\s*[°º]\s*piso\s*$/gi, "")
    .trim()
    .replace(/,$/, "");
}

/** Primera calle de una esquina: "A esq. B", "A con B", "A / B". */
function callePrincipal(d) {
  return d.split(/\s+esq\.?\s+|\s+con\s+|\s*\/\s*/i)[0].trim();
}

/** Quita el numero para geocodificar a nivel de calle (precision menor). */
function soloCalle(d) {
  return d.replace(/\s*\b0*\d+\b\s*$/g, "").trim().replace(/,$/, "");
}

/** Quita ceros a la izquierda del numero: "01231" -> "1231". */
function sinCerosIniciales(d) {
  return d.replace(/\b0+(\d+)\b/g, "$1");
}

/**
 * Variantes a probar, de mas precisa a menos.
 * Cada una es una lectura legitima de la direccion original.
 */
function variantes(direccion) {
  const base = normalizar(direccion);
  const sinU = sinUnidad(base);
  const principal = callePrincipal(sinU);
  const lista = [
    { q: base, nivel: "exacta" },
    { q: sinU, nivel: "exacta" },
    { q: sinCerosIniciales(sinU), nivel: "exacta" },
    { q: principal, nivel: "exacta" },
    { q: sinCerosIniciales(principal), nivel: "exacta" },
    { q: soloCalle(principal), nivel: "calle (aprox)" },
  ];
  // deduplicar conservando orden
  const vistos = new Set();
  return lista.filter((v) => {
    const k = v.q.toLowerCase();
    if (!v.q || v.q.length < 4 || vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

async function consultar(q, ciudad) {
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: `${q}, ${ciudad ?? "Linares"}, Región del Maule, Chile`,
      format: "json",
      limit: "1",
      countrycodes: "cl",
    });
  const res = await fetch(url, {
    headers: {
      "User-Agent": "LinaresYa/1.0 (directorio local; infoblack.linares@gmail.com)",
      "Accept-Language": "es",
    },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const d = await res.json();
  if (!d.length) return null;
  return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
}

const { data: negocios, error } = await supabase
  .from("negocios")
  .select("id, nombre, direccion, ciudad")
  .eq("activo", true)
  .is("lat", null)
  .not("direccion", "is", null)
  .order("nombre");

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(
  `${negocios.length} sin coordenadas.` +
    (ESCRIBIR ? " MODO ESCRITURA.\n" : " Prueba en seco (--escribir para guardar).\n"),
);

let exactas = 0,
  aprox = 0,
  sinSuerte = 0;
const pendientes = [];

for (const [i, n] of negocios.entries()) {
  let resultado = null;
  for (const v of variantes(n.direccion)) {
    try {
      const c = await consultar(v.q, n.ciudad);
      await dormir(1100);
      if (c && distanciaKm(LINARES, c) <= MAX_KM) {
        resultado = { ...c, nivel: v.nivel, usado: v.q };
        break;
      }
    } catch (e) {
      console.log(`   (error consultando "${v.q}": ${e.message})`);
      await dormir(1100);
    }
  }

  const cab = `[${i + 1}/${negocios.length}] ${n.nombre}`;
  if (!resultado) {
    sinSuerte++;
    pendientes.push(`${n.nombre} — "${n.direccion}"`);
    console.log(`${cab}\n   SIN RESULTADO — "${n.direccion}"`);
    continue;
  }

  if (resultado.nivel === "exacta") exactas++;
  else aprox++;

  console.log(
    `${cab}\n   ${resultado.nivel.toUpperCase()} via "${resultado.usado}" -> ${resultado.lat.toFixed(5)}, ${resultado.lng.toFixed(5)}`,
  );

  if (ESCRIBIR) {
    const { error: upErr } = await supabase
      .from("negocios")
      .update({ lat: resultado.lat, lng: resultado.lng })
      .eq("id", n.id);
    if (upErr) console.log(`   ERROR guardando: ${upErr.message}`);
  }
}

console.log("\n─────────────");
console.log(`Exactas: ${exactas}   Aprox (nivel calle): ${aprox}   Sin resultado: ${sinSuerte}`);
if (pendientes.length) {
  console.log("\nQuedan sin ubicar (poner a mano en /admin):");
  pendientes.forEach((p) => console.log(" -", p));
}
if (!ESCRIBIR) console.log("\nPrueba en seco: no se guardó nada.");
