"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Sugerencia = { nombre: string; url: string; emoji: string };

export default function SearchAutocomplete() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [negocios, setNegocios] = useState<Sugerencia[]>([]);
  const [categorias, setCategorias] = useState<Sugerencia[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cerrar al hacer clic fuera
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

  // Fetch con debounce
  useEffect(() => {
    if (q.trim().length < 2) {
      setNegocios([]);
      setCategorias([]);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/sugerencias?q=${encodeURIComponent(q.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setNegocios(data.negocios ?? []);
        setCategorias(data.categorias ?? []);
        setOpen(true);
        setHighlighted(-1);
      } catch {
        /* abortado o sin red: ignorar */
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [q]);

  const items: Sugerencia[] = [...categorias, ...negocios];
  const hasResults = items.length > 0;

  function submit() {
    if (highlighted >= 0 && items[highlighted]) {
      router.push(items[highlighted].url);
    } else if (q.trim()) {
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

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-1.5 pl-4 backdrop-blur-md">
        <SearchIcon className="shrink-0 text-white/50" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
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

      {/* Dropdown de sugerencias estilo Pinterest */}
      <AnimatePresence>
        {open && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
          >
            {categorias.length > 0 && (
              <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-[#8E8279]">
                Categorías
              </div>
            )}
            {categorias.map((s, i) => (
              <SuggestionRow key={s.url} s={s} active={highlighted === i} onPick={() => { router.push(s.url); setOpen(false); }} onHover={() => setHighlighted(i)} />
            ))}
            {negocios.length > 0 && (
              <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-[#8E8279]">
                Negocios
              </div>
            )}
            {negocios.map((s, i) => {
              const idx = categorias.length + i;
              return (
                <SuggestionRow key={s.url} s={s} active={highlighted === idx} onPick={() => { router.push(s.url); setOpen(false); }} onHover={() => setHighlighted(idx)} />
              );
            })}
            <button
              type="button"
              onClick={submit}
              className="w-full border-t border-[#F0EDE8] px-4 py-3 text-left text-xs font-bold text-[#2B6E80] hover:bg-[#F9F8F6] transition"
            >
              Buscar “{q.trim()}” en todo LinaresYa →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuggestionRow({
  s,
  active,
  onPick,
  onHover,
}: {
  s: Sugerencia;
  active: boolean;
  onPick: () => void;
  onHover: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      onMouseEnter={onHover}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${active ? "bg-[#F0EDE8]" : "hover:bg-[#F9F8F6]"}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0EDE8] text-base">
        {s.emoji}
      </span>
      <span className="truncate text-sm font-semibold text-[#1A1410]">{s.nombre}</span>
    </button>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
