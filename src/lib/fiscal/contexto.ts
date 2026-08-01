/**
 * Construye el contexto del motor a partir del expediente + evento.
 * Tipado mínimo para evitar ciclo con expediente.ts.
 *
 * La base general respeta jubilaciones del mismo escenario:
 * a partir del año de jubilación, los ingresos de trabajo se sustituyen
 * por la pensión estimada (introducida por el asesor).
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
    /** Fracción 0–1 de aportaciones ≤ 31/12/2006 (planes). */
    fraccionPre2007?: number;
    titularidades: Titularidad[];
  }>;
  inmuebles: Array<{
    id: string;
    valor: number;
    plusvaliaLatente?: number;
    costeAdquisicion?: number;
    titularidades: Titularidad[];
  }>;
  ingresos: Array<{
    personaId: string;
    importeAnual: number;
    fuente?: string;
  }>;
}

/** Extrae la pensión anual de la etiqueta o notas del evento jubilarse. */
export function parsePensionJubilacion(ev: Evento): number | null {
  const fuentes = [ev.etiqueta, ev.notas ?? ""];
  for (const text of fuentes) {
    const m = text.match(
      /pensi[oó]n(?:\s+estimada)?\s+([\d.\s]+(?:,\d+)?)\s*€/i,
    );
    if (!m) continue;
    const raw = m[1]!.replace(/\s/g, "");
    const n = raw.includes(",")
      ? Number(raw.replace(/\./g, "").replace(",", "."))
      : Number(raw.replace(/\./g, ""));
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

/**
 * Base general de una persona en un año, dentro de un escenario.
 * Si hay jubilación ≤ anio, sustituye ingresos de trabajo por la pensión.
 */
export function baseGeneralPersonaEnAnio(
  bag: BagFiscalSlice,
  personaId: string,
  anio: number,
  eventosEscenario: Evento[] = [],
): number {
  const jubilaciones = eventosEscenario
    .filter(
      (e) =>
        e.tipo === "jubilarse" &&
        e.targetId === personaId &&
        e.anio <= anio,
    )
    .sort((a, b) => b.anio - a.anio);

  const lineas = bag.ingresos.filter((i) => i.personaId === personaId);

  if (jubilaciones.length === 0) {
    return lineas.reduce((s, i) => s + i.importeAnual, 0);
  }

  const pension = parsePensionJubilacion(jubilaciones[0]!) ?? 0;
  const sinTrabajo = lineas
    .filter((i) => i.fuente !== "trabajo")
    .reduce((s, i) => s + i.importeAnual, 0);
  return sinTrabajo + pension;
}

export function buildContextoFiscalFromBag(
  bag: BagFiscalSlice,
  ev: Evento,
  overrides?: Partial<ContextoFiscalEvento>,
  eventosEscenario: Evento[] = [],
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
        baseGeneral: baseGeneralPersonaEnAnio(
          bag,
          personaId,
          anio,
          eventosEscenario,
        ),
        edad,
      };
    });

  // Rescate / jubilación: titular = target persona o dueño del plan
  if (titularidades.length === 0 && ev.targetId) {
    const persona = bag.personas.find((p) => p.id === ev.targetId);
    if (persona) {
      titularidades.push({
        personaId: persona.id,
        pct: 1,
        baseGeneral: baseGeneralPersonaEnAnio(
          bag,
          persona.id,
          anio,
          eventosEscenario,
        ),
        edad: anio - persona.birthYear,
      });
    }
  }

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
    fraccionPre2007: overrides?.fraccionPre2007 ?? inst?.fraccionPre2007,
    ...overrides,
  };
}
