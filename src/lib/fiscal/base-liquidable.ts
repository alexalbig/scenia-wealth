/**
 * Paso de rendimientos íntegros del trabajo → base liquidable general (aprox.).
 * Arts. 19 y 20 LIRPF. Cotizaciones SS: solo si el asesor las informa (no se estiman).
 *
 * Nota art. 20: la cuantía se calcula sobre el RNT previo a la letra f) del art. 19.2
 * (cotizaciones a–e), y luego se aplica sobre el rendimiento neto (con letra f).
 *
 * v14: los conceptos del desglose se adaptan a la fuente. Un pensionista no ve
 * "− Cotizaciones SS: 0 €" — el concepto no aplica y no aparece.
 */

import { formatIntegerES } from "@/lib/format";
import type { FuenteIngreso } from "@/lib/types";
import { PARAMETROS } from "./parametros";

export interface ConceptoDesglose {
  etiqueta: string;
  importe: number;
}

export interface DesgloseBaseLiquidable {
  /** Suma de ingresos brutos de trabajo / pensión del año. */
  bruto: number;
  /** Bruto solo de fuente «trabajo» (asalariado). */
  trabajoBruto: number;
  /** Bruto solo de fuente «pensión». */
  pensionBruta: number;
  /** Otras rentas brutas (alquiler, etc.) — se suman sin arts. 19/20. */
  otrasRentas: number;
  cotizacionesSS: number;
  cotizacionesInformadas: boolean;
  gastosOtrosArt19: number;
  /** RNT para umbrales art. 20 (= bruto − cotizaciones a–e; sin letra f). */
  rntParaArt20: number;
  /** Tras cotizaciones + art. 19.2.f (antes de art. 20). */
  rendimientoNetoAntesArt20: number;
  reduccionArt20: number;
  /**
   * Rendimiento neto reducido del trabajo (+ otras rentas).
   * Base liquidable general aproximada del motor
   * (antes de aportaciones art. 51/52 y del mínimo personal).
   */
  baseLiquidable: number;
  /** true = ya neteada de arts. 19/20. */
  esLiquidable: boolean;
  /** Conceptos para UI — omiten lo que no aplica (p. ej. cotizaciones en pensionista). */
  conceptos: ConceptoDesglose[];
  /** Fuentes presentes que el motor no modela. */
  fuentesNoContempladas: FuenteIngreso[];
  /** Resumen textual (compat / motor notes). */
  nota: string;
}

/** Resultado de base por persona/año, con origen de la base. */
export interface BasePersonaEnAnio {
  desglose: DesgloseBaseLiquidable;
  /**
   * true si el trabajo se sustituyó por la pensión del evento «jubilarse»
   * (dato introducido por el asesor · no del expediente).
   */
  sobrePensionEstimada: boolean;
}

/** Reducción art. 20 LIRPF (RDL 4/2024) · umbrales sobre RNT sin letra f. */
export function cuantiaReduccionArt20(
  rntParaArt20: number,
  otrasRentas: number,
): number {
  const tope = PARAMETROS.reduccionTrabajoTopeRNT.valor;
  const otrasMax = PARAMETROS.reduccionTrabajoOtrasRentasMax.valor;
  if (rntParaArt20 >= tope) return 0;
  if (otrasRentas > otrasMax) return 0;

  const t1 = PARAMETROS.reduccionTrabajoTramo1Hasta.valor;
  const c1 = PARAMETROS.reduccionTrabajoTramo1Cuantia.valor;
  const t2 = PARAMETROS.reduccionTrabajoTramo2Hasta.valor;
  const coef2 = PARAMETROS.reduccionTrabajoTramo2Coef.valor;
  const c3 = PARAMETROS.reduccionTrabajoTramo3Cuantia.valor;
  const coef3 = PARAMETROS.reduccionTrabajoTramo3Coef.valor;

  let red = 0;
  if (rntParaArt20 <= t1) {
    red = c1;
  } else if (rntParaArt20 <= t2) {
    red = c1 - coef2 * (rntParaArt20 - t1);
  } else {
    red = c3 - coef3 * (rntParaArt20 - t2);
  }
  return Math.max(0, red);
}

/**
 * Calcula base liquidable aproximada.
 * `cotizacionesSS` solo se resta si viene informada; si no, 0 (hueco · no se estima).
 * Cotizaciones solo aparecen como concepto si hay rendimientos de trabajo asalariado.
 */
export function desgloseBaseLiquidable(opts: {
  /** Rendimientos brutos de fuente «trabajo» (asalariado). */
  trabajoBruto?: number;
  /** Rendimientos brutos de fuente «pensión». */
  pensionBruta?: number;
  /**
   * Compat: suma trabajo+pensión. Si se pasa junto a trabajo/pensión,
   * gana trabajoBruto+pensionBruta.
   */
  ingresosTrabajoBrutos?: number;
  otrasRentasBrutas?: number;
  cotizacionesSS?: number | null;
  fuentesNoContempladas?: FuenteIngreso[];
}): DesgloseBaseLiquidable {
  const fuentesNoContempladas = opts.fuentesNoContempladas ?? [];
  let trabajoBruto = Math.max(0, opts.trabajoBruto ?? 0);
  let pensionBruta = Math.max(0, opts.pensionBruta ?? 0);

  if (
    opts.ingresosTrabajoBrutos != null &&
    opts.trabajoBruto == null &&
    opts.pensionBruta == null
  ) {
    // Compat: callers antiguos pasan todo junto como «trabajo».
    trabajoBruto = Math.max(0, opts.ingresosTrabajoBrutos);
  }

  const bruto = trabajoBruto + pensionBruta;
  const otrasRentas = Math.max(0, opts.otrasRentasBrutas ?? 0);
  const tieneTrabajoAsalariado = trabajoBruto > 0;
  const informadas =
    opts.cotizacionesSS != null && Number.isFinite(opts.cotizacionesSS);
  // Cotizaciones solo restan si hay trabajo asalariado y están informadas.
  const cotizacionesSS =
    tieneTrabajoAsalariado && informadas
      ? Math.max(0, Math.min(opts.cotizacionesSS!, bruto))
      : 0;

  const rntParaArt20 = Math.max(0, bruto - cotizacionesSS);
  const gastoOtrosMax = PARAMETROS.gastoOtrosTrabajoArt19.valor;
  const gastosOtrosArt19 =
    bruto > 0 ? Math.min(gastoOtrosMax, rntParaArt20) : 0;

  const rendimientoNetoAntesArt20 = Math.max(
    0,
    rntParaArt20 - gastosOtrosArt19,
  );
  const redBruta = cuantiaReduccionArt20(rntParaArt20, otrasRentas);
  // Art. 20: el saldo del rendimiento neto no puede ser negativo
  const reduccionArt20 = Math.min(redBruta, rendimientoNetoAntesArt20);
  const rtoNetoReducido = Math.max(
    0,
    rendimientoNetoAntesArt20 - reduccionArt20,
  );
  const baseLiquidable = rtoNetoReducido + otrasRentas;

  const conceptos: ConceptoDesglose[] = [];
  if (trabajoBruto > 0) {
    conceptos.push({
      etiqueta: "bruto trabajo",
      importe: Math.round(trabajoBruto),
    });
  }
  if (pensionBruta > 0) {
    conceptos.push({
      etiqueta: "bruto pensión",
      importe: Math.round(pensionBruta),
    });
  }
  // Cotizaciones: solo si hay trabajo asalariado. No aparecen en pensionista.
  if (tieneTrabajoAsalariado) {
    if (informadas) {
      conceptos.push({
        etiqueta: "− cotizaciones SS (informadas)",
        importe: -Math.round(cotizacionesSS),
      });
    }
    // Si no informadas: el concepto no se inventa como 0 — hueco, no se muestra.
  }
  if (bruto > 0) {
    conceptos.push({
      etiqueta: "− art. 19.2.f)",
      importe: -Math.round(gastosOtrosArt19),
    });
    if (reduccionArt20 > 0) {
      conceptos.push({
        etiqueta: "− art. 20",
        importe: -Math.round(reduccionArt20),
      });
    }
  }
  if (otrasRentas > 0) {
    conceptos.push({
      etiqueta: "+ otras rentas",
      importe: Math.round(otrasRentas),
    });
  }

  const nota =
    conceptos
      .map((c) => {
        const abs = formatIntegerES(Math.abs(c.importe));
        if (c.importe < 0) return `${c.etiqueta} ${abs} €`;
        if (c.etiqueta.startsWith("+") || c.etiqueta.startsWith("−")) {
          return `${c.etiqueta} ${abs} €`;
        }
        return `${c.etiqueta} ${abs} €`;
      })
      .join(" · ") || "sin ingresos";

  return {
    bruto,
    trabajoBruto,
    pensionBruta,
    otrasRentas,
    cotizacionesSS,
    cotizacionesInformadas: tieneTrabajoAsalariado && informadas,
    gastosOtrosArt19,
    rntParaArt20,
    rendimientoNetoAntesArt20,
    reduccionArt20,
    baseLiquidable,
    esLiquidable: true,
    conceptos,
    fuentesNoContempladas,
    nota,
  };
}

/** Límite de reducción por aportación a plan (art. 52) — plan individual sin empresa. */
export function limiteAportacionPlanIndividual(
  rendimientoNetoTrabajo: number,
): { limite: number; porPct: number; porEuros: number } {
  const porEuros = PARAMETROS.aportacionPlanLimiteEuros.valor;
  const porPct =
    Math.max(0, rendimientoNetoTrabajo) *
    PARAMETROS.aportacionPlanLimitePctRNT.valor;
  return {
    limite: Math.min(porEuros, porPct),
    porPct,
    porEuros,
  };
}
