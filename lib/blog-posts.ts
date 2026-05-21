/**
 * blog-posts.ts
 * Artículos del blog de LinaresYa.
 * Cada artículo está optimizado para búsquedas locales en Linares, Chile.
 */

export interface BlogPost {
  slug: string;
  titulo: string;
  descripcion: string; // meta description ~155 chars
  fecha: string;       // YYYY-MM-DD
  categoria: string;   // etiqueta visible
  emoji: string;
  contenido: string;   // HTML limpio
  keywords: string[];
}

export const posts: BlogPost[] = [
  {
    slug: "restaurantes-en-linares",
    titulo: "Los mejores restaurantes en Linares, Chile (2025)",
    descripcion:
      "Guía actualizada de los mejores restaurantes en Linares, Región del Maule. Desde cocina chilena tradicional hasta sushi y delivery a domicilio.",
    fecha: "2025-05-15",
    categoria: "Gastronomía",
    emoji: "🍽️",
    keywords: ["restaurantes linares", "donde comer linares", "delivery linares", "comida linares chile"],
    contenido: `
<p>Linares tiene una escena gastronómica más variada de lo que muchos creen. Desde el tradicional <strong>asado chileno</strong> hasta opciones de sushi, pizza artesanal y comida rápida con delivery. Acá te contamos dónde comer bien en la ciudad.</p>

<h2>¿Qué tipos de cocina hay en Linares?</h2>
<p>La oferta gastronómica de Linares incluye:</p>
<ul>
  <li><strong>Cocina chilena tradicional:</strong> cazuela, porotos con riendas, empanadas y chorrillana.</li>
  <li><strong>Parrillas y asados:</strong> varios locales especializados en carne al palo y parrilla.</li>
  <li><strong>Comida rápida y delivery:</strong> pizzas, hamburguesas y sándwiches con envío a domicilio.</li>
  <li><strong>Sushi y comida japonesa:</strong> opciones de rolls y temakis cada vez más populares.</li>
</ul>

<h2>¿Hacen delivery en Linares?</h2>
<p>Sí. Varios restaurantes en Linares ofrecen delivery directo por WhatsApp o teléfono, sin necesidad de apps intermediarias. En LinaresYa puedes ver qué negocios hacen entrega a domicilio y contactarlos directamente.</p>

<h2>¿Cómo encontrar un restaurante abierto ahora en Linares?</h2>
<p>En <a href="/gastronomia">LinaresYa — sección Gastronomía</a> puedes ver el horario de cada local y filtrar por los que están abiertos en este momento. Así no pierdes tiempo llamando a locales cerrados.</p>

<h2>Horarios habituales en Linares</h2>
<p>La mayoría de los restaurantes en Linares abren desde las 12:00 hasta las 15:00 para el almuerzo, y retoman desde las 19:00 para la cena. Los fines de semana suelen extender su horario hasta las 22:00 o 23:00.</p>

<p>¿Tenés un restaurante en Linares y querés aparecer gratis? <a href="/publicar">Registra tu negocio en LinaresYa</a> en menos de 5 minutos.</p>
`,
  },
  {
    slug: "gasfiter-linares",
    titulo: "Gasfíter en Linares: cómo encontrar uno de confianza",
    descripcion:
      "¿Necesitás un gasfíter en Linares? Te explicamos cómo encontrar un profesional de confianza, qué preguntar y cuánto cobran en la zona.",
    fecha: "2025-05-10",
    categoria: "Servicios",
    emoji: "🔧",
    keywords: ["gasfiter linares", "gasfíter linares", "plomero linares", "arreglo cañerías linares"],
    contenido: `
<p>Una cañería rota, una llave que gotea o una instalación de calefón: cuando necesitás un <strong>gasfíter en Linares</strong>, la urgencia no da tiempo para andar buscando. Acá te contamos cómo encontrar uno rápido y de confianza.</p>

<h2>¿Cómo encontrar un gasfíter de confianza en Linares?</h2>
<p>Lo más importante es confirmar que el profesional tenga experiencia en el tipo de trabajo que necesitás. Hay gasfíteres especializados en:</p>
<ul>
  <li>Instalación y reparación de calefones y termos</li>
  <li>Arreglo de cañerías y desatascado de cañerías</li>
  <li>Instalación de riego y sistemas de agua</li>
  <li>Gas natural y gas licuado (instalaciones y reparaciones)</li>
</ul>

<h2>¿Cuánto cobra un gasfíter en Linares?</h2>
<p>Los precios varían según el tipo de trabajo. Una visita básica para diagnosticar y arreglar una llave puede estar entre $15.000 y $30.000 pesos. Trabajos mayores como cambio de cañerías o instalación de calefón se cotizan aparte, generalmente entre $40.000 y $100.000 dependiendo del material y las horas.</p>

<h2>¿Hay gasfíteres de urgencia en Linares?</h2>
<p>Sí. Algunos gasfíteres en Linares atienden urgencias fuera de horario normal. En <a href="/servicios-y-oficios">LinaresYa — Servicios y Oficios</a> podés ver el horario de cada profesional y contactarlos directamente por WhatsApp o teléfono.</p>

<h2>Consejos antes de contratar</h2>
<ul>
  <li>Pedí un presupuesto antes de que empiece el trabajo</li>
  <li>Consultá si el precio incluye materiales o solo mano de obra</li>
  <li>Confirmá disponibilidad de horario para la urgencia</li>
</ul>

<p>¿Sos gasfíter en Linares y querés que los vecinos te encuentren? <a href="/publicar">Aparecé gratis en LinaresYa</a>.</p>
`,
  },
  {
    slug: "veterinarias-linares",
    titulo: "Veterinarias en Linares: atención para tu mascota",
    descripcion:
      "Listado y guía de veterinarias en Linares, Chile. Consultas, vacunas, cirugías y atención de urgencias para perros, gatos y más.",
    fecha: "2025-05-05",
    categoria: "Mascotas",
    emoji: "🐾",
    keywords: ["veterinaria linares", "veterinario linares", "clinica veterinaria linares", "vacunas mascotas linares"],
    contenido: `
<p>Tu mascota merece la mejor atención. Linares cuenta con varias <strong>veterinarias y clínicas veterinarias</strong> que atienden desde consultas de rutina hasta cirugías y urgencias. Acá te contamos todo lo que necesitás saber.</p>

<h2>¿Qué servicios ofrecen las veterinarias en Linares?</h2>
<p>La mayoría de las veterinarias en Linares ofrecen:</p>
<ul>
  <li><strong>Consultas generales</strong> para perros, gatos y animales pequeños</li>
  <li><strong>Vacunación</strong> y desparasitación</li>
  <li><strong>Cirugías</strong> (esterilización, castraciones, otras)</li>
  <li><strong>Radiografías y ecografías</strong></li>
  <li><strong>Peluquería canina</strong> y baños</li>
  <li><strong>Venta de alimentos</strong> y antiparasitarios</li>
</ul>

<h2>¿Hay veterinarias de urgencia en Linares?</h2>
<p>Algunos centros veterinarios en Linares tienen horario extendido o atención de urgencias. Te recomendamos tener el número guardado antes de que ocurra una emergencia. En <a href="/mascotas">LinaresYa — Mascotas</a> podés ver los horarios actualizados de cada veterinaria.</p>

<h2>¿Cuánto cuesta una consulta veterinaria en Linares?</h2>
<p>Una consulta básica ronda los $8.000 a $15.000 pesos. Las cirugías de esterilización pueden costar entre $40.000 y $80.000 dependiendo del peso del animal y el centro. Muchos lugares ofrecen paquetes de vacunación a precios especiales.</p>

<h2>Consejos para elegir veterinaria</h2>
<ul>
  <li>Verificá que tengan médico veterinario titulado en el local</li>
  <li>Consultá los horarios de atención antes de ir</li>
  <li>Preguntá si tienen ficha médica para hacer seguimiento de tu mascota</li>
</ul>

<p>¿Tenés una veterinaria en Linares? <a href="/publicar">Registrate gratis en LinaresYa</a> para que los dueños de mascotas te encuentren fácilmente.</p>
`,
  },
  {
    slug: "supermercados-almacenes-linares",
    titulo: "Supermercados y almacenes en Linares: horarios y ubicaciones",
    descripcion:
      "Guía de supermercados, minimarkets y almacenes en Linares, Chile. Horarios de atención, ubicaciones y qué encontrás en cada uno.",
    fecha: "2025-04-28",
    categoria: "Comercio",
    emoji: "🛒",
    keywords: ["supermercado linares", "almacen linares", "minimarket linares", "donde comprar linares"],
    contenido: `
<p>Desde el supermercado grande hasta el almacén del barrio, Linares tiene opciones para todas las compras del día a día. Acá te contamos qué encontrás y en qué horarios atienden.</p>

<h2>Opciones de compra en Linares</h2>
<p>En Linares podés encontrar:</p>
<ul>
  <li><strong>Supermercados grandes:</strong> con amplia variedad de productos, frutas, verduras, carnicería y productos de limpieza.</li>
  <li><strong>Minimarkets y botillerías:</strong> ideales para compras rápidas y productos de conveniencia.</li>
  <li><strong>Almacenes de barrio:</strong> atención personalizada, productos frescos y fiado para clientes conocidos.</li>
  <li><strong>Ferias y mercados:</strong> frutas y verduras frescas directamente del productor a mejor precio.</li>
</ul>

<h2>Horarios típicos en Linares</h2>
<p>Los supermercados suelen abrir de lunes a sábado de 09:00 a 21:00, y los domingos de 10:00 a 20:00. Los almacenes de barrio tienen horarios más variables, muchos abren desde las 08:00 y cierran al anochecer.</p>

<h2>¿Hacen delivery de supermercado en Linares?</h2>
<p>Algunos minimarkets y almacenes de Linares ofrecen delivery por WhatsApp para pedidos en el sector. Es una opción muy práctica para quienes no pueden salir o quieren ahorrar tiempo.</p>

<p>Encontrá los horarios actualizados de cada comercio en <a href="/comercio-y-tiendas">LinaresYa — Comercio y Tiendas</a>.</p>

<p>¿Tenés un almacén o minimarket? <a href="/publicar">Publicá gratis en LinaresYa</a> para que tus vecinos te encuentren.</p>
`,
  },
  {
    slug: "electricista-linares",
    titulo: "Electricista en Linares: instalaciones y urgencias",
    descripcion:
      "¿Necesitás un electricista en Linares? Guía para encontrar un profesional certificado para instalaciones, reparaciones y urgencias eléctricas.",
    fecha: "2025-04-20",
    categoria: "Servicios",
    emoji: "⚡",
    keywords: ["electricista linares", "electricista certificado linares", "instalacion electrica linares", "corte de luz linares"],
    contenido: `
<p>Desde una instalación nueva hasta un cortocircuito de urgencia, tener un <strong>electricista de confianza en Linares</strong> es esencial. Acá te explicamos cómo encontrar al profesional correcto.</p>

<h2>¿Qué hace un electricista en Linares?</h2>
<p>Los electricistas en Linares pueden ayudarte con:</p>
<ul>
  <li>Instalaciones eléctricas nuevas (casas, locales, oficinas)</li>
  <li>Ampliación de tableros eléctricos</li>
  <li>Reparación de enchufes, interruptores y luminarias</li>
  <li>Instalación de calefacción eléctrica</li>
  <li>Certificaciones eléctricas para arriendo o venta de propiedades</li>
  <li>Urgencias: cortocircuitos, cables pelados, sobrecargas</li>
</ul>

<h2>¿El electricista tiene que ser certificado?</h2>
<p>Para instalaciones que quedan registradas (como empalmes o instalaciones nuevas), la ley chilena exige que el electricista sea <strong>instalador autorizado por la SEC</strong>. Para trabajos menores de mantenimiento no siempre es obligatorio, pero se recomienda igual.</p>

<h2>¿Cuánto cobra un electricista en Linares?</h2>
<p>Una visita básica parte desde los $15.000 pesos más materiales. Instalaciones más complejas como nuevos tableros o ampliaciones se cotizan según el trabajo específico. Siempre pedí presupuesto antes.</p>

<h2>¿Hay electricistas de urgencia en Linares?</h2>
<p>Sí. Algunos electricistas en Linares atienden urgencias fuera de horario. En <a href="/servicios-y-oficios">LinaresYa — Servicios y Oficios</a> podés ver quién tiene disponibilidad y contactarlos directamente por WhatsApp.</p>

<p>¿Sos electricista en Linares? <a href="/publicar">Aparecé gratis en LinaresYa</a> y llegá a más clientes en tu zona.</p>
`,
  },
  // ── Artículos adicionales ──────────────────────────────────────────────
  {
    slug: "peluquerias-barberias-linares",
    titulo: "Peluquerías y barberías en Linares: dónde cortarte el pelo",
    descripcion:
      "Guía de las mejores peluquerías y barberías en Linares, Chile. Cortes, tinturas, barba y servicios de belleza para hombres y mujeres.",
    fecha: "2025-05-18",
    categoria: "Belleza",
    emoji: "✂️",
    keywords: [
      "peluqueria linares",
      "barberia linares",
      "corte de pelo linares",
      "tintura linares",
      "barbero linares",
    ],
    contenido: `
<p>Encontrar una buena <strong>peluquería o barbería en Linares</strong> ya no es cuestión de suerte. La ciudad tiene una oferta variada: desde salones de belleza completos hasta barberías especializadas en cortes masculinos y arreglo de barba.</p>

<h2>¿Qué servicios ofrecen las peluquerías en Linares?</h2>
<ul>
  <li><strong>Corte de pelo</strong> para hombres, mujeres y niños</li>
  <li><strong>Tinturas y decoloración</strong> con productos de calidad</li>
  <li><strong>Tratamientos capilares:</strong> keratina, botox capilar, hidratación</li>
  <li><strong>Peinados y rizos</strong> para eventos y matrimonios</li>
  <li><strong>Manicure y pedicure</strong> en salones de belleza</li>
</ul>

<h2>Barberías en Linares</h2>
<p>Las barberías clásicas están en auge en Linares. Ofrecen corte con tijera o máquina, arreglo de barba con navaja, y una experiencia más personalizada. Muchos barberos atienden con y sin reserva previa.</p>

<h2>¿Cuánto cuesta un corte de pelo en Linares?</h2>
<p>Un corte básico para hombres parte desde los $4.000 hasta $10.000 pesos. Para mujeres, el corte suele ir entre $8.000 y $20.000 según el largo y el servicio. Las tinturas y tratamientos se cotizan según el largo del cabello.</p>

<h2>¿Hay peluquerías con reserva online en Linares?</h2>
<p>Algunos salones de Linares aceptan reservas por WhatsApp, lo que te ahorra esperar. En <a href="/belleza-y-estetica">LinaresYa — Belleza y Estética</a> podés ver los horarios y contactar directamente por WhatsApp a cada local.</p>

<p>¿Tenés una peluquería o barbería en Linares? <a href="/publicar">Aparecé gratis en LinaresYa</a> y llegá a más clientes de tu barrio.</p>
`,
  },
  {
    slug: "medicos-clinicas-linares",
    titulo: "Médicos y clínicas en Linares: atención de salud privada",
    descripcion:
      "Guía de médicos, clínicas y centros de salud privados en Linares, Chile. Especialidades, horarios, urgencias y cómo sacar hora.",
    fecha: "2025-05-20",
    categoria: "Salud",
    emoji: "🏥",
    keywords: [
      "medico linares",
      "clinica linares",
      "urgencias linares",
      "especialista linares",
      "centro medico linares",
    ],
    contenido: `
<p>Linares cuenta con una red de <strong>médicos y clínicas privadas</strong> que complementan la atención del Hospital de Linares. Conocer las opciones disponibles te ayuda a atenderte más rápido y con el especialista que necesitás.</p>

<h2>Tipos de atención médica privada en Linares</h2>
<ul>
  <li><strong>Médicos de cabecera y medicina general</strong> para consultas de rutina y derivaciones</li>
  <li><strong>Especialistas:</strong> traumatología, ginecología, pediatría, cardiología y más</li>
  <li><strong>Centros de salud y policlínicos</strong> con atención de varios especialistas</li>
  <li><strong>Laboratorios clínicos</strong> para exámenes de sangre y análisis</li>
  <li><strong>Imagenología:</strong> ecografías, radiografías y escáner</li>
</ul>

<h2>¿Hay urgencias privadas en Linares?</h2>
<p>Sí. Algunas clínicas y centros médicos de Linares ofrecen atención de urgencias con horario extendido, sin necesidad de hacer fila en el hospital público. Es una opción útil para consultas que no pueden esperar.</p>

<h2>¿Cómo sacar hora médica en Linares?</h2>
<p>La mayoría de los médicos y clínicas privadas de Linares reciben horas por teléfono o WhatsApp. Algunos centros también tienen agenda online. En <a href="/salud">LinaresYa — Salud</a> encontrás el contacto directo de cada centro médico.</p>

<h2>¿Cuánto cuesta una consulta médica privada en Linares?</h2>
<p>Una consulta de medicina general oscila entre $15.000 y $30.000 pesos. Los especialistas pueden ir desde $25.000 hasta $60.000 o más, dependiendo de la especialidad. La mayoría acepta Fonasa e Isapres para reembolso.</p>

<p>¿Sos médico o tenés un centro de salud en Linares? <a href="/publicar">Aparecé gratis en LinaresYa</a>.</p>
`,
  },
  {
    slug: "dentistas-linares",
    titulo: "Dentistas en Linares: clínicas dentales y precios",
    descripcion:
      "Guía de dentistas y clínicas dentales en Linares, Chile. Limpiezas, ortodoncia, implantes, urgencias dentales y precios aproximados.",
    fecha: "2025-05-12",
    categoria: "Salud",
    emoji: "🦷",
    keywords: [
      "dentista linares",
      "odontologo linares",
      "clinica dental linares",
      "ortodoncia linares",
      "urgencia dental linares",
    ],
    contenido: `
<p>Cuidar la salud bucal es fundamental, y Linares tiene varias opciones de <strong>dentistas y clínicas odontológicas</strong> para todas las edades. Desde una limpieza de rutina hasta implantes y ortodoncia.</p>

<h2>Servicios odontológicos disponibles en Linares</h2>
<ul>
  <li><strong>Limpieza y profilaxis dental</strong> (destartaje)</li>
  <li><strong>Ortodoncia:</strong> brackets metálicos, cerámicos y alineadores transparentes</li>
  <li><strong>Implantes dentales</strong> y prótesis</li>
  <li><strong>Blanqueamiento dental</strong> profesional</li>
  <li><strong>Extracciones y cirugía oral</strong></li>
  <li><strong>Endodoncia</strong> (tratamiento de conducto)</li>
  <li><strong>Urgencias dentales:</strong> dolor, abscesos, fractura de diente</li>
</ul>

<h2>¿Cuánto cuesta ir al dentista en Linares?</h2>
<p>Un destartaje (limpieza) parte desde los $15.000 pesos. Una extracción simple ronda los $20.000 a $35.000. La ortodoncia varía bastante según el tipo: los brackets metálicos pueden partir desde $400.000 el tratamiento completo. Los implantes van desde $350.000 por pieza.</p>

<h2>¿Hay dentistas de urgencia en Linares?</h2>
<p>Algunos odontólogos en Linares atienden urgencias fuera de horario o con turnos extra. Si tenés un dolor dental fuerte o una fractura, contactá directamente al dentista por WhatsApp para ver disponibilidad. En <a href="/salud">LinaresYa — Salud</a> encontrás dentistas con horario actualizado.</p>

<h2>Fonasa en dentistas privados de Linares</h2>
<p>Varios dentistas de Linares trabajan con Fonasa libre elección, lo que permite recuperar parte del costo de la consulta. Consultá directamente con el profesional si trabaja con tu previsión.</p>

<p>¿Sos dentista u odontólogo en Linares? <a href="/publicar">Publicá tu consulta gratis en LinaresYa</a>.</p>
`,
  },
  {
    slug: "taxi-flete-transporte-linares",
    titulo: "Taxi, fletes y transporte en Linares: cómo movilizarte",
    descripcion:
      "Guía de servicios de taxi, fletes, movilización y transporte en Linares, Chile. Precios, radiotaxis, buses y cómo contactarlos.",
    fecha: "2025-04-15",
    categoria: "Transporte",
    emoji: "🚕",
    keywords: [
      "taxi linares",
      "flete linares",
      "radiotaxi linares",
      "transporte linares",
      "movilizacion linares",
    ],
    contenido: `
<p>Movilizarse dentro de Linares y hacia otras ciudades es fácil si sabés qué opciones hay disponibles. Desde <strong>radiotaxis</strong> hasta <strong>fletes para mudanzas</strong>, acá te explicamos todo.</p>

<h2>Opciones de transporte en Linares</h2>
<ul>
  <li><strong>Radiotaxis:</strong> la opción más rápida para desplazarte dentro de la ciudad. Muchos tienen WhatsApp para pedir el servicio.</li>
  <li><strong>Taxis convencionales:</strong> disponibles en la ciudad y en la Terminal de Buses.</li>
  <li><strong>Buses interurbanos:</strong> desde el Terminal de Buses de Linares a Talca, Santiago, Chillán y otras ciudades.</li>
  <li><strong>Fletes y mudanzas:</strong> para mover muebles, electrodomésticos o carga en general dentro o fuera de Linares.</li>
  <li><strong>Servicio de movilización escolar:</strong> transporte de niños en furgones autorizados.</li>
</ul>

<h2>¿Cuánto cobra un taxi en Linares?</h2>
<p>Las carreras dentro de Linares suelen estar entre $2.500 y $5.000 pesos dependiendo de la distancia. Los radiotaxis pueden tener tarifa fija por sectores. Para viajes fuera de la ciudad se acuerda precio antes de subir.</p>

<h2>¿Cómo pedir un flete en Linares?</h2>
<p>La mayoría de los fleteros en Linares trabajan por WhatsApp o teléfono. Descripción del trabajo, tamaño de lo que se mueve y distancia son los datos que necesitan para cotizar. En <a href="/servicios-y-oficios">LinaresYa — Servicios y Oficios</a> podés encontrar fleteros disponibles en tu sector.</p>

<h2>¿Hay app de taxi en Linares?</h2>
<p>Por el momento Linares no tiene cobertura consolidada de apps como Uber o Cabify. El sistema de radiotaxis por WhatsApp sigue siendo la opción más usada y confiable en la ciudad.</p>

<p>¿Tenés un servicio de taxi o flete en Linares? <a href="/publicar">Registrate gratis en LinaresYa</a>.</p>
`,
  },
  {
    slug: "ferreterias-materiales-construccion-linares",
    titulo: "Ferreterías y materiales de construcción en Linares",
    descripcion:
      "Guía de ferreterías y proveedores de materiales de construcción en Linares, Chile. Precios, horarios y qué encontrás en cada una.",
    fecha: "2025-04-10",
    categoria: "Construcción",
    emoji: "🔨",
    keywords: [
      "ferreteria linares",
      "materiales construccion linares",
      "pintura linares",
      "herramientas linares",
      "cemento linares",
    ],
    contenido: `
<p>Ya sea para un arreglo pequeño en casa o una construcción mayor, Linares tiene <strong>ferreterías y distribuidores de materiales</strong> que cubren desde el tornillo hasta el cemento a granel.</p>

<h2>¿Qué encontrás en las ferreterías de Linares?</h2>
<ul>
  <li><strong>Herramientas</strong> manuales y eléctricas (taladros, sierras, llaves)</li>
  <li><strong>Materiales de construcción:</strong> cemento, áridos, bloques, ladrillos</li>
  <li><strong>Pinturas y barnices</strong> para interior y exterior</li>
  <li><strong>Plomería:</strong> cañerías PVC, fitting, llaves de paso</li>
  <li><strong>Electricidad:</strong> cables, enchufes, tableros, luminarias</li>
  <li><strong>Maderas y terciados</strong> para estructuras y terminaciones</li>
  <li><strong>Artículos de ferretería:</strong> tornillos, pernos, bisagras, cerraduras</li>
</ul>

<h2>¿Hacen delivery de materiales en Linares?</h2>
<p>Varias ferreterías y distribuidoras de materiales en Linares ofrecen reparto a domicilio, especialmente para compras de mayor volumen como sacos de cemento, áridos y maderas. Consultá directamente con el local.</p>

<h2>Horarios de ferreterías en Linares</h2>
<p>La mayoría de las ferreterías de Linares atienden de lunes a viernes de 09:00 a 13:00 y de 15:00 a 19:00, y los sábados de 09:00 a 13:00. Algunas tienen horario corrido. En <a href="/construccion-y-materiales">LinaresYa — Construcción</a> podés ver el horario actualizado de cada local.</p>

<h2>Consejos para comprar en ferretería</h2>
<ul>
  <li>Llevá las medidas exactas de lo que necesitás antes de ir</li>
  <li>Pedí factura si es para una obra o negocio (recuperás el IVA)</li>
  <li>Preguntá si tienen servicio técnico o instalación para el producto</li>
</ul>

<p>¿Tenés una ferretería o distribuidora de materiales en Linares? <a href="/publicar">Aparecé gratis en LinaresYa</a>.</p>
`,
  },
];

// Helpers
export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRecentPosts(limit = 4): BlogPost[] {
  return [...posts]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, limit);
}
