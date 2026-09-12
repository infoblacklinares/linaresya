import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { claveLimite, esBot, ipDeCabeceras, mismoOrigen } from "@/lib/peticion";

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
  "visita_sitio",
  // Se deja para no rechazar beacons de pestanas viejas todavia abiertas.
  "visita_portada",
] as const;
type EventoSitio = (typeof EVENTOS_SITIO)[number];

// UUID v4-ish: aceptamos cualquier formato canonico de uuid.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SALT = process.env.TRACK_SALT ?? "linaresya-track-v1";

export const runtime = "nodejs";

/**
 * Registro de eventos.
 *
 * Antes esto era publico y sin limite: cualquiera podia inflar las metricas de
 * cualquier negocio, y los scripts de linea de comandos contaban como visitas.
 * Ahora hay tres puertas antes de contar:
 *
 *   1. user-agent de navegador de verdad (lib/peticion.ts);
 *   2. la peticion viene de nuestro propio sitio (Origin o Referer);
 *   3. limite por origen y por evento en la base, que es lo unico compartido
 *      entre instancias de Vercel (supabase/rate_limite_eventos.sql).
 *
 * Al que no pasa se le responde ok igual: una metrica no tiene por que
 * explicarle a un script como esquivarla, y tampoco puede ensuciar la consola
 * de quien esta navegando.
 */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent");
  if (esBot(ua)) {
    return NextResponse.json({ ok: true, contado: false });
  }

  const esDesarrollo = process.env.NODE_ENV !== "production";
  if (
    !mismoOrigen({
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      permitirLocal: esDesarrollo,
    })
  ) {
    return NextResponse.json({ ok: false, error: "origen no permitido" }, { status: 403 });
  }

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

  const clave = claveLimite(
    ipDeCabeceras({
      xForwardedFor: req.headers.get("x-forwarded-for"),
      xRealIp: req.headers.get("x-real-ip"),
    }),
    SALT,
  );

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

  // Funcion con limite. Si la migracion todavia no se corrio, se cae a la
  // version sin limite para no perder los eventos de estos dias.
  const limitado = await supabase.rpc("incrementar_estadistica_limitado", {
    p_negocio_id: negocioId,
    p_evento: evento,
    p_clave: clave,
  });

  if (limitado.error) {
    const falta = /incrementar_estadistica_limitado|does not exist|not find/i.test(
      limitado.error.message,
    );
    if (!falta) {
      console.error("[track] rpc limitado:", limitado.error.message);
      return NextResponse.json({ ok: false, error: "rpc fallo" }, { status: 500 });
    }
    console.warn(
      "[track] Falta la funcion con limite: corre supabase/rate_limite_eventos.sql. " +
        "Mientras tanto se cuenta sin limite.",
    );
    const { error } = await supabase.rpc("incrementar_estadistica", {
      p_negocio_id: negocioId,
      p_evento: evento,
    });
    if (error) {
      // Pasa, por ejemplo, con un negocio que ya no existe: la clave foranea
      // lo rechaza. Se loguea, pero no se devuelve un 500: esto lo llama un
      // beacon del navegador y un error aca solo agrega ruido a Sentry.
      console.error("[track] rpc error:", error.message);
      return NextResponse.json({ ok: true, contado: false });
    }
    return NextResponse.json({ ok: true, contado: true });
  }

  // `false` = quedo fuera por limite, o el negocio no existe o esta inactivo.
  return NextResponse.json({ ok: true, contado: limitado.data === true });
}

// Health check rapido para debug. GET /api/track devuelve los eventos validos.
export async function GET() {
  return NextResponse.json({
    ok: true,
    eventos: EVENTOS_VALIDOS,
    eventos_sitio: EVENTOS_SITIO,
  });
}
