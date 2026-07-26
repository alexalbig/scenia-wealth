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

/**
 * Serie del comparador por escenario.
 * Cifras fiscales ancladas al seed (A ≈ 14.200 · B ≈ 9.800). No inventar.
 */
export function buildEscenarioSeries(
  clienteId: string,
  escenarioId: string,
): YearPoint[] {
  const base = buildProyeccionSeries(clienteId);
  if (base.length === 0) return [];

  if (escenarioId === ids.escBase || escenarioId.endsWith("-base") || escenarioId.includes("base")) {
    // Plan base / clones sin peaje fiscal extra
    if (escenarioId === ids.escBase) return base.map((p) => ({ ...p }));
  }

  if (escenarioId === ids.escA) {
    return base.map((p) => {
      if (p.year < 2026) return { ...p };
      const irpfExtra = p.year === 2026 ? 14_200 : 0;
      // Tras reembolso: líquidos bajan (realiza Fondo A), patrimonio neto similar
      const liquidos =
        p.year >= 2026 ? Math.max(0, p.liquidos - 300_000 + (p.year - 2026) * 8_000) : p.liquidos;
      return {
        ...p,
        irpf: p.year === 2026 ? irpfExtra : p.irpf,
        liquidos: Math.round(liquidos),
        patrimonio: Math.round(p.patrimonio - (p.year >= 2026 ? 12_000 : 0)),
      };
    });
  }

  if (escenarioId === ids.escB) {
    return base.map((p) => {
      if (p.year < 2026) return { ...p };
      const irpf = p.year === 2026 ? 9_800 : p.irpf;
      // Traspaso neutro: líquidos se mantienen; rescate reduce plan (no líquido)
      return {
        ...p,
        irpf,
        patrimonio: Math.round(p.patrimonio - (p.year >= 2026 ? 4_000 : 0)),
      };
    });
  }

  // Clones / escenarios nuevos: misma trayectoria que el plan base (sin cifra fiscal inventada)
  return base.map((p) => ({ ...p }));
}

export function metricaValue(
  point: YearPoint,
  metrica: ComparadorMetrica,
  series: YearPoint[],
): number {
  if (metrica === "patrimonio") return point.patrimonio;
  if (metrica === "liquidos") return point.liquidos;
  // IRPF acumulado desde el primer año de la serie
  const idx = series.findIndex((p) => p.year === point.year);
  return series
    .slice(0, idx + 1)
    .reduce((s, p) => s + p.irpf, 0);
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
        importe: 14_200,
        regla: "Regla ①",
        nota: "Plusvalía a base del ahorro (FIFO básico) · cifra seed del mockup · orientativo",
      };
    case "traspasar_fondo":
      return {
        kind: "neutro",
        importe: 0,
        regla: "Regla ① · Art. 94",
        nota: "Traspaso neutro: el destino hereda valor y fecha · orientativo",
      };
    case "pignorar":
      return {
        kind: "neutro",
        importe: 0,
        regla: "Regla ④",
        nota: "No realiza plusvalía · cuota 0 · solo coste financiero · orientativo",
      };
    case "rescatar_plan":
      return {
        kind: "calculado",
        importe: 9_800,
        regla: "Regla ②",
        nota: "Base general apilada sobre ingresos del año · cifra seed · orientativo",
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
    case "otro":
      return all.filter((e) => e.tipo === "generico");
    case "ingreso":
    case "gasto":
      return all.filter((e) => e.tipo === "generico");
    default:
      return all;
  }
}
