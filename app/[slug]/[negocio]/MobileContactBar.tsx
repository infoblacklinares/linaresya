"use client";

import { useCallback } from "react";
import { enviarEvento } from "@/lib/tracking-cliente";
import type { EventoNegocio } from "@/lib/eventos";

type Props = {
  href: string;
  negocioId: string;
  evento: EventoNegocio;
  external?: boolean;
  label: string;
};

export default function MobileContactBar({
  href,
  negocioId,
  evento,
  external = false,
  label,
}: Props) {
  const handleClick = useCallback(() => {
    enviarEvento(negocioId, evento);
  }, [negocioId, evento]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md lg:hidden">
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={handleClick}
        className="mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-2xl bg-[#2B6E80] px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition active:scale-[0.98]"
        aria-label={`Contactar negocio: ${label}`}
      >
        <span>{label}</span>
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
