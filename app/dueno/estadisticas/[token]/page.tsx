import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
  title: "Mis estadísticas - LinaresYa",
  robots: { index: false, follow: false },
};

type Estadistica = {
  fecha: string;
  vistas: number;
  clicks_whatsapp: number;
  clicks_telefono: number;
  clicks_maps: number;
};

type Resena = {
  id: number;
  autor_nombre: string;
  estrellas: number;
  comentario: string | null;
  aprobada: boolean;
  creado_en: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linaresya.cl";

function fechaCL(offsetDias: number): string {
  const d = new Date(Date.now() - offsetDias * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
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

export default async function DuenoEstadisticasPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Validar token
  const { data: tokenRow } = await supabaseAdmin
    .from("dueno_tokens")
    .select("negocio_id, expira_en")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) {
    return <TokenInvalidoView />;
  }

  const expira = new Date((tokenRow as { expira_en: string }).expira_en);
  if (Date.now() > expira.getTime()) {
    return <TokenInvalidoView expirado />;
  }

  const negocioId = (tokenRow as { negocio_id: string }).negocio_id;

  const desde30 = fechaCL(29);
  const hoy = fechaCL(0);

  const [{ data: negocioData }, { data: statsData }, { data: resenasData }] =
    await Promise.all([
      supabaseAdmin
        .from("negocios")
        .select("id, nombre, slug, plan, verificado, categorias:categoria_id(slug, emoji, nombre)")
        .eq("id", negocioId)
        .single(),
      supabaseAdmin
        .from("estadisticas_diarias")
        .select("fecha, vistas, clicks_whatsapp, clicks_telefono, clicks_maps")
        .eq("negocio_id", negocioId)
        .gte("fecha", desde30)
        .lte("fecha", hoy)
        .order("fecha", { ascending: true }),
      supabaseAdmin
        .from("resenas")
        .select("id, autor_nombre, estrellas, comentario, aprobada, creado_en")
        .eq("negocio_id", negocioId)
        .order("creado_en", { ascending: false })
        .limit(10),
    ]);

  if (!negocioData) notFound();

  const neg = negocioData as unknown as Record<string, unknown>;
  const catRaw = Array.isArray(neg.categorias) ? (neg.categorias as unknown[])[0] : neg.categorias;
  const cat = catRaw && typeof catRaw === "object" ? catRaw as Record<string, unknown> : null;

  const nombre = String(neg.nombre ?? "");
  const slug = String(neg.slug ?? "");
  const plan = String(neg.plan ?? "basico") as "basico" | "premium";
  const categoriaSlug = cat ? String(cat.slug ?? "") : "";
  const categoriaEmoji = cat ? String(cat.emoji ?? "🏪") : "🏪";
  const fichaUrl = categoriaSlug ? `${SITE_URL}/${categoriaSlug}/${slug}` : SITE_URL;
  const editarUrl = `/dueno/editar/${token}`;

  const stats = (statsData ?? []) as Estadistica[];
  const resenas = (resenasData ?? []) as Resena[];

  // Totales 30d
  const totalVistas = stats.reduce((s, r) => s + r.vistas, 0);
  const totalWA = stats.reduce((s, r) => s + r.clicks_whatsapp, 0);
  const totalTel = stats.reduce((s, r) => s + r.clicks_telefono, 0);
  const totalMaps = stats.reduce((s, r) => s + r.clicks_maps, 0);
  const totalClicks = totalWA + totalTel + totalMaps;

  // Rating de reseñas aprobadas
  const aprobadas = resenas.filter(r => r.aprobada);
  const ratingProm = aprobadas.length > 0
    ? aprobadas.reduce((s, r) => s + r.estrellas, 0) / aprobadas.length
    : null;

  // Barra de actividad: máximo de vistas por día (para escalar las barras)
  const maxVistas = Math.max(1, ...stats.map(s => s.vistas));

  // Últimos 14 días para el gráfico de barras (más legible en mobile)
  const ultimos14 = stats.slice(-14);

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href={fichaUrl}
            aria-label="Ver ficha"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Mis estadísticas</p>
            <h1 className="text-base font-extrabold tracking-tight truncate">{nombre}</h1>
          </div>
          <Link href={editarUrl} className="text-xs font-semibold text-[#2B6E80] hover:underline shrink-0">
            Editar →
          </Link>
        </div>
      </header>

      {/* Plan badge */}
      <div className="px-4 pt-4 flex items-center gap-2">
        <span className="text-xs font-bold">
          {categoriaEmoji} {cat ? String(cat.nombre ?? "") : ""}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan === "premium" ? "bg-amber-100 text-amber-900" : "bg-secondary text-muted-foreground"}`}>
          {plan === "premium" ? "⭐ Premium" : "Plan Básico"}
        </span>
      </div>

      {/* Resumen 30 días */}
      <section className="px-4 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Últimos 30 días
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Vistas" value={totalVistas} icon="👁️" accent />
          <StatCard label="Clicks totales" value={totalClicks} icon="👆" />
          <StatCard label="WhatsApp" value={totalWA} icon="💬" green />
          <StatCard label="Llamadas" value={totalTel} icon="📞" />
        </div>
        {totalMaps > 0 && (
          <div className="mt-3">
            <StatCard label="Cómo llegar" value={totalMaps} icon="📍" />
          </div>
        )}
      </section>

      {/* Gráfico de barras — últimos 14 días */}
      {ultimos14.length > 0 && (
        <section className="px-4 pt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Vistas últimos 14 días
          </h2>
          <div className="rounded-2xl bg-secondary/40 p-4">
            <div className="flex items-end gap-1 h-24">
              {ultimos14.map((s) => {
                const pct = Math.max(4, Math.round((s.vistas / maxVistas) * 100));
                return (
                  <div key={s.fecha} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full rounded-t-sm bg-[#2B6E80]/60 group-hover:bg-[#2B6E80] transition"
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[8px] text-muted-foreground whitespace-nowrap rotate-45 origin-left mt-1 hidden sm:block">
                      {diaCorto(s.fecha)}
                    </span>
                    {/* Tooltip en hover */}
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                      {s.vistas}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
              <span>{diaCorto(ultimos14[0].fecha)}</span>
              <span>{diaCorto(ultimos14[ultimos14.length - 1].fecha)}</span>
            </div>
          </div>
        </section>
      )}

      {/* Reseñas */}
      <section className="px-4 pt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Reseñas
          </h2>
          {ratingProm !== null && (
            <span className="text-sm font-bold text-amber-600">
              ★ {ratingProm.toFixed(1)}
              <span className="text-muted-foreground font-normal text-xs"> ({aprobadas.length})</span>
            </span>
          )}
        </div>

        {resenas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Todavía no hay reseñas. Pedile a tus clientes que te dejen una en tu ficha.
          </div>
        ) : (
          <ul className="space-y-2">
            {resenas.map((r) => {
              const fecha = new Date(r.creado_en).toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "America/Santiago",
              });
              return (
                <li key={r.id} className={`rounded-2xl p-4 ${r.aprobada ? "bg-secondary/60" : "bg-amber-50 border border-amber-200"}`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm truncate">{r.autor_nombre}</span>
                      {!r.aprobada && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full shrink-0">
                          En revisión
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-amber-500 font-bold text-xs">
                        {"★".repeat(Math.min(5, r.estrellas))}
                        <span className="text-border">{"★".repeat(5 - Math.min(5, r.estrellas))}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">{fecha}</span>
                    </div>
                  </div>
                  {r.comentario && (
                    <p className="text-[13px] text-foreground/75 leading-relaxed">{r.comentario}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Cómo conseguir más reseñas */}
      <section className="px-4 pt-6">
        <div className="rounded-2xl bg-[#2B6E80]/8 border border-[#2B6E80]/20 p-4">
          <p className="text-sm font-bold text-[#2B6E80] mb-1">💡 Tip: conseguí más reseñas</p>
          <p className="text-[13px] text-foreground/70 leading-relaxed">
            Mostrá el código QR de tu negocio en el mostrador — los clientes lo escanean y llegan directo a tu ficha para dejar una reseña.
          </p>
          {categoriaSlug && (
            <Link
              href={`/qr/${categoriaSlug}/${slug}`}
              className="mt-3 inline-block text-xs font-bold text-[#2B6E80] underline"
            >
              🖨️ Obtener mi código QR →
            </Link>
          )}
        </div>
      </section>

      {/* Upsell Premium si es básico */}
      {plan !== "premium" && (
        <section className="px-4 pt-4">
          <div className="rounded-2xl bg-[#F4B860]/10 border border-[#F4B860]/30 p-4">
            <p className="text-sm font-bold text-[#8B5E0A] mb-1">⭐ Plan Premium</p>
            <p className="text-[13px] text-foreground/70 leading-relaxed mb-3">
              Con Premium activás WhatsApp directo, subís fotos de tu negocio y aparecés destacado frente a los básicos. Desde $9.900/mes.
            </p>
            <Link
              href="/premium"
              className="inline-block rounded-full bg-[#F4B860] text-[#1A1410] text-xs font-bold px-4 py-2 hover:opacity-90 transition"
            >
              Ver Plan Premium →
            </Link>
          </div>
        </section>
      )}

      {/* Acciones */}
      <section className="px-4 pt-6 flex flex-col gap-2">
        <Link
          href={fichaUrl}
          className="w-full rounded-full bg-foreground text-background text-sm font-semibold py-3 text-center hover:opacity-90 transition"
        >
          Ver mi ficha pública →
        </Link>
        <Link
          href={editarUrl}
          className="w-full rounded-full bg-secondary text-foreground text-sm font-semibold py-3 text-center hover:bg-secondary/80 transition"
        >
          Editar mi negocio
        </Link>
      </section>
    </main>
  );
}

function StatCard({
  label, value, icon, accent, green,
}: {
  label: string; value: number; icon: string; accent?: boolean; green?: boolean;
}) {
  const bg = accent
    ? "bg-[#2B6E80]/8 border-[#2B6E80]/20"
    : green
      ? "bg-emerald-50 border-emerald-200"
      : "bg-white border-border";
  const numColor = accent ? "text-[#2B6E80]" : green ? "text-emerald-700" : "text-foreground";
  return (
    <div className={`rounded-2xl border p-4 ${bg}`}>
      <p className="text-lg mb-1">{icon}</p>
      <p className={`text-3xl font-extrabold ${numColor}`}>{value.toLocaleString("es-CL")}</p>
      <p className="text-xs font-semibold text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function TokenInvalidoView({ expirado = false }: { expirado?: boolean }) {
  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">🔐</p>
        <h1 className="text-xl font-extrabold mb-2">
          {expirado ? "Link expirado" : "Link inválido"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {expirado
            ? "Este link de acceso ya expiró. Solicitá uno nuevo desde la página de tu negocio."
            : "Este link no existe o ya fue usado. Solicitá uno nuevo."}
        </p>
        <Link
          href="/dueno/solicitar"
          className="inline-block rounded-full bg-foreground text-background text-sm font-semibold px-6 py-3 hover:opacity-90 transition"
        >
          Solicitar nuevo link
        </Link>
      </div>
    </main>
  );
}
