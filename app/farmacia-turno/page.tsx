import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Farmacia de turno hoy en Linares - LinaresYa",
  description:
    "¿Qué farmacia está de turno hoy en Linares? Cruz Verde Independencia 543 es la farmacia de urgencia 24 horas los 365 días del año.",
  alternates: { canonical: "https://linaresya.cl/farmacia-turno" },
  openGraph: {
    title: "Farmacia de turno en Linares - LinaresYa",
    description: "Cruz Verde (Independencia 543) abierta 24/7 en Linares. Más farmacias con horarios.",
    url: "https://linaresya.cl/farmacia-turno",
    siteName: "LinaresYa",
    locale: "es_CL",
    type: "website",
  },
};

export const revalidate = 3600;

const OTRAS_FARMACIAS = [
  { nombre: "Cruz Verde",        direccion: "Januario Espinoza 1183",     horario: "Lun–Jue 08:30–22:00 · Vie–Sáb 08:30–23:00 · Dom 08:30–22:00" },
  { nombre: "Cruz Verde",        direccion: "Av. Independencia 504",      horario: "Lun–Dom 09:00–22:00" },
  { nombre: "Cruz Verde",        direccion: "Av. Aníbal León Bustos 280", horario: "Lun–Dom 09:00–21:00" },
  { nombre: "Salcobrand",        direccion: "Independencia 495",          horario: "Lun–Vie 08:30–20:00 · Sáb 09:00–20:00 · Dom 10:00–20:00" },
  { nombre: "Salcobrand",        direccion: "Kurt Möller 199",            horario: "Lun–Sáb 09:00–20:30 · Dom 10:00–20:00" },
  { nombre: "Ahumada",           direccion: "Independencia 611",          horario: "Lun–Sáb 09:00–20:00 · Dom 09:00–18:00" },
  { nombre: "Ahumada",           direccion: "Av. Aníbal León 280",        horario: "Lun–Sáb 09:00–21:00 · Dom 10:00–20:00" },
  { nombre: "Dr. Simi",          direccion: "Independencia 536",          horario: "Lun–Sáb 09:00–21:00 · Dom Cerrado" },
  { nombre: "Dr. Simi",          direccion: "Januario Espinoza 612",      horario: "Lun–Dom 10:00–21:00" },
  { nombre: "Farmacia Roca",     direccion: "Maipú 511",                  horario: "Lun–Dom 10:00–21:00" },
  { nombre: "Linares Centro",    direccion: "Maipú 615",                  horario: "Lun–Dom 10:00–22:00" },
  { nombre: "Nueva Francesa",    direccion: "Independencia 794",          horario: "Lun–Dom 10:00–20:00" },
  { nombre: "El Carmen",         direccion: "Brasil 699",                 horario: "Lun–Dom 09:00–20:00" },
  { nombre: "Comunitaria",       direccion: "Freire 495 (Municipal)",     horario: "Lun–Vie 09:00–19:30 · Sáb 10:00–13:30" },
];

function fechaHoyCL(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export default async function FarmaciaTurnoPage() {
  const hoy = fechaHoyCL();

  const { data } = await supabase
    .from("turno_farmacia")
    .select("*")
    .eq("fecha", hoy)
    .maybeSingle();

  type Turno = { farmacia: string; direccion: string; telefono: string | null; horario: string };
  const turno = (data as Turno | null) ?? {
    farmacia: "Cruz Verde",
    direccion: "Independencia 543, Linares",
    telefono: "600 600 2900",
    horario: "Urgencia 24 horas · todos los días",
  };

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl pb-12 bg-[#F9F8F6]">

      {/* ── Hero con gradiente + orbs ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a4a5a] via-[#2B6E80] to-[#1e3a4a] pt-0 pb-10">

        {/* Orbs decorativos */}
        <div className="absolute -top-10 -right-10 h-52 w-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-16 h-40 w-40 rounded-full bg-[#F4B860]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-8 h-28 w-28 rounded-full bg-white/8 blur-2xl pointer-events-none" />

        {/* Header dentro del hero */}
        <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/10">
          <div className="px-4 py-3 flex items-center gap-3">
            <Link href="/" aria-label="Volver"
              className="h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/25 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <div>
              <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Linares</p>
              <h1 className="text-base font-extrabold tracking-tight text-white">Farmacia de turno</h1>
            </div>
          </div>
        </header>

        {/* Fecha */}
        <p className="px-5 pt-5 text-xs font-bold uppercase tracking-wider text-white/50 capitalize">
          Hoy · {formatearFecha(hoy)}
        </p>

        {/* Tarjeta principal glassmorphism */}
        <div className="mx-4 mt-3 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/25 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.18)]">

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-white mb-4">
            <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
            {turno.horario}
          </span>

          <div className="flex items-start gap-4">
            {/* Ícono */}
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              💊
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-white tracking-tight">{turno.farmacia}</h2>
              <p className="text-white/75 text-sm mt-1 flex items-start gap-1.5">
                <svg className="mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {turno.direccion}
              </p>
              {turno.telefono && (
                <p className="text-white/75 text-sm mt-0.5 flex items-center gap-1.5">
                  <svg className="shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.87 13.5 19.79 19.79 0 0 1 1.81 5 2 2 0 0 1 3.8 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {turno.telefono}
                </p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="mt-5 flex flex-wrap gap-2">
            {turno.telefono && (
              <a href={`tel:${turno.telefono.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#2B6E80] text-sm font-bold px-5 py-2.5 hover:bg-white/90 transition shadow-md">
                📞 Llamar ahora
              </a>
            )}
            <a href="https://maps.google.com/?q=Cruz+Verde+Independencia+543+Linares"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/25 text-white text-sm font-semibold px-5 py-2.5 hover:bg-white/30 transition">
              Cómo llegar →
            </a>
          </div>
        </div>

        {/* Emergencias — glass dentro del hero */}
        <div className="mx-4 mt-3 rounded-2xl bg-red-500/20 backdrop-blur-sm border border-red-300/30 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl shrink-0">🚨</span>
          <div>
            <p className="font-bold text-sm text-white">Emergencias</p>
            <p className="text-[12px] text-white/70">
              SAMU <span className="font-bold text-white">131</span> · Bomberos <span className="font-bold text-white">132</span> · Carabineros <span className="font-bold text-white">133</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats rápidos ─────────────────────────────────────────────── */}
      <div className="px-4 -mt-4 grid grid-cols-3 gap-2 relative z-10">
        {[
          { label: "Apertura", value: "00:00" },
          { label: "Cierre",   value: "23:59" },
          { label: "Días",     value: "365" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white/80 backdrop-blur-md border border-white shadow-sm p-3 text-center">
            <p className="text-lg font-black text-[#2B6E80]">{s.value}</p>
            <p className="text-[11px] font-semibold text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Otras farmacias ───────────────────────────────────────────── */}
      <section className="px-4 pt-7">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Todas las farmacias de Linares
        </h2>

        <div className="space-y-2">
          {OTRAS_FARMACIAS.map((f, i) => (
            <div key={i} className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#2B6E80]/8 flex items-center justify-center text-base shrink-0">
                  💊
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[#1A1410]">{f.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">{f.direccion}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">{f.horario}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          Fuente: FARMANET · ISP Chile · buscafarma.cl
        </p>
      </section>

      {/* ── Aviso ─────────────────────────────────────────────────────── */}
      <section className="px-4 pt-4">
        <div className="rounded-2xl bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 p-4">
          <p className="text-sm font-bold text-amber-900 mb-1">⚠️ Verifica antes de ir</p>
          <p className="text-[13px] text-amber-800 leading-relaxed">
            Los horarios pueden cambiar. Si es urgente llama antes. Para emergencias usa el SAMU (131).
          </p>
        </div>
      </section>

    </main>
  );
}
