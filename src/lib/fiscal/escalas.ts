/**
 * Aplicación de escalas IRPF — lee tramos SOLO de parametros.ts.
 * Las cuotas acumuladas se derivan de (hasta, tipo); nunca se leen de la tabla.
 */

import {
  getEscalaAhorroAutonomica,
  getEscalaAhorroEstatal,
  getEscalaAutonomicaGeneral,
  getEscalaEstatalGeneral,
  PARAMETROS,
  type TramoEscala,
} from "./parametros";

/**
 * Cuota íntegra acumulada al inicio de cada tramo, derivada de anchos × tipos.
 * Índice i → suma de (hasta[j] − hasta[j−1]) × tipo[j] para j < i.
 */
export function cuotasAcumuladasDerivadas(tramos: TramoEscala[]): number[] {
  const out: number[] = [];
  let prevHasta = 0;
  let acum = 0;
  for (const t of tramos) {
    out.push(acum);
    if (t.hasta == null) break;
    acum += (t.hasta - prevHasta) * t.tipo;
    prevHasta = t.hasta;
  }
  return out;
}

/**
 * Comprueba coherencia interna: las acumuladas derivadas deben cuadrar
 * al reconstruir tramo a tramo (tolerancia de redondeo 0,01 €).
 * Si se pasan `guardadas`, compara también contra valores históricos.
 */
export function desviacionesEscala(
  tramos: TramoEscala[],
  guardadas?: number[],
): Array<{
  indice: number;
  hasta: number | null;
  tipo: number;
  derivada: number;
  guardada?: number;
  delta?: number;
}> {
  const derivadas = cuotasAcumuladasDerivadas(tramos);
  return tramos.map((t, i) => {
    const derivada = derivadas[i] ?? 0;
    const row: {
      indice: number;
      hasta: number | null;
      tipo: number;
      derivada: number;
      guardada?: number;
      delta?: number;
    } = { indice: i, hasta: t.hasta, tipo: t.tipo, derivada };
    if (guardadas && guardadas[i] != null) {
      row.guardada = guardadas[i];
      row.delta = Number((guardadas[i]! - derivada).toFixed(4));
    }
    return row;
  });
}

/** Cuota íntegra aplicando una escala oficial (acumuladas derivadas). */
export function cuotaEscala(base: number, tramos: TramoEscala[]): number {
  if (base <= 0 || tramos.length === 0) return 0;
  const acum = cuotasAcumuladasDerivadas(tramos);
  let prevHasta = 0;
  for (let i = 0; i < tramos.length; i++) {
    const t = tramos[i]!;
    const tope = t.hasta ?? Infinity;
    if (base <= tope || t.hasta === null) {
      return (acum[i] ?? 0) + (base - prevHasta) * t.tipo;
    }
    prevHasta = t.hasta;
  }
  const last = tramos[tramos.length - 1]!;
  const lastAcum = acum[tramos.length - 1] ?? 0;
  return lastAcum + (base - prevHasta) * last.tipo;
}

/**
 * Cuota general = (estatal + autonómica) tras minorar por mínimo personal.
 * Si CCAA ≠ CV → no se liquida (ccaaSinCobertura); el motor debe negarse antes.
 *
 * Gravamen autonómico: usa el mínimo estatal como simplificación declarada
 * mientras los mínimos autonómicos CV no estén verificados en DOGV.
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
  minimoAutonomicoSimplificado: boolean;
} {
  const ccaaSinCobertura = ccaa !== "Comunitat Valenciana";
  if (ccaaSinCobertura || !ccaa) {
    return {
      estatal: 0,
      autonomica: 0,
      total: 0,
      parametrosAVerificar: true,
      ccaaSinCobertura: true,
      minimoAutonomicoSimplificado: false,
    };
  }

  const est = getEscalaEstatalGeneral(anio);
  const aut = getEscalaAutonomicaGeneral(anio, ccaa);
  const base = Math.max(0, baseLiquidable);
  const min = Math.max(0, Math.min(base, minimoPersonal));
  const minimoAutonomicoSimplificado =
    PARAMETROS.minimoAutonomicoCVUsaEstatal.valor === true;

  const estatal = cuotaEscala(base, est.valor) - cuotaEscala(min, est.valor);
  // Mismo mínimo estatal en la mitad autonómica (simplificación declarada)
  const autonomica = aut
    ? cuotaEscala(base, aut.valor) - cuotaEscala(min, aut.valor)
    : 0;

  const parametrosAVerificar =
    est.estado === "a-verificar" ||
    aut?.estado === "a-verificar" ||
    PARAMETROS.minimoContribuyente.estado === "a-verificar" ||
    PARAMETROS.minimoAutonomicoCVUsaEstatal.estado === "a-verificar";

  return {
    estatal: Math.max(0, estatal),
    autonomica: Math.max(0, autonomica),
    total: Math.max(0, estatal) + Math.max(0, autonomica),
    parametrosAVerificar,
    ccaaSinCobertura: false,
    minimoAutonomicoSimplificado,
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

/**
 * Posición en una escala {hasta, tipo} → tramo actual + margen hasta el tope.
 * `hasta: null` = resto abierto (margen null).
 */
function posicionEnEscala(
  base: number,
  tramos: TramoEscala[],
): { tipo: number; hasta: number | null; margen: number | null; indice: number } | null {
  if (tramos.length === 0) return null;
  for (let i = 0; i < tramos.length; i++) {
    const t = tramos[i]!;
    const hasta = t.hasta;
    if (hasta == null || base < hasta) {
      return {
        tipo: t.tipo,
        hasta,
        margen: hasta == null ? null : Math.max(0, hasta - base),
        indice: i,
      };
    }
  }
  const last = tramos[tramos.length - 1]!;
  return {
    tipo: last.tipo,
    hasta: last.hasta,
    margen: null,
    indice: tramos.length - 1,
  };
}

/**
 * Margen hasta el siguiente salto de tipo combinado (estatal + autonómico).
 * Salta la escala cuyo tope llega antes. Alimenta la frase de lectura de P4.
 * null si CCAA sin cobertura o sin tramos.
 */
export function margenSiguienteSaltoGeneral(
  base: number,
  anio: number,
  ccaa: string,
): {
  tipoCombinado: number;
  tipoCombinadoTrasSalto: number;
  margen: number;
  escalaQueSalta: "estatal" | "autonomica";
} | null {
  if (ccaa !== "Comunitat Valenciana") return null;
  const est = getEscalaEstatalGeneral(anio).valor;
  const aut = getEscalaAutonomicaGeneral(anio, ccaa)?.valor;
  if (!aut || est.length === 0) return null;

  const posEst = posicionEnEscala(base, est);
  const posAut = posicionEnEscala(base, aut);
  if (!posEst || !posAut) return null;

  const tipoCombinado = posEst.tipo + posAut.tipo;

  const candidatos: Array<{
    escala: "estatal" | "autonomica";
    margen: number;
    tipoTras: number;
  }> = [];

  if (posEst.margen != null && posEst.indice + 1 < est.length) {
    const siguiente = est[posEst.indice + 1]!;
    candidatos.push({
      escala: "estatal",
      margen: posEst.margen,
      tipoTras: siguiente.tipo + posAut.tipo,
    });
  }
  if (posAut.margen != null && posAut.indice + 1 < aut.length) {
    const siguiente = aut[posAut.indice + 1]!;
    candidatos.push({
      escala: "autonomica",
      margen: posAut.margen,
      tipoTras: posEst.tipo + siguiente.tipo,
    });
  }
  if (candidatos.length === 0) return null;

  candidatos.sort((a, b) => a.margen - b.margen);
  const primero = candidatos[0]!;
  return {
    tipoCombinado,
    tipoCombinadoTrasSalto: primero.tipoTras,
    margen: primero.margen,
    escalaQueSalta: primero.escala,
  };
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
  minimoAutonomicoSimplificado: boolean;
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
      minimoAutonomicoSimplificado: false,
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
    minimoAutonomicoSimplificado: g.minimoAutonomicoSimplificado,
  };
}
