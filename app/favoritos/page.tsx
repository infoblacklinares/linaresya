import Link from "next/link";
import FavoritosList from "./FavoritosList";

export const metadata = {
  title: "Mis favoritos - LinaresYa",
  description: "Negocios que guardaste como favoritos en LinaresYa.",
  robots: { index: false, follow: false },
};

export default function FavoritosPage() {
  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold tracking-tight">Mis favoritos</h1>
            <p className="text-[11px] text-muted-foreground">
              Guardados en este dispositivo
            </p>
          </div>
        </div>
      </header>

      <section className="pt-4">
        <FavoritosList />
      </section>
    </main>
  );
}
