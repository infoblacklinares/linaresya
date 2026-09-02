import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Eventos de negocio. Mantener sincronizado con el CHECK en estadisticas.sql.
const EVENTOS_VALIDOS = ["vista", "whatsapp", "telefono", "maps"] as const;
type Evento = (typeof EVENTOS_VALIDOS)[number];

// Eventos del sitio: no cuelgan de ningun negocio (el popup de la portada se
// ve antes de que exista uno). Sincronizado con eventos_sitio.sql.
const EVENTOS_SITIO = [
  "popup_visto",
  "popup_cerrado",
  "popup_enviado",
  "popup_click",
  "visita_portada",
] as const;
type EventoSitio = (typeof EVENTOS_SITIO)[number];

// UUID v4-ish: aceptamos cualquier formato canonico de uuid.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { negocio_id?: unknown; evento?: unknown } = {};

  // sendBeacon manda Blob con type "text/plain" o el cliente puede mandar JSON.
  // Soportamos ambos.
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "json invalido" }, { status: 400 });
  }

  const negocioId =
    typeof body.negocio_id === "string" ? body.negocio_id.trim() : "";
  const evento = typeof body.evento === "string" ? body.evento.trim() : "";

  // Eventos del sitio: sin negocio_id y con su propia funcion.
  if (EVENTOS_SITIO.includes(evento as EventoSitio)) {
    const { error } = await supabase.rpc("incrementar_evento_sitio", {
      p_evento: evento,
    });
    if (error) {
      // La tabla se crea a mano con supabase/eventos_sitio.sql. Si todavia no
      // se corrio, esto falla: lo logueamos y respondemos ok igual, porque una
      // metrica no puede ensuciar la consola de quien esta navegando.
      console.error("[track] rpc evento_sitio:", error.message);
    }
    return NextResponse.json({ ok: true });
  }

  if (!UUID_RE.test(negocioId)) {
    return NextResponse.json({ ok: false, error: "negocio_id invalido" }, { status: 400 });
  }
  if (!EVENTOS_VALIDOS.includes(evento as Evento)) {
    return NextResponse.json({ ok: false, error: "evento invalido" }, { status: 400 });
  }

  const { error } = await supabase.rpc("incrementar_estadistica", {
    p_negocio_id: negocioId,
    p_evento: evento,
  });

  if (error) {
    // No filtramos detalles internos al cliente.
    console.error("[track] rpc error:", error.message);
    return NextResponse.json({ ok: false, error: "rpc fallo" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Health check rapido para debug. GET /api/track devuelve los eventos validos.
export async function GET() {
  return NextResponse.json({
    ok: true,
    eventos: EVENTOS_VALIDOS,
    eventos_sitio: EVENTOS_SITIO,
  });
}
