import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { fetchDataAuditorFindings } from "@/lib/data-auditor-findings";
import { calcularEstadoFicha, prioridadFaltante } from "@/lib/estado-ficha";
import { telefonoInternacional, whatsAppLink } from "@/lib/contacto";

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  descripcion: string | null;
  categoria_id: number | null;
  a_domicilio: boolean;
  activo: boolean;
  verificado: boolean;
};

type Problema = {
  id: string;
  nombre: string;
  tipo: "UBICACION" | "TELEFONO" | "DESCRIPCION" | "CATEGORIA" | "FOTOGRAFIAS" | "HORARIOS";
  prioridad: "ALTA" | "MEDIA";
  detalle: string;
};

const prioridadOrden = { ALTA: 0, MEDIA: 1 };

function impactoProblema(problema: Problema): { etiqueta: string; detalle: string } {
  switch (problema.tipo) {
    case "TELEFONO":
      return { etiqueta: "Contacto", detalle: "Puede impedir que el vecino contacte al negocio." };
    case "UBICACION":
      return { etiqueta: "Conversión", detalle: "Puede dificultar llegar al negocio o usar mapas." };
    case "FOTOGRAFIAS":
      return { etiqueta: "Confianza", detalle: "Una ficha sin fotos transmite menos información para decidir." };
    case "DESCRIPCION":
      return { etiqueta: "Visibilidad", detalle: "Falta contexto para entender qué ofrece el negocio." };
    case "CATEGORIA":
      return { etiqueta: "Visibilidad", detalle: "Puede impedir que aparezca donde los vecinos esperan encontrarlo." };
    case "HORARIOS":
      return { etiqueta: "Conversión", detalle: "Puede generar visitas fuera de horario o dudas antes de contactar." };
    default:
      return { etiqueta: "Calidad", detalle: "Conviene corregir este dato para mantener la ficha completa." };
  }
}

function ubicacionGenerica(direccion: string | null): boolean {
  if (!direccion) return false;
  const value = direccion.trim().toLowerCase().replace(/\s+/g, " ");
  return ["linares", "centro", "centro de linares", "linares centro"].includes(value);
}

function construirProblemas(
  negocios: Negocio[],
  fotosPorNegocio: Set<string>,
  horariosPorNegocio: Map<string, Set<string>>,
  horariosInvalidos: Set<string>,
  auditorFindings: NonNullable<Awaited<ReturnType<typeof fetchDataAuditorFindings>>>["findings"],
): Problema[] {
  const problemas: Problema[] = [];

  for (const negocio of negocios) {
    const hallazgos = auditorFindings.filter(
      (finding) => finding.business_id === negocio.id || finding.business_id === negocio.slug,
    );
    const estado = calcularEstadoFicha(
      {
        activo: negocio.activo,
        verificado: negocio.verificado,
        descripcion: negocio.descripcion,
        telefono: negocio.telefono,
        whatsapp: negocio.whatsapp,
        contactoUtilizable:
          Boolean(negocio.telefono && telefonoInternacional(negocio.telefono)) ||
          Boolean(negocio.whatsapp && whatsAppLink(negocio.whatsapp)),
        direccion: negocio.direccion,
        lat: negocio.lat,
        lng: negocio.lng,
        a_domicilio: negocio.a_domicilio,
        direccionGenerica: ubicacionGenerica(negocio.direccion),
        categoriaId: negocio.categoria_id,
        tieneFotografias: fotosPorNegocio.has(negocio.id),
        tieneHorariosCompletos:
          (horariosPorNegocio.get(negocio.id)?.size ?? 0) === 7 &&
          !horariosInvalidos.has(negocio.id),
      },
      hallazgos,
    );

    for (const faltante of estado.faltantes.filter((item) => item !== "Verificación pendiente")) {
      const esUbicacion = faltante === "Falta dirección" || faltante === "Faltan coordenadas" || faltante === "Ubicación demasiado genérica";
      problemas.push({
        id: negocio.id,
        nombre: negocio.nombre,
        tipo: esUbicacion ? "UBICACION" : faltante === "Falta teléfono/WhatsApp" ? "TELEFONO" : faltante === "Falta descripción" ? "DESCRIPCION" : faltante === "No tiene fotografías" ? "FOTOGRAFIAS" : faltante === "Faltan horarios" ? "HORARIOS" : "CATEGORIA",
        prioridad: esUbicacion ? "ALTA" : "MEDIA",
        detalle: faltante,
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
  FOTOGRAFIAS: "Fotografías",
  HORARIOS: "Horarios",
};

export default async function CalidadPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { data, error } = await supabaseAdmin
    .from("negocios")
    .select(
      "id,nombre,slug,telefono,whatsapp,direccion,lat,lng,descripcion,categoria_id,a_domicilio,activo,verificado",
    )
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar la cola de calidad: ${error.message}`);
  }

  const negocios = (data ?? []) as Negocio[];
  const pendientesVerificacion = negocios.filter((negocio) => !negocio.verificado);
  const negociosVerificados = negocios.filter((negocio) => negocio.verificado);
  const auditorReport = await fetchDataAuditorFindings();

  const negocioIds = negocios.map((negocio) => negocio.id);
  const [{ data: fotos }, { data: horarios }] =
    negocioIds.length > 0
      ? await Promise.all([
          supabaseAdmin.from("fotos").select("negocio_id").in("negocio_id", negocioIds),
          supabaseAdmin.from("horarios").select("negocio_id,dia,abre,cierra,cerrado").in("negocio_id", negocioIds),
        ])
      : [{ data: [] }, { data: [] }];

  const fotosPorNegocio = new Set(
    ((fotos ?? []) as Array<{ negocio_id: string }>).map((fila) => fila.negocio_id),
  );
  const horariosPorNegocio = new Map<string, Set<string>>();
  const horariosInvalidos = new Set<string>();
  for (const fila of (horarios ?? []) as Array<{
    negocio_id: string;
    dia: string;
    abre: string | null;
    cierra: string | null;
    cerrado: boolean;
  }>) {
    const dias = horariosPorNegocio.get(fila.negocio_id) ?? new Set<string>();
    dias.add(fila.dia);
    horariosPorNegocio.set(fila.negocio_id, dias);

    // Un día cerrado no debería guardar horas; un día abierto necesita ambas.
    if (
      (fila.cerrado && (fila.abre !== null || fila.cierra !== null)) ||
      (!fila.cerrado && (!fila.abre || !fila.cierra))
    ) {
      horariosInvalidos.add(fila.negocio_id);
    }
  }
  // La calidad de datos debe cubrir todas las fichas activas, no solo las verificadas.
  // La verificación se mantiene como flujo separado y no se cuenta como problema aquí.
  const problemas = construirProblemas(
    negocios,
    fotosPorNegocio,
    horariosPorNegocio,
    horariosInvalidos,
    auditorReport?.findings ?? [],
  );
  const auditorFindings = (auditorReport?.findings ?? []).filter((finding) =>
    negocios.some(
      (negocio) => negocio.id === finding.business_id || negocio.slug === finding.business_id,
    ),
  );
  const negocioIdByExternalId = new Map<string, string>(
    negocios.flatMap((negocio) => [
      [negocio.id, negocio.id],
      [negocio.slug, negocio.id],
    ]),
  );
  const altas = problemas.filter((p) => p.prioridad === "ALTA").length + auditorFindings.filter((f) => f.severity === "HIGH").length;
  const medias = problemas.length - problemas.filter((p) => p.prioridad === "ALTA").length + auditorFindings.filter((f) => f.severity !== "HIGH").length;
  const negociosConProblemas = new Set([
    ...problemas.map((problema) => problema.id),
    ...auditorFindings.map((finding) => negocioIdByExternalId.get(finding.business_id)).filter((id): id is string => Boolean(id)),
  ]);
  const fichasAfectadas = negociosConProblemas.size;
  const totalProblemas = problemas.length + auditorFindings.length;
  const hallazgosPorNegocio = new Map<string, number>();
  const detalleHallazgosPorNegocio = new Map<string, typeof auditorFindings>();
  for (const finding of auditorFindings) {
    const negocioId = negocioIdByExternalId.get(finding.business_id);
    if (negocioId) {
      hallazgosPorNegocio.set(negocioId, (hallazgosPorNegocio.get(negocioId) ?? 0) + 1);
      const lista = detalleHallazgosPorNegocio.get(negocioId) ?? [];
      lista.push(finding);
      detalleHallazgosPorNegocio.set(negocioId, lista);
    }
  }
  const nombrePorNegocio = new Map(negocios.map((negocio) => [negocio.id, negocio.nombre]));
  const problemasPorNegocio = new Map<string, Problema[]>();
  for (const problema of problemas) {
    const lista = problemasPorNegocio.get(problema.id) ?? [];
    lista.push(problema);
    problemasPorNegocio.set(problema.id, lista);
  }
  for (const negocioId of hallazgosPorNegocio.keys()) {
    if (!problemasPorNegocio.has(negocioId)) problemasPorNegocio.set(negocioId, []);
  }
  const negociosPrioritarios = [...problemasPorNegocio.entries()]
    .map(([id, items]) => ({
      id,
      nombre: items[0]?.nombre ?? nombrePorNegocio.get(id) ?? id,
      problemas: items,
      altas: items.filter((item) => item.prioridad === "ALTA").length + auditorFindings.filter((finding) => finding.severity === "HIGH" && negocioIdByExternalId.get(finding.business_id) === id).length,
      hallazgos: hallazgosPorNegocio.get(id) ?? 0,
    }))
    .sort((a, b) => b.altas - a.altas || (b.problemas.length + b.hallazgos) - (a.problemas.length + a.hallazgos) || a.nombre.localeCompare(b.nombre, "es"));

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
          <p className="text-3xl font-extrabold mt-1">{fichasAfectadas}</p>
          <p className="text-sm opacity-80 mt-1">
            fichas activas con observaciones
          </p>
          <div className="mt-3 text-xs opacity-80">
            {totalProblemas} problemas accionables detectados
          </div>
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

        <div className="mt-4 rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Verificación
              </p>
              <p className="text-sm font-bold mt-1">
                {pendientesVerificacion.length} ficha{pendientesVerificacion.length === 1 ? "" : "s"} pendiente{pendientesVerificacion.length === 1 ? "" : "s"} de verificación
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Las fichas no verificadas se conservan en el directorio, pero no se consideran problemas de calidad todavía.
              </p>
            </div>
            <Link
              href="/admin/verificacion"
              className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold hover:opacity-80"
            >
              {pendientesVerificacion.length} →
            </Link>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <strong>Regla de operación:</strong> esta cola detecta problemas; no
          inventa datos ni los corrige automáticamente. Abre la ficha, verifica
          la información y guarda el cambio desde el formulario existente.
        </div>
      </section>

      <section className="px-4 pt-6">
        {problemas.length === 0 && auditorFindings.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <p className="font-bold">No hay problemas accionables.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Las fichas activas cumplen las comprobaciones actuales.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Orden de trabajo</p>
            <h2 className="text-sm font-bold mt-1">Qué corregir primero</h2>
            <p className="text-xs text-muted-foreground mt-1">Las fichas con problemas de contacto o ubicación aparecen arriba.</p>
          </div>
          <div className="space-y-3">
            {negociosPrioritarios.map((grupo, index) => (
              <article key={grupo.id} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-muted-foreground pt-1 w-5">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-sm truncate">{grupo.nombre}</h2>
                      {grupo.altas > 0 && (
                        <span className="text-[9px] font-bold rounded-full bg-rose-100 text-rose-800 px-2 py-0.5">
                          {grupo.altas} alta{grupo.altas === 1 ? "" : "s"}
                        </span>
                      )}
                      <span className="text-[9px] font-bold rounded-full bg-secondary px-2 py-0.5">
                        {grupo.problemas.length + grupo.hallazgos} elemento{grupo.problemas.length + grupo.hallazgos === 1 ? "" : "s"} por revisar
                      </span>
                      {grupo.hallazgos > 0 && (
                        <span className="text-[9px] font-bold rounded-full bg-sky-100 text-sky-800 px-2 py-0.5">
                          {grupo.hallazgos} Data Auditor
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {grupo.problemas.map((problema) => (
                        <span
                          key={problema.tipo}
                          className={`text-[10px] font-semibold rounded-full px-2 py-1 ${
                            problema.prioridad === "ALTA" ? "bg-rose-50 text-rose-800" : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {etiquetas[problema.tipo]}
                        </span>
                      ))}
                      {grupo.hallazgos > 0 && (
                        <span className="text-[10px] font-semibold rounded-full bg-sky-50 text-sky-800 px-2 py-1">
                          Hallazgos externos
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {grupo.problemas.map((problema) => {
                        const impacto = impactoProblema(problema);
                        return (
                          <span key={problema.tipo} className="text-[10px] font-semibold rounded-full bg-slate-50 text-slate-700 px-2 py-1">
                            Impacto: {impacto.etiqueta}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {grupo.problemas.map((problema) => impactoProblema(problema).detalle).join(" · ")}
                      {grupo.hallazgos > 0 && " También tiene hallazgos del Data Auditor que conviene revisar."}
                    </p>
                    {grupo.hallazgos > 0 && (
                      <div className="mt-3 space-y-2">
                        {detalleHallazgosPorNegocio.get(grupo.id)?.map((finding) => (
                          <div key={finding.rule} className="rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-sky-800">{finding.severity}</span>
                              <span className="text-[9px] font-mono text-sky-900/60">{finding.rule}</span>
                            </div>
                            <p className="mt-1 text-[10px] leading-relaxed text-sky-900/75">{finding.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/admin/negocio/${grupo.id}`}
                    className="shrink-0 rounded-full bg-foreground text-background text-[11px] font-bold px-3 py-2 hover:opacity-90"
                  >
                    Corregir →
                  </Link>
                </div>
              </article>
            ))}
          </div>
          </>
        )}
      </section>
    </main>
  );
}
