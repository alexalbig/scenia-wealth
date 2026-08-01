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
 * Si CCAA ≠ CV → no se liquida (ccaaSinCobertura); el motor debe negarse antes.
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
  const ccaaSinCobertura = ccaa !== "Comunitat Valenciana";
  if (ccaaSinCobertura || !ccaa) {
    return {
      estatal: 0,
      autonomica: 0,
      total: 0,
      parametrosAVerificar: true,
      ccaaSinCobertura: true,
    };
  }

  const est = getEscalaEstatalGeneral(anio);
  const aut = getEscalaAutonomicaGeneral(anio, ccaa);
  const base = Math.max(0, baseLiquidable);
  const min = Math.max(0, Math.min(base, minimoPersonal));

  const estatal = cuotaEscala(base, est.valor) - cuotaEscala(min, est.valor);
  const autonomica = aut
    ? cuotaEscala(base, aut.valor) - cuotaEscala(min, aut.valor)
    : 0;

  const parametrosAVerificar =
    est.estado === "a-verificar" ||
    aut?.estado === "a-verificar" ||
    PARAMETROS.minimoContribuyente.estado === "a-verificar";

  return {
    estatal: Math.max(0, estatal),
    autonomica: Math.max(0, autonomica),
    total: Math.max(0, estatal) + Math.max(0, autonomica),
    parametrosAVerificar,
    ccaaSinCobertura: false,
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
  const a = cuotaGeneralIRPF(baseAntes, anio, ccaa, minimoPersonal);
  if (a.ccaaSinCobertura) return 0;
  const b = cuotaGeneralIRPF(
    baseAntes + incremento,
    anio,
    ccaa,
    minimoPersonal,
  );
  return Math.max(0, b.total - a.total);
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
  const u65 = PARAMETROS.umbralEdadMas65.valor;
  const u75 = PARAMETROS.umbralEdadMas75.valor;
  if (edad != null && edad > u65) {
    m += PARAMETROS.minimoContribuyenteMas65.valor;
  }
  if (edad != null && edad > u75) {
    m += PARAMETROS.minimoContribuyenteMas75.valor;
  }
  return m;
}

/** Liquidación de un ejercicio: cuota general + cuota del ahorro. */
export function liquidacionEjercicio(opts: {
  baseGeneral: number;
  baseAhorro: number;
  anio: number;
  ccaa: string;
  edad?: number;
}): {
  cuotaGeneral: number;
  cuotaAhorro: number;
  total: number;
  ccaaSinCobertura: boolean;
  parametrosAVerificar: boolean;
  estatalGeneral: number;
  autonomicaGeneral: number;
} {
  const min = minimoPersonalPorEdad(opts.edad);
  const g = cuotaGeneralIRPF(opts.baseGeneral, opts.anio, opts.ccaa, min);
  const a = cuotaAhorroIRPF(opts.baseAhorro, opts.anio);
  if (g.ccaaSinCobertura) {
    return {
      cuotaGeneral: 0,
      cuotaAhorro: 0,
      total: 0,
      ccaaSinCobertura: true,
      parametrosAVerificar: true,
      estatalGeneral: 0,
      autonomicaGeneral: 0,
    };
  }
  return {
    cuotaGeneral: Math.round(g.total),
    cuotaAhorro: Math.round(a.total),
    total: Math.round(g.total + a.total),
    ccaaSinCobertura: false,
    parametrosAVerificar: g.parametrosAVerificar || a.parametrosAVerificar,
    estatalGeneral: Math.round(g.estatal),
    autonomicaGeneral: Math.round(g.autonomica),
  };
}
