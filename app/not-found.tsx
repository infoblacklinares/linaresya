import Link from "next/link";

export const metadata = {
  title: "Pagina no encontrada - LinaresYa",
  robots: { index: false, follow: false },
};

export default function NotFound() {
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
    </main>
  );
}
