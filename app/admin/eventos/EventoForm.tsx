"use client";

import { useActionState } from "react";
import { crearEvento, type EventoState } from "./actions";
import PhotoUpload from "@/app/publicar/PhotoUpload";

const init: EventoState = { ok: false };

const EMOJIS = ["🎉", "🎵", "🎪", "🏃", "🍽️", "🎨", "📚", "⚽", "🎭", "🛍️", "🏛️", "🎄"];

export default function EventoForm() {
  const [state, action, isPending] = useActionState(crearEvento, init);

  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white border border-border p-4">
      <div>
        <label className="text-sm font-bold block mb-1.5">Título del evento</label>
        <input
          type="text"
          name="titulo"
          required
          maxLength={100}
          placeholder="Ej: Feria costumbrista de Linares"
          className="input-ue w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-bold block mb-1.5">Emoji</label>
          <select name="emoji" className="input-ue w-full" defaultValue="🎉">
            {EMOJIS.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold block mb-1.5">Destacado</label>
          <label className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5 cursor-pointer">
            <input type="checkbox" name="destacado" className="h-4 w-4 accent-foreground" />
            <span className="text-xs font-medium">Mostrar primero</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-bold block mb-1.5">Lugar</label>
        <input
          type="text"
          name="lugar"
          required
          maxLength={100}
          placeholder="Ej: Plaza de Armas"
          className="input-ue w-full"
        />
      </div>

      <div>
        <label className="text-sm font-bold block mb-1.5">Dirección (opcional)</label>
        <input
          type="text"
          name="direccion"
          maxLength={150}
          placeholder="Ej: Independencia 550, Linares"
          className="input-ue w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-bold block mb-1.5">Inicio</label>
          <input type="datetime-local" name="fecha_inicio" required className="input-ue w-full" />
        </div>
        <div>
          <label className="text-sm font-bold block mb-1.5">Término (opcional)</label>
          <input type="datetime-local" name="fecha_fin" className="input-ue w-full" />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold block mb-1.5">Descripción (opcional)</label>
        <textarea
          name="descripcion"
          rows={3}
          maxLength={400}
          placeholder="De qué se trata, quién organiza, si es gratis…"
          className="input-ue w-full resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-bold block mb-1.5">Link (opcional)</label>
        <input
          type="url"
          name="link"
          maxLength={300}
          placeholder="https://… (entradas, más info, Instagram del evento)"
          className="input-ue w-full"
        />
      </div>

      <div>
        <label className="text-sm font-bold block mb-1.5">Imagen (opcional)</label>
        <PhotoUpload name="imagen" label="" hint="Afiche o foto del evento. Máx 4 MB." />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
          ✅ Evento publicado. Ya aparece en la portada y en /eventos.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-foreground text-background text-sm font-semibold py-3 disabled:opacity-60"
      >
        {isPending ? "Publicando…" : "Publicar evento"}
      </button>
    </form>
  );
}
