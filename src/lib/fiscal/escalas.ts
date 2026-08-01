/**
 * Aplicación de escalas IRPF — lee tramos SOLO de parametros.ts.
 */

import {
  getEscalaAhorroAutonomica,
  getEscalaAhorroEstatal,
  getEscalaAutonomicaGeneral,
  getEscalaEstatalGeneral,
  PARAMETROS,
  type TramoEscala,
} from "./parametros";

/** Cuota íntegra aplicando una escala oficial (formato AEAT). */
export function cuotaEscala(base: number, tramos: TramoEscala[]): number {
  if (base <= 0 || tramos.length === 0) return 0;
  let prevHasta = 0;
  for (const t of tramos) {
    const tope = t.hasta ?? Infinity;
    if (base <= tope || t.hasta === null) {
      return t.cuotaAcumulada + (base - prevHasta) * t.tipo;
    }
    prevHasta = t.hasta;
  }
  const last = tramos[tramos.length - 1]!;
  return last.cuotaAcumulada + (base - prevHasta) * last.tipo;
}

/**
 * Cuota general = (estatal + autonómica) tras minorar por mínimo personal.
 * Si CCAA ≠ CV → autonomica 0 (no se inventan cifras de otra comunidad).
 */
export function cuotaGeneralIRPF(
  baseLiquidable: number,
  anio: number,
  ccaa: string,
  minimoPersonal: number,
): {
  estatal: number;
  autonomica: number;
  total: number;
  parametrosAVerificar: boolean;
  ccaaSinCobertura: boolean;
} {
  const est = getEscalaEstatalGeneral(anio);
  const aut = getEscalaAutonomicaGeneral(anio, ccaa);
  const base = Math.max(0, baseLiquidable);
  const min = Math.max(0, Math.min(base, minimoPersonal));

  const estatal = cuotaEscala(base, est.valor) - cuotaEscala(min, est.valor);
  let autonomica = 0;
  let ccaaSinCobertura = false;
  if (aut) {
    autonomica = cuotaEscala(base, aut.valor) - cuotaEscala(min, aut.valor);
  } else if (ccaa && ccaa !== "Comunitat Valenciana") {
    ccaaSinCobertura = true;
  }

  const parametrosAVerificar =
    est.estado === "a-verificar" ||
    aut?.estado === "a-verificar" ||
    PARAMETROS.minimoContribuyente.estado === "a-verificar";

  return {
    estatal: Math.max(0, estatal),
    autonomica: Math.max(0, autonomica),
    total: Math.max(0, estatal) + Math.max(0, autonomica),
    parametrosAVerificar,
    ccaaSinCobertura,
  };
}

export function cuotaAhorroIRPF(
  baseLiquidableAhorro: number,
  anio: number,
): {
  estatal: number;
  autonomica: number;
  total: number;
  parametrosAVerificar: boolean;
} {
  const est = getEscalaAhorroEstatal(anio);
  const aut = getEscalaAhorroAutonomica(anio);
  const base = Math.max(0, baseLiquidableAhorro);
  const estatal = cuotaEscala(base, est.valor);
  const autonomica = cuotaEscala(base, aut.valor);
  return {
    estatal,
    autonomica,
    total: estatal + autonomica,
    parametrosAVerificar:
      est.estado === "a-verificar" || aut.estado === "a-verificar",
  };
}

/** Incremento de cuota general al añadir renta a la base. */
export function cuotaMarginalGeneral(
  baseAntes: number,
  incremento: number,
  anio: number,
  ccaa: string,
  minimoPersonal: number,
): number {
  if (incremento <= 0) return 0;
  const a = cuotaGeneralIRPF(baseAntes, anio, ccaa, minimoPersonal).total;
  const b = cuotaGeneralIRPF(
    baseAntes + incremento,
    anio,
    ccaa,
    minimoPersonal,
  ).total;
  return Math.max(0, b - a);
}

export function cuotaMarginalAhorro(
  baseAntes: number,
  incremento: number,
  anio: number,
): number {
  if (incremento <= 0) return 0;
  const a = cuotaAhorroIRPF(baseAntes, anio).total;
  const b = cuotaAhorroIRPF(baseAntes + incremento, anio).total;
  return Math.max(0, b - a);
}

export function minimoPersonalPorEdad(edad?: number): number {
  let m = PARAMETROS.minimoContribuyente.valor;
  if (edad != null && edad > 65) {
    m += PARAMETROS.minimoContribuyenteMas65.valor;
  }
  if (edad != null && edad > 75) {
    m += PARAMETROS.minimoContribuyenteMas75.valor;
  }
  return m;
}
