/**
 * Construye el contexto del motor a partir del expediente + evento.
 * Tipado mínimo para evitar ciclo con expediente.ts.
 *
 * La base general es la base liquidable aproximada (arts. 19/20), no el bruto.
 * Respeta jubilaciones del mismo escenario: a partir del año de jubilación,
 * los ingresos de trabajo se sustituyen por la pensión estimada del asesor.
 */

import type { Evento, FuenteIngreso, Persona, Titularidad } from "@/lib/types";
import {
  desgloseBaseLiquidable,
  type BasePersonaEnAnio,
  type DesgloseBaseLiquidable,
} from "./base-liquidable";
import type { ContextoFiscalEvento, TitularFiscal } from "./motor";
import { hastaAnioEvento } from "./rollup";

const FUENTES_TRABAJO: FuenteIngreso[] = ["trabajo", "pension"];
const FUENTES_NO_CONTEMPLADAS: FuenteIngreso[] = ["actividad_economica"];

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
    uso?: import("@/lib/types").UsoInmueble;
    titularidades: Titularidad[];
  }>;
  ingresos: Array<{
    personaId: string;
    importeAnual: number;
    fuente?: string;
    /** Cotizaciones SS anuales · art. 19.2.a · solo si las informa el asesor. */
    cotizacionesSS?: number;
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
 * Desglose bruto → liquidable de una persona en un año.
 * Si hay jubilación ≤ anio, sustituye ingresos de trabajo por la pensión.
 */
export function basePersonaEnAnio(
  bag: BagFiscalSlice,
  personaId: string,
  anio: number,
  eventosEscenario: Evento[] = [],
): BasePersonaEnAnio {
  const jubilaciones = eventosEscenario
    .filter(
      (e) =>
        e.tipo === "jubilarse" &&
        e.targetId === personaId &&
        e.anio <= anio,
    )
    .sort((a, b) => b.anio - a.anio);

  const lineas = bag.ingresos.filter((i) => i.personaId === personaId);

  let trabajoBruto = 0;
  let pensionBruta = 0;
  let otrasRentas = 0;
  let cotizaciones: number | null = null;
  const fuentesNoContempladas: FuenteIngreso[] = [];
  const sobrePensionEstimada = jubilaciones.length > 0;

  if (!sobrePensionEstimada) {
    for (const i of lineas) {
      const f = (i.fuente ?? "trabajo") as FuenteIngreso;
      if (FUENTES_NO_CONTEMPLADAS.includes(f)) {
        if (!fuentesNoContempladas.includes(f)) fuentesNoContempladas.push(f);
        continue;
      }
      if (f === "trabajo") {
        trabajoBruto += i.importeAnual;
        if (i.cotizacionesSS != null && Number.isFinite(i.cotizacionesSS)) {
          cotizaciones = (cotizaciones ?? 0) + i.cotizacionesSS;
        }
      } else if (f === "pension") {
        pensionBruta += i.importeAnual;
      } else {
        otrasRentas += i.importeAnual;
      }
    }
  } else {
    // Jubilación: sustituye trabajo por pensión estimada del asesor.
    pensionBruta = parsePensionJubilacion(jubilaciones[0]!) ?? 0;
    for (const i of lineas) {
      const f = (i.fuente ?? "trabajo") as FuenteIngreso;
      if (FUENTES_NO_CONTEMPLADAS.includes(f)) {
        if (!fuentesNoContempladas.includes(f)) fuentesNoContempladas.push(f);
        continue;
      }
      if (f === "trabajo") continue; // sustituido por pensión
      if (f === "pension") {
        pensionBruta += i.importeAnual;
      } else if (!FUENTES_TRABAJO.includes(f)) {
        otrasRentas += i.importeAnual;
      }
    }
  }

  return {
    desglose: desgloseBaseLiquidable({
      trabajoBruto,
      pensionBruta,
      otrasRentasBrutas: otrasRentas,
      cotizacionesSS: cotizaciones,
      fuentesNoContempladas,
    }),
    sobrePensionEstimada,
  };
}

/** @deprecated Preferir basePersonaEnAnio · mantiene compat. */
export function desgloseBasePersonaEnAnio(
  bag: BagFiscalSlice,
  personaId: string,
  anio: number,
  eventosEscenario: Evento[] = [],
): DesgloseBaseLiquidable {
  return basePersonaEnAnio(bag, personaId, anio, eventosEscenario).desglose;
}

/**
 * Base liquidable general de una persona en un año (arts. 19/20).
 * Antes era la suma de brutos.
 */
export function baseGeneralPersonaEnAnio(
  bag: BagFiscalSlice,
  personaId: string,
  anio: number,
  eventosEscenario: Evento[] = [],
): number {
  return basePersonaEnAnio(bag, personaId, anio, eventosEscenario).desglose
    .baseLiquidable;
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
  const bases: BasePersonaEnAnio[] = [];
  const titularidades: TitularFiscal[] = titsSrc
    .filter((t) => t.owner.kind === "persona")
    .map((t) => {
      const personaId =
        t.owner.kind === "persona" ? t.owner.personaId : "";
      const persona = bag.personas.find((p) => p.id === personaId);
      const edad = persona ? anio - persona.birthYear : undefined;
      const base = basePersonaEnAnio(
        bag,
        personaId,
        anio,
        eventosEscenario,
      );
      bases.push(base);
      return {
        personaId,
        pct: t.porcentaje,
        baseGeneral: base.desglose.baseLiquidable,
        edad,
      };
    });

  // Rescate / aportación / jubilación: titular = target persona o dueño del plan
  if (titularidades.length === 0 && ev.targetId) {
    const persona = bag.personas.find((p) => p.id === ev.targetId);
    if (persona) {
      const base = basePersonaEnAnio(
        bag,
        persona.id,
        anio,
        eventosEscenario,
      );
      bases.push(base);
      titularidades.push({
        personaId: persona.id,
        pct: 1,
        baseGeneral: base.desglose.baseLiquidable,
        edad: anio - persona.birthYear,
      });
    }
  }

  let baseGeneralTitular = 0;
  let baseTitular: BasePersonaEnAnio | undefined;
  if (titularidades.length === 1) {
    baseGeneralTitular = titularidades[0]!.baseGeneral;
    baseTitular = bases[0];
  } else if (titularidades.length > 0) {
    const ranked = titularidades
      .map((t, i) => ({ t, b: bases[i], pct: t.pct }))
      .sort((a, b) => b.pct - a.pct);
    baseGeneralTitular = ranked[0]!.t.baseGeneral;
    baseTitular = ranked[0]!.b;
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

  const desgloseTitular = baseTitular?.desglose;

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
    anioContingencia: overrides?.anioContingencia ?? ev.anioContingencia,
    usoInmueble: overrides?.usoInmueble ?? inm?.uso,
    notaBaseLiquidable: desgloseTitular?.nota,
    rendimientoNetoTrabajo: desgloseTitular
      ? Math.max(
          0,
          desgloseTitular.baseLiquidable - desgloseTitular.otrasRentas,
        )
      : undefined,
    baseSobrePensionEstimada: baseTitular?.sobrePensionEstimada === true,
    ...overrides,
  };
}
