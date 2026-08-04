/**
 * Clasificador de estado fiscal por persona (v14).
 * Toda persona queda calculada o declarada — nunca una cuota que parezca
 * resultado cuando faltan datos.
 *
 * Orden de comprobación (importa):
 * 1. CCAA sin cobertura (persona.ccaa, no cliente.ccaa)
 * 2. Fuente no contemplada (actividad económica)
 * 3. Sin ingresos informados
 */

import type { CCAA, FuenteIngreso, Ingreso, Persona } from "@/lib/types";

/** Misma regla que `ccaaConCobertura` del facade — sin importar el facade (ciclo). */
function ccaaConCoberturaLocal(ccaa: CCAA): boolean {
  return ccaa === "Comunitat Valenciana";
}

function avisoCoberturaLocal(ccaa: CCAA): string {
  if (ccaa === "Comunidad Foral de Navarra") {
    return "La Comunidad Foral de Navarra tiene régimen fiscal propio; Scenia no cubre su normativa.";
  }
  if (ccaa === "País Vasco") {
    return "El País Vasco tiene régimen fiscal propio; Scenia no cubre su normativa.";
  }
  return "El cálculo fiscal solo está disponible para la Comunitat Valenciana.";
}

export type MotivoSinCalculo =
  | "ccaa_sin_cobertura"
  | "fuente_no_contemplada"
  | "sin_ingresos";

export type PerfilRenta = "trabajo" | "pension" | "mixto" | "otras";

export type EstadoFiscalPersona =
  | {
      kind: "calculable";
      ccaa: CCAA;
      perfil: PerfilRenta;
    }
  | {
      kind: "sin_calculo";
      motivo: MotivoSinCalculo;
      aviso: string;
    };

/** Fuentes que el motor no modela → sin_calculo con aviso. */
export const FUENTES_NO_CONTEMPLADAS: readonly FuenteIngreso[] = [
  "actividad_economica",
];

export function esFuenteNoContemplada(fuente: FuenteIngreso): boolean {
  return (FUENTES_NO_CONTEMPLADAS as readonly string[]).includes(fuente);
}

function perfilDeIngresos(ingresos: Ingreso[]): PerfilRenta {
  let trabajo = false;
  let pension = false;
  let otras = false;
  for (const i of ingresos) {
    if (i.fuente === "trabajo") trabajo = true;
    else if (i.fuente === "pension") pension = true;
    else if (!esFuenteNoContemplada(i.fuente)) otras = true;
  }
  if (trabajo && pension) return "mixto";
  if (trabajo) return "trabajo";
  if (pension) return "pension";
  if (otras) return "otras";
  return "otras";
}

/**
 * Estado fiscal de una persona del expediente.
 * `ingresos` = líneas de esa persona (ya filtradas).
 */
export function estadoFiscalPersona(
  persona: Persona,
  ingresos: Ingreso[],
): EstadoFiscalPersona {
  if (!ccaaConCoberturaLocal(persona.ccaa)) {
    return {
      kind: "sin_calculo",
      motivo: "ccaa_sin_cobertura",
      aviso: avisoCoberturaLocal(persona.ccaa),
    };
  }

  const noContempladas = ingresos.filter((i) =>
    esFuenteNoContemplada(i.fuente),
  );
  if (noContempladas.length > 0) {
    return {
      kind: "sin_calculo",
      motivo: "fuente_no_contemplada",
      aviso:
        "Rendimientos de actividades económicas: fuente no contemplada por el motor",
    };
  }

  const conImporte = ingresos.filter((i) => i.importeAnual > 0);
  if (conImporte.length === 0) {
    return {
      kind: "sin_calculo",
      motivo: "sin_ingresos",
      aviso:
        "Sin ingresos informados para este titular — no se puede liquidar el ejercicio",
    };
  }

  return {
    kind: "calculable",
    ccaa: persona.ccaa,
    perfil: perfilDeIngresos(ingresos),
  };
}
