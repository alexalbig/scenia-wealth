"use client";

import type { ProyeccionSerieId, YearPoint } from "@/lib/proyeccion";
import {
  displayValue,
  type EuroMode,
} from "@/lib/proyeccion";

interface ProyeccionChartProps {
  points: YearPoint[];
  serie: ProyeccionSerieId;
  mode: EuroMode;
  inflation: number;
  selectedYear: number | null;
  milestoneYears: number[];
  onSelectYear: (year: number) => void;
}

/**
 * Gráfico SVG del mockup `lineChart` — área + línea azul · hitos · clic-en-año.
 */
export function ProyeccionChart({
  points,
  serie,
  mode,
  inflation,
  selectedYear,
  milestoneYears,
  onSelectYear,
}: ProyeccionChartProps) {
  if (points.length === 0) return null;

  const w = 780;
  const h = 240;
  const pad = 34;
  const n = points.length;
  const step = (w - pad - 10) / Math.max(n - 1, 1);

  const values = points.map((p) =>
    displayValue(p, serie, mode, inflation),
  );
  const max = Math.max(...values, 1) * 1.06;
  const min = 0;

  const X = (i: number) => pad + i * step;
  const Y = (v: number) => h - 24 - ((v - min) / (max - min)) * (h - 42);

  const pts = values.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  const selIdx =
    selectedYear == null
      ? -1
      : points.findIndex((p) => p.year === selectedYear);
  const milestoneSet = new Set(milestoneYears);

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Proyección año a año"
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

      {points.map((p, i) =>
        i % 5 === 0 ? (
          <text
            key={`yl-${p.year}`}
            x={X(i)}
            y={h - 8}
            textAnchor="middle"
            fontSize={9}
            fill="var(--mute)"
          >
            {p.year}
          </text>
        ) : null,
      )}

      <polygon
        points={`${pad},${h - 24} ${pts} ${X(n - 1)},${h - 24}`}
        fill="var(--blue)"
        opacity={0.08}
      />
      <polyline
        points={pts}
        fill="none"
        stroke="var(--blue)"
        strokeWidth={2}
      />

      {points.map((p, i) => {
        if (!milestoneSet.has(p.year)) return null;
        return (
          <circle
            key={`m-${p.year}`}
            cx={X(i)}
            cy={h - 24}
            r={3.5}
            fill="var(--paper)"
            stroke="var(--ink-3)"
            strokeWidth={2}
          />
        );
      })}

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
            {selectedYear}
          </text>
        </>
      )}

      {points.map((p, i) => (
        <rect
          key={p.year}
          x={X(i) - step / 2}
          y={0}
          width={step}
          height={h}
          fill="transparent"
          style={{ cursor: "pointer" }}
          onClick={() => onSelectYear(p.year)}
        >
          <title>{String(p.year)}</title>
        </rect>
      ))}
    </svg>
  );
}
