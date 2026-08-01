import { buildProyeccionSeries, type YearPoint } from "./proyeccion";
import type { TipoEvento } from "./types";
import { periodoFilaFiscal } from "./fiscal/rollup";

export type { ResultadoFiscalMotor } from "./fiscal/motor";
export {
  simularMotorEvento,
  simularMotorEventoCampos,
} from "./fiscal/motor";

export type ComparadorMetrica = "patrimonio" | "liquidos" | "irpf_acumulado";

export const COMPARADOR_METRICAS: Array<{
  id: ComparadorMetrica;
  label: string;
  orientativo?: boolean;
}> = [
  { id: "patrimonio", label: "Patrimonio" },
  { id: "liquidos", label: "Líquidos" },
  { id: "irpf_acumulado", label: "IRPF acumulado", orientativo: true },
];

const COLS_COMPARADOR = [
  "var(--ink)",
  "var(--blue)",
  "#8FA0BE",
  "var(--ink-3)",
  "var(--faintest)",
] as const;

export function colorComparador(index: number): string {
  return COLS_COMPARADOR[index % COLS_COMPARADOR.length]!;
}

/**
 * Serie del comparador — arrastre desde impuestosPeriodo del bag (rollup).
 * Ya no ancla cifras a ids de seed.
 */
export function serieComparador(
  clienteId: string,
  _escenarioId: string,
  metrica: ComparadorMetrica,
  opts?: {
    impuestosPeriodo?: number;
    esPlanBase?: boolean;
    patrimonioNeto?: number;
    capacidad?: number;
    completo?: boolean;
  },
): number[] {
  const base = buildProyeccionSeries(clienteId, {
    patrimonioNeto: opts?.patrimonioNeto,
    capacidad: opts?.capacidad,
    completo: opts?.completo,
  });
  if (base.length === 0) return [];

  const { desde, hasta } = periodoFilaFiscal();
  const nYears = Math.max(1, hasta - desde + 1);
  const extraPeriodo = opts?.esPlanBase ? 0 : (opts?.impuestosPeriodo ?? 0);
  const extraAnual = extraPeriodo / nYears;

  if (metrica === "irpf_acumulado") {
    let acc = 0;
    return base.map((p) => {
      const extra =
        !opts?.esPlanBase && p.year >= desde && p.year <= hasta
          ? extraAnual
          : 0;
      acc += p.irpf + extra;
      return acc;
    });
  }

  const baseVals =
    metrica === "liquidos"
      ? base.map((p) => p.liquidos)
      : base.map((p) => p.patrimonio);

  let dragAcc = 0;
  return base.map((p, i) => {
    const drag =
      !opts?.esPlanBase && p.year >= desde && p.year <= Math.min(hasta, 2031)
        ? 20_000 + extraAnual
        : 0;
    dragAcc = dragAcc * 1.03 + drag;
    return Math.max(baseVals[i]! - dragAcc, 0);
  });
}

/** @deprecated prefer serieComparador — mantiene YearPoint para compat. */
export function buildEscenarioSeries(
  clienteId: string,
  escenarioId: string,
): YearPoint[] {
  const base = buildProyeccionSeries(clienteId);
  const pat = serieComparador(clienteId, escenarioId, "patrimonio");
  const liq = serieComparador(clienteId, escenarioId, "liquidos");
  return base.map((p, i) => ({
    ...p,
    patrimonio: Math.round(pat[i] ?? p.patrimonio),
    liquidos: Math.round(liq[i] ?? p.liquidos),
  }));
}

export function metricaValue(
  point: YearPoint,
  metrica: ComparadorMetrica,
  series: YearPoint[],
): number {
  if (metrica === "patrimonio") return point.patrimonio;
  if (metrica === "liquidos") return point.liquidos;
  const idx = series.findIndex((p) => p.year === point.year);
  return series.slice(0, idx + 1).reduce((s, p) => s + p.irpf, 0);
}

export const EVENTOS_COMPLETOS: Array<{
  tipo: TipoEvento;
  label: string;
}> = [
  { tipo: "reembolsar_fondo", label: "Reembolsar fondo" },
  { tipo: "traspasar_fondo", label: "Traspasar fondo" },
  { tipo: "pignorar", label: "Pignorar" },
  { tipo: "aportar_fondo", label: "Aportar a fondo" },
  { tipo: "rescatar_plan", label: "Rescatar plan" },
  { tipo: "amortizar_hipoteca", label: "Amortizar hipoteca" },
  { tipo: "vender_inmueble", label: "Vender inmueble" },
  { tipo: "comprar_inmueble", label: "Comprar inmueble" },
  { tipo: "jubilarse", label: "Jubilarse" },
  { tipo: "repartir_dividendo", label: "Repartir dividendo" },
  { tipo: "vender_participacion", label: "Vender participación" },
  { tipo: "aportar_plan", label: "Aportar a plan de pensiones" },
  { tipo: "generico", label: "Evento genérico" },
];

export function eventosParaContexto(
  contexto:
    | "instrumento"
    | "inmueble"
    | "pasivo"
    | "sociedad"
    | "otro"
    | "persona"
    | "ingreso"
    | "gasto"
    | "completo",
): Array<{ tipo: TipoEvento; label: string }> {
  const all = EVENTOS_COMPLETOS;
  switch (contexto) {
    case "completo":
      return all;
    case "instrumento":
      return all.filter((e) =>
        [
          "reembolsar_fondo",
          "traspasar_fondo",
          "pignorar",
          "aportar_fondo",
          "rescatar_plan",
          "aportar_plan",
        ].includes(e.tipo),
      );
    case "inmueble":
      return all.filter((e) =>
        ["comprar_inmueble", "vender_inmueble", "amortizar_hipoteca"].includes(
          e.tipo,
        ),
      );
    case "pasivo":
      return all.filter((e) =>
        ["amortizar_hipoteca", "generico"].includes(e.tipo),
      );
    case "sociedad":
      return all.filter((e) =>
        ["repartir_dividendo", "vender_participacion"].includes(e.tipo),
      );
    case "persona":
      return all.filter((e) => e.tipo === "jubilarse");
    case "otro":
      return all.filter((e) => e.tipo === "generico");
    case "ingreso":
    case "gasto":
      return all.filter((e) => e.tipo === "generico");
    default:
      return all;
  }
}
