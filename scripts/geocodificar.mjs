/**
 * Geocodifica los negocios que tienen direccion pero no lat/lng.
 * Usa Nominatim (OpenStreetMap): gratis, sin API key.
 *
 * Politica de uso de Nominatim: maximo 1 consulta por segundo y User-Agent
 * identificable. Este script respeta ambas.
 *
 * Uso:
 *   node scripts/geocodificar.mjs           -> prueba en seco (no escribe)
 *   node scripts/geocodificar.mjs --escribir -> guarda lat/lng en la BD
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Cargar .env.local a mano (el script corre fuera de Next)
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

const ESCRIBIR = process.argv.includes("--escribir");

// Caja delimitadora de la comuna de Linares (aprox). Sirve para dos cosas:
// 1) sesgar la busqueda a la zona correcta
// 2) descartar resultados que caigan lejos (geocodificacion equivocada)
const LINARES = { lat: -35.846, lng: -71.593 };
const MAX_KM = 25; // si el resultado cae mas lejos, se marca como dudoso

function distanciaKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocodificar(direccion, ciudad) {
  const q = `${direccion}, ${ciudad ?? "Linares"}, Región del Maule, Chile`;
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q,
      format: "json",
      limit: "1",
      countrycodes: "cl",
      addressdetails: "0",
    });

  const res = await fetch(url, {
    headers: {
      "User-Agent": "LinaresYa/1.0 (directorio local; infoblack.linares@gmail.com)",
      "Accept-Language": "es",
    },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

const { data: negocios, error } = await supabase
  .from("negocios")
  .select("id, nombre, direccion, ciudad")
  .eq("activo", true)
  .is("lat", null)
  .not("direccion", "is", null)
  .order("nombre");

if (error) {
  console.error("Error leyendo negocios:", error.message);
  process.exit(1);
}

console.log(
  `${negocios.length} negocios sin coordenadas.` +
    (ESCRIBIR ? " MODO ESCRITURA." : " Prueba en seco (usa --escribir para guardar)."),
);
console.log("");

let ok = 0,
  dudosos = 0,
  fallidos = 0;

for (const [i, n] of negocios.entries()) {
  const prefijo = `[${i + 1}/${negocios.length}] ${n.nombre}`;
  try {
    const coord = await geocodificar(n.direccion, n.ciudad);
    if (!coord) {
      fallidos++;
      console.log(`${prefijo}\n   SIN RESULTADO — "${n.direccion}"`);
    } else {
      const km = distanciaKm(LINARES, coord);
      if (km > MAX_KM) {
        dudosos++;
        console.log(
          `${prefijo}\n   DUDOSO (${km.toFixed(1)} km del centro) — "${n.direccion}" — no se guarda`,
        );
      } else {
        ok++;
        console.log(
          `${prefijo}\n   OK ${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)} (${km.toFixed(1)} km)`,
        );
        if (ESCRIBIR) {
          const { error: upErr } = await supabase
            .from("negocios")
            .update({ lat: coord.lat, lng: coord.lng })
            .eq("id", n.id);
          if (upErr) console.log(`   ERROR guardando: ${upErr.message}`);
        }
      }
    }
  } catch (e) {
    fallidos++;
    console.log(`${prefijo}\n   ERROR: ${e.message}`);
  }
  await dormir(1100); // respetar limite de 1 req/seg de Nominatim
}

console.log("\n─────────────");
console.log(`OK: ${ok}   Dudosos: ${dudosos}   Fallidos: ${fallidos}`);
if (!ESCRIBIR) console.log("Prueba en seco: no se guardó nada. Repite con --escribir.");
