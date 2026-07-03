import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type SugerenciaOut = { nombre: string; url: string; emoji: string; foto: string | null };

function mapNegocio(n: {
  nombre: string;
  slug: string;
  foto_portada: string | null;
  categorias: { slug: string; emoji: string } | { slug: string; emoji: string }[] | null;
}): SugerenciaOut {
  const cat = Array.isArray(n.categorias) ? n.categorias[0] : n.categorias;
  return {
    nombre: n.nombre,
    url: cat ? `/${cat.slug}/${n.slug}` : `/buscar?q=${encodeURIComponent(n.nombre)}`,
    emoji: cat?.emoji ?? "🏪",
    foto: n.foto_portada,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 60);

  if (q.length < 2) {
    return NextResponse.json({ negocios: [], categorias: [], fallback: [] });
  }

  // Multi-palabra: "pizza exp" → %pizza%exp% (las palabras deben aparecer en orden)
  const like = `%${q.split(/\s+/).join("%")}%`;

  const [{ data: negocios }, { data: categorias }] = await Promise.all([
    supabase
      .from("negocios")
      .select("nombre, slug, foto_portada, categorias:categoria_id(slug, emoji)")
      .eq("activo", true)
      .ilike("nombre", like)
      .limit(6),
    supabase
      .from("categorias")
      .select("nombre, slug, emoji")
      .eq("activa", true)
      .ilike("nombre", like)
      .limit(3),
  ]);

  const negs = (negocios ?? []).map(n => mapNegocio(n as Parameters<typeof mapNegocio>[0]));
  const cats = (categorias ?? []).map(c => ({
    nombre: c.nombre as string,
    url: `/${c.slug}`,
    emoji: c.emoji as string,
    foto: null,
  }));

  // Sin coincidencias: sugerir negocios destacados igual (premium/verificados primero)
  let fallback: SugerenciaOut[] = [];
  if (negs.length === 0 && cats.length === 0) {
    const { data: sugeridos } = await supabase
      .from("negocios")
      .select("nombre, slug, foto_portada, categorias:categoria_id(slug, emoji)")
      .eq("activo", true)
      .order("plan", { ascending: false })
      .order("verificado", { ascending: false })
      .limit(5);
    fallback = (sugeridos ?? []).map(n => mapNegocio(n as Parameters<typeof mapNegocio>[0]));
  }

  return NextResponse.json(
    { negocios: negs, categorias: cats, fallback },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}
