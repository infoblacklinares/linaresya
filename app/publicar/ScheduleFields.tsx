"use client";

import { useEffect, useMemo, useState } from "react";

type Dia =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

type DiaState = { cerrado: boolean; abre: string; cierra: string };

const DIAS: { key: Dia; label: string; corto: string }[] = [
  { key: "lunes", label: "Lunes", corto: "Lun" },
  { key: "martes", label: "Martes", corto: "Mar" },
  { key: "miercoles", label: "Miércoles", corto: "Mié" },
  { key: "jueves", label: "Jueves", corto: "Jue" },
  { key: "viernes", label: "Viernes", corto: "Vie" },
  { key: "sabado", label: "Sábado", corto: "Sáb" },
  { key: "domingo", label: "Domingo", corto: "Dom" },
];

const ESTADO_DEFAULT: Record<Dia, DiaState> = {
  lunes: { cerrado: false, abre: "09:00", cierra: "19:00" },
  martes: { cerrado: false, abre: "09:00", cierra: "19:00" },
  miercoles: { cerrado: false, abre: "09:00", cierra: "19:00" },
  jueves: { cerrado: false, abre: "09:00", cierra: "19:00" },
  viernes: { cerrado: false, abre: "09:00", cierra: "19:00" },
  sabado: { cerrado: false, abre: "10:00", cierra: "14:00" },
  domingo: { cerrado: true, abre: "", cierra: "" },
};

const PRESETS: { label: string; dias: Dia[]; abre: string; cierra: string }[] = [
  {
    label: "Lun a Vie",
    dias: ["lunes", "martes", "miercoles", "jueves", "viernes"],
    abre: "09:00",
    cierra: "19:00",
  },
  {
    label: "Lun a Sáb",
    dias: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"],
    abre: "09:00",
    cierra: "19:00",
  },
  {
    label: "Todos los días",
    dias: DIAS.map((d) => d.key),
    abre: "10:00",
    cierra: "22:00",
  },
];

function aMinutos(t: string): number | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

/**
 * Campos de horario del formulario de publicacion.
 *
 * Emite siempre los mismos names que espera el server action
 * (`horario_<dia>_abre` / `_cierra` / `_cerrado`). En modo "mismo horario"
 * los 7 dias viajan como inputs hidden, asi que el FormData nunca llega
 * vacio: si llegara vacio, actions.ts marcaria todos los dias como cerrados.
 */
export default function ScheduleFields({
  onValidChange,
}: {
  onValidChange?: (ok: boolean) => void;
}) {
  const [mismo, setMismo] = useState(true);
  const [unico, setUnico] = useState({ abre: "09:00", cierra: "19:00" });
  const [dias, setDias] = useState<Record<Dia, DiaState>>(ESTADO_DEFAULT);

  const error = useMemo(() => {
    if (mismo) {
      const a = aMinutos(unico.abre);
      const c = aMinutos(unico.cierra);
      if (a != null && c != null && c <= a) {
        return "La hora de cierre debe ser después de la de apertura.";
      }
      return "";
    }
    const malo = DIAS.some(({ key }) => {
      const d = dias[key];
      if (d.cerrado) return false;
      const a = aMinutos(d.abre);
      const c = aMinutos(d.cierra);
      return a != null && c != null && c <= a;
    });
    return malo
      ? "Revisa los horarios: el cierre debe ser después de la apertura."
      : "";
  }, [mismo, unico, dias]);

  useEffect(() => {
    onValidChange?.(!error);
  }, [error, onValidChange]);

  function actualizar(dia: Dia, patch: Partial<DiaState>) {
    setDias((prev) => ({ ...prev, [dia]: { ...prev[dia], ...patch } }));
  }

  function aplicarPreset(p: (typeof PRESETS)[number]) {
    const abiertos = new Set(p.dias);
    setDias(
      DIAS.reduce((acc, { key }) => {
        acc[key] = abiertos.has(key)
          ? { cerrado: false, abre: p.abre, cierra: p.cierra }
          : { cerrado: true, abre: "", cierra: "" };
        return acc;
      }, {} as Record<Dia, DiaState>),
    );
  }

  return (
    <div>
      <label className="flex items-center gap-3 rounded-2xl bg-[#F9F8F6] border border-[#E8E4DE] px-4 py-3 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={mismo}
          onChange={(e) => setMismo(e.target.checked)}
          className="h-4 w-4 accent-[#1A1410]"
        />
        <span className="text-sm font-medium text-[#1A1410]">
          Mismo horario todos los días
        </span>
      </label>

      {mismo ? (
        <>
          <div className="flex items-center gap-2.5">
            <input
              type="time"
              className="hora-ue"
              value={unico.abre}
              onChange={(e) =>
                setUnico((u) => ({ ...u, abre: e.target.value }))
              }
            />
            <span className="text-[#8E8279] text-sm font-semibold">a</span>
            <input
              type="time"
              className="hora-ue"
              value={unico.cierra}
              onChange={(e) =>
                setUnico((u) => ({ ...u, cierra: e.target.value }))
              }
            />
          </div>

          {/* Los 7 dias viajan igual al server action */}
          {DIAS.map(({ key }) => (
            <span key={key}>
              <input
                type="hidden"
                name={`horario_${key}_abre`}
                value={unico.abre}
              />
              <input
                type="hidden"
                name={`horario_${key}_cierra`}
                value={unico.cierra}
              />
            </span>
          ))}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => aplicarPreset(p)}
                className="rounded-full bg-[#F9F8F6] border border-[#E8E4DE] px-3 py-1.5 text-[11px] font-semibold text-[#1A1410] hover:border-[#2B6E80] transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-[#E8E4DE] overflow-hidden">
            {DIAS.map(({ key, label, corto }, i) => {
              const d = dias[key];
              return (
                <div
                  key={key}
                  className={`px-3 py-2.5 flex items-center gap-2.5 flex-wrap bg-[#F9F8F6] ${
                    i < DIAS.length - 1 ? "border-b border-[#E8E4DE]" : ""
                  }`}
                >
                  <span className="text-[13px] font-semibold text-[#1A1410] w-[68px] shrink-0">
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{corto}</span>
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#6B5E57] cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      name={`horario_${key}_cerrado`}
                      checked={d.cerrado}
                      onChange={(e) =>
                        actualizar(key, { cerrado: e.target.checked })
                      }
                      className="h-4 w-4 accent-[#1A1410]"
                    />
                    Cerrado
                  </label>
                  {!d.cerrado && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="time"
                        name={`horario_${key}_abre`}
                        value={d.abre}
                        onChange={(e) =>
                          actualizar(key, { abre: e.target.value })
                        }
                        className="hora-ue hora-ue-sm"
                      />
                      <span className="text-[#8E8279]">–</span>
                      <input
                        type="time"
                        name={`horario_${key}_cierra`}
                        value={d.cierra}
                        onChange={(e) =>
                          actualizar(key, { cierra: e.target.value })
                        }
                        className="hora-ue hora-ue-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {error && (
        <p className="mt-2 text-[11px] text-red-600 font-medium">{error}</p>
      )}

      <style>{`
        .hora-ue {
          background: #fff;
          color: #1A1410;
          border: 1px solid #E8E4DE;
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .hora-ue:focus { border-color: #2B6E80; }
        .hora-ue-sm { padding: 0.3rem 0.5rem; font-size: 0.75rem; }
      `}</style>
    </div>
  );
}
