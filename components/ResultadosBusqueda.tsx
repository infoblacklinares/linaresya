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
    let filtrados = resultados
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
    const idsFiltrados = filtrados.map((n) => n.id);

    let abiertos: string[] = [];
    if (idsFiltrados.length > 0) {
      const dia = new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", weekday: "long" })
        .format(new Date())
        .toLowerCase();
      const ahora = new Intl.DateTimeFormat("en-GB", {
        timeZone: "America/Santiago",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      const { data: horarios } = await supabase
        .from("horarios")
        .select("negocio_id, abre, cierra")
        .in("negocio_id", idsFiltrados)
        .eq("dia", dia)
        .eq("cerrado", false);

      abiertos = ((horarios ?? []) as { negocio_id: string; abre: string | null; cierra: string | null }[])
        .filter((h) => h.abre && h.cierra && ahora >= h.abre && ahora <= h.cierra)
        .map((h) => h.negocio_id);
    }

    if (abierto) {
      const abiertosSet = new Set(abiertos);
      filtrados = filtrados.filter((n) => abiertosSet.has(n.id));
    }

    setGeoResultados(filtrados.map((n) => ({
      negocioId: n.id,
      distanciaKm: distanciaPorId.get(n.id) ?? 0,
    })));
    setGeoNegocios(filtrados);
    setGeoOpenIds(abiertos);

    if (filtrados.length === 0) {
      setGeoRatings({});
      return;
    }

    const { data: resenas } = await supabase
      .from("resenas")
      .select("negocio_id, estrellas")
      .in("negocio_id", filtrados.map((n) => n.id))
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
  }
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
        {!activo && (
          <div className="flex gap-1.5 shrink-0">
            <Link
              href={urlRelevancia}
              className={"rounded-full text-[11px] font-semibold px-3 py-1 transition " + (orden === "relevancia" ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-muted")}
            >
              Relevancia
            </Link>
            <Link
              href={urlRating}
              className={"rounded-full text-[11px] font-semibold px-3 py-1 transition " + (orden === "rating" ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-muted")}
            >
              ★ Mejor valorados
            </Link>
          </div>
        )}
      </div>


