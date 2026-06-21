-- ─────────────────────────────────────────────────────────────────────────────
-- Fotos para negocios de LinaresYa usando Unsplash (permite hotlinking)
-- Ejecutar en: Supabase > SQL Editor
-- Solo actualiza negocios que NO tienen foto aún (foto_portada IS NULL)
-- ─────────────────────────────────────────────────────────────────────────────

-- GASTRONOMÍA — Restaurantes
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=80'
WHERE slug = 'el-tumbaito' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&q=80'
WHERE slug = 'saffirio-restaurant' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop&q=80'
WHERE slug = 'vaiven-bar-restaurant' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80'
WHERE slug = 'terraza-alameda-resto-bar' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop&q=80'
WHERE slug = 'del-melado-al-nevado' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&h=400&fit=crop&q=80'
WHERE slug = 'casa-grande-restaurant' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&h=400&fit=crop&q=80'
WHERE slug = 'club-de-la-union-linares' AND (foto_portada IS NULL OR foto_portada = '');

-- CAFÉS
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&q=80'
WHERE slug = 'stereo-coffee-linares' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&h=400&fit=crop&q=80'
WHERE slug = 'cafe-la-francesa' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop&q=80'
WHERE slug = 'cafe-capri' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1521302200778-33500d36c154?w=600&h=400&fit=crop&q=80'
WHERE slug = 'coffee-and-play' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop&q=80'
WHERE slug = 'cafe-caramell' AND (foto_portada IS NULL OR foto_portada = '');

-- PANADERÍAS / AMASANDERÍAS
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop&q=80'
WHERE slug = 'panaderia-el-carmen' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop&q=80'
WHERE slug = 'amasanderia-y-pasteleria-brachil' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600&h=400&fit=crop&q=80'
WHERE slug = 'panaderia-marsella' AND (foto_portada IS NULL OR foto_portada = '');

-- SALUD
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop&q=80'
WHERE slug = 'hospital-de-linares' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop&q=80'
WHERE slug = 'clinica-dental-salud-oral' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&h=400&fit=crop&q=80'
WHERE slug = 'clinica-integral-linares' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=400&fit=crop&q=80'
WHERE slug = 'cruz-verde-linares' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop&q=80'
WHERE slug = 'clinica-dental-uno-salud' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop&q=80'
WHERE slug = 'centro-especialistas-ces' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&h=400&fit=crop&q=80'
WHERE slug = 'clinica-valtris' AND (foto_portada IS NULL OR foto_portada = '');

-- ÓPTICAS
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=400&fit=crop&q=80'
WHERE slug = 'topisima-optica-linares' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&h=400&fit=crop&q=80'
WHERE slug = 'opticas-bando' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop&q=80'
WHERE slug = 'optica-visuell' AND (foto_portada IS NULL OR foto_portada = '');

-- BELLEZA / SPA
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&q=80'
WHERE slug = 'salon-de-belleza-patricia' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&h=400&fit=crop&q=80'
WHERE slug = 'clinica-t-renova-spa' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1560066984-138daaa83d29?w=600&h=400&fit=crop&q=80'
WHERE slug = 'salon-zahara' AND (foto_portada IS NULL OR foto_portada = '');

-- SERVICIOS
UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=80'
WHERE slug = 'royal-taxi-linares' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop&q=80'
WHERE slug = 'gasfiteria-malfy' AND (foto_portada IS NULL OR foto_portada = '');

UPDATE negocios SET foto_portada = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&q=80'
WHERE slug = 'grez-ulloa-electricidad' AND (foto_portada IS NULL OR foto_portada = '');

-- Verificar resultado
SELECT nombre, slug,
  CASE WHEN foto_portada IS NOT NULL THEN 'SI' ELSE 'NO' END as tiene_foto
FROM negocios
WHERE activo = true
ORDER BY tiene_foto DESC, nombre;
