import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import BarrasDiarias from "@/components/BarrasDiarias";
import {
  agregarPorNegocio,
  diaCorto,
  diasDelRango,
  filtrarPorNombre,
  ordenValido,
  ordenarNegocios,
  resolverRango,
  serieDiaria,
  totalesDelRango,
  type FilaConNegocio,
} from "@/lib/estadisticas";

export const metadata = {
  title: "Estadisticas - Admin LinaresYa",
  robots: { index: false, follow: false },
};

type SearchParams = {
  periodo?: string;
  desde?: string;
  hasta?: string;
  q?: string;
  orden?: string;
};

/** Une los datos de la fila diaria con el negocio que viene embebido. */
function aFilaConNegocio(row: unknown): FilaConNegocio | null {
  const x = row as Record<string, unknown>;
  const negocioId = String(x.negocio_id ?? "");
  if (!negocioId) return null;

  const negRaw = x.negocios;
  const neg = Array.isArray(negRaw) ? negRaw[0] : negRaw;
  if (!neg || typeof neg !== "object") return null;
  const n = neg as Record<string, unknown>;

  const catRaw = n.categorias;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
  const c = cat && typeof cat === "object" ? (cat as Record<string, unknown>) : null;

  return {
    negocio_id: negocioId,
    fecha: String(x.fecha ?? ""),
    vistas: Number(x.vistas ?? 0),
    clicks_whatsapp: Number(x.clicks_whatsapp ?? 0),
    clicks_telefono: Number(x.clicks_telefono ?? 0),
    clicks_maps: Number(x.clicks_maps ?? 0),
    nombre: String(n.nombre ?? "(sin nombre)"),
    slug: String(n.slug ?? ""),
    categoriaSlug: c ? String(c.slug ?? "") : "",
    categoriaNombre: c ? String(c.nombre ?? "") : "",
  };
}

export default async function AdminEstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const sp = await searchParams;
  const rango = resolverRango(sp);
  const orden = ordenValido(sp.orden);
  const consulta = (sp.q ?? "").trim();

  const [{ data: filasRaw }, { data: sitioRaw, error: sitioError }] = await Promise.all([
    supabaseAdmin
      .from("estadisticas_diarias")
      .select(
        "negocio_id, fecha, vistas, clicks_whatsapp, clicks_telefono, clicks_maps, negocios:negocio_id(nombre, slug, categorias:categoria_id(slug, nombre))",
      )
      .gte("fecha", rango.desde)
      .lte("fecha", rango.hasta)
      .limit(20000),
    // Sesiones del sitio. Tabla aparte que se crea a mano
    // (supabase/eventos_sitio.sql): si no existe, esta consulta falla sola y el
    // resto del panel sigue funcionando.
    supabaseAdmin
      .from("eventos_sitio")
      .select("evento, conteo")
      .gte("fecha", rango.desde)
      .lte("fecha", rango.hasta),
  ]);

  const filas = ((filasRaw ?? []) as unknown[])
    .map(aFilaConNegocio)
    .filter((f): f is FilaConNegocio => f !== null);

  const totales = totalesDelRango(filas);
  const serie = serieDiaria(filas, diasDelRango(rango));
  const agregados = ordenarNegocios(
    filtrarPorNombre(agregarPorNegocio(filas), consulta),
    orden,
  );
  const conActividad = agregados.filter((n) => n.vistas + n.acciones > 0);

  // Sesiones del sitio: `visita_sitio` es el contador actual y `visita_portada`
  // el viejo, que solo miraba la home. Nunca convivieron, asi que sumarlos no
  // cuenta a nadie dos veces.
  const sesiones = sitioError
    ? null
    : ((sitioRaw ?? []) as unknown[]).reduce<number>((total, fila) => {
        const x = fila as { evento?: unknown; conteo?: unknown };
        const evento = String(x.evento ?? "");
        return evento === "visita_sitio" || evento === "visita_portada"
          ? total + Number(x.conteo ?? 0)
          : total;
      }, 0);

  const url = (cambios: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    const periodo = cambios.periodo ?? rango.periodo;
    params.set("periodo", periodo);
    if (periodo === "rango") {
      params.set("desde", cambios.desde ?? rango.desde);
      params.set("hasta", cambios.hasta ?? rango.hasta);
    }
    const q = cambios.q ?? consulta;
    if (q) params.set("q", q);
    params.set("orden", cambios.orden ?? orden);
    return `/admin/estadisticas?${params.toString()}`;
  };

  return (
    <main className="flex-1 mx-auto w-full max-w-3xl px-4 pb-12">
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
              Estadisticas de LinaresYa
            </p>
            <h1 className="text-lg font-extrabold tracking-tight leading-tight truncate">
              {rango.etiqueta}
            </h1>
          </div>
        </div>
      </header>

      {/* Filtros de periodo */}
      <section className="flex flex-wrap items-center gap-2">
        {([
          ["hoy", "Hoy"],
          ["7", "7 dias"],
          ["30", "30 dias"],
        ] as const).map(([valor, texto]) => (
          <Link
            key={valor}
            href={url({ periodo: valor })}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              rango.periodo === valor
                ? "bg-foreground text-background"
                : "bg-white border border-border text-foreground hover:bg-secondary"
            }`}
          >
            {texto}
          </Link>
        ))}
        <form action="/admin/estadisticas" className="flex items-center gap-2">
          <input type="hidden" name="periodo" value="rango" />
          <input type="hidden" name="orden" value={orden} />
          {consulta && <input type="hidden" name="q" value={consulta} />}
          <input
            type="date"
            name="desde"
            defaultValue={rango.desde}
            aria-label="Desde"
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs"
          />
          <input
            type="date"
            name="hasta"
            defaultValue={rango.hasta}
            aria-label="Hasta"
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs"
          />
          <button
            type="submit"
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              rango.periodo === "rango"
                ? "bg-foreground text-background"
                : "bg-white border border-border hover:bg-secondary"
            }`}
          >
            Aplicar
          </button>
        </form>
      </section>

      {/* Totales */}
      <section className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Metrica label="Vistas de fichas" valor={totales.vistas} destacada />
        <Metrica label="Acciones" valor={totales.acciones} hint="llamar + WhatsApp + llegar" />
        <Metrica
          label="Tasa de accion"
          valor={totales.tasaAccion === null ? "—" : `${totales.tasaAccion.toFixed(1)}%`}
          hint={totales.tasaAccion === null ? "sin vistas en el periodo" : "acciones / vistas"}
        />
        <Metrica label="Llamadas" valor={totales.llamadas} />
        <Metrica label="WhatsApp" valor={totales.whatsapp} />
        <Metrica label="Como llegar" valor={totales.maps} />
      </section>

      {sesiones !== null && (
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          Sesiones en el sitio en el periodo: <strong>{sesiones.toLocaleString("es-CL")}</strong>.
          Cuenta una por sesion de navegador y es del sitio completo, no de una ficha.
        </p>
      )}

      <p className="mt-2 rounded-2xl bg-secondary/50 px-4 py-3 text-[11px] text-muted-foreground leading-relaxed">
        Estos numeros salen de los contadores diarios por ficha. Todavia <strong>no</strong> se
        miden visitantes unicos por negocio, clicks de Instagram, compartidos ni el origen de
        la visita: eso llega con el sistema de eventos (LY-005).
      </p>

      {/* Evolucion */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Vistas por dia
          </h2>
          <span className="text-[11px] text-muted-foreground">{rango.dias} dias</span>
        </div>
        <BarrasDiarias serie={serie.map((s) => ({ fecha: s.fecha, valor: s.vistas }))} />
      </section>

      {/* Por negocio */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Por negocio
          </h2>
          <form action="/admin/estadisticas" className="flex items-center gap-2">
            <input type="hidden" name="periodo" value={rango.periodo} />
            {rango.periodo === "rango" && (
              <>
                <input type="hidden" name="desde" value={rango.desde} />
                <input type="hidden" name="hasta" value={rango.hasta} />
              </>
            )}
            <input type="hidden" name="orden" value={orden} />
            <input
              type="search"
              name="q"
              defaultValue={consulta}
              placeholder="Buscar negocio"
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs w-40"
            />
            <button
              type="submit"
              className="rounded-full bg-white border border-border px-3 py-1.5 text-xs font-bold hover:bg-secondary"
            >
              Buscar
            </button>
          </form>
        </div>

        {conActividad.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {consulta
              ? `Ningun negocio con actividad coincide con "${consulta}" en este periodo.`
              : "Ningun negocio registro actividad en este periodo."}
          </div>
        ) : (
          <div className="rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">
                    <Link href={url({ orden: "nombre" })} className="hover:underline">
                      Negocio{orden === "nombre" ? " ↓" : ""}
                    </Link>
                  </th>
                  <th className="text-right px-3 py-2 font-semibold">
                    <Link href={url({ orden: "vistas" })} className="hover:underline">
                      Vistas{orden === "vistas" ? " ↓" : ""}
                    </Link>
                  </th>
                  <th className="text-right px-3 py-2 font-semibold">
                    <Link href={url({ orden: "acciones" })} className="hover:underline">
                      Acciones{orden === "acciones" ? " ↓" : ""}
                    </Link>
                  </th>
                  <th className="text-right px-3 py-2 font-semibold">Tel</th>
                  <th className="text-right px-3 py-2 font-semibold">WA</th>
                  <th className="text-right px-3 py-2 font-semibold">Mapa</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {conActividad.map((n) => (
                  <tr key={n.negocio_id} className="border-t border-border">
                    <td className="px-3 py-2">
                      <p className="font-semibold truncate max-w-[13rem]">{n.nombre}</p>
                      {n.categoriaNombre && (
                        <p className="text-[10px] text-muted-foreground">{n.categoriaNombre}</p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{n.vistas}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{n.acciones}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{n.llamadas}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{n.whatsapp}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{n.maps}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/negocio/${n.negocio_id}/estadisticas`}
                        className="text-[11px] font-semibold text-[#2B6E80] hover:underline"
                      >
                        Detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {conActividad.length > 0 && agregados.length > conActividad.length && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Se omiten {agregados.length - conActividad.length} negocios sin ninguna vista ni
            accion en el periodo.
          </p>
        )}
      </section>

      <section className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/admin"
          className="rounded-full bg-white border border-border text-foreground text-xs font-semibold px-4 py-2 hover:bg-secondary"
        >
          Volver al panel
        </Link>
        <span className="text-[11px] text-muted-foreground self-center">
          Periodo: {diaCorto(rango.desde)} al {diaCorto(rango.hasta)}
        </span>
      </section>
    </main>
  );
}

function Metrica({
  label,
  valor,
  destacada = false,
  hint,
}: {
  label: string;
  valor: number | string;
  destacada?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        destacada ? "bg-[#2B6E80]/8 border border-[#2B6E80]/20" : "bg-white border border-border"
      }`}
    >
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-extrabold mt-1 tabular-nums">
        {typeof valor === "number" ? valor.toLocaleString("es-CL") : valor}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}
