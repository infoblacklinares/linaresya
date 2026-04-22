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

export type Negocio = {
  id: string
  nombre: string
  slug: string
  descripcion: string
  categoria_id: number
  tipo: 'negocio' | 'independiente'
  plan: 'basico' | 'premium'
  activo: boolean
  verificado: boolean
  premium_hasta: string | null
  telefono: string | null
  whatsapp: string | null
  email: string | null
  sitio_web: string | null
  direccion: string | null
  ciudad: string
  lat: number | null
  lng: number | null
  a_domicilio: boolean
  zona_cobertura: string | null
  disponibilidad: string | null
  foto_portada: string | null
  creado_en: string
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