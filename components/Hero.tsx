"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import SearchAutocomplete from "@/components/SearchAutocomplete";

interface HeroProps {
  totalNegocios?: number;
  abiertosAhora?: number;
  verificados?: number;
}

const QUICK = [
  { label: "🔧 Gasfíter",    href: "/buscar?q=gasfiter" },
  { label: "🦷 Dentista",    href: "/buscar?q=dentista" },
  { label: "🍽️ Restaurante", href: "/buscar?q=restaurante" },
  { label: "🚗 Taller",      href: "/buscar?q=taller" },
  { label: "🐾 Veterinaria", href: "/buscar?q=veterinaria" },
];

export default function Hero({ totalNegocios, abiertosAhora, verificados }: HeroProps) {
  return (
    <section className="relative z-40 bg-gradient-to-br from-[#2B6E80] via-[#205f72] to-[#163d4e]">
      {/* Orbes decorativos glassmorphism (capa recortada para no cortar el dropdown del buscador) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-[#F4B860]/10 blur-3xl" />
        <div className="absolute top-10 right-8 h-32 w-32 rounded-full bg-[#C05A46]/10 blur-2xl" />
      </div>

      <div className="relative px-4 pt-6 pb-7 lg:px-10 lg:pt-10 lg:pb-12">
        {/* Chips: ubicación + autoridad */}
        <div className="mb-5 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
            <PinIcon />
            Linares, Región del Maule
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F4B860]/30 bg-[#F4B860]/15 px-3 py-1.5 text-xs font-semibold text-[#F4B860] backdrop-blur-sm">
            ✓ Actualizado hoy
          </div>
        </div>

        {/* Titular con autoridad */}
        <h1 className="mb-1 text-[1.9rem] lg:text-5xl font-black leading-[1.1] tracking-tight text-white">
          La guía digital<br />de Linares
        </h1>
        <p className="mb-5 text-sm lg:text-base text-white/60 leading-snug lg:max-w-xl">
          Negocios verificados, horarios reales y ofertas de hoy — todo en un solo lugar.
        </p>

        {/* Stats — tarjetas glass */}
        {(totalNegocios || abiertosAhora) ? (
          <div className="mb-5 flex gap-2">
            {totalNegocios ? (
              <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <span className="text-lg leading-none">🏪</span>
                <div>
                  <p className="text-xs font-black leading-none text-white"><AnimatedCounter value={totalNegocios} />+</p>
                  <p className="mt-0.5 text-[10px] leading-none text-white/55">negocios</p>
                </div>
              </div>
            ) : null}
            {abiertosAhora ? (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-3 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <div>
                  <p className="text-xs font-black leading-none text-emerald-300"><AnimatedCounter value={abiertosAhora} duration={800} /></p>
                  <p className="mt-0.5 text-[10px] leading-none text-emerald-400/70">abiertos ahora</p>
                </div>
              </div>
            ) : null}
            {verificados ? (
              <div className="flex items-center gap-2 rounded-2xl border border-[#F4B860]/25 bg-[#F4B860]/15 px-3 py-2 backdrop-blur-sm">
                <span className="text-lg leading-none">✓</span>
                <div>
                  <p className="text-xs font-black leading-none text-[#F4B860]"><AnimatedCounter value={verificados} duration={900} /></p>
                  <p className="mt-0.5 text-[10px] leading-none text-[#F4B860]/70">verificados</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : <div className="mb-5" />}

        {/* Buscador con sugerencias en vivo */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.1 }}
          className="lg:max-w-2xl"
        >
          <SearchAutocomplete />
        </motion.div>

        {/* Búsquedas rápidas */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK.map((q, i) => (
            <motion.div
              key={q.href}
              initial={{ opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.25 + i * 0.06 }}
              className="shrink-0"
            >
              <Link
                href={q.href}
                className="block rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/20"
              >
                {q.label}
              </Link>
            </motion.div>
          ))}
          {/* CTA captación de negocios */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.6 }}
            className="shrink-0"
          >
            <Link
              href="/publicar"
              className="block rounded-full bg-[#F4B860] px-3 py-1.5 text-xs font-bold text-[#1A1410] transition hover:bg-[#f0ad4a]"
            >
              🏪 Publica tu negocio gratis
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}
