import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { posts as blogPosts } from "@/lib/blog-posts";
import { RUBROS } from "@/lib/rubros";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.vercel.app";

// Revalida cada 6 horas - balance entre frescura y evitar pegarle a supabase en cada hit del bot
export const revalidate = 21600;

type CategoriaRow = { slug: string };
type NegocioRow = {
  slug: string;
  actualizado_en: string | null;
  creado_en: string;
  categorias: { slug: string } | { slug: string }[] | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [{ data: cats }, { data: negs }] = await Promise.all([
    supabase.from("categorias").select("slug").eq("activa", true),
    supabase
      .from("negocios")
      .select("slug, actualizado_en, creado_en, categorias:categoria_id(slug)")
      .eq("activo", true)
      .limit(5000),
  ]);

  const cate = (cats ?? []) as CategoriaRow[];
  const neg = (negs ?? []) as NegocioRow[];

  const urlsEstaticas: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/buscar`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/publicar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/para-negocios`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/premium`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Blog posts estáticos
  const urlsBlog: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.fecha),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const urlsCategorias: MetadataRoute.Sitemap = cate.map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const urlsNegocios: MetadataRoute.Sitemap = neg
    .map((n) => {
      const cat = Array.isArray(n.categorias) ? n.categorias[0] : n.categorias;
      if (!cat?.slug) return null;
      const lastMod = n.actualizado_en ?? n.creado_en;
      return {
        url: `${SITE_URL}/${cat.slug}/${n.slug}`,
        lastModified: lastMod ? new Date(lastMod) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Paginas por rubro (LY-034). Van con prioridad alta: son las que apuntan a
  // lo que la gente escribe en Google ("restaurantes en Linares"), al reves que
  // las categorias, que son baldes anchos que nadie busca. Se listan todas: la
  // que no tenga negocios suficientes responde 404 y Google la descarta sola.
  const urlsRubros: MetadataRoute.Sitemap = RUBROS.map((r) => ({
    url: `${SITE_URL}/en-linares/${r.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [
    ...urlsEstaticas,
    ...urlsBlog,
    ...urlsCategorias,
    ...urlsRubros,
    ...urlsNegocios,
  ];
}
