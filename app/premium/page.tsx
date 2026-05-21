import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan Premium para negocios - LinaresYa",
  description:
    "Destacá tu negocio en Linares. Con LinaresYa Premium aparecés primero, activás WhatsApp directo y llegás a más clientes. Desde $5.990/mes.",
  alternates: {
    canonical: "https://linaresya.cl/premium",
  },
};

const WA_NUMERO = "56984272557";
const WA_MSG = encodeURIComponent(
  "Hola! Me interesa el Plan Premium de LinaresYa para mi negocio. ¿Me podés dar más info?"
);
const WA_LINK = `https://wa.me/${WA_NUMERO}?text=${WA_MSG}`;

const beneficiosBasico = [
  "Ficha básica en el directorio",
  "Nombre, categoría y descripción",
  "Teléfono visible",
  "Horarios de atención",
];

const beneficiosPremium = [
  "Todo lo del plan Básico",
  "WhatsApp directo habilitado",
  "Foto de portada + galería de fotos",
  "Badge \"Premium\" destacado",
  "Aparición prioritaria en búsquedas",
  "Sección destacada en la categoría",
  "Estadísticas: visitas, clics y contactos",
  "Link mágico para editar tu ficha solo",
];

export default function PremiumPage() {
  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-base font-bold tracking-tight">Plan Premium</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-6">
        <div className="rounded-3xl bg-[#0f172a] text-white p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
            LinaresYa Premium
          </p>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight">
            Que más vecinos<br />te encuentren primero
          </h2>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">
            Activá WhatsApp directo, subí fotos y aparecé destacado en búsquedas.
            Sin complicaciones, sin contratos.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white text-sm font-bold px-5 py-2.5 hover:bg-[#1ebe5d] transition"
          >
            <WhatsAppIcon />
            Contratar Premium
          </a>
        </div>
      </section>

      {/* Comparativa */}
      <section className="px-4 mt-6">
        <h2 className="text-base font-bold mb-3">Básico vs Premium</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Basico */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Básico
            </p>
            <p className="text-2xl font-extrabold mb-4">Gratis</p>
            <ul className="space-y-2">
              {beneficiosBasico.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[12px]">
                  <span className="mt-0.5 text-[#3D5A45] font-bold">✓</span>
                  <span className="text-foreground/70">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="rounded-2xl border-2 border-[#0f172a] bg-white p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#0f172a] text-white text-[9px] font-bold px-2.5 py-1 rounded-bl-xl tracking-wide">
              RECOMENDADO
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Premium
            </p>
            <div className="mb-4">
              <span className="text-2xl font-extrabold">$5.990</span>
              <span className="text-xs text-muted-foreground">/mes</span>
            </div>
            <ul className="space-y-2">
              {beneficiosPremium.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[12px]">
                  <span className="mt-0.5 text-[#2B6E80] font-bold">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Beneficios detallados */}
      <section className="px-4 mt-6 space-y-3">
        <h2 className="text-base font-bold">¿Por qué Premium?</h2>

        <BeneficioCard
          emoji="💬"
          titulo="WhatsApp directo"
          descripcion="Tus clientes te escriben en un clic desde tu ficha. Sin pasar por teléfono ni formularios."
        />
        <BeneficioCard
          emoji="📸"
          titulo="Fotos de tu local"
          descripcion="Subí hasta 8 fotos de tu negocio, productos o servicios. Las imágenes generan más confianza y más contactos."
        />
        <BeneficioCard
          emoji="🔝"
          titulo="Aparecés primero"
          descripcion="Los negocios Premium aparecen antes en la búsqueda y en la sección Destacados de la categoría."
        />
        <BeneficioCard
          emoji="📊"
          titulo="Estadísticas reales"
          descripcion="Sabés cuánta gente vio tu ficha, cuántos clicaron WhatsApp y cuántos pidieron cómo llegar."
        />
        <BeneficioCard
          emoji="✏️"
          titulo="Editás vos mismo"
          descripcion="Te mandamos un link mágico para que actualices horarios, descripción y fotos cuando quieras, sin depender de nadie."
        />
      </section>

      {/* Social proof */}
      <section className="px-4 mt-6">
        <div className="rounded-2xl bg-[#2B6E80]/10 border border-[#2B6E80]/20 p-4">
          <p className="text-sm font-semibold text-[#2B6E80]">
            &ldquo;Desde que activé Premium me llegan 3 o 4 consultas por semana directo por WhatsApp desde LinaresYa.&rdquo;
          </p>
          <p className="mt-2 text-xs text-muted-foreground">— Negocio Premium en Linares</p>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 mt-6 pb-10">
        <div className="rounded-3xl bg-secondary/60 p-6 text-center">
          <p className="text-base font-extrabold tracking-tight">
            ¿Listo para destacarte?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Escribinos por WhatsApp y activamos tu plan en menos de 24 horas.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white text-sm font-bold px-6 py-3 hover:bg-[#1ebe5d] transition"
          >
            <WhatsAppIcon />
            Quiero ser Premium
          </a>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Sin contratos. Cancelás cuando querás.
          </p>
        </div>
      </section>
    </main>
  );
}

function BeneficioCard({
  emoji,
  titulo,
  descripcion,
}: {
  emoji: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-secondary/40 p-4">
      <span className="text-xl shrink-0">{emoji}</span>
      <div>
        <p className="text-sm font-bold">{titulo}</p>
        <p className="text-[13px] text-foreground/70 mt-0.5 leading-snug">{descripcion}</p>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 3 17l-1 5 5.2-1.4A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.5Z" />
    </svg>
  );
}
