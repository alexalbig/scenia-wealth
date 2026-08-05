import type { TipoEvento, TipoEventoGenerico } from "@/lib/types";

/** Payload que emite CT1 (PlantillaEvento) al guardar un evento. */
export interface EventoCreadoPayload {
  tipo: TipoEvento;
  etiqueta: string;
  anio: number;
  hastaAnio?: number;
  /** Importe económico del evento (campo de modelo). */
  importe?: number;
  /** Subtipo del evento genérico (campo de modelo). */
  tipoGenerico?: TipoEventoGenerico;
  /** Cuota anual del motor (calculado/neutro) o impacto tecleado (introducido). */
  cuotaAnual?: number;
  /** @deprecated alias de cuotaAnual para callers antiguos */
  impuestosPeriodo?: number;
  introducidoPorAsesor?: boolean;
  /**
   * Cálculo del motor sobre un dato introducido (p. ej. pensión estimada).
   */
  sobreDatoIntroducido?: string;
  /** Año de la contingencia · DT 12ª (rescate capital). */
  anioContingencia?: number;
  notas?: string;
  escenarioId?: string;
  targetId?: string;
}
