"use client";

import { useFormStatus } from "react-dom";
import { verificarNegocio } from "../actions";

function VerificarButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-emerald-600 text-white text-xs font-bold px-4 py-2 disabled:opacity-50"
    >
      {pending ? "Verificando…" : "Marcar verificado"}
    </button>
  );
}

export default function VerificarButtonClient() {
  return <VerificarButton />;
}
