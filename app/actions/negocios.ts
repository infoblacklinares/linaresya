'use server'

import { supabase } from '@/lib/supabase'

/**
   * QUERY 1: Listar negocios activos por categoria (optimizada con indices)
   * - Usa indice: idx_negocios_categoria_id
   * - Devuelve: nombres, slug, foto, verificado, categoria, count de resenas
   */
export async function getNegocios(categoriaId, limit = 20) {
    let query = supabase
      .from('negocios')
      .select(`
            id,
                  nombre,
                        slug,
                              foto_portada,
                                    verificado,
                                          categoria_id,
                                                plan,
                                                      categorias(nombre, emoji),
                                                            resenas(count)
                                                                `)
      .eq('activo', true)
      .order('verificado', { ascending: false })

  if (categoriaId) {
        query = query.eq('categoria_id', categoriaId)
  }

  const { data, error } = await query.limit(limit)

  if (error) {
        console.error('Error en getNegocios:', error)
        throw error
  }

  return data
}

/**
 * QUERY 2: Detalle completo de negocio (optimizada con Promise.all)
 * - 4 queries paralelas en lugar de joins costosos
 * - Aprovecha indices en negocio_id, activa, aprobada
 */
export async function getNegocioCompleto(slug) {
    const { data: negocio, error: negError } = await supabase
      .from('negocios')
      .select(`
            id,
                  nombre,
                        slug,
                              descripcion,
                                    categoria_id,
                                          tipo,
                                                plan,
                                                      activo,
                                                            verificado,
                                                                  premium_hasta,
                                                                        telefono,
                                                                              whatsapp,
                                                                                    email,
                                                                                          sitio_web,
                                                                                                direccion,
                                                                                                      ciudad,
                                                                                                            comuna,
                                                                                                                  region,
                                                                                                                        lat,
                                                                                                                              lng,
                                                                                                                                    a_domicilio,
                                                                                                                                          zona_cobertura,
                                                                                                                                                disponibilidad,
                                                                                                                                                      foto_portada,
                                                                                                                                                            creado_en,
                                                                                                                                                                  categorias(nombre, emoji, descripcion),
                                                                                                                                                                        owner_id
                                                                                                                                                                            `)
      .eq('slug', slug)
      .eq('activo', true)
      .single()

  if (negError || !negocio) {
        throw new Error('Negocio no encontrado')
  }

  const [ofertasRes, reseniasRes, horariosRes] = await Promise.all([
        supabase
          .from('ofertas')
          .select('*')
          .eq('negocio_id', negocio.id)
          .eq('activa', true)
          .order('boost_orden', { ascending: true, nullsFirst: false })
          .order('creado_en', { ascending: false }),
        supabase
          .from('resenas')
          .select('*')
          .eq('negocio_id', negocio.id)
          .eq('aprobada', true)
          .order('creado_en', { ascending: false })
          .limit(5),
        supabase
          .from('horarios')
          .select('*')
          .eq('negocio_id', negocio.id)
          .order('dia', { ascending: true })
      ])

  return {
        negocio,
        ofertas: ofertasRes.data || [],
        resenas: reseniasRes.data || [],
        horarios: horariosRes.data || []
  }
}

/**
 * QUERY 3: Busqueda full-text (optimizada con indice GIN)
 * - Usa tsvector + indice GIN en negocios.busqueda
 * - Sanitiza entrada (XSS A03)
 * - Soporta filtro por categoria
 */
export async function buscarNegocios(q, categoriaId, limit = 20) {
    const cleanQ = q
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 100)

  if (!cleanQ || cleanQ.length < 2) {
        return []
  }

  let query = supabase
      .from('negocios')
      .select(`
            id,
                  nombre,
                        slug,
                              ciudad,
                                    foto_portada,
                                          verificado,
                                                categoria_id,
                                                      categorias(nombre, emoji),
                                                            resenas(count)
                                                                `)
      .eq('activo', true)
      .textSearch('busqueda', cleanQ, {
              type: 'websearch',
              config: 'spanish'
      })

  if (categoriaId) {
        query = query.eq('categoria_id', categoriaId)
  }

  const { data, error } = await query
      .order('verificado', { ascending: false })
      .limit(limit)

  if (error) {
        console.error('Error en busqueda:', error)
        return []
  }

  return data || []
}

/**
 * QUERY 4: Estadisticas diarias de un negocio (para dashboard propietario)
 * - Usa indice: idx_estadisticas_negocio_fecha
 */
export async function getEstadisticasNegocio(negocioId, diasAtras = 30) {
    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - diasAtras)

  const { data, error } = await supabase
      .from('estadisticas_diarias')
      .select('*')
      .eq('negocio_id', negocioId)
      .gte('fecha', fechaInicio.toISOString().split('T')[0])
      .order('fecha', { ascending: false })

  if (error) {
        console.error('Error en estadisticas:', error)
        return []
  }

  return data || []
}

/**
 * QUERY 5: Ofertas boosteadas activas (para home/promociones)
 * - Usa indice: idx_ofertas_activas_boosteadas
 * - Ordena por boost vigente + orden + fecha
 */
export async function getOfertasDestacadas(limit = 10) {
    const { data, error } = await supabase
      .from('ofertas')
      .select(`
            id,
                  negocio_id,
                        titulo,
                              descripcion,
                                    descuento_pct,
                                          precio_normal,
                                                precio_oferta,
                                                      imagen_url,
                                                            fecha_inicio,
                                                                  fecha_fin,
                                                                        boost_orden,
                                                                              negocios(nombre, slug, categoria_id, categorias(emoji))
                                                                                  `)
      .eq('activa', true)
      .gt('boost_hasta', new Date().toISOString())
      .order('boost_orden', { ascending: true, nullsFirst: false })
      .order('creado_en', { ascending: false })
      .limit(limit)

  if (error) {
        console.error('Error en ofertas destacadas:', error)
        return []
  }

  return data || []
}
