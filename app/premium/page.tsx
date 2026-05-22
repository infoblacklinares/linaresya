import Link from "next/link";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

// ── Datos de contacto y pago ─────────────────────────────────────────────────
// Editá estos valores con tus datos reales.
const WA_NUMERO   = "56984272557";           // sin + ni espacios
const EMAIL_PAGO  = "infoblack.linares@gmail.com";

// Datos bancarios para transferencia
const BANCO       = "Banco Estado";          // o BCI, Santander, etc.
const TIPO_CUENTA = "Cuenta Corriente";      // Cuenta Vista, Cuenta RUT, etc.
const NRO_CUENTA  = "000000000";             // ← reemplazá con tu número real
const RUT_TITULAR = "12.345.678-9";          // ← reemplazá con tu RUT real
const NOMBRE_TITULAR = "Infoblack SpA";      // ← nombre en la cuenta

// Precio mensual y anual
const PRECIO_MES  = 5990;
const PRECIO_ANIO = 49990;                   // 2 meses gratis vs mensual
const PRECIO_MES_ANIO = Math.round(PRECIO_ANIO / 12); // ~4.166/mes

const WA_MSG_PREMIUM = encodeURIComponent(
  "Hola! Quiero contratar el Plan Premium de LinaresYa. Te mando el comprobante de transferencia."
);
const WA_LINK = `https://wa.me/${WA_NUMERO}?text=${WA_MSG_PREMIUM}`;
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Plan Premium para negocios en Linares - LinaresYa",
  description:
    "Destacá tu negocio en Linares con LinaresYa Premium. WhatsApp directo, fotos, posición destacada y estadísticas. Desde $5.990/mes. Sin contratos.",
  alternates: { canonical: `${SITE_URL}/premium` },
  openGraph: {
    title: "Plan Premium - LinaresYa",
    description:
      "WhatsApp directo, fotos, destacado en búsquedas y estadísticas para tu negocio en Linares. Desde $5.990/mes.",
    url: `${SITE_URL}/premium`,
    type: "website",
  },
};

const FEATURES = [
  { emoji: "💬", titulo: "WhatsApp directo", desc: "Tus clientes te escriben en un clic desde tu ficha, sin intermediarios." },
  { emoji: "📸", titulo: "Fotos del negocio", desc: "Galería de hasta 8 fotos de tu local, productos o servicios." },
  { emoji: "🔝", titulo: "Posición destacada", desc: "Aparecés antes que los negocios básicos en búsquedas y categorías." },
  { emoji: "📊", titulo: "Estadísticas reales", desc: "Vistas, clics en WhatsApp, llamadas y cómo llegar — semana a semana." },
  { emoji: "✏️", titulo: "Edición autónoma", desc: "Link mágico para actualizar tus datos cuando quieras, sin depender de nadie." },
  { emoji: "⭐", titulo: "Badge Premium", desc: "Marca visual que genera confianza frente a negocios sin verificar." },
];

const PASOS_PAGO = [
  { n: "1", txt: "Hacé la transferencia con los datos de abajo." },
  { n: "2", txt: "Mandá el comprobante por WhatsApp o al email." },
  { n: "3", txt: "En menos de 24 horas activamos tu plan Premium." },
];

const FAQ = [
  {
    q: "¿Hay contrato o permanencia mínima?",
    a: "No. Podés cancelar cuando querás. Si pagás mensual, el plan corre hasta el próximo mes. Si pagaste anual y querés cancelar antes, te devolvemos los meses restantes.",
  },
  {
    q: "¿Cómo activan mi Premium después de pagar?",
    a: "Mandás el comprobante por WhatsApp o email. Nosotros lo verificamos y activamos tu plan dentro de las 24 horas siguientes, generalmente el mismo día.",
  },
  {
    q: "¿Qué pasa si ya tengo ficha básica?",
    a: "Perfecto. Al activar Premium tu ficha existente se actualiza automáticamente: se habilita WhatsApp, subís las fotos y aparecés destacado.",
  },
  {
    q: "¿Puedo probar Premium antes de pagar?",
    a: "Sí. Escribinos por WhatsApp y lo hablamos. Para negocios nuevos en LinaresYa solemos dar unos días de prueba sin costo.",
  },
  {
    q: "¿El precio incluye IVA?",
    a: "Sí, el precio es final con IVA incluido. Emitimos boleta o factura según necesites.",
  },
];

export default function PremiumPage() {
  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">

      {/* ── Sticky header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/" aria-label="Volver" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <BackIcon />
          </Link>
          <h1 className="text-base font-bold tracking-tight">Plan Premium</h1>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="bg-[#0f172a] px-6 py-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-16 translate-x-16 pointer-events-none" />
        <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
          LinaresYa · Plan Premium
        </p>
        <h2 className="text-3xl font-black leading-tight tracking-tight">
          Más clientes.<br />Más contactos.<br />Menos trabajo.
        </h2>
        <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-sm">
          WhatsApp directo, fotos de tu local y posición destacada. Todo por menos que un café por día.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white text-sm font-bold px-5 py-2.5 hover:bg-[#1ebe5d] transition"
          >
            <WhatsAppIcon />
            Contratar por WhatsApp
          </a>
          <a
            href="#como-pagar"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white text-sm font-semibold px-5 py-2.5 hover:bg-white/20 transition"
          >
            Ver cómo pagar ↓
          </a>
        </div>
      </section>

      {/* ── Precios ────────────────────────────────────────────────── */}
      <section className="px-4 pt-7">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Elegí tu plan
        </h2>
        <div className="grid grid-cols-2 gap-3">

          {/* Mensual */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Mensual
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">
              ${PRECIO_MES.toLocaleString("es-CL")}
            </p>
            <p className="text-xs text-muted-foreground">por mes</p>
            <p className="mt-3 text-[12px] text-foreground/60 leading-snug">
              Pagás cada mes. Cancelás cuando querás.
            </p>
          </div>

          {/* Anual */}
          <div className="rounded-2xl border-2 border-[#0f172a] bg-white p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#0f172a] text-white text-[9px] font-bold px-2.5 py-1 rounded-bl-xl tracking-wide">
              2 MESES GRATIS
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Anual
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">
              ${PRECIO_MES_ANIO.toLocaleString("es-CL")}
            </p>
            <p className="text-xs text-muted-foreground">
              /mes · ${PRECIO_ANIO.toLocaleString("es-CL")} al año
            </p>
            <p className="mt-3 text-[12px] text-foreground/60 leading-snug">
              Un pago anual. Ahorrás ${(PRECIO_MES * 12 - PRECIO_ANIO).toLocaleString("es-CL")}.
            </p>
          </div>
        </div>
      </section>

      {/* ── Qué incluye ────────────────────────────────────────────── */}
      <section className="px-4 pt-7">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Qué incluye Premium
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div key={f.titulo} className="rounded-2xl bg-secondary/50 p-4">
              <span className="text-2xl">{f.emoji}</span>
              <p className="mt-2 text-sm font-bold leading-tight">{f.titulo}</p>
              <p className="mt-1 text-[12px] text-muted-foreground leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo pagar ─────────────────────────────────────────────── */}
      <section id="como-pagar" className="px-4 pt-8">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Cómo contratar
        </h2>

        {/* Pasos */}
        <ol className="space-y-3 mb-5">
          {PASOS_PAGO.map((p) => (
            <li key={p.n} className="flex gap-3 items-start">
              <span className="shrink-0 h-7 w-7 rounded-full bg-[#0f172a] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {p.n}
              </span>
              <p className="text-sm leading-relaxed text-foreground/80 pt-0.5">{p.txt}</p>
            </li>
          ))}
        </ol>

        {/* Datos bancarios */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="px-4 py-3 bg-secondary/60 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Datos para transferencia
            </p>
          </div>
          <dl className="divide-y divide-border text-sm">
            {[
              ["Banco",         BANCO],
              ["Tipo de cuenta", TIPO_CUENTA],
              ["N° de cuenta",  NRO_CUENTA],
              ["RUT titular",   RUT_TITULAR],
              ["Nombre",        NOMBRE_TITULAR],
              ["Email depósito", EMAIL_PAGO],
            ].map(([label, valor]) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 gap-4">
                <dt className="text-muted-foreground shrink-0">{label}</dt>
                <dd className="font-semibold text-right">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Enviar comprobante */}
        <p className="mt-3 text-[12px] text-muted-foreground text-center">
          Una vez transferido, mandá el comprobante por:
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white text-sm font-bold py-3 hover:bg-[#1ebe5d] transition"
          >
            <WhatsAppIcon /> WhatsApp
          </a>
          <a
            href={`mailto:${EMAIL_PAGO}?subject=Comprobante%20Premium%20LinaresYa`}
            className="flex items-center justify-center gap-2 rounded-full bg-foreground text-background text-sm font-bold py-3 hover:opacity-90 transition"
          >
            ✉️ Email
          </a>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="px-4 pt-8">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Preguntas frecuentes
        </h2>
        <div className="space-y-2">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-border overflow-hidden">
              <summary className="list-none cursor-pointer px-4 py-3 font-semibold text-sm flex items-center justify-between hover:bg-secondary/40 transition">
                {item.q}
                <span className="text-muted-foreground shrink-0 ml-2 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-[13px] text-foreground/70 leading-relaxed border-t border-border">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────── */}
      <section className="px-4 pt-8 pb-12">
        <div className="rounded-3xl bg-[#0f172a] text-white p-6 text-center">
          <p className="text-lg font-extrabold tracking-tight">¿Dudas antes de contratar?</p>
          <p className="mt-1 text-sm text-white/70">
            Escribinos y te explicamos todo sin compromiso.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white text-sm font-bold px-6 py-3 hover:bg-[#1ebe5d] transition"
          >
            <WhatsAppIcon />
            Hablar por WhatsApp
          </a>
          <p className="mt-4 text-[11px] text-white/40">
            Sin contratos · Cancelás cuando querás · IVA incluido
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          ¿Todavía no tenés ficha?{" "}
          <Link href="/publicar" className="font-semibold underline hover:text-foreground">
            Publicá gratis primero →
          </Link>
        </p>
      </section>

    </main>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 3 17l-1 5 5.2-1.4A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.5Z" />
    </svg>
  );
}
