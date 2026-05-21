import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Publica tu negocio gratis en Linares - LinaresYa",
  description:
    "Aparece gratis en el directorio local de Linares. Miles de vecinos buscan negocios, gasfíteres, veterinarias, restaurantes y más. Registrate en 5 minutos.",
  alternates: { canonical: "https://linaresya.cl/para-negocios" },
  openGraph: {
    title: "Publica tu negocio gratis en Linares - LinaresYa",
    description:
      "Miles de vecinos de Linares buscan negocios y servicios locales. Aparecé gratis en LinaresYa.",
    url: "https://linaresya.cl/para-negocios",
    siteName: "LinaresYa",
    locale: "es_CL",
    type: "website",
  },
};

const pasos = [
  {
    n: "1",
    titulo: "Completás el formulario",
    desc: "Nombre, categoría, teléfono, descripción y horarios. Tarda menos de 5 minutos.",
  },
  {
    n: "2",
    titulo: "Nosotros lo revisamos",
    desc: "En menos de 24 horas verificamos la información y activamos tu ficha.",
  },
  {
    n: "3",
    titulo: "Los vecinos te encuentran",
    desc: "Tu negocio aparece en búsquedas de Google y en el directorio de LinaresYa.",
  },
];

const beneficios = [
  {
    emoji: "🆓",
    titulo: "100% gratis",
    desc: "El plan básico no tiene costo. Aparecés en el directorio sin pagar nada.",
  },
  {
    emoji: "📍",
    titulo: "Aparecer en Google",
    desc: "Tu ficha tiene SEO optimizado. Cuando alguien busca tu rubro en Linares, aparecés.",
  },
  {
    emoji: "🕐",
    titulo: "Horarios visibles",
    desc: "Tus clientes saben si estás abierto antes de llamar. Menos llamadas innecesarias.",
  },
  {
    emoji: "📞",
    titulo: "Contacto directo",
    desc: "Teléfono visible sin intermediarios. Con Premium, WhatsApp directo en un clic.",
  },
  {
    emoji: "⭐",
    titulo: "Reseñas reales",
    desc: "Tus clientes pueden dejar reseñas. Las buenas opiniones traen más clientes.",
  },
  {
    emoji: "📊",
    titulo: "Estadísticas (Premium)",
    desc: "Sabés cuánta gente vio tu ficha, cuántos te llamaron y cómo llegaron a vos.",
  },
];

const preguntas = [
  {
    q: "¿Cuánto cuesta publicar?",
    a: "El plan básico es completamente gratis. Si querés más visibilidad, WhatsApp directo y fotos, el plan Premium cuesta $5.990/mes.",
  },
  {
    q: "¿Qué tipo de negocios pueden publicar?",
    a: "Cualquier negocio, local o servicio independiente de Linares: restaurantes, gasfíteres, veterinarias, peluquerías, ferreterías, talleres, dentistas, y mucho más.",
  },
  {
    q: "¿Cuánto tarda en aparecer mi negocio?",
    a: "Revisamos y aprobamos las solicitudes en menos de 24 horas, generalmente en el mismo día.",
  },
  {
    q: "¿Puedo editar la información después?",
    a: "Sí. Te mandamos un link mágico por email para que puedas actualizar horarios, descripción y datos cuando quieras, sin depender de nadie.",
  },
  {
    q: "¿Necesito tener sitio web?",
    a: "No. LinaresYa es tu presencia digital local. No necesitás web propia para aparecer y que te encuentren.",
  },
];

export default async function ParaNegociosPage() {
  // Contador de negocios activos para prueba social
  const { count } = await supabase
    .from("negocios")
    .select("id", { count: "exact", head: true })
    .eq("activo", true);

  const totalNegocios = count ?? 0;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/" aria-label="Volver" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-base font-bold tracking-tight">Para negocios</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-6">
        <div className="rounded-3xl bg-[#0f172a] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
            LinaresYa · Directorio local
          </p>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight">
            Que los vecinos de<br />Linares te encuentren
          </h2>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">
            Gratis. Sin registro previo. En menos de 5 minutos tu negocio aparece frente a miles de personas.
          </p>
          {totalNegocios > 0 && (
            <p className="mt-3 text-xs text-white/50">
              Ya somos <span className="text-white font-bold">{totalNegocios}+ negocios</span> en Linares
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/publicar"
              className="inline-flex items-center gap-1.5 rounded-full bg-white text-[#0f172a] text-sm font-bold px-5 py-2.5 hover:bg-white/90 transition"
            >
              Publicar mi negocio gratis →
            </Link>
            <Link
              href="/premium"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white text-sm font-semibold px-5 py-2.5 hover:bg-white/20 transition"
            >
              Ver Plan Premium
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="px-4 mt-8">
        <h2 className="text-base font-bold mb-4">¿Cómo funciona?</h2>
        <div className="space-y-3">
          {pasos.map((p) => (
            <div key={p.n} className="flex gap-4 rounded-2xl bg-secondary/40 p-4">
              <span className="h-8 w-8 rounded-full bg-[#0f172a] text-white text-sm font-extrabold flex items-center justify-center shrink-0">
                {p.n}
              </span>
              <div>
                <p className="text-sm font-bold">{p.titulo}</p>
                <p className="text-[13px] text-foreground/70 mt-0.5 leading-snug">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Beneficios */}
      <section className="px-4 mt-8">
        <h2 className="text-base font-bold mb-4">¿Qué incluye?</h2>
        <div className="grid grid-cols-2 gap-3">
          {beneficios.map((b) => (
            <div key={b.titulo} className="rounded-2xl bg-secondary/40 p-4">
              <span className="text-2xl">{b.emoji}</span>
              <p className="mt-2 text-sm font-bold leading-tight">{b.titulo}</p>
              <p className="mt-1 text-[12px] text-foreground/60 leading-snug">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparativa Básico / Premium */}
      <section className="px-4 mt-8">
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-3 text-center text-[11px] font-bold uppercase tracking-wider bg-secondary/60">
            <div className="px-3 py-2 text-left text-muted-foreground">Función</div>
            <div className="px-3 py-2 border-l border-border text-muted-foreground">Gratis</div>
            <div className="px-3 py-2 border-l border-border text-[#2B6E80]">Premium</div>
          </div>
          {[
            ["Ficha en el directorio", true, true],
            ["Teléfono visible", true, true],
            ["Horarios de atención", true, true],
            ["Badge Abierto/Cerrado", true, true],
            ["WhatsApp directo", false, true],
            ["Fotos del negocio", false, true],
            ["Posición destacada", false, true],
            ["Estadísticas de visitas", false, true],
          ].map(([label, basico, premium]) => (
            <div key={String(label)} className="grid grid-cols-3 text-center text-[13px] border-t border-border">
              <div className="px-3 py-2.5 text-left text-foreground/80">{String(label)}</div>
              <div className="px-3 py-2.5 border-l border-border">{basico ? "✓" : <span className="text-muted-foreground">—</span>}</div>
              <div className="px-3 py-2.5 border-l border-border font-semibold text-[#2B6E80]">{premium ? "✓" : <span className="text-muted-foreground">—</span>}</div>
            </div>
          ))}
          <div className="grid grid-cols-3 border-t border-border bg-secondary/40">
            <div className="px-3 py-2.5 text-left text-[11px] font-bold text-muted-foreground">Precio</div>
            <div className="px-3 py-2.5 border-l border-border text-[13px] font-bold text-center">Gratis</div>
            <div className="px-3 py-2.5 border-l border-border text-[13px] font-bold text-center text-[#2B6E80]">$5.990/mes</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 mt-8">
        <h2 className="text-base font-bold mb-4">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {preguntas.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-border overflow-hidden">
              <summary className="list-none cursor-pointer px-4 py-3 font-semibold text-sm flex items-center justify-between hover:bg-secondary/40 transition">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-[13px] text-foreground/70 leading-relaxed border-t border-border">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 mt-8 pb-10">
        <div className="rounded-3xl bg-[#3D5A45] text-white p-6 text-center">
          <p className="text-lg font-extrabold tracking-tight">¿Listo para empezar?</p>
          <p className="mt-1 text-sm text-white/75">
            Gratis. Sin tarjeta de crédito. En 5 minutos.
          </p>
          <Link
            href="/publicar"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white text-[#3D5A45] text-sm font-bold px-6 py-3 hover:bg-white/90 transition"
          >
            Publicar mi negocio gratis →
          </Link>
        </div>
      </section>
    </main>
  );
}
