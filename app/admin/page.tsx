import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  activarPremium30Dias,
  aprobarNegocio,
  verificarNegocio,
  desactivarNegocio,
  eliminarNegocio,
  logoutAction,
  quitarPremium,
} from "./actions";
import ConfirmDeleteButton from "./ConfirmDeleteButton";
import { fechaCL, normalizarTexto } from "@/lib/estadisticas";
import {
  filtrarPorFechas,
  porFuente,
  resumenEventos,
  type FilaEvento,
} from "@/lib/eventos";

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
  premium_hasta: string | null;
};

type Categoria = { id: number; nombre: string; emoji: string; slug: string };

/**
 * Lo que le falta a una ficha para servir. Son los filtros del listado: sirven
 * para trabajar la lista, no para mirarla (LY-033).
 */
const FALTANTES = {
  telefono: { etiqueta: "Sin telefono", test: (n: NegocioRow) => !n.telefono },
  direccion: { etiqueta: "Sin direccion", test: (n: NegocioRow) => !n.direccion },
  descripcion: { etiqueta: "Sin descripcion", test: (n: NegocioRow) => !n.descripcion },
  categoria: { etiqueta: "Sin categoria", test: (n: NegocioRow) => !n.categoria_id },
} as const;

type Faltante = keyof typeof FALTANTES;

function faltanteValido(valor: string | undefined): Faltante | null {
  return valor && valor in FALTANTES ? (valor as Faltante) : null;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; falta?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const sp = await searchParams;
  const consulta = (sp.q ?? "").trim();
  const falta = faltanteValido(sp.falta);

  // Fecha hace 7 dias en formato YYYY-MM-DD para queries de "ultima semana"
  // eslint-disable-next-line react-hooks/purity -- Server Component: se renderiza una vez por request, leer el reloj aca es correcto
  const haceSieteDias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [
    { data: pendientes },
    { data: activos },
    { data: cats },
    { count: resenasPendientes },
    { count: nuevosNegocios7d },
    { count: nuevasResenas7d },
    { data: stats7dRaw },
    { count: reportesPendientes },
    { count: popup7d, error: popupError },
    { data: embudoRaw, error: embudoError },
    { data: eventosHoyRaw, error: eventosHoyError },
  ] = await Promise.all([
    supabaseAdmin
      .from("negocios")
      .select(
        "id, nombre, slug, tipo, plan, activo, verificado, telefono, whatsapp, direccion, descripcion, a_domicilio, zona_cobertura, disponibilidad, categoria_id, creado_en, premium_hasta",
      )
      .eq("activo", false)
      .order("creado_en", { ascending: false }),
    supabaseAdmin
      .from("negocios")
      .select(
        "id, nombre, slug, tipo, plan, activo, verificado, telefono, whatsapp, direccion, descripcion, a_domicilio, zona_cobertura, disponibilidad, categoria_id, creado_en, premium_hasta",
      )
      .eq("activo", true)
      .order("creado_en", { ascending: false })
      .limit(200),
    supabaseAdmin.from("categorias").select("id, nombre, emoji, slug"),
    supabaseAdmin
      .from("resenas")
      .select("id", { count: "exact", head: true })
      .eq("aprobada", false),
    supabaseAdmin
      .from("negocios")
      .select("id", { count: "exact", head: true })
      .eq("activo", true)
      .gte("creado_en", haceSieteDias),
    supabaseAdmin
      .from("resenas")
      .select("id", { count: "exact", head: true })
      .gte("creado_en", haceSieteDias),
    supabaseAdmin
      .from("estadisticas_diarias")
      .select(
        "negocio_id, vistas, clicks_whatsapp, clicks_telefono, clicks_maps, negocios:negocio_id(nombre, slug, categorias:categoria_id(slug))",
      )
      .gte("fecha", haceSieteDias),
    supabaseAdmin
      .from("reportes")
      .select("id", { count: "exact", head: true })
      .eq("resuelto", false),

    // Altas que trajo el popup de la portada. Va en su propia consulta a
    // proposito: la columna `origen` se crea con supabase/origen_negocios.sql,
    // que se corre a mano, y si todavia no existe esta falla sola sin voltear
    // el resto del panel.
    supabaseAdmin
      .from("negocios")
      .select("id", { count: "exact", head: true })
      .eq("origen", "popup")
      .gte("creado_en", haceSieteDias),

    // Embudo del popup: vistos, cerrados y enviados de la semana. Igual que la
    // consulta de arriba, va aparte porque la tabla se crea a mano con
    // supabase/eventos_sitio.sql: si no existe, esta falla sola.
    supabaseAdmin
      .from("eventos_sitio")
      .select("evento, conteo")
      .gte("fecha", haceSieteDias),

    // Eventos de hoy (LY-005). Es el dato mas fresco que existe: dice si el
    // directorio esta vivo ahora, no hace una semana. Tabla que se crea a
    // mano: si no existe, esta consulta falla sola y el bloque no aparece.
    supabaseAdmin
      .from("eventos_negocio")
      .select("evento, sesion, fuente, campana, negocio_id, creado_en")
      .gte("creado_en", `${fechaCL(0)}T00:00:00-05:00`)
      .limit(20000),
  ]);

  const pend = (pendientes ?? []) as NegocioRow[];
  const act = (activos ?? []) as NegocioRow[];
  const resCount = resenasPendientes ?? 0;
  const reportesCount = reportesPendientes ?? 0;
  const nuevos7d = nuevosNegocios7d ?? 0;
  // null = la columna `origen` aun no existe; en ese caso no mostramos la cifra
  // en vez de mostrar un cero que se leeria como "el popup no trajo a nadie".
  const desdePopup7d = popupError ? null : (popup7d ?? 0);

  // Embudo del popup. null = la tabla eventos_sitio todavia no existe.
  const embudo = embudoError
    ? null
    : (() => {
        const suma = {
          // `visita_portada` es el contador viejo, que solo miraba la home.
          // Se suma con el nuevo porque nunca convivieron: cada sesion la
          // conto uno u otro segun la version desplegada, asi que sumarlos da
          // el total de sesiones sin contar ninguna dos veces.
          visita_sitio: 0,
          visita_portada: 0,
          popup_visto: 0,
          popup_cerrado: 0,
          popup_click: 0,
        };
        for (const fila of (embudoRaw ?? []) as unknown[]) {
          const x = fila as { evento?: unknown; conteo?: unknown };
          const evento = String(x.evento ?? "");
          if (evento in suma) {
            suma[evento as keyof typeof suma] += Number(x.conteo ?? 0);
          }
        }
        return { ...suma, visitas: suma.visita_sitio + suma.visita_portada };
      })();
  const resenas7d = nuevasResenas7d ?? 0;
  const catsMap = new Map<number, Categoria>(
    ((cats ?? []) as Categoria[]).map((c) => [c.id, c]),
  );

  // Agregar stats por negocio a partir de las filas diarias
  type StatNeg = {
    id: string;
    nombre: string;
    slug: string;
    categoriaSlug: string;
    vistas: number;
    clicks: number;
  };
  const aggMap = new Map<string, StatNeg>();
  let totalVistas7d = 0;
  let totalClicks7d = 0;
  for (const row of (stats7dRaw ?? []) as unknown[]) {
    const x = row as Record<string, unknown>;
    const negId = String(x.negocio_id ?? "");
    if (!negId) continue;
    const v = Number(x.vistas ?? 0);
    const c =
      Number(x.clicks_whatsapp ?? 0) +
      Number(x.clicks_telefono ?? 0) +
      Number(x.clicks_maps ?? 0);
    totalVistas7d += v;
    totalClicks7d += c;
    const negRaw = (x as { negocios?: unknown }).negocios;
    const neg = Array.isArray(negRaw) ? negRaw[0] : negRaw;
    if (!neg || typeof neg !== "object") continue;
    const catRaw = (neg as { categorias?: unknown }).categorias;
    const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
    const catSlug =
      cat && typeof cat === "object"
        ? String((cat as { slug?: unknown }).slug ?? "")
        : "";
    const existing = aggMap.get(negId);
    if (existing) {
      existing.vistas += v;
      existing.clicks += c;
    } else {
      aggMap.set(negId, {
        id: negId,
        nombre: String((neg as { nombre?: unknown }).nombre ?? ""),
        slug: String((neg as { slug?: unknown }).slug ?? ""),
        categoriaSlug: catSlug,
        vistas: v,
        clicks: c,
      });
    }
  }
  const topVistos = Array.from(aggMap.values())
    .sort((a, b) => b.vistas - a.vistas)
    .slice(0, 5);

  // Lo de hoy, desde los eventos: vistas, personas distintas y de donde vienen.
  const eventosHoy = eventosHoyError
    ? []
    : filtrarPorFechas(
        ((eventosHoyRaw ?? []) as unknown[]).map((f) => f as FilaEvento),
        fechaCL(0),
        fechaCL(0),
      );
  const hoy = resumenEventos(eventosHoy);
  const fuentesHoy = porFuente(eventosHoy).slice(0, 4);

  // Calidad del directorio: cuantas fichas activas les falta algo. Cada numero
  // es un enlace que filtra el listado, para poder arreglarlas de una.
  const calidad = (Object.keys(FALTANTES) as Faltante[])
    .map((clave) => ({
      clave,
      etiqueta: FALTANTES[clave].etiqueta,
      total: act.filter(FALTANTES[clave].test).length,
    }))
    .filter((c) => c.total > 0);

  const premiumActivos = act.filter((n) => n.plan === "premium").length;

  // Busqueda y filtro del listado de activos.
  const hayFiltro = Boolean(consulta || falta);
  const actFiltrados = (() => {
    let lista = act;
    if (falta) lista = lista.filter(FALTANTES[falta].test);
    if (consulta) {
      const q = normalizarTexto(consulta);
      lista = lista.filter((n) =>
        [n.nombre, n.slug, n.telefono ?? "", n.direccion ?? ""].some((campo) =>
          normalizarTexto(campo).includes(q),
        ),
      );
    }
    return lista;
  })();

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <Link
            href="/admin/reportes"
            className={`block rounded-2xl p-4 ue-shadow-sm transition hover:opacity-90 ${
              reportesCount > 0
                ? "bg-rose-50 border border-rose-200"
                : "bg-white border border-border"
            }`}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Reportes
            </p>
            <p className="text-3xl font-extrabold mt-1">{reportesCount}</p>
          </Link>
        </div>
        <Link
          href="/admin/estadisticas"
          className="mt-3 flex items-center justify-between rounded-2xl bg-[#2B6E80] text-white px-4 py-3.5 hover:opacity-90 transition"
        >
          <span className="text-sm font-bold">📊 Estadisticas</span>
          <span className="text-xs font-semibold opacity-80">Hoy, 7, 30 dias o rango →</span>
        </Link>
        <Link
          href="/admin/resultados"
          className="mt-2 flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 hover:opacity-90 transition"
        >
          <span className="text-sm font-bold">🧾 Resultados del negocio</span>
          <span className="text-xs font-semibold text-muted-foreground">
            Lo que dice que le llego →
          </span>
        </Link>
        <Link
          href="/admin/negocio/nuevo"
          className="mt-3 flex items-center justify-between rounded-2xl bg-foreground text-background px-4 py-3.5 hover:opacity-90 transition"
        >
          <span className="text-sm font-bold">➕ Agregar negocio</span>
          <span className="text-xs font-semibold opacity-70">Crear activo →</span>
        </Link>
        <Link
          href="/admin/historias"
          className="mt-2 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#F4B860]/20 to-[#C05A46]/10 border border-[#F4B860]/40 px-4 py-3 hover:opacity-90 transition"
        >
          <span className="text-sm font-bold">📸 Historias premium</span>
          <span className="text-xs font-semibold text-muted-foreground">Gestionar →</span>
        </Link>
        <Link
          href="/admin/eventos"
          className="mt-2 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#2B6E80]/10 to-[#3D5A45]/10 border border-[#2B6E80]/30 px-4 py-3 hover:opacity-90 transition"
        >
          <span className="text-sm font-bold">🗓️ Eventos de Linares</span>
          <span className="text-xs font-semibold text-muted-foreground">Gestionar →</span>
        </Link>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Premium activos: <strong>{premiumActivos}</strong> de {act.length}.{" "}
          {premiumActivos === 0
            ? "Ninguno esta pagando todavia."
            : "Se cambian con el boton de cada negocio."}
        </p>
      </section>

      <section className="px-4 pt-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Esta semana
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MiniStat label="Negocios nuevos" value={nuevos7d} />
          {desdePopup7d !== null && (
            <MiniStat label="Desde el popup" value={desdePopup7d} />
          )}
          <MiniStat label="Resenas nuevas" value={resenas7d} />
          <MiniStat label="Vistas" value={totalVistas7d} />
          <MiniStat label="Clicks" value={totalClicks7d} />
        </div>
      </section>

      {/* Hoy, desde los eventos. Es el dato mas fresco que existe: dice si el
          directorio esta vivo ahora, no hace una semana. Solo aparece si hay
          algo, para no mostrar una fila de ceros. */}
      {!eventosHoyError && hoy.total > 0 && (
        <section className="px-4 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Hoy
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MiniStat label="Visitantes" value={hoy.unicos} />
            <MiniStat label="Vistas" value={hoy.vistas} />
            <MiniStat label="Acciones" value={hoy.acciones} />
            <MiniStat label="Eventos" value={hoy.total} />
          </div>
          {fuentesHoy.length > 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
              Llegaron desde:{" "}
              {fuentesHoy.map((f, i) => (
                <span key={f.clave}>
                  {i > 0 ? " · " : ""}
                  <strong>{f.clave}</strong> {f.vistas}
                </span>
              ))}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Visitantes son sesiones distintas de navegador, no personas identificadas.
          </p>
          <Link
            href="/admin/estadisticas?periodo=hoy"
            className="mt-2 inline-block text-[11px] font-bold text-[#2B6E80] hover:underline"
          >
            Ver el detalle de hoy →
          </Link>
        </section>
      )}

      {/* Calidad del directorio: cada numero filtra el listado de abajo, para
          poder arreglar las fichas de corrido en vez de buscarlas una por una. */}
      {calidad.length > 0 && (
        <section className="px-4 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Fichas a las que les falta algo
          </h2>
          <div className="flex flex-wrap gap-2">
            {calidad.map((c) => (
              <Link
                key={c.clave}
                href={`/admin?falta=${c.clave}`}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  falta === c.clave
                    ? "bg-foreground text-background"
                    : "bg-white border border-border hover:bg-secondary"
                }`}
              >
                {c.etiqueta}: {c.total}
              </Link>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Una ficha sin telefono no genera llamadas, y sin direccion no genera
            &quot;como llegar&quot;. Toca un filtro y aparecen abajo para editarlas.
          </p>
        </section>
      )}

      {embudo && (embudo.visitas > 0 || embudo.popup_visto > 0) && (
        <section className="px-4 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Popup para sumar negocios
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MiniStat label="Visitas" value={embudo.visitas} />
            <MiniStat label="Lo vieron" value={embudo.popup_visto} />
            <MiniStat label="Fueron al form" value={embudo.popup_click} />
            <MiniStat label="Publicaron" value={desdePopup7d ?? 0} />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
            Visitas cuenta una por sesion del navegador; el popup aparece una vez
            cada 7 dias por navegador, asi que vistos sobre visitas da el orden de
            magnitud, no un porcentaje exacto.
            {embudo.popup_visto > 0 && (
              <>
                {" "}De los que lo vieron, fueron al formulario el{" "}
                <strong>
                  {Math.round((embudo.popup_click / embudo.popup_visto) * 100)}%
                </strong>
                , y publicaron {desdePopup7d ?? 0}.
              </>
            )}
          </p>
        </section>
      )}

      {topVistos.length > 0 && (
        <section className="px-4 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Top 5 mas vistos
          </h2>
          <ul className="rounded-2xl bg-white border border-border divide-y divide-border overflow-hidden">
            {topVistos.map((t, i) => {
              const fichaUrl =
                t.categoriaSlug && t.slug
                  ? `/${t.categoriaSlug}/${t.slug}`
                  : null;
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <span className="text-[11px] font-bold text-muted-foreground w-5 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {fichaUrl ? (
                      <Link
                        href={fichaUrl}
                        className="font-semibold text-sm truncate block hover:underline"
                      >
                        {t.nombre}
                      </Link>
                    ) : (
                      <p className="font-semibold text-sm truncate">{t.nombre}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {t.vistas} vistas · {t.clicks} clicks
                    </p>
                  </div>
                  <Link
                    href={`/admin/negocio/${t.id}/estadisticas`}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Stats {"→"}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
        <p className="text-sm text-muted-foreground mb-3">
          {hayFiltro
            ? `${actFiltrados.length} de ${act.length} negocios publicados.`
            : `${act.length} negocios publicados, agrupados por categoría.`}
        </p>

        {/* Buscador. Con 164 fichas, encontrar una a mano era el cuello de
            botella para editar: habia que abrir la categoria y scrollear.
            Busca por nombre, slug, telefono o direccion, sin tildes. */}
        <form action="/admin" className="flex flex-wrap items-center gap-2 mb-4">
          {falta && <input type="hidden" name="falta" value={falta} />}
          <input
            type="search"
            name="q"
            defaultValue={consulta}
            placeholder="Buscar por nombre, telefono o direccion"
            className="flex-1 min-w-[12rem] rounded-full border border-border bg-white px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-foreground text-background text-xs font-bold px-4 py-2"
          >
            Buscar
          </button>
          {hayFiltro && (
            <Link
              href="/admin"
              className="rounded-full bg-white border border-border text-xs font-bold px-4 py-2 hover:bg-secondary"
            >
              Limpiar
            </Link>
          )}
        </form>

        {falta && (
          <p className="mb-3 text-xs font-semibold text-[#8B5E0A]">
            Filtrando: {FALTANTES[falta].etiqueta.toLowerCase()}
          </p>
        )}

        {act.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Todavia no hay negocios activos.
          </div>
        ) : hayFiltro ? (
          actFiltrados.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Ningun negocio coincide. Prueba con menos letras.
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white divide-y divide-border overflow-hidden">
              {actFiltrados.map((n) => (
                <NegocioRowAdmin key={n.id} negocio={n} />
              ))}
            </div>
          )
        ) : (() => {
          // Agrupar por categoria_id
          const grupos = new Map<number | null, NegocioRow[]>();
          for (const n of act) {
            const key = n.categoria_id ?? null;
            if (!grupos.has(key)) grupos.set(key, []);
            grupos.get(key)!.push(n);
          }
          // Ordenar: categorías con más negocios primero, sin categoría al final
          const entries = Array.from(grupos.entries()).sort((a, b) => {
            if (a[0] === null) return 1;
            if (b[0] === null) return -1;
            return b[1].length - a[1].length;
          });
          return (
            <div className="space-y-2">
              {entries.map(([catId, negocios]) => {
                const cat = catId !== null ? catsMap.get(catId) : undefined;
                return (
                  <details key={catId ?? "sin-cat"} className="group rounded-2xl border border-border bg-white overflow-hidden">
                    <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors list-none">
                      <span className="text-xl">{cat?.emoji ?? "📦"}</span>
                      <span className="flex-1 text-sm font-bold text-foreground truncate">
                        {cat?.nombre ?? "Sin categoría"}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground bg-secondary rounded-full px-2 py-0.5 shrink-0">
                        {negocios.length}
                      </span>
                      {/* Flecha: rota cuando está abierto via CSS group-open */}
                      <svg
                        className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="divide-y divide-border border-t border-border">
                      {negocios.map((n) => (
                        <NegocioRowAdmin key={n.id} negocio={n} />
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          );
        })()}
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white border border-border p-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-extrabold mt-0.5">{value}</p>
    </div>
  );
}

// Estado de vencimiento del premium según premium_hasta.
function estadoPremium(plan: string, premiumHasta: string | null): { texto: string; clase: string } | null {
  if (plan !== "premium" || !premiumHasta) return null;
  const dias = Math.floor((new Date(premiumHasta).getTime() - Date.now()) / 86_400_000);
  if (dias < 0) return { texto: "Vencido", clase: "bg-rose-100 text-rose-800" };
  if (dias === 0) return { texto: "Vence hoy", clase: "bg-rose-100 text-rose-800" };
  if (dias <= 7) return { texto: `Vence en ${dias}d`, clase: "bg-orange-100 text-orange-800" };
  return null;
}

function NegocioRowAdmin({ negocio }: { negocio: NegocioRow }) {
  const fecha = new Date(negocio.creado_en).toLocaleDateString("es-CL", {
    day: "2-digit", month: "short",
  });
  const venc = estadoPremium(negocio.plan, negocio.premium_hasta);
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      {/* Nombre + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-foreground truncate">{negocio.nombre}</span>
          {negocio.verificado && (
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full shrink-0">✓ Verif</span>
          )}
          {negocio.plan === "premium" && (
            <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full shrink-0">⭐ Prem</span>
          )}
          {venc && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${venc.clase}`}>⏳ {venc.texto}</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
          {negocio.telefono ?? negocio.direccion ?? negocio.tipo} · {fecha}
        </p>
      </div>
      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/admin/negocio/${negocio.id}/editar`}
          className="text-[11px] font-semibold text-[#2B6E80] hover:underline px-1"
        >
          Editar
        </Link>
        {negocio.plan === "premium" ? (
          <form action={quitarPremium}>
            <input type="hidden" name="id" value={negocio.id} />
            <button type="submit" className="text-[11px] font-semibold text-amber-700 hover:underline px-1">
              Quitar Premium
            </button>
          </form>
        ) : (
          <form action={activarPremium30Dias}>
            <input type="hidden" name="id" value={negocio.id} />
            <button type="submit" className="text-[11px] font-semibold text-amber-700 hover:underline px-1">
              ⭐ Premium 30d
            </button>
          </form>
        )}
        {!negocio.verificado && (
          <form action={verificarNegocio}>
            <input type="hidden" name="id" value={negocio.id} />
            <button type="submit" className="text-[11px] font-semibold text-emerald-700 hover:underline px-1">
              Verificar
            </button>
          </form>
        )}
        <form action={desactivarNegocio}>
          <input type="hidden" name="id" value={negocio.id} />
          <button type="submit" className="text-[11px] font-semibold text-muted-foreground hover:text-rose-600 px-1">
            Desactivar
          </button>
        </form>
      </div>
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
            <ConfirmDeleteButton
              action={eliminarNegocio}
              id={negocio.id}
              label="Rechazar"
              mensaje={`¿Rechazar y eliminar "${negocio.nombre}"? Esta acción es irreversible.`}
              className="rounded-full bg-secondary text-foreground text-xs font-semibold px-4 py-2 hover:bg-rose-100 hover:text-rose-800"
            />
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
            <ConfirmDeleteButton
              action={eliminarNegocio}
              id={negocio.id}
              label="Eliminar"
              mensaje={`¿Eliminar "${negocio.nombre}" permanentemente? Se borrarán también sus fotos. Esta acción es irreversible.`}
            />
            <Link
              href={`/admin/negocio/${negocio.id}/editar`}
              className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2 hover:opacity-90"
            >
              Editar
            </Link>
            {negocio.plan === "premium" ? (
              <form action={quitarPremium}>
                <input type="hidden" name="id" value={negocio.id} />
                <button
                  type="submit"
                  className="rounded-full bg-white border border-amber-300 text-amber-800 text-xs font-semibold px-4 py-2 hover:bg-amber-50"
                >
                  Quitar Premium
                </button>
              </form>
            ) : (
              <form action={activarPremium30Dias}>
                <input type="hidden" name="id" value={negocio.id} />
                <button
                  type="submit"
                  className="rounded-full bg-amber-500 text-white text-xs font-semibold px-4 py-2 hover:bg-amber-600"
                >
                  ⭐ Premium 30 dias
                </button>
              </form>
            )}
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
