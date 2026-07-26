import { getCliente, getPlanBase, ids } from "./seed";
import { capacidadAhorro, totalesActivos } from "./patrimonio";

/** Año de referencia "hoy" del mockup (datos a fecha García-Llorente). */
export const PROYECCION_BASE_YEAR = 2026;
export const PROYECCION_START_YEAR = 2024;
export const PROYECCION_END_YEAR = 2040;

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
  { id: "liquidos", label: "Líquidos" },
  { id: "irpf", label: "IRPF proyectado", orientativo: true },
];

export type EuroMode = "hoy" | "futuro";

export interface YearPoint {
  year: number;
  /** Patrimonio neto proyectado (€ futuro nominal) */
  patrimonio: number;
  /** Flujo neto anual ≈ capacidad de ahorro (€ futuro) */
  flujos: number;
  /** Capacidad de ahorro del ejercicio (€ futuro) */
  ahorro: number;
  /** Activos líquidos (fondo, no plan) (€ futuro) */
  liquidos: number;
  /** IRPF del ejercicio — cifra fija del mockup, orientativa */
  irpf: number;
}

/**
 * Serie determinista 2024–2040 para García-Llorente.
 * Anclada a patrimonio neto 705k, capacidad ~94.400 €, líquidos Fondo A 300k.
 * IRPF: cifras fijas orientativas del mockup (no motor real).
 */
export function buildProyeccionSeries(clienteId: string): YearPoint[] {
  const cliente = getCliente(clienteId);
  if (!cliente?.completo || clienteId !== ids.clienteGarciaLlorente) {
    return [];
  }

  const plan = getPlanBase(clienteId);
  const r = plan?.rentabilidadEsperada ?? 0.04;
  const totales = totalesActivos(clienteId);
  const cap = capacidadAhorro(clienteId).capacidad;
  const liquidos0 = 300_000; // Fondo A en seed

  const points: YearPoint[] = [];

  // Retroceso suave 2024–2025 (histórico mock) hasta anclar 2026
  const patrimonio2026 = totales.neto;
  const liquidos2026 = liquidos0;

  for (let year = PROYECCION_START_YEAR; year <= PROYECCION_END_YEAR; year++) {
    const t = year - PROYECCION_BASE_YEAR;

    let patrimonio: number;
    let liquidos: number;
    let ahorro: number;
    let flujos: number;
    let irpf: number;

    if (t <= 0) {
      // 2024, 2025, 2026
      const back = -t;
      patrimonio = Math.round(patrimonio2026 / Math.pow(1 + r * 0.55, back));
      liquidos = Math.round(liquidos2026 / Math.pow(1 + r * 0.7, back));
      ahorro = Math.round(cap * (1 - back * 0.02));
      flujos = ahorro;
      // IRPF orientativo fijo del mockup (tramo estable pre-jubilación)
      irpf = [24_800, 25_100, 25_400][year - PROYECCION_START_YEAR] ?? 25_400;
    } else {
      // Proyección hacia delante: capitaliza + aporta ahorro anual
      let pat = patrimonio2026;
      let liq = liquidos2026;
      let a = cap;
      for (let y = 1; y <= t; y++) {
        const yr = PROYECCION_BASE_YEAR + y;
        // A partir de jubilación prevista (2033) el ahorro baja
        if (yr >= 2033) a = Math.round(cap * 0.35);
        else a = cap;
        pat = Math.round(pat * (1 + r) + a);
        liq = Math.round(liq * (1 + r) + Math.round(a * 0.55));
      }
      patrimonio = pat;
      liquidos = liq;
      ahorro = a;
      flujos = a;
      // IRPF orientativo: estable → ligera bajada post-2033 (sin coronar nada)
      if (year < 2033) {
        irpf = Math.round(25_400 + (year - 2026) * 180);
      } else {
        irpf = Math.round(18_200 + (year - 2033) * 90);
      }
    }

    points.push({ year, patrimonio, flujos, ahorro, liquidos, irpf });
  }

  return points;
}

/** Deflacta a € de hoy usando la inflación del plan base. */
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
