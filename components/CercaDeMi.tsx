"use client";

import { useState } from "react";

type CercaDeMiResult = {
  negocioId: string;
  distanciaKm: number;
};

type CercaDeMiProps = {
  onResultados: (resultados: CercaDeMiResult[]) => void;
  activo: boolean;
};

export default function CercaDeMi({ onResultados, activo }: CercaDeMiProps) {
  const [estado, setEstado] = useState<"idle" | "cargando" | "activo" | "error">(
    activo ? "activo" : "idle",
  );
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setEstado(activo ? "activo" : "idle");
    if (!activo) setMensaje("");
  }, [activo]);

  function desactivar() {
    setEstado("idle");
    setMensaje("");
    onResultados([]);
  }

  function activar() {
    if (!("geolocation" in navigator)) {
      setEstado("error");
      setMensaje("Tu navegador no permite ubicación.");
      return;
    }

    setEstado("cargando");
    setMensaje("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const response = await fetch("/api/cerca-de-mi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              limite: 50,
            }),
          });

          const data = (await response.json()) as {
            negocios?: CercaDeMiResult[];
            error?: string;
          };

          if (!response.ok) {
            throw new Error(data.error || "No pudimos buscar negocios cerca de ti.");
          }

          const resultados = Array.isArray(data.negocios) ? data.negocios : [];

          if (resultados.length === 0) {
            setEstado("error");
            setMensaje(
              "No encontramos negocios cerca de ti. Puedes buscar por nombre o categoría.",
            );
            onResultados([]);
            return;
          }

          setEstado("activo");
          setMensaje(
            resultados.length === 1
              ? "1 negocio encontrado cerca de ti"
              : `${resultados.length} negocios encontrados cerca de ti`,
          );
          onResultados(resultados);
        } catch {
          setEstado("error");
          setMensaje("No pudimos buscar negocios cerca de ti.");
          onResultados([]);
        }
      },
      (err) => {
        setEstado("error");
        setMensaje(
          err.code === err.PERMISSION_DENIED
            ? "Permiso denegado. Actívalo en el candado de la barra de direcciones."
            : "No pudimos obtener tu ubicación.",
        );
        onResultados([]);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => (estado === "activo" ? desactivar() : activar())}
        disabled={estado === "cargando"}
        className={`rounded-full text-xs font-semibold px-3 py-1.5 transition disabled:opacity-60 ${
          estado === "activo"
            ? "bg-[#2B6E80] text-white"
            : "bg-secondary text-foreground hover:bg-muted"
        }`}
      >
        {estado === "cargando"
          ? "Ubicando…"
          : estado === "activo"
            ? "📍 Cerca de mí ✓"
            : "📍 Cerca de mí"}
      </button>
      {mensaje && (
        <span
          className={`text-[10px] px-1 ${
            estado === "error" ? "text-rose-600" : "text-muted-foreground"
          }`}
        >
          {mensaje}
        </span>
      )}
    </div>
  );
}
