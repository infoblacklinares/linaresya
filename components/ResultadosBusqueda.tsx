"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CercaDeMi from "@/components/CercaDeMi";
import AnimatedCard from "@/components/AnimatedCard";
import { whatsAppLink } from "@/lib/contacto";
import { canUseFeature, esPremium } from "@/lib/planes";
import { formatoDistancia } from "@/lib/distancia";
import { diaHoySantiago, horaAhoraSantiago, dentroDeRango } from "@/lib/horarios";

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
  actualizado_en: string | null;
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
  orden: "relevancia" | "rating";
  urlRelevancia: string;
  urlRating: string;
};

export default function ResultadosBusqueda({
  items,
  ratings,
  openIds,
  q,
  categoriaId,
  tipo,
  premium,
  verificado,
  domicilio,
  abierto,
  orden,
  urlRelevancia,
  urlRating,
}: Props) {
  const [geoActivo, setGeoActivo] = useState(false);
  const [geoResultados, setGeoResultados] = useState<GeoResult[]>([]);
  const [geoNegocios, setGeoNegocios] = useState<ResultadoNegocio[]>([]);
  const [geoRatings, setGeoRatings] = useState<Record<string, Rating>>({});
  const [geoOpenIds, setGeoOpenIds] = useState<string[]>([]);

  async function cargarCercanos(resultados: GeoResult[]) {
    const ids = resultados.map((r) => r.negocioId);
    if (ids.length === 0) {
      setGeoActivo(false);
      setGeoResultados([]);
      setGeoNegocios([]);
      setGeoRatings({});
      setGeoOpenIds([]);
      return;
    }

    const { data, error } = await supabase
      .from("negocios")
      .select(
        "id, nombre, slug, descripcion, tipo, plan, verificado, telefono, whatsapp, direccion, a_domicilio, foto_portada, actualizado_en, categorias:categoria_id(id, nombre, slug, emoji)",
      )
      .in("id", ids)
      .eq("activo", true);

    if (error) {
      setGeoActivo(false);
      setGeoResultados([]);
      setGeoNegocios([]);
      setGeoRatings({});
      setGeoOpenIds([]);
      return;
    }

    const negocios = (data ?? []) as unknown as ResultadoNegocio[];
    const porId = new Map(negocios.map((n) => [n.id, n]));
    const distanciaPorId = new Map(
      resultados.map((r) => [r.negocioId, r.distanciaKm]),
    );

    let filtrados = resultados
      .map((r) => porId.get(r.negocioId))
      .filter((n): n is ResultadoNegocio => Boolean(n));

    const idsFiltrados = filtrados.map((n) => n.id);
    let abiertos: string[] = [];

    if (idsFiltrados.length > 0) {
      const dia = diaHoySantiago();
      const ahora = horaAhoraSantiago();

      const { data: horarios } = await supabase
        .from("horarios")
        .select("negocio_id, abre, cierra")
        .in("negocio_id", idsFiltrados)
        .eq("dia", dia)
        .eq("cerrado", false);

      abiertos = (
        (horarios ?? []) as {
          negocio_id: string;
          abre: string | null;
          cierra: string | null;
        }[]
      )
        .filter(
          (h) =>
            Boolean(h.abre) &&
            Boolean(h.cierra) &&
            dentroDeRango(ahora, h.abre!, h.cierra!),
        )
        .map((h) => h.negocio_id);
    }

    if (abierto) {
      const abiertosSet = new Set(abiertos);
      filtrados = filtrados.filter((n) => abiertosSet.has(n.id));
    }

    const geoFiltrados = filtrados.map((n) => ({
      negocioId: n.id,
      distanciaKm: distanciaPorId.get(n.id) ?? 0,
    }));

    setGeoActivo(true);
    setGeoResultados(geoFiltrados);
    setGeoNegocios(filtrados);
    setGeoOpenIds(abiertos);

    if (filtrados.length === 0) {
      setGeoRatings({});
      return;
    }

    const { data: resenas } = await supabase
      .from("resenas")
      .select("negocio_id, estrellas")
      .in(
        "negocio_id",
        filtrados.map((n) => n.id),
      )
      .eq("aprobada", true);

    const ratingMap: Record<string, Rating> = {};
    for (const row of (resenas ?? []) as {
      negocio_id: string;
      estrellas: number;
    }[]) {
      const prev = ratingMap[row.negocio_id] ?? { avg: 0, count: 0 };
      ratingMap[row.negocio_id] = {
        avg: (prev.avg * prev.count + row.estrellas) / (prev.count + 1),
        count: prev.count + 1,
      };
    }

    setGeoRatings(ratingMap);
  }

  const mostrar = geoActivo ? geoNegocios : items;
  const mostrarRatings = geoActivo ? geoRatings : ratings;
  const mostrarOpenIds = geoActivo ? geoOpenIds : openIds;
  const hayFiltros =
    Boolean(q) ||
    Boolean(categoriaId) ||
    Boolean(tipo) ||
    premium ||
    verificado ||
    domicilio ||
    abierto;

  const distanciaPorId = useMemo(
    () => new Map(geoResultados.map((r) => [r.negocioId, r.distanciaKm])),
    [geoResultados],
  );

  function salirDeCercaDeMi() {
    setGeoActivo(false);
    setGeoResultados([]);
    setGeoNegocios([]);
    setGeoRatings({});
    setGeoOpenIds([]);
  }

  return (
    <>
      <div className="px-4 mb-3">
        <CercaDeMi
          onResultados={(resultados) => {
            if (resultados.length === 0) {
              salirDeCercaDeMi();
              return;
            }
            void cargarCercanos(resultados);
          }}
          activo={geoActivo}
          negocioIds={hayFiltros ? items.map((item) => item.id) : null}
        />
      </div>

      <div className="px-4 mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight">
            {geoActivo
              ? "Cerca de ti"
              : q
                ? 'Resultados para "' + q + '"'
                : "Negocios en Linares"}
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
            {mostrar.length} resultado{mostrar.length === 1 ? "" : "s"}
            {geoActivo ? " · Ordenados por distancia" : ""}
            {!geoActivo && abierto ? " · Abiertos ahora" : ""}
            {!geoActivo && domicilio ? " · A domicilio" : ""}
            {!geoActivo && verificado ? " · Verificados" : ""}
            {!geoActivo && premium ? " · Premium" : ""}
            {!geoActivo && tipo === "independiente" ? " · Independientes" : ""}
          </p>
        </div>

        {!geoActivo && (
          <div className="flex gap-1.5 shrink-0">
            <Link
              href={urlRelevancia}
              className={
                "rounded-full text-[11px] font-semibold px-3 py-1 transition " +
                (orden === "relevancia"
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground hover:bg-muted")
              }
            >
              Relevancia
            </Link>
            <Link
              href={urlRating}
              className={
                "rounded-full text-[11px] font-semibold px-3 py-1 transition " +
                (orden === "rating"
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground hover:bg-muted")
              }
            >
              ★ Mejor valorados
            </Link>
          </div>
        )}
      </div>

      {mostrar.length === 0 ? (
        <div className="mx-4 rounded-3xl border border-dashed border-border p-8 text-center">
          <div className="text-4xl mb-2">📍</div>
          <h3 className="text-base font-bold">
            No encontramos negocios cercanos con estos filtros
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba quitando algún filtro o desactiva “Cerca de mí”.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {mostrar.map((n, index) => (
            <AnimatedCard
              key={n.id}
              index={index}
              className="relative rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all group"
            >
              <NegocioCard
                n={n}
                isOpen={mostrarOpenIds.includes(n.id)}
                rating={mostrarRatings[n.id]}
                distanciaKm={geoActivo ? distanciaPorId.get(n.id) : undefined}
              />
            </AnimatedCard>
          ))}
        </div>
      )}
    </>
  );
}

function NegocioCard({
  n,
  isOpen,
  rating,
  distanciaKm,
}: {
  n: ResultadoNegocio;
  isOpen?: boolean;
  rating?: Rating;
  distanciaKm?: number;
}) {
  const premium = esPremium(n);
  const waUrl = canUseFeature(n, "whatsapp")
    ? whatsAppLink(n.whatsapp)
    : null;
  const categoriaSlug = n.categorias?.slug ?? "sin-categoria";
  // Conserva la procedencia de la búsqueda hasta la ficha.
  const href = `/${categoriaSlug}/${n.slug}?origen=busqueda`;

  return (
    <div>
      <Link
        href={href}
        aria-label={`Ver ficha de ${n.nombre}`}
        className="block"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EDE8]">
          {n.foto_portada ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={n.foto_portada}
              alt={n.nombre}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl opacity-30">
              🏪
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />

          {premium && (
            <div className="absolute top-2 right-2">
              <span className="text-[9px] font-bold bg-[#F4B860] text-[#1A1410] px-1.5 py-0.5 rounded-full">
                ⭐ Premium
              </span>
            </div>
          )}

          {n.verificado && (
            <div className="absolute top-2 left-2">
              <span className="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center shadow">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        {n.categorias && (
          <span className="text-[10px] font-semibold text-muted-foreground">
            {n.categorias.emoji} {n.categorias.nombre}
          </span>
        )}

        <Link href={href} className="block mt-0.5">
          <p className="font-bold text-[13px] text-[#1A1410] leading-tight line-clamp-1 group-hover:text-[#2B6E80] transition-colors">
            {n.nombre}
          </p>
        </Link>

        {n.descripcion && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
            {n.descripcion}
          </p>
        )}

        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            {rating && rating.count > 0 && (
              <span className="font-bold text-amber-600">
                ★ {rating.avg.toFixed(1)} · {rating.count} reseña{rating.count === 1 ? "" : "s"}
              </span>
            )}
            {distanciaKm !== undefined && (
              <span className="font-semibold text-[#2B6E80]">
                📍 {formatoDistancia(distanciaKm)}
              </span>
            )}
            <span className={isOpen ? "font-semibold text-emerald-600" : "font-semibold text-muted-foreground"}>
              {isOpen ? "● Abierto" : "● Cerrado"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            {n.verificado && (
              <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full font-semibold">
                ✓ Verificado
              </span>
            )}
            {n.a_domicilio && (
              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                🛵 A domicilio
              </span>
            )}
            {n.actualizado_en && (() => {
              const dias = Math.floor((Date.now() - new Date(n.actualizado_en).getTime()) / 86_400_000);
              if (dias < 0 || dias > 60) return null;
              const texto = dias === 0 ? "Actualizado hoy" : dias === 1 ? "Actualizado ayer" : `Actualizado hace ${dias} días`;
              return (
                <span className="bg-[#2B6E80]/8 text-[#2B6E80] px-1.5 py-0.5 rounded-full font-medium">
                  ↻ {texto}
                </span>
              );
            })()}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Link
            href={href}
            className="flex-1 inline-flex items-center justify-center rounded-full border border-border bg-white px-3 py-2 text-[11px] font-bold text-foreground hover:bg-secondary transition"
          >
            Ver ficha
          </Link>

          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#1ebe5d] transition shadow-sm"
            >
              <WhatsAppIcon /> WhatsApp
            </a>
          ) : (
            <Link
              href={href}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-[#2B6E80] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#245d6d] transition"
            >
              Ver ficha
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 3 17l-1 5 5.2-1.4A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 1 1 0 0Z" />
    </svg>
  );
}
