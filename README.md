# LinaresYa

Directorio digital de negocios de Linares, construido con Next.js y Supabase.

## Estado del proyecto

**Corte: 2026-10-02**

La rama principal contiene la implementación operativa actual del directorio y del panel administrativo. La validación automática ejecuta tests y build.

Para el estado técnico y los pendientes reales, consultar:

- `docs/estado-actual.md`
- `docs/arquitectura/decisiones-abiertas.md`

## Desarrollo local

```bash
npm ci
npm run dev
```

Para probar desde otro dispositivo en la misma WiFi:

```bash
npm run dev:host
```

## Validación

```bash
npm test
npm run build
```

## Variables de entorno

Copiar `.env.example` como `.env.local` y completar los valores reales.

Las claves de Supabase actuales son:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (solo servidor/CI)

Nunca expongas la Secret Key en código, navegador, capturas públicas o documentación.
