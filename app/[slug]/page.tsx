import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.vercel.app";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
  descripcion: string | null;
};

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  tipo: "negocio" | "independiente";
  plan: "basico" | "premium";
  verificado: boolean;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  a_domicilio: boolean;
  foto_portada: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase
    .from("categorias")
    .select("nombre,slug,descripcion,emoji")
    .eq("slug", slug)
    .eq("activa", true)
    .single();

  if (!data) return { title: "Categoria no encontrada" };

  const c = data as {
    nombre: string;
    slug: string;
    descripcion: string | null;
    emoji: string;
  };
  const titulo = `${c.nombre} en Linares`;
  const descripcion = (
    c.descripcion ??
    `Encuentra ${c.nombre.toLowerCase()} en Linares. Contacto directo, horarios, ubicacion y mas en LinaresYa.`
  ).slice(0, 160);
  const url = `${SITE_URL}/${c.slug}`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "es_CL",
      url,
      siteName: "LinaresYa",
      title: titulo,
      description: descripcion,
    },
    twitter: {
      // Ahora siempre hay imagen generada via app/[slug]/opengraph-image.tsx.
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
    },
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: categoria, error: catError } = await supabase
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .eq("activa", true)
    .single();

  if (catError || !categoria) {
    notFound();
  }

  const cat = categoria as Categoria;

  const { data: negocios } = await supabase
    .from("negocios")
    .select(
      "id,nombre,slug,descripcion,tipo,plan,verificado,telefono,whatsapp,direccion,a_domicilio,foto_portada"
    )
    .eq("categoria_id", cat.id)
    .eq("activo", true)
    .order("plan", { ascending: false })
    .order("verificado", { ascending: false })
    .order("nombre", { ascending: true });

  const items = (negocios ?? []) as Negocio[];

  const breadcrumbData = breadcrumbJsonLd([
    { name: "Inicio", url: SITE_URL },
    { name: cat.nombre, url: `${SITE_URL}/${cat.slug}` },
  ]);
  const itemListData = itemListJsonLd(
    items.map((n) => ({ nombre: n.nombre, slug: n.slug })),
    cat.slug,
  );

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      <JsonLd id="ld-breadcrumb" data={breadcrumbData} />
      <JsonLd id="ld-itemlist" data={itemListData} />
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-border">
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition"
          >
            <BackIcon />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Categoria
            </p>
            <h1 className="text-lg font-extrabold tracking-tight leading-tight truncate">
              {cat.emoji} {cat.nombre}
            </h1>
          </div>
          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            {items.length} {items.length === 1 ? "negocio" : "negocios"}
          </span>
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          <Link
            href={`/${cat.slug}`}
            className="rounded-full bg-foreground text-background text-sm font-semibold px-4 py-2 whitespace-nowrap"
          >
            Todos
          </Link>
          <Link href={`/buscar?categoria=${cat.slug}&abierto=1`} className="ue-pill whitespace-nowrap">
            Abierto ahora
          </Link>
          <Link href={`/buscar?categoria=${cat.slug}&premium=1`} className="ue-pill whitespace-nowrap">
            Premium
          </Link>
          <Link href={`/buscar?categoria=${cat.slug}&domicilio=1`} className="ue-pill whitespace-nowrap">
            A domicilio
          </Link>
          <Link href={`/buscar?categoria=${cat.slug}&verificado=1`} className="ue-pill whitespace-nowrap">
            Verificados
          </Link>
        </div>
      </header>

      {cat.descripcion && (
        <section className="px-4 pt-3">
          <p className="text-sm text-muted-foreground">{cat.descripcion}</p>
        </section>
      )}

      <section className="pt-4 pb-6">
        {items.length === 0 ? (
          <EmptyState emoji={cat.emoji} nombre={cat.nombre} />
        ) : (
          <ul className="px-4 space-y-3">
            {items.map((n) => (
              <li key={n.id}>
                <NegocioCard n={n} categoriaSlug={cat.slug} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function NegocioCard({
  n,
  categoriaSlug,
}: {
  n: Negocio;
  categoriaSlug: string;
}) {
  const esPremium = n.plan === "premium";
  const waNumber = n.whatsapp?.replace(/\D/g, "");

  return (
    <div className="relative flex items-stretch gap-3 p-2 rounded-2xl hover:bg-secondary/60 transition group">
      <Link
        href={`/${categoriaSlug}/${n.slug}`}
        aria-label={n.nombre}
        className="absolute inset-0 rounded-2xl z-0"
      />

      <div className="relative z-10 h-24 w-24 rounded-2xl overflow-hidden shrink-0 bg-secondary flex items-center justify-center pointer-events-none">
        {n.foto_portada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={n.foto_portada}
            alt={n.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-3xl opacity-60">{"\u{1F3EA}"}</span>
        )}
        {esPremium && (
          <span className="absolute top-1 left-1 text-[9px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded-full">
            Premium
          </span>
        )}
      </div>

      <div className="relative z-10 flex-1 min-w-0 py-1 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-[15px] truncate">{n.nombre}</p>
          {n.verificado && <VerifiedIcon />}
        </div>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mt-0.5">
          {n.descripcion ?? "Sin descripcion"}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
          {n.tipo === "independiente" && (
            <span className="bg-secondary px-2 py-0.5 rounded-full font-medium">
              Independiente
            </span>
          )}
          {n.a_domicilio && (
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              A domicilio
            </span>
          )}
          {n.direccion && (
            <span className="text-muted-foreground truncate">
              {"\u{1F4CD}"} {n.direccion}
            </span>
          )}
        </div>
      </div>

      <div className="relative z-20 flex flex-col items-end justify-between py-1 shrink-0">
        {waNumber && esPremium ? (
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded-full bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 hover:bg-emerald-600 transition"
          >
            <WhatsAppIcon /> WhatsApp
          </a>
        ) : (
          <span className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition text-sm">
            {"\u2192"}
          </span>
        )}
        {n.telefono && (
          <span className="text-[10px] text-muted-foreground">
            {n.telefono}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ emoji, nombre }: { emoji: string; nombre: string }) {
  return (
    <div className="mx-4 rounded-3xl border border-dashed border-border p-8 sm:p-10 text-center">
      <div className="text-5xl mb-3">{emoji}</div>
      <h2 className="text-lg font-bold">Aun no hay negocios en {nombre}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
        Sos el primero? Sumate gratis y apareces aca apenas te aprobamos.
      </p>
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
        <Link
          href="/publicar"
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-sm font-semibold px-5 py-2.5"
        >
          Publicar mi negocio {"\u2192"}
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-foreground text-sm font-semibold px-5 py-2.5 hover:bg-secondary/80 transition"
        >
          Ver otras categorias
        </Link>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function VerifiedIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-sky-500 shrink-0"
    >
      <path d="M12 2 9.5 4.5 6 4l-.5 3.5L2 9l2 3-2 3 3.5 1.5L6 20l3.5-.5L12 22l2.5-2.5L18 20l.5-3.5L22 15l-2-3 2-3-3.5-1.5L18 4l-3.5.5L12 2Zm-1.2 13.6-3.2-3.2 1.4-1.4 1.8 1.8 4.4-4.4 1.4 1.4-5.8 5.8Z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 3 17l-1 5 5.2-1.4A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.5Z" />
    </svg>
  );
}
