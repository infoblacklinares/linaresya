import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { fetchDataAuditorFindings } from "@/lib/data-auditor-findings";
import { calcularEstadoFicha } from "@/lib/estado-ficha";
import { activarPremium30Dias, aprobarNegocio, quitarPremium, eliminarNegocio } from "@/app/admin/actions";

export const metadata = {
  title: "Ficha - Admin LinaresYa",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  categoria_id: number | null;
  tipo: "negocio" | "independiente";
  plan: "basico" | "premium";
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  disponibilidad: string | null;
  foto_portada: string | null;
  activo: boolean;
  verificado: boolean;
  premium_hasta: string | null;
};

type Foto = { id: number; url: string };
type Horario = { dia: string; abre: string | null; cierra: string | null; cerrado: boolean };
type Verificacion = {
  id: string;
  estado: string;
  fuente: string;
  url_fuente: string | null;
  evidencia: string;
  observacion: string | null;
  verificado_en: string;
};
type Resultado = {
  periodo: string;
  consultas: number | null;
  clientes: number | null;
  nota: string | null;
};
type Stat = {
  vistas: number;
  clicks_whatsapp: number;
  clicks_telefono: number;
  clicks_maps: number;
};

function fechaCL(offsetDias: number): string {
  const d = new Date(Date.now() - offsetDias * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default async function FichaNegocioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ origen?: string; accion?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  const { origen, accion } = await searchParams;
  const desde = fechaCL(29);

  const [
    { data: negocio },
    { data: fotos },
    { data: horarios },
    { data: verificaciones },
    { data: stats },
    { data: resultados },
  ] = await Promise.all([
    supabaseAdmin.from("negocios").select("*").eq("id", id).single(),
    supabaseAdmin.from("fotos").select("id,url").eq("negocio_id", id).order("orden", { ascending: true }),
supabaseAdmin.from("horarios").select("dia,abre,cierra,cerrado").eq("negocio_id", id),
    supabaseAdmin.from("verificaciones_negocio").select("id,estado,fuente,url_fuente,evidencia,observacion,verificado_en").eq("negocio_id", id).order("verificado_en", { ascending: false }).limit(5),
    supabaseAdmin.from("estadisticas_diarias")
      .select("vistas,clicks_whatsapp,clicks_telefono,clicks_maps")
      .eq("negocio_id", id)
      .gte("fecha", desde),
    supabaseAdmin.from("resultados_negocio")
      .select("periodo,consultas,clientes,nota")
      .eq("negocio_id", id)
      .order("periodo", { ascending: false })
      .limit(1),
  ]);

  if (!negocio) notFound();

  const n = negocio as Negocio;
  const categoriaId = n.categoria_id;

  const { data: cat } = categoriaId
    ? await supabaseAdmin.from("categorias").select("slug,nombre,emoji").eq("id", categoriaId).single()
    : { data: null };

  const fotosList = (fotos ?? []) as Foto[];
  const horariosList = (horarios ?? []) as Horario[];
  const verificacionesList = (verificaciones ?? []) as Verificacion[];
  const ultimaVerificacion = verificacionesList[0] ?? null;
  const filas = (stats ?? []) as Stat[];
  const ultimoResultado = ((resultados ?? [])[0] ?? null) as Resultado | null;
  const vistas = filas.reduce((s, x) => s + Number(x.vistas ?? 0), 0);
  const whatsapp = filas.reduce((s, x) => s + Number(x.clicks_whatsapp ?? 0), 0);
  const telefono = filas.reduce((s, x) => s + Number(x.clicks_telefono ?? 0), 0);
  const maps = filas.reduce((s, x) => s + Number(x.clicks_maps ?? 0), 0);

  const diasConHorario = new Set(horariosList.map((h) => h.dia));
  const horariosCompleto = diasConHorario.size === 7;

  const auditorReport = await fetchDataAuditorFindings();
  const auditorFindings = (auditorReport?.findings ?? []).filter(
    (finding) => finding.business_id === n.id || finding.business_id === n.slug,
  );
  const estadoFicha = calcularEstadoFicha(
    {
      activo: n.activo,
      verificado: n.verificado,
      descripcion: n.descripcion,
      telefono: n.telefono,
      whatsapp: n.whatsapp,
      direccion: n.direccion,
      lat: n.lat,
      lng: n.lng,
      a_domicilio: n.a_domicilio,
      direccionGenerica: Boolean(
        n.direccion &&
          ["linares", "centro", "centro de linares", "linares centro"].includes(
            n.direccion.trim().toLowerCase().replace(/\s+/g, " "),
          ),
      ),
      categoriaId: n.categoria_id,
      tieneFotografias: fotosList.length > 0,
      tieneHorariosCompletos: horariosCompleto,
    },
    auditorFindings,
  );
  const faltantes = estadoFicha.faltantes;


  const estados = [
    ["Información básica", !estadoFicha.faltantes.includes("Falta descripción") && Boolean(n.nombre && cat)],
    ["Contacto", !estadoFicha.faltantes.includes("Falta teléfono/WhatsApp")],
    ["Ubicación", !estadoFicha.faltantes.includes("Falta dirección") && !estadoFicha.faltantes.includes("Faltan coordenadas") && !estadoFicha.faltantes.includes("Ubicación demasiado genérica")],
    ["Horarios", !estadoFicha.faltantes.includes("Faltan horarios")],
    ["Fotografías", !estadoFicha.faltantes.includes("No tiene fotografías")],
    ["Verificación", !estadoFicha.faltantes.includes("Verificación pendiente")],
  ] as const;

  const fichaUrl = cat ? `/${cat.slug}/${n.slug}` : "/";
  const contextoTrabajo = origen === "trabajo" && ["aprobacion", "calidad", "completar"].includes(accion ?? "");
  const contexto = accion === "aprobacion"
    ? { titulo: "Aprobación pendiente", detalle: "Esta ficha llegó desde Trabajo pendiente porque necesita revisión antes de quedar publicada." }
    : accion === "calidad"
      ? { titulo: "Revisión de calidad", detalle: "Esta ficha llegó desde Trabajo pendiente por un hallazgo de calidad que requiere atención." }
      : accion === "completar"
        ? { titulo: "Completar ficha", detalle: "Esta ficha llegó desde Trabajo pendiente porque tiene información básica pendiente." }
        : null;
  const pendientesCompletables = faltantes.filter((x) => x !== "Verificación pendiente");
  const auditorHigh = estadoFicha.hallazgosHigh;
  const pendientesBasicos = estadoFicha.faltantes.filter((item) => item !== "Verificación pendiente");
  const saludFicha = estadoFicha.estado;
  const saludTitulo = saludFicha === "VERDE" ? "Lista" : saludFicha === "AMARILLO" ? "Observaciones" : "Requiere atención";
  const saludDetalle = saludFicha === "VERDE"
    ? "La ficha cumple las comprobaciones operativas actuales."
    : saludFicha === "AMARILLO"
      ? "Hay observaciones pendientes de revisión."
      : "Existe al menos un aspecto crítico que requiere atención antes de considerar la ficha lista.";
  const saludClasses = saludFicha === "VERDE"
    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
    : saludFicha === "AMARILLO"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : "border-rose-200 bg-rose-50 text-rose-950";
  const saludBadge = saludFicha === "VERDE" ? "bg-emerald-100 text-emerald-800" : saludFicha === "AMARILLO" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800";
  const saludIcon = saludFicha === "VERDE" ? "🟢" : saludFicha === "AMARILLO" ? "🟡" : "🔴";
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

  return (
    <main className="flex-1 mx-auto w-full max-w-3xl pb-10">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Volver al admin">←</Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ficha operativa</p>
            <h1 className="text-base font-extrabold truncate">{n.nombre}</h1>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${n.activo ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {n.activo ? "Activo" : "Pendiente"}
          </span>
        </div>
      </header>

      {contextoTrabajo && contexto && (
        <section className="px-4 pt-4">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">⚡ Trabajo pendiente</p>
            <h2 className="text-sm font-extrabold text-sky-950 mt-1">{contexto.titulo}</h2>
            <p className="text-xs text-sky-900 mt-1">{contexto.detalle}</p>
            {accion === "completar" && pendientesCompletables.length > 0 && (
              <div className="mt-3 rounded-xl border border-sky-200 bg-white/70 p-3">
                <p className="text-[11px] font-extrabold text-sky-950">Falta completar:</p>
                <ul className="mt-1.5 space-y-1">
                  {pendientesCompletables.map((item) => (
                    <li key={item} className="text-xs font-medium text-sky-900">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {accion === "calidad" && (
              <div className="mt-3 rounded-xl border border-sky-200 bg-white/70 p-3 text-xs text-sky-900">
                El siguiente paso es revisar el hallazgo de calidad antes de corregir la ficha.
              </div>
            )}
          </div>
        </section>
      )}

      <section className="px-4 pt-5">
        <div className="rounded-2xl bg-white border border-border p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-[220px]">
              <p className="text-xs text-muted-foreground">{cat ? `${cat.emoji} ${cat.nombre}` : "Sin categoría"} · {n.tipo === "negocio" ? "Negocio" : "Independiente"}</p>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1">{n.nombre}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {n.verificado && <span className="rounded-full bg-sky-100 text-sky-800 px-2.5 py-1 text-[11px] font-bold">✓ Verificado</span>}
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${n.plan === "premium" ? "bg-amber-100 text-amber-900" : "bg-secondary"}`}>
                  {n.plan === "premium" ? "⭐ Premium" : "Básico"}
                </span>
                {n.plan === "premium" && n.premium_hasta && (
                  <span className="rounded-full bg-amber-50 text-amber-800 px-2.5 py-1 text-[11px] font-medium">
                    Hasta {new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(n.premium_hasta))}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!n.activo && (
                <>
                  <form action={aprobarNegocio}>
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className="rounded-full bg-foreground text-background px-3 py-2 text-xs font-bold">Aprobar</button>
                  </form>
                  <Link href={`/admin/verificacion?negocio=${n.id}`} className="rounded-full bg-emerald-600 text-white px-3 py-2 text-xs font-bold">Ir a verificar</Link>
                  <form action={eliminarNegocio}>
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className="rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-xs font-bold">Rechazar</button>
                  </form>
                </>
              )}
              <a href={`${publicUrl}${fichaUrl}`} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-2 text-xs font-bold hover:bg-secondary">Ver ficha ↗</a>
              <Link href={`/admin/negocio/${n.id}/editar`} className="rounded-full bg-foreground text-background px-3 py-2 text-xs font-bold">Editar</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className={`rounded-2xl border p-4 ${saludClasses}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Estado de la ficha</p>
              <h2 className="text-lg font-extrabold mt-1">{saludTitulo}</h2>
              <p className="text-xs mt-1 opacity-80">{saludDetalle}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${saludBadge}`}>{saludIcon} {saludFicha}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-bold">
            <span className="rounded-full bg-white/70 px-2.5 py-1">Básicos: {pendientesBasicos.length === 0 ? "OK" : pendientesBasicos.length}</span>
            <span className="rounded-full bg-white/70 px-2.5 py-1">Auditor: {auditorFindings.length === 0 ? "OK" : auditorFindings.length}</span>
            <span className="rounded-full bg-white/70 px-2.5 py-1">Verificación: {n.verificado ? "OK" : "Pendiente"}</span>
          </div>
          {auditorHigh.length > 0 && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-white/70 p-3">
              <p className="text-[11px] font-extrabold">Hallazgo crítico del Data Auditor</p>
              <ul className="mt-1.5 space-y-1">
                {auditorHigh.map((finding) => <li key={`high-${finding.rule}`} className="text-xs">• {finding.message}</li>)}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className={`rounded-2xl border p-4 ${faltantes.length ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Qué requiere atención</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{faltantes.length ? `${faltantes.length} punto${faltantes.length === 1 ? "" : "s"} por revisar` : "La ficha no presenta pendientes básicos"}</p>
            </div>
            {faltantes.length > 0 && <Link href={`/admin/negocio/${n.id}/editar`} className="rounded-full bg-foreground text-background px-3 py-2 text-[11px] font-bold">Corregir →</Link>}
          </div>
          {faltantes.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {faltantes.map((x) => <li key={x} className="text-xs font-medium">🟡 {x}</li>)}
            </ul>
          )}
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Resumen de ficha</h2>
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          {estados.map(([label, ok]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-border text-sm">
              <span>{label}</span><span className={`text-xs font-bold ${ok ? "text-emerald-700" : "text-amber-700"}`}>{ok ? "🟢 Completo" : "🟡 Revisar"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Gestionar</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/admin/negocio/${n.id}/editar`} className="rounded-xl border border-border bg-white p-4 text-sm font-bold">✏️ Editar información</Link>
          <Link href={`/admin/verificacion?negocio=${n.id}`} className="rounded-xl border border-border bg-white p-4 text-sm font-bold">✓ Verificación</Link>
          <Link href={`/admin/calidad`} className="rounded-xl border border-border bg-white p-4 text-sm font-bold">🛠️ Calidad</Link>
          <Link href={`/admin/negocio/${n.id}/estadisticas`} className="rounded-xl border border-border bg-white p-4 text-sm font-bold">📊 Estadísticas</Link>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Verificación</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {ultimaVerificacion
                  ? `Última revisión: ${new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(ultimaVerificacion.verificado_en))}`
                  : "Todavía no existe un registro de verificación"}
              </p>
            </div>
            <Link href={`/admin/verificacion?negocio=${n.id}`} className="rounded-full border border-border px-3 py-2 text-[11px] font-bold">
              {n.verificado ? "Revisar" : "Verificar"}
            </Link>
          </div>
          {ultimaVerificacion && (
            <div className="mt-3 rounded-xl bg-secondary/50 p-3 text-xs space-y-1.5">
              <p><strong>Fuente:</strong> {ultimaVerificacion.fuente.replaceAll("_", " ")}</p>
              <p><strong>Evidencia:</strong> {ultimaVerificacion.evidencia}</p>
              {ultimaVerificacion.observacion && <p><strong>Observación:</strong> {ultimaVerificacion.observacion}</p>}
              {ultimaVerificacion.url_fuente && <a href={ultimaVerificacion.url_fuente} target="_blank" rel="noreferrer" className="inline-block text-[#2B6E80] font-bold">Abrir fuente ↗</a>}
            </div>
          )}
          {verificacionesList.length > 1 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-bold">Ver historial ({verificacionesList.length})</summary>
              <div className="mt-2 space-y-2">
                {verificacionesList.slice(1).map((v) => (
                  <div key={v.id} className="border-t border-border pt-2 text-[11px]">
                    <p className="font-bold">{new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(v.verificado_en))} · {v.fuente.replaceAll("_", " ")}</p>
                    <p className="text-muted-foreground mt-0.5">{v.evidencia}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Premium</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {n.plan === "premium"
                  ? n.premium_hasta ? `Activo hasta ${new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(n.premium_hasta))}` : "Activo sin fecha de vencimiento"
                  : "Plan Básico"}
              </p>
            </div>
            {n.plan === "premium" ? (
              <form action={quitarPremium}>
                <input type="hidden" name="id" value={n.id} />
                <button type="submit" className="rounded-full border border-border px-3 py-2 text-[11px] font-bold">Quitar Premium</button>
              </form>
            ) : (
              <form action={activarPremium30Dias}>
                <input type="hidden" name="id" value={n.id} />
                <button type="submit" className="rounded-full bg-foreground text-background px-3 py-2 text-[11px] font-bold">Activar 30 días</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Último resultado reportado</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Dato informado por el negocio, no medido automáticamente.</p>
            </div>
            <Link href="/admin/resultados" className="text-xs font-bold text-[#2B6E80]">Ver resultados →</Link>
          </div>
          {ultimoResultado ? (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Metric label="Consultas" value={ultimoResultado.consultas} />
              <Metric label="Clientes" value={ultimoResultado.clientes} />
              <div className="col-span-2 rounded-xl bg-secondary/50 p-3 text-xs">
                <p className="font-semibold">Periodo: {ultimoResultado.periodo}</p>
                {ultimoResultado.nota && <p className="text-muted-foreground mt-1">{ultimoResultado.nota}</p>}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Todavía no hay un resultado reportado para esta ficha.</p>
          )}
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Rendimiento · 30 días</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Metric label="Vistas" value={vistas} />
          <Metric label="WhatsApp" value={whatsapp} />
          <Metric label="Teléfono" value={telefono} />
          <Metric label="Maps" value={maps} />
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Galería</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{fotosList.length} foto{fotosList.length === 1 ? "" : "s"} registrada{fotosList.length === 1 ? "" : "s"}</p>
            </div>
            <Link href={`/admin/negocio/${n.id}/editar`} className="text-xs font-bold text-[#2B6E80]">Gestionar →</Link>
          </div>
          {fotosList.length > 0 && <div className="grid grid-cols-4 gap-2 mt-3">{fotosList.slice(0,4).map((f) => <img key={f.id} src={f.url} alt="" className="w-full aspect-square object-cover rounded-lg" />)}</div>}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="text-sm font-bold">Accesos rápidos</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link href={`/admin/negocio/${n.id}/editar`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold">QR y link del dueño</Link>
            <a href={`${publicUrl}${fichaUrl}`} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-2 text-xs font-semibold">Ficha pública ↗</a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return <div className="rounded-2xl bg-white border border-border p-4"><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-2xl font-extrabold mt-1 tabular-nums">{value === null ? "—" : value}</p></div>;
}
