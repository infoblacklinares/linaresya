"use client";

import Link from "next/link";

const INTENTS = [
  { label: "Abiertos ahora", icon: "🟢", href: "/buscar?abierto=1", featured: true },
  { label: "Cerca de mí", icon: "📍", href: "/buscar?cerca=1" },
  { label: "A domicilio", icon: "🛵", href: "/buscar?domicilio=1" },
  { label: "Mejor valorados", icon: "⭐", href: "/buscar?orden=valorados" },
];

export default function HomeIntentNav() {
  return (
    <section className="px-4 pt-4 pb-2" aria-labelledby="home-intents-title">
      <div className="mb-3">
        <p id="home-intents-title" className="text-sm font-black tracking-tight text-[#1A1410]">
          Encuentra rápido
        </p>
        <p className="text-xs text-[#8E8279]">
          Accede directo a lo que necesitas ahora.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {INTENTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 transition active:scale-[0.98]",
              item.featured
                ? "border-[#2B6E80] bg-[#2B6E80] text-white shadow-sm"
                : "border-[#E8E4DE] bg-white text-[#1A1410] hover:border-[#2B6E80]/40",
            ].join(" ")}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-xs font-bold">{item.label}</span>
            <span className="ml-auto text-xs opacity-50">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
