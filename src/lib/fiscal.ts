/**
 * Facade P4 Fiscalidad + reexportes del motor.
 * Tramos solo desde escalas oficiales de parametros.ts.
 * Sin series ni KPIs inventados.
 */

import { getCliente, getPersonasDeCliente } from "./seed";
import { getIngresos, ingresosPorPersona } from "./patrimonio";
import type { CCAA } from "./types";
import { esRegimenForal } from "./types";
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
  return ccaaConCoberturaGeneral(ccaa);
}

/** Base general (rescate / aportación a plan): solo Comunitat Valenciana. */
export function ccaaConCoberturaGeneral(ccaa: CCAA): boolean {
  return ccaa === "Comunitat Valenciana";
}

/** Base del ahorro (plusvalías): todo el régimen común. Forales fuera. */
export function ccaaConCoberturaAhorro(ccaa: CCAA): boolean {
  return !!ccaa.trim() && !esRegimenForal(ccaa);
}

/**
 * Aviso de cobertura por CCAA.
 * Forales: bloqueo total. Resto de régimen común: matiza general vs ahorro.
 */
export function avisoCoberturaCcaa(ccaa: CCAA): string {
  if (ccaa === "Comunidad Foral de Navarra") {
    return "La Comunidad Foral de Navarra tiene régimen fiscal propio; Scenia no cubre su normativa.";
  }
  if (ccaa === "País Vasco") {
    return "El País Vasco tiene régimen fiscal propio; Scenia no cubre su normativa.";
  }
  if (ccaa === "Comunitat Valenciana") {
    return "";
  }
  return (
    `Este titular reside en ${ccaa}. Las decisiones sobre plusvalías —reembolsos, traspasos, pignoraciones y venta de inmuebles— se calculan con normalidad. ` +
    `El rescate de planes de pensiones depende de la escala autonómica y todavía solo está cargada la de la Comunitat Valenciana.`
  );
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
  let pension = 0;
  let otras = 0;
  let cotiz: number | null = null;
  const fuentesNoContempladas: import("./types").FuenteIngreso[] = [];
  for (const i of lineas) {
    if (i.fuente === "actividad_economica") {
      if (!fuentesNoContempladas.includes(i.fuente)) {
        fuentesNoContempladas.push(i.fuente);
      }
      continue;
    }
    if (i.fuente === "trabajo") {
      trabajo += i.importeAnual;
      if (i.cotizacionesSS != null && Number.isFinite(i.cotizacionesSS)) {
        cotiz = (cotiz ?? 0) + i.cotizacionesSS;
      }
    } else if (i.fuente === "pension") {
      pension += i.importeAnual;
    } else {
      otras += i.importeAnual;
    }
  }
  return desgloseBaseLiquidable({
    trabajoBruto: trabajo,
    pensionBruta: pension,
    otrasRentasBrutas: otras,
    cotizacionesSS: cotiz,
    fuentesNoContempladas,
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
  type ResultadoFiscalMotor,
  type ContextoFiscalEvento,
} from "./fiscal/motor";
export { rollupImpuestosEscenario, periodoFilaFiscal } from "./fiscal/rollup";
export { PARAMETROS, algunParametroAVerificar } from "./fiscal/parametros";
export {
  liquidacionEjercicio,
  margenSiguienteSaltoGeneral,
  recorridoMarginalGeneral,
  MARGEN_TRIVIAL_EUR,
  type PeldañoRecorrido,
  type RecorridoMarginalGeneral,
} from "./fiscal/escalas";
export {
  estadoFiscalPersona,
  esFuenteNoContemplada,
  type EstadoFiscalPersona,
  type MotivoSinCalculo,
  type PerfilRenta,
} from "./fiscal/estado-persona";

/** Cliente de referencia del seed (compat pantallas). */
export { getCliente } from "./seed";
