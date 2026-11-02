
"use client";

import { useState } from "react";
import MarqueeRow from "@/components/MarqueeRow";

type Lugar = {
  nombre: string;
  emoji: string;
  tipo: string;
  grupo: "Urgencias" | "Trámites" | "Moverse" | "Dinero";
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
    nombre: "Terminal de Buses",
    grupo: "Moverse",
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
    grupo: "Urgencias",
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
    grupo: "Trámites",
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
    grupo: "Trámites",
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
    grupo: "Urgencias",
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
    nombre: "Bomberos",
    grupo: "Urgencias",
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
    grupo: "Urgencias",
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
    grupo: "Urgencias",
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
    grupo: "Dinero",
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
    grupo: "Dinero",
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
    grupo: "Trámites",
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
    grupo: "Moverse",
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

const GRUPO_ORDEN: Record<Lugar["grupo"], number> = {
  Urgencias: 0,
  Trámites: 1,
  Moverse: 2,
  Dinero: 3,
};

export default function LinaresEsencial() {
  const [grupoActivo, setGrupoActivo] = useState<"Todos" | Lugar["grupo"]>("Todos");

  // La utilidad debe ser predecible: primero urgencias, luego trámites,
  // movilidad y dinero. El filtro solo reduce el conjunto visible.
  const lugares = [...LUGARES]
    .sort((a, b) => GRUPO_ORDEN[a.grupo] - GRUPO_ORDEN[b.grupo])
    .filter((lugar) => grupoActivo === "Todos" || lugar.grupo === grupoActivo);

  return (
    <section className="ly-essential py-8" aria-labelledby="ly-essential-title">
      <div className="mb-5 flex flex-col gap-3 px-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-extrabold uppercase tracking-[.16em] text-[#C05A46]">Información local</p>
          <h2 id="ly-essential-title" className="text-2xl font-extrabold tracking-tight text-[#183247] sm:text-3xl">Servicios útiles de Linares</h2>
          <p className="mt-1 text-sm text-slate-500">Datos prácticos para resolver lo que necesitas en la ciudad.</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar servicios">
          {(["Todos", "Urgencias", "Trámites", "Moverse", "Dinero"] as const).map((grupo) => {
            const activo = grupoActivo === grupo;
            return (
              <button key={grupo} type="button" onClick={() => setGrupoActivo(grupo)} aria-pressed={activo}
                className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${activo ? "border-[#2B6E80] bg-[#2B6E80] text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-[#2B6E80] hover:text-[#2B6E80]"}`}>
                {grupo}
              </button>
            );
          })}
        </div>
      </div>

      <MarqueeRow speed={0.45}>
        {lugares.map((lugar) => (
          <article key={lugar.nombre} className="ly-essential-card group w-[clamp(250px,calc((100vw-7rem)/4),340px)] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative h-[150px] overflow-hidden bg-slate-100">
              {lugar.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lugar.imagen} alt={lugar.nombre} loading="lazy" decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradiente(lugar.tipo)} text-5xl`}>{lugar.emoji}</div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#183247] shadow-sm">{lugar.grupo}</span>
            </div>
            <div className="p-4">
              <h3 className="text-base font-extrabold leading-tight text-[#183247]">{lugar.nombre}</h3>
              <p className="mt-1 text-sm text-slate-500">{lugar.descripcion}</p>
              <p className="mt-1.5 text-xs font-semibold text-slate-600">{lugar.info}</p>
              <div className="mt-4 flex gap-2">
                <a href={lugar.maps} target="_blank" rel="noopener noreferrer"
                  className="flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl bg-[#2B6E80] px-2 py-2 text-[11px] font-bold text-white transition hover:bg-[#235c6b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B6E80]">
                  📍 Cómo llegar
                </a>
                {lugar.telefono ? (
                  <a href={`tel:${lugar.telefono}`}
                    className="flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl border border-[#C05A46]/30 bg-[#C05A46]/[0.06] px-2 py-2 text-[11px] font-bold text-[#A84D3A] transition hover:bg-[#C05A46]/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C05A46]">
                    ☎ Llamar
                  </a>
                ) : (
                  <a href={lugar.maps} target="_blank" rel="noopener noreferrer"
                    className="flex min-h-10 min-w-0 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B6E80]">
                    Ver información
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </MarqueeRow>
    </section>
  );
}
