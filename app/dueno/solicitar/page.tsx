import Link from "next/link";
import SolicitarForm from "./SolicitarForm";

export const metadata = {
  title: "Editar mi negocio - LinaresYa",
  description: "Solicita un link para editar tu negocio publicado en LinaresYa.",
  robots: { index: false, follow: false },
};

export default function SolicitarPage() {
  return (
    <main className="flex-1 mx-auto w-full max-w-md px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4"
      >
        {"←"} Volver al inicio
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight">
        Editar mi negocio
      </h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground leading-relaxed">
        Si publicaste un negocio en LinaresYa y queres actualizar sus datos,
        ingresa el email con el que te registraste y te enviamos un link directo
        al editor.
      </p>

      <SolicitarForm />
    </main>
  );
}
