"use client";

import { useState } from "react";
import { activarPremium } from "./actions";

export default function ConfirmPremiumButton({ negocioId, compact = false }: { negocioId: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "px-1 text-[11px] font-semibold text-amber-700 hover:underline"
            : "rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
        }
      >
        {compact ? "⭐ Premium" : "Elegir modalidad"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-extrabold">Activar Premium</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Confirma que ya verificaste el comprobante antes de activar el plan.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-lg leading-none text-muted-foreground" aria-label="Cerrar">×</button>
            </div>

            <div className="mt-4 grid gap-2">
              <form action={activarPremium}>
                <input type="hidden" name="id" value={negocioId} />
                <input type="hidden" name="duracion" value="30" />
                <button type="submit" className="w-full rounded-xl bg-amber-500 px-4 py-3 text-left text-xs font-bold text-white hover:bg-amber-600">
                  ⭐ Activar 30 días
                  <span className="mt-0.5 block text-[10px] font-medium opacity-90">Para contratación mensual</span>
                </button>
              </form>

              <form action={activarPremium}>
                <input type="hidden" name="id" value={negocioId} />
                <input type="hidden" name="duracion" value="365" />
                <button type="submit" className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left text-xs font-bold text-amber-950 hover:bg-amber-100">
                  Activar 1 año
                  <span className="mt-0.5 block text-[10px] font-medium text-amber-900/70">Para contratación anual</span>
                </button>
              </form>
            </div>

            <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
