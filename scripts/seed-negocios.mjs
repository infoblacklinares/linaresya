/**
 * seed-negocios.mjs
 * Pobla LinaresYa con los negocios del JSON.
 *
 * Uso:
 *   node --env-file=.env.local scripts/seed-negocios.mjs
 *
 * Necesita en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   ← service role key (no el anon key)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Conexión ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Faltan variables de entorno:')
  console.error('    NEXT_PUBLIC_SUPABASE_URL')
  console.error('    SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Mapeo de categorías JSON → slug LinaresYa ─────────────────────────────────
const CATEGORY_MAP = {
  'Gastronomía':             'gastronomia',
  'Salud y Belleza':         'belleza',
  'Automotriz':              'automotriz',
  'Construcción y Ferretería': 'hogar',
  'Comercio y Retail':       'comercio',
  'Servicios':               'servicios-y-oficios',
  'Mascotas y Veterinaria':  'mascotas',
  'Salud':                   'salud',
  'Educación':               'educacion',
  'Entretenimiento':         'eventos',
  'Profesionales':           'profesionales',
  'Alojamiento':             'comercio',
}

// ── Generador de slug ─────────────────────────────────────────────────────────
function toSlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // quitar tildes
    .replace(/[^a-z0-9\s-]/g, '')     // solo alfanumérico
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ── Parser de horario ─────────────────────────────────────────────────────────
// Maneja: "09:00 - 19:00"  |  "09:00 - 13:00 / 14:00 - 18:00"  |  "Cerrado"
function parseHorario(str) {
  if (!str || str.trim() === 'Cerrado') {
    return { cerrado: true, abre: null, cierra: null }
  }
  const times = str.match(/\d{2}:\d{2}/g)
  if (!times || times.length < 2) {
    return { cerrado: true, abre: null, cierra: null }
  }
  // Primer horario = apertura, último = cierre (cubre turnos partidos)
  return {
    cerrado: false,
    abre:    times[0] + ':00',
    cierra:  times[times.length - 1] + ':00',
  }
}

// ── Slug único (agrega sufijo si colisiona) ───────────────────────────────────
async function slugUnico(base) {
  let slug = base
  let intento = 0
  while (true) {
    const { data } = await supabase
      .from('negocios')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!data) return slug
    intento++
    slug = `${base}-${intento}`
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Cargar datos
  const { negocios } = JSON.parse(
    readFileSync(join(__dirname, 'negocios-data.json'), 'utf8')
  )
  console.log(`📦  ${negocios.length} negocios a insertar\n`)

  // 2. Obtener IDs de categorías
  const { data: cats, error: catErr } = await supabase
    .from('categorias')
    .select('id, slug')
  if (catErr) { console.error('❌  Error obteniendo categorías:', catErr.message); process.exit(1) }

  const catIdBySlug = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  // 3. Insertar negocios uno por uno
  let ok = 0, fail = 0

  for (const neg of negocios) {
    const catSlug  = CATEGORY_MAP[neg.categoria]
    const catId    = catSlug ? catIdBySlug[catSlug] ?? null : null
    const slug     = await slugUnico(toSlug(neg.nombre))

    const payload = {
      nombre:         neg.nombre,
      slug,
      descripcion:    neg.descripcion_corta || null,
      categoria_id:   catId,
      tipo:           'negocio',
      plan:           'basico',
      activo:         true,
      verificado:     false,
      telefono:       neg.telefono  || null,
      whatsapp:       neg.whatsapp  || null,
      email:          neg.email     || null,
      sitio_web:      neg.sitio_web || null,
      direccion:      neg.direccion || null,
      ciudad:         'Linares',
      region:         'Maule',
      a_domicilio:    neg.atiende_domicilio ?? false,
      zona_cobertura: neg.zona_cobertura || null,
    }

    const { data: inserted, error: negErr } = await supabase
      .from('negocios')
      .insert(payload)
      .select('id')
      .single()

    if (negErr) {
      console.error(`  ✗ ${neg.nombre}  →  ${negErr.message}`)
      fail++
      continue
    }

    // 4. Insertar horarios
    const DIAS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
    const horarios = DIAS.map(dia => ({
      negocio_id: inserted.id,
      dia,
      ...parseHorario(neg.horario?.[dia]),
    }))

    const { error: horErr } = await supabase.from('horarios').insert(horarios)
    if (horErr) {
      console.warn(`  ⚠ horarios de "${neg.nombre}":`, horErr.message)
    }

    console.log(`  ✓ ${neg.nombre}  [${catSlug ?? '??'}]`)
    ok++
  }

  console.log(`\n✅  Listo: ${ok} insertados, ${fail} fallidos`)
}

main().catch(err => { console.error('❌', err); process.exit(1) })
