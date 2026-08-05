import {
  buildProyeccionSeriesFromBag,
  PROYECCION_END_YEAR,
  PROYECCION_START_YEAR,
  type YearPoint,
} from "./proyeccion";
import type { ExpedienteBag } from "./expediente";
import { formatEUR } from "./format";
import type { Escenario, Evento, TipoEvento } from "./types";

export type { ResultadoFiscalMotor } from "./fiscal/motor";
export { simularMotorEvento } from "./fiscal/motor";

/** Horizonte de lectura del comparador (el motor sigue hasta 2060). */
export const COMPARADOR_HORIZONTE = 2050;

export type ComparadorMetrica = "liquidos" | "impuesto" | "patrimonio";

export const COMPARADOR_METRICAS: Array<{
  id: ComparadorMetrica;
  label: string;
  orientativo?: boolean;
}> = [
  { id: "liquidos", label: "Líquidos" },
  { id: "impuesto", label: "Impuesto acumulado", orientativo: true },
  { id: "patrimonio", label: "Patrimonio" },
];

/** Tintas neutras + trazo · referencia comparador-B. Plan base reconocible. */
const ESTILOS_COMPARADOR: Array<{
  color: string;
  dash?: string;
  width: number;
}> = [
  { color: "var(--ink-2)", width: 2.6 }, // plan base · continuo grueso
  { color: "var(--blue)", width: 2 },
  { color: "var(--ink-3)", dash: "7 4", width: 2 },
  { color: "var(--slate)", dash: "2 4", width: 2 },
];

export function estiloComparador(
  index: number,
  esPlanBase = false,
): { color: string; dash?: string; width: number } {
  if (esPlanBase) return ESTILOS_COMPARADOR[0]!;
  const i = (index % (ESTILOS_COMPARADOR.length - 1)) + 1;
  return ESTILOS_COMPARADOR[i]!;
}

/** @deprecated Prefer estiloComparador */
export function colorComparador(index: number): string {
  return estiloComparador(index).color;
}

/**
 * Serie del comparador a partir del bag + eventos del escenario.
 * liquidos / patrimonio / impuestoAcumulado (escalonado por año activo).
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
  return points
    .filter((p) => p.year <= COMPARADOR_HORIZONTE)
    .map((p) => {
      if (metrica === "liquidos") return p.liquidos;
      if (metrica === "impuesto") return p.impuestoAcumulado;
      return p.patrimonio;
    });
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
  if (metrica === "impuesto") return point.impuestoAcumulado;
  return point.patrimonio;
}

/* ── ¿Se sostiene? · hechos objetivos, sin valoración ── */

export interface SostenibilidadCamino {
  /** Primer año con capacidad (ahorro) negativa, si existe. */
  anioCapacidadNegativa: number | null;
  /** Capacidad en ese año (para el texto «−5.340 €/año»). */
  capacidadEnEseAnio: number | null;
  /** Primer año con líquidos brutos ≤ 0, si ocurre. */
  anioAgotamientoLiquidos: number | null;
  /** true si ni agotamiento ni patrimonio ≤ 0 hasta el horizonte de lectura. */
  aguantaHorizonte: boolean;
  /** Texto neutro para la celda. */
  texto: string;
}

/**
 * Deriva la columna «¿se sostiene?» de la serie de proyección.
 * Capacidad = ingresos − gastos + amort (estructural: no incluye el flujo del evento).
 */
export function sostenibilidadDeCamino(
  points: YearPoint[],
  horizonte = COMPARADOR_HORIZONTE,
): SostenibilidadCamino {
  const hasta = points.filter((p) => p.year <= horizonte);
  const neg = hasta.find((p) => p.ahorro < 0);
  const agota = hasta.find((p) => p.liquidosBrutos <= 0);
  const patrimonioRoto = hasta.find((p) => p.patrimonio <= 0);
  const aguantaHorizonte = !agota && !patrimonioRoto;

  let texto: string;
  if (agota) {
    texto = `Los líquidos se agotan en ${agota.year}`;
  } else if (neg) {
    const cap = Math.round(neg.ahorro);
    const capFmt = formatEUR(cap);
    texto = `Consume patrimonio desde ${neg.year} (${capFmt}/año)`;
  } else if (aguantaHorizonte) {
    texto = `Aguanta hasta ${horizonte}`;
  } else {
    texto = `Patrimonio ≤ 0 en ${patrimonioRoto!.year}`;
  }

  return {
    anioCapacidadNegativa: neg?.year ?? null,
    capacidadEnEseAnio: neg ? Math.round(neg.ahorro) : null,
    anioAgotamientoLiquidos: agota?.year ?? null,
    aguantaHorizonte,
    texto,
  };
}

/* ── Hitos sobre el eje temporal ── */

export interface HitoComparador {
  year: number;
  label: string;
}

const HITOS_TIPO: Partial<Record<TipoEvento, string>> = {
  jubilarse: "Jubilación",
  vender_inmueble: "Venta",
  reembolsar_fondo: "Reembolso",
  rescatar_plan: "Rescate",
  pignorar: "Pignoración",
  amortizar_hipoteca: "Amortización",
  comprar_inmueble: "Compra",
  aportar_fondo: "Aportación",
  aportar_plan: "Aportación plan",
};

export function hitosDeCamino(
  eventos: Evento[],
  points: YearPoint[],
  horizonte = COMPARADOR_HORIZONTE,
): HitoComparador[] {
  const out: HitoComparador[] = [];
  const seen = new Set<string>();

  for (const ev of eventos) {
    if (ev.anio > horizonte) continue;
    const base =
      HITOS_TIPO[ev.tipo] ??
      (ev.tipo === "generico" ? ev.etiqueta.slice(0, 24) : "Evento");
    let label = base;
    if (ev.tipo === "jubilarse") {
      const m = ev.etiqueta.match(/Jubilación\s+de\s+(\w+)/i);
      label = m ? `Jubilación ${m[1]}` : `Jubilación ${ev.anio}`;
    } else if (ev.tipo === "vender_inmueble") {
      label = `Venta ${ev.anio}`;
    }
    const id = `${ev.anio}|${label}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ year: ev.anio, label });
  }

  const sost = sostenibilidadDeCamino(points, horizonte);
  if (sost.anioAgotamientoLiquidos != null) {
    const y = sost.anioAgotamientoLiquidos;
    const id = `${y}|agotamiento`;
    if (!seen.has(id)) {
      seen.add(id);
      out.push({ year: y, label: "Agotamiento de líquidos" });
    }
  }

  return out.sort((a, b) => a.year - b.year || a.label.localeCompare(b.label, "es"));
}

/**
 * Primer año con un hecho relevante en los caminos comparados
 * (jubilación, venta, rescate…). Si no hay eventos, punto medio del horizonte.
 */
export function anioFijadoPorDefecto(
  eventosDeCaminos: Evento[][],
  horizonte = COMPARADOR_HORIZONTE,
): number {
  let min: number | null = null;
  for (const evs of eventosDeCaminos) {
    for (const ev of evs) {
      if (ev.anio < PROYECCION_START_YEAR || ev.anio > horizonte) continue;
      // Jubilaciones del plan base cuentan: marcan el momento relevante
      if (min == null || ev.anio < min) min = ev.anio;
    }
  }
  if (min != null) return min;
  return Math.round(
    (PROYECCION_START_YEAR + Math.min(horizonte, COMPARADOR_HORIZONTE)) / 2,
  );
}

/* ── Lectura en hechos · las dos caras siempre · sin coronar ── */

export interface CaminoLectura {
  id: string;
  nombre: string;
  esPlanBase: boolean;
  impuestosPeriodo: number;
  liquidosEnAnio: number;
  patrimonioFinal: number;
  anioFijado: number;
  eventos: Evento[];
  sostenibilidad: SostenibilidadCamino;
}

/**
 * Compone la lectura automática. Siempre las dos caras:
 * «B paga X menos y llega con Y más líquidos; A dispone del dinero tres años antes.»
 * Nunca «B es mejor».
 */
export function lecturaEnHechos(caminos: CaminoLectura[]): string {
  const alts = caminos.filter((c) => !c.esPlanBase);
  if (alts.length === 0) {
    return "Marque escenarios en la lista: la lectura en hechos se escribe sobre lo que está en la comparación.";
  }

  const base = caminos.find((c) => c.esPlanBase);
  const parts: string[] = [];

  for (const a of alts) {
    const cuota = a.impuestosPeriodo;
    const evLabel = resumenEventos(a.eventos);
    let s = `${a.nombre}`;
    if (evLabel) s += ` (${evLabel})`;
    s += ` deja ${formatEUR(cuota)} de cuota orientativa`;
    if (base) {
      const dLiq = a.liquidosEnAnio - base.liquidosEnAnio;
      const dPat = a.patrimonioFinal - base.patrimonioFinal;
      if (dLiq !== 0) {
        s +=
          dLiq > 0
            ? `; llega a ${a.anioFijado} con ${formatEUR(dLiq)} más de líquidos orientativos que el plan base`
            : `; llega a ${a.anioFijado} con ${formatEUR(Math.abs(dLiq))} menos de líquidos orientativos que el plan base`;
      }
      if (dPat !== 0) {
        s +=
          dPat > 0
            ? `; a ${COMPARADOR_HORIZONTE} el patrimonio orientativo es ${formatEUR(dPat)} mayor`
            : `; a ${COMPARADOR_HORIZONTE} el patrimonio orientativo es ${formatEUR(Math.abs(dPat))} menor`;
      }
    }
    s += ".";
    parts.push(s);
  }

  if (alts.length >= 2) {
    const [x, y] = alts;
    const dCuota = Math.abs(x!.impuestosPeriodo - y!.impuestosPeriodo);
    const anioX = primerAnioDecision(x!.eventos);
    const anioY = primerAnioDecision(y!.eventos);
    let pair = `Entre ${x!.nombre} y ${y!.nombre}: ${formatEUR(dCuota)} de diferencia de cuota orientativa`;
    if (anioX != null && anioY != null && anioX !== anioY) {
      const before = anioX < anioY ? x! : y!;
      const after = anioX < anioY ? y! : x!;
      const gap = Math.abs(anioX - anioY);
      pair += ` a cambio de ${gap} año${gap === 1 ? "" : "s"} de disponibilidad (${before.nombre} dispone antes; ${after.nombre}, ${gap} año${gap === 1 ? "" : "s"} más tarde)`;
    }
    pair += ".";
    parts.push(pair);
  }

  // Sostenibilidad: hecho, no veredicto
  const sostTexts = [...new Set(alts.map((a) => a.sostenibilidad.texto))];
  if (sostTexts.length === 1 && base) {
    parts.push(
      `La sostenibilidad no cambia entre los caminos marcados: ${sostTexts[0]!.charAt(0).toLowerCase()}${sostTexts[0]!.slice(1)}.`,
    );
  }

  return parts.join(" ");
}

function resumenEventos(eventos: Evento[]): string {
  const propios = eventos.filter((e) => e.tipo !== "jubilarse");
  if (propios.length === 0) return "";
  return propios
    .map((e) => e.etiqueta)
    .slice(0, 2)
    .join(" · ");
}

function primerAnioDecision(eventos: Evento[]): number | null {
  const propios = eventos.filter((e) => e.tipo !== "jubilarse");
  if (propios.length === 0) return null;
  return Math.min(...propios.map((e) => e.anio));
}

/** Años del eje del gráfico (lectura hasta COMPARADOR_HORIZONTE). */
export function aniosComparador(horizonte = COMPARADOR_HORIZONTE): number[] {
  const out: number[] = [];
  for (let y = PROYECCION_START_YEAR; y <= horizonte; y++) out.push(y);
  return out;
}

export function valorEnAnio(
  points: YearPoint[],
  year: number,
  metrica: ComparadorMetrica,
): number {
  const p = points.find((x) => x.year === year);
  if (!p) return 0;
  return metricaValue(p, metrica);
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

/** Nombre propuesto al duplicar / clonar. */
export function nombrePropuestoCopia(
  origen: Escenario,
  escenarios: Escenario[],
): string {
  const nonBase = escenarios.filter((e) => !e.esPlanBase).length;
  const letter = String.fromCharCode(65 + nonBase);
  if (origen.esPlanBase) {
    return `${letter} · Nuevo escenario`;
  }
  const bare = origen.nombre.replace(/^[A-Z]\s*·\s*/, "");
  return `${letter} · copia de ${bare}`;
}

void PROYECCION_END_YEAR;
