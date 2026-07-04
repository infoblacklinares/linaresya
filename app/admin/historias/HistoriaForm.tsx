"use client";

import { useActionState } from "react";
import { crearHistoria, type HistoriaState } from "./actions";
import PhotoUpload from "@/app/publicar/PhotoUpload";

const init: HistoriaState = { ok: false };

export default function HistoriaForm({
  premium,
}: {
  premium: { id: string; nombre: string; plan?: string }[];
}) {
  const [state, action, isPending] = useActionState(crearHistoria, init);

  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white border border-border p-4">
      <div>
        <label className="text-sm font-bold block mb-1.5">Negocio</label>
        <select name="negocio_id" required className="input-ue w-full">
          <option value="">Elige un negocio…</option>
          {premium.map(n => (
            <option key={n.id} value={n.id}>
              {n.plan === "premium" ? "⭐ " : ""}{n.nombre}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Como admin puedes publicar para cualquier negocio activo (⭐ = premium).
        </p>
      </div>

      <div>
        <label className="text-sm font-bold block mb-1.5">Imagen de la historia</label>
        <PhotoUpload name="imagen" label="" hint="Vertical recomendada (9:16). Máx 4 MB." />
      </div>

      <div>
        <label className="text-sm font-bold block mb-1.5">Texto (opcional, máx 120)</label>
        <input
          type="text"
          name="texto"
          maxLength={120}
          placeholder="Ej: ¡2x1 en pizzas solo hoy! 🍕"
          className="input-ue w-full"
        />
      </div>

      <div>
        <label className="text-sm font-bold block mb-1.5">Duración</label>
        <select name="horas" className="input-ue w-full" defaultValue="24">
          <option value="24">24 horas</option>
          <option value="48">48 horas</option>
          <option value="72">72 horas</option>
        </select>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
          ✅ Historia publicada. Ya aparece en la portada.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-foreground text-background text-sm font-semibold py-3 disabled:opacity-60"
      >
        {isPending ? "Publicando…" : "Publicar historia"}
      </button>
    </form>
  );
}
