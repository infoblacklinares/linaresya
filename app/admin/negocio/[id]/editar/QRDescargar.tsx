"use client";

import { useState } from "react";

// Genera un QR usando qrserver.com (gratis, sin API key, sin lib local).
// El QR apunta a la URL publica de la ficha — para que un cliente que escanee
// con su camara aterrice directo en la pagina del negocio.
//
// Tamanios:
//   - Preview: 240px (queda lindo en el panel)
//   - Descarga: 1024px (suficiente para imprimir stickers/posters de buena calidad)

export default function QRDescargar({
  fichaUrl,
  nombreNegocio,
}: {
  fichaUrl: string;
  nombreNegocio: string;
}) {
  const [downloading, setDownloading] = useState(false);

  // URL publica del QR (preview 240x240). Le pedimos margen 1 para que no quede
  // pegado a los bordes del PNG, y formato PNG con error correction nivel M.
  const qrPreview = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=2&ecc=M&data=${encodeURIComponent(fichaUrl)}`;
  const qrHigh = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&margin=4&ecc=M&format=png&data=${encodeURIComponent(fichaUrl)}`;

  async function descargar() {
    setDownloading(true);
    try {
      const res = await fetch(qrHigh);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Nombre del archivo legible: linaresya-qr-<nombre>.png
      const safe = nombreNegocio
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
      a.download = `linaresya-qr-${safe || "negocio"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando QR:", err);
      alert("No pudimos descargar el QR. Probá de nuevo o copiá la URL manualmente.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Codigo QR
      </h2>
      <p className="text-[12px] text-muted-foreground">
        El dueño puede imprimir este QR y pegarlo en su local. Cuando un cliente
        lo escanea con su celular, abre la ficha del negocio en LinaresYa.
      </p>

      <div className="rounded-2xl bg-secondary/40 p-4 flex items-center gap-4 flex-wrap">
        <div className="bg-white rounded-xl p-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrPreview}
            alt={`QR de ${nombreNegocio}`}
            width={120}
            height={120}
            className="block"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-[12px] font-semibold break-all text-foreground/80">
            {fichaUrl}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={descargar}
              disabled={downloading}
              className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2 disabled:opacity-50"
            >
              {downloading ? "Descargando..." : "Descargar PNG"}
            </button>
            <a
              href={qrHigh}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-secondary text-foreground text-xs font-semibold px-4 py-2"
            >
              Abrir en grande
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
