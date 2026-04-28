"use client";

import { useState } from "react";

type Dia =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

type DiaState = {
  cerrado: boolean;
  abre: string;
  cierra: string;
};

const DIAS: { key: Dia; label: string; corto: string }[] = [
  { key: "lunes", label: "Lunes", corto: "Lun" },
  { key: "martes", label: "Martes", corto: "Mar" },
  { key: "miercoles", label: "Miercoles", corto: "Mie" },
  { key: "jueves", label: "Jueves", corto: "Jue" },
  { key: "viernes", label: "Viernes", corto: "Vie" },
  { key: "sabado", label: "Sabado", corto: "Sab" },
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

export type HorarioInicial = {
  dia: Dia;
  abre: string | null;
  cierra: string | null;
  cerrado: boolean;
};

function fromInitial(initial: HorarioInicial[]): Record<Dia, DiaState> {
  const base: Record<Dia, DiaState> = { ...ESTADO_DEFAULT };
  for (const h of initial) {
    base[h.dia] = {
      cerrado: h.cerrado,
      abre: h.abre ? h.abre.slice(0, 5) : "",
      cierra: h.cierra ? h.cierra.slice(0, 5) : "",
    };
  }
  return base;
}

type Preset = {
  label: string;
  apply: () => Record<Dia, DiaState>;
};

const PRESETS: Preset[] = [
  {
    label: "Lun-Vie 9-19",
    apply: () => ({
      lunes: { cerrado: false, abre: "09:00", cierra: "19:00" },
      martes: { cerrado: false, abre: "09:00", cierra: "19:00" },
      miercoles: { cerrado: false, abre: "09:00", cierra: "19:00" },
      jueves: { cerrado: false, abre: "09:00", cierra: "19:00" },
      viernes: { cerrado: false, abre: "09:00", cierra: "19:00" },
      sabado: { cerrado: true, abre: "", cierra: "" },
      domingo: { cerrado: true, abre: "", cierra: "" },
    }),
  },
  {
    label: "Lun-Sab 9-19",
    apply: () => ({
      lunes: { cerrado: false, abre: "09:00", cierra: "19:00" },
      martes: { cerrado: false, abre: "09:00", cierra: "19:00" },
      miercoles: { cerrado: false, abre: "09:00", cierra: "19:00" },
      jueves: { cerrado: false, abre: "09:00", cierra: "19:00" },
      viernes: { cerrado: false, abre: "09:00", cierra: "19:00" },
      sabado: { cerrado: false, abre: "09:00", cierra: "19:00" },
      domingo: { cerrado: true, abre: "", cierra: "" },
    }),
  },
  {
    label: "Todos 10-22",
    apply: () => ({
      lunes: { cerrado: false, abre: "10:00", cierra: "22:00" },
      martes: { cerrado: false, abre: "10:00", cierra: "22:00" },
      miercoles: { cerrado: false, abre: "10:00", cierra: "22:00" },
      jueves: { cerrado: false, abre: "10:00", cierra: "22:00" },
      viernes: { cerrado: false, abre: "10:00", cierra: "22:00" },
      sabado: { cerrado: false, abre: "10:00", cierra: "22:00" },
      domingo: { cerrado: false, abre: "10:00", cierra: "22:00" },
    }),
  },
];

export default function ScheduleInput({
  initialHorarios,
}: {
  initialHorarios?: HorarioInicial[];
}) {
  const [estado, setEstado] = useState<Record<Dia, DiaState>>(
    initialHorarios && initialHorarios.length > 0
      ? fromInitial(initialHorarios)
      : ESTADO_DEFAULT,
  );

  function actualizar(dia: Dia, patch: Partial<DiaState>) {
    setEstado((prev) => ({ ...prev, [dia]: { ...prev[dia], ...patch } }));
  }

  function aplicarPreset(p: Preset) {
    setEstado(p.apply());
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => aplicarPreset(p)}
            className="text-[11px] font-semibold rounded-full bg-secondary/70 hover:bg-secondary px-3 py-1.5 transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-secondary/40 divide-y divide-border overflow-hidden">
        {DIAS.map(({ key, label, corto }) => {
          const d = estado[key];
          return (
            <div
              key={key}
              className="grid grid-cols-[64px_1fr_auto] items-center gap-2 px-3 py-2.5"
            >
              <span className="text-[13px] font-semibold">
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{corto}</span>
              </span>

              {d.cerrado ? (
                <span className="text-[12px] text-muted-foreground italic">
                  Cerrado
                </span>
              ) : (
                <div className="flex items-center gap-1.5 text-[13px]">
                  <input
                    type="time"
                    name={`horario_${key}_abre`}
                    value={d.abre}
                    onChange={(e) =>
                      actualizar(key, { abre: e.target.value })
                    }
                    className="bg-white rounded-lg px-2 py-1 border border-border outline-none focus:border-foreground"
                    required={!d.cerrado}
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="time"
                    name={`horario_${key}_cierra`}
                    value={d.cierra}
                    onChange={(e) =>
                      actualizar(key, { cierra: e.target.value })
                    }
                    className="bg-white rounded-lg px-2 py-1 border border-border outline-none focus:border-foreground"
                    required={!d.cerrado}
                  />
                </div>
              )}

              <label className="flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  name={`horario_${key}_cerrado`}
                  checked={d.cerrado}
                  onChange={(e) =>
                    actualizar(key, { cerrado: e.target.checked })
                  }
                  className="h-3.5 w-3.5 accent-foreground"
                />
                Cerrado
              </label>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Marca &quot;Cerrado&quot; en los dias que no atiendes. El badge
        &quot;Abierto ahora&quot; se calcula con estos horarios.
      </p>
    </div>
  );
}
