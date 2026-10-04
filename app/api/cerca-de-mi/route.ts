import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type CercaDeMiBody = {
  lat?: unknown;
  lng?: unknown;
  limite?: unknown;
  negocioIds?: unknown;
};

function numeroValido(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export async function POST(request: Request) {
  let body: CercaDeMiBody;

  try {
    body = (await request.json()) as CercaDeMiBody;
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida." },
      { status: 400 },
    );
  }

  const lat = body.lat;
  const lng = body.lng;
  const negocioIds = Array.isArray(body.negocioIds)
    ? body.negocioIds.filter(
        (value): value is string =>
          typeof value === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
      )
    : null;

  const limite =
    typeof body.limite === "number" && Number.isFinite(body.limite)
      ? Math.max(1, Math.min(Math.trunc(body.limite), 50))
      : 50;

  if (
    !numeroValido(lat) ||
    !numeroValido(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json(
      { error: "Coordenadas inválidas." },
      { status: 400 },
    );
  }

  if (Array.isArray(body.negocioIds) && negocioIds && negocioIds.length === 0) {
    return NextResponse.json({ negocios: [] });
  }

  const { data, error } = await supabaseAdmin.rpc(
    "get_negocios_cerca_de_mi",
    {
      p_lat: lat,
      p_lng: lng,
      p_limite: limite,
      p_negocio_ids: negocioIds && negocioIds.length > 0 ? negocioIds : null,
    },
  );

  if (error) {
    console.error("Error en get_negocios_cerca_de_mi:", error);
    return NextResponse.json(
      { error: "No pudimos buscar negocios cerca de ti." },
      { status: 500 },
    );
  }

  type CercaDeMiRow = {
    negocio_id: string;
    distancia_km: number;
  };

  const filas = (data ?? []) as CercaDeMiRow[];

  return NextResponse.json({
    negocios: filas.map((row) => ({
      negocioId: row.negocio_id,
      distanciaKm: row.distancia_km,
    })),
  });
}
