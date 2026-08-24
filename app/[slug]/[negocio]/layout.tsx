import { notFound } from "next/navigation";
import { getCategoriaPorSlug, getNegocioPorSlug } from "@/lib/consultas";

/**
 * Mismo motivo que el layout de la categoria: una ficha inexistente tiene
 * que responder 404 y no 200. Reusa las consultas cacheadas de la page.
 */
export default async function NegocioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; negocio: string }>;
}) {
  const { slug, negocio } = await params;
  const categoria = await getCategoriaPorSlug(slug);
  if (!categoria) notFound();
  if (!(await getNegocioPorSlug(negocio, categoria.id))) notFound();
  return children;
}
