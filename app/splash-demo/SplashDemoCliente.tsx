"use client";

import { useState } from "react";
import SplashAnimado from "@/components/SplashAnimado";

const FONDOS = ["#eae9e4", "#ffffff", "#efe8de", "#1f2a33"];

export default function SplashDemoCliente() {
  const [bg, setBg] = useState(FONDOS[0]);
  const [clave, setClave] = useState(0); // remontar para repetir la animación
  const [terminado, setTerminado] = useState(false);

  function repetir() {
    setTerminado(false);
    setClave((k) => k + 1);
  }

  return (
    <div>
      {/* Escenario en proporción de teléfono */}
      <div className="relative mx-auto w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden border border-[#E8E4DE] shadow-[0_6px_28px_rgba(0,0,0,0.12)]">
        <SplashAnimado key={clave} bg={bg} onFin={() => setTerminado(true)} />
      </div>

      {/* Controles */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={repetir}
          className="rounded-full bg-[#1A1410] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2B6E80] active:scale-95"
        >
          ↻ Repetir animación
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B5E57]">Fondo:</span>
          {FONDOS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setBg(c)}
              aria-label={`Fondo ${c}`}
              className={`h-8 w-8 rounded-full border-2 transition ${
                bg === c ? "border-[#2B6E80] scale-110" : "border-[#E8E4DE]"
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-[#8E8279]">
        {terminado ? "Animación terminada" : "Reproduciendo…"}
      </p>
    </div>
  );
}
