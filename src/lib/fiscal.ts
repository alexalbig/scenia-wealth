/**
 * Facade P4 Fiscalidad + reexportes del motor.
 * Tramos solo desde escalas oficiales de parametros.ts.
 * Sin series ni KPIs inventados.
 */

import { getCliente, getPersonasDeCliente } from "./seed";
import { getIngresos, ingresosPorPersona } from "./patrimonio";
import type { CCAA } from "./types";
import {
  desgloseBaseLiquidable,
  type DesgloseBaseLiquidable,
} from "./fiscal/base-liquidable";
import {
  getEscalaAhorroEstatal,
  getEscalaAutonomicaGeneral,
  getEscalaEstatalGeneral,
  PARAMETROS,
} from "./fiscal/parametros";
import {
  liquidacionEjercicio,
  minimoPersonalPorEdad,
} from "./fiscal/escalas";

export type EscalaTramos = "estatal" | "autonomica" | "ahorro";

export interface Tramo {
  desde: number;
  hasta: number;
  tipo: number;
}

export interface EspacioTramo {
  tramoIndex: number;
  tramo: Tramo;
  espacio: number | null;
}

export interface LiquidacionEjercicioVista {
  cuotaGeneral: number;
  cuotaAhorro: number;
  total: number;
  ccaaSinCobertura: boolean;
  parametrosAVerificar: boolean;
  estatalGeneral: number;
  autonomicaGeneral: number;
  minimoAutonomicoSimplificado: boolean;
  /** true si no hay base del ahorro modelada (hueco, no 0 inventado). */
  baseAhorroHueco: boolean;
}

function oficialToTramos(
  rows: Array<{ hasta: number | null; tipo: number }>,
): Tramo[] {
  let prev = 0;
  return rows.map((r) => {
    const hasta = r.hasta ?? Infinity;
    const t = { desde: prev, hasta, tipo: r.tipo };
    prev = r.hasta ?? prev;
    return t;
  });
}

export function ccaaConCobertura(ccaa: CCAA): boolean {
  return ccaa === "Comunitat Valenciana";
}

/** Aviso de cobertura: forales (bloqueo total) vs resto (solo base general = CV). */
export function avisoCoberturaCcaa(ccaa: CCAA): string {
  if (ccaa === "Comunidad Foral de Navarra") {
    return "La Comunidad Foral de Navarra tiene régimen fiscal propio; Scenia no cubre su normativa.";
  }
  if (ccaa === "País Vasco") {
    return "El País Vasco tiene régimen fiscal propio; Scenia no cubre su normativa.";
  }
  return "El cálculo fiscal solo está disponible para la Comunitat Valenciana.";
}

export function getTramos(escala: EscalaTramos, anio: number): Tramo[] {
  switch (escala) {
    case "estatal":
      return oficialToTramos(getEscalaEstatalGeneral(anio).valor);
    case "autonomica": {
      const aut = getEscalaAutonomicaGeneral(anio, "Comunitat Valenciana");
      return oficialToTramos(aut?.valor ?? []);
    }
    case "ahorro":
      // Mitad estatal (art. 66); la autonómica es espejo — el visor muestra
      // el tipo conjunto (= 2 × mitad) vía getTramosAhorroConjunto.
      return oficialToTramos(getEscalaAhorroEstatal(anio).valor);
  }
}

/**
 * Escala del ahorro con tipo conjunto (estatal + autonómica).
 * Los tramos oficiales son idénticos en ambas mitades (Ley 7/2024);
 * el tipo mostrado es la suma — no es una tarifa inventada.
 */
export function getTramosAhorroConjunto(anio: number): Tramo[] {
  return oficialToTramos(getEscalaAhorroEstatal(anio).valor).map((t) => ({
    ...t,
    tipo: t.tipo * 2,
  }));
}

export function tramoDeBase(
  base: number,
  escala: EscalaTramos,
  anio: number,
): EspacioTramo | null {
  const tramos =
    escala === "ahorro" ? getTramosAhorroConjunto(anio) : getTramos(escala, anio);
  const tramoIndex = tramos.findIndex(
    (t) => base >= t.desde && base < t.hasta,
  );
  if (tramoIndex < 0) return null;
  const tramo = tramos[tramoIndex]!;
  const espacio =
    tramo.hasta === Infinity ? null : Math.max(0, tramo.hasta - base);
  return { tramoIndex, tramo, espacio };
}

export function espacioHastaSiguiente(
  base: number,
  escala: EscalaTramos,
  anio: number,
): number | null {
  return tramoDeBase(base, escala, anio)?.espacio ?? null;
}

export function baseGeneralPersona(
  clienteId: string,
  personaId: string,
): number {
  return desgloseBaseLiquidablePersona(clienteId, personaId).baseLiquidable;
}

/** Brutos del expediente (lo tecleado) — no es la base del motor. */
export function ingresosBrutosPersona(
  clienteId: string,
  personaId: string,
): number {
  return ingresosPorPersona(clienteId, personaId);
}

/** Desglose arts. 19/20 para P4 y chips. */
export function desgloseBaseLiquidablePersona(
  clienteId: string,
  personaId: string,
): DesgloseBaseLiquidable {
  const lineas = getIngresos(clienteId).filter((i) => i.personaId === personaId);
  let trabajo = 0;
  let otras = 0;
  let cotiz: number | null = null;
  for (const i of lineas) {
    if (i.fuente === "trabajo" || i.fuente === "pension") {
      trabajo += i.importeAnual;
      if (i.cotizacionesSS != null && Number.isFinite(i.cotizacionesSS)) {
        cotiz = (cotiz ?? 0) + i.cotizacionesSS;
      }
    } else {
      otras += i.importeAnual;
    }
  }
  return desgloseBaseLiquidable({
    ingresosTrabajoBrutos: trabajo,
    otrasRentasBrutas: otras,
    cotizacionesSS: cotiz,
  });
}

/**
 * Base del ahorro del ejercicio — hoy no hay modelo de rentas del ahorro
 * en el expediente (solo plusvalías latentes de activos). Hueco explícito.
 */
export function baseAhorroPersona(
  _clienteId: string,
  _personaId: string,
): number | null {
  return null;
}

export function liquidacionEjercicioPersona(opts: {
  clienteId: string;
  personaId: string;
  anio: number;
  ccaa: CCAA;
}): LiquidacionEjercicioVista | null {
  const personas = getPersonasDeCliente(opts.clienteId);
  const persona = personas.find((p) => p.id === opts.personaId);
  if (!persona) return null;

  const baseG = baseGeneralPersona(opts.clienteId, opts.personaId);
  const baseA = baseAhorroPersona(opts.clienteId, opts.personaId);
  const edad = opts.anio - persona.birthYear;
  const liq = liquidacionEjercicio({
    baseGeneral: baseG,
    baseAhorro: baseA ?? 0,
    anio: opts.anio,
    ccaa: opts.ccaa,
    edad,
  });

  return {
    ...liq,
    baseAhorroHueco: baseA == null,
  };
}

export function aniosToolbarFiscal(): number[] {
  const desde = PARAMETROS.periodoFilaFiscalDesde.valor;
  const hasta = Math.min(PARAMETROS.periodoFilaFiscalHasta.valor, desde + 5);
  const out: number[] = [];
  for (let y = desde; y <= hasta; y++) out.push(y);
  return out;
}

export function anioPorDefecto() {
  return PARAMETROS.periodoFilaFiscalDesde.valor;
}

export function personasFiscales(clienteId: string) {
  return getPersonasDeCliente(clienteId);
}

export function etiquetaEscala(escala: EscalaTramos): string {
  switch (escala) {
    case "estatal":
      return "Escala estatal · base general";
    case "autonomica":
      return "Escala autonómica · Comunitat Valenciana";
    case "ahorro":
      return "Base del ahorro · tipo conjunto (arts. 66 + 76)";
  }
}

export function minimoPersonalPersona(
  birthYear: number,
  anio: number,
): number {
  return minimoPersonalPorEdad(anio - birthYear);
}

export {
  simularMotorEvento,
  simularMotorEventoCampos,
  type ResultadoFiscalMotor,
  type ContextoFiscalEvento,
} from "./fiscal/motor";
export { rollupImpuestosEscenario, periodoFilaFiscal } from "./fiscal/rollup";
export { PARAMETROS, algunParametroAVerificar } from "./fiscal/parametros";
export { liquidacionEjercicio } from "./fiscal/escalas";

/** Cliente de referencia del seed (compat pantallas). */
export { getCliente } from "./seed";
