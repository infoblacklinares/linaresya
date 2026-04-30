"use client";

import { useEffect, useState } from "react";
import {
  isFavorito,
  toggleFavorito,
  onFavoritosChanged,
} from "@/lib/favoritos";

// Boton corazon. Dos variantes: "icon" (chico, para overlay sobre cards) y
// "pill" (con texto al lado, para usar dentro de la ficha de detalle).
export default function FavoritoButton({
  negocioId,
  variant = "icon",
}: {
  negocioId: string;
  variant?: "icon" | "pill";
}) {
  const [activo, setActivo] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setActivo(isFavorito(negocioId));
    setMontado(true);
    return onFavoritosChanged(() => {
      setActivo(isFavorito(negocioId));
    });
  }, [negocioId]);

  function handleClick(e: React.MouseEvent) {
    // Si el boton vive dentro de un Link, evitamos navegar
    e.preventDefault();
    e.stopPropagation();
    toggleFavorito(negocioId);
  }

  if (!montado) {
    // Placeholder mientras hidrata, mismo tamaño para que no salte el layout
    return variant === "icon" ? (
      <span className="inline-block h-8 w-8" aria-hidden="true" />
    ) : (
      <span className="inline-block h-9 w-24" aria-hidden="true" />
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={activo}
        aria-label={activo ? "Quitar de favoritos" : "Guardar en favoritos"}
        className={
          "inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-3 py-2 transition " +
          (activo
            ? "bg-rose-100 text-rose-700"
            : "bg-secondary text-foreground hover:bg-rose-50 hover:text-rose-700")
        }
      >
        <HeartIcon filled={activo} />
        {activo ? "Guardado" : "Guardar"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={activo}
      aria-label={activo ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={
        "h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm " +
        (activo
          ? "bg-rose-500 text-white"
          : "bg-white/95 text-foreground hover:bg-white")
      }
    >
      <HeartIcon filled={activo} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
