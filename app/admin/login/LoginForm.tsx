"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const estadoInicial: LoginState = {};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, estadoInicial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1.5">Password de administrador</label>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Ingresa el password"
          className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm outline-none border border-transparent focus:border-foreground focus:bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-foreground text-background text-sm font-semibold px-6 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
