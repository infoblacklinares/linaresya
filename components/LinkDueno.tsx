"use client";

import { useState } from "react";

/**
 * Link de edicion que se le entrega al dueño apenas publica.
 *
 * Existe para que completar la ficha no dependa del admin: sin esto, las
 * fotos y los horarios de cada negocio nuevo salen de que alguien genere el
 * link a mano y se lo mande. Con el link en pantalla, el dueño lo hace solo,
 * incluso mientras la ficha espera revision.
 */
export default function LinkDueno({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Sin permiso de portapapeles: el link igual esta a la vista y
      // seleccionable, asi que no hace falta avisar nada.
    }
  };

  const mensaje = `Completá la ficha de tu negocio en LinaresYa: ${url}`;

  return (
    <div className="mt-6 rounded-2xl border border-[#2B6E80]/30 bg-[#2B6E80]/5 p-4 text-left">
      <p className="text-sm font-bold text-[#1A1410]">
        Tu link para completar la ficha
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-[#6B5E57]">
        Agregá fotos y horarios cuando quieras, sin esperar a nadie. Guardalo:
        sirve por 30 días y es la única forma de volver a entrar.
      </p>

      <p className="mt-3 break-all rounded-xl border border-[#E8E4DE] bg-white px-3 py-2 font-mono text-[11px] text-[#1A1410] select-all">
        {url}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copiar}
          className="rounded-full bg-[#1A1410] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#2B6E80]"
        >
          {copiado ? "¡Copiado!" : "Copiar link"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#E8E4DE] bg-white px-4 py-2.5 text-xs font-bold text-[#1A1410] transition hover:border-[#2B6E80]/40"
        >
          Enviármelo por WhatsApp
        </a>
        <a
          href={url}
          className="rounded-full border border-[#E8E4DE] bg-white px-4 py-2.5 text-xs font-bold text-[#2B6E80] transition hover:border-[#2B6E80]/40"
        >
          Completar ahora →
        </a>
      </div>
    </div>
  );
}
