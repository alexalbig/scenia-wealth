import type { TipoEvento } from "@/lib/types";

/** Payload que emite CT1 (PlantillaEvento) al guardar un evento. */
export interface EventoCreadoPayload {
  tipo: TipoEvento;
  etiqueta: string;
  anio: number;
  hastaAnio?: number;
  /** Cuota anual del motor (calculado/neutro) o impacto tecleado (introducido). */
  cuotaAnual?: number;
  /** @deprecated alias de cuotaAnual para callers antiguos */
  impuestosPeriodo?: number;
  introducidoPorAsesor?: boolean;
  notas?: string;
  escenarioId?: string;
  targetId?: string;
}
