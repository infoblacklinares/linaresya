import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full overflow-hidden bg-[#04343b] text-white">
      <section className="relative isolate w-full overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-[center_48%]" style={{ backgroundImage: "url('/hero-plaza-kiosco.jpg')" }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#00363d]/[.98] via-[#03454d]/[.93] to-[#06434a]/55" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#002c33]/45 via-transparent to-[#002c33]/15" />

        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-8 rounded-[1.75rem] border border-white/20 px-5 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.8fr)] lg:gap-12 lg:px-12 lg:py-12">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-base font-bold text-white backdrop-blur-md sm:text-lg">
              <span aria-hidden="true" className="text-xl">✉</span>
              Novedades de Linares
            </div>
            <div className="mb-4 h-1.5 w-16 rounded-full bg-[#ff4f57]" />
            <h2 className="max-w-4xl text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Entérate primero de ofertas y negocios nuevos en <span className="text-[#ff6268]">Linares</span>
            </h2>
            <p className="mt-4 max-w-3xl text-lg font-medium leading-relaxed text-white/90 sm:text-xl">
              Un resumen semanal con lo mejor de Linares, directo a tu email.
            </p>
            <div className="mt-7 max-w-4xl"><NewsletterForm /></div>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-white/85 sm:text-base">
              <span aria-hidden="true">🔒</span>
              <span>Sin spam. Puedes darte de baja cuando quieras.</span>
              <span className="hidden text-white/50 sm:inline">|</span>
              <Link href="/privacidad" className="underline decoration-white/70 underline-offset-4 hover:text-white">Política de Privacidad</Link>
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="flex min-h-20 items-center gap-4 rounded-2xl border border-white/25 bg-white/10 px-5 py-4 text-white shadow-lg backdrop-blur-md">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/10 text-2xl">♢</span>
              <span className="text-lg font-bold leading-snug sm:text-xl">Ofertas y promociones locales</span>
            </div>
            <div className="flex min-h-20 items-center gap-4 rounded-2xl border border-white/25 bg-white/10 px-5 py-4 text-white shadow-lg backdrop-blur-md">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/10 text-2xl">⌂</span>
              <span className="text-lg font-bold leading-snug sm:text-xl">Nuevos negocios en Linares</span>
            </div>
            <div className="flex min-h-20 items-center gap-4 rounded-2xl border border-white/25 bg-white/10 px-5 py-4 text-white shadow-lg backdrop-blur-md">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/10 text-2xl">▦</span>
              <span className="text-lg font-bold leading-snug sm:text-xl">Eventos y novedades de la ciudad</span>
            </div>
          </div>
        </div>
      </section>

      <div className="relative w-full border-t border-white/15 bg-gradient-to-br from-[#04343b] via-[#063f47] to-[#032d34]">
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
