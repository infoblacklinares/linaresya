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

export default async function PublicarPage({
  searchParams,
}: {
  // El popup de la portada llega con ?origen=popup. Se lee aca, en el server
  // component, y viaja como prop: asi la atribucion del alta se mantiene
  // aunque el formulario ya no viva dentro del popup.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const origen = sp.origen === "popup" ? "popup" : "formulario";
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
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#E8E4DE]">
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Volver: icono + texto, para que se vea claramente que hay salida */}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full bg-[#F9F8F6] border border-[#E8E4DE] pl-2 pr-3 py-1.5 text-xs font-bold text-[#1A1410] hover:border-[#2B6E80]/40 transition shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver
          </Link>
          <h1 className="text-base font-bold tracking-tight text-[#1A1410] truncate">Publicar mi negocio</h1>
          {/* Marca clicable a la derecha: otra salida evidente al inicio */}
          <Link href="/" className="ml-auto shrink-0 text-sm font-black tracking-tight text-[#1A1410]">
            Linares<span className="text-[#F4B860]">Ya</span>
          </Link>
        </div>
      </header>

      {/* ── Hero minimo ────────────────────────────────────────────
          Quien llega a esta pagina ya decidio: la venta ocurrio antes, en la
          portada, el popup o Instagram. Antes habia tres pantallas de scroll
          (hero largo, como funciona, beneficios y una oferta de Premium) entre
          el visitante y el primer campo. Ahora el formulario empieza de una, y
          lo que convence quedo abajo para quien dude. */}
      <section className="bg-gradient-to-br from-[#2B6E80] to-[#1f5268] px-6 pt-7 pb-6 text-white">
        {/* text-white explicito: globals.css fija el color de todos los h1-h4,
            asi que sin esto el titulo sale casi negro sobre el fondo oscuro. */}
        <h2 className="text-2xl font-black leading-tight tracking-tight text-white">
          Publica tu negocio gratis
        </h2>
        <p className="mt-2 text-[13px] font-semibold text-white/85">
          Gratis · Sin registro · Activo en pocas horas
        </p>
        {totalNegocios > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold">
            <span>🏪</span>
            {totalNegocios} negocios ya están en LinaresYa
          </p>
        )}
      </section>

      {/* ── Formulario, de inmediato ───────────────────────────────── */}
      {error && (
        <div className="mx-4 mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          No pudimos cargar las categorías. Intentá recargar la página.
        </div>
      )}

      <PublishForm categorias={categorias} origen={origen} />

      {/* ── Lo que convence, para quien baja a mirarlo ─────────────── */}
      <section className="px-4 pt-8">
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

      <section className="px-4 pt-6">
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

        {/* Premium al final a proposito: ofrecer el plan pagado antes de que
            complete el gratis es pedir dos decisiones a la vez, y la segunda
            hace dudar de la primera. */}
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

      {/* Salida al final: para quien llega abajo y decide no publicar ahora */}
      <div className="px-4 pb-10 pt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2B6E80] hover:underline"
        >
          ← Volver al inicio de LinaresYa
        </Link>
      </div>
    </main>
  );
}
