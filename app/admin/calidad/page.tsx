import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { fetchDataAuditorFindings } from "@/lib/data-auditor-findings";

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  telefono: string | null;
  direccion: string | null;
  descripcion: string | null;
  categoria_id: number | null;
  a_domicilio: boolean;
  activo: boolean;
  verificado: boolean;
};

type Problema = {
  id: string;
  nombre: string;
  tipo: "UBICACION" | "TELEFONO" | "DESCRIPCION" | "CATEGORIA";
  prioridad: "ALTA" | "MEDIA";
  detalle: string;
};

const prioridadOrden = { ALTA: 0, MEDIA: 1 };

function ubicacionGenerica(direccion: string | null): boolean {
  if (!direccion) return false;
  const value = direccion.trim().toLowerCase().replace(/\s+/g, " ");
  return ["linares", "centro", "centro de linares", "linares centro"].includes(value);
}

function construirProblemas(negocios: Negocio[], includeLocationChecks = true): Problema[] {
  const problemas: Problema[] = [];

  for (const negocio of negocios) {
    if (includeLocationChecks && !negocio.direccion && !negocio.a_domicilio) {
      problemas.push({
        id: negocio.id,
        nombre: negocio.nombre,
        tipo: "UBICACION",
        prioridad: "ALTA",
        detalle: "No tiene una dirección verificable y la ficha no indica atención a domicilio.",
      });
    } else if (includeLocationChecks && ubicacionGenerica(negocio.direccion)) {
      problemas.push({
        id: negocio.id,
        nombre: negocio.nombre,
        tipo: "UBICACION",
        prioridad: "ALTA",
        detalle: "La ubicación publicada es demasiado genérica para localizar el negocio.",
      });
    }

    if (!negocio.telefono) {
      problemas.push({
        id: negocio.id,
        nombre: negocio.nombre,
        tipo: "TELEFONO",
        prioridad: "MEDIA",
        detalle: "La ficha no tiene teléfono.",
      });
    }

    if (!negocio.descripcion) {
      problemas.push({
        id: negocio.id,
        nombre: negocio.nombre,
        tipo: "DESCRIPCION",
        prioridad: "MEDIA",
        detalle: "La ficha no tiene descripción.",
      });
    }

    if (!negocio.categoria_id) {
      problemas.push({
        id: negocio.id,
        nombre: negocio.nombre,
        tipo: "CATEGORIA",
        prioridad: "MEDIA",
        detalle: "La ficha no tiene categoría asignada.",
      });
    }
  }

  return problemas.sort(
    (a, b) =>
      prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad] ||
      a.nombre.localeCompare(b.nombre, "es"),
  );
}

const etiquetas: Record<Problema["tipo"], string> = {
  UBICACION: "Ubicación",
  TELEFONO: "Teléfono",
  DESCRIPCION: "Descripción",
  CATEGORIA: "Categoría",
};

export default async function CalidadPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { data, error } = await supabaseAdmin
    .from("negocios")
    .select(
      "id,nombre,slug,telefono,direccion,descripcion,categoria_id,a_domicilio,activo,verificado",
    )
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar la cola de calidad: ${error.message}`);
  }

  const negocios = (data ?? []) as Negocio[];
  const auditorReport = await fetchDataAuditorFindings();
  const problemas = construirProblemas(negocios, !auditorReport);
  const auditorFindings = auditorReport?.findings ?? [];
  const negocioIdByExternalId = new Map<string, string>(
    negocios.flatMap((negocio) => [
      [negocio.id, negocio.id],
      [negocio.slug, negocio.id],
    ]),
  );
  const altas = problemas.filter((p) => p.prioridad === "ALTA").length + auditorFindings.filter((f) => f.severity === "HIGH").length;
  const medias = problemas.length - problemas.filter((p) => p.prioridad === "ALTA").length + auditorFindings.filter((f) => f.severity !== "HIGH").length;
  const totalAcciones = problemas.length + auditorFindings.length;

  return (
    <main className="flex-1 mx-auto w-full max-w-3xl pb-10">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href="/admin"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"
            aria-label="Volver al admin"
          >
            ←
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Operación
            </p>
            <h1 className="text-base font-bold tracking-tight">Cola de calidad</h1>
          </div>
        </div>
      </header>

      <section className="px-4 pt-5">
        <div className="rounded-2xl bg-foreground text-background p-5">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
            Acción pendiente
          </p>
          <p className="text-3xl font-extrabold mt-1">{totalAcciones}</p>
          <p className="text-sm opacity-80 mt-1">
            problemas accionables en fichas activas
          </p>
          <div className="flex gap-2 mt-4 text-xs font-bold">
            <span className="rounded-full bg-white/15 px-3 py-1.5">
              {altas} alta{altas === 1 ? "" : "s"}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1.5">
              {medias} media{medias === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {auditorReport && (
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900">
            <strong>Data Auditor conectado:</strong> {auditorFindings.length} hallazgo{auditorFindings.length === 1 ? "" : "s"} recibidos. La cola conserva la regla, severidad y mensaje del auditor; la corrección sigue siendo manual.
            <span className="block mt-1 opacity-75">Reporte generado: {new Date(auditorReport.generated_at).toLocaleString("es-CL")}</span>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <strong>Regla de operación:</strong> esta cola detecta problemas; no
          inventa datos ni los corrige automáticamente. Abre la ficha, verifica
          la información y guarda el cambio desde el formulario existente.
        </div>
      </section>

      <section className="px-4 pt-6">
        {auditorFindings.length > 0 && (
          <div className="mb-6">
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fuente externa</p>
              <h2 className="text-sm font-bold">Hallazgos del Data Auditor</h2>
            </div>
            <div className="space-y-3">
              {auditorFindings.map((finding) => (
                <article key={`${finding.business_id}-${finding.rule}`} className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{finding.business_name ?? finding.business_id}</h3>
                        <span className="text-[9px] font-bold rounded-full bg-sky-100 text-sky-800 px-2 py-0.5">{finding.severity}</span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">{finding.rule}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{finding.message}</p>
                    </div>
                    {negocioIdByExternalId.get(finding.business_id) ? (
                      <Link href={`/admin/negocio/${negocioIdByExternalId.get(finding.business_id)}/editar`} className="shrink-0 rounded-full bg-foreground text-background text-[11px] font-bold px-3 py-2 hover:opacity-90">Corregir →</Link>
                    ) : (
                      <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 text-amber-900 text-[10px] font-semibold px-3 py-2">Sin ficha vinculada</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {problemas.length === 0 && auditorFindings.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <p className="font-bold">No hay problemas accionables.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Las fichas activas cumplen las comprobaciones actuales.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {problemas.map((problema, index) => (
              <article
                key={`${problema.id}-${problema.tipo}`}
                className="rounded-2xl border border-border bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-muted-foreground pt-1 w-5">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-sm truncate">{problema.nombre}</h2>
                      <span
                        className={`text-[9px] font-bold rounded-full px-2 py-0.5 ${
                          problema.prioridad === "ALTA"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {problema.prioridad}
                      </span>
                      <span className="text-[9px] font-bold rounded-full bg-secondary px-2 py-0.5">
                        {etiquetas[problema.tipo]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {problema.detalle}
                    </p>
                  </div>
                  <Link
                    href={`/admin/negocio/${problema.id}/editar`}
                    className="shrink-0 rounded-full bg-foreground text-background text-[11px] font-bold px-3 py-2 hover:opacity-90"
                  >
                    Corregir →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
