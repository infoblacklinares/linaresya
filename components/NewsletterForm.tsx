"use client";

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
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/40 bg-emerald-400/15 px-5 py-4 text-white" role="status">
        <span className="text-2xl" aria-hidden="true">✓</span>
        <p className="text-base font-bold sm:text-lg">¡Ya estás suscrito! Te avisaremos cuando haya novedades.</p>
      </div>
    );
  }

  return (
    <form action={action} className="w-full">
      <div className="flex w-full flex-col gap-3 rounded-[1.6rem] bg-white p-2 shadow-xl sm:flex-row sm:items-center sm:gap-2">
        <label htmlFor="newsletter-email" className="sr-only">Tu correo electrónico</label>
        <input
          ref={inputRef}
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Tu correo electrónico"
          className="min-h-14 min-w-0 flex-1 rounded-2xl border-0 bg-white px-5 text-lg font-medium text-[#173b45] outline-none placeholder:text-[#71838a] focus:ring-2 focus:ring-[#2B6E80] sm:min-h-16 sm:px-6 sm:text-xl"
        />
        <button
          type="submit"
          disabled={isPending}
          className="min-h-14 shrink-0 rounded-2xl bg-[#ff4f57] px-7 py-4 text-lg font-extrabold text-white shadow-md transition hover:bg-[#ed3f49] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60 active:scale-[0.99] sm:min-h-16 sm:px-9 sm:text-xl"
        >
          {isPending ? "Enviando…" : "Suscribirme gratis →"}
        </button>
      </div>
      {state.error && <p className="mt-3 rounded-xl bg-red-950/40 px-4 py-3 text-base font-semibold text-red-100" role="alert">{state.error}</p>}
    </form>
  );
}
