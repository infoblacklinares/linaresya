-- ============================================================
-- LinaresYa.cl - SEED de negocios demo
-- Correlo en: Supabase > SQL Editor > New query > RUN
-- Requisito: que ya exista la BD v2.0 (tablas categorias, negocios, horarios)
-- Idempotente: podes correrlo varias veces sin duplicar (usa ON CONFLICT por slug)
-- ============================================================

-- Asegurate de tener las 12 categorias cargadas
insert into public.categorias (nombre, slug, emoji, orden) values
  ('Gastronomia',            'gastronomia',          '🍽️',  1),
  ('Servicios y Oficios',    'servicios-y-oficios',  '🔧',  2),
  ('Salud y Bienestar',      'salud',                '🏥',  3),
  ('Belleza y Estetica',     'belleza',              '💅',  4),
  ('Comercio y Tiendas',     'comercio',             '🛒',  5),
  ('Automotriz',             'automotriz',           '🚗',  6),
  ('Hogar y Construccion',   'hogar',                '🏠',  7),
  ('Educacion y Clases',     'educacion',            '🎓',  8),
  ('Profesionales',          'profesionales',        '💼',  9),
  ('Mascotas',               'mascotas',             '🐾', 10),
  ('Eventos y Entretenimiento','eventos',            '🎉', 11),
  ('Agro y Campo',           'agro',                 '🌾', 12)
on conflict (slug) do nothing;

-- ============================================================
-- NEGOCIOS DEMO (16 en total, repartidos por categorias)
-- ============================================================
with cat as (
  select slug, id from public.categorias
)
insert into public.negocios (
  nombre, slug, descripcion, categoria_id, tipo, plan, activo, verificado,
  telefono, whatsapp, direccion, ciudad, a_domicilio, foto_portada
) values
  -- GASTRONOMIA
  ('Pizzeria Don Vittorio', 'pizzeria-don-vittorio',
   'Pizzas artesanales al horno de barro. Mozzarella de campo y masa madre.',
   (select id from cat where slug='gastronomia'), 'negocio', 'premium', true, true,
   '+56973000001', '+56973000001', 'Av. Leon Bustos 450', 'Linares', true,
   'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'),

  ('Empanadas La Abuela', 'empanadas-la-abuela',
   'Empanadas de pino, queso y mariscos hechas a mano.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   '+56973000002', '+56973000002', 'Independencia 120', 'Linares', false, null),

  -- OFICIOS
  ('Don Pedro - Soldador', 'don-pedro-soldador',
   'Soldadura en terreno, rejas, portones y estructuras metalicas.',
   (select id from cat where slug='servicios-y-oficios'), 'independiente', 'basico', true, true,
   '+56973000003', '+56973000003', null, 'Linares', true, null),

  ('Carpinteria El Nogal', 'carpinteria-el-nogal',
   'Muebles a medida, cocinas, closets. 15 anos de experiencia.',
   (select id from cat where slug='servicios-y-oficios'), 'negocio', 'premium', true, true,
   '+56973000004', '+56973000004', 'Camino a Yerbas Buenas km 3', 'Linares', true,
   'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800'),

  -- SALUD
  ('Dra. Maria Saez - Kinesiologa', 'dra-maria-saez-kine',
   'Kinesiologia deportiva y rehabilitacion traumatologica.',
   (select id from cat where slug='salud'), 'independiente', 'premium', true, true,
   '+56973000005', '+56973000005', 'Valentin Letelier 680, of. 3', 'Linares', false, null),

  -- BELLEZA
  ('Peluqueria Camila', 'peluqueria-camila',
   'Cortes, color, balayage y alisado. Pide tu hora por WhatsApp.',
   (select id from cat where slug='belleza'), 'negocio', 'premium', true, true,
   '+56973000006', '+56973000006', 'Chacabuco 340', 'Linares', false,
   'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'),

  ('Nails Studio Linares', 'nails-studio-linares',
   'Uñas esculpidas, gel, acrilico y diseños personalizados.',
   (select id from cat where slug='belleza'), 'negocio', 'basico', true, false,
   '+56973000007', '+56973000007', 'Yumbel 220', 'Linares', false, null),

  -- COMERCIO
  ('Tienda La Regalona', 'tienda-la-regalona',
   'Regalos, decoracion y articulos para el hogar.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56973000008', '+56973000008', 'Kurt Moller 150', 'Linares', true, null),

  -- AUTOMOTRIZ
  ('Vulcanizacion El Rayo', 'vulcanizacion-el-rayo',
   'Vulcanizacion 24h, alineacion y balanceo.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, true,
   '+56973000009', '+56973000009', 'Ruta 5 Sur km 302', 'Linares', true, null),

  -- HOGAR
  ('Maestro Juan - Gasfiter', 'maestro-juan-gasfiter',
   'Gasfiteria, destape de cañerias y urgencias.',
   (select id from cat where slug='hogar'), 'independiente', 'basico', true, true,
   '+56973000010', '+56973000010', null, 'Linares', true, null),

  -- EDUCACION
  ('Profe Ana - Matematicas', 'profe-ana-mates',
   'Clases particulares de matematicas y fisica. Basica, media y PSU/PAES.',
   (select id from cat where slug='educacion'), 'independiente', 'basico', true, false,
   '+56973000011', '+56973000011', null, 'Linares', true, null),

  -- PROFESIONALES
  ('Estudio Contable Morales', 'estudio-contable-morales',
   'Contabilidad PyME, boleta electronica y asesoria tributaria SII.',
   (select id from cat where slug='profesionales'), 'negocio', 'premium', true, true,
   '+56973000012', '+56973000012', 'Manuel Rodriguez 415', 'Linares', false, null),

  -- MASCOTAS
  ('Veterinaria Patitas', 'veterinaria-patitas',
   'Consultas, vacunas, cirugias y urgencias 24h.',
   (select id from cat where slug='mascotas'), 'negocio', 'premium', true, true,
   '+56973000013', '+56973000013', 'Januario Espinoza 512', 'Linares', false,
   'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800'),

  ('PetShop La Huella', 'petshop-la-huella',
   'Alimentos, accesorios y peluqueria canina.',
   (select id from cat where slug='mascotas'), 'negocio', 'basico', true, false,
   '+56973000014', '+56973000014', 'Freire 280', 'Linares', true, null),

  -- EVENTOS
  ('Eventos Don Beto', 'eventos-don-beto',
   'Arriendo de sillas, mesas, toldos y sonido para cualquier evento.',
   (select id from cat where slug='eventos'), 'negocio', 'basico', true, false,
   '+56973000015', '+56973000015', 'Av. Balmaceda 880', 'Linares', true, null),

  -- AGRO
  ('Agricola Las Vertientes', 'agricola-las-vertientes',
   'Venta directa de frutas, verduras y productos del campo.',
   (select id from cat where slug='agro'), 'negocio', 'premium', true, true,
   '+56973000016', '+56973000016', 'Camino a Panimavida km 8', 'Linares', true,
   'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800')

on conflict (slug) do nothing;

-- ============================================================
-- HORARIOS DEMO (lunes a sabado 09:00-19:00, domingo cerrado)
-- Se aplica a todos los negocios que acabamos de crear
-- ============================================================
insert into public.horarios (negocio_id, dia, abre, cierra, cerrado)
select n.id, d.dia, '09:00'::time, '19:00'::time, false
from public.negocios n
cross join (values
  ('lunes'::text), ('martes'), ('miercoles'),
  ('jueves'), ('viernes'), ('sabado')
) as d(dia)
where not exists (
  select 1 from public.horarios h
  where h.negocio_id = n.id and h.dia = d.dia::text
);

insert into public.horarios (negocio_id, dia, abre, cierra, cerrado)
select n.id, 'domingo', null, null, true
from public.negocios n
where not exists (
  select 1 from public.horarios h
  where h.negocio_id = n.id and h.dia = 'domingo'
);

-- LISTO\! Ya podes refrescar localhost:3000 y ver las categorias con negocios.
