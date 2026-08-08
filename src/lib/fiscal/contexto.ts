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
import { estadoFiscalPersona } from "./estado-persona";
import type { ContextoFiscalEvento, TitularFiscal } from "./motor";
import { hastaAnioEvento } from "./rollup";

const FUENTES_TRABAJO: FuenteIngreso[] = ["trabajo", "pension"];
const FUENTES_NO_CONTEMPLADAS: FuenteIngreso[] = ["actividad_economica"];

/**
 * Cotizaciones SS · preferencia Persona; fallback legacy en líneas de ingreso.
 * (Misma regla que `cotizacionesSSDePersona` en expediente.ts — sin importar
 * expediente para evitar ciclo.)
 */
function resolveCotizacionesSS(
  persona: Persona | undefined,
  ingresos: Array<{ fuente?: string; cotizacionesSS?: number }>,
): number | null {
  if (
    persona?.cotizacionesSS != null &&
    Number.isFinite(persona.cotizacionesSS)
  ) {
    return persona.cotizacionesSS;
  }
  let sum: number | null = null;
  for (const i of ingresos) {
    if (
      i.fuente === "trabajo" &&
      i.cotizacionesSS != null &&
      Number.isFinite(i.cotizacionesSS)
    ) {
      sum = (sum ?? 0) + i.cotizacionesSS;
    }
  }
  return sum;
}

/** Clasificador v14 sobre el slice del bag (ingresos tipados a la ligera). */
function estadoTitularFromBag(
  bag: BagFiscalSlice,
  persona: Persona,
): ReturnType<typeof estadoFiscalPersona> {
  const ingresos = bag.ingresos
    .filter((i) => i.personaId === persona.id)
    .map((i) => ({
      id: `tmp-${persona.id}`,
      clienteId: "bag",
      personaId: persona.id,
      fuente: (i.fuente ?? "trabajo") as FuenteIngreso,
      importeAnual: i.importeAnual,
    }));
  return estadoFiscalPersona(persona, ingresos);
}

function titularFiscalFromPersona(
  bag: BagFiscalSlice,
  persona: Persona,
  pct: number,
  anio: number,
  eventosEscenario: Evento[],
): { titular: TitularFiscal; base: BasePersonaEnAnio } {
  const base = basePersonaEnAnio(bag, persona.id, anio, eventosEscenario);
  return {
    base,
    titular: {
      personaId: persona.id,
      pct,
      baseGeneral: base.desglose.baseLiquidable,
      edad: anio - persona.birthYear,
      ccaa: persona.ccaa,
      nombre: persona.nombre,
      estado: estadoTitularFromBag(bag, persona),
    },
  };
}

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
    /** Año de contingencia del plan (dato del asesor). */
    anioContingencia?: number;
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
    /** @deprecated PE5 · usar Persona.cotizacionesSS */
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
  const persona = bag.personas.find((p) => p.id === personaId);

  let trabajoBruto = 0;
  let pensionBruta = 0;
  let otrasRentas = 0;
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

  const cotizaciones = sobrePensionEstimada
    ? null
    : resolveCotizacionesSS(persona, lineas);

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
  const titularidades: TitularFiscal[] = [];
  for (const t of titsSrc) {
    if (t.owner.kind !== "persona") continue;
    const personaId = t.owner.personaId;
    const persona = bag.personas.find((p) => p.id === personaId);
    if (!persona) continue;
    const { titular, base } = titularFiscalFromPersona(
      bag,
      persona,
      t.porcentaje,
      anio,
      eventosEscenario,
    );
    bases.push(base);
    titularidades.push(titular);
  }

  // Rescate / aportación / jubilación: titular = target persona o dueño del plan
  if (titularidades.length === 0 && ev.targetId) {
    const persona = bag.personas.find((p) => p.id === ev.targetId);
    if (persona) {
      const { titular, base } = titularFiscalFromPersona(
        bag,
        persona,
        1,
        anio,
        eventosEscenario,
      );
      bases.push(base);
      titularidades.push(titular);
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

  let importe: number | undefined = ev.importe;
  if (importe == null) {
    const mImp = ev.etiqueta.match(/([\d.]+)\s*€/);
    if (mImp) {
      const raw = mImp[1]!;
      importe = raw.includes(",")
        ? Number(raw.replace(/\./g, "").replace(",", "."))
        : Number(raw.replace(/\./g, ""));
    }
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
    anioContingencia:
      overrides?.anioContingencia ??
      ev.anioContingencia ??
      inst?.anioContingencia,
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
