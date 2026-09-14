import Link from "next/link";
import { RUBROS } from "@/lib/rubros";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linaresya.cl";

export const revalidate = 21600;

export const metadata = {
  title: "Negocios en Linares por rubro",
  description:
    "Restaurantes, peluquerías, ferreterías, veterinarias y más en Linares, con teléfono y dirección.",
  alternates: { canonical: `${SITE_URL}/en-linares` },
};

/**
 * El indice de los rubros (LY-034).
 *
 * Existe para que las paginas de rubro reciban enlaces del propio sitio: una
 * pagina a la que solo se llega por el sitemap tarda mucho mas en entrar a
 * Google, y varias nunca entran.
 *
 * Lista todos los rubros, incluso los que todavia no tienen negocios
 * suficientes: si esa pagina responde 404, Google la descarta y listo, y el dia
 * que se cargue el tercer negocio del rubro empieza a funcionar sola.
 */
export default function IndiceRubrosPage() {
  return (
    <main className="flex-1 w-full">
      <section className="bg-gradient-to-br from-[#2B6E80] to-[#163d4e] text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Link href="/" className="text-sm text-white/80 hover:underline">
            ← LinaresYa
          </Link>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Negocios en Linares, por rubro
          </h1>
          <p className="mt-2 text-sm text-white/85 max-w-2xl">
            Lo que la gente busca, en una lista. Cada rubro se arma solo con los
            negocios del directorio.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {RUBROS.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/en-linares/${r.slug}`}
                className="block rounded-xl border border-border bg-card px-4 py-3 hover:opacity-80"
              >
                <span className="font-bold">{r.titulo}</span>
                <span className="block text-xs text-muted-foreground">
                  {r.descripcion}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
