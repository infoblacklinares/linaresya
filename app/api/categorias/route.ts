import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Categorias activas para formularios del cliente.
 *
 * Lo usa el popup de "suma tu negocio", que vive en el layout raiz: pedir las
 * categorias aca (solo cuando el popup se abre) evita agregarle una consulta
 * a Supabase al render de cada pagina del sitio.
 */
export async function GET() {
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nombre, emoji")
    .eq("activa", true)
    .order("orden");

  if (error) {
    return NextResponse.json({ categorias: [] }, { status: 500 });
  }

  return NextResponse.json(
    { categorias: data ?? [] },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
