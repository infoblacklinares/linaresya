"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { distanciaKm, formatoDistancia } from "@/lib/distancia";

export type NegocioMapa = {
  id: string;
  nombre: string;
  url: string;
  lat: number;
  lng: number;
  emoji: string;
  categoriaSlug: string;
  categoriaNombre: string;
  premium: boolean;
  verificado: boolean;
};

type Cat = { slug: string; nombre: string; emoji: string; total: number };

/**
 * Mapa de todos los negocios de Linares (Leaflet + OpenStreetMap).
 * Filtro por categoria y boton para centrar en la ubicacion del usuario.
 * La ubicacion se usa solo en el navegador; nunca se envia al servidor.
 *
 * Leaflet toca `window` al evaluarse: se importa dinamico dentro del efecto.
 */
export default function MapaExplorar({ negocios }: { negocios: NegocioMapa[] }) {
  const contenedor = useRef<HTMLDivElement>(null);
  // Tipos laxos: Leaflet se carga en runtime, no en el bundle del servidor.
  const mapaRef = useRef<any>(null);
  const capaRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const [listo, setListo] = useState(false);
  const [filtro, setFiltro] = useState<string>("");
  const [ubicando, setUbicando] = useState(false);
  const [aviso, setAviso] = useState("");

  const categorias: Cat[] = useMemo(() => {
    const m = new Map<string, Cat>();
    for (const n of negocios) {
      const c = m.get(n.categoriaSlug);
      if (c) c.total++;
      else m.set(n.categoriaSlug, { slug: n.categoriaSlug, nombre: n.categoriaNombre, emoji: n.emoji, total: 1 });
    }
    return [...m.values()].sort((a, b) => b.total - a.total);
  }, [negocios]);

  const visibles = useMemo(
    () => (filtro ? negocios.filter((n) => n.categoriaSlug === filtro) : negocios),
    [negocios, filtro],
  );

  // Crear el mapa una sola vez
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelado || !contenedor.current || mapaRef.current) return;
      LRef.current = L;
      const mapa = L.map(contenedor.current, {
        center: [-35.8465, -71.593], // Plaza de Armas de Linares
        zoom: 14,
        scrollWheelZoom: true,
      });
      mapaRef.current = mapa;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);
      capaRef.current = L.layerGroup().addTo(mapa);
      setTimeout(() => mapa.invalidateSize(), 100);
      setListo(true);
    })();
    return () => {
      cancelado = true;
      mapaRef.current?.remove();
      mapaRef.current = null;
    };
  }, []);

  // Redibujar marcadores al cambiar el filtro
  useEffect(() => {
    const L = LRef.current;
    const mapa = mapaRef.current;
    const capa = capaRef.current;
    if (!listo || !L || !mapa || !capa) return;

    capa.clearLayers();

    for (const n of visibles) {
      const destacado = n.premium;
      const icono = L.divIcon({
        className: "",
        html: `
          <div style="display:flex;align-items:center;justify-content:center;width:${destacado ? 34 : 28}px;height:${destacado ? 34 : 28}px;border-radius:9999px;background:${destacado ? "#F4B860" : "#2B6E80"};color:${destacado ? "#1A1410" : "#fff"};font-size:${destacado ? 15 : 13}px;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${n.emoji}</div>`,
        iconSize: [destacado ? 34 : 28, destacado ? 34 : 28],
        iconAnchor: [destacado ? 17 : 14, destacado ? 17 : 14],
      });
      L.marker([n.lat, n.lng], { icon: icono, title: n.nombre })
        .addTo(capa)
        .bindPopup(
          `<div style="min-width:150px">
             <strong style="font-size:13px">${n.nombre}</strong><br/>
             <span style="font-size:11px;color:#666">${n.emoji} ${n.categoriaNombre}</span>
             ${n.premium ? '<br/><span style="font-size:10px;font-weight:700;color:#8B5E0A">⭐ Premium</span>' : ""}
             ${n.verificado ? '<br/><span style="font-size:10px;font-weight:700;color:#2B6E80">✓ Verificado</span>' : ""}
             <br/><a href="${n.url}" style="font-size:12px;font-weight:700;color:#2B6E80">Ver ficha →</a>
           </div>`,
        );
    }

    // Encuadrar los marcadores visibles
    if (visibles.length > 0) {
      const bounds = L.latLngBounds(visibles.map((n) => [n.lat, n.lng] as [number, number]));
      mapa.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [visibles, listo]);

  function centrarEnMi() {
    if (!("geolocation" in navigator)) {
      setAviso("Tu navegador no permite ubicación.");
      return;
    }
    setUbicando(true);
    setAviso("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicando(false);
        const L = LRef.current;
        const mapa = mapaRef.current;
        if (!L || !mapa) return;
        const yo = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        L.circleMarker([yo.lat, yo.lng], {
          radius: 8,
          color: "#fff",
          weight: 3,
          fillColor: "#C05A46",
          fillOpacity: 1,
        })
          .addTo(mapa)
          .bindPopup("Estás aquí");
        mapa.setView([yo.lat, yo.lng], 16);

        // Contar el negocio mas cercano como referencia util
        let mejor: { n: NegocioMapa; km: number } | null = null;
        for (const n of visibles) {
          const km = distanciaKm(yo, { lat: n.lat, lng: n.lng });
          if (!mejor || km < mejor.km) mejor = { n, km };
        }
        if (mejor) setAviso(`Más cercano: ${mejor.n.nombre} (a ${formatoDistancia(mejor.km)})`);
      },
      (err) => {
        setUbicando(false);
        setAviso(
          err.code === err.PERMISSION_DENIED
            ? "Permiso denegado. Actívalo en el candado de la barra de direcciones."
            : "No pudimos obtener tu ubicación.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtros por categoría */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setFiltro("")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
            filtro === "" ? "bg-[#1A1410] text-white" : "bg-white border border-[#E8E4DE] text-[#1A1410] hover:border-[#2B6E80]/40"
          }`}
        >
          Todos ({negocios.length})
        </button>
        {categorias.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setFiltro(c.slug)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
              filtro === c.slug ? "bg-[#1A1410] text-white" : "bg-white border border-[#E8E4DE] text-[#1A1410] hover:border-[#2B6E80]/40"
            }`}
          >
            {c.emoji} {c.nombre} ({c.total})
          </button>
        ))}
      </div>

      {/* Mapa */}
      <div className="relative">
        <div
          ref={contenedor}
          className="h-[70vh] w-full rounded-3xl overflow-hidden border border-border z-0 bg-[#EAF0EF]"
          aria-label="Mapa de negocios de Linares"
        />
        <button
          type="button"
          onClick={centrarEnMi}
          disabled={ubicando}
          className="absolute right-3 top-3 z-[400] rounded-full bg-white px-4 py-2 text-xs font-bold text-[#1A1410] shadow-lg hover:bg-[#F9F8F6] disabled:opacity-60 transition"
        >
          {ubicando ? "Ubicando…" : "📍 Dónde estoy"}
        </button>
      </div>

      {aviso && <p className="text-xs text-muted-foreground px-1">{aviso}</p>}
      <p className="text-[11px] text-muted-foreground px-1">
        Mostrando {visibles.length} negocios con ubicación. Toca un pin para ver la ficha.
      </p>
    </div>
  );
}
