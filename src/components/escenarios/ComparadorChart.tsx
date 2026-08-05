"use client";

import {
  COMPARADOR_HORIZONTE,
  COMPARADOR_METRICAS,
  estiloComparador,
  type ComparadorMetrica,
  type HitoComparador,
} from "@/lib/escenarios";
import { formatEUR } from "@/lib/format";
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
  onMetricaChange: (m: ComparadorMetrica) => void;
  onModeChange: (m: EuroMode) => void;
  hitos: HitoComparador[];
}

/**
 * Curva del comparador · SVG de la referencia + clic-en-año + hitos.
 * Impuesto acumulado: línea escalonada (un escalón por año activo).
 */
export function ComparadorChart({
  series,
  metrica,
  mode,
  inflation,
  selectedYear,
  onSelectYear,
  onMetricaChange,
  onModeChange,
  hitos,
}: ComparadorChartProps) {
  const years = series[0]?.years ?? [];
  if (years.length === 0 || series.length === 0) {
    return (
      <div className="chartcard">
        <div className="empty" style={{ padding: 24 }}>
          Selecciona al menos un escenario para comparar.
        </div>
      </div>
    );
  }

  const W = 1040;
  const H = 300;
  const ml = 70;
  const mr = 18;
  const mt = 40;
  const mb = 30;

  const display = (v: number, year: number) =>
    metrica === "impuesto"
      ? v
      : mode === "hoy"
        ? toEuroHoy(v, year, inflation)
        : v;

  const displaySeries = series.map((s) => ({
    ...s,
    arr: s.values.map((v, i) => display(v, years[i]!)),
  }));

  let mn = Infinity;
  let mx = -Infinity;
  for (const s of displaySeries) {
    for (const v of s.arr) {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
  }
  if (metrica === "impuesto") {
    mn = 0;
    mx = Math.max(mx, 1000) * 1.15;
  } else {
    const pad = (mx - mn) * 0.08 || 1;
    mn -= pad;
    mx += pad;
    if (mn < 0) mn = 0;
  }

  const X = (y: number) =>
    ml +
    ((y - years[0]!) / Math.max(years[years.length - 1]! - years[0]!, 1)) *
      (W - ml - mr);
  const Y = (v: number) => mt + (1 - (v - mn) / (mx - mn || 1)) * (H - mt - mb);

  const fy = (v: number) => {
    if (metrica === "impuesto") return formatEUR(Math.round(v));
    if (Math.abs(v) >= 1_000_000) {
      return `${(v / 1e6).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} M€`;
    }
    return `${Math.round(v / 1000)}k`;
  };

  const ticksY = [0, 1, 2, 3].map((i) => mn + ((mx - mn) * i) / 3);
  const ticksX: number[] = [];
  for (let y = years[0]!; y <= years[years.length - 1]!; y += 4) {
    ticksX.push(y);
  }
  if (ticksX[ticksX.length - 1] !== years[years.length - 1]) {
    ticksX.push(years[years.length - 1]!);
  }

  const legendYear =
    selectedYear ??
    (metrica === "liquidos"
      ? Math.min(2040, COMPARADOR_HORIZONTE)
      : metrica === "impuesto"
        ? COMPARADOR_HORIZONTE
        : COMPARADOR_HORIZONTE);

  let altIndex = 0;
  const styled = displaySeries.map((s) => {
    const st = s.esPlanBase
      ? estiloComparador(0, true)
      : estiloComparador(altIndex++, false);
    return { ...s, st };
  });

  const pathFor = (arr: number[], stepped: boolean) => {
    if (!stepped) {
      return arr
        .map((v, i) => {
          const cmd = i === 0 ? "M" : "L";
          return `${cmd}${X(years[i]!).toFixed(1)} ${Y(v).toFixed(1)}`;
        })
        .join(" ");
    }
    // Escalón: horizontal hasta el siguiente año, luego vertical
    let d = "";
    for (let i = 0; i < arr.length; i++) {
      const x = X(years[i]!);
      const y = Y(arr[i]!);
      if (i === 0) {
        d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        const xPrev = X(years[i - 1]!);
        d += ` L${x.toFixed(1)} ${Y(arr[i - 1]!).toFixed(1)}`;
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
        void xPrev;
      }
    }
    return d;
  };

  const foot =
    metrica === "patrimonio"
      ? "Patrimonio neto proyectado. Las decisiones patrimoniales reordenan el balance más de lo que lo cambian: si las curvas se pegan, mire la tabla."
      : metrica === "liquidos"
        ? "Activos líquidos proyectados. Serie orientativa."
        : "en eventos de varios años se repite la cuota del primer ejercicio · sin acumulación de periodo · orientativo";

  const step = (W - ml - mr) / Math.max(years.length - 1, 1);

  return (
    <div className="chartcard">
      <div className="chart-top">
        <span className="lbl">La curva, como apoyo</span>
        <div className="seg">
          {COMPARADOR_METRICAS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={metrica === m.id ? "on" : undefined}
              onClick={() => onMetricaChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="seg">
          <button
            type="button"
            className={mode === "hoy" ? "on" : undefined}
            onClick={() => onModeChange("hoy")}
          >
            € hoy
          </button>
          <button
            type="button"
            className={mode === "futuro" ? "on" : undefined}
            onClick={() => onModeChange("futuro")}
          >
            € futuro
          </button>
        </div>
        <div className="legend">
          {styled.map((s) => {
            const idx = years.indexOf(legendYear);
            const val = idx >= 0 ? s.arr[idx]! : 0;
            return (
              <span key={s.id} className="li">
                <svg width={26} height={8} aria-hidden>
                  <line
                    x1={1}
                    y1={4}
                    x2={25}
                    y2={4}
                    stroke={s.st.color}
                    strokeWidth={s.st.width}
                    strokeDasharray={s.st.dash}
                  />
                </svg>
                <b>{s.esPlanBase ? "Plan base" : s.nombre}</b>
                <span className="val num">
                  {legendYear}: {formatEUR(Math.round(val))}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Curva comparativa"
      >
        {ticksY.map((v, i) => {
          const y = Y(v);
          return (
            <g key={i}>
              <line
                x1={ml}
                y1={y}
                x2={W - mr}
                y2={y}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={ml - 8}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--mute)"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fy(v)}
              </text>
            </g>
          );
        })}

        {ticksX.map((yr) => (
          <text
            key={yr}
            x={X(yr)}
            y={H - 10}
            textAnchor="middle"
            fontSize={10}
            fill="var(--mute)"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {yr}
          </text>
        ))}

        {hitos.map((h, i) => {
          const x = X(h.year);
          const ly = i % 2 ? 26 : 12;
          return (
            <g key={`${h.year}-${h.label}`}>
              <line
                x1={x}
                y1={mt}
                x2={x}
                y2={H - mb}
                stroke="var(--line-2)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text x={x + 4} y={ly} fontSize={9.5} fill="var(--slate)">
                {h.label}
              </text>
            </g>
          );
        })}

        {styled.map((s) => (
          <path
            key={s.id}
            d={pathFor(s.arr, metrica === "impuesto")}
            fill="none"
            stroke={s.st.color}
            strokeWidth={s.st.width}
            strokeDasharray={s.st.dash}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {selectedYear != null && years.includes(selectedYear) && (
          <line
            x1={X(selectedYear)}
            y1={mt}
            x2={X(selectedYear)}
            y2={H - mb}
            stroke="var(--ink)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        )}

        {years.map((y, i) => (
          <rect
            key={y}
            x={X(y) - step / 2}
            y={0}
            width={step}
            height={H}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectYear(y)}
          >
            <title>{String(y)}</title>
          </rect>
        ))}
      </svg>

      <div className="footnote">{foot}</div>
    </div>
  );
}
