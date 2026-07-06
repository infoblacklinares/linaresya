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
};

const LUGARES: Lugar[] = [
  {
    nombre: "Zoo de Linares",
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
            className="shrink-0 w-40 rounded-2xl bg-white border border-[#F0EDE8] shadow-[0_2px_14px_rgba(0,0,0,0.07)] overflow-hidden"
          >
            {/* Emoji área */}
            <div className="flex items-center justify-center h-20 bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E2] text-4xl">
              {lugar.emoji}
            </div>

            {/* Info */}
            <div className="p-3 pb-2">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${lugar.tipoColor}`}>
                {lugar.tipo}
              </span>
              <p className="mt-1 text-[13px] font-black text-[#1A1410] leading-tight line-clamp-1">
                {lugar.nombre}
              </p>
              <p className="text-[10px] text-[#8E8279] mt-0.5 line-clamp-1">{lugar.descripcion}</p>
              <p className="text-[10px] text-[#6B5E57] mt-1 font-medium">{lugar.info}</p>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 border-t border-[#F0EDE8]">
              <a
                href={lugar.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-2 text-[10px] font-bold text-[#2B6E80] hover:bg-[#F5F2EE] transition border-r border-[#F0EDE8]"
              >
                📍 Mapa
              </a>
              {lugar.telefono ? (
                <a
                  href={`tel:${lugar.telefono}`}
                  className="flex items-center justify-center py-2 text-[10px] font-bold text-[#2B6E80] hover:bg-[#F5F2EE] transition"
                >
                  📞 Llamar
                </a>
              ) : (
                <a
                  href={lugar.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-2 text-[10px] font-bold text-[#8E8279] hover:bg-[#F5F2EE] transition"
                >
                  Ver →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
