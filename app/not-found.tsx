import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Pagina no encontrada - LinaresYa",
  robots: { index: false, follow: false },
};

type Categoria = {
  nombre: string;
  slug: string;
  emoji: string;
};

export default async function NotFound() {
  // Cargamos algunas categorias para sugerir alternativas. Si la query falla
  // o esta vacia, mostramos solo el link a home.
  const { data } = await supabase
    .from("categorias")
    .select("nombre, slug, emoji")
    .eq("activa", true)
    .order("orden", { ascending: true })
    .limit(8);

  const cats = (data ?? []) as Categoria[];

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-4 pt-16 pb-10 text-center">
      <div className="text-7xl mb-2">{"🔍"}</div>
      <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
      <p className="mt-2 text-lg font-semibold">No encontramos esta pagina</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Capaz que el link esta mal o el negocio ya no esta activo.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold px-6 py-3"
        >
          Volver al inicio
        </Link>
        <Link
          href="/buscar"
          className="inline-flex items-center justify-center rounded-full bg-secondary text-foreground text-sm font-semibold px-6 py-3 hover:bg-secondary/80 transition"
        >
          Buscar negocio
        </Link>
      </div>

      {cats.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            O explora por categoria
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  className="block rounded-2xl bg-secondary/60 hover:bg-secondary px-3 py-4 text-sm font-semibold transition"
                >
                  <div className="text-2xl mb-1">{c.emoji}</div>
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
