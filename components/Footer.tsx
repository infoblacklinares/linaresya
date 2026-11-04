import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full overflow-hidden bg-[#04343b] text-white">
      <div className="relative w-full bg-gradient-to-br from-[#04343b] via-[#063f47] to-[#032d34]">
        <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.15fr_1fr_.8fr] lg:gap-16 lg:px-12 lg:py-14">
          <div>
            <Link href="/" aria-label="LinaresYa, inicio" className="inline-flex items-center gap-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              <span aria-hidden="true" className="text-5xl leading-none text-[#ff555d]">●</span>
              <span>Linares<span className="text-[#ff6268]">Ya</span></span>
            </Link>
            <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-white/85 sm:text-xl">Directorio local de negocios y servicios de Linares, Maule.</p>
          </div>

          <nav aria-label="Explora Linares">
            <h3 className="mb-5 text-xl font-extrabold text-white sm:text-2xl">Explora Linares</h3>
            <ul className="grid gap-3 text-base font-semibold text-white/90 sm:text-lg">
              <li><Link href="/publicar" className="transition hover:text-[#75e5e8]">›&nbsp; Publicar negocio</Link></li>
              <li><Link href="/premium" className="transition hover:text-[#75e5e8]">›&nbsp; Plan Premium</Link></li>
              <li><Link href="/para-negocios" className="transition hover:text-[#75e5e8]">›&nbsp; Para negocios</Link></li>
              <li><Link href="/farmacia-turno" className="transition hover:text-[#75e5e8]">›&nbsp; Farmacia de turno</Link></li>
              <li><Link href="/buscar" className="transition hover:text-[#75e5e8]">›&nbsp; Buscar</Link></li>
              <li><Link href="/" className="transition hover:text-[#75e5e8]">›&nbsp; Categorías</Link></li>
              <li><Link href="/en-linares" className="transition hover:text-[#75e5e8]">›&nbsp; Negocios por rubro</Link></li>
              <li><Link href="/blog" className="transition hover:text-[#75e5e8]">›&nbsp; Blog</Link></li>
            </ul>
          </nav>

          <nav aria-label="Ayuda y legal">
            <h3 className="mb-5 text-xl font-extrabold text-white sm:text-2xl">Ayuda y legal</h3>
            <ul className="grid gap-3 text-base font-semibold text-white/90 sm:text-lg">
              <li><Link href="/terminos" className="transition hover:text-[#75e5e8]">›&nbsp; Términos</Link></li>
              <li><Link href="/privacidad" className="transition hover:text-[#75e5e8]">›&nbsp; Privacidad</Link></li>
              <li><a href="mailto:infoblack.linares@gmail.com" className="transition hover:text-[#75e5e8]">›&nbsp; Contacto</a></li>
            </ul>
          </nav>
        </div>

        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 border-t border-white/25 px-5 py-6 text-sm font-medium text-white/75 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <p>© {year} LinaresYa. Hecho en Linares.</p>
          <p>Diseñado y desarrollado por <a href="https://infoblack.cl" target="_blank" rel="noopener noreferrer" className="font-extrabold text-white transition hover:text-[#75e5e8]">infoblack</a></p>
        </div>
      </div>
    </footer>
  );
}
