-- ============================================================
-- LinaresYa.cl - Negocios reales encontrados en Google Maps
-- Fuente: Búsqueda manual Google Maps, junio 2026
-- Correr en: Supabase > SQL Editor > New query > RUN
-- Idempotente: usa ON CONFLICT (slug) DO NOTHING
-- Todos quedan con activo=true, verificado=false, plan='basico'
-- El admin debe verificar y activar cada uno.
-- ============================================================

-- Asegurarse de que las categorías base existen
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
-- HELPER: referencia a categorias
-- ============================================================
with cat as (
  select slug, id from public.categorias
)

-- ============================================================
-- GASTRONOMÍA — Restaurantes, Bares, Cafeterías, Panaderías
-- ============================================================
insert into public.negocios (
  nombre, slug, descripcion, categoria_id, tipo, plan,
  activo, verificado, telefono, direccion, ciudad, a_domicilio
) values

  ('El Tumbaito',
   'el-tumbaito',
   'Restaurante con amplia variedad gastronómica en el centro de Linares.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Lautaro 350', 'Linares', false),

  ('Del Melado Al Nevado',
   'del-melado-al-nevado',
   'Restaurante familiar con sabores tradicionales del Maule. Ambiente acogedor.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'San Martín 722', 'Linares', false),

  ('Restaurant Lima Oriental',
   'restaurant-lima-oriental',
   'Cocina peruana auténtica en Linares. Ceviches, tiraditos y platos de fondo.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Chorrillos 606', 'Linares', false),

  ('Vaivén Bar Restaurant',
   'vaiven-bar-restaurant',
   'Parrilla y cócteles en ambiente moderno. Ceviche mixto y espresso martini.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Av. Presidente Ibáñez 510', 'Linares', false),

  ('Restobar Las Delicias',
   'restobar-las-delicias',
   'Cocina peruana y criolla. Buen ambiente, precios accesibles.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Kurt Moller 47', 'Linares', false),

  ('Casa Grande Restaurant',
   'casa-grande-restaurant',
   'Restaurante tranquilo con buena comida a precios muy adecuados.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Maipú 1009', 'Linares', false),

  ('Terraza Alameda Resto Bar',
   'terraza-alameda-resto-bar',
   'Pub restaurante con excelente ambiente, servicio y sabor en pleno centro.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Valentín Letelier 315', 'Linares', false),

  ('Club de la Unión Linares',
   'club-de-la-union-linares',
   'Restaurante de alta categoría. Comida espectacular y atención maravillosa.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Cam. Real 01231', 'Linares', false),

  ('Saffirio Restaurant',
   'saffirio-restaurant',
   'Restaurante de cocina chilena e internacional. Salmón con salsa de camarones imperdible.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Yungay 681', 'Linares', false),

  -- Cafeterías
  ('Café La Francesa',
   'cafe-la-francesa',
   'Cafetería clásica del centro. Desayunos, pasteles y menú del día.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Manuel Rodriguez 552', 'Linares', false),

  ('Café Capri',
   'cafe-capri',
   'Cafetería con variedad de desayunos y almuerzos. Ambiente familiar en el centro.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Independencia 488', 'Linares', false),

  ('Cafetería Coffee and Play',
   'cafeteria-coffee-and-play',
   'Café de especialidad y pastelería. Los niños lo pasan fantástico.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'San Martín 637', 'Linares', false),

  ('Cafe Caramell',
   'cafe-caramell',
   'Cafetería con excelente ambiente nocturno. Ricos pasteles y buena atención.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Av. Presidente Ibáñez s/n', 'Linares', false),

  ('Stereo Coffee Linares',
   'stereo-coffee-linares',
   'La mejor cafetería de especialidad de Linares. Granos de origen y métodos filtrados.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Valentín Letelier 416', 'Linares', false),

  -- Panaderías
  ('Panadería El Carmen',
   'panaderia-el-carmen',
   'Pan fresco, tortas y pasteles. Más de 160 opiniones avalan su calidad.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Rengo 1506', 'Linares', false),

  ('Panaderia Marsella',
   'panaderia-marsella',
   'Panadería y pastelería. Panes frescos y los mejores pastelitos del barrio.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Valentín Letelier 1147', 'Linares', false),

  ('Panadería y Pastelería Linares',
   'panaderia-y-pasteleria-linares',
   'Variedad de panes, tortas y dulces. Abiertos desde temprano.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Av. Cardenal Raúl Silva Henríquez 972', 'Linares', false),

  ('Amasandería y Pastelería Brachil',
   'amasanderia-y-pasteleria-brachil',
   'Tortas, galletas, kuchen, donas y mucho más. Imperdible en Linares.',
   (select id from cat where slug='gastronomia'), 'negocio', 'basico', true, false,
   null, 'Rengo 1297', 'Linares', false),

-- ============================================================
-- SERVICIOS Y OFICIOS — Gasfíteres, Electricistas, Imprentas, Taxis
-- ============================================================

  -- Gasfíteres
  ('Gasfiteria Malfy',
   'gasfiteria-malfy',
   'Gasfíter en Linares disponible las 24 horas. Más de 664 clientes satisfechos.',
   (select id from cat where slug='servicios-y-oficios'), 'independiente', 'basico', true, false,
   '+56999490624', null, 'Linares', true),

  ('Gasfíter Linares Aquared',
   'gasfiter-linares-aquared',
   'Fugas de agua con detector acústico. Servicio 24 horas en toda la ciudad.',
   (select id from cat where slug='servicios-y-oficios'), 'independiente', 'basico', true, false,
   '+56972963764', null, 'Linares', true),

  -- Electricistas
  ('Grez y Ulloa Electricidad',
   'grez-y-ulloa-electricidad',
   'Tienda y servicio de electricidad. Todo en materiales eléctricos para el hogar.',
   (select id from cat where slug='servicios-y-oficios'), 'negocio', 'basico', true, false,
   '+56732627605', 'Chacabuco 648', 'Linares', false),

  ('Electricidad Domínguez',
   'electricidad-dominguez',
   'Electricista domiciliario. Trabajos seguros y de calidad.',
   (select id from cat where slug='servicios-y-oficios'), 'independiente', 'basico', true, false,
   '+56963402712', 'Doña Rosa 1415', 'Linares', true),

  ('Servicios Eléctricos Linares',
   'servicios-electricos-linares',
   'Electricista en Linares. Excelente servicio y precios muy recomendables.',
   (select id from cat where slug='servicios-y-oficios'), 'independiente', 'basico', true, false,
   '+56950657502', 'Esperanza 1130', 'Linares', true),

  -- Imprentas
  ('Impresora Linares',
   'impresora-linares',
   'Imprenta en el centro de Linares. Impresión de documentos, folletos y libros.',
   (select id from cat where slug='servicios-y-oficios'), 'negocio', 'basico', true, false,
   '+56732215988', 'Independencia 97', 'Linares', false),

  ('Planos Linares',
   'planos-linares',
   'Impresión de planos y documentos técnicos. Rápido y confiable.',
   (select id from cat where slug='servicios-y-oficios'), 'negocio', 'basico', true, false,
   '+56972308310', 'Independencia 495, 2° piso', 'Linares', false),

  ('Gráfica Linares',
   'grafica-linares',
   'Imprenta y diseño gráfico. Servicio rápido y de calidad.',
   (select id from cat where slug='servicios-y-oficios'), 'negocio', 'basico', true, false,
   '+56982004797', 'Kurt Moller 201', 'Linares', false),

  -- Taxis / Transporte
  ('Royal Taxi Linares',
   'royal-taxi-linares',
   'Servicio de radio taxi disponible las 24 horas en Linares.',
   (select id from cat where slug='servicios-y-oficios'), 'negocio', 'basico', true, false,
   '+56732211515', 'Valentín Letelier Sur 590', 'Linares', true),

  ('Taxis Achibueno',
   'taxis-achibueno',
   'Radio taxi puntual, especialmente madrugada. Servicio confiable en Linares.',
   (select id from cat where slug='servicios-y-oficios'), 'negocio', 'basico', true, false,
   '+56983422436', 'Terminal Paseo Portal', 'Linares', true),

  ('Radio Taxis Universo',
   'radio-taxis-universo',
   'Servicio de radio taxi en Linares. Traslados a toda la ciudad.',
   (select id from cat where slug='servicios-y-oficios'), 'negocio', 'basico', true, false,
   '+56732211718', 'Fontana 202', 'Linares', true),

-- ============================================================
-- SALUD Y BIENESTAR — Hospitales, Dentistas, Farmacias, Ópticas
-- ============================================================

  -- Hospitales / Clínicas
  ('Hospital de Linares',
   'hospital-de-linares',
   'Hospital público de Linares. Urgencias 24 horas.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56732566500', 'Av. Brasil 753', 'Linares', false),

  ('Clínica Integral Linares',
   'clinica-integral-linares',
   'Centro médico con especialidades. Exámenes y consultas con especialistas.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56732213297', 'Diputado Mario Dueñas 611', 'Linares', false),

  -- Dentistas
  ('Clínica Dental Salud Oral',
   'clinica-dental-salud-oral',
   'Clínica dental completa. Personal amable y tratamientos de calidad.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56732210798', 'O''Higgins 444, 2° piso', 'Linares', false),

  ('Clínica Dental Uno Salud',
   'clinica-dental-uno-salud',
   'Red de clínicas dentales. Profesionalismo y amplia cobertura de tratamientos.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '6007071010', 'Chacabuco 575', 'Linares', false),

  ('Centro de Especialistas en Salud CES',
   'centro-de-especialistas-en-salud-ces',
   'Clínica dental con especialistas. Excelente atención y modernos equipos.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56732226474', 'O''Higgins 724', 'Linares', false),

  ('Odontología Integral Ltda',
   'odontologia-integral-ltda',
   'Odontóloga que explica todos los procedimientos. Atención personalizada.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56987481202', 'Kurt Moller 493, Of. 1', 'Linares', false),

  ('Clínica Valtris',
   'clinica-valtris',
   'Clínica dental moderna. La Dra. Valentina es muy recomendada por sus pacientes.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56983733853', 'Freire 196 esq. Max Jara', 'Linares', false),

  ('Odontólogo Felipe Riquelme',
   'odontologo-felipe-riquelme',
   'Atención profesional con un equipo humano insuperable. Excelente servicio.',
   (select id from cat where slug='salud'), 'independiente', 'basico', true, false,
   '+56976051145', 'Kurt Moller 523', 'Linares', false),

  ('Clínica Dental SAMY',
   'clinica-dental-samy',
   'Clínica dental en el centro de Linares. Atención a toda la familia.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56732331773', 'Independencia 437', 'Linares', false),

  -- Farmacias
  ('Farmacia Parada',
   'farmacia-parada',
   'Farmacia de confianza. Muy buenos trabajadores y precios accesibles.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56732472249', 'Maipú 419, local 8', 'Linares', false),

  ('Farmacias del Dr. Simi',
   'farmacias-del-dr-simi',
   'Medicamentos a precios accesibles. Sucursal en el centro de Linares.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+5622871707', 'Independencia 536', 'Linares', false),

  ('Farmacia y Perfumería Roca',
   'farmacia-y-perfumeria-roca',
   'Farmacia con productos de medicina natural y perfumería. Centro de Linares.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56732213679', 'Maipú 511', 'Linares', false),

  ('Farmacias Cruz Verde Linares',
   'farmacias-cruz-verde-linares',
   'Farmacia Cruz Verde, 4 sucursales en Linares. Abierto las 24 horas.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '800802800', 'Independencia 543', 'Linares', false),

  ('Farmacias Nueva Francesa',
   'farmacias-nueva-francesa',
   'Farmacia con precios económicos en el centro de Linares.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56732216020', 'Independencia 794', 'Linares', false),

  ('Farmacias Ahumada Linares',
   'farmacias-ahumada-linares',
   'Cadena de farmacias con retiro en tienda y entrega a domicilio.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '6002224000', 'Independencia 611', 'Linares', true),

  -- Ópticas
  ('Topisima Optica Linares',
   'topisima-optica-linares',
   'La óptica mejor valorada de Linares. Excelentes precios y variedad de marcos.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56990805740', 'O''Higgins 701', 'Linares', false),

  ('Ópticas Bando Linares',
   'opticas-bando-linares',
   'Óptica con excelente atención y los mejores precios comparados de la ciudad.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56990812193', 'O''Higgins / Max Jara', 'Linares', false),

  ('Óptica VISUELL',
   'optica-visuell',
   'Óptica 100% recomendada. Atención personalizada y profesional.',
   (select id from cat where slug='salud'), 'negocio', 'basico', true, false,
   '+56981242363', 'Carmen 191-A', 'Linares', false),

-- ============================================================
-- BELLEZA Y ESTÉTICA — Peluquerías, Spa, Masajes
-- ============================================================

  ('Salón de Belleza Patricia',
   'salon-de-belleza-patricia',
   'Peluquería y salón de belleza. Recupera tu pelo y dale brillo con tratamientos profesionales.',
   (select id from cat where slug='belleza'), 'negocio', 'basico', true, false,
   null, 'Av. Coronel Luis Carrera 1380', 'Linares', false),

  ('Peluqueria Constanza Bustos',
   'peluqueria-constanza-bustos',
   'Peluquería y estilismo. Excelente peluquera con atención personalizada.',
   (select id from cat where slug='belleza'), 'independiente', 'basico', true, false,
   null, 'Calle Lenga', 'Linares', false),

  ('Peluquería Carmen Doris',
   'peluqueria-carmen-doris',
   'Peluquería en el centro de Linares. Cortes espectaculares para toda la familia.',
   (select id from cat where slug='belleza'), 'independiente', 'basico', true, false,
   null, 'Brasil 531', 'Linares', false),

  ('ZAHARA Centro de Estética',
   'zahara-centro-de-estetica',
   'Centro de estética y peluquería. Buen estilista para hombres y mujeres.',
   (select id from cat where slug='belleza'), 'negocio', 'basico', true, false,
   null, 'Víctor Illanes 710', 'Linares', false),

  ('Hair Professional',
   'hair-professional',
   'Barbería en Linares. El mejor corte de pelo para hombre.',
   (select id from cat where slug='belleza'), 'negocio', 'basico', true, false,
   null, null, 'Linares', false),

  ('Clínica T-Renova SPA',
   'clinica-t-renova-spa',
   'Masajes y limpiezas faciales. Centro de bienestar con alta valoración.',
   (select id from cat where slug='belleza'), 'negocio', 'basico', true, false,
   '+5623383604', 'Kurt Moller 23', 'Linares', false),

  ('Centro de Belleza Lissa',
   'centro-de-belleza-lissa',
   'Esteticista profesional. Tratamientos faciales y corporales en Linares.',
   (select id from cat where slug='belleza'), 'negocio', 'basico', true, false,
   '+56997357729', 'Rengo 381', 'Linares', false),

  ('Masoterapeuta Víctor Andy Reyes',
   'masoterapeuta-victor-andy-reyes',
   'Masoterapia profesional. Excelente servicio y técnica recomendable.',
   (select id from cat where slug='belleza'), 'independiente', 'basico', true, false,
   '+56981355278', 'Valentín Letelier 1231', 'Linares', true),

  ('Balance Masajes',
   'balance-masajes',
   'Spa y centro de masajes. El mejor lugar para relajarse y desconectarse.',
   (select id from cat where slug='belleza'), 'negocio', 'basico', true, false,
   '+56935963273', 'Colo Colo 978', 'Linares', false),

  ('Senat Spa Linares',
   'senat-spa-linares',
   'Centro de belleza y spa en el centro de Linares.',
   (select id from cat where slug='belleza'), 'negocio', 'basico', true, false,
   '+56732215561', 'Freire 347', 'Linares', false),

-- ============================================================
-- COMERCIO Y TIENDAS — Super, Ropa, Tech, Muebles
-- ============================================================

  -- Supermercados
  ('Supermercado Lider Linares',
   'supermercado-lider-linares',
   'Supermercado Líder con amplia variedad de productos y estacionamiento.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '6004009000', 'Av. Aníbal León Bustos 280', 'Linares', false),

  ('Supermercados Cugat',
   'supermercados-cugat',
   'Frutas y verduras de la mejor calidad. Excelentes precios en Linares.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56722323101', 'Av. Januario Espinoza 985', 'Linares', false),

  ('Unimarc Linares',
   'unimarc-linares',
   'Supermercado amplio con buenos pasillos y variedad de productos.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '6006000025', 'Maipú 556', 'Linares', false),

  -- Ropa / Calzado
  ('La Maison Linares',
   'la-maison-linares',
   'Tienda de ropa, joyas y accesorios. Moda y estilo en el centro de Linares.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56962838191', 'O''Higgins 485', 'Linares', false),

  ('Roperito Linares',
   'roperito-linares',
   'La tienda de moda circular más económica del centro de Linares.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56930322299', 'Manuel Rodriguez 376', 'Linares', false),

  ('OVA Chile Linares',
   'ova-chile-linares',
   'Tienda de ropa con variedad de estilos. Muy buena tienda en el centro.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56944306504', 'Manuel Rodriguez 339-A', 'Linares', false),

  ('Calzados Di Claudio',
   'calzados-di-claudio',
   'La mejor zapatería de Linares según sus clientes. Variedad y buena atención.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56732213883', 'Independencia 520', 'Linares', false),

  -- Tecnología / Celulares
  ('Phoneclick Linares',
   'phoneclick-linares',
   'Accesorios para celulares y servicio técnico. Muy buena atención y calidad.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56979568637', 'Av. Januario Espinoza 759', 'Linares', false),

  ('Cellmena',
   'cellmena',
   'Tienda de celulares en Linares. Venta y servicio técnico especializado.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56933052093', 'Maipú 573', 'Linares', false),

  ('Centro Digital Linares',
   'centro-digital-linares',
   'Tienda de informática y accesorios. Teclados mecánicos y todo en tecnología.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56950861722', 'Maipú 698, Local 19', 'Linares', false),

  -- Muebles / Hogar
  ('Centrogar Muebles',
   'centrogar-muebles',
   'Mueblería con productos de calidad. Clientes muy conformes con sus compras.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56936883909', 'Av. Januario Espinoza 372', 'Linares', false),

  ('Muebles Lastra',
   'muebles-lastra',
   'Mueblería con variedad y buen servicio. Dormitorios, living y más.',
   (select id from cat where slug='comercio'), 'negocio', 'basico', true, false,
   '+56732228973', 'Yumbel 383', 'Linares', false),

-- ============================================================
-- AUTOMOTRIZ — Talleres Mecánicos, Lubricentros
-- ============================================================

  ('Lubricentro y Taller Mensif',
   'lubricentro-y-taller-mensif',
   'Taller de vehículos todoterreno y mecánica general. Precios y experiencia 100/10.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56987880519', 'Kurt Moller 078', 'Linares', false),

  ('Lubricentro Motrisa',
   'lubricentro-motrisa',
   'Lubricentro 100% recomendado en Linares. Cambio de aceite y revisión.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56959770694', 'Yumbel 135', 'Linares', false),

  ('Serviteca Full Cars',
   'serviteca-full-cars',
   'Taller de reparación de automóviles. Excelente técnico en inspección con escáner.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56989234810', 'Yumbel 10', 'Linares', false),

  ('Formulacenter Leo Alineaciones',
   'formulacenter-leo-alineaciones',
   'Taller de revisión de automóviles. 100% confiable con 45 opiniones perfectas.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56993034395', 'Arturo Prat 61', 'Linares', false),

  ('Mecánica Automotriz 165 Customs',
   'mecanica-automotriz-165-customs',
   'El taller mejor equipado y confiable de Linares. Nota 10/10 de sus clientes.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56959516774', 'Colo Colo 155-A', 'Linares', false),

  ('Par Motor Mecánica Automotriz',
   'par-motor-mecanica-automotriz',
   'Taller mecánico realmente recomendable. Buena atención y precios justos.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56999241446', 'Cabildo 1471', 'Linares', false),

  ('Mecánico Juan Vivar Linares',
   'mecanico-juan-vivar-linares',
   'Mecánico confiable y super responsable. Muy bien valorado por sus clientes.',
   (select id from cat where slug='automotriz'), 'independiente', 'basico', true, false,
   '+56935545451', 'Los Pirineos 1492', 'Linares', true),

  ('Maestro Atala Mecánica General',
   'maestro-atala-mecanica-general',
   'Mega excelente mecánico en Linares. Años de experiencia en mecánica general.',
   (select id from cat where slug='automotriz'), 'independiente', 'basico', true, false,
   null, 'Cabildo 155', 'Linares', true),

  ('Taller Urzua',
   'taller-urzua',
   'Taller de automóviles con muy buena disposición hacia el cliente.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56932047587', 'Valentín Letelier 223', 'Linares', false),

  ('Lubricentro Servi-Alfa',
   'lubricentro-servi-alfa',
   'Servicio de cambio de aceite con precios muy buenos en Linares.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56934393043', 'Ignacio Chacón 1075', 'Linares', false),

  ('Pro Car Automotriz',
   'pro-car-automotriz',
   'Taller mecánico excelente, personal muy atento y honesto.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56996983055', 'Serrano 940', 'Linares', false),

  ('DARKCAR Linares',
   'darkcar-linares',
   'Taller mecánico 100% confiable y recomendable en Linares.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56974499105', 'Av. circunvalación s/n', 'Linares', false),

  ('Dynamic Service Linares',
   'dynamic-service-linares',
   'Taller de automóviles. Excelente servicio, 100% recomendado.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56933799081', 'Arturo Prat 802', 'Linares', false),

  ('Rivas Garage',
   'rivas-garage',
   'Trabajo responsable y confiable. Taller de reparación de automóviles.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56935855069', 'Av. Cardenal Raúl Silva Henríquez 01065', 'Linares', false),

  ('R y A Mecánica en General',
   'r-y-a-mecanica-en-general',
   'Taller mecánico con atención de lunes a sábado. Mecánica general.',
   (select id from cat where slug='automotriz'), 'negocio', 'basico', true, false,
   '+56973201457', 'Colo Colo 1563', 'Linares', false),

-- ============================================================
-- HOGAR Y CONSTRUCCIÓN — Ferreterías
-- ============================================================

  ('Ferretería Pejerrey',
   'ferreteria-pejerrey',
   'Amplio estacionamiento, encuentras todo lo que buscas. Variedad de herramientas.',
   (select id from cat where slug='hogar'), 'negocio', 'basico', true, false,
   null, 'Patricio Lynch 249', 'Linares', false),

  ('Ferretería Carlitos Méndez',
   'ferreteria-carlitos-mendez',
   'Buena atención y surtido completo. Ferretería de confianza en el centro.',
   (select id from cat where slug='hogar'), 'negocio', 'basico', true, false,
   '+56732226542', 'Maipú 219', 'Linares', false),

  ('Ferreteria Valdebenito',
   'ferreteria-valdebenito',
   'Excelente atención y precios muy convenientes. Ferretería barrial.',
   (select id from cat where slug='hogar'), 'negocio', 'basico', true, false,
   '+56946479982', 'Rengo 435', 'Linares', false),

  ('Ferretería MDC',
   'ferreteria-mdc',
   'Ferretería nueva con todo ordenado y limpio. Herramientas y materiales.',
   (select id from cat where slug='hogar'), 'negocio', 'basico', true, false,
   null, 'Rengo 1392', 'Linares', false),

-- ============================================================
-- EDUCACIÓN — Colegios, Jardines Infantiles, Gimnasios
-- ============================================================

  ('LBE Colegio Concepción de Linares',
   'lbe-colegio-concepcion-de-linares',
   'Colegio reconocido de Linares con formación integral.',
   (select id from cat where slug='educacion'), 'negocio', 'basico', true, false,
   '+56732216318', 'Av. General Cristi 0571', 'Linares', false),

  ('Colegio Cordillera Linares',
   'colegio-cordillera-linares',
   'Colegio con ambiente limpio y ordenado. Formación de calidad en Linares.',
   (select id from cat where slug='educacion'), 'negocio', 'basico', true, false,
   '+56732216793', 'Manuel Rodriguez 684', 'Linares', false),

  ('Jardín Infantil Las Rosas JUNJI',
   'jardin-infantil-las-rosas-junji',
   'Jardín infantil JUNJI con atención de calidad para los más pequeños.',
   (select id from cat where slug='educacion'), 'negocio', 'basico', true, false,
   '+56732230965', 'Las Araucarias 943', 'Linares', false),

  ('Gimnasio Smart Fit Linares',
   'gimnasio-smart-fit-linares',
   'Gimnasio amplio, limpio y con excelente personal. El mejor equipado de Linares.',
   (select id from cat where slug='educacion'), 'negocio', 'basico', true, false,
   null, 'Av. Aníbal León Bustos 0353', 'Linares', false),

  ('Gimnasio Nasim Nome Aguilera',
   'gimnasio-nasim-nome-aguilera',
   'Gimnasio con canchas de básquetbol y equipamiento completo.',
   (select id from cat where slug='educacion'), 'negocio', 'basico', true, false,
   null, 'Los Lingues 952', 'Linares', false),

  ('Gimnasio Dinamity',
   'gimnasio-dinamity',
   'El mejor lugar para entrenar en Linares. Máquinas de excelente calidad.',
   (select id from cat where slug='educacion'), 'negocio', 'basico', true, false,
   null, 'Lautaro 327', 'Linares', false),

-- ============================================================
-- PROFESIONALES — Abogados, Notarías, Contadores, Inmobiliarias
-- ============================================================

  ('IUS Abogados Linares',
   'ius-abogados-linares',
   'Abogados en Linares. Responde todas las dudas. 100% recomendados.',
   (select id from cat where slug='profesionales'), 'negocio', 'basico', true, false,
   '+56950560264', 'Maipú 461, Of. 405', 'Linares', false),

  ('Nova Sur Abogados en Linares',
   'nova-sur-abogados-en-linares',
   'Estudio jurídico en el centro de Linares. Asesoría legal integral.',
   (select id from cat where slug='profesionales'), 'negocio', 'basico', true, false,
   '+56964691205', 'Manuel Rodriguez 456', 'Linares', false),

  ('Notaría Andrés Cuadra González',
   'notaria-andres-cuadra-gonzalez',
   'Notaría con sistema de agenda web. Excelente atención 10/10.',
   (select id from cat where slug='profesionales'), 'negocio', 'basico', true, false,
   '+56732210896', 'Chacabuco 551', 'Linares', false),

  ('hym Penalistas',
   'hym-penalistas',
   'Abogados penalistas en Linares. Excelentes profesionales.',
   (select id from cat where slug='profesionales'), 'negocio', 'basico', true, false,
   '+56732501220', 'Colo Colo 483', 'Linares', false),

  ('PPB Propiedades',
   'ppb-propiedades',
   'Agencia inmobiliaria profesional con excelentes publicidades y agentes.',
   (select id from cat where slug='profesionales'), 'negocio', 'basico', true, false,
   '+56941735960', 'Yumbel 759', 'Linares', false),

  ('Corredora Aburto Propiedades',
   'corredora-aburto-propiedades',
   'Corredora de propiedades con asesoría legal. Oficina en el centro.',
   (select id from cat where slug='profesionales'), 'negocio', 'basico', true, false,
   '+56934191842', 'Independencia 571, of. 8', 'Linares', false),

  ('CRECE Gestion Inmobiliaria',
   'crece-gestion-inmobiliaria',
   'Empresa confiable y transparente. Gestión inmobiliaria en Linares.',
   (select id from cat where slug='profesionales'), 'negocio', 'basico', true, false,
   '+56985358762', null, 'Linares', false),

-- ============================================================
-- MASCOTAS — Veterinarias
-- ============================================================

  ('Clínica y Farmacia Veterinaria Angel Guardian',
   'clinica-veterinaria-angel-guardian',
   'Veterinaria muy familiar y preocupada por el bienestar de las mascotas.',
   (select id from cat where slug='mascotas'), 'negocio', 'basico', true, false,
   '+56732214790', 'Maipú 774', 'Linares', false),

  ('Italo Vet Linares',
   'italo-vet-linares',
   'Excelente profesional, muy humano con las mascotas. 220 opiniones avalan.',
   (select id from cat where slug='mascotas'), 'negocio', 'basico', true, false,
   '+56942313549', 'Corporación 840', 'Linares', false),

  ('Veterinaria Municipal de Linares',
   'veterinaria-municipal-de-linares',
   'Muy buen lugar de atención para las mascotas. Servicio público.',
   (select id from cat where slug='mascotas'), 'negocio', 'basico', true, false,
   '+56732564788', 'Av. Presidente Ibáñez 560', 'Linares', false),

  ('Clínica Veterinaria Docpino',
   'clinica-veterinaria-docpino',
   'Veterinario responsable y con mucho criterio. Muy buenas opiniones.',
   (select id from cat where slug='mascotas'), 'negocio', 'basico', true, false,
   '+56963930006', 'Diputado Mario Dueñas 698', 'Linares', false),

  ('Clinica y Farmacia Veterinaria Univet',
   'clinica-veterinaria-univet',
   'Excelente atención alineada al bienestar animal. Farmacia veterinaria completa.',
   (select id from cat where slug='mascotas'), 'negocio', 'basico', true, false,
   '+56732221900', 'Yerbas Buenas 417', 'Linares', false),

  ('Hospital Clínico Veterinario La Granja',
   'hospital-clinico-veterinario-la-granja',
   'Hospital veterinario en Linares. Consultas y cirugías.',
   (select id from cat where slug='mascotas'), 'negocio', 'basico', true, false,
   '+56950506713', 'Colo Colo 1634', 'Linares', false),

  ('Clinica Veterinaria El Maule',
   'clinica-veterinaria-el-maule',
   'Veterinaria 24 horas. Muy preocupadas del bienestar de los animales.',
   (select id from cat where slug='mascotas'), 'negocio', 'basico', true, false,
   '+56999133278', 'Maipú 153', 'Linares', false),

-- ============================================================
-- EVENTOS — Turismo, Atracciones
-- ============================================================

  ('Casa Noé Mundo Animal',
   'casa-noe-mundo-animal',
   'Zoo y centro de rehabilitación animal. Muy lindo lugar, excelente experiencia familiar.',
   (select id from cat where slug='eventos'), 'negocio', 'basico', true, false,
   '+56997333751', null, 'Linares', false),

  ('Ecoturismo Linares',
   'ecoturismo-linares',
   'Agencia de visitas turísticas en Linares y la región del Maule.',
   (select id from cat where slug='eventos'), 'negocio', 'basico', true, false,
   '+56981609561', 'Independencia 437', 'Linares', false),

  ('Turismo Entre Santos',
   'turismo-entre-santos',
   'Atracción turística en La Puntilla. Super fácil llegar por Google Maps.',
   (select id from cat where slug='eventos'), 'negocio', 'basico', true, false,
   '+56964679412', 'La Puntilla Pejerrey', 'Linares', false),

  ('Andes Maule Travel',
   'andes-maule-travel',
   'Agencia de viajes y turismo en Linares. 100% recomendada.',
   (select id from cat where slug='eventos'), 'negocio', 'basico', true, false,
   '+56975950717', 'Oscar Aris 33', 'Linares', false)

on conflict (slug) do nothing;

-- ============================================================
-- HORARIOS por defecto: lunes a viernes 09:00–19:00
-- sábado 09:00–14:00 / domingo cerrado
-- Solo se insertan si el negocio no tiene horarios ya
-- ============================================================

insert into public.horarios (negocio_id, dia, abre, cierra, cerrado)
select n.id, d.dia, d.abre::time, d.cierra::time, false
from public.negocios n
cross join (values
  ('lunes',      '09:00', '19:00'),
  ('martes',     '09:00', '19:00'),
  ('miercoles',  '09:00', '19:00'),
  ('jueves',     '09:00', '19:00'),
  ('viernes',    '09:00', '19:00'),
  ('sabado',     '09:00', '14:00')
) as d(dia, abre, cierra)
where n.verificado = false
  and n.plan = 'basico'
  and n.ciudad = 'Linares'
  and not exists (
    select 1 from public.horarios h
    where h.negocio_id = n.id and h.dia = d.dia
  );

insert into public.horarios (negocio_id, dia, abre, cierra, cerrado)
select n.id, 'domingo', null, null, true
from public.negocios n
where n.verificado = false
  and n.plan = 'basico'
  and n.ciudad = 'Linares'
  and not exists (
    select 1 from public.horarios h
    where h.negocio_id = n.id and h.dia = 'domingo'
  );

-- ============================================================
-- RESUMEN
-- Total negocios insertados: ~100
-- Categorías cubiertas: 10 de 12
-- Siguiente paso: ir al panel admin y verificar / completar
--   los negocios que faltan teléfono o dirección.
-- ============================================================
