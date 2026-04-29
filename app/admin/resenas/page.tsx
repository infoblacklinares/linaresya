import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { aprobarResena, rechazarResena } from "../actions";

export const metadata = {
  title: "Moderar resenas - Admin",
  robots: { index: false, follow: false },
};

type ResenaRow = {
  id: number;
  negocio_id: string;
  autor_nombre: string;
  estrellas: number;
  comentario: string | null;
  aprobada: boolean;
  creado_en: string;
  negocios: {
    nombre: string;
    slug: string;
    categorias: { nombre: string; slug: string; emoji: string } | null;
  } | null;
};

function normalizeNegocio(raw: unknown): ResenaRow["negocios"] {
  const neg = Array.isArray(raw) ? raw[0] : raw;
  if (!neg || typeof neg !== "object") return null;
  const catRaw = (neg as { categorias?: unknown }).categorias;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
  return {
    nombre: String((neg as { nombre?: unknown }).nombre ?? ""),
    slug: String((neg as { slug?: unknown }).slug ?? ""),
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

export default async function ModerarResenas() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [{ data: pendientes }, { data: aprobadas }] = await Promise.all([
    supabaseAdmin
      .from("resenas")
      .select(
        "id, negocio_id, autor_nombre, estrellas, comentario, aprobada, creado_en, negocios:negocio_id(nombre, slug, categorias:categoria_id(nombre, slug, emoji))",
      )
      .eq("aprobada", false)
      .order("creado_en", { ascending: false }),
    supabaseAdmin
      .from("resenas")
      .select(
        "id, negocio_id, autor_nombre, estrellas, comentario, aprobada, creado_en, negocios:negocio_id(nombre, slug, categorias:categoria_id(nombre, slug, emoji))",
      )
      .eq("aprobada", true)
      .order("creado_en", { ascending: false })
      .limit(20),
  ]);

  const pend = ((pendientes ?? []) as unknown[]).map((r) => {
    const x = r as Record<string, unknown>;
    return {
      ...x,
      negocios: normalizeNegocio(x.negocios),
    } as ResenaRow;
  });
  const apr = ((aprobadas ?? []) as unknown[]).map((r) => {
    const x = r as Record<string, unknown>;
    return {
      ...x,
      negocios: normalizeNegocio(x.negocios),
    } as ResenaRow;
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
          <h1 className="text-base font-bold tracking-tight">
            Moderar resenas
          </h1>
        </div>
      </header>

      <section className="px-4 pt-6">
        <h2 className="text-xl font-extrabold tracking-tight mb-1">
          Pendientes
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {pend.length === 0
            ? "Sin resenas en cola. Todo al dia."
            : `${pend.length} resena${pend.length === 1 ? "" : "s"} esperando.`}
        </p>

        <ul className="space-y-3">
          {pend.map((r) => (
            <ResenaCard key={r.id} r={r} pendiente />
          ))}
        </ul>
      </section>

      {apr.length > 0 && (
        <section className="px-4 pt-10">
          <h2 className="text-xl font-extrabold tracking-tight mb-1">
            Aprobadas recientes
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ultimas 20 reseñas aprobadas.
          </p>
          <ul className="space-y-3">
            {apr.map((r) => (
              <ResenaCard key={r.id} r={r} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function ResenaCard({ r, pendiente = false }: { r: ResenaRow; pendiente?: boolean }) {
  const fecha = new Date(r.creado_en).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const negocioUrl =
    r.negocios && r.negocios.categorias
      ? `/${r.negocios.categorias.slug}/${r.negocios.slug}`
      : null;

  return (
    <li className="rounded-2xl bg-white border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-amber-500 font-semibold text-sm">
              {"★".repeat(Math.max(1, Math.min(5, r.estrellas)))}
              <span className="text-muted-foreground/30">
                {"★".repeat(5 - Math.max(1, Math.min(5, r.estrellas)))}
              </span>
            </span>
            <p className="font-bold text-[14px]">{r.autor_nombre}</p>
            {pendiente && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Pendiente
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {r.negocios ? (
              <>
                {r.negocios.categorias?.emoji}{" "}
                {negocioUrl ? (
                  <Link
                    href={negocioUrl}
                    className="font-medium hover:underline"
                    target="_blank"
                  >
                    {r.negocios.nombre}
                  </Link>
                ) : (
                  r.negocios.nombre
                )}
              </>
            ) : (
              "Negocio eliminado"
            )}
            {" - "}
            {fecha}
          </p>
        </div>
      </div>

      {r.comentario && (
        <p className="text-[13px] text-foreground/80 mt-3 leading-relaxed whitespace-pre-line">
          {r.comentario}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {pendiente ? (
          <>
            <form action={aprobarResena}>
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="rounded-full bg-emerald-600 text-white text-xs font-semibold px-4 py-2"
              >
                Aprobar
              </button>
            </form>
            <form action={rechazarResena}>
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="rounded-full bg-rose-100 text-rose-800 text-xs font-semibold px-4 py-2"
              >
                Rechazar
              </button>
            </form>
          </>
        ) : (
          <form action={rechazarResena}>
            <input type="hidden" name="id" value={r.id} />
            <button
              type="submit"
              className="rounded-full bg-secondary text-foreground text-xs font-semibold px-4 py-2 hover:bg-rose-100 hover:text-rose-800"
            >
              Eliminar
            </button>
          </form>
        )}
      </div>
    </li>
  );
}
