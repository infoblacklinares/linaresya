"use client";

import { useState, useTransition } from "react";
import { generarLinkDuenoManual, type GenerarLinkResult } from "./actions";

export default function GenerarLinkDueno({ negocioId }: { negocioId: string }) {
  const [pending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<GenerarLinkResult | null>(null);
  const [copiado, setCopiado] = useState(false);

  function handleGenerar() {
    startTransition(async () => {
      const r = await generarLinkDuenoManual(negocioId);
      setResultado(r);
      setCopiado(false);
    });
  }

  async function copiar() {
    if (!resultado?.url) return;
    try {
      await navigator.clipboard.writeText(resultado.url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      window.prompt("Copia este link manualmente:", resultado.url);
    }
  }

  function abrirWhatsApp() {
    if (!resultado?.url) return;
    const text = encodeURIComponent(
      `Hola! Te paso el link para editar tu negocio en LinaresYa: ${resultado.url}\n\nEs valido por 72 horas.`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Magic link para el dueno
      </h2>

      {!resultado && (
        <>
          <p className="text-[12px] text-muted-foreground">
            Genera un link que el dueno puede usar para editar este negocio sin
            necesidad de pedir uno por email. Util si el email rebota o si
            necesitas mandarlo por WhatsApp.
          </p>
          <button
            type="button"
            onClick={handleGenerar}
            disabled={pending}
            className="w-full sm:w-auto rounded-full bg-secondary text-foreground text-sm font-semibold px-5 py-2.5 hover:bg-secondary/80 disabled:opacity-50 transition"
          >
            {pending ? "Generando..." : "Generar link manual"}
          </button>
        </>
      )}

      {resultado && resultado.ok && resultado.url && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">
          <p className="text-[12px] font-semibold text-emerald-800">
            Link generado. Valido por 72 horas.
          </p>
          <div className="bg-white rounded-xl p-3 text-[12px] font-mono break-all text-foreground/80">
            {resultado.url}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copiar}
              className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2"
            >
              {copiado ? "Copiado ✓" : "Copiar link"}
            </button>
            <button
              type="button"
              onClick={abrirWhatsApp}
              className="rounded-full bg-emerald-600 text-white text-xs font-semibold px-4 py-2"
            >
              Compartir por WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setResultado(null)}
              className="rounded-full bg-secondary text-foreground text-xs font-semibold px-4 py-2"
            >
              Generar otro
            </button>
          </div>
        </div>
      )}

      {resultado && !resultado.ok && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {resultado.error ?? "Error desconocido"}
        </div>
      )}
    </section>
  );
}
