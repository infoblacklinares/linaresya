import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border bg-secondary/30">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              LinaresYa
            </h3>
            <p className="text-muted-foreground leading-relaxed text-[13px]">
              Directorio local de negocios y servicios de Linares, Maule.
            </p>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Sumate
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/publicar"
                  className="hover:underline font-medium"
                >
                  Publicar negocio
                </Link>
              </li>
              <li>
                <Link href="/buscar" className="hover:underline font-medium">
                  Buscar
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline font-medium">
                  Categorias
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Legal
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/terminos" className="hover:underline font-medium">
                  Terminos
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="hover:underline font-medium"
                >
                  Privacidad
                </Link>
              </li>
              <li>
                <a
                  href="mailto:infoblack.linares@gmail.com"
                  className="hover:underline font-medium"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-muted-foreground">
          <p>© {year} LinaresYa. Hecho en Linares.</p>
          <p>v1.0</p>
        </div>
      </div>
    </footer>
  );
}
