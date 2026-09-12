"use client";

import { useCallback } from "react";
import { enviarEvento } from "@/lib/tracking-cliente";
import type { EventoNegocio } from "@/lib/eventos";

type Props = {
  href: string;
  negocioId: string;
  evento: EventoNegocio;
  external?: boolean;
  primary?: boolean;
  icon: React.ReactNode;
  label: string;
};

export default function TrackedActionButton({
  href,
  negocioId,
  evento,
  external = false,
  primary = false,
  icon,
  label,
}: Props) {
  // El envio vive en lib/tracking-cliente.ts: agrega la sesion y el origen, y
  // usa sendBeacon para que el evento salga aunque la pagina se este yendo.
  // Si falla, el click sigue: nunca se bloquea una llamada por una metrica.
  const handleClick = useCallback(() => {
    enviarEvento(negocioId, evento);
  }, [negocioId, evento]);

  const cls = `flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-xs font-semibold transition ${
    primary
      ? "bg-emerald-500 text-white hover:bg-emerald-600"
      : "bg-foreground text-background hover:opacity-90"
  }`;

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      className={cls}
    >
      {icon}
      {label}
    </a>
  );
}
