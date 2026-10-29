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
  { label: "Gasfíter", icon: "🔧", href: "/buscar?q=gasfiter" },
  { label: "Dentista", icon: "🦷", href: "/buscar?q=dentista" },
  { label: "Restaurantes", icon: "🍽️", href: "/buscar?q=restaurante" },
  { label: "Talleres", icon: "🚗", href: "/buscar?q=taller" },
  { label: "Veterinarias", icon: "🐾", href: "/buscar?q=veterinaria" },
];

export default function Hero({ totalNegocios, abiertosAhora, verificados }: HeroProps) {
  return (
    <section className="relative isolate z-40 overflow-visible bg-[#102b38] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#2B6E80]/50 blur-3xl" />
        <div className="absolute -bottom-40 left-[20%] h-[26rem] w-[26rem] rounded-full bg-[#C05A46]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(255,255,255,0.09),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 pb-9 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <PinIcon /> Linares, Región del Maule
            </span>
            <span className="rounded-full border border-[#8ec9b1]/25 bg-[#8ec9b1]/10 px-3 py-1.5 text-xs font-semibold text-[#b9ead5]">
              Lo local, más cerca
            </span>
          </div>

          <p className="mb-3 text-xs font-extrabold uppercase tracking-[.22em] text-[#f0b7a8]">
            Descubre · Conecta · Apoya
          </p>
          <h1 className="max-w-3xl text-[2.55rem] font-black leading-[.99] tracking-[-.045em] sm:text-5xl lg:text-[4.4rem]">
            Linares tiene
            <span className="block text-[#f2b6a4]">mucho por descubrir.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Encuentra negocios, servicios, ofertas y panoramas de tu ciudad. Todo lo local, en un solo lugar.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="relative z-50 mt-7 rounded-2xl bg-white p-2 shadow-[0_22px_70px_rgba(0,0,0,.28)] ring-1 ring-black/5 sm:p-2.5"
          >
            <SearchAutocomplete />
          </motion.div>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-white/50">Búsquedas populares</p>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar sm:flex-wrap sm:overflow-visible">
              {QUICK.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.04 }}
                  className="shrink-0"
                >
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span aria-hidden="true">{item.icon}</span>{item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#2B6E80]/40 via-transparent to-[#C05A46]/25 blur-xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-md sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-white/50">Tu ciudad, más conectada</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">¿Qué necesitas hoy?</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">Atajos para resolver algo ahora o encontrar una nueva idea para tu día.</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f2b6a4] text-2xl shadow-lg" aria-hidden="true">✦</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <IntentCard href="/buscar?abierto=1" icon="🟢" title="Abiertos ahora" detail="Encuentra atención disponible" />
              <IntentCard href="/buscar?domicilio=1" icon="🛵" title="A domicilio" detail="Servicios que llegan a ti" />
              <IntentCard href="/buscar?orden=rating" icon="⭐" title="Mejor valorados" detail="Descubre favoritos locales" />
              <IntentCard href="/ofertas" icon="🏷️" title="Ofertas locales" detail="Aprovecha promociones" />
            </div>

            {(totalNegocios || abiertosAhora || verificados) ? (
              <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/10 py-4">
                {totalNegocios ? <Stat value={<><AnimatedCounter value={totalNegocios} />+</>} label="negocios" /> : <Stat value="Local" label="comunidad" />}
                {abiertosAhora ? <Stat value={<><AnimatedCounter value={abiertosAhora} /></>} label="abiertos ahora" /> : <Stat value="Cerca" label="de tu día a día" />}
                {verificados ? <Stat value={<><AnimatedCounter value={verificados} /></>} label="verificados" /> : <Stat value="Maule" label="hecho local" />}
              </div>
            ) : null}
          </div>
          <p className="mt-3 text-center text-[11px] text-white/40">Apoya a los negocios de Linares y descubre todo lo que ofrece tu ciudad.</p>
        </div>
      </div>
    </section>
  );
}

function IntentCard({ href, icon, title, detail }: { href: string; icon: string; title: string; detail: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-white/10 bg-white/[0.055] p-3.5 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.11] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg" aria-hidden="true">{icon}</span>
      <span className="mt-3 block text-sm font-extrabold text-white">{title}</span>
      <span className="mt-1 block text-xs leading-relaxed text-white/55">{detail}</span>
      <span className="mt-2 block text-sm font-bold text-[#f2b6a4] transition group-hover:translate-x-1" aria-hidden="true">→</span>
    </Link>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return <div className="px-2 text-center"><p className="text-lg font-black tracking-tight text-white sm:text-xl">{value}</p><p className="mt-1 text-[10px] font-medium text-white/50 sm:text-xs">{label}</p></div>;
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}
