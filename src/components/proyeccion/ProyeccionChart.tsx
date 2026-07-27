"use client";

import { cn } from "@/lib/cn";
import { formatEUR } from "@/lib/format";
import type { ProyeccionSerieId, YearPoint } from "@/lib/proyeccion";
import {
  displayValue,
  isSerieOrientativa,
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

const W = 640;
const H = 260;
const PAD = { top: 16, right: 12, bottom: 36, left: 56 };

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

  const values = points.map((p) => displayValue(p, serie, mode, inflation));
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const span = Math.max(maxV - minV, 1);
  const yMin = minV - span * 0.08;
  const yMax = maxV + span * 0.12;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xAt = (i: number) =>
    PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yAt = (v: number) =>
    PAD.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  const lineD = points
    .map((p, i) => {
      const x = xAt(i);
      const y = yAt(values[i]!);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const areaD =
    lineD +
    ` L${xAt(points.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)}` +
    ` L${xAt(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  const ticks = niceTicks(yMin, yMax, 4);
  const milestoneSet = new Set(milestoneYears);
  const orientativo = isSerieOrientativa(serie);
  const selected = points.find((p) => p.year === selectedYear);
  const selectedVal =
    selected != null
      ? displayValue(selected, serie, mode, inflation)
      : null;

  // Etiquetas de año: cada ~3 años + extremos
  const yearLabels = points.filter((_, i) => {
    if (i === 0 || i === points.length - 1) return true;
    return points[i]!.year % 3 === 0;
  });

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          {selected && selectedVal != null ? (
            <>
              <p className="label-upper">{selected.year}</p>
              <p className="text-[20px] font-bold tracking-[-0.01em] tabular-nums text-ink">
                {formatEUR(selectedVal)}
                {orientativo && (
                  <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">
                    orientativo
                  </span>
                )}
              </p>
            </>
          ) : (
            <p className="text-[12px] text-mute">
              Clic en un año del eje para fijarlo
            </p>
          )}
        </div>
        <p className="text-[11px] text-mute">
          {mode === "hoy" ? "€ de hoy" : "€ futuros"}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Proyección año a año"
      >
        {/* Grid horizontal */}
        {ticks.map((t) => {
          const y = yAt(t);
          return (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--line-2)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y + 3}
                textAnchor="end"
                fill="var(--mute)"
                fontSize={9}
                fontFamily="inherit"
              >
                {compactEUR(t)}
              </text>
            </g>
          );
        })}

        {/* Área + línea */}
        <path d={areaD} fill="var(--blue-soft)" opacity={0.85} />
        <path
          d={lineD}
          fill="none"
          stroke="var(--blue)"
          strokeWidth={1.75}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Hitos sobre el eje temporal */}
        {points.map((p, i) => {
          if (!milestoneSet.has(p.year)) return null;
          const x = xAt(i);
          return (
            <g key={`m-${p.year}`}>
              <line
                x1={x}
                x2={x}
                y1={PAD.top}
                y2={PAD.top + innerH}
                stroke="var(--ink-3)"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.45}
              />
              <circle
                cx={x}
                cy={PAD.top + innerH + 14}
                r={3.5}
                fill="var(--ink-3)"
              />
            </g>
          );
        })}

        {/* Puntos clicables */}
        {points.map((p, i) => {
          const x = xAt(i);
          const y = yAt(values[i]!);
          const active = p.year === selectedYear;
          return (
            <g key={p.year}>
              <circle
                cx={x}
                cy={y}
                r={active ? 4.5 : 2.5}
                fill={active ? "var(--blue)" : "var(--paper)"}
                stroke="var(--blue)"
                strokeWidth={1.5}
              />
              {/* Hit area */}
              <rect
                x={x - 10}
                y={PAD.top}
                width={20}
                height={innerH + 28}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onSelectYear(p.year)}
              >
                <title>{`${p.year}: ${formatEUR(values[i]!)}${orientativo ? " · orientativo" : ""}`}</title>
              </rect>
            </g>
          );
        })}

        {/* Etiquetas de año */}
        {yearLabels.map((p) => {
          const i = points.findIndex((x) => x.year === p.year);
          const x = xAt(i);
          const active = p.year === selectedYear;
          const isMilestone = milestoneSet.has(p.year);
          return (
            <text
              key={`yl-${p.year}`}
              x={x}
              y={H - 6}
              textAnchor="middle"
              fill={active ? "var(--blue)" : "var(--mute)"}
              fontSize={9}
              fontWeight={active || isMilestone ? 600 : 400}
              fontFamily="inherit"
              className="cursor-pointer"
              onClick={() => onSelectYear(p.year)}
            >
              {p.year}
            </text>
          );
        })}
      </svg>

      {milestoneYears.length > 0 && (
        <p className="mt-1 text-[10.5px] text-mute">
          <span
            className={cn(
              "mr-1 inline-block h-1.5 w-1.5 rounded-full bg-ink-3 align-middle",
            )}
          />
          Marcas en el eje = hitos / eventos del plan base
        </p>
      )}
    </div>
  );
}

function compactEUR(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M`;
  }
  if (abs >= 1_000) {
    return `${Math.round(n / 1_000).toLocaleString("es-ES")} k`;
  }
  return Math.round(n).toLocaleString("es-ES");
}

function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min;
  if (span <= 0) return [min];
  const step = niceStep(span / count);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.01; v += step) {
    ticks.push(Math.round(v));
  }
  return ticks.length ? ticks : [Math.round(min), Math.round(max)];
}

function niceStep(raw: number): number {
  const exp = Math.floor(Math.log10(raw));
  const f = raw / Math.pow(10, exp);
  let nf: number;
  if (f <= 1.5) nf = 1;
  else if (f <= 3) nf = 2;
  else if (f <= 7) nf = 5;
  else nf = 10;
  return nf * Math.pow(10, exp);
}
