import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import PublishForm from "./PublishForm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

export const metadata: Metadata = {
  title: "Publica tu negocio gratis en Linares | LinaresYa",
  description:
    "Suma tu negocio, oficio o servicio a LinaresYa gratis. Conecta con nuevos clientes de Linares.",
  alternates: { canonical: `${SITE_URL}/publicar` },
  openGraph: {
    title: "Publica tu negocio gratis en Linares | LinaresYa",
    description: "Conecta tu negocio con nuevos clientes de Linares.",
    url: `${SITE_URL}/publicar`,
    type: "website",
  },
};

type Categoria = { id: number; nombre: string; slug: string; emoji: string };

const BENEFICIOS = [
  {
    icon: "⌕",
    titulo: "Aparece en búsquedas",
    desc: "Vecinos que buscan lo que ofreces pueden encontrarte en LinaresYa y Google.",
    tone: "teal",
  },
  {
    icon: "↗",
    titulo: "Contacto directo",
    desc: "Comparte tu teléfono, WhatsApp y ubicación para recibir consultas.",
    tone: "coral",
  },
  {
    icon: "☆",
    titulo: "Reseñas de vecinos",
    desc: "Construye confianza con las opiniones de tus clientes.",
    tone: "gold",
  },
  {
    icon: "▥",
    titulo: "Tu negocio visible",
    desc: "Muestra tus servicios, fotos, horarios y datos en un solo lugar.",
    tone: "teal",
  },
];

const PASOS = [
  "Completa los datos principales de tu negocio.",
  "Revisamos la información antes de publicarla.",
  "Tu ficha aparece en el directorio local de Linares.",
];

export default async function PublicarPage({
  searchParams,
}: {
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
    <main className="min-h-screen w-full bg-[#F7F5F1] text-[#102B35]">
      <header className="sticky top-0 z-40 border-b border-[#E8E6E1] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="LinaresYa, inicio" className="text-[27px] font-black tracking-tight text-[#073C45]">
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F34E50] text-lg text-white">⌖</span>
            Linares<span className="text-[#F34E50]">Ya</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#173944] md:flex">
            <Link href="/buscar" className="transition hover:text-[#F34E50]">Explorar</Link>
            <Link href="/negocios" className="transition hover:text-[#F34E50]">Negocios</Link>
            <Link href="/ayuda" className="transition hover:text-[#F34E50]">Ayuda</Link>
          </nav>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#C9D2D2] px-4 py-2 text-xs font-bold text-[#123E47] transition hover:border-[#2B6E80] hover:bg-[#F0F7F6] sm:text-sm">
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Volver al directorio</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </header>

      <section
        className="relative isolate overflow-hidden bg-[#073C45] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(3,48,56,.97) 0%, rgba(3,48,56,.88) 42%, rgba(3,48,56,.22) 100%), url('/hero-plaza-kiosco.jpg')",
        }}
      >
        <div className="mx-auto flex min-h-[250px] max-w-[1440px] items-center px-5 py-10 sm:min-h-[285px] sm:px-8 lg:min-h-[320px] lg:px-16">
          <div className="max-w-[690px] text-white">
            <span className="mb-4 block h-1.5 w-14 rounded-full bg-[#F34E50]" />
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.22em] text-[#FFB7A8]">Impulsa lo local</p>
            <h1 className="max-w-[650px] text-3xl font-black leading-[1.04] tracking-tight text-white sm:text-4xl lg:text-[48px]">
              Haz que tu negocio sea parte de Linares<span className="text-[#FF6260]">Ya</span>
            </h1>
            <p className="mt-4 max-w-xl text-base font-medium text-white/90 sm:text-lg">
              Publica gratis y conecta con nuevos clientes de tu ciudad.
            </p>
            <div className="mt-6 inline-flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white shadow-lg backdrop-blur-md sm:gap-x-7 sm:px-5 sm:text-sm">
              <span className="inline-flex items-center gap-2"><span className="text-xl">◇</span> Gratis</span>
              <span className="hidden h-6 w-px bg-white/35 sm:block" />
              <span className="inline-flex items-center gap-2"><span className="text-xl">♧</span> Sin registro previo</span>
              <span className="hidden h-6 w-px bg-white/35 sm:block" />
              <span className="inline-flex items-center gap-2"><span className="text-xl">✓</span> Revisión y activación</span>
            </div>
            {totalNegocios > 0 && (
              <p className="mt-4 text-xs font-semibold text-white/75">
                {totalNegocios} negocios ya forman parte de LinaresYa
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-6 px-4 pb-12 pt-7 sm:px-7 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,.85fr)] lg:gap-7 lg:px-10 lg:pt-8">
        <section className="min-w-0">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              No pudimos cargar las categorías. Intenta recargar la página.
            </div>
          )}
          <PublishForm categorias={categorias} origen={origen} />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BENEFICIOS.map((b) => (
              <article key={b.titulo} className="min-h-[155px] rounded-2xl border border-[#E8E6E1] bg-white p-4 shadow-[0_5px_18px_rgba(17,47,54,.06)] transition hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(17,47,54,.10)]">
                <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-2xl font-bold ${b.tone === "coral" ? "bg-[#FFF0ED] text-[#F34E50]" : b.tone === "gold" ? "bg-[#FFF6DF] text-[#E49A24]" : "bg-[#E8F4F2] text-[#16717A]"}`}>
                  {b.icon}
                </span>
                <h3 className="text-sm font-extrabold leading-tight text-[#102B35]">{b.titulo}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#64777B]">{b.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-[94px]">
          <section className="rounded-[26px] border border-[#E8E6E1] bg-white p-5 shadow-[0_8px_28px_rgba(17,47,54,.07)] sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0ED] text-2xl text-[#F34E50]">✧</span>
              <h2 className="text-xl font-black tracking-tight text-[#102B35]">Publicar es muy fácil</h2>
            </div>
            <ol className="space-y-5">
              {PASOS.map((p, i) => (
                <li key={p} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B6A70] text-sm font-extrabold text-white shadow-sm">{i + 1}</span>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#102B35]">{["Completa los datos", "Revisamos la información", "Aparece en LinaresYa"][i]}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#64777B]">{p}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#FFF0ED] px-4 py-3 text-[#7E302E]">
              <span className="text-2xl text-[#F34E50]">♧</span>
              <div>
                <p className="text-sm font-extrabold">Tu publicación es gratuita</p>
                <p className="text-xs">Sin costos ni registro previo.</p>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#07515B] to-[#063640] p-6 text-white shadow-[0_10px_28px_rgba(7,60,69,.2)]">
            <div className="relative z-10">
              <span className="text-3xl">♧</span>
              <h2 className="mt-3 max-w-[260px] text-xl font-black leading-tight text-white">Llega a más personas en Linares</h2>
              <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-white/85">
                Da a conocer tus productos, servicios y ofertas a vecinos que buscan negocios como el tuyo.
              </p>
              <Link href="/planes" className="mt-5 inline-flex rounded-full bg-white px-4 py-2.5 text-xs font-extrabold text-[#07444D] transition hover:bg-[#FFE6DF]">
                Conoce cómo destacar →
              </Link>
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-4 text-[130px] leading-none text-white/10">⌂</div>
          </section>

          <p className="px-2 text-center text-xs leading-relaxed text-[#718186]">
            ¿Tienes dudas? <Link href="/ayuda" className="font-bold text-[#16717A] underline underline-offset-2">Revisa la ayuda</Link> o vuelve al <Link href="/" className="font-bold text-[#16717A] underline underline-offset-2">directorio</Link>.
          </p>
        </aside>
      </div>

      <footer className="border-t border-[#E6E3DD] bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="text-xl font-black tracking-tight text-[#073C45]">
            Linares<span className="text-[#F34E50]">Ya</span>
            <span className="ml-3 text-xs font-medium text-[#78878A]">Directorio de negocios de Linares</span>
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#536A70]">
            <Link href="/buscar" className="hover:text-[#F34E50]">Explorar negocios</Link>
            <Link href="/publicar" className="hover:text-[#F34E50]">Publicar mi negocio</Link>
            <Link href="/ayuda" className="hover:text-[#F34E50]">Ayuda</Link>
            <Link href="/premium" className="hover:text-[#F34E50]">Planes</Link>
            <Link href="/contacto" className="hover:text-[#F34E50]">Contacto</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
