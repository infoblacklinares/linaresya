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
      <input
        ref={inputRef}
        type="email"
        name="email"
        required
        placeholder="tu@email.com"
        className="w-full rounded-xl bg-white/90 border border-white/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/40 transition placeholder:text-[#8E8279]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-white text-[#2B6E80] text-sm font-extrabold py-3 hover:bg-white/90 disabled:opacity-60 transition active:scale-[0.98]"
      >
        {isPending ? "Enviando…" : "Suscribirme gratis →"}
      </button>
      {state.error && (
        <p className="text-xs text-red-300 px-1">{state.error}</p>
      )}
      <p className="text-[11px] text-white/50 px-1">
        Sin spam. Solo novedades de Linares. Al suscribirte aceptas nuestra{" "}
        <a href="/privacidad" className="underline text-white/70 hover:text-white">
          Política de Privacidad
        </a>
        . Puedes darte de baja cuando quieras desde cualquier correo.
      </p>
    </form>
  );
}
