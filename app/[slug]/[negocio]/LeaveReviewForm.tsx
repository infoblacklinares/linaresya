"use client";

import { useActionState, useState } from "react";
import { dejarResena, type DejarResenaState } from "./actions";

const estadoInicial: DejarResenaState = { ok: false };

export default function LeaveReviewForm({
  negocioId,
  categoriaSlug,
  negocioSlug,
}: {
  negocioId: string;
  categoriaSlug: string;
  negocioSlug: string;
}) {
  const [state, formAction, isPending] = useActionState(
    dejarResena,
    estadoInicial,
  );
  const [calificacion, setCalificacion] = useState<number>(5);
  const [hover, setHover] = useState<number>(0);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
        <div className="text-3xl mb-1">{"✨"}</div>
        <p className="font-bold text-emerald-800 text-sm">
          Gracias por tu resena
        </p>
        <p className="text-[12px] text-emerald-700 mt-1">
          Va a aparecer cuando la revisemos.
        </p>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="rounded-2xl bg-secondary/40 p-4 space-y-3">
      <input type="hidden" name="negocio_id" value={negocioId} />
      <input type="hidden" name="categoria_slug" value={categoriaSlug} />
      <input type="hidden" name="negocio_slug" value={negocioSlug} />
      <input type="hidden" name="calificacion" value={calificacion} />
      {/* Honeypot: campo invisible que solo bots llenan */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute opacity-0 -left-[9999px]"
      />

      <div>
        <label className="block text-xs font-semibold mb-1.5">
          Tu nombre
        </label>
        <input
          type="text"
          name="nombre_autor"
          required
          minLength={2}
          maxLength={60}
          placeholder="Como te llamas"
          className="w-full bg-white rounded-xl px-3 py-2 text-sm border border-border outline-none focus:border-foreground"
        />
        {fe.nombre_autor && (
          <p className="mt-1 text-[11px] text-red-600 font-medium">
            {fe.nombre_autor}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">
          Tu calificacion
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const lleno = (hover || calificacion) >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setCalificacion(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                className="text-2xl transition-transform hover:scale-110 leading-none"
              >
                <span className={lleno ? "text-amber-400" : "text-muted-foreground/30"}>
                  {"★"}
                </span>
              </button>
            );
          })}
          <span className="ml-2 text-[12px] font-medium text-muted-foreground">
            {calificacion} de 5
          </span>
        </div>
        {fe.calificacion && (
          <p className="mt-1 text-[11px] text-red-600 font-medium">
            {fe.calificacion}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">
          Comentario <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <textarea
          name="comentario"
          rows={3}
          maxLength={500}
          placeholder="Que te parecio? Atencion, calidad, lo que quieras contar..."
          className="w-full bg-white rounded-xl px-3 py-2 text-sm border border-border outline-none focus:border-foreground resize-none"
        />
        {fe.comentario && (
          <p className="mt-1 text-[11px] text-red-600 font-medium">
            {fe.comentario}
          </p>
        )}
      </div>

      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-foreground text-background text-sm font-semibold py-3 disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Enviar resena"}
      </button>

      <p className="text-[10px] text-muted-foreground text-center">
        Tu resena va a una cola de moderacion antes de publicarse.
      </p>
    </form>
  );
}
