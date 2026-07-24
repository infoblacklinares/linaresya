import Link from "next/link";

type Lugar = {
  nombre: string;
  emoji: string;
  tipo: string;
  tipoColor: string;
  descripcion: string;
  info: string;
  telefono: string | null;
  maps: string;
  // Foto del lugar. Sube el archivo a /public/esencial/ y pon la ruta aquí,
  // ej: imagen: "/esencial/zoo.jpg". Si no hay foto, se usa un degradado.
  imagen?: string;
};

// Degradado de fondo por tipo (fallback cuando el lugar no tiene foto).
const GRADIENTES: Record<string, string> = {
  Turismo:     "from-emerald-500 to-emerald-800",
  Transporte:  "from-sky-500 to-blue-800",
  Salud:       "from-rose-500 to-rose-800",
  Servicios:   "from-amber-500 to-orange-700",
  Seguridad:   "from-teal-600 to-teal-900",
  Emergencia:  "from-red-500 to-red-800",
};
const gradiente = (tipo: string) => GRADIENTES[tipo] ?? "from-[#2B6E80] to-[#163d4e]";

const LUGARES: Lugar[] = [
  {
    nombre: "Zoo de Linares",
    imagen: "/esencial/zoo.jpg",
    emoji: "🦁",
    tipo: "Turismo",
    tipoColor: "bg-emerald-100 text-emerald-700",
    descripcion: "Parque Zoológico Municipal",
    info: "Mar–Dom · 10:00–18:00",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=Parque+Zoologico+Linares+Chile",
  },
  {
    nombre: "Terminal de Buses",
    imagen: "/esencial/terminal.jpg",
    emoji: "🚌",
    tipo: "Transporte",
    tipoColor: "bg-blue-100 text-blue-700",
    descripcion: "Terminal Rodoviario Linares",
    info: "Abierto 24 horas",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=Terminal+de+Buses+Linares+Chile",
  },
  {
    nombre: "Hospital de Linares",
    imagen: "/esencial/hospital.jpg",
    emoji: "🏥",
    tipo: "Salud",
    tipoColor: "bg-red-100 text-red-700",
    descripcion: "Hospital Base de Linares",
    info: "Urgencias 24 horas",
    telefono: "+5673220930",
    maps: "https://www.google.com/maps/search/?api=1&query=Hospital+Base+Linares+Chile",
  },
  {
    nombre: "Municipalidad",
    imagen: "/esencial/municipalidad.png",
    emoji: "🏛️",
    tipo: "Servicios",
    tipoColor: "bg-amber-100 text-amber-700",
    descripcion: "Municipalidad de Linares",
    info: "Lun–Vie · 08:30–14:00",
    telefono: "+56732568000",
    maps: "https://www.google.com/maps/search/?api=1&query=Municipalidad+de+Linares+Chile",
  },
  {
    nombre: "Registro Civil",
    imagen: "/esencial/registro-civil.jpg",
    emoji: "📋",
    tipo: "Servicios",
    tipoColor: "bg-amber-100 text-amber-700",
    descripcion: "Registro Civil e Identificación",
    info: "Lun–Vie · 08:30–14:00",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=Registro+Civil+Linares+Chile",
  },
  {
    nombre: "Carabineros",
    imagen: "/esencial/carabineros.png",
    emoji: "🚔",
    tipo: "Seguridad",
    tipoColor: "bg-green-100 text-green-700",
    descripcion: "Comisaría de Linares",
    info: "Emergencias: 133",
    telefono: "133",
    maps: "https://www.google.com/maps/search/?api=1&query=Carabineros+Linares+Chile",
  },
  {
    nombre: "Plaza de Armas",
    imagen: "/esencial/Plaza_de_Armas.jpg",
    emoji: "🌳",
    tipo: "Turismo",
    tipoColor: "bg-emerald-100 text-emerald-700",
    descripcion: "Plaza de Armas de Linares",
    info: "Siempre abierta",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=Plaza+de+Armas+Linares+Chile",
  },
  {
    nombre: "Catedral",
    imagen: "/esencial/catedral.jpg",
    emoji: "⛪",
    tipo: "Turismo",
    tipoColor: "bg-emerald-100 text-emerald-700",
    descripcion: "Catedral de Linares",
    info: "Lun–Dom desde 09:00",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=Catedral+de+Linares+Chile",
  },
  {
    nombre: "Bomberos",
    imagen: "/esencial/bomberos.png",
    emoji: "🚒",
    tipo: "Emergencia",
    tipoColor: "bg-red-100 text-red-700",
    descripcion: "Cuerpo de Bomberos de Linares",
    info: "Emergencias: 132",
    telefono: "132",
    maps: "https://www.google.com/maps/search/?api=1&query=Bomberos+Linares+Chile",
  },
  {
    nombre: "CESFAM",
    imagen: "/esencial/cesfam.jpg",
    emoji: "⚕️",
    tipo: "Salud",
    tipoColor: "bg-red-100 text-red-700",
    descripcion: "Centros de Salud Familiar",
    info: "Lun–Vie · 08:00–17:00",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=CESFAM+Linares+Chile",
  },
  {
    nombre: "Veterinaria de urgencia",
    imagen: "/esencial/veterinaria.jpg",
    emoji: "🐾",
    tipo: "Salud",
    tipoColor: "bg-red-100 text-red-700",
    descripcion: "Atención veterinaria",
    info: "Consultar disponibilidad",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=veterinaria+urgencia+Linares+Chile",
  },
  {
    nombre: "Bancos",
    imagen: "/esencial/bancos.jpg",
    emoji: "🏦",
    tipo: "Servicios",
    tipoColor: "bg-amber-100 text-amber-700",
    descripcion: "Bancos en el centro",
    info: "Lun–Vie · 09:00–14:00",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=bancos+Linares+Chile",
  },
  {
    nombre: "Cajeros automáticos",
    imagen: "/esencial/cajeros-automaticos.jpg",
    emoji: "💳",
    tipo: "Servicios",
    tipoColor: "bg-amber-100 text-amber-700",
    descripcion: "Redbanc y cajeros 24h",
    info: "Disponibles 24 horas",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=cajero+automatico+Linares+Chile",
  },
  {
    nombre: "Notarías",
    imagen: "/esencial/notarias.jpg",
    emoji: "📜",
    tipo: "Servicios",
    tipoColor: "bg-amber-100 text-amber-700",
    descripcion: "Notarías de Linares",
    info: "Lun–Vie · 09:00–14:00",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=notaria+Linares+Chile",
  },
  {
    nombre: "Bencineras",
    imagen: "/esencial/bencineras.jpg",
    emoji: "⛽",
    tipo: "Transporte",
    tipoColor: "bg-blue-100 text-blue-700",
    descripcion: "Estaciones de servicio",
    info: "Varias abiertas 24 horas",
    telefono: null,
    maps: "https://www.google.com/maps/search/?api=1&query=estacion+de+servicio+Linares+Chile",
  },
];

export default function LinaresEsencial() {
  return (
    <section className="pt-6">
      {/* Header */}
      <div className="flex items-end justify-between px-4 mb-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#1A1410]">Linares Esencial</h2>
          <p className="text-xs text-[#8E8279]">Lugares y servicios clave de la ciudad</p>
        </div>
      </div>

      {/* Cards scroll horizontal */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        {LUGARES.map((lugar) => (
          <div
            key={lugar.nombre}
            className="group relative shrink-0 w-48 aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,0.10)] border border-[#F0EDE8]"
          >
            {/* Fondo: foto del lugar o degradado por categoría */}
            {lugar.imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lugar.imagen}
                alt={lugar.nombre}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${gradiente(lugar.tipo)}`} />
            )}
            {/* Degradado oscuro para legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

            {/* Badge de categoría arriba */}
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-[#1A1410] backdrop-blur-sm">
              {lugar.tipo}
            </span>

            {/* Info + acciones sobre la imagen */}
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-[15px] font-black text-white leading-tight line-clamp-1 drop-shadow">
                {lugar.nombre}
              </p>
              <p className="text-[11px] text-white/80 mt-0.5 line-clamp-1">{lugar.descripcion}</p>
              <p className="text-[10px] text-white/70 mt-0.5 font-medium">{lugar.info}</p>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                <a
                  href={lugar.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 rounded-full bg-white/20 py-1.5 text-[10px] font-bold text-white backdrop-blur-md hover:bg-white/30 transition"
                >
                  📍 Mapa
                </a>
                {lugar.telefono ? (
                  <a
                    href={`tel:${lugar.telefono}`}
                    className="flex items-center justify-center gap-1 rounded-full bg-white py-1.5 text-[10px] font-bold text-[#1A1410] hover:bg-white/90 transition"
                  >
                    📞 Llamar
                  </a>
                ) : (
                  <a
                    href={lugar.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-full bg-white/20 py-1.5 text-[10px] font-bold text-white backdrop-blur-md hover:bg-white/30 transition"
                  >
                    Ver →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
