"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getFavoritos, onFavoritosChanged } from "@/lib/favoritos";
import FavoritoButton from "@/components/FavoritoButton";

type NegocioFavorito = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  plan: "basico" | "premium";
  verificado: boolean;
  foto_portada: string | null;
  a_domicilio: boolean;
  categorias: { nombre: string; slug: string; emoji: string } | null;
};

function normalizeCategoria(raw: unknown): NegocioFavorito["categorias"] {
  const x = Array.isArray(raw) ? raw[0] : raw;
  if (!x || typeof x !== "object") return null;
  return {
    nombre: String((x as { nombre?: unknown }).nombre ?? ""),
    slug: String((x as { slug?: unknown }).slug ?? ""),
    emoji: String((x as { emoji?: unknown }).emoji ?? ""),
  };
}

export default function FavoritosList() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NegocioFavorito[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function cargar() {
      const ids = getFavoritos();
      if (ids.length === 0) {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("negocios")
        .select(
          "id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, categorias:categoria_id(nombre, slug, emoji)",
        )
        .in("id", ids)
        .eq("activo", true);

      const rows = ((data ?? []) as unknown[]).map((r) => {
        const x = r as Record<string, unknown>;
        return {
          id: String(x.id ?? ""),
          nombre: String(x.nombre ?? ""),
          slug: String(x.slug ?? ""),
          descripcion: (x.descripcion as string | null) ?? null,
          plan: (x.plan as "basico" | "premium") ?? "basico",
          verificado: Boolean(x.verificado),
          foto_portada: (x.foto_portada as string | null) ?? null,
          a_domicilio: Boolean(x.a_domicilio),
          categorias: normalizeCategoria(x.categorias),
        } satisfies NegocioFavorito;
      });

      // Ordenamos siguiendo el orden de los IDs en localStorage (mas recientes primero)
      const idIndex = new Map(ids.map((id, i) => [id, i]));
      rows.sort(
        (a, b) =>
          (idIndex.get(a.id) ?? Infinity) - (idIndex.get(b.id) ?? Infinity),
      );

      if (!cancelled) {
        setItems(rows);
        setLoading(false);
      }
    }

    cargar();
    const unsub = onFavoritosChanged(() => {
      cargar();
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        Cargando tus favoritos...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="text-5xl mb-3">{"💔"}</div>
        <h2 className="text-lg font-bold">Sin favoritos todavia</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Tocá el corazón en cualquier negocio para guardarlo aqui y volver
          rapido despues.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold px-6 py-3"
        >
          Explorar negocios
        </Link>
      </div>
    );
  }

  return (
    <ul className="px-4 space-y-3">
      {items.map((d, i) => {
        const url = d.categorias
          ? `/${d.categorias.slug}/${d.slug}`
          : "#";
        return (
          <li key={d.id} className="relative">
            <Link
              href={url}
              className="flex items-center gap-3 p-2 rounded-2xl bg-secondary/40 hover:bg-secondary/60 transition"
            >
              <div
                className={`relative h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 overflow-hidden ${pastel(i)}`}
              >
                {d.foto_portada ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.foto_portada}
                    alt={d.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{d.categorias?.emoji ?? "📍"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-10">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-semibold text-[15px] truncate">{d.nombre}</p>
                  {d.verificado && (
                    <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full shrink-0">
                      ✓
                    </span>
                  )}
                  {d.plan === "premium" && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full shrink-0">
                      Premium
                    </span>
                  )}
                </div>
                {d.descripcion && (
                  <p className="text-[13px] text-muted-foreground truncate">
                    {d.descripcion}
                  </p>
                )}
                <p className="text-[12px] text-muted-foreground/80 truncate">
                  {d.categorias?.emoji} {d.categorias?.nombre}
                  {d.a_domicilio && " • A domicilio"}
                </p>
              </div>
            </Link>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <FavoritoButton negocioId={d.id} variant="icon" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function pastel(i: number) {
  const palette = [
    "bg-orange-50",
    "bg-emerald-50",
    "bg-rose-50",
    "bg-sky-50",
    "bg-amber-50",
    "bg-violet-50",
    "bg-teal-50",
    "bg-pink-50",
  ];
  return palette[i % palette.length];
}
