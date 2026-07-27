"use client";

import { useEffect, useState } from "react";
import { distanciaKm, formatoDistancia } from "@/lib/distancia";

/**
 * Boton "Cerca de mi": pide la ubicacion al navegador y reordena los
 * resultados por distancia, escribiendo el badge de distancia en cada card.
 *
 * PRIVACIDAD: la ubicacion se usa solo en el navegador. No se envia a
 * ningun servidor ni se guarda. Al recargar, se pierde.
 *
 * Cada card debe tener data-lat / data-lng y un slot [data-distancia].
 */
export default function CercaDeMi({ contenedorId }: { contenedorId: string }) {
  const [estado, setEstado] = useState<"idle" | "cargando" | "activo" | "error">("idle");
  const [mensaje, setMensaje] = useState<string>("");

  // Al desactivar, restaurar el orden original guardado en data-orden
  useEffect(() => {
    if (estado !== "idle") return;
    const cont = document.getElementById(contenedorId);
    if (!cont) return;
    const cards = [...cont.querySelectorAll<HTMLElement>("[data-lat]")];
    if (!cards.length) return;
    cards
      .slice()
      .sort((a, b) => Number(a.dataset.orden ?? 0) - Number(b.dataset.orden ?? 0))
      .forEach((c) => {
        cont.appendChild(c);
        const slot = c.querySelector<HTMLElement>("[data-distancia]");
        if (slot) { slot.textContent = ""; slot.classList.add("hidden"); }
      });
  }, [estado, contenedorId]);

  function activar() {
    if (!("geolocation" in navigator)) {
      setEstado("error");
      setMensaje("Tu navegador no permite ubicación.");
      return;
    }
    setEstado("cargando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const yo = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const cont = document.getElementById(contenedorId);
        if (!cont) return;
        const cards = [...cont.querySelectorAll<HTMLElement>("[data-lat]")];

        // Guardar el orden original la primera vez
        cards.forEach((c, i) => {
          if (c.dataset.orden === undefined) c.dataset.orden = String(i);
        });

        const conDistancia = cards.map((c) => {
          const lat = parseFloat(c.dataset.lat ?? "");
          const lng = parseFloat(c.dataset.lng ?? "");
          const km = Number.isFinite(lat) && Number.isFinite(lng)
            ? distanciaKm(yo, { lat, lng })
            : Infinity;
          return { el: c, km };
        });

        // Ordenar por distancia; los que no tienen coordenadas quedan al final
        conDistancia.sort((a, b) => a.km - b.km);
        conDistancia.forEach(({ el, km }) => {
          cont.appendChild(el);
          const slot = el.querySelector<HTMLElement>("[data-distancia]");
          if (slot) {
            if (Number.isFinite(km)) {
              slot.textContent = `📍 a ${formatoDistancia(km)}`;
              slot.classList.remove("hidden");
            } else {
              slot.textContent = "";
              slot.classList.add("hidden");
            }
          }
        });

        const conCoord = conDistancia.filter((x) => Number.isFinite(x.km)).length;
        setEstado("activo");
        setMensaje(`${conCoord} negocios ordenados por cercanía`);
      },
      (err) => {
        setEstado("error");
        setMensaje(
          err.code === err.PERMISSION_DENIED
            ? "Permiso denegado. Actívalo en el candado de la barra de direcciones."
            : "No pudimos obtener tu ubicación.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => (estado === "activo" ? setEstado("idle") : activar())}
        disabled={estado === "cargando"}
        className={`rounded-full text-xs font-semibold px-3 py-1.5 transition disabled:opacity-60 ${
          estado === "activo"
            ? "bg-[#2B6E80] text-white"
            : "bg-secondary text-foreground hover:bg-muted"
        }`}
      >
        {estado === "cargando" ? "Ubicando…" : estado === "activo" ? "📍 Cerca de mí ✓" : "📍 Cerca de mí"}
      </button>
      {mensaje && (
        <span className={`text-[10px] px-1 ${estado === "error" ? "text-rose-600" : "text-muted-foreground"}`}>
          {mensaje}
        </span>
      )}
    </div>
  );
}
