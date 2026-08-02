/**
 * Rollup fiscal del escenario — solo el primer ejercicio de cada evento.
 *
 * No acumula cuotaAnual × años: eso no depleta plusvalía y es indefendible.
 * Siempre recalcula con motor fresco (si cambian datos del activo, la cifra cambia).
 *
 * Parcial solo por: IS, impacto tecleado del asesor, o sin_calculo real.
 * Jubilación es neutro (ajusta la base) y no marca parcial.
 */

import type { Evento } from "@/lib/types";
import {
  simularMotorEvento,
  type ContextoFiscalEvento,
  type ResultadoFiscalMotor,
} from "./motor";
import { PARAMETROS } from "./parametros";

export function periodoFilaFiscal(): { desde: number; hasta: number } {
  return {
    desde: PARAMETROS.periodoFilaFiscalDesde.valor,
    hasta: PARAMETROS.periodoFilaFiscalHasta.valor,
  };
}

export function aniosSolape(
  desde: number,
  hasta: number,
  periodoDesde: number,
  periodoHasta: number,
): number {
  const a = Math.max(desde, periodoDesde);
  const b = Math.min(hasta, periodoHasta);
  return Math.max(0, b - a + 1);
}

export function hastaAnioEvento(ev: Evento): number {
  if (ev.hastaAnio != null) return ev.hastaAnio;
  const m = ev.notas?.match(/^(\d{4})[–-](\d{4})/);
  if (m) return Number(m[2]);
  return ev.anio;
}

/**
 * ¿El primer ejercicio del evento cae en el horizonte de referencia?
 * (Usado para decidir si aporta a la fila; la cuota es solo de ese año.)
 */
export function primerAnioEnHorizonte(ev: Evento): boolean {
  const { desde, hasta } = periodoFilaFiscal();
  return ev.anio >= desde && ev.anio <= hasta;
}

export interface RollupFiscal {
  /** Impacto fiscal del primer ejercicio (suma de cuotas del año 1 de cada evento). */
  impuestosPeriodo: number;
  parcial: boolean;
  motivosParcial: string[];
  parametrosAVerificar: boolean;
  /**
   * Alguna cuota del rollup se calcula sobre un dato introducido
   * (pensión estimada). No implica parcial.
   */
  sobreDatoIntroducido: boolean;
  desglose: Array<{
    eventoId: string;
    etiqueta: string;
    anios: number;
    cuotaAnual: number;
    aportePeriodo: number;
    kind: ResultadoFiscalMotor["kind"] | "introducido";
    sobreDatoIntroducido?: string;
  }>;
}

export function rollupImpuestosEscenario(
  eventos: Evento[],
  ctxFor: (ev: Evento) => ContextoFiscalEvento,
): RollupFiscal {
  let total = 0;
  let parcial = false;
  const motivosParcial: string[] = [];
  let parametrosAVerificar = false;
  let sobreDatoIntroducido = false;
  const desglose: RollupFiscal["desglose"] = [];

  for (const ev of eventos) {
    const enHorizonte = primerAnioEnHorizonte(ev);

    // Jubilación ajusta la base: nunca marca parcial ni suma impacto tecleado
    if (ev.tipo === "jubilarse") {
      const ctx = ctxFor(ev);
      const motor = simularMotorEvento(ev.tipo, ctx);
      if (enHorizonte) {
        desglose.push({
          eventoId: ev.id,
          etiqueta: ev.etiqueta,
          anios: 1,
          cuotaAnual: 0,
          aportePeriodo: 0,
          kind: motor.kind === "neutro" || motor.kind === "calculado" ? motor.kind : "neutro",
        });
      }
      continue;
    }

    if (ev.introducidoPorAsesor && (ev.cuotaAnual != null || ev.impuestosPeriodo != null)) {
      if (enHorizonte) {
        parcial = true;
        motivosParcial.push(
          `${ev.etiqueta}: impacto introducido por el asesor (no entra en el total calculado)`,
        );
        desglose.push({
          eventoId: ev.id,
          etiqueta: ev.etiqueta,
          anios: 1,
          cuotaAnual: 0,
          aportePeriodo: 0,
          kind: "introducido",
        });
      }
      continue;
    }

    const ctx = ctxFor(ev);
    const motor = simularMotorEvento(ev.tipo, ctx);

    if (motor.kind === "pendiente_is") {
      if (enHorizonte) {
        parcial = true;
        motivosParcial.push(
          `${ev.etiqueta}: sin liquidador de IS — no se suma cifra`,
        );
        desglose.push({
          eventoId: ev.id,
          etiqueta: ev.etiqueta,
          anios: 1,
          cuotaAnual: 0,
          aportePeriodo: 0,
          kind: "pendiente_is",
        });
      }
      continue;
    }

    if (motor.kind === "sin_calculo") {
      if (enHorizonte) {
        parcial = true;
        motivosParcial.push(`${ev.etiqueta}: ${motor.nota}`);
        desglose.push({
          eventoId: ev.id,
          etiqueta: ev.etiqueta,
          anios: 1,
          cuotaAnual: 0,
          aportePeriodo: 0,
          kind: "sin_calculo",
        });
      }
      continue;
    }

    if (motor.kind === "calculado" || motor.kind === "neutro") {
      // Siempre refresca cuota del evento (también fuera del horizonte de la fila)
      desglose.push({
        eventoId: ev.id,
        etiqueta: ev.etiqueta,
        anios: 1,
        cuotaAnual: motor.importe,
        aportePeriodo: enHorizonte ? motor.importe : 0,
        kind: motor.kind,
        sobreDatoIntroducido: motor.sobreDatoIntroducido,
      });
      if (enHorizonte) {
        if (motor.parametrosAVerificar) parametrosAVerificar = true;
        if (motor.sobreDatoIntroducido) sobreDatoIntroducido = true;
        total += motor.importe;
      }
    }
  }

  return {
    impuestosPeriodo: Math.round(total),
    parcial,
    motivosParcial,
    parametrosAVerificar,
    sobreDatoIntroducido,
    desglose,
  };
}
