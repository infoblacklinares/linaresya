"use client";

import { useActionState, useState } from "react";
import { reportarNegocio, type ReportarState } from "./actions";

const estadoInicial: ReportarState = { ok: false };

const MOTIVOS = [
  { value: "info_incorrecta", label: "Info incorrecta (telefono, direccion, etc)" },
  { value: "duplicado", label: "Esta duplicado en LinaresYa" },
  { value: "cerrado_definitivo", label: "Cerro definitivamente" },
  { value: "no_existe", label: "Este negocio no existe" },
  { value: "spam_o_falso", label: "Es spam o informacion falsa" },
  { value: "contenido_inapropiado", label: "Contenido inapropiado" },
  { value: "otro", label: "Otro" },
];

export default function ReportarButton({ negocioId }: { negocioId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    reportarNegocio,
    estadoInicial,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-muted-foreground hover:text-rose-700 underline transition"
      >
        Reportar este negocio
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Cerrar"
          />

          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl ue-shadow overflow-hidden max-h-[90vh] flex flex-col">
            <header className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">
                  Reportar negocio
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Lo revisamos en las proximas horas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-muted"
                aria-label="Cerrar"
              >
                {"×"}
              </button>
            </header>

            {state.ok ? (
              <div className="p-6 text-center">
                <div className="text-4xl mb-2">{"📨"}</div>
                <p className="font-bold">Gracias por avisarnos</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Vamos a revisarlo y tomar accion si corresponde.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold px-5 py-2.5"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form action={formAction} className="p-5 space-y-4 overflow-y-auto">
                <input type="hidden" name="negocio_id" value={negocioId} />
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute opacity-0 -left-[9999px]"
                />

                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Motivo<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    name="motivo"
                    required
                    defaultValue=""
                    className="w-full bg-secondary/40 rounded-2xl px-4 py-3 text-sm border border-transparent outline-none focus:border-foreground focus:bg-white"
                  >
                    <option value="" disabled>
                      Elige una opcion
                    </option>
                    {MOTIVOS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Detalles{" "}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    name="descripcion"
                    rows={3}
                    maxLength={500}
                    placeholder="Si quieres, contanos mas detalles..."
                    className="w-full bg-secondary/40 rounded-2xl px-4 py-3 text-sm border border-transparent outline-none focus:border-foreground focus:bg-white resize-none"
                  />
                </div>

                {state.error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
                    {state.error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-full bg-foreground text-background text-sm font-semibold py-3 disabled:opacity-60"
                >
                  {isPending ? "Enviando..." : "Enviar reporte"}
                </button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Solo aceptamos reportes de buena fe. Spam o reportes falsos
                  pueden resultar en bloqueo de tu IP.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
