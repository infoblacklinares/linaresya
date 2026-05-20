/**
 * AdvertisementBanner.tsx — Banner de negocio destacado / premium
 * Server Component: recibe datos del negocio o usa defaults.
 *
 * Uso:
 *   <AdvertisementBanner negocio={primerPremium} />
 *   <AdvertisementBanner />  ← fallback genérico para publicitar el plan
 */
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
  /** Llamado a la acción alternativo cuando no hay negocio premium */
  fallbackCta?: boolean;
}

export default function AdvertisementBanner({
  negocio,
  fallbackCta = true,
}: AdvertisementBannerProps) {
  // ── Si no hay negocio premium, mostrar CTA para contratar ──────────────────
  if (!negocio) {
    if (!fallbackCta) return null;
    return (
      <section className="px-4 pt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#C05A46] to-[#a84d3a] p-5 shadow-linares">
          {/* Patrón decorativo */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10"
            style={{
              background:
                "radial-gradient(circle at 80% 50%, #fff 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <span className="mb-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
              ✦ Espacio Premium
            </span>
            <h3 className="mt-1 text-lg font-extrabold leading-tight text-white">
              ¿Tu negocio aún no está aquí?
            </h3>
            <p className="mt-1 text-sm text-white/80">
              Aparece gratis frente a miles de vecinos que buscan lo que ofrecés.
            </p>
            <Link
              href="/publicar"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#C05A46] transition hover:bg-[#F9F8F6]"
            >
              Publicar mi negocio →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ── Negocio premium destacado ──────────────────────────────────────────────
  const url = `/${negocio.categoria_slug}/${negocio.slug}`;
  const waUrl = negocio.whatsapp
    ? `https://wa.me/56${negocio.whatsapp}?text=Hola, vi tu negocio en LinaresYa`
    : null;

  return (
    <section className="px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2B6E80] to-[#1f5268] p-5 shadow-linares">
        {/* Decoración */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10"
          style={{
            background: "radial-gradient(circle at 80% 50%, #fff 0%, transparent 70%)",
          }}
        />

        <div className="relative flex items-start gap-4">
          {/* Emoji / logo */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15 text-3xl">
            {negocio.emoji ?? "🏪"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#F4B860] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#1A1410]">
                ⭐ Destacado
              </span>
            </div>
            <h3 className="mt-1 truncate text-base font-extrabold text-white">
              {negocio.nombre}
            </h3>
            {negocio.descripcion && (
              <p className="mt-0.5 line-clamp-1 text-xs text-white/70">
                {negocio.descripcion}
              </p>
            )}

            {/* Acciones */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={url}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#2B6E80] transition hover:bg-[#F9F8F6]"
              >
                Ver perfil →
              </Link>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#1fa752]"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
