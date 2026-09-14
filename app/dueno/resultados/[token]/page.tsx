import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { negocioDelToken } from "@/lib/dueno-token";
import { EVENTOS_ACCION, fechaSantiagoDe, type FilaEvento } from "@/lib/eventos";
import {
  esPeriodoValido,
  periodoAnterior,
  periodoDe,
  periodoLegible,
} from "@/lib/resultados";
import FormResultados from "./FormResultados";

export const metadata = {
  title: "Cuéntanos cómo te fue - LinaresYa",
  robots: { index: false, follow: false },
};

const ACCIONES = new Set<string>(EVENTOS_ACCION);

function finDePeriodo(periodo: string): string {
  const anio = Number(periodo.slice(0, 4));
  const mes = Number(periodo.slice(5, 7));
  return mes === 12 ? `${anio + 1}-01-01` : `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
}

/**
 * El negocio reporta sus resultados sin pasar por el admin (LY-028).
 *
 * Se le pregunta por el **mes pasado**, no por el actual: a diferencia del
 * panel, que Willson usa para anotar lo que le acaban de decir por WhatsApp,
 * este link llega por correo el dia 1 y pregunta por el mes que se cerro. Un
 * mes cerrado se responde de memoria; uno a medias, no.
 */
export default async function DuenoResultadosPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { token } = await params;
  const negocioId = await negocioDelToken(token);
  if (!negocioId) return <LinkInvalido />;

  const sp = await searchParams;
  const pedido = sp.periodo ?? periodoAnterior(periodoDe());
  const periodo = esPeriodoValido(pedido) ? pedido : periodoAnterior(periodoDe());
  const fin = finDePeriodo(periodo);

  const [negocioRes, resultadoRes, eventosRes] = await Promise.all([
    supabaseAdmin
      .from("negocios")
      .select("nombre, slug, categorias:categoria_id(slug)")
      .eq("id", negocioId)
      .single(),
    supabaseAdmin
      .from("resultados_negocio")
      .select("consultas, clientes, nota")
      .eq("negocio_id", negocioId)
      .eq("periodo", periodo)
      .maybeSingle(),
    supabaseAdmin
      .from("eventos_negocio")
      .select("evento, sesion, fuente, campana, negocio_id, creado_en")
      .eq("negocio_id", negocioId)
      .gte("creado_en", `${periodo}T00:00:00-04:00`)
      .lt("creado_en", `${fin}T00:00:00-03:00`),
  ]);

  const negocio = negocioRes.data as
    | { nombre?: string; slug?: string; categorias?: unknown }
    | null;
  if (!negocio) return <LinkInvalido />;

  const catRaw = negocio.categorias;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
  const categoriaSlug =
    cat && typeof cat === "object" ? String((cat as { slug?: unknown }).slug ?? "") : "";

  let vistas = 0;
  let contactos = 0;
  for (const row of (eventosRes.data ?? []) as FilaEvento[]) {
    const dia = fechaSantiagoDe(row.creado_en);
    if (dia < periodo || dia >= fin) continue;
    if (row.evento === "vista") vistas++;
    else if (ACCIONES.has(row.evento)) contactos++;
  }

  const guardado = (resultadoRes.data ?? null) as {
    consultas: number | null;
    clientes: number | null;
    nota: string | null;
  } | null;

  const mes = periodoLegible(periodo);

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-extrabold tracking-tight">
        Hola, {String(negocio.nombre ?? "")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Queremos saber cómo te fue en {mes} con LinaresYa. Son dos preguntas y nos
        sirve muchísimo.
      </p>

      <section className="mt-5 rounded-2xl bg-secondary p-4">
        <p className="text-sm font-bold">Lo que registramos nosotros en {mes}</p>
        <div className="mt-2 flex gap-6">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">{vistas}</p>
            <p className="text-xs text-muted-foreground">vieron tu ficha</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold tracking-tight">{contactos}</p>
            <p className="text-xs text-muted-foreground">tocaron tus botones</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Lo que no podemos ver es qué pasó después. Eso solo lo sabes tú.
        </p>
      </section>

      <FormResultados
        token={token}
        periodo={periodo}
        periodoLegible={mes}
        contactosMedidos={contactos}
        inicial={{
          consultas: guardado?.consultas ?? null,
          clientes: guardado?.clientes ?? null,
          nota: guardado?.nota ?? null,
        }}
      />

      {categoriaSlug && negocio.slug && (
        <p className="mt-6 text-center text-sm">
          <Link
            href={`/${categoriaSlug}/${negocio.slug}`}
            className="text-muted-foreground hover:underline"
          >
            Ver mi ficha en LinaresYa →
          </Link>
        </p>
      )}
    </main>
  );
}

function LinkInvalido() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-extrabold tracking-tight">Este link ya no sirve</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Los links tienen fecha de vencimiento por seguridad. Escríbenos y te mandamos
        uno nuevo.
      </p>
      <p className="mt-6">
        <Link href="/" className="text-sm font-semibold text-[#2B6E80] hover:underline">
          Ir a LinaresYa
        </Link>
      </p>
    </main>
  );
}
