"use client";

import { useActionState, useEffect, useRef } from "react";
import { suscribirNewsletter, type NewsletterState } from "@/app/newsletter/actions";

const init: NewsletterState = { ok: false };

export default function NewsletterForm() {
  const [state, action, isPending] = useActionState(suscribirNewsletter, init);
  const inputRef = useRef<HTMLInputElement>(null);

  // Limpiar el input al suscribirse con éxito
  useEffect(() => {
    if (state.ok && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [state.ok]);

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-[#3D5A45]/10 border border-[#3D5A45]/20 px-4 py-3">
        <span className="text-lg">✅</span>
        <p className="text-sm font-semibold text-[#3D5A45]">
          ¡Te sumaste! Te avisamos cuando haya novedades.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          className="flex-1 rounded-full bg-white/90 border border-[#E8E4DE] px-4 py-2.5 text-sm outline-none focus:border-[#2B6E80] transition placeholder:text-[#8E8279]"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-full bg-[#2B6E80] text-white text-sm font-bold px-5 py-2.5 hover:bg-[#1f5268] disabled:opacity-60 transition"
        >
          {isPending ? "..." : "Suscribirse"}
        </button>
      </div>
      {state.error && (
        <p className="text-xs text-red-600 px-1">{state.error}</p>
      )}
      <p className="text-[11px] text-[#8E8279] px-1">
        Sin spam. Solo novedades de Linares. Podés darte de baja cuando quieras.
      </p>
    </form>
  );
}
