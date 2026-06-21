-- ─────────────────────────────────────────────────────────────────────────────
-- Asignar foto_portada a negocios sin foto, según su categoría.
-- Usa imágenes de Unsplash (libres, sin auth).
-- Ejecutar en Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- Gastronomía — restaurantes, cafés, comida
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'gastronomia') AND nombre LIKE '%Restaurant%';

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'gastronomia') AND (nombre ILIKE '%cafe%' OR nombre ILIKE '%café%');

-- Para el resto de gastronomía sin foto
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'gastronomia');

-- Salud — clínicas, médicos, dentistas
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'salud') AND (nombre ILIKE '%dent%' OR nombre ILIKE '%dental%');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'salud');

-- Belleza — peluquerías, salones
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'belleza');

-- Automotriz — talleres, mecánicos
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'automotriz');

-- Comercio — tiendas, ferreterías, supermercados
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'comercio') AND (nombre ILIKE '%ferret%');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'comercio');

-- Servicios y oficios — gasfíteres, electricistas
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1621905251189-08b45249be78?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'servicios-y-oficios');

-- Hogar — muebles, decoración, construcción
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'hogar');

-- Educación — colegios, academias
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'educacion');

-- Mascotas — veterinarias, petshop
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'mascotas');

-- Profesionales — abogados, contadores
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'profesionales');

-- Eventos — fotógrafos, banquetería
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'eventos');

-- Agro — viveros, agrícola
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80'
WHERE foto_portada IS NULL AND categoria_id = (SELECT id FROM categorias WHERE slug = 'agro');

-- Fallback: cualquier negocio sin foto aún
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80'
WHERE foto_portada IS NULL AND activo = true;

-- Verificar resultado
SELECT c.slug, COUNT(*) as total, COUNT(n.foto_portada) as con_foto
FROM negocios n
JOIN categorias c ON c.id = n.categoria_id
WHERE n.activo = true
GROUP BY c.slug
ORDER BY c.slug;
