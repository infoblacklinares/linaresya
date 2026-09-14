"use client";

import { useActionState } from "react";
import { guardarResultadoDueno } from "./actions";

/**
 * El formulario que llena el negocio (LY-028).
 *
 * Dos campos y nada mas. Cada pregunta de mas es gente que abandona, y esta
 * pantalla la abre alguien que esta trabajando, desde el telefono, porque le
 * llego un correo. Si no sabe un numero, deja el campo vacio: vacio significa
 * "no sé", que no es lo mismo que cero, y el panel los distingue.
 */
export default function FormResultados({
  token,
  periodo,
  periodoLegible,
  contactosMedidos,
  inicial,
}: {
  token: string;
  periodo: string;
  periodoLegible: string;
  contactosMedidos: number;
  inicial: { consultas: number | null; clientes: number | null; nota: string | null };
}) {
  const [estado, accion, enviando] = useActionState(guardarResultadoDueno, null);

  return (
    <form action={accion} className="mt-5 space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="periodo" value={periodo} />

      <label className="block">
        <span className="block text-sm font-bold">
          En {periodoLegible}, ¿cuántas personas te contactaron por LinaresYa?
        </span>
        {contactosMedidos > 0 && (
          <span className="block text-xs text-muted-foreground">
            Nosotros registramos {contactosMedidos}{" "}
            {contactosMedidos === 1 ? "persona que tocó" : "personas que tocaron"} tus
            botones de contacto. Cuéntanos cuántas te llegaron de verdad.
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          name="consultas"
          defaultValue={inicial.consultas === null ? "" : String(inicial.consultas)}
          placeholder="Si no sabes, déjalo vacío"
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-bold">
          ¿Cuántas de esas terminaron comprando?
        </span>
        <input
          type="text"
          inputMode="numeric"
          name="clientes"
          defaultValue={inicial.clientes === null ? "" : String(inicial.clientes)}
          placeholder="Si no sabes, déjalo vacío"
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-bold">¿Algo que quieras contarnos?</span>
        <textarea
          name="nota"
          rows={3}
          maxLength={500}
          defaultValue={inicial.nota ?? ""}
          placeholder="Opcional"
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base"
        />
      </label>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-[#2B6E80] px-4 py-3 text-base font-bold text-white hover:opacity-90 disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar"}
      </button>

      {estado && (
        <p
          className={`text-sm font-semibold ${
            estado.ok ? "text-[#2B6E80]" : "text-[#C05A46]"
          }`}
        >
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
