"use client";

import { useCallback } from "react";

type Evento = "whatsapp" | "telefono" | "maps";

type Props = {
  href: string;
  negocioId: string;
  evento: Evento;
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
  const handleClick = useCallback(() => {
    // sendBeacon es fire-and-forget: no bloquea la navegacion, no arroja errores
    // si el usuario cambia de pagina, y se entrega aunque sea ultima request.
    try {
      const payload = JSON.stringify({ negocio_id: negocioId, evento });
      const blob = new Blob([payload], { type: "application/json" });

      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        navigator.sendBeacon("/api/track", blob);
      } else {
        // Fallback para navegadores muy viejos.
        fetch("/api/track", {
          method: "POST",
          body: payload,
          keepalive: true,
          headers: { "Content-Type": "application/json" },
        }).catch(() => {});
      }
    } catch {
      // El tracking nunca debe romper el click. Si falla, seguimos.
    }
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
