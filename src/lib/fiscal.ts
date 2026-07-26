/**
 * Motor fiscal MOCK — funciones puras con cifras fijas del seed.
 * NO es un liquidador real. Todo parámetro marcado `(a verificar)`.
 *
 * Alcance MVP: plan base ("Situación actual") · Comunitat Valenciana.
 */

import { getCliente, getPersonasDeCliente, ids } from "./seed";
import { ingresosPorPersona } from "./patrimonio";
import type { CCAA } from "./types";

export type EscalaTramos = "estatal" | "autonomica" | "ahorro";
export type EurMode = "hoy" | "futuro";

export interface Tramo {
  /** Límite inferior inclusive (a verificar) */
  desde: number;
  /** Límite superior exclusive; Infinity = último (a verificar) */
  hasta: number;
  /** Tipo marginal del tramo (a verificar) */
  tipo: number;
}

export interface EspacioTramo {
  tramoIndex: number;
  tramo: Tramo;
  /** € hasta el inicio del siguiente tramo; null = tramo máximo */
  espacio: number | null;
}

export interface PuntoSerieIRPF {
  anio: number;
  irpf: number;
  /** Base general del ejercicio (ingresos trabajo en plan base) */
  baseGeneral: number;
  /** Base del ahorro del ejercicio (0 en plan base sin eventos) */
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
const INFLACION = 0.02; // supuesto del plan base en seed
const ANIO_INICIO = 2024;
const ANIO_FIN = 2035;

/** Escala estatal IRPF · base general · (a verificar) */
const TRAMOS_ESTATAL: Tramo[] = [
  { desde: 0, hasta: 12_450, tipo: 0.095 },
  { desde: 12_450, hasta: 20_200, tipo: 0.12 },
  { desde: 20_200, hasta: 35_200, tipo: 0.15 },
  { desde: 35_200, hasta: 60_000, tipo: 0.185 },
  { desde: 60_000, hasta: 300_000, tipo: 0.225 },
  { desde: 300_000, hasta: Infinity, tipo: 0.245 },
];

/**
 * Escala autonómica Comunitat Valenciana · base general · (a verificar).
 * Simplificada para el mockup; no usar fuera de CV.
 */
const TRAMOS_CV: Tramo[] = [
  { desde: 0, hasta: 12_000, tipo: 0.09 },
  { desde: 12_000, hasta: 22_000, tipo: 0.12 },
  { desde: 22_000, hasta: 32_000, tipo: 0.15 },
  { desde: 32_000, hasta: 42_000, tipo: 0.175 },
  { desde: 42_000, hasta: 52_000, tipo: 0.2 },
  { desde: 52_000, hasta: 65_000, tipo: 0.225 },
  { desde: 65_000, hasta: 80_000, tipo: 0.25 },
  { desde: 80_000, hasta: 120_000, tipo: 0.275 },
  { desde: 120_000, hasta: 200_000, tipo: 0.3 },
  { desde: 200_000, hasta: Infinity, tipo: 0.32 },
];

/** Escala base del ahorro (estatal) · (a verificar) — distinta de la base general */
const TRAMOS_AHORRO: Tramo[] = [
  { desde: 0, hasta: 6_000, tipo: 0.19 },
  { desde: 6_000, hasta: 50_000, tipo: 0.21 },
  { desde: 50_000, hasta: 200_000, tipo: 0.23 },
  { desde: 200_000, hasta: 300_000, tipo: 0.27 },
  { desde: 300_000, hasta: Infinity, tipo: 0.28 },
];

/**
 * Serie IRPF año a año — plan base García-Llorente (cifras fijas orientativas).
 * Derivada del patrón de ingresos seed (Carlos 95k · Marta 32k), sin eventos.
 */
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

export function ccaaConCobertura(ccaa: CCAA): boolean {
  return ccaa === "Comunitat Valenciana";
}

export function getTramos(escala: EscalaTramos): Tramo[] {
  switch (escala) {
    case "estatal":
      return TRAMOS_ESTATAL;
    case "autonomica":
      return TRAMOS_CV;
    case "ahorro":
      return TRAMOS_AHORRO;
  }
}

export function tramoDeBase(base: number, escala: EscalaTramos): EspacioTramo | null {
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

/** Cuánto espacio queda hasta el siguiente tramo (€). */
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

/** Base general del plan base = ingresos anuales de la persona (seed). */
export function baseGeneralPersona(clienteId: string, personaId: string): number {
  return ingresosPorPersona(clienteId, personaId);
}

/**
 * Base del ahorro en plan base sin eventos de realización = 0.
 * (Reembolso / plusvalías viven en escenarios alternativos — V2 en P4.)
 */
export function baseAhorroPersona(clienteId: string, personaId: string): number {
  if (!clienteId || !personaId) return 0;
  return 0;
}

/**
 * Serie IRPF año a año (plan base). Cifras fijas del seed; no liquida tramos.
 */
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

/**
 * KPIs de por vida (horizonte 2024–2035) · orientativo · cifras fijas.
 * ETR = IRPF acumulado / ingresos proyectados del mismo horizonte.
 */
export function kpisVida(clienteId: string, personaId: string): KpisVida | null {
  const serie = serieIRPF(clienteId, personaId);
  if (serie.length === 0) return null;

  const irpfTotal = serie.reduce((s, p) => s + p.irpf, 0);
  const ingresosAnuales = baseGeneralPersona(clienteId, personaId);
  const ingresosProyectados = ingresosAnuales * serie.length;
  const etr = ingresosProyectados > 0 ? irpfTotal / ingresosProyectados : 0;

  return {
    irpfTotal,
    etr,
    ingresosProyectados,
    anioInicio: ANIO_INICIO,
    anioFin: ANIO_FIN,
  };
}

/** Ajusta una cifra nominal a € de hoy (descuento por inflación del plan base). */
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
    case "ahorro":
      return "Base del ahorro";
  }
}
