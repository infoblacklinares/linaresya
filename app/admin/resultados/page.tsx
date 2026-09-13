import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { esPremium } from "@/lib/planes";
import { EVENTOS_ACCION, fechaSantiagoDe, type FilaEvento } from "@/lib/eventos";
import {
  avisoDeCoherencia,
  esPeriodoValido,
  mesesRecientes,
  periodoDe,
  periodoLegible,
  tasaDeCierre,
  tasaDeRespuesta,
  totalesReportados,
  type Medido,
  type Resultado,
} from "@/lib/resultados";
import { guardarResultadoNegocio, borrarResultadoNegocio } from "../actions";

export const metadata = {
  title: "Resultados reportados - Admin LinaresYa",
  robots: { index: false, follow: false },
};

const ACCIONES = new Set<string>(EVENTOS_ACCION);

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  plan: string | null;
  premium_hasta: string | null;
  categoriaSlug: string;
};

/** El primer dia del mes siguiente. Acota la consulta de eventos al periodo. */
function finDePeriodo(periodo: string): string {
  const anio = Number(periodo.slice(0, 4));
  const mes = Number(periodo.slice(5, 7));
  return mes === 12 ? `${anio + 1}-01-01` : `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
}

export default async function AdminResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const sp = await searchParams;
  const enCurso = periodoDe();
  // Por defecto el mes en curso. La primera version abria en el mes pasado,
  // razonando que es el unico que el negocio puede responder completo; con la
  // medicion recien empezada eso dejaba la pantalla en un mes sin un solo dato,
  // y el mes actual ni siquiera se podia elegir. Un mes a medias se corrige
  // despues: el reporte se pisa, no se duplica.
  const pedido = sp.periodo ?? enCurso;
  const periodo = esPeriodoValido(pedido) ? pedido : enCurso;
  const fin = finDePeriodo(periodo);

  const [negociosRes, resultadosRes, eventosRes] = await Promise.all([
    supabaseAdmin
      .from("negocios")
      .select("id, nombre, slug, plan, premium_hasta, categorias:categoria_id(slug)")
      .eq("activo", true)
      .order("nombre"),
    supabaseAdmin
      .from("resultados_negocio")
      .select("negocio_id, periodo, consultas, clientes, nota")
      .eq("periodo", periodo),
    supabaseAdmin
      .from("eventos_negocio")
      .select("evento, sesion, fuente, campana, negocio_id, creado_en")
      .gte("creado_en", `${periodo}T00:00:00-04:00`)
      .lt("creado_en", `${fin}T00:00:00-03:00`),
  ]);

  const negocios: Negocio[] = (negociosRes.data ?? []).map((row) => {
    const x = row as Record<string, unknown>;
    const catRaw = x.categorias;
    const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
    return {
      id: String(x.id ?? ""),
      nombre: String(x.nombre ?? "(sin nombre)"),
      slug: String(x.slug ?? ""),
      plan: (x.plan as string | null) ?? null,
      premium_hasta: (x.premium_hasta as string | null) ?? null,
      categoriaSlug:
        cat && typeof cat === "object" ? String((cat as { slug?: unknown }).slug ?? "") : "",
    };
  });

  const reportados = new Map<string, Resultado>();
  for (const row of resultadosRes.data ?? []) {
    const x = row as Record<string, unknown>;
    const id = String(x.negocio_id ?? "");
    if (!id) continue;
    reportados.set(id, {
      negocio_id: id,
      periodo,
      consultas: x.consultas === null ? null : Number(x.consultas),
      clientes: x.clientes === null ? null : Number(x.clientes),
      nota: (x.nota as string | null) ?? null,
    });
  }

  // Lo que midio el sitio ese mes. La consulta viene acotada con margen y el
  // filtro por fecha de Chile corrige el borde: el desfase cambia con el
  // horario de verano y no se puede dejar fijo en la consulta.
  const medidos = new Map<string, Medido>();
  for (const row of (eventosRes.data ?? []) as FilaEvento[]) {
    const id = row.negocio_id ?? "";
    if (!id) continue;
    const dia = fechaSantiagoDe(row.creado_en);
    if (dia < periodo || dia >= fin) continue;
    const m = medidos.get(id) ?? { vistas: 0, acciones: 0 };
    if (row.evento === "vista") m.vistas++;
    else if (ACCIONES.has(row.evento)) m.acciones++;
    medidos.set(id, m);
  }

  // Arriba los que ya tienen reporte y los que tuvieron movimiento: son los que
  // vale la pena preguntar. Los otros ciento y tanto no pueden tapar la pantalla.
  const conMovimiento = negocios.filter(
    (n) => reportados.has(n.id) || (medidos.get(n.id)?.acciones ?? 0) > 0
  );
  const idsArriba = new Set(conMovimiento.map((n) => n.id));
  const resto = negocios.filter((n) => !idsArriba.has(n.id));

  const totales = totalesReportados([...reportados.values()]);

  const meses = mesesRecientes(4);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
        ← Panel
      </Link>

      <h1 className="mt-2 text-lg font-extrabold tracking-tight">
        Resultados reportados por el negocio
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Lo que el negocio dice que le llegó, anotado a mano.{" "}
        <strong>No lo mide el sitio:</strong> se pregunta y se escribe acá. Al lado va
        lo que sí midió el sitio, para poder comparar.
      </p>

      <section className="mt-4 flex flex-wrap items-center gap-2">
        {meses.map((p) => (
          <Link
            key={p}
            href={`/admin/resultados?periodo=${p}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              p === periodo
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground hover:opacity-80"
            }`}
          >
            {periodoLegible(p)}
            {p === enCurso && " (en curso)"}
          </Link>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Dato titulo="Negocios con reporte" valor={String(totales.negocios)} />
        <Dato titulo="Consultas reportadas" valor={String(totales.consultas)} />
        <Dato titulo="Clientes reportados" valor={String(totales.clientes)} />
        <Dato titulo="Sin dato" valor={String(totales.sinDato)} />
      </section>

      <Tabla
        titulo={`Con movimiento o con reporte — ${periodoLegible(periodo)}`}
        negocios={conMovimiento}
        medidos={medidos}
        reportados={reportados}
        periodo={periodo}
      />

      {resto.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Los otros {resto.length} negocios
          </summary>
          <Tabla
            titulo=""
            negocios={resto}
            medidos={medidos}
            reportados={reportados}
            periodo={periodo}
          />
        </details>
      )}
    </main>
  );
}

function Tabla({
  titulo,
  negocios,
  medidos,
  reportados,
  periodo,
}: {
  titulo: string;
  negocios: Negocio[];
  medidos: Map<string, Medido>;
  reportados: Map<string, Resultado>;
  periodo: string;
}) {
  if (negocios.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Todavía nadie tuvo movimiento ni reporte este mes. Los negocios están más
        abajo: se puede anotar igual, aunque el sitio no haya medido nada.
      </p>
    );
  }

  return (
    <section className="mt-6">
      {titulo && (
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
          {titulo}
        </h2>
      )}
      <div className="space-y-3">
        {negocios.map((n) => (
          <Fila
            key={n.id}
            negocio={n}
            medido={medidos.get(n.id) ?? { vistas: 0, acciones: 0 }}
            reportado={reportados.get(n.id) ?? null}
            periodo={periodo}
          />
        ))}
      </div>
    </section>
  );
}

function Fila({
  negocio,
  medido,
  reportado,
  periodo,
}: {
  negocio: Negocio;
  medido: Medido;
  reportado: Resultado | null;
  periodo: string;
}) {
  const r: Resultado = reportado ?? {
    negocio_id: negocio.id,
    periodo,
    consultas: null,
    clientes: null,
    nota: null,
  };
  const respuesta = tasaDeRespuesta(medido, r);
  const cierre = tasaDeCierre(r);
  const aviso = avisoDeCoherencia(medido, r);

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/${negocio.categoriaSlug}/${negocio.slug}`}
            className="font-bold hover:underline"
          >
            {negocio.nombre}
          </Link>
          {esPremium(negocio) && (
            <span className="ml-2 text-xs font-semibold text-[#2B6E80]">⭐ Premium</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          El sitio midió <strong>{medido.vistas}</strong> vistas y{" "}
          <strong>{medido.acciones}</strong> contactos
        </p>
      </div>

      {(respuesta !== null || cierre !== null) && (
        <p className="mt-1 text-xs text-muted-foreground">
          {respuesta !== null && <>Reconoce el {respuesta}% de los contactos medidos. </>}
          {cierre !== null && <>Cierra el {cierre}% de sus consultas.</>}
        </p>
      )}

      {aviso && <p className="mt-1 text-xs font-semibold text-[#B45309]">⚠ {aviso}</p>}

      <form action={guardarResultadoNegocio} className="mt-2 flex flex-wrap items-end gap-2">
        <input type="hidden" name="negocio_id" value={negocio.id} />
        <input type="hidden" name="periodo" value={periodo} />
        <Campo nombre="consultas" etiqueta="Consultas" valor={r.consultas} ayuda="lo contactaron" />
        <Campo nombre="clientes" etiqueta="Clientes" valor={r.clientes} ayuda="compraron" />
        <label className="flex-1 min-w-[12rem]">
          <span className="block text-xs font-semibold text-muted-foreground">Lo que dijo</span>
          <input
            type="text"
            name="nota"
            defaultValue={r.nota ?? ""}
            maxLength={500}
            placeholder="en sus palabras"
            className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-semibold text-background hover:opacity-90"
        >
          Guardar
        </button>
      </form>

      {reportado && (
        <form action={borrarResultadoNegocio} className="mt-1">
          <input type="hidden" name="negocio_id" value={negocio.id} />
          <input type="hidden" name="periodo" value={periodo} />
          <button type="submit" className="text-xs text-muted-foreground hover:underline">
            Borrar este reporte
          </button>
        </form>
      )}
    </div>
  );
}

function Campo({
  nombre,
  etiqueta,
  valor,
  ayuda,
}: {
  nombre: string;
  etiqueta: string;
  valor: number | null;
  ayuda: string;
}) {
  return (
    <label className="w-28">
      <span className="block text-xs font-semibold text-muted-foreground">{etiqueta}</span>
      <input
        type="text"
        inputMode="numeric"
        name={nombre}
        defaultValue={valor === null ? "" : String(valor)}
        placeholder="—"
        className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
      />
      <span className="block text-[10px] text-muted-foreground">{ayuda}</span>
    </label>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{titulo}</p>
      <p className="text-xl font-extrabold tracking-tight">{valor}</p>
    </div>
  );
}
