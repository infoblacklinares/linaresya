import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import PrintButton from "./PrintButton";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

type Props = { params: Promise<{ categoria: string; negocio: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, negocio: negocioSlug } = await params;
  const { data } = await supabase
    .from("negocios")
    .select("nombre, categorias:categoria_id(slug)")
    .eq("slug", negocioSlug)
    .eq("activo", true)
    .maybeSingle();

  const nombre = (data as { nombre?: string } | null)?.nombre ?? "Negocio";
  return {
    title: `QR - ${nombre} | LinaresYa`,
    robots: { index: false, follow: false },
  };
}

export default async function QRPage({ params }: Props) {
  const { categoria: categoriaSlug, negocio: negocioSlug } = await params;

  // Verificar que el negocio existe y la categoría coincide
  const { data: cat } = await supabase
    .from("categorias")
    .select("id, nombre, slug, emoji")
    .eq("slug", categoriaSlug)
    .eq("activa", true)
    .maybeSingle();

  if (!cat) notFound();

  const { data: neg } = await supabase
    .from("negocios")
    .select("id, nombre, slug, descripcion, telefono")
    .eq("slug", negocioSlug)
    .eq("categoria_id", (cat as { id: number }).id)
    .eq("activo", true)
    .maybeSingle();

  if (!neg) notFound();

  const n = neg as { nombre: string; slug: string; telefono: string | null };
  const c = cat as { nombre: string; slug: string; emoji: string };

  const fichaUrl = `${SITE_URL}/${c.slug}/${n.slug}`;
  // Usamos la API gratuita de qrserver.com — sin dependencias npm.
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=16&data=${encodeURIComponent(fichaUrl)}`;

  return (
    <main className="flex-1 mx-auto w-full max-w-lg px-4 pt-8 pb-12">

      {/* Encabezado */}
      <div className="text-center mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          LinaresYa · Código QR
        </p>
        <h1 className="text-xl font-extrabold tracking-tight mt-1">{n.nombre}</h1>
        <p className="text-sm text-muted-foreground">{c.emoji} {c.nombre} en Linares</p>
      </div>

      {/* Card imprimible */}
      <div
        id="qr-card"
        className="rounded-3xl border-2 border-[#0f172a] bg-white p-6 flex flex-col items-center gap-4 print:border-black print:shadow-none"
      >
        {/* QR */}
        <div className="rounded-2xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt={`Código QR de ${n.nombre}`}
            width={280}
            height={280}
            className="block"
          />
        </div>

        {/* Texto del cartel */}
        <div className="text-center space-y-1">
          <p className="text-lg font-extrabold tracking-tight">{n.nombre}</p>
          <p className="text-sm text-foreground/70">{c.emoji} {c.nombre}</p>
        </div>

        <div className="w-full border-t border-dashed border-border" />

        <div className="text-center">
          <p className="text-base font-bold">📱 Escaneame</p>
          <p className="text-sm text-foreground/70 mt-0.5">
            Mirá nuestros horarios, contacto<br />y dejanos una reseña
          </p>
        </div>

        <div className="w-full border-t border-dashed border-border" />

        {/* Branding */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Encontranos en</span>
          <span className="text-xs font-extrabold tracking-tight text-[#0f172a]">LinaresYa.cl</span>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mt-6 rounded-2xl bg-secondary/50 p-4 space-y-2 text-[13px]">
        <p className="font-semibold">¿Cómo usar este QR?</p>
        <ol className="list-decimal list-inside space-y-1 text-foreground/70">
          <li>Hacé clic en "Imprimir" o guardá la imagen</li>
          <li>Pegalo en tu mostrador, ventana o menú</li>
          <li>Tus clientes lo escanean y llegan directo a tu ficha</li>
          <li>Pueden ver horarios, llamarte y dejar una reseña</li>
        </ol>
      </div>

      {/* Acciones */}
      <div className="mt-5 flex flex-col gap-2">
        <PrintButton />
        <a
          href={fichaUrl}
          className="w-full rounded-full bg-secondary text-foreground text-sm font-semibold py-3 text-center hover:bg-secondary/80 transition print:hidden"
        >
          Ver ficha del negocio →
        </a>
      </div>

      {/* CTA Premium si no lo tienen */}
      <div className="mt-6 rounded-2xl bg-[#2B6E80]/10 border border-[#2B6E80]/20 p-4 text-center print:hidden">
        <p className="text-sm font-semibold text-[#2B6E80]">
          ¿Querés que tus clientes te contacten por WhatsApp directo?
        </p>
        <a
          href="/premium"
          className="mt-2 inline-block text-xs font-bold text-[#2B6E80] underline"
        >
          Ver Plan Premium →
        </a>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          header, nav, button, .print\\:hidden { display: none !important; }
          body { background: white; }
          #qr-card { box-shadow: none; border: 2px solid black; }
        }
      `}</style>
    </main>
  );
}
