"use client";

import Link from "next/link";
import { useActionState } from "react";
import { aprobarPorLink, type AprobarPorLinkState } from "./actions";

const estadoInicial: AprobarPorLinkState = { ok: false };

export default function AprobarForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    aprobarPorLink,
    estadoInicial,
  );

  if (state.ok) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5">
        <p className="text-2xl">{"\u{2705}"}</p>
        <p className="mt-1 text-sm font-bold text-emerald-900">
          Aprobado. Ya está publicado.
        </p>
        <p className="mt-1 text-[12px] text-emerald-800">
          Si el negocio dejó correo, le avisamos con su link para editar la ficha.
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-flex rounded-full bg-[#1A1410] px-5 py-2.5 text-xs font-bold text-white"
        >
          Ir al panel
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />
      {state.error && (
        <p className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[#1A1410] px-6 py-4 text-base font-bold text-white transition hover:bg-[#2B6E80] disabled:opacity-40"
      >
        {pending ? "Aprobando…" : "Aprobar y publicar"}
      </button>
    </form>
  );
}
