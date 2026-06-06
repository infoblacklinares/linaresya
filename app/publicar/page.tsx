import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import PublishForm from "./PublishForm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

export const metadata: Metadata = {
  title: "Publicar tu negocio gratis en Linares - LinaresYa",
  description:
    "Suma tu negocio, oficio o servicio a LinaresYa gratis. Aparece frente a miles de vecinos de Linares que buscan lo que ofreces. Sin registro, sin tarjeta.",
  alternates: { canonical: `${SITE_URL}/publicar` },
  openGraph: {
    title: "Publicar tu negocio gratis en Linares",
    description:
      "Suma tu negocio a LinaresYa gratis y aparece en las búsquedas locales de Linares.",
    url: `${SITE_URL}/publicar`,
    type: "website",
  },
};

type Categoria = { id: number; nombre: string; slug: string; emoji: string };

const BENEFICIOS = [
  {
    icon: "🔍",
    titulo: "Apareces en búsquedas",
    desc: "Vecinos que buscan lo que ofreces te encuentran en LinaresYa y en Google.",
  },
  {
    icon: "📞",
    titulo: "Contacto directo",
    desc: "Teléfono, WhatsApp y dirección visibles para quien te necesita.",
  },
  {
    icon: "⭐",
    titulo: "Reseñas de vecinos",
    desc: "Tus clientes dejan opiniones que generan confianza en nuevos clientes.",
  },
  {
    icon: "📊",
    titulo: "Estadísticas propias",
    desc: "Sabes cuántas personas vieron tu ficha, llamaron o buscaron cómo llegar.",
  },
];

const PASOS = [
  { n: "1", txt: "Completas el formulario con los datos de tu negocio (tarda 3 minutos)." },
  { n: "2", txt: "Revisamos la información y la activamos en las próximas horas." },
  { n: "3", txt: "Tu negocio aparece en el directorio y en las búsquedas locales de Linares." },
];

export default async function PublicarPage() {
  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from("categorias")
      .select("id, nombre, slug, emoji")
      .eq("activa", true)
      .order("orden"),
    supabase
      .from("negocios")
      .select("id", { count: "exact", head: true })
      .eq("activo", true),
  ]);

  const categorias = (data ?? []) as Categoria[];
  const totalNegocios = count ?? 0;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-base font-bold tracking-tight">Publicar mi negocio</h1>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#2B6E80] to-[#1f5268] px-6 py-10 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
          📍 Directorio local de Linares
        </p>
        <h2 className="text-3xl font-black leading-tight tracking-tight">
          Tu negocio, visible<br />para todo Linares.
        </h2>
        <p className="mt-3 text-sm text-white/80 leading-relaxed">
          Publicar es <strong className="text-white">gratis y sin registro</strong>.
          Solo completas el formulario y te activamos en pocas horas.
        </p>

        {/* Stat bar */}
        {totalNegocios > 0 && (
          <div className="mt-5 inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm font-semibold">
            <span className="text-lg">🏪</span>
            <span>
              {totalNegocios} negocios ya están en LinaresYa
            </span>
          </div>
        )}
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────────── */}
      <section className="px-4 pt-7 pb-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Cómo funciona
        </h3>
        <ol className="space-y-3">
          {PASOS.map((p) => (
            <li key={p.n} className="flex gap-3 items-start">
              <span className="shrink-0 h-7 w-7 rounded-full bg-[#2B6E80] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {p.n}
              </span>
              <p className="text-sm leading-relaxed text-foreground/80 pt-0.5">{p.txt}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Beneficios ─────────────────────────────────────────────── */}
      <section className="px-4 pt-6 pb-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Qué incluye el plan gratuito
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="rounded-2xl bg-secondary/60 p-4">
              <span className="text-2xl">{b.icon}</span>
              <p className="mt-2 text-sm font-bold leading-tight">{b.titulo}</p>
              <p className="mt-1 text-[12px] text-muted-foreground leading-snug">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Premium CTA */}
        <div className="mt-3 rounded-2xl border border-[#2B6E80]/30 bg-[#2B6E80]/5 px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">¿Quieres más? → Plan Premium</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              WhatsApp directo, destacado en el directorio y más.
            </p>
          </div>
          <Link
            href="/premium"
            className="shrink-0 rounded-full bg-[#2B6E80] text-white text-xs font-bold px-4 py-2 hover:bg-[#1f5268] transition"
          >
            Ver →
          </Link>
        </div>
      </section>

      {/* ── Separador ──────────────────────────────────────────────── */}
      <div className="mx-4 mt-7 border-t border-border" />
      <p className="text-center text-[11px] text-muted-foreground mt-3 mb-1">
        Completa el formulario — tarda unos 3 minutos
      </p>

      {/* ── Formulario ─────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          No pudimos cargar las categorías. Intentá recargar la página.
        </div>
      )}

      <PublishForm categorias={categorias} />
    </main>
  );
}
