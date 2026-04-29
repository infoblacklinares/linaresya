"use client";

import { useState } from "react";

// Boton compartir con Web Share API si esta disponible (mobile principalmente),
// fallback a un menu con WhatsApp / Copiar link en desktop.
export default function ShareButton({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function handleClick() {
    // Si el navegador soporta Web Share API y NO estamos en desktop puro
    // (canShare puede estar pero no ser util en Chrome desktop sin flag).
    const canShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function";
    if (canShare) {
      try {
        await navigator.share({ url, title, text });
      } catch {
        // Usuario cancelo o algo, no es error real
      }
      return;
    }
    // Fallback: abrir menu local
    setOpen((v) => !v);
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Si no hay permiso de clipboard, abrir prompt manual
      window.prompt("Copia este link:", url);
    }
  }

  const waText = encodeURIComponent(`${text}\n${url}`);
  const waUrl = `https://wa.me/?text=${waText}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-xs font-semibold transition bg-secondary text-foreground hover:bg-secondary/80 w-full"
        aria-label="Compartir"
      >
        <ShareIcon />
        Compartir
      </button>

      {open && (
        <>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 cursor-default"
            aria-label="Cerrar"
          />
          <div className="absolute z-50 right-0 mt-2 w-56 rounded-2xl bg-white border border-border ue-shadow overflow-hidden">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              <span className="text-emerald-600 text-lg">{"💬"}</span>
              Compartir por WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                copiarLink();
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition text-sm font-medium w-full text-left border-t border-border"
            >
              <span className="text-lg">{copiado ? "✓" : "🔗"}</span>
              {copiado ? "Link copiado" : "Copiar link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
