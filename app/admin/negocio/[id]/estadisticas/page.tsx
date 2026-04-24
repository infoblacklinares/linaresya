import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata = {
  title: "Estadisticas - Admin LinaresYa",
  robots: { index: false, follow: false },
};

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  plan: "basico" | "premium";
  categoria_id: number | null;
};

type Estadistica = {
  fecha: string;
  vistas: number;
  clicks_whatsapp: number;
  clicks_telefono: number;
  clicks_maps: number;
};

const DIAS = 30;

function fechaCL(offsetDias: number): string {
  // Devuelve YYYY-MM-DD para hoy - offsetDias en zona Santiago.
  const d = new Date(Date.now() - offsetDias * 24 * 60 * 60 * 1000);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d); // en-CA = YYYY-MM-DD
}

function diaCorto(fechaIso: string): string {
  const [y, m, d] = fechaIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export default async function EstadisticasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const desde = fechaCL(DIAS - 1); // hace 29 dias = 30 dias incluido hoy

  const [{ data: negocio }, { data: stats }] = await Promise.all([
    supabaseAdmin
      .from("negocios")
      .select("id, nombre, slug, plan, categoria_id")
      .eq("id", id)
      .single(),
    supabaseAdmin
      .from("estadisticas_diarias")
      .select("fecha, vistas, clicks_whatsapp, clicks_telefono, clicks_maps")
      .eq("negocio_id", id)
      .gte("fecha", desde)
      .order("fecha", { ascending: true }),
  ]);

  if (!negocio) notFound();
  const n = negocio as Negocio;

  // Categoria del negocio (para construir el link "Ver en el sitio").
  const catData = n.categoria_id
    ? ((
        await supabaseAdmin
          .from("categorias")
          .select("slug, nombre, emoji")
          .eq("id", n.categoria_id)
          .single()
      ).data as { slug: string; nombre: string; emoji: string } | null)
    : null;

  const filas = (stats ?? []) as Estadistica[];

  // Construir un map de fecha -> stat para llenar dias sin datos.
  const porFecha = new Map<string, Estadistica>(filas.map((f) => [f.fecha, f]));
  const serie: Estadistica[] = [];
  for (let i = DIAS - 1; i >= 0; i--) {
    const f = fechaCL(i);
    serie.push(
      porFecha.get(f) ?? {
        fecha: f,
        vistas: 0,
        clicks_whatsapp: 0,
        clicks_telefono: 0,
        clicks_maps: 0,
      },
    );
  }

  const totalVistas = serie.reduce((a, x) => a + x.vistas, 0);
  const totalWA = serie.reduce((a, x) => a + x.clicks_whatsapp, 0);
  const totalTel = serie.reduce((a, x) => a + x.clicks_telefono, 0);
  const totalMaps = serie.reduce((a, x) => a + x.clicks_maps, 0);
  const totalClicks = totalWA + totalTel + totalMaps;
  const tasaConversion =
    totalVistas > 0 ? ((totalClicks / totalVistas) * 100).toFixed(1) : "0.0";

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-4 pb-10">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border -mx-4 px-4 pt-4 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            aria-label="Volver al admin"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Estadisticas - 30 dias
            </p>
            <h1 className="text-lg font-extrabold tracking-tight leading-tight truncate">
              {n.nombre}
            </h1>
          </div>
          {n.plan === "premium" && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full shrink-0">
              Premium
            </span>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Metric label="Vistas" value={totalVistas} accent />
        <Metric label="Clicks totales" value={totalClicks} />
        <Metric label="Conversion" value={`${tasaConversion}%`} hint="clicks / vistas" />
        <Metric label="WhatsApp" value={totalWA} />
        <Metric label="Telefono" value={totalTel} />
        <Metric label="Como llegar" value={totalMaps} />
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Vistas por dia
          </h2>
          <span className="text-[11px] text-muted-foreground">
            ultimos {DIAS} dias
          </span>
        </div>
        <BarChart serie={serie} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
          Detalle diario
        </h2>
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Dia</th>
                <th className="text-right px-3 py-2 font-semibold">Vistas</th>
                <th className="text-right px-3 py-2 font-semibold">WA</th>
                <th className="text-right px-3 py-2 font-semibold">Tel</th>
                <th className="text-right px-3 py-2 font-semibold">Maps</th>
              </tr>
            </thead>
            <tbody>
              {[...serie].reverse().map((s) => {
                const tieneActividad =
                  s.vistas + s.clicks_whatsapp + s.clicks_telefono + s.clicks_maps > 0;
                return (
                  <tr
                    key={s.fecha}
                    className={`border-t border-border ${tieneActividad ? "" : "text-muted-foreground"}`}
                  >
                    <td className="px-3 py-2 font-medium">{diaCorto(s.fecha)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.vistas}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.clicks_whatsapp}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.clicks_telefono}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.clicks_maps}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 flex flex-wrap gap-2">
        <Link
          href={`/admin/negocio/${n.id}/editar`}
          className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2"
        >
          Editar negocio
        </Link>
        {catData && (
          <Link
            href={`/${catData.slug}/${n.slug}`}
            className="rounded-full bg-white border border-border text-foreground text-xs font-semibold px-4 py-2 hover:bg-secondary"
          >
            Ver en el sitio
          </Link>
        )}
      </section>

      {totalVistas === 0 && (
        <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          Aun no hay datos. Las vistas y clicks se empiezan a contar despues de
          aplicar la migracion SQL <code className="font-mono">supabase/estadisticas.sql</code>{" "}
          y de que alguien visite la ficha publica.
        </div>
      )}
    </main>
  );
}

function Metric({
  label,
  value,
  accent = false,
  hint,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ue-shadow-sm ${
        accent ? "bg-[oklch(0.94_0.04_80)]" : "bg-white border border-border"
      }`}
    >
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-extrabold mt-1 tabular-nums">{value}</p>
      {hint && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
      )}
    </div>
  );
}

function BarChart({ serie }: { serie: Estadistica[] }) {
  const W = 600;
  const H = 160;
  const PAD_T = 10;
  const PAD_B = 24;
  const PAD_X = 8;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_T - PAD_B;

  const max = Math.max(1, ...serie.map((s) => s.vistas));
  const barW = innerW / serie.length;

  return (
    <div className="rounded-2xl bg-white border border-border p-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-40"
        role="img"
        aria-label="Vistas por dia"
      >
        {/* Grid lineas */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={PAD_T + innerH * (1 - t)}
            y2={PAD_T + innerH * (1 - t)}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        ))}
        {/* Barras */}
        {serie.map((s, i) => {
          const h = (s.vistas / max) * innerH;
          const x = PAD_X + i * barW + barW * 0.1;
          const y = PAD_T + (innerH - h);
          const w = barW * 0.8;
          return (
            <g key={s.fecha}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={2}
                className="fill-foreground"
                opacity={s.vistas > 0 ? 1 : 0.15}
              />
              <title>
                {diaCorto(s.fecha)}: {s.vistas} vistas
              </title>
            </g>
          );
        })}
        {/* Labels primer y ultimo dia */}
        <text
          x={PAD_X + barW / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={11}
        >
          {diaCorto(serie[0].fecha)}
        </text>
        <text
          x={W - PAD_X - barW / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={11}
        >
          {diaCorto(serie[serie.length - 1].fecha)}
        </text>
        <text
          x={PAD_X + 2}
          y={PAD_T + 10}
          className="fill-muted-foreground"
          fontSize={10}
        >
          max {max}
        </text>
      </svg>
    </div>
  );
}
