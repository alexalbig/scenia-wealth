import type { TipoEvento } from "@/lib/types";

/** Payload que emite CT1 (PlantillaEvento) al guardar un evento. */
export interface EventoCreadoPayload {
  tipo: TipoEvento;
  etiqueta: string;
  anio: number;
  impuestosPeriodo?: number;
  introducidoPorAsesor?: boolean;
  notas?: string;
  escenarioId?: string;
}
