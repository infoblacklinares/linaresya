import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos principales de LinaresYa
export type Categoria = {
  id: number
  nombre: string
  slug: string
  emoji: string
  descripcion: string
  activa: boolean
  orden: number
}

// Columnas de public.negocios tal como estan en produccion (verificado
// 2026-09-11, ver docs/modelo/LY-002-modelo-business.md). La columna
// `busqueda` (tsvector) queda fuera: la llena un trigger y la app no la lee.
export type Negocio = {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  categoria_id: number | null
  tipo: 'negocio' | 'independiente'
  plan: 'basico' | 'premium'
  activo: boolean
  verificado: boolean
  premium_hasta: string | null
  telefono: string | null
  whatsapp: string | null
  email: string | null
  sitio_web: string | null
  /** Usuario de Instagram sin arroba. El link se arma con lib/instagram.ts. */
  instagram: string | null
  /** URL de la pagina de Facebook. Columna creada con supabase/facebook_negocios.sql. */
  facebook: string | null
  direccion: string | null
  ciudad: string
  comuna: string | null
  region: string
  lat: number | null
  lng: number | null
  a_domicilio: boolean
  zona_cobertura: string | null
  disponibilidad: string | null
  foto_portada: string | null
  /** Por donde entro el alta: 'popup' | 'formulario' | 'admin'. Null = antes del 24-ago-2026. */
  origen: string | null
  /** Reservado para cuentas de dueño. Hoy sin uso: el dueño entra por token (dueno_tokens). */
  owner_id: string | null
  creado_en: string
  // La ficha de negocio lo usa para el sello "Actualizado hace X".
  // La mantiene el trigger trg_negocios_updated_at.
  actualizado_en: string | null
}

export type Oferta = {
  id: number
  negocio_id: string
  titulo: string
  descripcion: string | null
  descuento_pct: number | null
  precio_normal: number | null
  precio_oferta: number | null
  imagen_url: string | null
  fecha_inicio: string
  fecha_fin: string
  boosteada: boolean
  boost_hasta: string | null
  boost_orden: number
  activa: boolean
}

export type Horario = {
  id: number
  negocio_id: string
  dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'
  abre: string | null
  cierra: string | null
  cerrado: boolean
}