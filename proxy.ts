import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTA: In-memory rate limiting es inefectivo en Vercel (stateless)
// Esta implementación es solo para desarrollo.
// Para producción: usar Cloudflare Rate Limiting (más eficaz)

const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 30;

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith('/buscar')) {
    return NextResponse.next();
  }

  // Solo cuentan las busquedas de verdad. Antes tambien contaban:
  //  - los prefetch de Next: el footer enlaza a /buscar en todas las
  //    paginas, asi que navegar un rato agotaba la cuota y el usuario se
  //    quedaba sin poder buscar durante un minuto;
  //  - abrir /buscar sin consulta, que no busca nada.
  const esPrefetch =
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch';
  const hayConsulta = (request.nextUrl.searchParams.get('q') ?? '').trim() !== '';
  if (esPrefetch || !hayConsulta) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const key = `${ip}-search`;

  let timestamps = rateLimitStore.get(key) || [];
  // Limpiar timestamps viejos
  timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: 'Demasiadas búsquedas. Intenta en 1 minuto.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return NextResponse.next();
}

export const config = {
  matcher: ['/buscar'],
};
