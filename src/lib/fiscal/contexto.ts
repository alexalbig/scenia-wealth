/**
 * Construye el contexto del motor a partir del expediente + evento.
 * Tipado mínimo para evitar ciclo con expediente.ts.
 */

import type { Evento, Persona, Titularidad } from "@/lib/types";
import type { ContextoFiscalEvento, TitularFiscal } from "./motor";
import { hastaAnioEvento } from "./rollup";

/** Subconjunto del bag necesario para el motor (sin importar ExpedienteBag). */
export interface BagFiscalSlice {
  cliente: { ccaa: string };
  personas: Persona[];
  instrumentos: Array<{
    id: string;
    valor: number;
    plusvaliaLatente?: number;
    costeAdquisicion?: number;
    titularidades: Titularidad[];
  }>;
  inmuebles: Array<{
    id: string;
    valor: number;
    plusvaliaLatente?: number;
    costeAdquisicion?: number;
    titularidades: Titularidad[];
  }>;
  ingresos: Array<{ personaId: string; importeAnual: number }>;
}

function ingresosPersona(
  bag: BagFiscalSlice,
  personaId: string,
): number {
  return bag.ingresos
    .filter((i) => i.personaId === personaId)
    .reduce((s, i) => s + i.importeAnual, 0);
}

export function buildContextoFiscalFromBag(
  bag: BagFiscalSlice,
  ev: Evento,
  overrides?: Partial<ContextoFiscalEvento>,
): ContextoFiscalEvento {
  const ccaa = bag.cliente.ccaa;
  const anio = ev.anio;

  const inst = bag.instrumentos.find((i) => i.id === ev.targetId);
  const inm = bag.inmuebles.find((i) => i.id === ev.targetId);

  const titsSrc = inst?.titularidades ?? inm?.titularidades ?? [];
  const titularidades: TitularFiscal[] = titsSrc
    .filter((t) => t.owner.kind === "persona")
    .map((t) => {
      const personaId =
        t.owner.kind === "persona" ? t.owner.personaId : "";
      const persona = bag.personas.find((p) => p.id === personaId);
      const edad = persona ? anio - persona.birthYear : undefined;
      return {
        personaId,
        pct: t.porcentaje,
        baseGeneral: ingresosPersona(bag, personaId),
        edad,
      };
    });

  let baseGeneralTitular = 0;
  if (titularidades.length === 1) {
    baseGeneralTitular = titularidades[0]!.baseGeneral;
  } else if (titularidades.length > 0) {
    const top = [...titularidades].sort((a, b) => b.pct - a.pct)[0]!;
    baseGeneralTitular = top.baseGeneral;
  }

  const modalidad =
    ev.tipo === "rescatar_plan"
      ? ev.etiqueta.toLowerCase().includes("renta")
        ? "renta"
        : ev.etiqueta.toLowerCase().includes("capital")
          ? "capital"
          : "renta"
      : undefined;

  let importe: number | undefined;
  const mImp = ev.etiqueta.match(/([\d.]+)\s*€/);
  if (mImp) {
    const raw = mImp[1]!;
    importe = raw.includes(",")
      ? Number(raw.replace(/\./g, "").replace(",", "."))
      : Number(raw.replace(/\./g, ""));
  }

  return {
    anio,
    ccaa,
    baseGeneralTitular,
    titularidades,
    valorActivo: inst?.valor ?? inm?.valor,
    plusvaliaLatente: inst?.plusvaliaLatente ?? inm?.plusvaliaLatente,
    costeAdquisicion: inst?.costeAdquisicion ?? inm?.costeAdquisicion,
    importe: overrides?.importe ?? importe,
    hastaAnio: overrides?.hastaAnio ?? hastaAnioEvento(ev),
    modalidad: overrides?.modalidad ?? modalidad,
    reinvierte: overrides?.reinvierte,
    ...overrides,
  };
}
