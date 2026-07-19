import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

export const metadata: Metadata = {
  title: "Eventos en Linares - Agenda de la ciudad | LinaresYa",
  description:
    "Ferias, conciertos, actividades municipales y panoramas en Linares. La agenda de eventos de la ciudad, siempre actualizada.",
  alternates: { canonical: `${SITE_URL}/agenda` },
};

export const revalidate = 300; // 5 min

type Evento = {
  id: number;
  titulo: string;
  descripcion: string | null;
  emoji: string;
  lugar: string;
  direccion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  imagen_url: string | null;
  link: string | null;
  destacado: boolean;
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function partesFecha(iso: string) {
  const d = new Date(iso);
  return {
    dia: d.getDate(),
    mes: MESES[d.getMonth()],
    hora: d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    diaSemana: d.toLocaleDateString("es-CL", { weekday: "long" }),
  };
}

export default async function EventosPage() {
  const { data } = await supabase
    .from("eventos")
    .select("*")
    .order("destacado", { ascending: false })
    .order("fecha_inicio");

  const eventos = (data ?? []) as Evento[];

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl lg:max-w-5xl bg-[#F9F8F6] px-4 py-8 pb-24">
      <Link href="/" className="text-xs font-semibold text-[#8E8279] hover:text-[#1A1410]">
        ← Volver al inicio
      </Link>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-[#1A1410]">
        🗓️ Eventos en Linares
      </h1>
      <p className="mt-1 text-sm text-[#8E8279] mb-6">
        Ferias, música, deporte y panoramas de la ciudad — siempre al día.
      </p>

      {eventos.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#E8E4DE] p-8 text-center">
          <p className="text-3xl mb-2">🌵</p>
          <p className="text-sm font-semibold text-[#1A1410]">No hay eventos programados por ahora</p>
          <p className="text-xs text-[#8E8279] mt-1">
            ¿Organizas un evento en Linares? Escríbenos y lo publicamos gratis.
          </p>
        </div>
      ) : (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:items-start">
          {eventos.map(e => {
            const f = partesFecha(e.fecha_inicio);
            return (
              <article key={e.id} className="overflow-hidden rounded-3xl bg-white border border-[#F0EDE8] shadow-linares-sm">
                {e.imagen_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.imagen_url} alt={e.titulo} className="h-40 w-full object-cover" />
                )}
                <div className="flex gap-4 p-4">
                  {/* Bloque de fecha estilo calendario */}
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#2B6E80] text-white">
                    <span className="text-xl font-black leading-none">{f.dia}</span>
                    <span className="text-[10px] font-bold uppercase">{f.mes}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-base font-black text-[#1A1410] leading-tight">
                        {e.emoji} {e.titulo}
                      </h2>
                      {e.destacado && (
                        <span className="rounded-full bg-[#F4B860] px-2 py-0.5 text-[9px] font-extrabold text-[#1A1410]">⭐ Destacado</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#8E8279] capitalize">
                      {f.diaSemana} · {f.hora} hrs
                    </p>
                    <p className="text-xs text-[#8E8279]">📍 {e.lugar}{e.direccion ? ` — ${e.direccion}` : ""}</p>
                    {e.descripcion && (
                      <p className="mt-2 text-[13px] text-[#475569] leading-relaxed">{e.descripcion}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      {e.link && (
                        <a
                          href={e.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[#1A1410] px-4 py-2 text-xs font-bold text-white active:scale-95 transition"
                        >
                          Más info →
                        </a>
                      )}
                      {e.direccion && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.direccion}, Linares, Chile`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-[#E8E4DE] bg-white px-4 py-2 text-xs font-bold text-[#2B6E80] active:scale-95 transition"
                        >
                          📍 Mapa
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
