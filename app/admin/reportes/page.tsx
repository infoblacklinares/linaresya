import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { resolverReporte, eliminarReporte } from "../actions";

export const metadata = {
  title: "Reportes - Admin",
  robots: { index: false, follow: false },
};

const MOTIVO_LABELS: Record<string, string> = {
  info_incorrecta: "Info incorrecta",
  duplicado: "Duplicado",
  cerrado_definitivo: "Cerrado definitivamente",
  no_existe: "No existe",
  spam_o_falso: "Spam o info falsa",
  contenido_inapropiado: "Contenido inapropiado",
  otro: "Otro",
};

const MOTIVO_COLORS: Record<string, string> = {
  info_incorrecta: "bg-amber-100 text-amber-900",
  duplicado: "bg-violet-100 text-violet-800",
  cerrado_definitivo: "bg-zinc-100 text-zinc-800",
  no_existe: "bg-rose-100 text-rose-800",
  spam_o_falso: "bg-red-100 text-red-800",
  contenido_inapropiado: "bg-red-100 text-red-800",
  otro: "bg-secondary text-foreground",
};

type ReporteRow = {
  id: number;
  negocio_id: string;
  motivo: string;
  descripcion: string | null;
  ip: string | null;
  resuelto: boolean;
  creado_en: string;
  resuelto_en: string | null;
  negocios: {
    nombre: string;
    slug: string;
    activo: boolean;
    categorias: { nombre: string; slug: string; emoji: string } | null;
  } | null;
};

function normalizeNegocio(raw: unknown): ReporteRow["negocios"] {
  const neg = Array.isArray(raw) ? raw[0] : raw;
  if (!neg || typeof neg !== "object") return null;
  const catRaw = (neg as { categorias?: unknown }).categorias;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
  return {
    nombre: String((neg as { nombre?: unknown }).nombre ?? ""),
    slug: String((neg as { slug?: unknown }).slug ?? ""),
    activo: Boolean((neg as { activo?: unknown }).activo),
    categorias:
      cat && typeof cat === "object"
        ? {
            nombre: String((cat as { nombre?: unknown }).nombre ?? ""),
            slug: String((cat as { slug?: unknown }).slug ?? ""),
            emoji: String((cat as { emoji?: unknown }).emoji ?? ""),
          }
        : null,
  };
}

export default async function ModerarReportes() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const SELECT =
    "id, negocio_id, motivo, descripcion, ip, resuelto, creado_en, resuelto_en, negocios:negocio_id(nombre, slug, activo, categorias:categoria_id(nombre, slug, emoji))";

  const [{ data: pendientes }, { data: resueltos }] = await Promise.all([
    supabaseAdmin
      .from("reportes")
      .select(SELECT)
      .eq("resuelto", false)
      .order("creado_en", { ascending: false }),
    supabaseAdmin
      .from("reportes")
      .select(SELECT)
      .eq("resuelto", true)
      .order("resuelto_en", { ascending: false })
      .limit(20),
  ]);

  const pend = ((pendientes ?? []) as unknown[]).map((r) => {
    const x = r as Record<string, unknown>;
    return { ...x, negocios: normalizeNegocio(x.negocios) } as ReporteRow;
  });
  const res = ((resueltos ?? []) as unknown[]).map((r) => {
    const x = r as Record<string, unknown>;
    return { ...x, negocios: normalizeNegocio(x.negocios) } as ReporteRow;
  });

  return (
    <main className="flex-1 mx-auto w-full max-w-3xl pb-10">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-2">
          <Link
            href="/admin"
            aria-label="Volver al admin"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-base font-bold tracking-tight">Reportes</h1>
        </div>
      </header>

      <section className="px-4 pt-6">
        <h2 className="text-xl font-extrabold tracking-tight mb-1">
          Pendientes
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {pend.length === 0
            ? "Sin reportes nuevos. Todo en orden."
            : `${pend.length} reporte${pend.length === 1 ? "" : "s"} esperando.`}
        </p>

        <ul className="space-y-3">
          {pend.map((r) => (
            <ReporteCard key={r.id} r={r} pendiente />
          ))}
        </ul>
      </section>

      {res.length > 0 && (
        <section className="px-4 pt-10">
          <h2 className="text-xl font-extrabold tracking-tight mb-1">
            Resueltos recientes
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ultimos 20 reportes ya cerrados.
          </p>
          <ul className="space-y-3">
            {res.map((r) => (
              <ReporteCard key={r.id} r={r} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function ReporteCard({ r, pendiente = false }: { r: ReporteRow; pendiente?: boolean }) {
  const fecha = new Date(r.creado_en).toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const motivoColor = MOTIVO_COLORS[r.motivo] ?? "bg-secondary text-foreground";
  const motivoLabel = MOTIVO_LABELS[r.motivo] ?? r.motivo;
  const negocioUrl =
    r.negocios && r.negocios.categorias
      ? `/${r.negocios.categorias.slug}/${r.negocios.slug}`
      : null;

  return (
    <li className="rounded-2xl bg-white border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${motivoColor}`}
            >
              {motivoLabel}
            </span>
            {r.negocios && !r.negocios.activo && (
              <span className="text-[10px] font-bold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full">
                Negocio inactivo
              </span>
            )}
            {!pendiente && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Resuelto
              </span>
            )}
          </div>
          <div className="mt-2">
            {r.negocios ? (
              <p className="font-bold text-[15px]">
                {r.negocios.categorias?.emoji}{" "}
                {negocioUrl ? (
                  <Link
                    href={negocioUrl}
                    target="_blank"
                    className="hover:underline"
                  >
                    {r.negocios.nombre}
                  </Link>
                ) : (
                  r.negocios.nombre
                )}
              </p>
            ) : (
              <p className="font-bold text-[15px] text-muted-foreground">
                Negocio eliminado
              </p>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {fecha}
              {r.ip && ` · IP: ${r.ip}`}
            </p>
          </div>
        </div>
      </div>

      {r.descripcion && (
        <div className="mt-3 rounded-xl bg-secondary/40 px-3 py-2.5 text-[13px] text-foreground/90 whitespace-pre-line">
          {r.descripcion}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {pendiente ? (
          <>
            <form action={resolverReporte}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="nuevo_estado" value="true" />
              <button
                type="submit"
                className="rounded-full bg-emerald-600 text-white text-xs font-semibold px-4 py-2"
              >
                Marcar resuelto
              </button>
            </form>
            {r.negocios && (
              <Link
                href={`/admin/negocio/${r.negocio_id}/editar`}
                className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2"
              >
                Editar negocio
              </Link>
            )}
            <form action={eliminarReporte}>
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="rounded-full bg-rose-100 text-rose-800 text-xs font-semibold px-4 py-2"
              >
                Eliminar reporte
              </button>
            </form>
          </>
        ) : (
          <>
            <form action={resolverReporte}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="nuevo_estado" value="false" />
              <button
                type="submit"
                className="rounded-full bg-secondary text-foreground text-xs font-semibold px-4 py-2"
              >
                Reabrir
              </button>
            </form>
            <form action={eliminarReporte}>
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="rounded-full bg-secondary text-foreground text-xs font-semibold px-4 py-2 hover:bg-rose-100 hover:text-rose-800"
              >
                Eliminar
              </button>
            </form>
          </>
        )}
      </div>
    </li>
  );
}
