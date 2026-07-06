"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Genera el QR localmente con la libreria 'qrcode' (sin llamadas a terceros).
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
  const [qrPreview, setQrPreview] = useState<string>("");
  const [qrHigh, setQrHigh] = useState<string>("");

  // Generar ambos data URLs en el navegador cuando cambia la ficha
  useEffect(() => {
    let vigente = true;
    QRCode.toDataURL(fichaUrl, { width: 240, margin: 2, errorCorrectionLevel: "M" })
      .then(url => { if (vigente) setQrPreview(url); })
      .catch(err => console.error("Error generando QR preview:", err));
    QRCode.toDataURL(fichaUrl, { width: 1024, margin: 4, errorCorrectionLevel: "M" })
      .then(url => { if (vigente) setQrHigh(url); })
      .catch(err => console.error("Error generando QR alta:", err));
    return () => { vigente = false; };
  }, [fichaUrl]);

  function descargar() {
    if (!qrHigh) return;
    const safe = nombreNegocio
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const a = document.createElement("a");
    a.href = qrHigh;
    a.download = `linaresya-qr-${safe || "negocio"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        <div className="bg-white rounded-xl p-2 shrink-0 h-[136px] w-[136px] flex items-center justify-center">
          {qrPreview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrPreview}
              alt={`QR de ${nombreNegocio}`}
              width={120}
              height={120}
              className="block"
            />
          ) : (
            <span className="text-[11px] text-muted-foreground">Generando…</span>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-[12px] font-semibold break-all text-foreground/80">
            {fichaUrl}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={descargar}
              disabled={!qrHigh}
              className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2 disabled:opacity-50"
            >
              {qrHigh ? "Descargar PNG" : "Generando…"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
