import {
  buildProyeccionSeriesFromBag,
  type YearPoint,
} from "./proyeccion";
import type { ExpedienteBag } from "./expediente";
import type { Evento, TipoEvento } from "./types";

export type { ResultadoFiscalMotor } from "./fiscal/motor";
export { simularMotorEvento } from "./fiscal/motor";

export type ComparadorMetrica = "patrimonio" | "liquidos";

export const COMPARADOR_METRICAS: Array<{
  id: ComparadorMetrica;
  label: string;
  orientativo?: boolean;
}> = [
  { id: "patrimonio", label: "Patrimonio" },
  { id: "liquidos", label: "Líquidos" },
  // «Impacto fiscal de los eventos» retirado del selector hasta acumulación
  // de periodo (V2). La fila fiscal CT2 ya enseña el primer ejercicio.
];

/** Tintas neutras + trazo: con N series el trazo distingue mejor que el tono. */
const ESTILOS_COMPARADOR: Array<{
  color: string;
  dash?: string;
  width: number;
}> = [
  { color: "var(--ink)", width: 2.5 }, // plan base · continuo grueso
  { color: "var(--blue)", width: 2 },
  { color: "var(--ink-3)", dash: "7 4", width: 2 },
  { color: "var(--slate)", dash: "2 3", width: 2 },
  { color: "var(--faint)", dash: "10 3 2 3", width: 2 },
  { color: "var(--faintest)", dash: "4 4", width: 1.75 },
];

export function estiloComparador(
  index: number,
  esPlanBase = false,
): { color: string; dash?: string; width: number } {
  if (esPlanBase) return ESTILOS_COMPARADOR[0]!;
  // index 0-based entre alternativas → estilos 1..N
  const i = (index % (ESTILOS_COMPARADOR.length - 1)) + 1;
  return ESTILOS_COMPARADOR[i]!;
}

/** @deprecated Prefer estiloComparador */
export function colorComparador(index: number): string {
  return estiloComparador(index).color;
}

/**
 * Serie del comparador a partir del bag + eventos del escenario.
 * patrimonio / liquidos reflejan la proyección con eventos aplicados.
 */
export function serieComparador(
  bag: ExpedienteBag,
  eventos: Evento[],
  metrica: ComparadorMetrica,
  opts?: { rentabilidad?: number },
): number[] {
  const points = buildProyeccionSeriesFromBag(bag, eventos, {
    rentabilidad: opts?.rentabilidad,
  });
  if (points.length === 0) return [];
  return metrica === "liquidos"
    ? points.map((p) => p.liquidos)
    : points.map((p) => p.patrimonio);
}

/** @deprecated prefer serieComparador — mantiene YearPoint para compat. */
export function buildEscenarioSeries(
  bag: ExpedienteBag,
  eventos: Evento[],
  opts?: { rentabilidad?: number },
): YearPoint[] {
  return buildProyeccionSeriesFromBag(bag, eventos, opts);
}

export function metricaValue(
  point: YearPoint,
  metrica: ComparadorMetrica,
): number {
  if (metrica === "liquidos") return point.liquidos;
  return point.patrimonio;
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
