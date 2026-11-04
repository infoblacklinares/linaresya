"use client";

import Link from "next/link";

const INTENTS = [
  { label: "Abiertos ahora", description: "Encuentra locales atendiendo", href: "/buscar?abierto=1", art: "store" },
  { label: "Cerca de mí", description: "Negocios en tu sector", href: "/buscar", art: "map" },
  { label: "A domicilio", description: "Pide sin salir de casa", href: "/buscar?domicilio=1", art: "delivery" },
  { label: "Mejor valorados", description: "Los favoritos de Linares", href: "/buscar?orden=rating", art: "award" },
] as const;

function IntentIllustration({ type }: { type: (typeof INTENTS)[number]["art"] }) {
  if (type === "store") return (
    <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
      <ellipse cx="80" cy="108" rx="59" ry="7" fill="#DCE9E8" />
      <rect x="28" y="44" width="104" height="61" rx="7" fill="#F5B94F" />
      <rect x="38" y="60" width="34" height="45" rx="4" fill="#0F7890" />
      <rect x="80" y="61" width="40" height="27" rx="4" fill="#E9F5F3" />
      <rect x="84" y="65" width="32" height="19" rx="2" fill="#18A878" />
      <path d="M23 43h114l-9-23H32z" fill="#E84D55" />
      <path d="M34 20h18l-2 23H25zM70 20h18l1 23H68zM106 20h18l11 23h-25z" fill="#FFF1D8" />
      <path d="M52 20h18l-2 23H50zM88 20h18l2 23H89z" fill="#E84D55" />
      <circle cx="119" cy="18" r="15" fill="#0F6B78" /><circle cx="119" cy="18" r="11" fill="#FFF7E8" />
      <path d="M119 10v8l6 3" fill="none" stroke="#173746" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 100c-8-8-7-17 0-24 8 7 9 16 0 24M18 101h12M142 100c-8-8-7-17 0-24 8 7 9 16 0 24M130 101h12" fill="#20A879" />
    </svg>
  );
  if (type === "map") return (
    <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
      <path d="M18 38 58 20l43 12 41-15v68l-41 17-43-12-40 17z" fill="#BDE9D5" stroke="#7BCDAA" strokeWidth="3" strokeLinejoin="round" />
      <path d="m58 20 1 75M101 32v70M18 72l40-18 43 12 41-18" fill="none" stroke="#F8FFF9" strokeWidth="6" />
      <path d="M80 16c-17 0-27 13-27 28 0 19 27 47 27 47s27-28 27-47C107 29 97 16 80 16z" fill="#F04E5D" />
      <circle cx="80" cy="44" r="10" fill="#FFF" />
      <path d="M25 34c0-10 7-17 15-17s15 7 15 17" fill="#35A96F" /><rect x="36" y="33" width="8" height="18" rx="3" fill="#8B5B38" />
      <path d="M116 81h20v14h-20z" fill="#F4B860" /><path d="M113 81h26l-4-9h-18z" fill="#E94F59" />
    </svg>
  );
  if (type === "delivery") return (
    <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
      <path d="M15 93h24M10 103h35M18 83h18" stroke="#24A8C1" strokeWidth="5" strokeLinecap="round" />
      <rect x="20" y="34" width="38" height="40" rx="7" fill="#F5B331" /><path d="m29 46 10-6 10 6-10 7zM39 53v13" fill="none" stroke="#FFF" strokeWidth="3" />
      <circle cx="64" cy="91" r="15" fill="#263C52" /><circle cx="64" cy="91" r="7" fill="#DCE8EE" />
      <circle cx="126" cy="91" r="15" fill="#263C52" /><circle cx="126" cy="91" r="7" fill="#DCE8EE" />
      <path d="M53 81h69l-12-28H81l-12 17H53z" fill="#E94755" />
      <path d="M81 53c-2-17 9-27 24-27 14 0 22 10 22 24l-13 8H83z" fill="#E94755" />
      <path d="M88 44c7-10 20-10 28-2" fill="none" stroke="#263C52" strokeWidth="7" strokeLinecap="round" />
      <circle cx="107" cy="48" r="3" fill="#263C52" /><path d="M122 63h17l7 12h-24" fill="none" stroke="#E94755" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
      <path d="M36 87c-12-19-9-42 7-56M124 87c12-19 9-42-7-56" fill="none" stroke="#279A61" strokeWidth="5" strokeLinecap="round" />
      <g fill="#51B978"><ellipse cx="37" cy="65" rx="8" ry="14" transform="rotate(-35 37 65)"/><ellipse cx="49" cy="43" rx="8" ry="14" transform="rotate(25 49 43)"/><ellipse cx="123" cy="65" rx="8" ry="14" transform="rotate(35 123 65)"/><ellipse cx="111" cy="43" rx="8" ry="14" transform="rotate(-25 111 43)"/></g>
      <path d="m80 12 13 27 30 4-22 21 5 30-26-14-26 14 5-30-22-21 30-4z" fill="#FFC52F" stroke="#E99A17" strokeWidth="4" strokeLinejoin="round" />
      <path d="M67 91v20l13-8 13 8V91" fill="#E94E5A" />
      <path d="m80 29 5 12 13 2-10 9 2 13-10-6-10 6 2-13-10-9 13-2z" fill="#FFE77A" />
    </svg>
  );
}

export default function HomeIntentNav() {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10" aria-labelledby="home-intents-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 sm:mb-6">
          <p className="mb-1 text-sm font-extrabold uppercase tracking-[0.16em] text-[#2B6E80]">LinaresYa te ayuda</p>
          <h2 id="home-intents-title" className="text-2xl font-extrabold tracking-tight text-[#173746] sm:text-3xl">Encuentra lo que necesitas</h2>
          <p className="mt-1 text-base text-slate-600 sm:text-lg">Accesos directos para resolverlo más fácil.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {INTENTS.map(({ label, description, href, art }) => (
            <Link key={href} href={href} className="group flex min-h-[220px] flex-col items-center justify-between rounded-3xl border border-slate-200 bg-white px-3 py-4 text-center shadow-[0_6px_22px_rgba(20,55,70,0.07)] transition duration-200 hover:-translate-y-1 hover:border-[#2B6E80]/40 hover:shadow-[0_14px_30px_rgba(20,55,70,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2B6E80]/30 sm:min-h-[260px] sm:px-5 sm:py-5">
              <span className="flex h-[104px] w-full max-w-[150px] items-center justify-center sm:h-[132px] sm:max-w-[180px]">
                <IntentIllustration type={art} />
              </span>
              <span className="mt-2 block text-lg font-extrabold leading-tight text-[#173746] sm:text-xl">{label}</span>
              <span className="mt-1 block max-w-[22ch] text-sm leading-relaxed text-slate-600 sm:text-base">{description}</span>
              <span className="mt-3 inline-flex min-h-10 items-center rounded-full bg-[#E8F4F3] px-4 text-sm font-bold text-[#176779] transition group-hover:bg-[#2B6E80] group-hover:text-white sm:text-base">Ver opciones →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
