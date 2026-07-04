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
const DURACION_CON_TEXTO_MS = 7000;

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

  return (
    <>
      <div className="pt-4">
        <div className="flex items-center gap-2 px-4 mb-2">
          <h2 className="text-sm font-black text-[#1A1410]">Historias</h2>
          <span className="rounded-full bg-[#F4B860]/20 px-2 py-0.5 text-[9px] font-extrabold text-[#8B5E0A]">⭐ Premium</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
          {/* CTA: agrega tu historia (beneficio premium) */}
          <Link href="/premium" className="flex shrink-0 flex-col items-center gap-1.5 w-[68px]">
            <span className="rounded-full p-[2.5px] border-2 border-dashed border-[#F4B860]">
              <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#F4B860]/10 text-2xl font-black text-[#8B5E0A]">
                +
              </span>
            </span>
            <span className="w-full truncate text-center text-[10px] font-semibold text-[#8B5E0A]">
              Tu historia
            </span>
          </Link>
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
  const [pausado, setPausado] = useState(false);
  const rafRef = useRef<number>(0);
  const transcurridoRef = useRef<number>(0); // ms acumulados antes de la pausa
  const inicioRef = useRef<number>(0);
  const pausadoRef = useRef(false);

  const historia = grupo.historias[idx];
  const total = grupo.historias.length;
  // Con texto se da más tiempo para leer
  const duracion = historia.texto ? DURACION_CON_TEXTO_MS : DURACION_MS;

  // Reiniciar índice al cambiar de grupo
  useEffect(() => {
    setIdx(0);
  }, [grupo.negocio_id]);

  pausadoRef.current = pausado;

  // Temporizador de avance con requestAnimationFrame, con soporte de pausa:
  // mantener el dedo/mouse presionado congela el progreso (como Instagram).
  useEffect(() => {
    transcurridoRef.current = 0;
    inicioRef.current = performance.now();
    setProgreso(0);
    function tick(now: number) {
      if (pausadoRef.current) {
        // congelar: acumular lo transcurrido y correr el reloj de inicio
        transcurridoRef.current += now - inicioRef.current;
        inicioRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const transcurrido = transcurridoRef.current + (now - inicioRef.current);
      const p = Math.min(transcurrido / duracion, 1);
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
  }, [idx, grupo.negocio_id, total, duracion]);

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

  // Mantener presionado pausa; un toque corto navega. Si el dedo estuvo
  // más de 250 ms, el click posterior se ignora (era una pausa, no un tap).
  const holdInicioRef = useRef(0);
  function holdStart() {
    holdInicioRef.current = Date.now();
    setPausado(true);
  }
  function holdEnd() {
    setPausado(false);
  }
  function fueHold(): boolean {
    return Date.now() - holdInicioRef.current > 250;
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

        {/* Zonas táctiles: toque corto navega, mantener presionado pausa */}
        <button
          type="button"
          aria-label="Anterior"
          onPointerDown={holdStart}
          onPointerUp={holdEnd}
          onPointerLeave={holdEnd}
          onPointerCancel={holdEnd}
          onClick={() => { if (!fueHold()) anterior(); }}
          className="absolute inset-y-0 left-0 w-1/3 z-10 touch-none select-none"
        />
        <button
          type="button"
          aria-label="Siguiente"
          onPointerDown={holdStart}
          onPointerUp={holdEnd}
          onPointerLeave={holdEnd}
          onPointerCancel={holdEnd}
          onClick={() => { if (!fueHold()) siguiente(); }}
          className="absolute inset-y-0 right-0 w-2/3 z-10 touch-none select-none"
        />

        {/* Indicador de pausa */}
        {pausado && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white pointer-events-none">
            ⏸ Pausado
          </span>
        )}

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
