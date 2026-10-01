import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata = {
  title: "Ficha - Admin LinaresYa",
  robots: { index: false, follow: false },
};

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  categoria_id: number | null;
  tipo: "negocio" | "independiente";
  plan: "basico" | "premium";
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  disponibilidad: string | null;
  foto_portada: string | null;
  activo: boolean;
  verificado: boolean;
  premium_hasta: string | null;
};

type Foto = { id: number; url: string };
type Stat = {
  vistas: number;
  clicks_whatsapp: number;
  clicks_telefono: number;
  clicks_maps: number;
};

function fechaCL(offsetDias: number): string {
  const d = new Date(Date.now() - offsetDias * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default async function FichaNegocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  const desde = fechaCL(29);

  const [
    { data: negocio },
    { data: categoria },
    { data: fotos },
    { data: stats },
  ] = await Promise.all([
    supabaseAdmin.from("negocios").select("*").eq("id", id).single(),
    supabaseAdmin.from("negocios").select("categoria_id").eq("id", id).single(),
    supabaseAdmin.from("fotos").select("id,url").eq("negocio_id", id).order("orden", { ascending: true }),
    supabaseAdmin.from("estadisticas_diarias")
      .select("vistas,clicks_whatsapp,clicks_telefono,clicks_maps")
      .eq("negocio_id", id)
      .gte("fecha", desde),
  ]);

  if (!negocio) notFound();

  const n = negocio as Negocio;
  const categoriaId = (categoria as { categoria_id?: number | null } | null)?.categoria_id ?? n.categoria_id;

  const { data: cat } = categoriaId
    ? await supabaseAdmin.from("categorias").select("slug,nombre,emoji").eq("id", categoriaId).single()
    : { data: null };

  const fotosList = (fotos ?? []) as Foto[];
  const filas = (stats ?? []) as Stat[];
  const vistas = filas.reduce((s, x) => s + Number(x.vistas ?? 0), 0);
  const whatsapp = filas.reduce((s, x) => s + Number(x.clicks_whatsapp ?? 0), 0);
  const telefono = filas.reduce((s, x) => s + Number(x.clicks_telefono ?? 0), 0);
  const maps = filas.reduce((s, x) => s + Number(x.clicks_maps ?? 0), 0);

  const faltantes = [
    !n.descripcion && "Falta descripción",
    !n.telefono && !n.whatsapp && "Falta teléfono/WhatsApp",
    !n.direccion && !n.a_domicilio && "Falta dirección",
    (n.lat == null || n.lng == null) && "Faltan coordenadas",
    !cat && "Falta categoría",
    fotosList.length === 0 && "No tiene fotografías",
    !n.verificado && "Verificación pendiente",
  ].filter(Boolean) as string[];

  const estados = [
    ["Información básica", Boolean(n.nombre && cat && n.descripcion)],
    ["Contacto", Boolean(n.telefono || n.whatsapp || n.email)],
    ["Ubicación", Boolean(n.direccion || n.a_domicilio) && n.lat != null && n.lng != null],
    ["Fotografías", fotosList.length > 0],
    ["Verificación", n.verificado],
  ] as const;

  const fichaUrl = cat ? `/${cat.slug}/${n.slug}` : "/";
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

  return (
    <main className="flex-1 mx-auto w-full max-w-3xl pb-10">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Volver al admin">←</Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ficha operativa</p>
            <h1 className="text-base font-extrabold truncate">{n.nombre}</h1>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${n.activo ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {n.activo ? "Activo" : "Pendiente"}
          </span>
        </div>
      </header>

      <section className="px-4 pt-5">
        <div className="rounded-2xl bg-white border border-border p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-[220px]">
              <p className="text-xs text-muted-foreground">{cat ? `${cat.emoji} ${cat.nombre}` : "Sin categoría"} · {n.tipo === "negocio" ? "Negocio" : "Independiente"}</p>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1">{n.nombre}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {n.verificado && <span className="rounded-full bg-sky-100 text-sky-800 px-2.5 py-1 text-[11px] font-bold">✓ Verificado</span>}
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${n.plan === "premium" ? "bg-amber-100 text-amber-900" : "bg-secondary"}`}>
                  {n.plan === "premium" ? "⭐ Premium" : "Básico"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`${publicUrl}${fichaUrl}`} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-2 text-xs font-bold hover:bg-secondary">Ver ficha ↗</a>
              <Link href={`/admin/negocio/${n.id}/editar`} className="rounded-full bg-foreground text-background px-3 py-2 text-xs font-bold">Editar</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className={`rounded-2xl border p-4 ${faltantes.length ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Qué requiere atención</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{faltantes.length ? `${faltantes.length} punto${faltantes.length === 1 ? "" : "s"} por revisar` : "La ficha no presenta pendientes básicos"}</p>
            </div>
            {faltantes.length > 0 && <Link href={`/admin/negocio/${n.id}/editar`} className="rounded-full bg-foreground text-background px-3 py-2 text-[11px] font-bold">Corregir →</Link>}
          </div>
          {faltantes.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {faltantes.map((x) => <li key={x} className="text-xs font-medium">🟡 {x}</li>)}
            </ul>
          )}
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Resumen de ficha</h2>
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          {estados.map(([label, ok]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-border text-sm">
              <span>{label}</span><span className={`text-xs font-bold ${ok ? "text-emerald-700" : "text-amber-700"}`}>{ok ? "🟢 Completo" : "🟡 Revisar"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Gestionar</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/admin/negocio/${n.id}/editar`} className="rounded-xl border border-border bg-white p-4 text-sm font-bold">✏️ Editar información</Link>
          <Link href={`/admin/verificacion`} className="rounded-xl border border-border bg-white p-4 text-sm font-bold">✓ Verificación</Link>
          <Link href={`/admin/calidad`} className="rounded-xl border border-border bg-white p-4 text-sm font-bold">🛠️ Calidad</Link>
          <Link href={`/admin/negocio/${n.id}/estadisticas`} className="rounded-xl border border-border bg-white p-4 text-sm font-bold">📊 Estadísticas</Link>
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Rendimiento · 30 días</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Metric label="Vistas" value={vistas} />
          <Metric label="WhatsApp" value={whatsapp} />
          <Metric label="Teléfono" value={telefono} />
          <Metric label="Maps" value={maps} />
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Galería</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{fotosList.length} foto{fotosList.length === 1 ? "" : "s"} registrada{fotosList.length === 1 ? "" : "s"}</p>
            </div>
            <Link href={`/admin/negocio/${n.id}/editar`} className="text-xs font-bold text-[#2B6E80]">Gestionar →</Link>
          </div>
          {fotosList.length > 0 && <div className="grid grid-cols-4 gap-2 mt-3">{fotosList.slice(0,4).map((f) => <img key={f.id} src={f.url} alt="" className="w-full aspect-square object-cover rounded-lg" />)}</div>}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="text-sm font-bold">Accesos rápidos</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link href={`/admin/negocio/${n.id}/editar`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold">QR y link del dueño</Link>
            <a href={`${publicUrl}${fichaUrl}`} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-2 text-xs font-semibold">Ficha pública ↗</a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl bg-white border border-border p-4"><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-2xl font-extrabold mt-1 tabular-nums">{value}</p></div>;
}
