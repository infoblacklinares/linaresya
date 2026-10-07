"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Sugerencia = { nombre: string; url: string; emoji: string; foto: string | null };

// Búsquedas recientes del usuario (solo en su navegador)
const RECIENTES_KEY = "linaresya_busquedas";
function leerRecientes(): string[] {
  try {
    const raw = localStorage.getItem(RECIENTES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string").slice(0, 5) : [];
  } catch { return []; }
}
function guardarReciente(q: string) {
  try {
    const arr = [q, ...leerRecientes().filter(x => x !== q)].slice(0, 5);
    localStorage.setItem(RECIENTES_KEY, JSON.stringify(arr));
  } catch { /* sin localStorage */ }
}

const POPULARES = [
  { q: "restaurante", emoji: "🍽️" },
  { q: "farmacia", emoji: "💊" },
  { q: "gasfíter", emoji: "🔧" },
  { q: "veterinaria", emoji: "🐾" },
  { q: "ferretería", emoji: "🔨" },
  { q: "peluquería", emoji: "💇" },
];

export default function SearchAutocomplete() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [negocios, setNegocios] = useState<Sugerencia[]>([]);
  const [categorias, setCategorias] = useState<Sugerencia[]>([]);
  const [fallback, setFallback] = useState<Sugerencia[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [recientes, setRecientes] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent | TouchEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNegocios([]);
      setCategorias([]);
      setFallback([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/sugerencias?q=${encodeURIComponent(q.trim())}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        setNegocios((data.negocios ?? []).slice(0, 5));
        setCategorias((data.categorias ?? []).slice(0, 3));
        setFallback((data.fallback ?? []).slice(0, 3));
        setOpen(true);
        setHighlighted(-1);
      } catch {
        /* abortado o sin red: ignorar */
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [q]);

  // Los negocios aparecen primero porque normalmente el usuario busca un lugar concreto.
  const items: Sugerencia[] = [...negocios, ...categorias, ...fallback];
  const hasResults = items.length > 0;
  const sinCoincidencias = negocios.length === 0 && categorias.length === 0 && fallback.length > 0;

  function submit() {
    if (highlighted >= 0 && items[highlighted]) {
      guardarReciente(q.trim());
      router.push(items[highlighted].url);
    } else if (q.trim()) {
      guardarReciente(q.trim());
      router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
    }
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || !hasResults) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(h => (h + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(h => (h <= 0 ? items.length - 1 : h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function pick(url: string) {
    guardarReciente(q.trim());
    const destino = url.startsWith("/") && !url.startsWith("/buscar")
      ? `${url}${url.includes("?") ? "&" : "?"}origen=busqueda`
      : url;
    router.push(destino);
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative z-50">
      <label htmlFor="main-search" className="sr-only">Buscar negocios, servicios o rubros en Linares</label>
      <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-1.5 pl-4 backdrop-blur-md">
        <SearchIcon className="shrink-0 text-white/50" />
        <input
          id="main-search"
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => { setRecientes(leerRecientes()); setOpen(true); }}
          onKeyDown={onKeyDown}
          type="search"
          placeholder="gasfíter, dentista, restaurante…"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
        />
        <motion.button
          type="button"
          onClick={submit}
          className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#2B6E80]"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          Buscar
        </motion.button>
      </div>

      <AnimatePresence>
        {open && q.trim().length < 2 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-[60] mt-2 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_16px_45px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
          >
            {recientes.length > 0 && (
              <>
                <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E8279]">Tus búsquedas recientes</p>
                <div className="flex flex-wrap gap-2 pb-3">
                  {recientes.map(r => (
                    <button key={r} type="button" onClick={() => { guardarReciente(r); router.push(`/buscar?q=${encodeURIComponent(r)}`); setOpen(false); }}
                      className="rounded-full border border-[#2B6E80]/15 bg-[#2B6E80]/5 px-3 py-1.5 text-xs font-semibold text-[#2B6E80] transition hover:bg-[#2B6E80]/10">
                      ↻ {r}
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E8279]">Prueba buscar</p>
            <div className="flex flex-wrap gap-2">
              {POPULARES.map(p => (
                <button key={p.q} type="button" onClick={() => { router.push(`/buscar?q=${encodeURIComponent(p.q)}`); setOpen(false); }}
                  className="rounded-full border border-[#E8E4DE] bg-[#F9F8F6] px-3 py-1.5 text-xs font-semibold text-[#1A1410] transition hover:border-[#2B6E80]/35 hover:bg-[#2B6E80]/5">
                  {p.emoji} {p.q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-[60] mt-2 max-h-[60vh] overflow-y-auto rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.2)] ring-1 ring-black/5"
          >
            {sinCoincidencias && (
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-semibold text-[#1A1410]">No encontramos “{q.trim()}”.</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E8279]">Quizás te interese</p>
              </div>
            )}
            {negocios.length > 0 && (
              <div className="border-b border-[#F0EDE8] px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E8279]">Negocios</div>
            )}
            {negocios.map((s, i) => (
              <SuggestionRow key={s.url} s={s} active={highlighted === i} onPick={() => pick(s.url)} onHover={() => setHighlighted(i)} />
            ))}
            {categorias.length > 0 && (
              <div className="border-b border-[#F0EDE8] px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E8279]">Categorías</div>
            )}
            {categorias.map((s, i) => {
              const idx = negocios.length + i;
              return <SuggestionRow key={s.url} s={s} active={highlighted === idx} onPick={() => pick(s.url)} onHover={() => setHighlighted(idx)} />;
            })}
            {fallback.map((s, i) => {
              const idx = negocios.length + categorias.length + i;
              return <SuggestionRow key={s.url} s={s} active={highlighted === idx} onPick={() => pick(s.url)} onHover={() => setHighlighted(idx)} />;
            })}
            <button type="button" onClick={submit}
              className="w-full border-t border-[#E8E4DE] bg-[#F9F8F6]/70 px-4 py-3.5 text-left text-xs font-extrabold text-[#2B6E80] transition hover:bg-[#F1EEEA]">
              Ver todos los resultados para “{q.trim()}” →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuggestionRow({ s, active, onPick, onHover }: { s: Sugerencia; active: boolean; onPick: () => void; onHover: () => void }) {
  return (
    <button type="button" onClick={onPick} onMouseEnter={onHover}
      className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition ${active ? "bg-[#F4F1ED]" : "hover:bg-[#FAF8F5]"}`}>
      {s.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.foto} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-black/5" />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EDE8] text-base">{s.emoji}</span>
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1A1410]">{s.nombre}</span>
      <span className="text-xs font-bold text-[#B1A69E] transition group-hover:text-[#2B6E80]">→</span>
    </button>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className}>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
