"use client";

import { enEuros, type EurMode, type PuntoSerieIRPF } from "@/lib/fiscal";

/**
 * Serie de IRPF · gráfico SVG del mockup (lineChart) · clic-en-año.
 * Tinta neutra · orientativo.
 */
export function SerieIRPF({
  serie,
  anio,
  onAnio,
  eurMode,
}: {
  serie: PuntoSerieIRPF[];
  anio: number;
  onAnio: (anio: number) => void;
  eurMode: EurMode;
}) {
  if (serie.length === 0) return null;

  const w = 780;
  const h = 170;
  const pad = 34;
  const n = serie.length;
  const step = (w - pad - 10) / Math.max(n - 1, 1);

  const values = serie.map((p, i) =>
    eurMode === "hoy" ? enEuros(p.irpf, p.anio, "hoy") : p.irpf,
  );
  const max = Math.max(...values, 1) * 1.06;
  const min = 0;

  const X = (i: number) => pad + i * step;
  const Y = (v: number) => h - 24 - ((v - min) / (max - min)) * (h - 42);

  const pts = values.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  const selIdx = serie.findIndex((p) => p.anio === anio);

  return (
    <div className="chartbox" style={{ marginTop: 14 }}>
      <div className="lbl" style={{ marginBottom: 8 }}>
        Serie de IRPF proyectado · plan base · orientativo
      </div>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${w} ${h}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Serie de IRPF proyectado"
      >
        {[0, 1, 2, 3].map((k) => {
          const v = min + ((max - min) * k) / 3;
          const y = Y(v);
          return (
            <g key={k}>
              <line
                x1={pad}
                y1={y}
                x2={w - 8}
                y2={y}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={pad - 5}
                y={y + 3}
                textAnchor="end"
                fontSize={9}
                fill="var(--faint)"
              >
                {Math.round(v / 1000)}k
              </text>
            </g>
          );
        })}

        {serie.map((p, i) =>
          i % 5 === 0 ? (
            <text
              key={p.anio}
              x={X(i)}
              y={h - 8}
              textAnchor="middle"
              fontSize={9}
              fill="var(--mute)"
            >
              {p.anio}
            </text>
          ) : null,
        )}

        <polygon
          points={`${pad},${h - 24} ${pts} ${X(n - 1)},${h - 24}`}
          fill="var(--ink-3)"
          opacity={0.08}
        />
        <polyline
          points={pts}
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth={2}
        />

        {selIdx >= 0 && (
          <>
            <line
              x1={X(selIdx)}
              y1={10}
              x2={X(selIdx)}
              y2={h - 24}
              stroke="var(--ink)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <text
              x={X(selIdx)}
              y={9}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill="var(--ink)"
            >
              {anio}
            </text>
          </>
        )}

        {serie.map((p, i) => (
          <rect
            key={p.anio}
            x={X(i) - step / 2}
            y={0}
            width={step}
            height={h}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onClick={() => onAnio(p.anio)}
          >
            <title>{`${p.anio}`}</title>
          </rect>
        ))}
      </svg>
      <div className="tiny">
        Pincha un año para fijarlo · cifras orientativas, parámetros (a
        verificar) hasta validación del fiscalista.
      </div>
    </div>
  );
}
