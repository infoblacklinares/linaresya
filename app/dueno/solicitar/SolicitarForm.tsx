"use client";

import { useActionState } from "react";
import {
  solicitarMagicLink,
  type SolicitarState,
} from "./actions";

const estadoInicial: SolicitarState = { ok: false };

export default function SolicitarForm() {
  const [state, formAction, isPending] = useActionState(
    solicitarMagicLink,
    estadoInicial,
  );

  if (state.ok) {
    return (
      <div className="rounded-3xl ue-shadow bg-white p-8 text-center">
        <div className="text-5xl mb-3">{"📧"}</div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Revisa tu email
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Si tu email coincide con un negocio publicado, te llego un link para
          editarlo. El link es valido por 24 horas.
        </p>
        <p className="mt-3 text-[12px] text-muted-foreground">
          Revisa la carpeta de spam si no aparece en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1.5">
          Email del negocio
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          type="email"
          name="email"
          required
          maxLength={120}
          placeholder="el-email-con-que-publicaste@..."
          className="w-full bg-secondary/40 rounded-2xl px-4 py-3 text-sm border border-transparent outline-none focus:border-foreground focus:bg-white"
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Te mandamos un link al email con el que publicaste tu negocio. Solo
          quien tenga acceso al email podra editar.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-foreground text-background text-sm font-semibold px-6 py-4 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Enviando..." : "Enviarme el link"}
      </button>

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        Si no recordas con que email publicaste, escribinos a{" "}
        <a
          href="mailto:infoblack.linares@gmail.com"
          className="font-semibold underline"
        >
          infoblack.linares@gmail.com
        </a>{" "}
        y te ayudamos.
      </p>
    </form>
  );
}
