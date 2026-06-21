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

// Farmacias de Linares con horarios reales (fuente: FARMANET / buscafarma.cl)
const OTRAS_FARMACIAS = [
  { nombre: "Cruz Verde",      direccion: "Januario Espinoza 1183",  horario: "Lun-Jue 08:30–22:00 · Vie-Sáb 08:30–23:00 · Dom 08:30–22:00" },
  { nombre: "Cruz Verde",      direccion: "Av. Independencia 504",   horario: "Lun-Dom 09:00–22:00" },
  { nombre: "Cruz Verde",      direccion: "Av. Aníbal León Bustos 280", horario: "Lun-Dom 09:00–21:00" },
  { nombre: "Salcobrand",      direccion: "Independencia 495",       horario: "Lun-Vie 08:30–20:00 · Sáb 09:00–20:00 · Dom 10:00–20:00" },
  { nombre: "Salcobrand",      direccion: "Kurt Möller 199",         horario: "Lun-Sáb 09:00–20:30 · Dom 10:00–20:00" },
  { nombre: "Ahumada",         direccion: "Independencia 611",       horario: "Lun-Sáb 09:00–20:00 · Dom 09:00–18:00" },
  { nombre: "Ahumada",         direccion: "Av. Aníbal León 280",     horario: "Lun-Sáb 09:00–21:00 · Dom 10:00–20:00" },
  { nombre: "Dr. Simi",        direccion: "Independencia 536",       horario: "Lun-Sáb 09:00–21:00 · Dom Cerrado" },
  { nombre: "Dr. Simi",        direccion: "Januario Espinoza 612",   horario: "Lun-Dom 10:00–21:00" },
  { nombre: "Farmacia Roca",   direccion: "Maipú 511",               horario: "Lun-Dom 10:00–21:00" },
  { nombre: "F. Linares Centro", direccion: "Maipú 615",            horario: "Lun-Dom 10:00–22:00" },
  { nombre: "F. Nueva Francesa", direccion: "Independencia 794",    horario: "Lun-Dom 10:00–20:00" },
  { nombre: "F. El Carmen",    direccion: "Brasil 699",              horario: "Lun-Dom 09:00–20:00" },
  { nombre: "F. Comunitaria",  direccion: "Freire 495 (Municipal)",  horario: "Lun-Vie 09:00–19:30 · Sáb 10:00–13:30" },
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
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export default async function FarmaciaTurnoPage() {
  const hoy = fechaHoyCL();

  const { data } = await supabase
    .from("turno_farmacia")
    .select("*")
    .eq("fecha", hoy)
    .maybeSingle();

  type Turno = { farmacia: string; direccion: string; telefono: string | null; horario: string; maps_url: string | null };
  const turno = data as Turno | null;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/" aria-label="Volver" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Linares</p>
            <h1 className="text-base font-extrabold tracking-tight">Farmacia de turno</h1>
          </div>
        </div>
      </header>

      {/* Turno hoy */}
      <section className="px-4 pt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 capitalize">
          Hoy · {formatearFecha(hoy)}
        </p>

        {turno ? (
          <div className="rounded-3xl bg-[#2B6E80] text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/10 -translate-y-10 translate-x-10 pointer-events-none" />

            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/20 rounded-full px-3 py-1 mb-4">
              <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
              {turno.horario}
            </span>

            <h2 className="text-3xl font-black tracking-tight">💊 {turno.farmacia}</h2>

            <p className="mt-2 text-white/80 text-sm flex items-start gap-1.5">
              <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {turno.direccion}
            </p>

            {turno.telefono && (
              <p className="mt-1 text-white/80 text-sm flex items-center gap-1.5">
                <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.87 13.5 19.79 19.79 0 0 1 1.81 5 2 2 0 0 1 3.8 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {turno.telefono}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {turno.telefono && (
                <a href={`tel:${turno.telefono.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-[#2B6E80] text-sm font-bold px-5 py-2.5 hover:bg-white/90 transition">
                  Llamar ahora
                </a>
              )}
              <a href="https://maps.google.com/?q=Cruz+Verde+Independencia+543+Linares"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 text-white text-sm font-semibold px-5 py-2.5 hover:bg-white/30 transition">
                Cómo llegar →
              </a>
            </div>
          </div>
        ) : (
          /* Fallback: Cruz Verde es siempre la de turno, mostramos igual */
          <div className="rounded-3xl bg-[#2B6E80] text-white p-6">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/20 rounded-full px-3 py-1 mb-4">
              <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
              Urgencia 24 horas · todos los días
            </span>
            <h2 className="text-3xl font-black">💊 Cruz Verde</h2>
            <p className="mt-2 text-white/80 text-sm">Independencia 543, Linares</p>
            <div className="mt-5 flex gap-2">
              <a href="tel:6006002900" className="rounded-full bg-white text-[#2B6E80] text-sm font-bold px-5 py-2.5">
                600 600 2900
              </a>
              <a href="https://maps.google.com/?q=Cruz+Verde+Independencia+543+Linares"
                target="_blank" rel="noopener noreferrer"
                className="rounded-full bg-white/20 text-white text-sm font-semibold px-5 py-2.5">
                Cómo llegar →
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Emergencias */}
      <section className="px-4 pt-4">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-4">
          <span className="text-3xl shrink-0">🚨</span>
          <div>
            <p className="font-bold text-sm text-red-900">Emergencias médicas</p>
            <p className="text-[13px] text-red-700 mt-0.5">
              SAMU <span className="font-bold">131</span> · Bomberos <span className="font-bold">132</span> · Carabineros <span className="font-bold">133</span>
            </p>
          </div>
        </div>
      </section>

      {/* Otras farmacias */}
      <section className="px-4 pt-7">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Otras farmacias en Linares
        </h2>
        <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {OTRAS_FARMACIAS.map((f, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{f.nombre}</p>
                  <p className="text-xs text-muted-foreground">{f.direccion}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{f.horario}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground text-center">
          Fuente: FARMANET · ISP Chile · buscafarma.cl
        </p>
      </section>
    </main>
  );
}
