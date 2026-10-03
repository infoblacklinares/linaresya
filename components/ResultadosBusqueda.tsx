"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CercaDeMi from "@/components/CercaDeMi";
import AnimatedCard from "@/components/AnimatedCard";
import { whatsAppLink } from "@/lib/contacto";
import { canUseFeature, esPremium } from "@/lib/planes";
import { formatoDistancia } from "@/lib/distancia";

export type ResultadoNegocio = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  tipo: "negocio" | "independiente";
  plan: "basico" | "premium";
  verificado: boolean;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  a_domicilio: boolean;
  foto_portada: string | null;
  lat: number | null;
  lng: number | null;
  categorias: { id: number; nombre: string; slug: string; emoji: string } | null;
};

type Rating = { avg: number; count: number };
type GeoResult = { negocioId: string; distanciaKm: number };

type Props = {
  items: ResultadoNegocio[];
  ratings: Record<string, Rating>;
  openIds: string[];
  q: string;
  categoriaId?: number;
  tipo: "" | "negocio" | "independiente";
  premium: boolean;
  verificado: boolean;
  domicilio: boolean;
  abierto: boolean;
};

export default function ResultadosBusqueda(props: Props) {
  const {
    items, ratings, openIds, q, categoriaId, tipo,
    premium, verificado, domicilio, abierto,
  } = props;
  const [geoResultados, setGeoResultados] = useState<GeoResult[]>([]);
  const [geoNegocios, setGeoNegocios] = useState<ResultadoNegocio[]>([]);
  const [geoRatings, setGeoRatings] = useState<Record<string, Rating>>({});
  const [geoOpenIds, setGeoOpenIds] = useState<string[]>([]);

  const activo = geoResultados.length > 0;

  async function cargarCercanos(resultados: GeoResult[]) {
    const ids = resultados.map((r) => r.negocioId);
    const { data, error } = await supabase
      .from("negocios")
      .select("id, nombre, slug, descripcion, tipo, plan, verificado, telefono, whatsapp, direccion, a_domicilio, foto_portada, lat, lng, categorias:categoria_id(id, nombre, slug, emoji)")
      .in("id", ids)
      .eq("activo", true);

    if (error) {
      setGeoResultados([]);
      setGeoNegocios([]);
      return;
    }

    const negocios = (data ?? []) as unknown as ResultadoNegocio[];
    const porId = new Map(negocios.map((n) => [n.id, n]));

    const filtrados = resultados
      .map((r) => porId.get(r.negocioId))
      .filter((n): n is ResultadoNegocio => Boolean(n))
      .filter((n) => {
        if (categoriaId && n.categorias?.id !== categoriaId) return false;
        if (tipo && n.tipo !== tipo) return false;
        if (premium && n.plan !== "premium") return false;
        if (verificado && !n.verificado) return false;
        if (domicilio && !n.a_domicilio) return false;
        if (q) {
          const texto = (n.nombre + " " + (n.descripcion ?? "") + " " + (n.categorias?.nombre ?? "")).toLocaleLowerCase("es");
          if (!texto.includes(q.toLocaleLowerCase("es").trim())) return false;
        }
        return true;
      });

    const distanciaPorId = new Map(resultados.map((r) => [r.negocioId, r.distanciaKm]));
    setGeoResultados(resultados);
    setGeoNegocios(filtrados);

    if (filtrados.length === 0) {
      setGeoRatings({});
      setGeoOpenIds([]);
      return;
    }

    const filtradosIds = filtrados.map((n) => n.id);
    const { data: resenas } = await supabase
      .from("resenas")
      .select("negocio_id, estrellas")
      .in("negocio_id", filtradosIds)
      .eq("aprobada", true);

    const ratingMap: Record<string, Rating> = {};
    for (const row of (resenas ?? []) as { negocio_id: string; estrellas: number }[]) {
      const prev = ratingMap[row.negocio_id] ?? { avg: 0, count: 0 };
      ratingMap[row.negocio_id] = {
        avg: (prev.avg * prev.count + row.estrellas) / (prev.count + 1),
        count: prev.count + 1,
      };
    }
    setGeoRatings(ratingMap);

    const dia = new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
      weekday: "long",
    }).format(new Date()).toLowerCase();

    const ahora = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Santiago",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());

    const { data: horarios } = await supabase
      .from("horarios")
      .select("negocio_id, abre, cierra")
      .in("negocio_id", filtradosIds)
      .eq("dia", dia)
      .eq("cerrado", false);

    const abiertos = ((horarios ?? []) as { negocio_id: string; abre: string | null; cierra: string | null }[])
      .filter((h) => h.abre && h.cierra && ahora >= h.abre && ahora <= h.cierra)
      .map((h) => h.negocio_id);

    setGeoOpenIds(abiertos);
  }

  function resetGeo() {
    setGeoResultados([]);
    setGeoNegocios([]);
    setGeoRatings({});
    setGeoOpenIds([]);
  }

  const mostrar = activo ? geoNegocios : items;
  const mostrarRatings = activo ? geoRatings : ratings;
  const mostrarOpen = activo ? geoOpenIds : openIds;

  const distanciaMap = useMemo(
    () => new Map(geoResultados.map((r) => [r.negocioId, r.distanciaKm])),
    [geoResultados],
  );

  const ordenados = useMemo(() => {
    if (!activo || !abierto) return mostrar;
    return [...mostrar].sort(
      (a, b) => Number(mostrarOpen.includes(b.id)) - Number(mostrarOpen.includes(a.id)),
    );
  }, [activo, abierto, mostrar, mostrarOpen]);

  return (
    <>
      <div className="px-4 mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight">
            {activo ? "Cerca de ti" : q ? 'Resultados para "' + q + '"' : "Negocios en Linares"}
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
            {mostrar.length} resultado{mostrar.length === 1 ? "" : "s"}
            {activo ? " · Ordenados por distancia" : ""}
            {!activo && abierto ? " · Abiertos ahora" : ""}
            {!activo && domicilio ? " · A domicilio" : ""}
            {!activo && verificado ? " · Verificados" : ""}
            {!activo && premium ? " · Premium" : ""}
            {!activo && tipo === "independiente" ? " · Independientes" : ""}
          </p>
        </div>
      </div>

      {mostrar.length === 0 ? (
        <div className="mx-4 rounded-3xl border border-dashed border-border p-8 sm:p-10 text-center">
          <div className="text-5xl mb-3">🔎</div>
          <h2 className="text-lg font-bold">
            {activo ? "No encontramos negocios cercanos" : q ? 'No encontramos "' + q + '"' : "No encontramos nada"}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
            {activo ? "Puedes quitar algún filtro o buscar por nombre o categoría." : "No encontramos resultados con los filtros actuales."}
          </p>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ordenados.map((n, i) => (
            <AnimatedCard key={n.id} index={i}>
              <NegocioCard
                n={n}
                isOpen={mostrarOpen.includes(n.id)}
                rating={mostrarRatings[n.id] ?? null}
                distanciaKm={activo ? distanciaMap.get(n.id) : undefined}
              />
            </AnimatedCard>
          ))}
        </div>
      )}

      {activo && (
        <button
          type="button"
          onClick={resetGeo}
          className="mx-4 mt-4 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground"
        >
          Volver a resultados normales
        </button>
      )}

      <div className="hidden">
        <CercaDeMi activo={activo} onResultados={cargarCercanos} />
      </div>
    </>
  );
}

function NegocioCard({
  n, isOpen, rating, distanciaKm,
}: {
  n: ResultadoNegocio;
  isOpen?: boolean;
  rating?: Rating | null;
  distanciaKm?: number;
}) {
  const premium = esPremium(n);
  const waUrl = canUseFeature(n, "whatsapp") ? whatsAppLink(n.whatsapp) : null;
  const categoriaSlug = n.categorias?.slug ?? "sin-categoria";
  const href = "/" + categoriaSlug + "/" + n.slug;

  return (
    <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all group">
      <Link href={href} aria-label={"Ver ficha de " + n.nombre} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EDE8]">
          {n.foto_portada ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={n.foto_portada} alt={n.nombre} loading="lazy" decoding="async" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl opacity-30">🏪</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-2 left-2">
            <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border " + (isOpen ? "bg-emerald-500/80 text-white border-emerald-400/40" : "bg-black/50 text-white/80 border-white/10")}>
              {isOpen ? "● Abierto" : "● Cerrado"}
            </span>
          </div>
          {premium && <div className="absolute top-2 right-2"><span className="text-[9px] font-bold bg-[#F4B860] text-[#1A1410] px-1.5 py-0.5 rounded-full">⭐ Premium</span></div>}
          {n.verificado && <div className="absolute top-2 left-2"><span className="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center shadow"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span></div>}
        </div>
      </Link>
      <div className="p-3">
        {n.categorias && <span className="text-[10px] font-semibold text-muted-foreground">{n.categorias.emoji} {n.categorias.nombre}</span>}
        <Link href={href} className="block mt-0.5"><p className="font-bold text-[13px] text-[#1A1410] leading-tight line-clamp-1 group-hover:text-[#2B6E80] transition-colors">{n.nombre}</p></Link>
        {n.descripcion && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">{n.descripcion}</p>}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {rating && <span className="text-[11px] font-bold text-amber-600">★ {rating.avg.toFixed(1)}</span>}
          {n.a_domicilio && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">🛵 A domicilio</span>}
          {distanciaKm !== undefined && <span className="text-[10px] font-semibold text-[#2B6E80]">📍 a {formatoDistancia(distanciaKm)}</span>}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Link href={href} className="flex-1 inline-flex items-center justify-center rounded-full border border-border bg-white px-3 py-2 text-[11px] font-bold text-foreground hover:bg-secondary transition">Ver ficha</Link>
          {waUrl ? (
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#1ebe5d] transition shadow-sm"><WhatsAppIcon /> WhatsApp</a>
          ) : (
            <Link href={href} className="flex-1 inline-flex items-center justify-center rounded-full bg-[#2B6E80] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#245d6d] transition">Ver ficha</Link>
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3 17l-1 5 5.2-1.4A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.5Z" /></svg>;
}
