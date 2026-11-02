import Link from "next/link";

interface AdvertisementBannerProps {
  negocio?: {
    nombre: string;
    slug: string;
    categoria_slug: string;
    descripcion?: string | null;
    telefono?: string | null;
    whatsapp?: string | null;
    emoji?: string;
  };
  fallbackCta?: boolean;
}

export default function AdvertisementBanner({ negocio, fallbackCta = true }: AdvertisementBannerProps) {
  if (!negocio && !fallbackCta) return null;

  const perfil = negocio?.categoria_slug && negocio?.slug
    ? `/${negocio.categoria_slug}/${negocio.slug}`
    : "/publicar";

  return (
    <section className="px-0 pt-8 pb-3" aria-label="Publica tu negocio en LinaresYa">
      <div className="ly-business-cta relative flex flex-col gap-5 overflow-hidden rounded-2xl bg-[#071d38] px-5 py-5 text-white shadow-[0_12px_32px_rgba(7,29,56,.18)] sm:flex-row sm:items-center sm:px-7 lg:px-9">
        <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f51e4e] text-3xl">🏪</div>
        <div className="min-w-0 flex-1">
          {negocio ? (
            <>
              <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#ffb7c5]">Negocio destacado de Linares</span>
              <h3 className="mt-1 text-xl font-black leading-tight text-white">{negocio.nombre}</h3>
              <p className="mt-1 text-sm text-white/75">{negocio.descripcion || "Conoce este negocio local y descubre lo que ofrece."}</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-black leading-tight text-white sm:text-2xl">¿Tienes un negocio en Linares?</h3>
              <p className="mt-1 text-sm text-white/75">Aumenta tu visibilidad, llega a más clientes y sé parte de LinaresYa.</p>
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {negocio ? <Link href={perfil} className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#10243a] transition hover:bg-slate-100">Conocer negocio <span className="ml-2">→</span></Link> : null}
          <Link href="/publicar" className="inline-flex items-center justify-center rounded-full bg-[#f51e4e] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#dc1744]">Publica tu negocio gratis <span className="ml-2">→</span></Link>
        </div>
        <div className="hidden shrink-0 items-center gap-6 border-l border-white/15 pl-6 lg:flex">
          <span className="text-center text-xs font-bold text-white/85">♧<br/>Más clientes</span>
          <span className="text-center text-xs font-bold text-white/85">☆<br/>Tu marca visible</span>
          <span className="text-center text-xs font-bold text-white/85">♡<br/>Apoyo local</span>
        </div>
      </div>
    </section>
  );
}
