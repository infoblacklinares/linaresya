"use client";

import Link from "next/link";
import { Clock3, MapPin, Bike, Star } from "lucide-react";

const INTENTS = [
  {
    label: "Abiertos ahora",
    description: "Encuentra locales atendiendo",
    Icon: Clock3,
    href: "/buscar?abierto=1",
    iconStyle: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Cerca de mí",
    description: "Negocios en tu sector",
    Icon: MapPin,
    href: "/buscar",
    iconStyle: "bg-sky-100 text-sky-700",
  },
  {
    label: "A domicilio",
    description: "Pide sin salir de casa",
    Icon: Bike,
    href: "/buscar?domicilio=1",
    iconStyle: "bg-rose-100 text-rose-700",
  },
  {
    label: "Mejor valorados",
    description: "Los favoritos de Linares",
    Icon: Star,
    href: "/buscar?orden=rating",
    iconStyle: "bg-amber-100 text-amber-700",
  },
];

export default function HomeIntentNav() {
  return (
    <section className="px-4 py-7 sm:px-6 sm:py-9" aria-labelledby="home-intents-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2 sm:mb-6">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#2B6E80]">
              LinaresYa te ayuda
            </p>
            <h2 id="home-intents-title" className="text-xl font-extrabold tracking-tight text-[#173746] sm:text-2xl">
              Encuentra lo que necesitas
            </h2>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Accesos directos para resolverlo más fácil.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {INTENTS.map(({ label, description, Icon, href, iconStyle }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-[124px] items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_5px_18px_rgba(20,55,70,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#2B6E80]/40 hover:shadow-[0_12px_28px_rgba(20,55,70,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B6E80] focus-visible:ring-offset-2 sm:min-h-[142px] sm:flex-col sm:items-start sm:justify-between sm:p-5"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${iconStyle}`} aria-hidden="true">
                <Icon size={27} strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1 sm:w-full">
                <span className="block text-sm font-extrabold leading-snug text-[#173746] sm:text-base">{label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500 sm:text-sm">{description}</span>
              </span>
              <span className="hidden text-lg font-semibold text-[#2B6E80] transition-transform group-hover:translate-x-1 sm:block" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
