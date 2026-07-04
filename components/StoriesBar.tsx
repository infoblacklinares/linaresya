"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export type Historia = {
  id: number;
  imagen_url: string;
  texto: string | null;
  negocio_id: string;
  nombre: string;
  emoji: string;
  foto_portada: string | null;
  url: string; // /categoria/slug
};

const DURACION_MS = 5000;

type Grupo = {
  negocio_id: string;
  nombre: string;
  emoji: string;
  foto: string | null;
  url: string;
  historias: Historia[];
};

export default function StoriesBar({ historias }: { historias: Historia[] }) {
  // Agrupar por negocio manteniendo orden de llegada
  const grupos = useMemo<Grupo[]>(() => {
    const map = new Map<string, Grupo>();
    for (const h of historias) {
      if (!map.has(h.negocio_id)) {
        map.set(h.negocio_id, {
          negocio_id: h.negocio_id,
          nombre: h.nombre,
          emoji: h.emoji,
          foto: h.foto_portada,
          url: h.url,
          historias: [],
        });
      }
      map.get(h.negocio_id)!.historias.push(h);
    }
    return Array.from(map.values());
  }, [historias]);

  const [abierto, setAbierto] = useState<number | null>(null);

  if (grupos.length === 0) return null;

  return (
    <>
      <div className="pt-4">
        <div className="flex items-center gap-2 px-4 mb-2">
          <h2 className="text-sm font-black text-[#1A1410]">Historias</h2>
          <span className="rounded-full bg-[#F4B860]/20 px-2 py-0.5 text-[9px] font-extrabold text-[#8B5E0A]">⭐ Premium</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
          {grupos.map((g, i) => (
            <motion.button
              key={g.negocio_id}
              type="button"
              onClick={() => setAbierto(i)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.05 }}
              className="flex shrink-0 flex-col items-center gap-1.5 w-[68px]"
            >
              {/* Anillo degradado estilo IG en dorado premium */}
              <span className="rounded-full p-[2.5px] bg-gradient-to-tr from-[#F4B860] via-[#C05A46] to-[#F4B860]">
                <span className="flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#F0EDE8] text-2xl">
                  {g.foto
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={g.foto} alt={g.nombre} className="h-full w-full object-cover" />
                    : g.emoji}
                </span>
              </span>
              <span className="w-full truncate text-center text-[10px] font-semibold text-[#6B5E57]">
                {g.nombre}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {abierto !== null && grupos[abierto] && (
          <StoryViewer
            grupo={grupos[abierto]}
            onClose={() => setAbierto(null)}
            onNextGroup={() =>
              setAbierto(a => (a !== null && a + 1 < grupos.length ? a + 1 : null))
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}

function StoryViewer({
  grupo,
  onClose,
  onNextGroup,
}: {
  grupo: Grupo;
  onClose: () => void;
  onNextGroup: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const rafRef = useRef<number>(0);
  const inicioRef = useRef<number>(0);

  const historia = grupo.historias[idx];
  const total = grupo.historias.length;

  // Reiniciar índice al cambiar de grupo
  useEffect(() => {
    setIdx(0);
  }, [grupo.negocio_id]);

  // Temporizador de avance con requestAnimationFrame
  useEffect(() => {
    inicioRef.current = performance.now();
    setProgreso(0);
    function tick(now: number) {
      const p = Math.min((now - inicioRef.current) / DURACION_MS, 1);
      setProgreso(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (idx + 1 < total) {
        setIdx(i => i + 1);
      } else {
        onNextGroup();
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, grupo.negocio_id, total]);

  // Bloquear scroll del body mientras está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function anterior() {
    if (idx > 0) setIdx(i => i - 1);
    else onClose();
  }
  function siguiente() {
    if (idx + 1 < total) setIdx(i => i + 1);
    else onNextGroup();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <div className="relative h-full w-full max-w-md mx-auto flex flex-col">
        {/* Barras de progreso */}
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
          {grupo.historias.map((h, i) => (
            <div key={h.id} className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: i < idx ? "100%" : i === idx ? `${progreso * 100}%` : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Cabecera */}
        <div className="absolute top-7 inset-x-3 z-20 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-[#F0EDE8] text-lg">
            {grupo.foto
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={grupo.foto} alt="" className="h-full w-full object-cover" />
              : grupo.emoji}
          </span>
          <span className="flex-1 truncate text-sm font-bold text-white drop-shadow">{grupo.nombre}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Imagen */}
        <motion.img
          key={historia.id}
          src={historia.imagen_url}
          alt={grupo.nombre}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Zonas táctiles anterior/siguiente */}
        <button type="button" aria-label="Anterior" onClick={anterior} className="absolute inset-y-0 left-0 w-1/3 z-10" />
        <button type="button" aria-label="Siguiente" onClick={siguiente} className="absolute inset-y-0 right-0 w-2/3 z-10" />

        {/* Texto + CTA */}
        <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-16">
          {historia.texto && (
            <p className="mb-3 text-center text-base font-bold text-white drop-shadow">{historia.texto}</p>
          )}
          <Link
            href={grupo.url}
            onClick={onClose}
            className="block w-full rounded-full bg-white py-3 text-center text-sm font-extrabold text-[#1A1410] active:scale-95 transition"
          >
            Ver ficha del negocio →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
