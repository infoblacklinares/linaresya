"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FotoGaleria = { id: number | string; url: string };

/**
 * Galeria de la ficha con visor a pantalla completa (LY-036).
 *
 * Antes las fotos eran miniaturas y nada mas: se veian a 160 pixeles de ancho y
 * no habia forma de mirarlas de cerca. En un directorio la foto **es** el
 * producto —el plato, el corte de pelo, el trabajo terminado— asi que no poder
 * agrandarla se come buena parte de lo que la ficha viene a mostrar.
 *
 * Decisiones que no se ven:
 *
 *   - Las miniaturas van diferidas; la grande se pide recien al abrir el visor.
 *     Abrir una ficha no puede costar la descarga de ocho fotos completas.
 *   - Se precarga solo la siguiente foto, para que pasar de una a otra sea
 *     instantaneo sin bajar las ocho.
 *   - El visor se cierra con Escape, con el boton y tocando el fondo, y se
 *     navega con las flechas o deslizando. En el telefono, deslizar es lo que
 *     la gente intenta primero.
 *   - Mientras esta abierto, el fondo no hace scroll: si no, cerrar el visor te
 *     deja en otra parte de la pagina.
 */
export default function GaleriaFotos({
  fotos,
  nombreNegocio,
}: {
  fotos: FotoGaleria[];
  nombreNegocio: string;
}) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const tocoEn = useRef<number | null>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);

  const cerrar = useCallback(() => setAbierta(null), []);
  const mover = useCallback(
    (paso: number) =>
      setAbierta((i) => (i === null ? null : (i + paso + fotos.length) % fotos.length)),
    [fotos.length],
  );

  useEffect(() => {
    if (abierta === null) return;

    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      else if (e.key === "ArrowRight") mover(1);
      else if (e.key === "ArrowLeft") mover(-1);
    };
    document.addEventListener("keydown", alTeclado);

    // Sin esto, el fondo sigue desplazandose detras del visor y al cerrarlo la
    // persona aparece en otra parte de la ficha.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    botonCerrar.current?.focus();

    return () => {
      document.removeEventListener("keydown", alTeclado);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierta, cerrar, mover]);

  if (fotos.length === 0) return null;

  const siguiente = abierta === null ? null : fotos[(abierta + 1) % fotos.length];

  return (
    <>
      <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar">
        {fotos.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setAbierta(i)}
            aria-label={`Ver foto ${i + 1} de ${fotos.length} de ${nombreNegocio}`}
            className="shrink-0 rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B6E80]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.url}
              alt={`${nombreNegocio} — foto ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="h-32 w-40 sm:h-40 sm:w-52 lg:h-56 lg:w-72 object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {abierta !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${nombreNegocio}`}
          className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center"
          onClick={cerrar}
          onTouchStart={(e) => {
            tocoEn.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const desde = tocoEn.current;
            const hasta = e.changedTouches[0]?.clientX ?? null;
            tocoEn.current = null;
            if (desde === null || hasta === null) return;
            // 50 px: menos que eso suele ser un toque tembloroso, no un gesto.
            if (Math.abs(hasta - desde) < 50) return;
            mover(hasta < desde ? 1 : -1);
          }}
        >
          <button
            ref={botonCerrar}
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="absolute right-3 top-3 h-11 w-11 rounded-full bg-white/15 text-white text-2xl leading-none hover:bg-white/25"
          >
            ×
          </button>

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  mover(-1);
                }}
                className="absolute left-2 h-12 w-12 rounded-full bg-white/15 text-white text-3xl leading-none hover:bg-white/25"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Foto siguiente"
                onClick={(e) => {
                  e.stopPropagation();
                  mover(1);
                }}
                className="absolute right-2 h-12 w-12 rounded-full bg-white/15 text-white text-3xl leading-none hover:bg-white/25"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotos[abierta].url}
            alt={`${nombreNegocio} — foto ${abierta + 1} de ${fotos.length}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] object-contain rounded-lg"
          />

          {/* Solo la siguiente: pasar de foto es instantaneo sin bajar todas. */}
          {siguiente && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={siguiente.url} alt="" aria-hidden="true" className="hidden" />
          )}

          {fotos.length > 1 && (
            <p className="absolute bottom-4 text-sm font-semibold text-white/80">
              {abierta + 1} / {fotos.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
