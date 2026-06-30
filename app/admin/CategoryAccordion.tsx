"use client";
import { useState } from "react";

type Categoria = { id: number; nombre: string; emoji: string; slug: string };

export function CategoryGroup({
  cat,
  count,
  children,
}: {
  cat: Categoria | undefined;
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      {/* Cabecera clicable */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/40 transition-colors"
      >
        <span className="text-xl">{cat?.emoji ?? "📦"}</span>
        <span className="flex-1 text-sm font-bold text-foreground truncate">
          {cat?.nombre ?? "Sin categoría"}
        </span>
        <span className="text-xs font-semibold text-muted-foreground bg-secondary rounded-full px-2 py-0.5 shrink-0">
          {count}
        </span>
        <svg
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Negocios — solo visibles si está abierto */}
      {open && (
        <div className="divide-y divide-border border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}
