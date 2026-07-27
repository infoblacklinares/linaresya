"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

/**
 * Mapa interactivo del negocio con Leaflet + OpenStreetMap.
 * Sin API key, sin costo y sin rastreo de terceros (a diferencia de Google Maps).
 *
 * Leaflet accede a `window` al evaluarse, asi que NO se puede importar arriba
 * (Next lo evaluaria tambien en el servidor -> "window is not defined").
 * Se carga dinamicamente dentro del efecto, que solo corre en el navegador.
 *
 * Los iconos por defecto de Leaflet apuntan a archivos que el bundler no
 * resuelve, asi que usamos un marcador propio hecho con divIcon (HTML/CSS).
 */
export default function MapaNegocio({
  lat,
  lng,
  nombre,
}: {
  lat: number;
  lng: number;
  nombre: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelado || !contenedor.current || mapaRef.current) return;

      const mapa = L.map(contenedor.current, {
        center: [lat, lng],
        zoom: 16,
        scrollWheelZoom: false, // no secuestrar el scroll de la pagina
      });
      mapaRef.current = mapa;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);

      // Marcador propio: pin teal de marca con pulso
      const icono = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px">
            <span style="position:absolute;width:40px;height:40px;border-radius:9999px;background:#2B6E80;opacity:.25"></span>
            <span style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:#2B6E80;color:#fff;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.3);border:3px solid #fff">📍</span>
          </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      L.marker([lat, lng], { icon: icono, title: nombre }).addTo(mapa);

      // Recalcular tamaño cuando el contenedor ya tiene alto definitivo
      setTimeout(() => mapa.invalidateSize(), 100);
    })();

    return () => {
      cancelado = true;
      mapaRef.current?.remove();
      mapaRef.current = null;
    };
  }, [lat, lng, nombre]);

  return (
    <div
      ref={contenedor}
      className="h-64 w-full rounded-3xl overflow-hidden border border-border z-0 bg-[#EAF0EF]"
      aria-label={`Mapa de ${nombre}`}
    />
  );
}
