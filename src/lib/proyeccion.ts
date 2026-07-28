/**
 * Series de proyección del plan base — cifras del mockup `seriesBase`.
 * Horizonte 2026–2060. IRPF siempre orientativo.
 */

import { getCliente, ids } from "./seed";

/** Año de referencia "hoy" del mockup. */
export const PROYECCION_BASE_YEAR = 2026;
export const PROYECCION_START_YEAR = 2026;
export const PROYECCION_END_YEAR = 2060;

export type ProyeccionSerieId =
  | "patrimonio"
  | "flujos"
  | "ahorro"
  | "liquidos"
  | "irpf";

export const PROYECCION_SERIES: Array<{
  id: ProyeccionSerieId;
  label: string;
  /** Serie fiscal — siempre acompañada de "orientativo" en UI */
  orientativo?: boolean;
}> = [
  { id: "patrimonio", label: "Patrimonio" },
  { id: "flujos", label: "Flujos" },
  { id: "ahorro", label: "Ahorro" },
  { id: "liquidos", label: "Activos líquidos" },
  { id: "irpf", label: "IRPF proyectado", orientativo: true },
];

export type EuroMode = "hoy" | "futuro";

export interface YearPoint {
  year: number;
  patrimonio: number;
  flujos: number;
  ahorro: number;
  liquidos: number;
  /** IRPF del ejercicio — cifra fija del mockup, orientativa */
  irpf: number;
}

/**
 * Serie determinista 2026–2060 (mockup seriesBase) para García-Llorente.
 * Otros expedientes completos: trayectoria desde neto + capacidad (IRPF = 0 · sin inventar).
 */
export function buildProyeccionSeries(
  clienteId: string,
  opts?: { patrimonioNeto?: number; capacidad?: number; completo?: boolean },
): YearPoint[] {
  const cliente = getCliente(clienteId);
  const isGL =
    !!cliente?.completo && clienteId === ids.clienteGarciaLlorente;

  if (isGL) {
    return buildGarciaLlorenteSeries();
  }

  const completo = opts?.completo ?? cliente?.completo ?? false;
  if (!completo && opts?.patrimonioNeto == null) return [];

  return buildSeriesFromNeto(
    opts?.patrimonioNeto ?? cliente?.patrimonioNeto ?? 0,
    opts?.capacidad ?? 0,
  );
}

function buildGarciaLlorenteSeries(): YearPoint[] {
  const points: YearPoint[] = [];
  let p = 705_000;
  let l = 300_000;

  for (let year = PROYECCION_START_YEAR; year <= PROYECCION_END_YEAR; year++) {
    const ahorro = year < 2033 ? 69_000 : year < 2036 ? 30_000 : 18_000;
    const irpf =
      (year < 2033 ? 27_500 : 6_500) + (year < 2036 ? 5_900 : 1_800);

    points.push({
      year,
      patrimonio: Math.round(p),
      liquidos: Math.round(l),
      ahorro,
      flujos: ahorro,
      irpf,
    });

    p = p * 1.03 + ahorro;
    l = l * 1.04 + ahorro * 0.9;
  }

  return points;
}

/** Trayectoria patrimonial genérica · IRPF 0 (hueco — no inventar fiscal). */
export function buildSeriesFromNeto(
  patrimonioNeto: number,
  capacidad: number,
): YearPoint[] {
  const points: YearPoint[] = [];
  let p = Math.max(patrimonioNeto, 0);
  let l = Math.max(patrimonioNeto * 0.45, 0);
  const ahorroAnual = Math.max(capacidad, 0);

  for (let year = PROYECCION_START_YEAR; year <= PROYECCION_END_YEAR; year++) {
    points.push({
      year,
      patrimonio: Math.round(p),
      liquidos: Math.round(l),
      ahorro: Math.round(ahorroAnual),
      flujos: Math.round(ahorroAnual),
      irpf: 0,
    });
    p = p * 1.03 + ahorroAnual;
    l = l * 1.04 + ahorroAnual * 0.9;
  }

  return points;
}

/** Deflacta a € de hoy (inflación del plan base, mockup 2 %). */
export function toEuroHoy(
  valueFuturo: number,
  year: number,
  inflation = 0.02,
  baseYear = PROYECCION_BASE_YEAR,
): number {
  if (year === baseYear) return valueFuturo;
  const factor = Math.pow(1 + inflation, year - baseYear);
  return Math.round(valueFuturo / factor);
}

export function valueForSerie(
  point: YearPoint,
  serie: ProyeccionSerieId,
): number {
  return point[serie];
}

export function displayValue(
  point: YearPoint,
  serie: ProyeccionSerieId,
  mode: EuroMode,
  inflation = 0.02,
): number {
  const raw = valueForSerie(point, serie);
  if (mode === "futuro") return raw;
  return toEuroHoy(raw, point.year, inflation);
}

export function serieLabel(id: ProyeccionSerieId): string {
  return PROYECCION_SERIES.find((s) => s.id === id)?.label ?? id;
}

export function isSerieOrientativa(id: ProyeccionSerieId): boolean {
  return !!PROYECCION_SERIES.find((s) => s.id === id)?.orientativo;
}
