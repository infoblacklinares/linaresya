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
  // ── Artículos batch 3 ──────────────────────────────────────────────────
  {
    slug: "taller-mecanico-linares",
    titulo: "Taller mecánico en Linares: dónde arreglar tu auto",
    descripcion:
      "Guía de talleres mecánicos en Linares, Chile. Mantenciones, frenos, suspensión, revisión técnica y mecánica general. Precios y cómo elegir bien.",
    fecha: "2025-05-21",
    categoria: "Automotriz",
    emoji: "🔧",
    keywords: [
      "taller mecanico linares",
      "mecanico linares",
      "revision tecnica linares",
      "arreglar auto linares",
      "mantención vehiculo linares",
    ],
    contenido: `
<p>Cuando el auto falla, lo último que querés es perder tiempo buscando. En Linares hay varios <strong>talleres mecánicos</strong> para mantenciones de rutina, reparaciones urgentes y revisión técnica. Acá te explicamos cómo elegir bien.</p>

<h2>Tipos de talleres mecánicos en Linares</h2>
<ul>
  <li><strong>Talleres generales:</strong> atienden todo tipo de vehículos y marcas. Ideal para reparaciones comunes.</li>
  <li><strong>Talleres especializados por marca:</strong> mecánicos con certificación o experiencia en marcas específicas (Toyota, Chevrolet, Kia, etc.).</li>
  <li><strong>Vulcanizaciones:</strong> arreglo de neumáticos, pinchazos y balanceo.</li>
  <li><strong>Talleres de hojalatería y pintura:</strong> para abolladuras, rayones y repintado.</li>
</ul>

<h2>¿Qué servicios ofrecen los talleres en Linares?</h2>
<ul>
  <li>Cambio de aceite y filtros (mantención básica)</li>
  <li>Frenos: pastillas, discos y líquido de frenos</li>
  <li>Suspensión, amortiguadores y dirección</li>
  <li>Revisión de motor y diagnóstico computarizado</li>
  <li>Embrague, caja de cambios y transmisión</li>
  <li>Electricidad del vehículo: batería, alternador, arranque</li>
  <li>Preparación para Revisión Técnica (CITV)</li>
</ul>

<h2>¿Cuánto cuesta una mantención en Linares?</h2>
<p>Un cambio de aceite con filtro parte desde $15.000 pesos dependiendo del tipo de aceite y el vehículo. La revisión técnica (CITV) en Linares cuesta alrededor de $15.000 a $20.000. Para reparaciones mayores como cambio de embrague o frenos completos, los precios varían según el modelo del auto y los repuestos.</p>

<h2>Consejos antes de llevar el auto al taller</h2>
<ul>
  <li>Pedí presupuesto antes de aprobar cualquier trabajo</li>
  <li>Consultá si incluye mano de obra y repuestos o es por separado</li>
  <li>Pedí que te muestren las piezas cambiadas cuando terminen</li>
  <li>Si es urgencia, llamá antes para ver disponibilidad del día</li>
</ul>

<p>Encontrá talleres mecánicos en Linares con horarios actualizados en <a href="/automotriz">LinaresYa — Automotriz</a>. ¿Tenés un taller? <a href="/publicar">Publicalo gratis</a>.</p>
`,
  },
  {
    slug: "cerrajero-linares",
    titulo: "Cerrajero en Linares: urgencias y cambio de cerraduras",
    descripcion:
      "¿Necesitás un cerrajero en Linares? Guía para emergencias (llave perdida, puerta trabada), cambio de cerraduras y duplicado de llaves. Precios y tips.",
    fecha: "2025-05-21",
    categoria: "Servicios",
    emoji: "🔑",
    keywords: [
      "cerrajero linares",
      "cerrajeria linares",
      "llave perdida linares",
      "cambio cerradura linares",
      "duplicado llave linares",
    ],
    contenido: `
<p>Quedarte sin llaves o con una puerta trabada es una de las situaciones más estresantes del día. Tener el número de un <strong>cerrajero de confianza en Linares</strong> puede ahorrarte horas de espera y problemas innecesarios.</p>

<h2>¿Qué hace un cerrajero en Linares?</h2>
<ul>
  <li><strong>Apertura de emergencia:</strong> puerta trabada, llave perdida, cerradura rota</li>
  <li><strong>Cambio de cerraduras:</strong> instalación de cerraduras nuevas o de mayor seguridad</li>
  <li><strong>Duplicado de llaves:</strong> copias de llaves simples, de seguridad y de auto</li>
  <li><strong>Instalación de cerrojo y pasadores</strong></li>
  <li><strong>Cajas fuertes:</strong> apertura y cambio de combinación</li>
  <li><strong>Cerraduras eléctricas y portones automáticos</strong></li>
</ul>

<h2>¿Hay cerrajeros de urgencia en Linares?</h2>
<p>Sí. Algunos cerrajeros en Linares atienden urgencias fuera de horario. Si te quedaste afuera de tu casa o auto de noche, contactá directamente por WhatsApp o teléfono para ver disponibilidad inmediata. En <a href="/servicios-y-oficios">LinaresYa — Servicios</a> podés ver quién tiene atención de urgencia.</p>

<h2>¿Cuánto cobra un cerrajero en Linares?</h2>
<p>Una apertura de emergencia en horario normal parte desde los $20.000 a $40.000 pesos dependiendo del tipo de cerradura. Fuera de horario o fines de semana puede tener un recargo. El duplicado de una llave simple cuesta entre $2.000 y $5.000. Para llaves de auto con chip, el costo es mayor.</p>

<h2>Cómo evitar llamar al cerrajero de urgencia</h2>
<ul>
  <li>Guardá siempre una copia de la llave en casa de un familiar de confianza</li>
  <li>Revisa que la cerradura funcione bien antes de salir</li>
  <li>Ten el número de un cerrajero guardado antes de necesitarlo</li>
</ul>

<p>¿Sos cerrajero en Linares? <a href="/publicar">Publicá tu servicio gratis en LinaresYa</a> y llegá a los vecinos que te necesitan.</p>
`,
  },
  {
    slug: "clases-particulares-linares",
    titulo: "Clases particulares en Linares: refuerzo escolar y más",
    descripcion:
      "Guía de profesores y clases particulares en Linares, Chile. Refuerzo escolar, matemáticas, inglés, PSU/PAES y clases para adultos. Cómo encontrar al profe ideal.",
    fecha: "2025-05-21",
    categoria: "Educación",
    emoji: "📚",
    keywords: [
      "clases particulares linares",
      "profesor particular linares",
      "refuerzo escolar linares",
      "clases matematicas linares",
      "clases ingles linares",
    ],
    contenido: `
<p>Ya sea para reforzar matemáticas, prepararse para la PAES o aprender inglés desde cero, Linares tiene profesores y centros de <strong>clases particulares</strong> para todas las edades y necesidades.</p>

<h2>¿Qué tipos de clases particulares hay en Linares?</h2>
<ul>
  <li><strong>Refuerzo escolar básico y medio:</strong> matemáticas, lenguaje, ciencias e historia</li>
  <li><strong>Preparación PAES:</strong> clases focalizadas para rendir bien en la prueba de admisión universitaria</li>
  <li><strong>Inglés:</strong> desde nivel básico hasta conversacional y business English</li>
  <li><strong>Clases para adultos:</strong> nivelación, computación básica, office</li>
  <li><strong>Música:</strong> guitarra, piano, canto</li>
  <li><strong>Artes y manualidades</strong></li>
</ul>

<h2>¿Clases presenciales o online en Linares?</h2>
<p>Muchos profesores en Linares ofrecen ambas modalidades. Las clases presenciales en el domicilio del alumno o del profesor son muy comunes. Las clases online por Zoom o Meet son útiles cuando hay poca disponibilidad de horario.</p>

<h2>¿Cuánto cuestan las clases particulares en Linares?</h2>
<p>Una hora de clases particulares en Linares varía entre $8.000 y $20.000 pesos dependiendo del nivel, la materia y la experiencia del profesor. Las clases de PAES y preparación universitaria suelen ser más caras por la especialización requerida.</p>

<h2>¿Cómo elegir un buen profesor particular?</h2>
<ul>
  <li>Pedí referencias o reseñas de otros alumnos</li>
  <li>Hacé una clase de prueba antes de comprometerte</li>
  <li>Preguntá por la metodología de enseñanza</li>
  <li>Confirmá que el horario sea compatible con las actividades del alumno</li>
</ul>

<p>Encontrá profesores y centros de clases particulares en <a href="/educacion">LinaresYa — Educación</a>. ¿Dás clases particulares en Linares? <a href="/publicar">Aparecé gratis en el directorio</a>.</p>
`,
  },
  {
    slug: "maestro-constructor-linares",
    titulo: "Maestro constructor en Linares: ampliaciones y remodelaciones",
    descripcion:
      "¿Buscás un maestro constructor en Linares? Guía para contratar albañiles, maestros y empresas constructoras para ampliaciones, remodelaciones y obra nueva.",
    fecha: "2025-05-21",
    categoria: "Construcción",
    emoji: "🏗️",
    keywords: [
      "maestro constructor linares",
      "albanil linares",
      "remodelacion linares",
      "ampliacion casa linares",
      "construccion linares",
    ],
    contenido: `
<p>Ampliar la casa, remodelar el baño o construir desde cero: en Linares hay <strong>maestros constructores y albañiles</strong> con experiencia en todo tipo de obras. Acá te explicamos cómo encontrar al profesional correcto y qué preguntar antes de contratar.</p>

<h2>¿Qué tipo de obras hacen los maestros constructores en Linares?</h2>
<ul>
  <li><strong>Ampliaciones:</strong> habitaciones extra, segunda planta, garage</li>
  <li><strong>Remodelaciones:</strong> cocinas, baños, pisos, cielos y tabiques</li>
  <li><strong>Construcción de obra nueva:</strong> casas, bodegas, galpones</li>
  <li><strong>Terminaciones:</strong> estuco, pintura, cerámicas y revestimientos</li>
  <li><strong>Reparaciones:</strong> filtraciones, grietas, techos y canaletas</li>
  <li><strong>Construcción en seco:</strong> Superboard, Volcanita, estructuras metálicas</li>
</ul>

<h2>¿Cuánto cuesta una ampliación en Linares?</h2>
<p>El costo de construcción en Linares parte aproximadamente desde $350.000 a $600.000 pesos por metro cuadrado, dependiendo de los materiales, el tipo de construcción y los terminados. Para remodelaciones de baño o cocina, los precios varían mucho según el alcance del trabajo y los materiales elegidos.</p>

<h2>¿Qué preguntar antes de contratar un maestro?</h2>
<ul>
  <li>¿Tiene experiencia en el tipo de obra que necesitás?</li>
  <li>¿Puede mostrar trabajos anteriores o referencias?</li>
  <li>¿El presupuesto incluye materiales o solo mano de obra?</li>
  <li>¿Cuánto tiempo tarda la obra? ¿Trabaja solo o con equipo?</li>
  <li>¿Emite boleta o factura?</li>
</ul>

<h2>¿Necesito permiso de construcción en Linares?</h2>
<p>Para ampliaciones mayores de 25 m² y obra nueva generalmente se requiere permiso de edificación en la Municipalidad de Linares. Consultá con el maestro si tiene experiencia gestionando permisos o si necesitás un arquitecto.</p>

<p>Encontrá maestros constructores en <a href="/construccion-y-materiales">LinaresYa — Construcción</a>. ¿Sos maestro constructor en Linares? <a href="/publicar">Registrate gratis</a>.</p>
`,
  },
  {
    slug: "psicologo-linares",
    titulo: "Psicólogo en Linares: salud mental y bienestar",
    descripcion:
      "Guía de psicólogos y centros de salud mental en Linares, Chile. Atención individual, de pareja y familiar. Precios, modalidades y cómo sacar hora.",
    fecha: "2025-05-21",
    categoria: "Salud",
    emoji: "🧠",
    keywords: [
      "psicologo linares",
      "salud mental linares",
      "terapeuta linares",
      "ansiedad depresion linares",
      "consulta psicologica linares",
    ],
    contenido: `
<p>Cuidar la salud mental es tan importante como cuidar el cuerpo. En Linares hay <strong>psicólogos y profesionales de salud mental</strong> que atienden de forma presencial y online, para personas de todas las edades.</p>

<h2>¿Qué tipo de atención ofrecen los psicólogos en Linares?</h2>
<ul>
  <li><strong>Psicoterapia individual:</strong> ansiedad, depresión, autoestima, duelo, estrés y más</li>
  <li><strong>Terapia de pareja:</strong> comunicación, conflictos y crisis de relación</li>
  <li><strong>Psicología infantil y adolescente:</strong> conducta, aprendizaje y emociones</li>
  <li><strong>Terapia familiar:</strong> dinámica familiar, límites y crisis</li>
  <li><strong>Orientación vocacional:</strong> para jóvenes en etapa de elección de carrera</li>
  <li><strong>Atención online:</strong> sesiones por videollamada, muy útil si tenés poco tiempo</li>
</ul>

<h2>¿Cuánto cuesta una consulta psicológica en Linares?</h2>
<p>Una sesión de psicoterapia en Linares oscila entre $20.000 y $50.000 pesos dependiendo del profesional y la modalidad. Algunos psicólogos trabajan con Fonasa libre elección, lo que permite recuperar parte del costo. Preguntá directamente al profesional si trabaja con tu previsión.</p>

<h2>¿Hay psicólogos que atienden online en Linares?</h2>
<p>Sí. La atención online se consolidó mucho y muchos psicólogos de Linares ofrecen sesiones por Zoom, Meet o videollamada de WhatsApp. Es una opción cómoda especialmente si trabajás de día o si preferís la privacidad de tu hogar.</p>

<h2>¿Cuándo buscar ayuda psicológica?</h2>
<p>No es necesario estar en crisis para ir al psicólogo. Algunas razones comunes para buscar apoyo:</p>
<ul>
  <li>Tristeza, ansiedad o preocupación persistente</li>
  <li>Dificultades en las relaciones personales o de pareja</li>
  <li>Problemas de sueño, concentración o motivación</li>
  <li>Duelo por pérdida de un ser querido</li>
  <li>Situaciones de estrés laboral o familiar sostenido</li>
</ul>

<p>Encontrá psicólogos en Linares en <a href="/salud">LinaresYa — Salud</a>. ¿Sos psicólogo o terapeuta en Linares? <a href="/publicar">Aparecé gratis en el directorio</a>.</p>
`,
  },
  // ── Artículos batch 4 ──────────────────────────────────────────────────
  {
    slug: "electricista-linares",
    titulo: "Electricista en Linares: instalaciones, fallas y emergencias",
    descripcion:
      "Guía para encontrar un electricista de confianza en Linares. Instalaciones eléctricas, cortes de luz, tableros y urgencias. Qué preguntar y cómo evitar estafas.",
    fecha: "2025-05-21",
    categoria: "Servicios del hogar",
    emoji: "⚡",
    keywords: [
      "electricista linares",
      "electricista linares chile",
      "instalacion electrica linares",
      "emergencia electrica linares",
      "corte de luz linares",
    ],
    contenido: `
<p>Cuando hay una falla eléctrica en casa o en el trabajo, encontrar un <strong>electricista de confianza en Linares</strong> rápido puede marcar la diferencia. Acá te contamos qué trabajos hacen, cuánto cobran y cómo elegir bien.</p>

<h2>¿Qué trabajos hace un electricista en Linares?</h2>
<ul>
  <li><strong>Instalaciones eléctricas nuevas:</strong> enchufes, interruptores, puntos de luz, tableros.</li>
  <li><strong>Reparaciones y fallas:</strong> cortos circuitos, cables quemados, disyuntores que saltan.</li>
  <li><strong>Tableros eléctricos:</strong> cambio de caja de medidor, diferencial, termomagnéticos.</li>
  <li><strong>Proyectos de ampliación:</strong> instalación para cocina eléctrica, calefont, climatizador.</li>
  <li><strong>Urgencias:</strong> muchos atienden fines de semana y en horario nocturno.</li>
</ul>

<h2>¿Cuánto cobra un electricista en Linares?</h2>
<ul>
  <li>Visita diagnóstico: $10.000 – $20.000</li>
  <li>Cambio de enchufe o interruptor: $15.000 – $30.000</li>
  <li>Revisión de tablero: $20.000 – $50.000</li>
  <li>Instalación completa (pieza): desde $60.000</li>
</ul>

<h2>¿Cómo elegir un buen electricista?</h2>
<ul>
  <li>Verificá que tenga experiencia con el tipo de trabajo que necesitás</li>
  <li>Pedí un presupuesto escrito antes de empezar</li>
  <li>Revisá reseñas de otros clientes en LinaresYa</li>
  <li>Preguntá si tiene garantía en los materiales instalados</li>
</ul>

<h2>¿Cuándo llamar a un electricista de urgencia?</h2>
<p>Si hay chispas, olor a quemado, humedad en el tablero o un corte que no podés restablecer, <strong>no intentes resolverlo solo</strong>. Contactá a un electricista de inmediato — un accidente eléctrico puede causar un incendio.</p>

<p>Encontrá electricistas en Linares en <a href="/servicios-del-hogar">LinaresYa — Servicios del Hogar</a>. ¿Sos electricista en Linares? <a href="/publicar">Aparecé gratis en el directorio</a>.</p>
`,
  },
  {
    slug: "abogado-linares",
    titulo: "Abogado en Linares: dónde conseguir asesoría legal",
    descripcion:
      "Guía para encontrar abogado en Linares, Chile. Derecho laboral, familia, penal, civil, notaría y más. Diferencias entre abogado, notario y el CAJ.",
    fecha: "2025-05-21",
    categoria: "Servicios Legales",
    emoji: "⚖️",
    keywords: [
      "abogado linares",
      "abogado linares chile",
      "asesoría legal linares",
      "notaria linares",
      "corporacion asistencia judicial linares",
    ],
    contenido: `
<p>Hay momentos en la vida donde necesitás sí o sí un <strong>abogado en Linares</strong>: un despido injustificado, una separación, un problema con un arrendatario, o simplemente para revisar un contrato. Acá te explicamos qué tipo de abogado necesitás según tu caso.</p>

<h2>Tipos de abogados en Linares</h2>
<ul>
  <li><strong>Derecho Laboral:</strong> despidos, liquidaciones, accidentes del trabajo, demandas al empleador.</li>
  <li><strong>Derecho de Familia:</strong> divorcio, alimentos, tuición, visitas, adopción.</li>
  <li><strong>Derecho Civil:</strong> contratos, arrendamiento, deudas, sucesiones y herencias.</li>
  <li><strong>Derecho Penal:</strong> defensa en juicios, denuncias, causas penales.</li>
  <li><strong>Derecho Inmobiliario:</strong> compraventa de propiedades, escrituras, títulos.</li>
</ul>

<h2>¿Hay asesoría legal gratuita en Linares?</h2>
<p>Sí. La <strong>Corporación de Asistencia Judicial (CAJ) del Maule</strong> tiene una oficina en Linares que atiende a personas de escasos recursos sin cobrar honorarios.</p>

<h2>¿En qué se diferencia un abogado de un notario?</h2>
<p>El <strong>notario</strong> da fe pública de actos y contratos (firmas, declaraciones, escrituras). El <strong>abogado</strong> te representa, te asesora y litiga por vos. Para comprar una propiedad necesitás ambos.</p>

<h2>Consejos al contratar un abogado en Linares</h2>
<ul>
  <li>Preguntá cuánto cobra: por hora, por el caso completo o mixto</li>
  <li>Consultá su especialidad — no todos los abogados conocen igual todas las áreas</li>
  <li>Pedí una primera consulta (muchos la dan gratis o a bajo costo)</li>
  <li>Asegurate de firmar un contrato de honorarios antes de empezar</li>
</ul>

<p>Encontrá abogados y estudios jurídicos en Linares en <a href="/servicios-profesionales">LinaresYa — Servicios Profesionales</a>. ¿Sos abogado en Linares? <a href="/publicar">Registrá tu estudio gratis</a>.</p>
`,
  },
  {
    slug: "contador-tributario-linares",
    titulo: "Contador y asesor tributario en Linares: quién te puede ayudar",
    descripcion:
      "¿Buscás un contador o asesor tributario en Linares? Guía sobre declaración de renta, inicio de actividades, IVA y contabilidad para pymes y trabajadores independientes.",
    fecha: "2025-05-21",
    categoria: "Servicios Profesionales",
    emoji: "📊",
    keywords: [
      "contador linares",
      "contador tributario linares",
      "asesor tributario linares",
      "declaracion renta linares",
      "contabilidad pyme linares",
    ],
    contenido: `
<p>Si sos trabajador independiente, emprendedor o dueño de una pyme en Linares, en algún momento vas a necesitar ayuda con el <strong>SII, el IVA o la declaración de renta</strong>. Un buen contador puede ahorrarte multas, tiempo y dolores de cabeza.</p>

<h2>¿Cuándo necesitás un contador en Linares?</h2>
<ul>
  <li><strong>Inicio de actividades:</strong> cuando empezás a trabajar de forma independiente o abrís un negocio.</li>
  <li><strong>Declaración de renta:</strong> si tenés ingresos de segunda categoría o boletas de honorarios.</li>
  <li><strong>IVA mensual:</strong> si vendés productos o servicios afectos a IVA (F29).</li>
  <li><strong>Contabilidad de empresa:</strong> balances, estados de resultado, cierre anual.</li>
</ul>

<h2>¿Cuánto cobra un contador en Linares?</h2>
<ul>
  <li>Declaración de renta persona natural: $20.000 – $60.000</li>
  <li>F29 mensual para pyme pequeña: $30.000 – $80.000/mes</li>
  <li>Contabilidad completa para empresa: desde $80.000/mes</li>
  <li>Inicio de actividades: $20.000 – $40.000</li>
</ul>

<h2>Tips para elegir bien</h2>
<ul>
  <li>Buscá alguien con experiencia en tu rubro (gastronomía, construcción, comercio, etc.)</li>
  <li>Confirmá que esté al día con los cambios de la ley tributaria</li>
  <li>Las reseñas de otros clientes hablan mucho de la calidad del servicio</li>
</ul>

<p>Encontrá contadores en Linares en <a href="/servicios-profesionales">LinaresYa — Servicios Profesionales</a>. ¿Sos contador en Linares? <a href="/publicar">Aparecé gratis en el directorio</a>.</p>
`,
  },
  {
    slug: "fotografo-linares",
    titulo: "Fotógrafo en Linares: bodas, 15 años, familia y eventos",
    descripcion:
      "Guía para encontrar fotógrafo en Linares, Chile. Fotografía de matrimonio, quinceañeros, bautizos, eventos corporativos y sesiones de retrato. Precios y consejos.",
    fecha: "2025-05-21",
    categoria: "Arte y Fotografía",
    emoji: "📸",
    keywords: [
      "fotografo linares",
      "fotografo matrimonio linares",
      "fotografo 15 años linares",
      "sesion de fotos linares",
      "fotografia eventos linares",
    ],
    contenido: `
<p>Para los momentos que merecen recordarse toda la vida, necesitás un buen <strong>fotógrafo en Linares</strong>. Bodas, quinceañeros, bautizos, cumpleaños especiales, sesiones de familia o eventos corporativos: hay talento local para todo.</p>

<h2>¿Qué tipo de fotografía ofrecen en Linares?</h2>
<ul>
  <li><strong>Fotografía de matrimonio:</strong> cobertura completa del día, desde la preparación hasta el baile.</li>
  <li><strong>Quinceañeros:</strong> sesión de estudio, locación exterior o combinada.</li>
  <li><strong>Familia y retrato:</strong> sesiones en estudio o en lugares con historia para la familia.</li>
  <li><strong>Eventos y corporativo:</strong> lanzamientos, cenas de empresa, conferencias, inauguraciones.</li>
  <li><strong>Recién nacidos y bautizos:</strong> sesiones especializadas con props y ambientación.</li>
</ul>

<h2>¿Cuánto cobra un fotógrafo en Linares?</h2>
<ul>
  <li>Sesión familiar (1-2 horas): $50.000 – $120.000</li>
  <li>Quinceañero completo: $150.000 – $350.000</li>
  <li>Matrimonio (día completo): $400.000 – $800.000+</li>
  <li>Evento corporativo (4 horas): $100.000 – $200.000</li>
</ul>

<h2>¿Qué preguntar antes de contratar?</h2>
<ul>
  <li>¿Cuántas fotos editadas entrega y en cuánto tiempo?</li>
  <li>¿Incluye álbum impreso o solo entrega digital?</li>
  <li>¿Cobra por traslado si el evento es fuera de Linares?</li>
  <li>¿Cuál es la política de reserva y anticipo?</li>
</ul>

<h2>Tip: reservá con anticipación</h2>
<p>Los buenos fotógrafos de Linares tienen agenda ocupada, especialmente en la temporada de matrimonios (octubre a marzo). Reservar con 3 a 6 meses de antelación es lo ideal.</p>

<p>Encontrá fotógrafos en Linares en <a href="/arte-y-fotografia">LinaresYa — Arte y Fotografía</a>. ¿Sos fotógrafo en Linares? <a href="/publicar">Mostrá tu trabajo en el directorio gratis</a>.</p>
`,
  },
  {
    slug: "jardinero-linares",
    titulo: "Jardinero en Linares: mantención, poda y diseño de jardines",
    descripcion:
      "Encuentra jardineros en Linares, Chile. Mantención de jardines, poda de árboles, corte de pasto, riego y diseño paisajístico para casas y condominios.",
    fecha: "2025-05-21",
    categoria: "Jardín y Paisajismo",
    emoji: "🌿",
    keywords: [
      "jardinero linares",
      "poda arboles linares",
      "corte de pasto linares",
      "mantención jardín linares",
      "paisajismo linares",
    ],
    contenido: `
<p>Un jardín bien cuidado mejora el aspecto de la casa y la calidad de vida. En Linares hay <strong>jardineros y paisajistas</strong> para todo tipo de necesidades, desde el corte de pasto semanal hasta el diseño completo de un jardín.</p>

<h2>¿Qué servicios ofrece un jardinero en Linares?</h2>
<ul>
  <li><strong>Corte de pasto:</strong> el servicio más solicitado, ideal para mantener el césped prolijo.</li>
  <li><strong>Poda de árboles y arbustos:</strong> poda de formación, sanitaria o de fructificación.</li>
  <li><strong>Mantención periódica:</strong> visitas semanales, quincenales o mensuales.</li>
  <li><strong>Diseño de jardines:</strong> proyecto completo con selección de plantas y sistemas de riego.</li>
  <li><strong>Limpieza y desmalezado:</strong> especialmente útil después del invierno.</li>
</ul>

<h2>¿Cuánto cobra un jardinero en Linares?</h2>
<ul>
  <li>Corte de pasto (jardín pequeño): $15.000 – $30.000</li>
  <li>Mantención mensual completa: $30.000 – $80.000</li>
  <li>Poda de árbol mediano: $25.000 – $60.000</li>
  <li>Diseño y habilitación de jardín nuevo: desde $200.000</li>
</ul>

<h2>¿Qué plantas se adaptan bien a Linares?</h2>
<p>El clima de Linares (templado mediterráneo, con heladas en invierno) favorece plantas como lavanda, romero, agapantos, copihues, plátanos orientales y frutales como higueras y ciruelos. Un jardinero local conoce qué especies prosperan mejor en la zona.</p>

<p>Encontrá jardineros en Linares en <a href="/servicios-del-hogar">LinaresYa — Servicios del Hogar</a>. ¿Sos jardinero en Linares? <a href="/publicar">Aparecé gratis en el directorio</a>.</p>
`,
  },

  // ── Artículos batch 5 ──────────────────────────────────────────────────
  {
    slug: "gasfiter-linares",
    titulo: "Gasfíter en Linares: cañerías, calefont y urgencias",
    descripcion:
      "Guía para encontrar gasfíter en Linares, Chile. Reparación de cañerías, instalación de calefont, desagotes, filtraciones y urgencias. Precios y consejos.",
    fecha: "2025-05-21",
    categoria: "Servicios del hogar",
    emoji: "🔧",
    keywords: [
      "gasfiter linares",
      "gasfiter linares chile",
      "reparacion cañerias linares",
      "calefont linares",
      "urgencia gasfiteria linares",
    ],
    contenido: `
<p>Una cañería rota, un calefont que no enciende o una filtración que moja el techo: los problemas de gasfitería aparecen sin aviso y necesitan solución rápida. En Linares hay <strong>gasfíteres de confianza</strong> para urgencias y trabajos programados.</p>

<h2>¿Qué trabajos hace un gasfíter en Linares?</h2>
<ul>
  <li><strong>Reparación de cañerías:</strong> filtraciones, roturas, cambio de tuberías de agua fría y caliente.</li>
  <li><strong>Calefont y termos:</strong> instalación, reparación y mantención de calefont a gas o eléctrico.</li>
  <li><strong>Desagotes y destapes:</strong> WC, lavaderos y duchas tapados.</li>
  <li><strong>Instalación de artefactos:</strong> lavamanos, WC, lavadoras, lavavajillas.</li>
  <li><strong>Detección de pérdidas de agua:</strong> con o sin rotura de muro.</li>
  <li><strong>Urgencias 24/7:</strong> muchos gasfíteres en Linares atienden emergencias fuera de horario.</li>
</ul>

<h2>¿Cuánto cobra un gasfíter en Linares?</h2>
<ul>
  <li>Visita diagnóstico: $15.000 – $25.000</li>
  <li>Destape de WC o lavadero: $20.000 – $50.000</li>
  <li>Cambio de grifo o llave de paso: $20.000 – $40.000</li>
  <li>Instalación de calefont: $40.000 – $100.000 (más materiales)</li>
  <li>Urgencia nocturna o fin de semana: 30-50% adicional</li>
</ul>

<h2>Señales de que necesitás un gasfíter urgente</h2>
<ul>
  <li>Humedad en paredes o cielo sin causa aparente</li>
  <li>Pérdida notable de presión en las llaves</li>
  <li>Olor a gas en la cocina o cerca del calefont</li>
  <li>WC que no deja de correr</li>
</ul>
<p><strong>Ojo:</strong> si hay olor a gas, ventilá el ambiente antes de llamar y no enciendas llamas ni interruptores eléctricos.</p>

<p>Encontrá gasfíteres en Linares en <a href="/servicios-del-hogar">LinaresYa — Servicios del Hogar</a>. ¿Sos gasfíter en Linares? <a href="/publicar">Aparecé gratis en el directorio</a>.</p>
`,
  },
  {
    slug: "profesor-particular-linares",
    titulo: "Profesor particular en Linares: reforzamiento y clases a domicilio",
    descripcion:
      "Encuentra profesores particulares en Linares para matemáticas, lenguaje, inglés, química y más. Reforzamiento escolar, preuniversitario y clases a domicilio.",
    fecha: "2025-05-21",
    categoria: "Educación",
    emoji: "📚",
    keywords: [
      "profesor particular linares",
      "clases particulares linares",
      "reforzamiento escolar linares",
      "preuniversitario linares",
      "clases de matematicas linares",
    ],
    contenido: `
<p>¿Tu hijo necesita apoyo en matemáticas? ¿Buscás reforzamiento para la PAES o mejorar tu nivel de inglés? En Linares hay <strong>profesores particulares</strong> para todas las edades y materias, con clases a domicilio o en línea.</p>

<h2>Materias más solicitadas en Linares</h2>
<ul>
  <li><strong>Matemáticas:</strong> desde básica hasta cálculo universitario.</li>
  <li><strong>Lenguaje y comunicación:</strong> comprensión lectora, redacción, literatura.</li>
  <li><strong>Inglés:</strong> conversacional, gramática, preparación de exámenes (IELTS, TOEFL).</li>
  <li><strong>Química y física:</strong> muy demandadas en enseñanza media y preuniversitario.</li>
  <li><strong>Historia y ciencias sociales:</strong> apoyo para pruebas y PSU/PAES.</li>
  <li><strong>Computación e informática:</strong> desde Office básico hasta programación.</li>
</ul>

<h2>¿Cuánto cobra un profesor particular en Linares?</h2>
<ul>
  <li>Clase de 1 hora (básica-media): $10.000 – $20.000</li>
  <li>Clase de 1 hora (universitario o especializado): $15.000 – $30.000</li>
  <li>Paquete mensual (4-8 clases): habitualmente con descuento</li>
  <li>Clases en línea: generalmente 10-20% más económicas</li>
</ul>

<h2>Tips para elegir un buen profe particular</h2>
<ul>
  <li>Pedí una clase de prueba antes de comprometerte</li>
  <li>Verificá su formación y experiencia con el nivel del estudiante</li>
  <li>Buscá reseñas de otros alumnos en LinaresYa</li>
  <li>Definí un horario fijo para generar hábito de estudio</li>
</ul>

<h2>Preuniversitario en Linares</h2>
<p>Además de clases particulares, existen preuniversitarios locales en Linares para preparar la PAES. Los profesores particulares son una alternativa más personalizada y flexible para quienes necesitan refuerzo en materias específicas.</p>

<p>Encontrá profesores particulares en Linares en <a href="/educacion">LinaresYa — Educación</a>. ¿Sos profesor en Linares? <a href="/publicar">Publicá tus clases gratis</a>.</p>
`,
  },
  {
    slug: "veterinario-linares",
    titulo: "Veterinario en Linares: clínicas, vacunas y urgencias para mascotas",
    descripcion:
      "Encuentra veterinarios en Linares, Chile. Clínicas veterinarias, vacunas, castración, urgencias y peluquería canina. Todo lo que necesitás para tu mascota.",
    fecha: "2025-05-21",
    categoria: "Veterinaria",
    emoji: "🐾",
    keywords: [
      "veterinario linares",
      "clinica veterinaria linares",
      "veterinaria linares chile",
      "vacunas mascotas linares",
      "peluqueria canina linares",
    ],
    contenido: `
<p>Linares tiene varias <strong>clínicas veterinarias</strong> y profesionales independientes para cuidar la salud de perros, gatos y otras mascotas. Desde controles preventivos hasta urgencias, la atención veterinaria local está disponible para tu compañero.</p>

<h2>Servicios veterinarios en Linares</h2>
<ul>
  <li><strong>Consultas y diagnóstico:</strong> revisión general, fiebre, heridas, vómitos, comportamiento.</li>
  <li><strong>Vacunas y desparasitación:</strong> el calendario básico para perros y gatos en Chile.</li>
  <li><strong>Castración y esterilización:</strong> cirugía programada con recuperación en clínica.</li>
  <li><strong>Urgencias:</strong> atropellados, intoxicaciones, dificultad respiratoria.</li>
  <li><strong>Peluquería canina:</strong> baño, corte y styling para perros.</li>
  <li><strong>Radiografías y exámenes:</strong> algunas clínicas tienen equipamiento de diagnóstico in situ.</li>
</ul>

<h2>¿Cuánto cuesta ir al veterinario en Linares?</h2>
<ul>
  <li>Consulta general: $10.000 – $25.000</li>
  <li>Vacuna antirrábica: $8.000 – $15.000</li>
  <li>Castración de macho (perro pequeño): $40.000 – $80.000</li>
  <li>Esterilización de hembra: $60.000 – $130.000</li>
  <li>Baño y corte (peluquería): $15.000 – $40.000</li>
</ul>

<h2>Calendario de vacunas básico en Chile</h2>
<ul>
  <li><strong>Perros:</strong> séxtuple (moquillo, parvovirus, hepatitis, leptospirosis, parainfluenza, coronavirus) + antirrábica.</li>
  <li><strong>Gatos:</strong> triple felina (rinotraqueítis, calicivirus, panleucopenia) + rabia.</li>
  <li>Las primeras vacunas se dan a los 6-8 semanas de vida y tienen refuerzo anual.</li>
</ul>

<h2>¿Cuándo ir a urgencias veterinarias?</h2>
<p>Dificultad para respirar, convulsiones, trauma por atropello, sangrado abundante, sospecha de envenenamiento o si tu mascota lleva más de 12 horas sin comer ni tomar agua son señales de urgencia.</p>

<p>Encontrá veterinarios en Linares en <a href="/veterinarias">LinaresYa — Veterinaria</a>. ¿Tenés clínica veterinaria en Linares? <a href="/publicar">Registrala gratis</a>.</p>
`,
  },
  {
    slug: "flete-transporte-linares",
    titulo: "Flete y transporte en Linares: mudanzas, cargas y envíos",
    descripcion:
      "Encuentra servicios de flete y transporte en Linares, Chile. Mudanzas, traslado de muebles, cargas, envíos dentro de Linares y hacia otras ciudades del Maule.",
    fecha: "2025-05-21",
    categoria: "Transporte",
    emoji: "🚛",
    keywords: [
      "flete linares",
      "transporte linares",
      "mudanza linares",
      "flete linares chile",
      "traslado muebles linares",
    ],
    contenido: `
<p>¿Te mudás, compraste un mueble grande o necesitás trasladar mercadería? En Linares hay <strong>servicios de flete y transporte</strong> para todo tipo de necesidades, desde un televisor hasta el contenido completo de una casa.</p>

<h2>¿Qué servicios de transporte hay en Linares?</h2>
<ul>
  <li><strong>Mudanzas:</strong> traslado completo de muebles y enseres dentro de Linares o hacia otras ciudades.</li>
  <li><strong>Flete de muebles y electrodomésticos:</strong> compras en tiendas que no tienen despacho propio.</li>
  <li><strong>Carga y descarga:</strong> con o sin personal para el trabajo físico.</li>
  <li><strong>Envíos a otras ciudades:</strong> Talca, Curicó, Santiago, Chillán y destinos del Maule.</li>
  <li><strong>Transporte de materiales de construcción:</strong> arena, ripio, ladrillos, etc.</li>
  <li><strong>Pick-up y camioneta:</strong> para cargas más pequeñas o urgentes.</li>
</ul>

<h2>¿Cuánto cobra un flete en Linares?</h2>
<p>Los precios dependen del volumen, distancia y si incluye personal para carga/descarga:</p>
<ul>
  <li>Flete urbano (mueble o electrodoméstico): $15.000 – $40.000</li>
  <li>Mudanza chica (departamento o pieza): $50.000 – $120.000</li>
  <li>Mudanza completa (casa): $100.000 – $300.000+</li>
  <li>Envío a otra ciudad: según distancia y peso</li>
</ul>

<h2>Tips para contratar un flete en Linares</h2>
<ul>
  <li>Pedí presupuesto con y sin mano de obra incluida</li>
  <li>Preguntá si el servicio incluye embalaje para artículos frágiles</li>
  <li>Confirmá el seguro o responsabilidad en caso de daños</li>
  <li>Para mudanzas grandes, reservá con al menos una semana de anticipación</li>
</ul>

<p>Encontrá servicios de flete y transporte en Linares en <a href="/transporte">LinaresYa — Transporte</a>. ¿Tenés camión o camioneta y ofrecés fletes? <a href="/publicar">Publicá tu servicio gratis</a>.</p>
`,
  },
  {
    slug: "salon-de-eventos-linares",
    titulo: "Salón de eventos en Linares: cumpleaños, matrimonios y celebraciones",
    descripcion:
      "Guía de salones de eventos en Linares, Chile. Arriendo de salones para cumpleaños, matrimonios, quinceañeros, reuniones de empresa y celebraciones familiares.",
    fecha: "2025-05-21",
    categoria: "Eventos",
    emoji: "🎉",
    keywords: [
      "salon de eventos linares",
      "arriendo salon linares",
      "salon cumpleanos linares",
      "salon matrimonio linares",
      "quinceañero linares",
    ],
    contenido: `
<p>Planificar una fiesta en Linares empieza por encontrar el espacio correcto. Desde pequeñas celebraciones familiares hasta matrimonios de cientos de invitados, la ciudad ofrece <strong>salones de eventos</strong> de distintos tamaños y estilos.</p>

<h2>¿Qué tipos de eventos se realizan en salones de Linares?</h2>
<ul>
  <li><strong>Cumpleaños y quinceañeros:</strong> el uso más frecuente; muchos salones tienen paquetes especiales.</li>
  <li><strong>Matrimonios y esponsales:</strong> salones con capacidad para recepciones grandes.</li>
  <li><strong>Reuniones de empresa y lanzamientos:</strong> espacios que se pueden configurar como auditorios.</li>
  <li><strong>Bautizos y comuniones:</strong> celebraciones familiares de tamaño mediano.</li>
  <li><strong>Fiestas de fin de año y reuniones de curso:</strong> muy demandadas entre octubre y diciembre.</li>
</ul>

<h2>¿Cuánto cuesta arrendar un salón en Linares?</h2>
<p>Los precios varían mucho según capacidad, día de la semana y servicios incluidos:</p>
<ul>
  <li>Salón pequeño (hasta 50 personas): $80.000 – $200.000</li>
  <li>Salón mediano (50-150 personas): $150.000 – $400.000</li>
  <li>Salón grande (150+ personas): $300.000 – $700.000+</li>
  <li>Fin de semana suele costar 30-50% más que entre semana</li>
</ul>

<h2>¿Qué verificar antes de arrendar?</h2>
<ul>
  <li>Aforo máximo permitido y disposición de mesas</li>
  <li>Si permite música en vivo o DJ (permisos de ruido)</li>
  <li>Si incluye cocina, vajilla o si hay que contratar catering aparte</li>
  <li>Estacionamiento disponible para los invitados</li>
  <li>Horario de término y política de limpieza</li>
</ul>

<h2>Servicios complementarios en Linares</h2>
<p>Muchos salones trabajan con proveedores locales recomendados: catering, pastelería, decoración, animación y fotografía. En LinaresYa podés encontrar todos estos servicios para armar tu evento completo.</p>

<p>Encontrá salones de eventos en Linares en <a href="/eventos">LinaresYa — Eventos</a>. ¿Tenés un salón de eventos en Linares? <a href="/publicar">Publicalo gratis en el directorio</a>.</p>
`,
  },

  // ── Artículos batch 6 ──────────────────────────────────────────────────
  {
    slug: "pintor-linares",
    titulo: "Pintor en Linares: interiores, exteriores y presupuesto gratis",
    descripcion:
      "Encuentra pintores de casas en Linares, Chile. Pintura interior, exterior, cielos, fachadas y más. Precios orientativos y consejos para elegir bien.",
    fecha: "2025-05-21",
    categoria: "Servicios del hogar",
    emoji: "🎨",
    keywords: [
      "pintor linares",
      "pintura casas linares",
      "pintor de casas linares",
      "pintura exterior linares",
      "presupuesto pintura linares",
    ],
    contenido: `
<p>Renovar la pintura de la casa transforma el ambiente y protege las superficies. En Linares hay <strong>pintores de confianza</strong> para trabajos de interior, exterior, cielos, rejas y fachadas completas.</p>

<h2>¿Qué trabajos hace un pintor en Linares?</h2>
<ul>
  <li><strong>Pintura interior:</strong> habitaciones, living, cocina, baños. Incluye preparación de muros (masilla, lija).</li>
  <li><strong>Pintura exterior:</strong> fachadas, muros de cierre, zócalos. Requiere pinturas especiales para la intemperie.</li>
  <li><strong>Cielos:</strong> pintura con rodillo, látex o spray para cielos de drywall o cemento.</li>
  <li><strong>Rejas y metales:</strong> anticorrosivo + esmalte para puertas, rejas y portones.</li>
  <li><strong>Estuco y empaste:</strong> preparación de superficies antes de pintar.</li>
  <li><strong>Pintura decorativa:</strong> texturas, efecto madera, degradados.</li>
</ul>

<h2>¿Cuánto cobra un pintor en Linares?</h2>
<p>Los precios dependen de si cobran por m² o por pieza/ambiente:</p>
<ul>
  <li>Por m² de muro (sin material): $2.000 – $4.500</li>
  <li>Pieza completa (muro + cielo, sin material): $30.000 – $70.000</li>
  <li>Fachada exterior (50 m²): $100.000 – $250.000</li>
  <li>Casa completa (interiores + mano de obra): desde $300.000</li>
</ul>
<p>El costo de los materiales (pintura, rodillos, masilla) se suma aparte o lo aporta el pintor con un precio global.</p>

<h2>Tips para contratar un pintor en Linares</h2>
<ul>
  <li>Pedí presupuesto con y sin materiales incluidos</li>
  <li>Consultá cuántas manos de pintura incluye el precio</li>
  <li>Asegurate de que preparen bien el muro antes de pintar (si no, la pintura no dura)</li>
  <li>Revisá reseñas de trabajos anteriores en LinaresYa</li>
</ul>

<p>Encontrá pintores en Linares en <a href="/servicios-del-hogar">LinaresYa — Servicios del Hogar</a>. ¿Sos pintor en Linares? <a href="/publicar">Aparecé gratis en el directorio</a>.</p>
`,
  },
  {
    slug: "nutricionista-linares",
    titulo: "Nutricionista en Linares: alimentación, dietas y salud",
    descripcion:
      "Encuentra nutricionistas en Linares, Chile. Consultas de nutrición, planes de alimentación, pérdida de peso, nutrición deportiva y enfermedades crónicas.",
    fecha: "2025-05-21",
    categoria: "Salud",
    emoji: "🥗",
    keywords: [
      "nutricionista linares",
      "nutricionista linares chile",
      "dietista linares",
      "plan de alimentacion linares",
      "bajar de peso linares",
    ],
    contenido: `
<p>Una buena alimentación es la base de la salud. En Linares hay <strong>nutricionistas</strong> que te pueden ayudar a mejorar tu dieta, perder o ganar peso de forma saludable, manejar enfermedades crónicas o rendir mejor en el deporte.</p>

<h2>¿Cuándo ir al nutricionista en Linares?</h2>
<ul>
  <li><strong>Pérdida o ganancia de peso:</strong> un plan personalizado es mucho más efectivo que dietas genéricas de internet.</li>
  <li><strong>Enfermedades crónicas:</strong> diabetes, hipertensión, colesterol alto, hígado graso.</li>
  <li><strong>Nutrición deportiva:</strong> mejorar el rendimiento y la recuperación en el deporte.</li>
  <li><strong>Embarazo y lactancia:</strong> asegurar la nutrición correcta en etapas críticas.</li>
  <li><strong>Niños y adolescentes:</strong> hábitos alimentarios saludables desde temprano.</li>
  <li><strong>Trastornos alimentarios:</strong> apoyo profesional para anorexia, bulimia, atracones.</li>
</ul>

<h2>¿Qué pasa en la primera consulta?</h2>
<p>El nutricionista hace una evaluación completa: peso, talla, medidas corporales, hábitos alimentarios, actividad física y antecedentes de salud. Con eso diseña un plan de alimentación personalizado y te da un seguimiento periódico.</p>

<h2>¿Cuánto cuesta el nutricionista en Linares?</h2>
<ul>
  <li>Primera consulta: $20.000 – $45.000</li>
  <li>Control mensual: $15.000 – $35.000</li>
  <li>Consulta online: generalmente 10-20% más económica</li>
  <li>FONASA cubre nutricionistas en el sistema público (CESFAM de Linares)</li>
</ul>

<h2>¿FONASA cubre al nutricionista?</h2>
<p>Sí. Si tenés FONASA y una derivación médica, podés acceder a atención nutricional en el CESFAM u Hospital de Linares sin costo o con copago mínimo. También hay nutricionistas en clínicas privadas con FONASA libre elección.</p>

<p>Encontrá nutricionistas en Linares en <a href="/salud">LinaresYa — Salud</a>. ¿Sos nutricionista en Linares? <a href="/publicar">Publicá tu consulta gratis</a>.</p>
`,
  },
  {
    slug: "taxi-traslados-linares",
    titulo: "Taxi en Linares: traslados, aeropuerto y servicios nocturnos",
    descripcion:
      "Encuentra taxis y servicios de traslado en Linares, Chile. Taxi al aeropuerto, traslados a Talca, servicios nocturnos y transporte escolar en la ciudad.",
    fecha: "2025-05-21",
    categoria: "Transporte",
    emoji: "🚕",
    keywords: [
      "taxi linares",
      "taxi linares chile",
      "traslado aeropuerto linares",
      "taxi nocturno linares",
      "transporte escolar linares",
    ],
    contenido: `
<p>Moverse por Linares o hacia otras ciudades del Maule es más fácil con un buen servicio de taxi o traslado. Hay opciones para viajes dentro de la ciudad, traslados al aeropuerto de Santiago, servicios nocturnos y transporte escolar.</p>

<h2>Tipos de servicio de taxi en Linares</h2>
<ul>
  <li><strong>Taxi urbano:</strong> viajes dentro de Linares, zonas residenciales, hospital, estación.</li>
  <li><strong>Traslados interurbanos:</strong> Linares–Talca, Linares–Curicó, Linares–Chillán.</li>
  <li><strong>Traslado a aeropuerto:</strong> al Aeropuerto Arturo Merino Benítez (SCL) en Santiago.</li>
  <li><strong>Servicio nocturno:</strong> disponible pasada la medianoche para quienes necesitan moverse fuera del horario regular.</li>
  <li><strong>Transporte escolar:</strong> ruta fija con niños, en vehículos habilitados.</li>
  <li><strong>Minibús y van:</strong> para grupos, excursiones o traslados de empresa.</li>
</ul>

<h2>¿Cuánto cuesta un taxi en Linares?</h2>
<ul>
  <li>Viaje urbano (dentro de Linares): $2.500 – $6.000</li>
  <li>Linares → Talca (ida): $20.000 – $35.000</li>
  <li>Linares → Aeropuerto Santiago: $80.000 – $140.000</li>
  <li>Servicio nocturno: 20-30% más que tarifa diurna</li>
</ul>
<p>Los precios pueden variar según la hora, número de pasajeros y equipaje. Siempre conviene acordar el precio antes del viaje.</p>

<h2>Consejos para usar taxi en Linares</h2>
<ul>
  <li>Para traslados largos (aeropuerto, Santiago), reservá con anticipación</li>
  <li>Preguntá si el precio incluye peajes en ruta a Santiago</li>
  <li>Para transporte escolar, verificá que el conductor tenga licencia y el vehículo la revisión técnica al día</li>
  <li>Revisá reseñas del servicio en LinaresYa antes de contratar</li>
</ul>

<p>Encontrá servicios de taxi y traslado en Linares en <a href="/transporte">LinaresYa — Transporte</a>. ¿Tenés taxi o van en Linares? <a href="/publicar">Publicá tu servicio gratis</a>.</p>
`,
  },
  {
    slug: "cerrajero-linares",
    titulo: "Cerrajero en Linares: apertura de puertas y cambio de cerradura",
    descripcion:
      "Encuentra cerrajeros en Linares, Chile. Apertura de puertas sin llave, cambio de cerradura, duplicado de llaves y urgencias las 24 horas.",
    fecha: "2025-05-21",
    categoria: "Servicios del hogar",
    emoji: "🔑",
    keywords: [
      "cerrajero linares",
      "cerrajero linares chile",
      "apertura de puertas linares",
      "cambio cerradura linares",
      "cerrajero urgencia linares",
    ],
    contenido: `
<p>Quedarse sin llave, tener una cerradura forzada o simplemente querer mejorar la seguridad de la casa son situaciones donde necesitás a un <strong>cerrajero en Linares</strong>. Hay servicios disponibles para urgencias y trabajos programados.</p>

<h2>¿Qué hace un cerrajero en Linares?</h2>
<ul>
  <li><strong>Apertura de puertas:</strong> si te quedaste sin llave o la cerradura está bloqueada.</li>
  <li><strong>Cambio de cerradura:</strong> después de un robo, pérdida de llaves o por mejorar la seguridad.</li>
  <li><strong>Instalación de cerraduras:</strong> cerraduras de seguridad, bombines de alta protección, cerraduras con llave.</li>
  <li><strong>Duplicado de llaves:</strong> copia de llaves simples o con chip.</li>
  <li><strong>Apertura de cajas fuertes:</strong> cuando se olvida la combinación.</li>
  <li><strong>Puertas de autos:</strong> algunos cerrajeros también abren vehículos sin dañar la cerradura.</li>
</ul>

<h2>¿Cuánto cobra un cerrajero en Linares?</h2>
<ul>
  <li>Apertura de puerta (horario normal): $25.000 – $60.000</li>
  <li>Apertura de puerta (urgencia nocturna): $50.000 – $100.000</li>
  <li>Cambio de cerradura (más material): $30.000 – $80.000</li>
  <li>Duplicado de llave simple: $3.000 – $8.000</li>
</ul>
<p>El precio sube considerablemente en urgencias nocturnas o fines de semana. Acordá el valor antes de que empiece el trabajo.</p>

<h2>¿Cómo evitar estafas con cerrajeros?</h2>
<ul>
  <li>Pedí el precio total antes de autorizar el trabajo</li>
  <li>Desconfiá si el costo sube abruptamente al llegar al lugar</li>
  <li>Preferí cerrajeros con reseñas verificadas en LinaresYa</li>
  <li>Pedí boleta o comprobante del servicio</li>
</ul>

<p>Encontrá cerrajeros en Linares en <a href="/servicios-del-hogar">LinaresYa — Servicios del Hogar</a>. ¿Sos cerrajero en Linares? <a href="/publicar">Aparecé gratis en el directorio</a>.</p>
`,
  },
  {
    slug: "tecnico-electrodomesticos-linares",
    titulo: "Técnico de electrodomésticos en Linares: lavadora, heladera y más",
    descripcion:
      "Encuentra técnicos de electrodomésticos en Linares, Chile. Reparación de lavadoras, heladeras, microondas, lavavajillas y televisores. Servicio a domicilio.",
    fecha: "2025-05-21",
    categoria: "Servicios del hogar",
    emoji: "🔌",
    keywords: [
      "tecnico electrodomesticos linares",
      "reparacion lavadora linares",
      "reparacion heladera linares",
      "servicio tecnico linares",
      "tecnico a domicilio linares",
    ],
    contenido: `
<p>Cuando la lavadora no centrifuga, la heladera no enfría o el microondas se apagó, un <strong>técnico de electrodomésticos en Linares</strong> puede ahorrarte el costo de comprar uno nuevo. Muchos ofrecen servicio a domicilio con diagnóstico en el mismo día.</p>

<h2>Electrodomésticos que reparan en Linares</h2>
<ul>
  <li><strong>Lavadoras:</strong> no centrifuga, no lava, pierde agua, hace ruido, no enciende.</li>
  <li><strong>Secadoras:</strong> no calienta, no gira el tambor, corta el suministro.</li>
  <li><strong>Heladeras y freezers:</strong> no enfría, hace ruido, pierde gas, acumula escarcha.</li>
  <li><strong>Microondas:</strong> no calienta, no enciende, chispea, plato no gira.</li>
  <li><strong>Lavavajillas:</strong> no lava bien, pierde agua, no drena.</li>
  <li><strong>Televisores:</strong> pantalla sin imagen, sin sonido, backlight quemado.</li>
  <li><strong>Cocinas y hornos:</strong> quemadores que no encienden, termostato fallado.</li>
</ul>

<h2>¿Cuánto cuesta reparar un electrodoméstico en Linares?</h2>
<ul>
  <li>Diagnóstico a domicilio: $10.000 – $20.000 (descontable del trabajo)</li>
  <li>Reparación lavadora (falla común): $25.000 – $80.000</li>
  <li>Recarga de gas heladera: $30.000 – $60.000</li>
  <li>Reparación microondas: $20.000 – $50.000</li>
</ul>
<p>El costo de los repuestos se suma aparte. Un buen técnico te dice si conviene reparar o cambiar el equipo según su antigüedad y el costo de la reparación.</p>

<h2>¿Conviene reparar o comprar nuevo?</h2>
<p>Como regla general: si la reparación cuesta más del 50% del valor de un equipo nuevo equivalente, conviene reemplazarlo. Para electrodomésticos de menos de 5 años, casi siempre vale la pena reparar. Un técnico honesto te lo dice sin rodeos.</p>

<h2>Consejos para elegir un buen técnico</h2>
<ul>
  <li>Pedí presupuesto con diagnóstico antes de autorizar la reparación</li>
  <li>Preguntá si hay garantía en la reparación y los repuestos</li>
  <li>Verificá reseñas en LinaresYa antes de llamar</li>
</ul>

<p>Encontrá técnicos de electrodomésticos en Linares en <a href="/servicios-del-hogar">LinaresYa — Servicios del Hogar</a>. ¿Sos técnico en Linares? <a href="/publicar">Aparecé gratis en el directorio</a>.</p>
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
