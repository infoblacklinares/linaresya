import { cache } from "react";
import { supabase, type Categoria, type Negocio } from "@/lib/supabase";

/**
 * Consultas compartidas por layout, generateMetadata y page de las rutas
 * /[slug] y /[slug]/[negocio].
 *
 * cache() de React las memoiza por request: las tres capas piden lo mismo y
 * Supabase lo resuelve una sola vez. Antes metadata y page consultaban por
 * separado, asi que una ficha hacia cuatro consultas donde ahora hace dos.
 *
 * Que el layout pueda resolverlas es lo que permite devolver un 404 de
 * verdad: el layout se renderiza antes de que empiece el streaming, asi que
 * notFound() ahi si alcanza a fijar el status. Llamado desde la page, con un
 * loading.tsx en medio, la respuesta ya salio con 200 y solo cambia el
 * contenido (soft 404).
 *
 * Limitacion conocida: en /[slug]/[negocio] esto no alcanza, porque el
 * loading.tsx de la categoria abre el streaming mas arriba que el layout de
 * la ficha. Una ficha inexistente responde 200 con contenido de 404; por eso
 * su generateMetadata devuelve noindex. Para que ahi tambien sea 404 real
 * habria que sacar app/[slug]/loading.tsx (se pierde el skeleton de la
 * categoria) o mover ese skeleton a un <Suspense> dentro de la page.
 *
 * Ojo: getCategoriaPorSlug NO filtra por `activa`. Cada ruta decide: la
 * portada de categoria exige que este activa, la ficha de negocio no.
 */
export const getCategoriaPorSlug = cache(
  async (slug: string): Promise<Categoria | null> => {
    const { data } = await supabase
      .from("categorias")
      .select("*")
      .eq("slug", slug)
      .single();
    return (data as Categoria | null) ?? null;
  },
);

export const getNegocioPorSlug = cache(
  async (negocioSlug: string, categoriaId: number): Promise<Negocio | null> => {
    const { data } = await supabase
      .from("negocios")
      .select("*")
      .eq("slug", negocioSlug)
      .eq("categoria_id", categoriaId)
      .eq("activo", true)
      .single();
    return (data as Negocio | null) ?? null;
  },
);
