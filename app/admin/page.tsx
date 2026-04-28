import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  aprobarNegocio,
  verificarNegocio,
  desactivarNegocio,
  eliminarNegocio,
  logoutAction,
} from "./actions";

export const metadata = {
  title: "Admin - LinaresYa",
  robots: { index: false, follow: false },
};

type NegocioRow = {
  id: string;
  nombre: string;
  slug: string;
  tipo: "negocio" | "independiente";
  plan: "basico" | "premium";
  activo: boolean;
  verificado: boolean;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  descripcion: string | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  disponibilidad: string | null;
  categoria_id: number | null;
  creado_en: string;
};

type Categoria = { id: number; nombre: string; emoji: string; slug: string };

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [
    { data: pendientes },
    { data: activos },
    { data: cats },
    { count: resenasPendientes },
  ] = await Promise.all([
    supabaseAdmin
      .from("negocios")
      .select(
        "id, nombre, slug, tipo, plan, activo, verificado, telefono, whatsapp, direccion, descripcion, a_domicilio, zona_cobertura, disponibilidad, categoria_id, creado_en",
      )
      .eq("activo", false)
      .order("creado_en", { ascending: false }),
    supabaseAdmin
      .from("negocios")
      .select(
        "id, nombre, slug, tipo, plan, activo, verificado, telefono, whatsapp, direccion, descripcion, a_domicilio, zona_cobertura, disponibilidad, categoria_id, creado_en",
      )
      .eq("activo", true)
      .order("creado_en", { ascending: false })
      .limit(50),
    supabaseAdmin.from("categorias").select("id, nombre, emoji, slug"),
    supabaseAdmin
      .from("resenas")
      .select("id", { count: "exact", head: true })
      .eq("aprobada", false),
  ]);

  const pend = (pendientes ?? []) as NegocioRow[];
  const act = (activos ?? []) as NegocioRow[];
  const resCount = resenasPendientes ?? 0;
  const catsMap = new Map<number, Categoria>(
    ((cats ?? []) as Categoria[]).map((c) => [c.id, c]),
  );

  return (
    <main className="flex-1 mx-auto w-full max-w-3xl pb-10">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Volver al sitio">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <h1 className="text-base font-bold tracking-tight">Admin LinaresYa</h1>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Cerrar sesion
            </button>
          </form>
        </div>
      </header>

      <section className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Pendientes" value={pend.length} accent />
          <StatCard label="Activos" value={act.length} />
          <Link
            href="/admin/resenas"
            className={`block rounded-2xl p-4 ue-shadow-sm transition hover:opacity-90 ${
              resCount > 0
                ? "bg-[oklch(0.94_0.04_80)]"
                : "bg-white border border-border"
            }`}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Resenas
            </p>
            <p className="text-3xl font-extrabold mt-1">{resCount}</p>
          </Link>
        </div>
      </section>

      <section className="px-4 pt-8">
        <h2 className="text-xl font-extrabold tracking-tight mb-1">Pendientes de revision</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {pend.length === 0
            ? "No hay negocios pendientes. Buen trabajo."
            : `${pend.length} solicitud${pend.length === 1 ? "" : "es"} esperando aprobacion.`}
        </p>

        <ul className="space-y-3">
          {pend.map((n) => (
            <NegocioCardAdmin key={n.id} negocio={n} categoria={n.categoria_id ? catsMap.get(n.categoria_id) : undefined} pendiente />
          ))}
        </ul>
      </section>

      <section className="px-4 pt-10">
        <h2 className="text-xl font-extrabold tracking-tight mb-1">Activos</h2>
        <p className="text-sm text-muted-foreground mb-4">Ultimos 50 negocios publicados.</p>

        <ul className="space-y-3">
          {act.map((n) => (
            <NegocioCardAdmin key={n.id} negocio={n} categoria={n.categoria_id ? catsMap.get(n.categoria_id) : undefined} />
          ))}
          {act.length === 0 && (
            <li className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Todavia no hay negocios activos.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ue-shadow-sm ${accent ? "bg-[oklch(0.94_0.04_80)]" : "bg-white border border-border"}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-extrabold mt-1">{value}</p>
    </div>
  );
}

function NegocioCardAdmin({
  negocio,
  categoria,
  pendiente = false,
}: {
  negocio: NegocioRow;
  categoria?: Categoria;
  pendiente?: boolean;
}) {
  const fecha = new Date(negocio.creado_en).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <li className="rounded-2xl bg-white border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[15px] truncate">{negocio.nombre}</h3>
            {negocio.verificado && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Verificado
              </span>
            )}
            {negocio.plan === "premium" && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Premium
              </span>
            )}
            {!negocio.activo && (
              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                Pendiente
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {categoria ? `${categoria.emoji} ${categoria.nombre}` : "Sin categoria"}
            {" - "}
            {negocio.tipo === "independiente" ? "Independiente" : "Negocio"}
            {" - "}
            {fecha}
          </p>
        </div>
      </div>

      {negocio.descripcion && (
        <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{negocio.descripcion}</p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {negocio.telefono && (
          <>
            <dt className="text-muted-foreground">Telefono</dt>
            <dd className="font-medium truncate">{negocio.telefono}</dd>
          </>
        )}
        {negocio.whatsapp && (
          <>
            <dt className="text-muted-foreground">WhatsApp</dt>
            <dd className="font-medium truncate">+{negocio.whatsapp}</dd>
          </>
        )}
        {negocio.direccion && (
          <>
            <dt className="text-muted-foreground">Direccion</dt>
            <dd className="font-medium truncate">{negocio.direccion}</dd>
          </>
        )}
        {negocio.a_domicilio && (
          <>
            <dt className="text-muted-foreground">Domicilio</dt>
            <dd className="font-medium">Si</dd>
          </>
        )}
        {negocio.zona_cobertura && (
          <>
            <dt className="text-muted-foreground">Cobertura</dt>
            <dd className="font-medium truncate">{negocio.zona_cobertura}</dd>
          </>
        )}
        {negocio.disponibilidad && (
          <>
            <dt className="text-muted-foreground">Disponibilidad</dt>
            <dd className="font-medium truncate">{negocio.disponibilidad}</dd>
          </>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {pendiente ? (
          <>
            <form action={aprobarNegocio}>
              <input type="hidden" name="id" value={negocio.id} />
              <button type="submit" className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2">
                Aprobar
              </button>
            </form>
            <form action={verificarNegocio}>
              <input type="hidden" name="id" value={negocio.id} />
              <button type="submit" className="rounded-full bg-emerald-600 text-white text-xs font-semibold px-4 py-2">
                Aprobar + Verificar
              </button>
            </form>
            <form action={eliminarNegocio}>
              <input type="hidden" name="id" value={negocio.id} />
              <button type="submit" className="rounded-full bg-secondary text-foreground text-xs font-semibold px-4 py-2 hover:bg-rose-100 hover:text-rose-800">
                Rechazar
              </button>
            </form>
            <Link
              href={`/admin/negocio/${negocio.id}/editar`}
              className="rounded-full bg-white border border-border text-foreground text-xs font-semibold px-4 py-2 hover:bg-secondary"
            >
              Editar
            </Link>
          </>
        ) : (
          <>
            {!negocio.verificado && (
              <form action={verificarNegocio}>
                <input type="hidden" name="id" value={negocio.id} />
                <button type="submit" className="rounded-full bg-emerald-600 text-white text-xs font-semibold px-4 py-2">
                  Marcar verificado
                </button>
              </form>
            )}
            <form action={desactivarNegocio}>
              <input type="hidden" name="id" value={negocio.id} />
              <button type="submit" className="rounded-full bg-secondary text-foreground text-xs font-semibold px-4 py-2">
                Desactivar
              </button>
            </form>
            <form action={eliminarNegocio}>
              <input type="hidden" name="id" value={negocio.id} />
              <button type="submit" className="rounded-full bg-rose-100 text-rose-800 text-xs font-semibold px-4 py-2">
                Eliminar
              </button>
            </form>
            <Link
              href={`/admin/negocio/${negocio.id}/editar`}
              className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2 hover:opacity-90"
            >
              Editar
            </Link>
            <Link
              href={`/admin/negocio/${negocio.id}/estadisticas`}
              className="rounded-full bg-sky-600 text-white text-xs font-semibold px-4 py-2 hover:bg-sky-700"
            >
              Estadisticas
            </Link>
            <Link
              href={categoria ? `/${categoria.slug}/${negocio.slug}` : "/"}
              className="rounded-full bg-white border border-border text-foreground text-xs font-semibold px-4 py-2 hover:bg-secondary"
            >
              Ver en el sitio
            </Link>
          </>
        )}
      </div>
    </li>
  );
}
