/**
 * Enrutado de fuentes de ingreso hacia el motor y la UI de Ingresos.
 * No inventa liquidaciones: declara huecos y separa cubos.
 */

import type { FuenteIngreso } from "@/lib/types";

/** Cubo del pie de la pestaña Ingresos (y destino fiscal declarado). */
export type CuboIngreso = "base_general" | "base_ahorro" | "sin_calculo";

/** Fuentes cuya cotización SS es relevante (trabajo o pensión). */
export function fuenteAplicaCotizaciones(fuente: FuenteIngreso): boolean {
  return fuente === "trabajo" || fuente === "pension";
}

/**
 * Destino declarado de cada fuente.
 * Dividendo → ahorro (aún sin cálculo). Actividad económica → sin cálculo
 * (y suprime a la persona vía estado-persona). Alquiler → base general
 * sin reducción de arrendamiento.
 */
export function cuboDeFuente(fuente: FuenteIngreso): CuboIngreso {
  switch (fuente) {
    case "dividendo":
      return "sin_calculo";
    case "actividad_economica":
      return "sin_calculo";
    case "trabajo":
    case "pension":
    case "alquiler":
    case "otros":
    default:
      return "base_general";
  }
}

/** No entra en base general ni en otras rentas del desglose arts. 19/20. */
export function fuenteExcluidaDeBaseGeneral(fuente: FuenteIngreso): boolean {
  // Actividad económica se filtra aparte (suprime a la persona).
  return fuente === "dividendo";
}

/** Motivo visible en la fila (solo fuentes con tratamiento declarado). */
export function motivoFilaIngreso(fuente: FuenteIngreso): string | null {
  if (fuente === "dividendo") {
    return "Sin cálculo · los dividendos tributan en base del ahorro y el motor aún no los lleva ahí";
  }
  if (fuente === "alquiler") {
    return "Alquiler sumado a base general sin la reducción por arrendamiento de vivienda, que puede llegar al 50 % · la cuota sale por encima · orientativo";
  }
  return null;
}

/** Nota de simplificación en Fiscalidad cuando hay alquiler. */
export const NOTA_ALQUILER_SIMPLIFICACION =
  "Alquiler sumado a base general sin la reducción por arrendamiento de vivienda, que puede llegar al 50 % · la cuota sale por encima · orientativo";

/** Nota de base del ahorro cuando hay dividendos no liquidados. */
export const NOTA_AHORRO_DIVIDENDOS_SIN_CALCULO =
  "Hay rentas del ahorro que el motor aún no lleva a su base · sin cálculo";

export const NOTA_AHORRO_SIN_RENTAS =
  "Sin rentas del ahorro en el expediente — hueco. Las plusvalías latentes no tributan hasta que un evento las realice.";

export const AVISO_COTIZACIONES_SIN_INFORMAR =
  "Hay ingresos de trabajo sin cotizaciones informadas · la base liquidable saldrá más alta de lo que corresponde.";

export const AVISO_IMPORTE_ATIPICO =
  "Importe atípico · por encima del último tramo de la escala estatal. Comprueba que no sobra un dígito.";
