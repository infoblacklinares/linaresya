import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Farmacia de turno hoy en Linares - LinaresYa",
  description:
    "¿Qué farmacia está de turno hoy en Linares? Encuentra la farmacia abierta las 24 horas con dirección y teléfono actualizado.",
  alternates: { canonical: "https://linaresya.cl/farmacia-turno" },
  openGraph: {
    title: "Farmacia de turno en Linares - LinaresYa",
    description: "Cuál farmacia está de turno hoy en Linares, dirección y teléfono.",
    url: "https://linaresya.cl/farmacia-turno",
    siteName: "LinaresYa",
    locale: "es_CL",
    type: "website",
  },
};

export const revalidate = 3600; // revalidar cada hora

type Turno = {
  fecha: string;
  farmacia: string;
  direccion: string;
  telefono: string | null;
  horario: string;
  maps_url: string | null;
};

function fechaHoyCL(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function fechaMañanaCL(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export default async function FarmaciaTurnoPage() {
  const hoy = fechaHoyCL();
  const mañana = fechaMañanaCL();

  const [{ data: turnoHoy }, { data: turnoMañana }] = await Promise.all([
    supabase.from("turno_farmacia").select("*").eq("fecha", hoy).maybeSingle(),
    supabase.from("turno_farmacia").select("*").eq("fecha", mañana).maybeSingle(),
  ]);

  const hoyData = turnoHoy as Turno | null;
  const mañanaData = turnoMañana as Turno | null;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition"
          >
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

      {/* Hoy */}
      <section className="px-4 pt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Hoy · {formatearFecha(hoy)}
        </p>

        {hoyData ? (
          <div className="rounded-3xl bg-[#2B6E80] text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8 pointer-events-none" />

            {/* Badge turno */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/20 rounded-full px-3 py-1 mb-4">
              <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
              Turno 24 horas
            </span>

            <h2 className="text-3xl font-black tracking-tight leading-tight">
              💊 {hoyData.farmacia}
            </h2>

            <p className="mt-2 text-white/80 text-sm flex items-start gap-1.5">
              <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {hoyData.direccion}
            </p>

            {hoyData.telefono && (
              <p className="mt-1 text-white/80 text-sm flex items-center gap-1.5">
                <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.87 13.5 19.79 19.79 0 0 1 1.81 5 2 2 0 0 1 3.8 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {hoyData.telefono}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {hoyData.telefono && (
                <a
                  href={`tel:${hoyData.telefono.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-[#2B6E80] text-sm font-bold px-5 py-2.5 hover:bg-white/90 transition"
                >
                  Llamar ahora
                </a>
              )}
              {hoyData.maps_url && (
                <a
                  href={hoyData.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 text-white text-sm font-semibold px-5 py-2.5 hover:bg-white/30 transition"
                >
                  Cómo llegar →
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-border p-8 text-center">
            <p className="text-4xl mb-3">💊</p>
            <p className="font-bold text-lg">Sin datos para hoy</p>
            <p className="text-sm text-muted-foreground mt-1">
              Estamos actualizando el turno. Intenta más tarde.
            </p>
          </div>
        )}
      </section>

      {/* Mañana */}
      {mañanaData && (
        <section className="px-4 pt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Mañana · {formatearFecha(mañana)}
          </p>
          <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl shrink-0">
              💊
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base">{mañanaData.farmacia}</p>
              <p className="text-sm text-muted-foreground truncate">{mañanaData.direccion}</p>
              {mañanaData.telefono && (
                <p className="text-xs text-muted-foreground mt-0.5">{mañanaData.telefono}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Info */}
      <section className="px-4 pt-6">
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-bold text-amber-900 mb-1">⚠️ Verifica antes de ir</p>
          <p className="text-[13px] text-amber-800 leading-relaxed">
            El turno puede cambiar. Si es urgente, llama antes para confirmar que están abiertos.
            Fuente: SEREMI de Salud del Maule.
          </p>
        </div>
      </section>

      {/* Número emergencias */}
      <section className="px-4 pt-4">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-4">
          <span className="text-3xl">🚨</span>
          <div>
            <p className="font-bold text-sm text-red-900">Emergencias médicas</p>
            <p className="text-[13px] text-red-700 mt-0.5">Llama al <span className="font-bold">131</span> (SAMU) o al <span className="font-bold">132</span> (Bomberos)</p>
          </div>
        </div>
      </section>

      {/* Semana */}
      <ProximosTurnos hoy={hoy} />
    </main>
  );
}

async function ProximosTurnos({ hoy }: { hoy: string }) {
  const { data } = await supabase
    .from("turno_farmacia")
    .select("fecha, farmacia")
    .gte("fecha", hoy)
    .order("fecha", { ascending: true })
    .limit(8);

  const turnos = (data ?? []) as { fecha: string; farmacia: string }[];
  if (turnos.length <= 1) return null;

  const proximos = turnos.slice(1); // excluir hoy

  return (
    <section className="px-4 pt-6">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Próximos turnos
      </p>
      <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {proximos.map((t) => {
          const [y, m, d] = t.fecha.split("-").map(Number);
          const fecha = new Intl.DateTimeFormat("es-CL", {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          }).format(new Date(Date.UTC(y, m - 1, d)));
          return (
            <div key={t.fecha} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground capitalize">{fecha}</span>
              <span className="font-semibold">{t.farmacia}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
