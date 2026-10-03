import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type CercaDeMiBody = {
  lat?: unknown;
  lng?: unknown;
  limite?: unknown;
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

  const { data, error } = await supabaseAdmin.rpc(
    "get_negocios_cerca_de_mi",
    {
      p_lat: lat,
      p_lng: lng,
      p_limite: limite,
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
