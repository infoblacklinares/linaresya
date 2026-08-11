import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting store (se resetea cada deploy)
// Para producción, usar Redis o Cloudflare
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 30; // 30 requests per minute

export function middleware(request: NextRequest) {
  // Solo aplicar rate limiting a búsquedas
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith('/buscar')) {
    return NextResponse.next();
  }

  // Obtener IP del cliente
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const key = `${ip}-search`;

  // Obtener o crear registro
  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Nuevo window
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitStore.set(key, record);
    return NextResponse.next();
  }

  // Incrementar contador
  record.count++;

  // Excedió límite
  if (record.count > RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: 'Demasiadas búsquedas. Intenta de nuevo en 1 minuto.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/buscar', '/api/buscar/:path*'],
};
