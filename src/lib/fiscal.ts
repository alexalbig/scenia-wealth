/**
 * Motor fiscal de pantalla P4 + reexportes.
 * Tramos de visualización salen de parametros.ts (nunca literales sueltos).
 */

import { getCliente, getPersonasDeCliente, ids } from "./seed";
import { ingresosPorPersona } from "./patrimonio";
import type { CCAA } from "./types";
import { PARAMETROS } from "./fiscal/parametros";

export type EscalaTramos = "estatal" | "autonomica" | "ahorro" | "general";
export type EurMode = "hoy" | "futuro";

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

export interface PuntoSerieIRPF {
  anio: number;
  irpf: number;
  baseGeneral: number;
  baseAhorro: number;
}

export interface KpisVida {
  irpfTotal: number;
  etr: number;
  ingresosProyectados: number;
  anioInicio: number;
  anioFin: number;
}

const ANIO_BASE = 2026;
const INFLACION = 0.02;
const ANIO_INICIO = 2024;
const ANIO_FIN = 2035;
const CHART_ANIO_INICIO = 2026;
const CHART_ANIO_FIN = 2060;

/** IRPF acumulado 2026–2040 · cifras fijas del mockup UI · orientativo */
const IRPF_VIDA: Record<string, number> = {
  [ids.personaCarlos]: 412_000,
  [ids.personaMarta]: 88_000,
};

const CUOTA_ANYO: Record<string, number> = {
  [ids.personaCarlos]: 27_500,
  [ids.personaMarta]: 5_900,
};

const SERIE_CARLOS: Record<number, number> = {
  2024: 24_800,
  2025: 25_600,
  2026: 26_400,
  2027: 27_200,
  2028: 28_000,
  2029: 28_800,
  2030: 29_600,
  2031: 30_400,
  2032: 31_200,
  2033: 32_000,
  2034: 32_800,
  2035: 33_600,
};

const SERIE_MARTA: Record<number, number> = {
  2024: 5_200,
  2025: 5_400,
  2026: 5_800,
  2027: 6_000,
  2028: 6_200,
  2029: 6_400,
  2030: 6_600,
  2031: 6_800,
  2032: 7_000,
  2033: 7_200,
  2034: 7_400,
  2035: 7_600,
};

function displayTramos(
  key: "escalaGeneralDisplayCV" | "escalaAhorroDisplay",
): Tramo[] {
  return PARAMETROS[key].valor.map((t) => ({
    desde: t.desde,
    hasta: t.hasta,
    tipo: t.tipo,
  }));
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

export function getTramos(escala: EscalaTramos): Tramo[] {
  switch (escala) {
    case "estatal":
      return oficialToTramos(PARAMETROS.escalaEstatalGeneral.valor);
    case "autonomica":
      return oficialToTramos(PARAMETROS.escalaAutonomicaCV.valor);
    case "general":
      return displayTramos("escalaGeneralDisplayCV");
    case "ahorro":
      return displayTramos("escalaAhorroDisplay");
  }
}

export function tramoDeBase(
  base: number,
  escala: EscalaTramos,
): EspacioTramo | null {
  const tramos = getTramos(escala);
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
): number | null {
  return tramoDeBase(base, escala)?.espacio ?? null;
}

export function aniosSerie(): number[] {
  const out: number[] = [];
  for (let y = ANIO_INICIO; y <= ANIO_FIN; y++) out.push(y);
  return out;
}

function serieFijaPersona(personaId: string): Record<number, number> | null {
  if (personaId === ids.personaCarlos) return SERIE_CARLOS;
  if (personaId === ids.personaMarta) return SERIE_MARTA;
  return null;
}

export function baseGeneralPersona(
  clienteId: string,
  personaId: string,
): number {
  return ingresosPorPersona(clienteId, personaId);
}

export function baseAhorroPersona(
  clienteId: string,
  personaId: string,
): number {
  if (!clienteId || !personaId) return 0;
  return 0;
}

export function serieIRPF(
  clienteId: string,
  personaId: string,
): PuntoSerieIRPF[] {
  const cliente = getCliente(clienteId);
  if (!cliente?.completo) return [];
  const fija = serieFijaPersona(personaId);
  if (!fija) return [];

  const baseG = baseGeneralPersona(clienteId, personaId);
  const baseA = baseAhorroPersona(clienteId, personaId);

  return aniosSerie().map((anio) => ({
    anio,
    irpf: fija[anio] ?? 0,
    baseGeneral: baseG,
    baseAhorro: baseA,
  }));
}

export function kpisVida(
  clienteId: string,
  personaId: string,
): KpisVida | null {
  const cliente = getCliente(clienteId);
  if (!cliente?.completo) return null;
  const irpfTotal = IRPF_VIDA[personaId];
  const cuota = CUOTA_ANYO[personaId];
  if (irpfTotal == null || cuota == null) return null;

  const ingresosAnuales = baseGeneralPersona(clienteId, personaId);
  const etr = ingresosAnuales > 0 ? cuota / ingresosAnuales : 0;

  return {
    irpfTotal,
    etr,
    ingresosProyectados: ingresosAnuales,
    anioInicio: 2026,
    anioFin: 2040,
  };
}

export function cuotaIRPFPersona(personaId: string): number {
  return CUOTA_ANYO[personaId] ?? 0;
}

export function serieIRPFPlanBase(): PuntoSerieIRPF[] {
  const out: PuntoSerieIRPF[] = [];
  for (let y = CHART_ANIO_INICIO; y <= CHART_ANIO_FIN; y++) {
    const irpf = (y < 2033 ? 27_500 : 6_500) + (y < 2036 ? 5_900 : 1_800);
    out.push({ anio: y, irpf, baseGeneral: 0, baseAhorro: 0 });
  }
  return out;
}

export function aniosToolbarFiscal(): number[] {
  return [2026, 2027, 2028, 2029, 2030, 2031];
}

export function factorFiscalAnyo(anio: number, mode: EurMode): number {
  if (mode === "hoy") return 1;
  return Math.pow(1 + INFLACION, anio - ANIO_BASE);
}

export function irpfVidaPresentado(
  irpfTotal: number,
  mode: EurMode,
): number {
  return mode === "hoy" ? Math.round(irpfTotal * 0.86) : irpfTotal;
}

export function enEuros(
  valorNominal: number,
  anio: number,
  mode: EurMode,
  anioReferencia = ANIO_BASE,
): number {
  if (mode === "futuro") return valorNominal;
  const years = anio - anioReferencia;
  return Math.round(valorNominal / Math.pow(1 + INFLACION, years));
}

export function personasFiscales(clienteId: string) {
  return getPersonasDeCliente(clienteId);
}

export function anioPorDefecto() {
  return ANIO_BASE;
}

export function etiquetaEscala(escala: EscalaTramos): string {
  switch (escala) {
    case "estatal":
      return "Escala estatal";
    case "autonomica":
      return "Escala autonómica · CV";
    case "general":
      return "Base general · estatal + Comunitat Valenciana";
    case "ahorro":
      return "Base del ahorro";
  }
}

export {
  simularMotorEvento,
  simularMotorEventoCampos,
  type ResultadoFiscalMotor,
  type ContextoFiscalEvento,
} from "./fiscal/motor";
export { rollupImpuestosEscenario, periodoFilaFiscal } from "./fiscal/rollup";
export { PARAMETROS, algunParametroAVerificar } from "./fiscal/parametros";
