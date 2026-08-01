/**
 * Series de proyección del plan base — trayectoria patrimonial.
 * Horizonte 2026–2060. IRPF del ejercicio: hueco (0) — no se inventa.
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
  | "liquidos";

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
];

export type EuroMode = "hoy" | "futuro";

export interface YearPoint {
  year: number;
  patrimonio: number;
  flujos: number;
  ahorro: number;
  liquidos: number;
  /**
   * Reservado para arrastre del comparador.
   * Sin liquidador multi-año: siempre 0 (hueco · no inventado).
   */
  irpf: number;
}

/**
 * Serie determinista 2026–2060 (trayectoria patrimonial) para García-Llorente.
 * IRPF = 0 (hueco · no se proyecta fiscal acumulado).
 * Otros expedientes completos: trayectoria desde neto + capacidad.
 */
export function buildProyeccionSeries(
  clienteId: string,
  opts?: { patrimonioNeto?: number; capacidad?: number; completo?: boolean },
): YearPoint[] {
  const cliente = getCliente(clienteId);
  const isGL =
    !!cliente?.completo && clienteId === ids.clienteGarciaLlorente;

  if (isGL) {
    return buildGarciaLlorentePatrimonio();
  }

  const completo = opts?.completo ?? cliente?.completo ?? false;
  if (!completo && opts?.patrimonioNeto == null) return [];

  return buildSeriesFromNeto(
    opts?.patrimonioNeto ?? cliente?.patrimonioNeto ?? 0,
    opts?.capacidad ?? 0,
  );
}

/** Trayectoria patrimonial GL · sin cifras fiscales inventadas. */
function buildGarciaLlorentePatrimonio(): YearPoint[] {
  const points: YearPoint[] = [];
  let p = 790_000;
  let l = 300_000;

  for (let year = PROYECCION_START_YEAR; year <= PROYECCION_END_YEAR; year++) {
    const ahorro = year < 2033 ? 69_000 : year < 2036 ? 30_000 : 18_000;

    points.push({
      year,
      patrimonio: Math.round(p),
      liquidos: Math.round(l),
      ahorro,
      flujos: ahorro,
      irpf: 0,
    });

    p = p * 1.03 + ahorro;
    l = l * 1.04 + ahorro * 0.9;
  }

  return points;
}

/** Trayectoria patrimonial genérica · IRPF 0 (hueco). */
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

export function aniosProyeccion(): number[] {
  const out: number[] = [];
  for (let y = PROYECCION_START_YEAR; y <= PROYECCION_END_YEAR; y++) out.push(y);
  return out;
}

/** Deflacta a € de hoy (inflación del plan base). */
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
