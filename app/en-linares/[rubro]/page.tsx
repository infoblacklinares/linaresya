import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { esPremium } from "@/lib/planes";
import {
  RUBROS,
  merecePagina,
  rubroPorSlug,
  rubrosRelacionados,
} from "@/lib/rubros";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linaresya.cl";

/**
 * Una pagina por rubro (LY-034).
 *
 * Las categorias del sitio son baldes anchos que nadie busca. Esta pagina
 * apunta a lo que la gente sí escribe en Google: "restaurantes en Linares".
 *
 * Se arma sola: corre la misma busqueda de texto completo que usa el buscador,
 * asi que no hay ningun campo nuevo que cargar en los negocios y la lista se
 * actualiza cuando entra uno nuevo.
 *
 * Se revalida cada 6 horas. No necesita ser mas fresca que eso, y al quedar
 * cacheada Google la recibe rapido, que es la mitad del asunto.
 */
export const revalidate = 21600;

type NegocioRow = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  plan: string | null;
  premium_hasta: string | null;
  verificado: boolean | null;
  telefono: string | null;
  direccion: string | null;
  foto_portada: string | null;
  categorias: { nombre: string; slug: string; emoji: string } | null;
};

export function generateStaticParams() {
  return RUBROS.map((r) => ({ rubro: r.slug }));
}

async function negociosDelRubro(consulta: string): Promise<NegocioRow[]> {
  const { data } = await supabase
    .from("negocios")
    .select(
      "id, nombre, slug, descripcion, plan, premium_hasta, verificado, telefono, direccion, foto_portada, categorias:categoria_id(nombre, slug, emoji)",
    )
    .eq("activo", true)
    .textSearch("busqueda", consulta, { type: "websearch", config: "spanish_unaccent" })
    .order("plan", { ascending: false })
    .order("verificado", { ascending: false })
    .order("nombre", { ascending: true })
    .limit(60);

  return (data ?? []) as unknown as NegocioRow[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rubro: string }>;
}) {
  const { rubro: slug } = await params;
  const rubro = rubroPorSlug(slug);
  if (!rubro) return {};

  const negocios = await negociosDelRubro(rubro.consulta);
  if (!merecePagina(negocios.length)) return { robots: { index: false, follow: true } };

  return {
    title: `${rubro.titulo} — teléfono, dirección y horarios`,
    description: `${negocios.length} opciones de ${rubro.descripcion}, con teléfono, dirección y cómo llegar. Actualizado en LinaresYa.`,
    alternates: { canonical: `${SITE_URL}/en-linares/${rubro.slug}` },
    openGraph: {
      title: rubro.titulo,
      description: `${negocios.length} opciones de ${rubro.descripcion}.`,
      url: `${SITE_URL}/en-linares/${rubro.slug}`,
    },
  };
}

export default async function RubroPage({
  params,
}: {
  params: Promise<{ rubro: string }>;
}) {
  const { rubro: slug } = await params;
  const rubro = rubroPorSlug(slug);
  if (!rubro) notFound();

  const negocios = await negociosDelRubro(rubro.consulta);

  // Una pagina con uno o dos resultados no le sirve a nadie que la encuentre, y
  // Google la trata como pagina vacia hecha para posicionar. Mejor que no
  // exista: cuando haya mas negocios de ese rubro, aparece sola.
  if (!merecePagina(negocios.length)) notFound();

  const relacionados = rubrosRelacionados(rubro.slug);

  const listaJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: rubro.titulo,
    numberOfItems: negocios.length,
    itemListElement: negocios.slice(0, 20).map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: n.nombre,
      url: `${SITE_URL}/${n.categorias?.slug ?? ""}/${n.slug}`,
    })),
  };

  return (
    <main className="flex-1 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listaJsonLd) }}
      />

      <section className="bg-gradient-to-br from-[#2B6E80] to-[#163d4e] text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Link href="/" className="text-sm text-white/80 hover:underline">
            ← LinaresYa
          </Link>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {rubro.titulo}
          </h1>
          <p className="mt-2 text-sm text-white/85 max-w-2xl">
            {negocios.length} {negocios.length === 1 ? "opción" : "opciones"} de{" "}
            {rubro.descripcion}, con teléfono, dirección y cómo llegar. La lista se
            actualiza cuando entra un negocio nuevo al directorio.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {negocios.map((n) => (
            <article
              key={n.id}
              className="relative rounded-2xl border border-border bg-card overflow-hidden"
            >
              <Link
                href={`/${n.categorias?.slug ?? ""}/${n.slug}`}
                className="absolute inset-0 z-10"
                aria-label={n.nombre}
              />
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EDE8]">
                {n.foto_portada ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.foto_portada}
                    alt={n.nombre}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-5xl">
                    {n.categorias?.emoji ?? "🏪"}
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-baseline gap-1.5">
                  <h2 className="font-bold leading-tight">{n.nombre}</h2>
                  {esPremium(n) && <span className="text-xs">⭐</span>}
                </div>
                {n.descripcion && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {n.descripcion}
                  </p>
                )}
                {n.direccion && (
                  <p className="mt-1.5 text-xs text-muted-foreground">📍 {n.direccion}</p>
                )}
              </div>
            </article>
          ))}
        </div>

        <nav className="mt-10">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Otros rubros en Linares
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {relacionados.map((r) => (
              <Link
                key={r.slug}
                href={`/en-linares/${r.slug}`}
                className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold hover:opacity-80"
              >
                {r.titulo}
              </Link>
            ))}
          </div>
        </nav>

        <p className="mt-8 text-sm text-muted-foreground">
          ¿Tienes un negocio de este rubro y no apareces?{" "}
          <Link href="/publicar" className="font-semibold text-[#2B6E80] hover:underline">
            Publícalo gratis
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
