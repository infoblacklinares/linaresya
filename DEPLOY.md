# Desplegar LinaresYa

Esta guia tiene dos partes:

1. **WiFi local** – probar la app desde tu celu en 2 minutos (sin subir nada).
2. **Vercel + GitHub** – publicar la app con una URL real tipo `linaresya.vercel.app`.

---

## Parte 1 — Ver en tu celu por WiFi (rapido, para desarrollo)

### 1.1. Descubrir la IP de tu PC

Abri **CMD** o **PowerShell** en Windows y corre:

```
ipconfig
```

Busca la seccion **"Adaptador de LAN inalambrica Wi-Fi"** (o similar). Anota la linea **IPv4 Address**, por ejemplo:

```
IPv4 Address . . . . . . . . . . : 192.168.1.42
```

### 1.2. Permitir el puerto 3000 en el Firewall (una sola vez)

Windows Defender bloquea por defecto. Corre como administrador en PowerShell:

```powershell
New-NetFirewallRule -DisplayName "Next.js dev 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

(o abri el "Firewall de Windows > Reglas de entrada > Nueva regla" a mano).

### 1.3. Levantar el dev server expuesto

Agregue un script nuevo. Desde la carpeta del proyecto corre:

```
npm run dev:host
```

Eso levanta Next.js en `0.0.0.0:3000`, accesible desde cualquier dispositivo en la misma red.

### 1.4. Entrar desde el celu

Tu celu tiene que estar en la **misma red WiFi** que la PC. En el navegador del celu abri:

```
http://TU-IP:3000
```

Por ejemplo: `http://192.168.1.42:3000`.

Listo — cada cambio que guardes en VSCode se refresca en vivo en el celu.

---

## Parte 2 — Publicar en Vercel con GitHub

Beneficios: URL publica HTTPS, auto-deploy con cada `git push`, gratis para proyectos personales.

### 2.1. Preparar el repo (si aun no lo hiciste)

El proyecto ya tiene `git init` y 2 commits. Solo falta conectar a GitHub. Primero committea lo nuevo:

```
git add .
git commit -m "feat: diseno uber eats + categorias + detalle"
```

### 2.2. Crear el repo en GitHub (modo facil)

1. Entra a **https://github.com/new**
2. Nombre: `linaresya`
3. **NO marques** "Add a README" (ya lo tenes local)
4. Dejalo publico o privado, da igual
5. Click **Create repository**

Vas a ver una pantalla con comandos. Copia los **2 de abajo** (seccion "...or push an existing repository"):

```
git remote add origin https://github.com/TU-USUARIO/linaresya.git
git branch -M main
git push -u origin main
```

Pegalos en tu terminal en la carpeta del proyecto. La primera vez te va a pedir login a GitHub (browser o token).

### 2.3. Importar a Vercel

1. Entra a **https://vercel.com/new**
2. "Import Git Repository" > eligi tu cuenta de GitHub y autoriza el acceso si es la primera vez
3. Encuentra `linaresya` en la lista > **Import**
4. En la pantalla de configuracion:
   - Framework: **Next.js** (lo detecta solo)
   - Root directory: dejalo en `./`
   - **Environment Variables** — aca copia las de tu `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
5. Click **Deploy**

Espera 1-2 minutos. Vas a obtener una URL tipo `linaresya-xyz.vercel.app`. Eso ya corre 24/7 y podes abrirla desde cualquier lugar en el celu.

### 2.4. Dominio custom (opcional)

Si ya tenes `linaresya.cl` (o lo compras), en Vercel:

1. Project > Settings > Domains > Add
2. Escribi `linaresya.cl` y `www.linaresya.cl`
3. Vercel te da los DNS records (CNAME / A) para configurar en tu proveedor (NameCheap, GoDaddy, NIC Chile, etc.)

En ~1 hora esta andando con HTTPS automatico.

### 2.5. Deploys futuros

A partir de aca, cada vez que hagas:

```
git add .
git commit -m "lo que sea"
git push
```

Vercel detecta el push y re-despliega automaticamente en ~60 segundos. Tambien tenes preview deployments por cada branch que subas.

---

## Checklist rapido

- [ ] `.env.local` tiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con valores reales
- [ ] `.env.local` esta en `.gitignore` (confirmado: si)
- [ ] `npm run dev:host` funciona y se ve desde el celu
- [ ] `git status` esta limpio antes de pushear
- [ ] Las mismas env vars estan cargadas en Vercel > Settings > Environment Variables

Si algo falla, abri Issue en GitHub o pegame el error.
