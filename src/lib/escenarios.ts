import { buildProyeccionSeries, type YearPoint } from "./proyeccion";
import { ids } from "./seed";
import type { TipoEvento } from "./types";

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
 * Serie del comparador — trayectoria del mockup `serieEscenario`.
 * Cifras fiscales A/B ancladas al seed. Otros escenarios: arrastre desde impuestosPeriodo del bag.
 */
export function serieComparador(
  clienteId: string,
  escenarioId: string,
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

  const isA = escenarioId === ids.escA;
  const isB = escenarioId === ids.escB;
  const extraPeriodo =
    !isA && !isB && !opts?.esPlanBase ? (opts?.impuestosPeriodo ?? 0) : 0;

  if (metrica === "irpf_acumulado") {
    let acc = 0;
    return base.map((p) => {
      const extra =
        isA && p.year >= 2026 && p.year <= 2031
          ? 14_200 / 6
          : isB && p.year >= 2026 && p.year <= 2033
            ? 9_800 / 8
            : extraPeriodo > 0 && p.year >= 2026 && p.year <= 2031
              ? extraPeriodo / 6
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
      isA && p.year >= 2026 && p.year <= 2031
        ? 35_000 + 14_200 / 6
        : isB && p.year >= 2026 && p.year <= 2031
          ? 35_000 + 9_800 / 8
          : extraPeriodo > 0 && p.year >= 2026 && p.year <= 2031
            ? 20_000 + extraPeriodo / 6
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

/** Resultado fiscal mock del motor para CT1 — solo cifras seed o 0 / hueco. */
export type ResultadoFiscalMotor =
  | { kind: "calculado"; importe: number; regla: string; nota: string }
  | { kind: "neutro"; importe: 0; regla: string; nota: string }
  | { kind: "sin_calculo"; nota: string }
  | { kind: "pendiente_is"; nota: string };

export function simularMotorEvento(
  tipo: TipoEvento,
  _campos: Record<string, string | number | boolean>,
): ResultadoFiscalMotor {
  switch (tipo) {
    case "reembolsar_fondo":
      return {
        kind: "calculado",
        importe: 2_400,
        regla: "FIFO → base del ahorro",
        nota: "Plusvalía estimada (FIFO) → base del ahorro · cuota ≈ 2.400 €/año · orientativo",
      };
    case "traspasar_fondo":
      return {
        kind: "neutro",
        importe: 0,
        regla: "Art. 94",
        nota: "Neutro (Art. 94) · cuota 0 € · el destino hereda valor y fecha · orientativo",
      };
    case "pignorar":
      return {
        kind: "neutro",
        importe: 0,
        regla: "Regla ④",
        nota: "No realiza plusvalía · cuota 0 € · coste financiero según entidad · orientativo",
      };
    case "rescatar_plan":
      return {
        kind: "calculado",
        importe: 5_600,
        regla: "Base general",
        nota: "Base general · se apila sobre los ingresos del año · cuota ≈ 5.600 €/año · orientativo",
      };
    case "amortizar_hipoteca":
      return {
        kind: "sin_calculo",
        nota: "Regla ③ · la comparación amortizar vs invertir se muestra en el comparador, sin coronar ganador · orientativo",
      };
    case "vender_inmueble":
      return {
        kind: "sin_calculo",
        nota: "Regla ⑤ · exención por reinversión >65 (a verificar) · sin cifra inventada",
      };
    case "aportar_fondo":
    case "comprar_inmueble":
      return {
        kind: "neutro",
        importe: 0,
        regla: "Sin peaje IRPF",
        nota: "Sin consecuencia fiscal inmediata en IRPF · orientativo",
      };
    case "repartir_dividendo":
    case "vender_participacion":
      return {
        kind: "pendiente_is",
        nota: "Liquidador de Impuesto de Sociedades · pendiente de definir. No se inventan cifras.",
      };
    case "aportar_plan":
      return {
        kind: "sin_calculo",
        nota: "Fuera de las 5 reglas · genérico sin cálculo (candidata a regla ⑥ en V2)",
      };
    case "jubilarse":
    case "generico":
    default:
      return {
        kind: "sin_calculo",
        nota: "Sin cálculo fiscal del motor. Si hay impacto tecleado, queda marcado como introducido por el asesor.",
      };
  }
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
