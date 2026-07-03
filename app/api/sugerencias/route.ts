import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 60);

  if (q.length < 2) {
    return NextResponse.json({ negocios: [], categorias: [] });
  }

  const like = `%${q}%`;

  const [{ data: negocios }, { data: categorias }] = await Promise.all([
    supabase
      .from("negocios")
      .select("nombre, slug, categorias:categoria_id(slug, emoji)")
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

  const negs = (negocios ?? []).map((n) => {
    const cat = Array.isArray(n.categorias) ? n.categorias[0] : n.categorias;
    return {
      nombre: n.nombre as string,
      url: cat ? `/${(cat as { slug: string }).slug}/${n.slug}` : `/buscar?q=${encodeURIComponent(n.nombre as string)}`,
      emoji: cat ? (cat as { emoji: string }).emoji : "🏪",
    };
  });

  const cats = (categorias ?? []).map((c) => ({
    nombre: c.nombre as string,
    url: `/${c.slug}`,
    emoji: c.emoji as string,
  }));

  return NextResponse.json(
    { negocios: negs, categorias: cats },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}
