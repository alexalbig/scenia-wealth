/**
 * Series de proyección · trayectoria patrimonial con eventos del escenario.
 * Horizonte 2026–2060. Sin proyección fiscal acumulada (hueco · no inventado).
 */

import { parsePensionJubilacion } from "./fiscal/contexto";
import type { ExpedienteBag } from "./expediente";
import type { Evento, Instrumento } from "./types";

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
  /** Activos líquidos recortados a ≥ 0 — serie del gráfico. */
  liquidos: number;
  /**
   * Activos líquidos sin recortar. Puede ser negativo: sirve para detectar
   * agotamiento (la serie del gráfico aplana en 0 y lo ocultaría).
   */
  liquidosBrutos: number;
  /**
   * Suma de cuotas fiscales descontadas del efectivo en este año
   * (cuota del primer ejercicio repetida en cada año activo del evento).
   */
  impuestoAnual: number;
  /** Corriente acumulada de impuestoAnual desde el inicio del horizonte. */
  impuestoAcumulado: number;
  /**
   * @deprecated Alias de impuestoAcumulado — mantenido para compat.
   */
  irpf: number;
}

/** Clasifica un evento genérico · campo de modelo; fallback legacy en notas/etiqueta. */
export function parseGenericoKind(
  ev: Evento,
): "ingreso" | "gasto" | "movimiento" {
  if (ev.tipoGenerico) return ev.tipoGenerico;
  const notas = (ev.notas ?? "").toLowerCase();
  const m = notas.match(/gen[eé]rico\s*·\s*(ingreso|gasto|movimiento)/i);
  if (m) {
    const k = m[1]!.toLowerCase();
    if (k === "gasto") return "gasto";
    if (k === "movimiento") return "movimiento";
    return "ingreso";
  }
  const etiqueta = ev.etiqueta.toLowerCase();
  if (/\bgasto\b/.test(etiqueta)) return "gasto";
  if (/\bmovimiento\b/.test(etiqueta)) return "movimiento";
  return "ingreso";
}

/**
 * Importe económico del evento.
 * Preferencia: campo `importe` del modelo; fallback parseo de etiqueta (bags antiguos).
 */
export function importeEvento(ev: Evento): number | null {
  if (ev.importe != null && Number.isFinite(ev.importe) && ev.importe >= 0) {
    return ev.importe;
  }
  return parseImporteFromText(ev.etiqueta, ev.notas);
}

/** @deprecated Prefer importeEvento — alias de compatibilidad. */
export function parseImporteEvento(ev: Evento): number | null {
  return importeEvento(ev);
}

function parseImporteFromText(
  etiqueta: string,
  notas?: string,
): number | null {
  const fuentes = [etiqueta, notas ?? ""];
  for (const text of fuentes) {
    const matches = [...text.matchAll(/([\d.\u00a0\s]+(?:,\d+)?)\s*€/g)];
    if (matches.length === 0) continue;
    const raw = matches[matches.length - 1]![1]!.replace(/[\s\u00a0]/g, "");
    const n = raw.includes(",")
      ? Number(raw.replace(/\./g, "").replace(",", "."))
      : Number(raw.replace(/\./g, ""));
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

function isLiquidInstrument(i: Instrumento): boolean {
  return i.tipoFiscal === "fondo" || i.tipoFiscal === "accion";
}

function isPlan(i: Instrumento): boolean {
  return i.tipoFiscal === "plan_pensiones";
}

function eventActiveInYear(ev: Evento, year: number): boolean {
  const hasta = ev.hastaAnio ?? ev.anio;
  return year >= ev.anio && year <= hasta;
}

interface ProjState {
  efectivo: number;
  /**
   * Liquidez de pignoración: entra al patrimonio neto = 0 (hay pasivo espejo)
   * y NO capitaliza — evita el almuerzo gratis (efectivo al 4 % / deuda al 0 %).
   * El coste financiero de la entidad no está en el modelo: lo explica el asesor.
   */
  liquidezPignorada: number;
  fondos: Map<string, number>;
  planes: Map<string, number>;
  inmuebles: Map<string, number>;
  otros: Map<string, number>;
  pasivos: Map<string, number>;
  /** personaId → pensión anual tras jubilarse (sustituye trabajo) */
  pensionByPersona: Map<string, number>;
  /** personaIds already retired */
  jubilados: Set<string>;
  /** inmuebles vendidos */
  vendidos: Set<string>;
  /** gastos anuales vivos (se reducen al vender inmueble con intereses) */
  gastosAnuales: number;
  /** intereses por inmuebleId (para quitar al vender) */
  interesesPorInmueble: Map<string, number>;
  pasivoByInmueble: Map<string, string>;
}

/** Líquidos sin recortar — puede ser negativo. */
function liquidosBrutosOf(s: ProjState): number {
  let fondos = 0;
  for (const v of s.fondos.values()) fondos += v;
  return s.efectivo + s.liquidezPignorada + fondos;
}

function liquidosOf(s: ProjState): number {
  return Math.max(0, liquidosBrutosOf(s));
}

function activosOf(s: ProjState): number {
  let planes = 0;
  for (const v of s.planes.values()) planes += v;
  let inm = 0;
  for (const v of s.inmuebles.values()) inm += v;
  let otros = 0;
  for (const v of s.otros.values()) otros += v;
  // Patrimonio usa el bruto: un déficit de liquidez no se esconde en el neto.
  return liquidosBrutosOf(s) + planes + inm + otros;
}

function pasivosOf(s: ProjState): number {
  let p = 0;
  for (const v of s.pasivos.values()) p += v;
  return p;
}

function patrimonioOf(s: ProjState): number {
  return activosOf(s) - pasivosOf(s);
}

function ingresosAnuales(
  bag: ExpedienteBag,
  s: ProjState,
): number {
  let total = 0;
  for (const ing of bag.ingresos) {
    // Jubilarse sustituye el sueldo; el resto de fuentes sigue.
    if (s.jubilados.has(ing.personaId) && ing.fuente === "trabajo") continue;
    total += ing.importeAnual;
  }
  for (const [personaId, pension] of s.pensionByPersona) {
    if (s.jubilados.has(personaId)) total += pension;
  }
  return total;
}

function cuotaFiscalEvento(ev: Evento): number {
  const c = ev.cuotaAnual ?? ev.impuestosPeriodo ?? 0;
  return c > 0 ? c : 0;
}

/**
 * Aplica el evento al estado y devuelve la cuota fiscal descontada este año
 * (0 si el evento no está activo o no tiene cuota).
 */
function applyEvent(s: ProjState, ev: Evento, year: number): number {
  if (!eventActiveInYear(ev, year)) return 0;
  const importe = importeEvento(ev);

  switch (ev.tipo) {
    case "vender_inmueble": {
      if (year !== ev.anio) return 0;
      const id = ev.targetId;
      if (!id || s.vendidos.has(id)) return 0;
      const venta = importe ?? s.inmuebles.get(id) ?? 0;
      s.inmuebles.delete(id);
      s.vendidos.add(id);
      const pasivoId = s.pasivoByInmueble.get(id);
      let deuda = 0;
      if (pasivoId) {
        deuda = s.pasivos.get(pasivoId) ?? 0;
        s.pasivos.delete(pasivoId);
        s.pasivoByInmueble.delete(id);
      }
      const intereses = s.interesesPorInmueble.get(id) ?? 0;
      if (intereses > 0) {
        s.gastosAnuales = Math.max(0, s.gastosAnuales - intereses);
        s.interesesPorInmueble.delete(id);
      }
      // Importe neto a líquidos; patrimonio ≈ invariante si venta ≈ libro.
      s.efectivo += venta - deuda;
      break;
    }
    case "reembolsar_fondo": {
      const id = ev.targetId;
      const amount = importe ?? 0;
      if (!id || amount <= 0) return 0;
      const cur = s.fondos.get(id) ?? 0;
      const take = Math.min(cur, amount);
      s.fondos.set(id, cur - take);
      s.efectivo += take;
      break;
    }
    case "pignorar": {
      if (year !== ev.anio) return 0;
      const amount = importe ?? 0;
      if (amount <= 0) return 0;
      // Liquidez prestada (no capitaliza) + pasivo espejo → patrimonio neto 0.
      s.liquidezPignorada += amount;
      const pid = `pignoracion-${ev.id}`;
      s.pasivos.set(pid, (s.pasivos.get(pid) ?? 0) + amount);
      break;
    }
    case "rescatar_plan": {
      const id = ev.targetId;
      const amount = importe ?? 0;
      if (!id || amount <= 0) return 0;
      const cur = s.planes.get(id) ?? 0;
      const take = Math.min(cur, amount);
      s.planes.set(id, cur - take);
      s.efectivo += take;
      break;
    }
    case "amortizar_hipoteca": {
      if (year !== ev.anio) return 0;
      const amount = importe ?? 0;
      if (amount <= 0) return 0;
      const target =
        (ev.targetId && s.pasivos.has(ev.targetId)
          ? ev.targetId
          : [...s.pasivos.keys()][0]) ?? null;
      if (!target) return 0;
      const cur = s.pasivos.get(target) ?? 0;
      const pay = Math.min(cur, amount, Math.max(0, s.efectivo));
      s.pasivos.set(target, cur - pay);
      s.efectivo -= pay;
      if ((s.pasivos.get(target) ?? 0) <= 0) s.pasivos.delete(target);
      break;
    }
    case "jubilarse": {
      if (year !== ev.anio) return 0;
      const personaId = ev.targetId;
      if (!personaId) return 0;
      const pension = parsePensionJubilacion(ev);
      if (pension == null) return 0;
      s.jubilados.add(personaId);
      s.pensionByPersona.set(personaId, pension);
      break;
    }
    case "aportar_fondo": {
      const id = ev.targetId;
      const amount = importe ?? 0;
      if (!id || amount <= 0) return 0;
      const pay = Math.min(amount, Math.max(0, s.efectivo));
      s.efectivo -= pay;
      s.fondos.set(id, (s.fondos.get(id) ?? 0) + pay);
      break;
    }
    case "aportar_plan": {
      const id = ev.targetId;
      const amount = importe ?? 0;
      if (!id || amount <= 0) return 0;
      const pay = Math.min(amount, Math.max(0, s.efectivo));
      s.efectivo -= pay;
      s.planes.set(id, (s.planes.get(id) ?? 0) + pay);
      break;
    }
    case "comprar_inmueble": {
      if (year !== ev.anio) return 0;
      const amount = importe ?? 0;
      if (amount <= 0) return 0;
      const pay = Math.min(amount, Math.max(0, s.efectivo));
      s.efectivo -= pay;
      const nid = ev.targetId ?? `compra-${ev.id}`;
      s.inmuebles.set(nid, (s.inmuebles.get(nid) ?? 0) + pay);
      break;
    }
    case "generico": {
      // Cajón sin regla fiscal: ingreso / gasto / movimiento libre → efectivo.
      if (year !== ev.anio) return 0;
      const amount = importe ?? 0;
      if (amount <= 0) return 0;
      const kind = parseGenericoKind(ev);
      if (kind === "gasto") s.efectivo -= amount;
      else s.efectivo += amount; // ingreso y movimiento libre
      break;
    }
    // traspasar_fondo, dividendos, vender_participacion: sin efecto patrimonial aún
    default:
      break;
  }

  // La cuota del motor (o la tecleada) sale del patrimonio.
  // En eventos multi-año se reutiliza la cuota del primer ejercicio — nivel 1
  // hasta que exista acumulación de periodo.
  const cuota = cuotaFiscalEvento(ev);
  if (cuota > 0) s.efectivo -= cuota;
  return cuota > 0 ? cuota : 0;
}

function growFinancial(s: ProjState, r: number): void {
  s.efectivo *= 1 + r;
  for (const [id, v] of s.fondos) s.fondos.set(id, v * (1 + r));
  for (const [id, v] of s.planes) s.planes.set(id, v * (1 + r));
  // Inmuebles y otros: sin revalorización en el modelo.
}

function initState(bag: ExpedienteBag): {
  state: ProjState;
  cuotaByPasivo: Map<string, number>;
} {
  const fondos = new Map<string, number>();
  const planes = new Map<string, number>();
  for (const i of bag.instrumentos) {
    if (isLiquidInstrument(i)) fondos.set(i.id, i.valor);
    else if (isPlan(i)) planes.set(i.id, i.valor);
    else fondos.set(i.id, i.valor);
  }

  const inmuebles = new Map<string, number>();
  for (const inm of bag.inmuebles) inmuebles.set(inm.id, inm.valor);

  const otros = new Map<string, number>();
  let efectivo = 0;
  for (const o of bag.otrosActivos) {
    if (o.tipo === "efectivo") efectivo += o.valor;
    else otros.set(o.id, o.valor);
  }

  const pasivos = new Map<string, number>();
  const pasivoByInmueble = new Map<string, string>();
  const cuotaByPasivo = new Map<string, number>();
  for (const p of bag.pasivos) {
    pasivos.set(p.id, p.capitalPendiente);
    cuotaByPasivo.set(p.id, p.cuotaMensual * 12);
    if (p.inmuebleId) pasivoByInmueble.set(p.inmuebleId, p.id);
  }

  const interesesPorInmueble = new Map<string, number>();
  let gastosAnuales = 0;
  for (const g of bag.gastos) {
    gastosAnuales += g.importeAnual;
    const esInteres =
      g.categoria.toLowerCase().includes("interés") ||
      g.categoria.toLowerCase().includes("interes");
    if (esInteres && g.vinculadoA?.kind === "inmueble") {
      interesesPorInmueble.set(
        g.vinculadoA.inmuebleId,
        (interesesPorInmueble.get(g.vinculadoA.inmuebleId) ?? 0) +
          g.importeAnual,
      );
    }
  }

  return {
    state: {
      efectivo,
      liquidezPignorada: 0,
      fondos,
      planes,
      inmuebles,
      otros,
      pasivos,
      pensionByPersona: new Map(),
      jubilados: new Set(),
      vendidos: new Set(),
      gastosAnuales,
      interesesPorInmueble,
      pasivoByInmueble,
    },
    cuotaByPasivo,
  };
}

export interface BuildProyeccionOpts {
  /** Rentabilidad esperada del escenario (decimal). Default 0.04. */
  rentabilidad?: number;
}

/**
 * Serie determinista 2026–2060 aplicando los eventos del escenario.
 * - Inmuebles no revalorizan; financieros propios (efectivo, fondos, planes) sí.
 * - La liquidez pignorada no capitaliza (pasivo espejo; sin coste de entidad modelado).
 * - La cuota fiscal del evento (motor o tecleada) sale del efectivo cada año activo.
 * - Jubilarse sustituye ingresos de trabajo por la pensión estimada.
 * - impuestoAcumulado refleja lo descontado de verdad (un escalón por año activo).
 */
export function buildProyeccionSeriesFromBag(
  bag: ExpedienteBag,
  eventos: Evento[],
  opts?: BuildProyeccionOpts,
): YearPoint[] {
  const r = opts?.rentabilidad ?? 0.04;
  const { state: s, cuotaByPasivo } = initState(bag);
  const sorted = [...eventos].sort((a, b) => a.anio - b.anio || a.id.localeCompare(b.id));
  const points: YearPoint[] = [];
  let impuestoAcumulado = 0;

  for (let year = PROYECCION_START_YEAR; year <= PROYECCION_END_YEAR; year++) {
    let impuestoAnual = 0;
    for (const ev of sorted) impuestoAnual += applyEvent(s, ev, year);
    impuestoAcumulado += impuestoAnual;

    const ingresos = ingresosAnuales(bag, s);
    const gastos = s.gastosAnuales;
    // Amortización ordinaria de hipotecas restantes
    let amort = 0;
    for (const [id, capital] of [...s.pasivos.entries()]) {
      if (capital <= 0 || id.startsWith("pignoracion-")) continue;
      const cuota = cuotaByPasivo.get(id) ?? 0;
      const inmId = [...s.pasivoByInmueble.entries()].find(
        ([, pid]) => pid === id,
      )?.[0];
      const intereses = inmId ? (s.interesesPorInmueble.get(inmId) ?? 0) : 0;
      const a = Math.max(0, Math.min(capital, Math.max(0, cuota - intereses)));
      if (a > 0) {
        s.pasivos.set(id, capital - a);
        amort += a;
        if ((s.pasivos.get(id) ?? 0) <= 0) {
          s.pasivos.delete(id);
          if (inmId) s.pasivoByInmueble.delete(inmId);
        }
      }
    }

    const flujoNeto = ingresos - gastos;
    // Principal de hipoteca sale del flujo; el resto a efectivo.
    const aEfectivo = flujoNeto - amort;
    s.efectivo += aEfectivo;

    const capacidad = flujoNeto + amort; // = ingresos − gastos + amort
    const brutos = liquidosBrutosOf(s);
    const acum = Math.round(impuestoAcumulado);

    points.push({
      year,
      patrimonio: Math.round(patrimonioOf(s)),
      liquidos: Math.round(Math.max(0, brutos)),
      liquidosBrutos: Math.round(brutos),
      ahorro: Math.round(capacidad),
      flujos: Math.round(capacidad),
      impuestoAnual: Math.round(impuestoAnual),
      impuestoAcumulado: acum,
      irpf: acum,
    });

    growFinancial(s, r);
  }

  return points;
}

/**
 * @deprecated Prefer buildProyeccionSeriesFromBag con bag + eventos.
 * Compat: serie genérica sin eventos (neto + capacidad).
 */
export function buildProyeccionSeries(
  clienteId: string,
  opts?: { patrimonioNeto?: number; capacidad?: number; completo?: boolean },
): YearPoint[] {
  if (!opts?.completo && opts?.patrimonioNeto == null) return [];
  return buildSeriesFromNeto(
    opts?.patrimonioNeto ?? 0,
    opts?.capacidad ?? 0,
  );
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
      liquidosBrutos: Math.round(l),
      ahorro: Math.round(ahorroAnual),
      flujos: Math.round(ahorroAnual),
      impuestoAnual: 0,
      impuestoAcumulado: 0,
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
