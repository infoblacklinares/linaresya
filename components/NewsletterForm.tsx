"use client";

import Link from "next/link";
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
      <div className="flex items-center gap-3 rounded-2xl bg-white/95 border border-white/70 px-5 py-5 shadow-lg">
        <span className="text-lg">✅</span>
        <p className="text-sm font-semibold text-[#3D5A45]">
          ¡Te sumaste! Te avisamos cuando haya novedades.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <input
        ref={inputRef}
        type="email"
        name="email"
        required
        placeholder="tu@email.com"
        className="min-h-[60px] w-full min-w-0 flex-1 rounded-xl border border-[#D7E0E4] bg-white px-5 py-4 text-lg text-[#173A45] outline-none transition placeholder:text-[#718995] focus:border-[#FF5B62] focus:ring-2 focus:ring-[#FF5B62]/30"
      />
      <button
        type="submit"
        disabled={isPending}
        className="min-h-[60px] shrink-0 rounded-xl bg-[#F04455] px-7 py-4 text-lg font-extrabold text-white shadow-md transition hover:bg-[#D93649] disabled:opacity-60 active:scale-[0.98] sm:min-w-[230px]"
      >
        {isPending ? "Enviando…" : "Suscribirme gratis →"}
      </button>
      {state.error && (
        <p className="text-xs text-red-300 px-1">{state.error}</p>
      )}
      <p className="basis-full px-1 text-sm leading-relaxed text-white/70 sm:text-base">
        Sin spam. Solo novedades de Linares. Al suscribirte aceptas nuestra{" "}
        <Link href="/privacidad" className="underline text-white/70 hover:text-white">
          Política de Privacidad
        </Link>
        . Puedes darte de baja cuando quieras desde cualquier correo.
      </p>
    </form>
  );
}
