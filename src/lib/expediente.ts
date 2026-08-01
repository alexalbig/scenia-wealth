import {
  amortizacionCapitalAnual,
  getGastos,
  getIngresos,
  getInmuebles,
  getInstrumentos,
  getOtrosActivos,
  getPasivos,
  getSociedades,
  personaLabel,
} from "@/lib/patrimonio";
import {
  getCliente,
  getEscenariosDeCliente,
  getEventosDeEscenario,
  getHistorialDeCliente,
  getPersonasDeCliente,
  seed,
} from "@/lib/seed";
import type {
  Cliente,
  Escenario,
  Evento,
  Gasto,
  HistorialInforme,
  Ingreso,
  Inmueble,
  Instrumento,
  OtroActivo,
  Pasivo,
  Persona,
  Sociedad,
  Titularidad,
} from "@/lib/types";
import type { ElementoMenuItem } from "@/lib/eventos-menu";
import { buildContextoFiscalFromBag } from "@/lib/fiscal/contexto";
import { rollupImpuestosEscenario } from "@/lib/fiscal/rollup";

/** Estado mutable del expediente (mockup · session). */
export interface ExpedienteBag {
  cliente: Cliente;
  personas: Persona[];
  instrumentos: Instrumento[];
  inmuebles: Inmueble[];
  sociedades: Sociedad[];
  otrosActivos: OtroActivo[];
  pasivos: Pasivo[];
  ingresos: Ingreso[];
  gastos: Gasto[];
  escenarios: Escenario[];
  eventos: Evento[];
  historial: HistorialInforme[];
}

export type AltaKind =
  | "persona"
  | "instrumento"
  | "inmueble"
  | "sociedad"
  | "otro"
  | "pasivo"
  | "ingreso"
  | "gasto";

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function defaultTitularidades(personas: Persona[]): Titularidad[] {
  if (personas.length === 0) return [];
  if (personas.length === 1) {
    return [
      {
        owner: { kind: "persona", personaId: personas[0].id },
        porcentaje: 1,
      },
    ];
  }
  const pct = 1 / personas.length;
  return personas.map((p) => ({
    owner: { kind: "persona" as const, personaId: p.id },
    porcentaje: pct,
  }));
}

/** Plan base obligatorio en todo expediente editable. */
export function makePlanBase(clienteId: string): Escenario {
  return {
    id: newId("esc-base"),
    clienteId,
    nombre: "Situación actual",
    esPlanBase: true,
    impuestosPeriodo: 0,
    rentabilidadEsperada: 0.04,
    inflacion: 0.02,
    eventoIds: [],
  };
}

export function cloneExpedienteFromSeed(
  clienteId: string,
): ExpedienteBag | null {
  const cliente = getCliente(clienteId);
  if (!cliente) return null;

  const escenarios = getEscenariosDeCliente(clienteId).map((e) => ({
    ...e,
    eventoIds: [...e.eventoIds],
  }));
  const eventos = escenarios.flatMap((e) =>
    getEventosDeEscenario(e.id).map((ev) => ({ ...ev })),
  );

  // Clientes ligeros: sin plan en seed → no inventar escenarios editables
  const bagEscenarios =
    cliente.completo && escenarios.length === 0
      ? [makePlanBase(clienteId)]
      : escenarios;

  return {
    cliente: { ...cliente, composicion: { ...cliente.composicion } },
    personas: getPersonasDeCliente(clienteId).map((p) => ({ ...p })),
    instrumentos: getInstrumentos(clienteId).map((i) => ({
      ...i,
      titularidades: i.titularidades.map((t) => ({
        ...t,
        owner: { ...t.owner },
      })),
    })),
    inmuebles: getInmuebles(clienteId).map((i) => ({
      ...i,
      titularidades: i.titularidades.map((t) => ({
        ...t,
        owner: { ...t.owner },
      })),
    })),
    sociedades: getSociedades(clienteId).map((s) => ({
      ...s,
      participaciones: { ...s.participaciones },
    })),
    otrosActivos: getOtrosActivos(clienteId).map((a) => ({
      ...a,
      titularidades: a.titularidades.map((t) => ({
        ...t,
        owner: { ...t.owner },
      })),
    })),
    pasivos: getPasivos(clienteId).map((p) => ({
      ...p,
      titularidades: p.titularidades.map((t) => ({
        ...t,
        owner: { ...t.owner },
      })),
    })),
    ingresos: getIngresos(clienteId).map((i) => ({ ...i })),
    gastos: getGastos(clienteId).map((g) => ({ ...g })),
    escenarios: bagEscenarios,
    eventos,
    historial: getHistorialDeCliente(clienteId).map((h) => ({ ...h })),
  };
}

export function emptyExpediente(
  cliente: Cliente,
  personas: Persona[],
): ExpedienteBag {
  const plan = makePlanBase(cliente.id);
  return {
    cliente: {
      ...cliente,
      personaIds: personas.map((p) => p.id),
      sociedadIds: [],
      patrimonioNeto: 0,
      composicion: {
        financiero: 0,
        inmobiliario: 0,
        empresarial: 0,
        otros: 0,
      },
      completo: true,
    },
    personas,
    instrumentos: [],
    inmuebles: [],
    sociedades: [],
    otrosActivos: [],
    pasivos: [],
    ingresos: [],
    gastos: [],
    escenarios: [plan],
    eventos: [],
    historial: [],
  };
}

export function totalesFromBag(bag: ExpedienteBag) {
  const financiero = bag.instrumentos.reduce((s, i) => s + i.valor, 0);
  const inmobiliario = bag.inmuebles.reduce((s, i) => s + i.valor, 0);
  const otros = bag.otrosActivos.reduce((s, a) => s + a.valor, 0);
  // Sociedad sin valoración MVP → 0 (hueco F4)
  const empresarial = 0;
  const pasivos = bag.pasivos.reduce((s, p) => s + p.capitalPendiente, 0);
  const bruto = financiero + inmobiliario + empresarial + otros;
  return {
    financiero,
    inmobiliario,
    empresarial,
    otros,
    pasivos,
    bruto,
    neto: bruto - pasivos,
  };
}

export function capacidadFromBag(bag: ExpedienteBag) {
  const ingresos = bag.ingresos.reduce((s, i) => s + i.importeAnual, 0);
  const gastosTotal = bag.gastos.reduce((s, g) => s + g.importeAnual, 0);
  const amort = amortizacionCapitalAnual(bag.pasivos, bag.gastos);
  return {
    ingresos,
    gastos: gastosTotal,
    amortizacionCapital: amort,
    capacidad: ingresos - gastosTotal + amort,
  };
}

export function ingresosPersonaFromBag(bag: ExpedienteBag, personaId: string) {
  return bag.ingresos
    .filter((i) => i.personaId === personaId)
    .reduce((s, i) => s + i.importeAnual, 0);
}

export function titularidadAgregadaFromBag(
  bag: ExpedienteBag,
  personaId: string,
) {
  let total = 0;
  const add = (valor: number, titularidades: Titularidad[]) => {
    const t = titularidades.find(
      (x) => x.owner.kind === "persona" && x.owner.personaId === personaId,
    );
    if (t) total += valor * t.porcentaje;
  };
  bag.instrumentos.forEach((i) => add(i.valor, i.titularidades));
  bag.inmuebles.forEach((i) => add(i.valor, i.titularidades));
  bag.otrosActivos.forEach((a) => add(a.valor, a.titularidades));
  return total;
}

export function planBaseFromBag(bag: ExpedienteBag): Escenario | undefined {
  return (
    bag.escenarios.find((e) => e.esPlanBase) ?? bag.escenarios[0]
  );
}

export function eventosDeEscenarioFromBag(
  bag: ExpedienteBag,
  escenarioId: string,
): Evento[] {
  const esc = bag.escenarios.find((e) => e.id === escenarioId);
  if (!esc) return [];
  return esc.eventoIds
    .map((id) => bag.eventos.find((e) => e.id === id))
    .filter((e): e is Evento => !!e);
}

/** Menú CT1 desde el bag (no desde seed). */
export function elementosMenuFromBag(bag: ExpedienteBag): ElementoMenuItem[] {
  const items: ElementoMenuItem[] = [];
  const clienteId = bag.cliente.id;

  for (const i of bag.instrumentos) {
    let nombre = i.nombre;
    if (i.tipoFiscal === "plan_pensiones") {
      const tit = i.titularidades.find((t) => t.owner.kind === "persona");
      const owner = tit?.owner;
      if (owner?.kind === "persona") {
        const p = bag.personas.find((x) => x.id === owner.personaId);
        if (p) nombre = `${i.nombre} (${p.nombre})`;
      }
    }
    items.push({
      id: i.id,
      nombre,
      contexto: "instrumento",
      hint: "menú de acciones de este elemento",
      tipoFiscal: i.tipoFiscal,
    });
  }
  for (const inm of bag.inmuebles) {
    items.push({
      id: inm.id,
      nombre: inm.nombre,
      contexto: "inmueble",
      hint: "menú de acciones de este elemento",
    });
  }
  for (const p of bag.pasivos) {
    items.push({
      id: p.id,
      nombre:
        p.tipo === "hipoteca"
          ? `Hipoteca ${p.prestamista}`
          : `Crédito ${p.prestamista}`,
      contexto: "pasivo",
      hint: "menú de acciones de este elemento",
    });
  }
  for (const a of bag.otrosActivos) {
    items.push({
      id: a.id,
      nombre: a.nombre,
      contexto: "otro",
      hint: "menú de acciones de este elemento",
    });
  }
  for (const s of bag.sociedades) {
    items.push({
      id: s.id,
      nombre: s.nombre,
      contexto: "sociedad",
      hint: "menú de acciones de este elemento",
    });
  }
  for (const persona of bag.personas) {
    items.push({
      id: persona.id,
      nombre: personaLabel(persona),
      contexto: "persona",
      hint: "menú de acciones de este elemento",
    });
  }
  items.push({
    id: `generico-${clienteId}`,
    nombre: "Evento genérico (ingreso · gasto · movimiento)",
    contexto: "generico",
    hint: "sin cálculo fiscal",
  });
  return items;
}

/**
 * Recalcula patrimonio neto + composición (fracciones 0–1).
 * Clientes ligeros (Cartera): no machacar cifras seed al abrir el expediente.
 */
export function syncClienteTotales(bag: ExpedienteBag): ExpedienteBag {
  const hasEditableAssets =
    bag.instrumentos.length +
      bag.inmuebles.length +
      bag.otrosActivos.length +
      bag.pasivos.length >
    0;

  if (!bag.cliente.completo && !hasEditableAssets) {
    return {
      ...bag,
      cliente: {
        ...bag.cliente,
        personaIds: bag.personas.map((p) => p.id),
        sociedadIds: bag.sociedades.map((s) => s.id),
      },
    };
  }

  const t = totalesFromBag(bag);
  const denom = t.bruto > 0 ? t.bruto : 1;
  return {
    ...bag,
    cliente: {
      ...bag.cliente,
      patrimonioNeto: t.neto,
      composicion: {
        financiero: t.financiero / denom,
        inmobiliario: t.inmobiliario / denom,
        empresarial: t.empresarial / denom,
        otros: t.otros / denom,
      },
      personaIds: bag.personas.map((p) => p.id),
      sociedadIds: bag.sociedades.map((s) => s.id),
      datosAFecha: bag.cliente.datosAFecha,
    },
  };
}

/** Recalcula impuestosPeriodo de cada escenario vía rollup del motor. */
export function recomputeFiscalBag(bag: ExpedienteBag): ExpedienteBag {
  const escenarios = bag.escenarios.map((esc) => {
    const eventos = eventosDeEscenarioFromBag(bag, esc.id);
    const rollup = rollupImpuestosEscenario(eventos, (ev) =>
      buildContextoFiscalFromBag(bag, ev),
    );
    return {
      ...esc,
      impuestosPeriodo: rollup.impuestosPeriodo,
      impuestosParcial: rollup.parcial,
    };
  });
  return { ...bag, escenarios };
}

/** Asegura campos nuevos en bags antiguos de sessionStorage. */
export function normalizeBag(bag: ExpedienteBag): ExpedienteBag {
  const escenarios =
    bag.escenarios?.length > 0
      ? bag.escenarios
      : bag.cliente.completo
        ? [makePlanBase(bag.cliente.id)]
        : [];
  const normalized = syncClienteTotales({
    ...bag,
    escenarios,
    eventos: bag.eventos ?? [],
    historial: bag.historial ?? [],
  });
  return recomputeFiscalBag(normalized);
}

export function seedClienteIds() {
  return seed.clientes.map((c) => c.id);
}
