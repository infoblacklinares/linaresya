# LinaresYa Mobile App

MVP de la app móvil para LinaresYa.cl - descubre, busca y favorea negocios locales en Linares, Chile.

## Stack

- **React Native + Expo** — Cross-platform iOS/Android
- **TypeScript** — Type-safe development
- **Supabase** — Backend (datos y auth)
- **AsyncStorage** — Favoritos persistentes
- **Lucide React Native** — Icons
- **React Navigation** — Tab-based navigation

## Setup

### Requisitos

- Node.js 16+ 
- npm o yarn
- Expo CLI: `npm install -g eas-cli`

### Instalación

```bash
cd mobile
npm install
```

### Ejecutar

```bash
# En iOS (requiere Mac)
npm run ios

# En Android
npm run android

# En web (testing)
npm run web

# Con Expo Go (mobile)
npm start
```

Luego abre la app en tu teléfono con Expo Go (desde App Store / Google Play).

## Estructura

```
mobile/
├── App.tsx                 # Entrada principal, navegación por tabs
├── screens/               # 5 pantallas principales
│   ├── Inicio.tsx         # Home con categorías + featured
│   ├── Buscar.tsx         # Search con filtros
│   ├── Favoritos.tsx      # Lista de favoritos
│   ├── Publicar.tsx       # Form para publicar negocio
│   └── Perfil.tsx         # Perfil + settings
├── components/            # Componentes reutilizables
│   └── NegocioCard.tsx    # Tarjeta de negocio
├── lib/                   # Utilidades
│   └── supabase.ts        # Cliente Supabase
├── hooks/                 # Custom hooks
│   └── useFavoritos.ts    # Manage favorites
└── types/                 # TypeScript types
    └── index.ts
```

## Features MVP

- ✅ **5 tabs:** Inicio, Buscar, Favoritos, Publicar, Perfil
- ✅ **Descubrimiento:** Grid de 10 categorías, cards destacadas
- ✅ **Búsqueda:** Query + 3 filtros (abierto ahora, verificados, a domicilio)
- ✅ **Favoritos:** Toggle + persistencia en AsyncStorage
- ✅ **Publicar:** Form simple para crear negocio (enviado a revisión)
- ✅ **Datos reales:** 40+ negocios de Supabase

## Próximos pasos (v2)

- [ ] **Mapa:** Google Maps / Mapbox con pins
- [ ] **Coordinates:** Geocodificar direcciones (lat/lng)
- [ ] **Horarios:** Mostrar "Abierto ahora" en tiempo real
- [ ] **Notificaciones:** Push notifications
- [ ] **Autenticación:** Login / Signup
- [ ] **Detalles:** Pantalla completa de negocio
- [ ] **Chat:** Direct messaging con negocios

## Configuración (env)

Crea `.env.local` en la raíz de `mobile/`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://jgdtqfzotqelqvmmxhlt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

(Los valores actuales están hardcodeados en `lib/supabase.ts`)

## Deploy

### App Store / Google Play

```bash
# Build
eas build --platform ios
eas build --platform android

# Submit
eas submit --platform ios
eas submit --platform android
```

### Expo Go (testing rápido)

```bash
npm start
# Abre el código QR con tu teléfono
```

---

**Built with ❤️ for Linares**
