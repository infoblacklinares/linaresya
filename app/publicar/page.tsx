import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PublishForm from "./PublishForm";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
};

export const metadata = {
  title: "Publicar tu negocio - LinaresYa",
  description:
    "Suma tu negocio, oficio o servicio a LinaresYa gratis y aparece frente a miles de vecinos.",
};

export default async function PublicarPage() {
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nombre, slug, emoji")
    .eq("activa", true)
    .order("orden");

  const categorias = (data ?? []) as Categoria[];

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-base font-bold tracking-tight">Publicar tu negocio</h1>
        </div>
      </header>

      <section className="px-4 pt-5">
        <div className="rounded-3xl bg-[oklch(0.94_0.04_80)] p-6">
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight">
            Gratis. Sin registro.
          </h2>
          <p className="mt-1.5 text-sm text-foreground/75">
            Completa el formulario y aparece frente a miles de vecinos de Linares.
            Nosotros revisamos la informacion antes de activarlo.
          </p>
        </div>
      </section>

      {error && (
        <div className="mx-4 mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          No pudimos cargar las categorias. Intenta recargar la pagina.
        </div>
      )}

      <PublishForm categorias={categorias} />
    </main>
  );
}
