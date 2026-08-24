import { notFound } from "next/navigation";
import { getCategoriaPorSlug } from "@/lib/consultas";

/**
 * Solo existe para que una categoria inexistente devuelva un 404 real y no
 * un 200 con cara de 404: el layout corre antes del streaming que abre
 * loading.tsx, que es lo unico que puede fijar el status. La consulta la
 * comparte con la page via cache(), asi que no agrega trabajo.
 */
export default async function CategoriaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getCategoriaPorSlug(slug))) notFound();
  return children;
}
