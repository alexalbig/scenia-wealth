/**
 * Rollup de impuestos del periodo a partir de los eventos del escenario.
 * Solo suma aportaciones calculadas por el motor — nunca cifras tecleadas ni huecos.
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

export interface RollupFiscal {
  impuestosPeriodo: number;
  parcial: boolean;
  motivosParcial: string[];
  parametrosAVerificar: boolean;
  desglose: Array<{
    eventoId: string;
    etiqueta: string;
    anios: number;
    cuotaAnual: number;
    aportePeriodo: number;
    kind: ResultadoFiscalMotor["kind"] | "introducido";
  }>;
}

export function rollupImpuestosEscenario(
  eventos: Evento[],
  ctxFor: (ev: Evento) => ContextoFiscalEvento,
): RollupFiscal {
  const { desde, hasta } = periodoFilaFiscal();
  let total = 0;
  let parcial = false;
  const motivosParcial: string[] = [];
  let parametrosAVerificar = false;
  const desglose: RollupFiscal["desglose"] = [];

  for (const ev of eventos) {
    const anios = aniosSolape(ev.anio, hastaAnioEvento(ev), desde, hasta);
    if (anios === 0) continue;

    if (ev.introducidoPorAsesor && ev.impuestosPeriodo != null) {
      parcial = true;
      motivosParcial.push(
        `${ev.etiqueta}: impacto introducido por el asesor (no entra en el total calculado)`,
      );
      desglose.push({
        eventoId: ev.id,
        etiqueta: ev.etiqueta,
        anios,
        cuotaAnual: 0,
        aportePeriodo: 0,
        kind: "introducido",
      });
      continue;
    }

    const ctx = ctxFor(ev);
    const motor = simularMotorEvento(ev.tipo, ctx);

    if (motor.kind === "pendiente_is") {
      parcial = true;
      motivosParcial.push(
        `${ev.etiqueta}: sin liquidador de IS — no se suma cifra`,
      );
      desglose.push({
        eventoId: ev.id,
        etiqueta: ev.etiqueta,
        anios,
        cuotaAnual: 0,
        aportePeriodo: 0,
        kind: "pendiente_is",
      });
      continue;
    }

    if (motor.kind === "sin_calculo") {
      // jubilarse / amortizar sin cifra: no parcial
      desglose.push({
        eventoId: ev.id,
        etiqueta: ev.etiqueta,
        anios,
        cuotaAnual: 0,
        aportePeriodo: 0,
        kind: "sin_calculo",
      });
      continue;
    }

    if (motor.kind === "calculado" || motor.kind === "neutro") {
      if (motor.parametrosAVerificar) parametrosAVerificar = true;
      // Prefer cuota del motor fresco; si el evento guardó cuotaAnual, usarla
      const cuotaAnual =
        ev.cuotaAnual ?? ev.impuestosPeriodo ?? motor.importe;
      const aporte = cuotaAnual * anios;
      total += aporte;
      desglose.push({
        eventoId: ev.id,
        etiqueta: ev.etiqueta,
        anios,
        cuotaAnual,
        aportePeriodo: aporte,
        kind: motor.kind,
      });
    }
  }

  return {
    impuestosPeriodo: Math.round(total),
    parcial,
    motivosParcial,
    parametrosAVerificar,
    desglose,
  };
}
