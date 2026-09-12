"use client";

import { enviarEvento } from "@/lib/tracking-cliente";
import type { EventoNegocio } from "@/lib/eventos";

/**
 * Enlace que registra el click antes de abrirse (LY-005).
 *
 * Sirve para Instagram, Facebook y el sitio web del negocio, que hasta ahora
 * eran enlaces sin medicion: se veia cuanta gente llamaba, pero no cuanta se
 * iba al Instagram del negocio.
 *
 * El estilo lo pone quien lo usa, para no cambiar como se ve la ficha. Si el
 * registro falla, el enlace se abre igual.
 */
export default function EnlaceMedido({
  href,
  negocioId,
  evento,
  className,
  children,
  externo = true,
}: {
  href: string;
  negocioId: string;
  evento: EventoNegocio;
  className?: string;
  children: React.ReactNode;
  externo?: boolean;
}) {
  return (
    <a
      href={href}
      target={externo ? "_blank" : undefined}
      rel={externo ? "noopener noreferrer" : undefined}
      className={className}
      onClick={() => enviarEvento(negocioId, evento)}
    >
      {children}
    </a>
  );
}
