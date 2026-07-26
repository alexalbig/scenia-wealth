"use client";

import { cn } from "@/lib/cn";
import { formatEUR } from "@/lib/format";
import {
  metricaValue,
  type ComparadorMetrica,
} from "@/lib/escenarios";
import type { YearPoint } from "@/lib/proyeccion";
import { displayValue, type EuroMode } from "@/lib/proyeccion";

const COLORS = ["#3A5BC8", "#0C1424", "#6E7A92", "#D14A38"] as const;

interface SeriesLine {
  id: string;
  nombre: string;
  points: YearPoint[];
}

interface ComparadorChartProps {
  series: SeriesLine[];
  metrica: ComparadorMetrica;
  mode: EuroMode;
  inflation: number;
  selectedYear: number | null;
  onSelectYear: (year: number) => void;
}

const W = 640;
const H = 260;
const PAD = { top: 16, right: 12, bottom: 36, left: 56 };

export function ComparadorChart({
  series,
  metrica,
  mode,
  inflation,
  selectedYear,
  onSelectYear,
}: ComparadorChartProps) {
  const years =
    series[0]?.points.map((p) => p.year) ?? [];
  if (years.length === 0 || series.length === 0) {
    return (
      <p className="px-3 py-8 text-center text-[12px] text-mute">
        Selecciona al menos un escenario para comparar.
      </p>
    );
  }

  const valueAt = (line: SeriesLine, year: number) => {
    const pt = line.points.find((p) => p.year === year);
    if (!pt) return 0;
    if (metrica === "irpf_acumulado") {
      return metricaValue(pt, metrica, line.points);
    }
    // patrimonio / liquidos respetan €hoy/€futuro
    if (metrica === "patrimonio") {
      return displayValue(pt, "patrimonio", mode, inflation);
    }
    return displayValue(pt, "liquidos", mode, inflation);
  };

  const allValues = series.flatMap((line) =>
    years.map((y) => valueAt(line, y)),
  );
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const span = Math.max(maxV - minV, 1);
  const yMin = minV - span * 0.08;
  const yMax = maxV + span * 0.12;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const xAt = (i: number) =>
    PAD.left + (years.length === 1 ? innerW / 2 : (i / (years.length - 1)) * innerW);
  const yAt = (v: number) =>
    PAD.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  const ticks = [0, 0.33, 0.66, 1].map((t) => yMin + (yMax - yMin) * t);
  const yearLabels = years.filter((_, i) => {
    if (i === 0 || i === years.length - 1) return true;
    return years[i]! % 3 === 0;
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Comparador de escenarios"
      >
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={yAt(v) + 3}
              textAnchor="end"
              className="fill-mute"
              style={{ fontSize: 9 }}
            >
              {formatEUR(v)}
            </text>
          </g>
        ))}

        {series.map((line, si) => {
          const color = COLORS[si % COLORS.length]!;
          const d = years
            .map((year, i) => {
              const x = xAt(i);
              const y = yAt(valueAt(line, year));
              return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <path
              key={line.id}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={2}
            />
          );
        })}

        {years.map((year, i) => {
          const active = year === selectedYear;
          return (
            <g key={year}>
              <rect
                x={xAt(i) - 8}
                y={PAD.top}
                width={16}
                height={innerH}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onSelectYear(year)}
              />
              {active && (
                <line
                  x1={xAt(i)}
                  x2={xAt(i)}
                  y1={PAD.top}
                  y2={PAD.top + innerH}
                  stroke="var(--blue)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}
              {series.map((line, si) => (
                <circle
                  key={`${line.id}-${year}`}
                  cx={xAt(i)}
                  cy={yAt(valueAt(line, year))}
                  r={active ? 4 : 2.5}
                  fill={COLORS[si % COLORS.length]}
                  className="cursor-pointer"
                  onClick={() => onSelectYear(year)}
                />
              ))}
            </g>
          );
        })}

        {yearLabels.map((year) => {
          const i = years.indexOf(year);
          return (
            <text
              key={year}
              x={xAt(i)}
              y={H - 12}
              textAnchor="middle"
              className={cn(
                year === selectedYear ? "fill-blue font-semibold" : "fill-mute",
              )}
              style={{ fontSize: 9 }}
            >
              {year}
            </text>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap gap-3 px-1">
        {series.map((line, si) => (
          <span
            key={line.id}
            className="inline-flex items-center gap-1.5 text-[11px] text-ink-3"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: COLORS[si % COLORS.length] }}
            />
            {line.nombre}
          </span>
        ))}
        {metrica === "irpf_acumulado" && (
          <span className="text-[10.5px] uppercase tracking-[0.06em] text-mute">
            orientativo
          </span>
        )}
      </div>
    </div>
  );
}
