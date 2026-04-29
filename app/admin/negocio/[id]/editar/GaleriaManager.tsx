"use client";

import { useState } from "react";

type FotoGaleria = {
  id: number;
  url: string;
  orden: number;
};

// Manager visual para fotos existentes. Permite "marcar para eliminar" cada
// foto sin borrar nada al instante: la decision se efectua cuando el usuario
// guarda el form (en updateNegocio se procesan los foto_eliminar_<id>=on).
export default function GaleriaManager({
  fotos,
}: {
  fotos: FotoGaleria[];
}) {
  // Map de id -> "se va a eliminar" para feedback visual.
  const [paraEliminar, setParaEliminar] = useState<Record<number, boolean>>({});

  if (fotos.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground italic">
        Este negocio no tiene fotos en galeria. Podes subir nuevas abajo.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {fotos.map((f) => {
        const eliminada = !!paraEliminar[f.id];
        return (
          <div
            key={f.id}
            className={`relative rounded-xl overflow-hidden border bg-secondary/40 transition ${
              eliminada
                ? "border-rose-500 opacity-50"
                : "border-border"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.url}
              alt="Foto galeria"
              className="w-full h-28 object-cover"
            />
            {/* Hidden checkbox que viaja al server. Lo controlamos via state. */}
            <input
              type="checkbox"
              name={`foto_eliminar_${f.id}`}
              checked={eliminada}
              onChange={(e) =>
                setParaEliminar((prev) => ({
                  ...prev,
                  [f.id]: e.target.checked,
                }))
              }
              className="sr-only"
              id={`foto_eliminar_input_${f.id}`}
            />
            <label
              htmlFor={`foto_eliminar_input_${f.id}`}
              className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/70 text-white text-sm flex items-center justify-center hover:bg-rose-600 cursor-pointer transition"
              aria-label={eliminada ? "Cancelar eliminacion" : "Eliminar"}
            >
              {eliminada ? "↺" : "×"}
            </label>
            {eliminada && (
              <div className="absolute bottom-1 left-1 right-1 rounded bg-rose-500 text-white text-[10px] font-bold py-0.5 text-center">
                Se eliminara al guardar
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
