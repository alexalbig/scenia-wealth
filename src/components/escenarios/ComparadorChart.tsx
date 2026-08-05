"use client";

import {
  estiloComparador,
  type ComparadorMetrica,
} from "@/lib/escenarios";
import { toEuroHoy, type EuroMode } from "@/lib/proyeccion";

export interface ComparadorSerieLine {
  id: string;
  nombre: string;
  values: number[];
  years: number[];
  esPlanBase?: boolean;
}

interface ComparadorChartProps {
  series: ComparadorSerieLine[];
  metrica: ComparadorMetrica;
  mode: EuroMode;
  inflation: number;
  selectedYear: number | null;
  onSelectYear: (year: number) => void;
}

/**
 * Gráfico multi-serie del mockup `lineChart` en el comparador.
 */
export function ComparadorChart({
  series,
  metrica,
  mode,
  inflation,
  selectedYear,
  onSelectYear,
}: ComparadorChartProps) {
  void metrica;
  const years = series[0]?.years ?? [];
  if (years.length === 0 || series.length === 0) {
    return (
      <div className="empty" style={{ padding: 24 }}>
        Selecciona al menos un escenario para comparar.
      </div>
    );
  }

  const w = 780;
  const h = 230;
  const pad = 34;
  const n = years.length;
  const step = (w - pad - 10) / Math.max(n - 1, 1);

  const display = (v: number, year: number) =>
    mode === "hoy" ? toEuroHoy(v, year, inflation) : v;

  const allVals = series.flatMap((s) =>
    s.values.map((v, i) => display(v, years[i]!)),
  );
  const max = Math.max(...allVals, 1) * 1.06;
  const min = 0;

  const X = (i: number) => pad + i * step;
  const Y = (v: number) => h - 24 - ((v - min) / (max - min)) * (h - 42);

  const selIdx =
    selectedYear == null ? -1 : years.findIndex((y) => y === selectedYear);

  // Plan base → estilo 0; alternativas → 0,1,2… sobre la escala desplazada
  let altIndex = 0;

  return (
    <>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${w} ${h}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Comparador de escenarios"
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

        {years.map((y, i) =>
          i % 5 === 0 ? (
            <text
              key={y}
              x={X(i)}
              y={h - 8}
              textAnchor="middle"
              fontSize={9}
              fill="var(--mute)"
            >
              {y}
            </text>
          ) : null,
        )}

        {series.map((s) => {
          const estilo = s.esPlanBase
            ? estiloComparador(0, true)
            : estiloComparador(altIndex++, false);
          const pts = s.values
            .map((v, i) => `${X(i)},${Y(display(v, years[i]!))}`)
            .join(" ");
          return (
            <polyline
              key={s.id}
              points={pts}
              fill="none"
              stroke={estilo.color}
              strokeWidth={estilo.width}
              strokeDasharray={estilo.dash}
              strokeLinecap="round"
              strokeLinejoin="round"
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

        {years.map((y, i) => (
          <rect
            key={y}
            x={X(i) - step / 2}
            y={0}
            width={step}
            height={h}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectYear(y)}
          >
            <title>{String(y)}</title>
          </rect>
        ))}
      </svg>

      <div className="legend">
        {(() => {
          let ai = 0;
          return series.map((s) => {
            const estilo = s.esPlanBase
              ? estiloComparador(0, true)
              : estiloComparador(ai++, false);
            return (
              <span
                key={s.id}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <svg width={22} height={8} aria-hidden>
                  <line
                    x1={0}
                    y1={4}
                    x2={22}
                    y2={4}
                    stroke={estilo.color}
                    strokeWidth={estilo.width}
                    strokeDasharray={estilo.dash}
                  />
                </svg>
                {s.nombre}
                {s.esPlanBase ? " · plan base" : ""}
              </span>
            );
          });
        })()}
        <span style={{ marginLeft: "auto" }} className="tiny">
          Pincha para fijar un año
        </span>
      </div>
    </>
  );
}
