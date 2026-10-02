# Desplegar LinaresYa

Guia rapida para desarrollo local y despliegue.

## Variables de entorno

La aplicacion usa las siguientes variables principales:

| Variable | Uso | Exposicion |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Publica |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Cliente Supabase del navegador | Publica |
| `SUPABASE_SECRET_KEY` | Cliente Supabase privilegiado del servidor | **Solo servidor / CI** |
| `ADMIN_PASSWORD` | Acceso del panel administrador | **Solo servidor** |
| `NEXT_PUBLIC_SITE_URL` | URL canonica | Publica |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile en navegador | Publica |
| `TURNSTILE_SECRET_KEY` | Validacion Turnstile | **Solo servidor** |
| `RESEND_API_KEY` | Emails transaccionales | **Solo servidor** |

**Importante:** no uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` ni `SUPABASE_SERVICE_ROLE_KEY` en una instalacion nueva. El proyecto ya usa las claves nuevas de Supabase: Publishable para cliente y Secret para servidor.

## 1. Probar por WiFi local

Descubre la IP del PC:

```powershell
ipconfig
```

Permite el puerto 3000 en Windows, si hace falta:

```powershell
New-NetFirewallRule -DisplayName "Next.js dev 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Levanta Next.js:

```bash
npm run dev:host
```

Desde el telefono conectado a la misma WiFi:

```
http://TU-IP:3000
```

## 2. Vercel + GitHub

El despliegue de produccion se realiza desde el repositorio de GitHub conectado a Vercel.

En Vercel > Settings > Environment Variables configura, como minimo:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`

Agrega las variables opcionales cuando corresponda.

## 3. Deploys futuros

Cada push a `main` activa el flujo normal de despliegue conectado a Vercel.

Antes de publicar:

```bash
npm test
npm run build
```

Y verifica que no haya secretos en el diff.

## Checklist

- [ ] `.env.local` no esta versionado.
- [ ] Las variables de Supabase usan los nombres actuales.
- [ ] `SUPABASE_SECRET_KEY` existe solo en servidor/CI.
- [ ] Las mismas variables necesarias estan configuradas en Vercel.
- [ ] `npm test` pasa.
- [ ] `npm run build` pasa.
- [ ] No hay secretos reales en commits, documentacion ni logs.
