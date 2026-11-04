"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { suscribirNewsletter, type NewsletterState } from "@/app/newsletter/actions";

const init: NewsletterState = { ok: false };

export default function NewsletterForm() {
  const [state, action, isPending] = useActionState(suscribirNewsletter, init);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok && inputRef.current) inputRef.current.value = "";
  }, [state.ok]);

  if (state.ok) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/95 px-5 py-5 shadow-lg">
        <span className="text-2xl" aria-hidden="true">✅</span>
        <p className="text-base font-bold text-[#245C4A]">
          ¡Te sumaste! Te avisamos cuando haya novedades.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0 sm:rounded-full sm:border-[5px] sm:border-white/90 sm:bg-white sm:p-1">
      <label htmlFor="newsletter-email" className="sr-only">Tu correo electrónico</label>
      <input
        id="newsletter-email"
        ref={inputRef}
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="✉  Tu correo electrónico"
        className="min-h-[62px] w-full min-w-0 rounded-full border border-[#D7E0E4] bg-white px-6 py-4 text-lg font-medium text-[#173A45] outline-none transition placeholder:text-[#718995] focus:border-[#FF5B62] focus:ring-2 focus:ring-[#FF5B62]/30 sm:border-0 sm:focus:ring-0"
      />
      <button
        type="submit"
        disabled={isPending}
        className="min-h-[62px] rounded-full bg-[#FF4D55] px-8 py-4 text-lg font-extrabold text-white shadow-md transition hover:bg-[#E83D49] disabled:cursor-wait disabled:opacity-60 active:scale-[0.98] sm:min-w-[270px]"
      >
        {isPending ? "Enviando…" : "Suscribirme gratis  →"}
      </button>
      {state.error && (
        <p role="alert" className="px-2 text-sm font-semibold text-[#FFE0E0] sm:col-span-2">
          {state.error}
        </p>
      )}
      <p className="px-2 text-sm leading-relaxed text-white/85 sm:col-span-2 sm:px-3 sm:pt-2 sm:text-base">
        <span aria-hidden="true" className="mr-2 text-[#FFC18B]">🔒</span>
        Sin spam. Puedes darte de baja cuando quieras.
        <span className="mx-3 hidden text-white/50 sm:inline">|</span>
        <Link href="/privacidad" className="font-semibold text-white underline decoration-white/70 underline-offset-4 hover:text-white/80">
          Política de Privacidad
        </Link>
      </p>
    </form>
  );
}
