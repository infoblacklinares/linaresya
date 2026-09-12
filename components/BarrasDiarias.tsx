import { diaCorto } from "@/lib/estadisticas";

/**
 * Grafico de barras por dia, en SVG y sin librerias (LY-027).
 *
 * Server Component: no necesita interactividad, solo el `<title>` de cada
 * barra para que se vea el valor al pasar el mouse y para lectores de pantalla.
 */
export default function BarrasDiarias({
  serie,
  etiqueta = "Vistas por dia",
}: {
  serie: Array<{ fecha: string; valor: number }>;
  etiqueta?: string;
}) {
  if (serie.length === 0) return null;

  const W = 600;
  const H = 160;
  const PAD_T = 10;
  const PAD_B = 24;
  const PAD_X = 8;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_T - PAD_B;

  const max = Math.max(1, ...serie.map((s) => s.valor));
  const barW = innerW / serie.length;

  return (
    <div className="rounded-2xl bg-white border border-border p-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-40"
        role="img"
        aria-label={etiqueta}
      >
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={PAD_T + innerH * (1 - t)}
            y2={PAD_T + innerH * (1 - t)}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        ))}
        {serie.map((s, i) => {
          const h = (s.valor / max) * innerH;
          return (
            <g key={s.fecha}>
              <rect
                x={PAD_X + i * barW + barW * 0.1}
                y={PAD_T + (innerH - h)}
                width={barW * 0.8}
                height={h}
                rx={2}
                className="fill-foreground"
                opacity={s.valor > 0 ? 1 : 0.15}
              />
              <title>
                {diaCorto(s.fecha)}: {s.valor}
              </title>
            </g>
          );
        })}
        <text
          x={PAD_X + barW / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={11}
        >
          {diaCorto(serie[0].fecha)}
        </text>
        <text
          x={W - PAD_X - barW / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={11}
        >
          {diaCorto(serie[serie.length - 1].fecha)}
        </text>
        <text x={PAD_X + 2} y={PAD_T + 10} className="fill-muted-foreground" fontSize={10}>
          max {max}
        </text>
      </svg>
    </div>
  );
}
