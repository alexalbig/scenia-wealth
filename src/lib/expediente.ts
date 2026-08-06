import {
  amortizacionCapitalAnual,
  gastosAnualesConInteresDerivado,
  getGastos,
  getIngresos,
  getInmuebles,
  getInstrumentos,
  getOtrosActivos,
  getPasivos,
  getSociedades,
  interesDerivadoParaGasto,
  esGastoInteresDeuda,
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
import { desgloseBaseLiquidable } from "@/lib/fiscal/base-liquidable";
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
  /**
   * Clientes del seed: si no coincide con `SEED_BAG_REVISION`,
   * `resolveExpediente` descarta el localStorage y reclona.
   */
  seedRevision?: number;
}

/**
 * Subir cuando el seed de un cliente demo cambia de forma incompatible
 * con bags cacheados (ingresos, personas, gastos…).
 */
export const SEED_BAG_REVISION = 5;

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

/**
 * Reparto por defecto al dar de alta: 100 % al primer titular.
 * El asesor reparte si quiere — no presupone cotitularidad ni renta.
 */
export function defaultTitularidades(personas: Persona[]): Titularidad[] {
  if (personas.length === 0) return [];
  return [
    {
      owner: { kind: "persona", personaId: personas[0]!.id },
      porcentaje: 1,
    },
  ];
}

/**
 * Reparte `total` (normalmente 1) a partes iguales entre `n` titulares.
 * El resto decimal va al primero para que la suma sea exacta.
 */
export function equalTitularidadShares(n: number, total = 1): number[] {
  if (n <= 0) return [];
  if (n === 1) return [total];
  const base = Math.floor((total * 1000) / n) / 1000;
  const shares = Array.from({ length: n }, () => base);
  const assigned = base * n;
  shares[0] = Math.round((total - assigned + base) * 1000) / 1000;
  return shares;
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

  // Sin escenarios en seed → plan base vacío (expediente editable).
  const bagEscenarios =
    escenarios.length === 0 ? [makePlanBase(clienteId)] : escenarios;

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
  const sociedadesValoradas = bag.sociedades.filter(
    (s) => s.valor != null && Number.isFinite(s.valor),
  );
  const empresarial = sociedadesValoradas.reduce(
    (s, soc) => s + (soc.valor ?? 0),
    0,
  );
  const empresarialSinValorar =
    bag.sociedades.length > 0 && sociedadesValoradas.length === 0;
  const pasivos = bag.pasivos.reduce((s, p) => s + p.capitalPendiente, 0);
  const bruto = financiero + inmobiliario + empresarial + otros;
  return {
    financiero,
    inmobiliario,
    empresarial,
    empresarialSinValorar,
    otros,
    pasivos,
    bruto,
    neto: bruto - pasivos,
  };
}

/** Eventos que referencian un elemento (cascada al borrar). */
export function eventosQueReferencian(
  bag: ExpedienteBag,
  targetId: string,
): Array<{ evento: Evento; escenarioNombre: string }> {
  return bag.eventos
    .filter((e) => e.targetId === targetId)
    .map((e) => ({
      evento: e,
      escenarioNombre:
        bag.escenarios.find((s) => s.id === e.escenarioId)?.nombre ??
        "escenario",
    }));
}

export function mensajeConfirmacionCascada(
  nombreElemento: string,
  refs: Array<{ evento: Evento; escenarioNombre: string }>,
): string {
  if (refs.length === 0) {
    return `¿Eliminar «${nombreElemento}»?`;
  }
  const porEsc = new Map<string, number>();
  for (const r of refs) {
    porEsc.set(r.escenarioNombre, (porEsc.get(r.escenarioNombre) ?? 0) + 1);
  }
  const detalle = [...porEsc.entries()]
    .map(([nombre, n]) => `${n} en «${nombre}»`)
    .join(", ");
  return `«${nombreElemento}» tiene ${refs.length} evento${refs.length === 1 ? "" : "s"} asociado${refs.length === 1 ? "" : "s"} (${detalle}). Se eliminarán junto con el elemento. ¿Continuar?`;
}

export function capacidadFromBag(bag: ExpedienteBag) {
  const ingresos = bag.ingresos.reduce((s, i) => s + i.importeAnual, 0);
  const { total: gastosTotal } = gastosAnualesConInteresDerivado(
    bag.pasivos,
    bag.gastos,
  );
  const amort = amortizacionCapitalAnual(bag.pasivos);
  return {
    ingresos,
    gastos: gastosTotal,
    amortizacionCapital: amort,
    capacidad: ingresos - gastosTotal + amort,
  };
}

/**
 * Sincroniza importes de gastos de interés marcados como derivados del pasivo.
 * No toca los `introducido_asesor`.
 */
export function syncInteresesDerivadosBag(bag: ExpedienteBag): ExpedienteBag {
  let changed = false;
  const gastos = bag.gastos.map((g) => {
    if (!esGastoInteresDeuda(g)) return g;
    const derivado = interesDerivadoParaGasto(g, bag.pasivos);
    if (derivado == null) return g;
    const next = Math.round(derivado * 100) / 100;
    // El importe es siempre derivado (capital × tipo). Un tecleo previo
    // «introducido_asesor» se normaliza: no hay dos verdades.
    if (
      g.origenInteres === "derivado_pasivo" &&
      Math.abs(g.importeAnual - next) < 0.005
    ) {
      return g;
    }
    changed = true;
    return {
      ...g,
      importeAnual: next,
      origenInteres: "derivado_pasivo",
    };
  });
  return changed ? { ...bag, gastos } : bag;
}

export function ingresosPersonaFromBag(bag: ExpedienteBag, personaId: string) {
  return bag.ingresos
    .filter((i) => i.personaId === personaId)
    .reduce((s, i) => s + i.importeAnual, 0);
}

/** Base liquidable (arts. 19/20) usada por P4 / motor — no el bruto. */
export function baseLiquidablePersonaFromBag(
  bag: ExpedienteBag,
  personaId: string,
) {
  const lineas = bag.ingresos.filter((i) => i.personaId === personaId);
  let trabajo = 0;
  let pension = 0;
  let otras = 0;
  let cotiz: number | null = null;
  const fuentesNoContempladas: import("@/lib/types").FuenteIngreso[] = [];
  for (const i of lineas) {
    if (i.fuente === "actividad_economica") {
      if (!fuentesNoContempladas.includes(i.fuente)) {
        fuentesNoContempladas.push(i.fuente);
      }
      continue;
    }
    if (i.fuente === "trabajo") {
      trabajo += i.importeAnual;
      if (i.cotizacionesSS != null && Number.isFinite(i.cotizacionesSS)) {
        cotiz = (cotiz ?? 0) + i.cotizacionesSS;
      }
    } else if (i.fuente === "pension") {
      pension += i.importeAnual;
    } else {
      otras += i.importeAnual;
    }
  }
  return desgloseBaseLiquidable({
    trabajoBruto: trabajo,
    pensionBruta: pension,
    otrasRentasBrutas: otras,
    cotizacionesSS: cotiz,
    fuentesNoContempladas,
  });
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

/** Jubilación de una persona en un escenario (como máximo una tras dedupe). */
export function jubilacionDePersonaEnEscenario(
  bag: ExpedienteBag,
  escenarioId: string,
  personaId: string,
): Evento | undefined {
  return eventosDeEscenarioFromBag(bag, escenarioId).find(
    (e) => e.tipo === "jubilarse" && e.targetId === personaId,
  );
}

const SEED_EVENT_IDS = new Set(seed.eventos.map((e) => e.id));

function isSeedEventId(id: string): boolean {
  return SEED_EVENT_IDS.has(id);
}

/** Timestamp embebido en ids de sesión (`evt-1712345678901-abc`). */
function eventRecency(id: string): number {
  const m = id.match(/^evt-(\d{10,})-/);
  return m ? Number(m[1]) : 0;
}

/**
 * Una sola jubilación por persona+escenario.
 * Conserva el del seed si existe; si no, el más reciente (id de sesión).
 */
export function dedupeJubilacionesBag(bag: ExpedienteBag): ExpedienteBag {
  const keep = new Set<string>();
  const drop = new Set<string>();

  const byKey = new Map<string, Evento[]>();
  for (const ev of bag.eventos) {
    if (ev.tipo !== "jubilarse" || !ev.targetId) {
      keep.add(ev.id);
      continue;
    }
    const key = `${ev.escenarioId}::${ev.targetId}`;
    const list = byKey.get(key) ?? [];
    list.push(ev);
    byKey.set(key, list);
  }

  for (const list of byKey.values()) {
    if (list.length === 1) {
      keep.add(list[0]!.id);
      continue;
    }
    const fromSeed = list.find((e) => isSeedEventId(e.id));
    const winner = fromSeed
      ? fromSeed
      : [...list].sort((a, b) => eventRecency(b.id) - eventRecency(a.id))[0]!;
    keep.add(winner.id);
    for (const e of list) {
      if (e.id !== winner.id) drop.add(e.id);
    }
  }

  if (drop.size === 0) return bag;

  return {
    ...bag,
    eventos: bag.eventos.filter((e) => !drop.has(e.id)),
    escenarios: bag.escenarios.map((esc) => ({
      ...esc,
      eventoIds: esc.eventoIds.filter((id) => !drop.has(id)),
    })),
  };
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
 * Recalcula patrimonio neto + composición (fracciones 0–1) desde los elementos.
 */
export function syncClienteTotales(bag: ExpedienteBag): ExpedienteBag {
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

/** Recalcula impuestosPeriodo de cada escenario vía rollup del motor (primer ejercicio, siempre fresco). */
export function recomputeFiscalBag(bag: ExpedienteBag): ExpedienteBag {
  const base = syncInteresesDerivadosBag(bag);
  const cuotaByEvento = new Map<string, number | undefined>();
  const sobreByEvento = new Map<string, string | undefined>();
  const escenarios = base.escenarios.map((esc) => {
    const eventos = eventosDeEscenarioFromBag(base, esc.id);
    const rollup = rollupImpuestosEscenario(eventos, (ev) =>
      buildContextoFiscalFromBag(base, ev, undefined, eventos),
    );
    for (const d of rollup.desglose) {
      if (d.kind === "calculado" || d.kind === "neutro") {
        cuotaByEvento.set(d.eventoId, d.cuotaAnual);
        sobreByEvento.set(d.eventoId, d.sobreDatoIntroducido);
      } else if (!cuotaByEvento.has(d.eventoId)) {
        cuotaByEvento.set(d.eventoId, undefined);
        sobreByEvento.set(d.eventoId, undefined);
      }
    }
    return {
      ...esc,
      impuestosPeriodo: rollup.impuestosPeriodo,
      impuestosParcial: rollup.parcial,
      impuestosMotivosParcial:
        rollup.motivosParcial.length > 0
          ? rollup.motivosParcial
          : undefined,
      impuestosSobreDatoIntroducido: rollup.sobreDatoIntroducido,
    };
  });

  const eventos = base.eventos.map((ev) => {
    if (ev.introducidoPorAsesor) return ev;
    if (!cuotaByEvento.has(ev.id)) return ev;
    const cuota = cuotaByEvento.get(ev.id);
    const sobre = sobreByEvento.get(ev.id);
    if (cuota == null) {
      const { cuotaAnual: _c, impuestosPeriodo: _i, sobreDatoIntroducido: _s, ...rest } = ev;
      void _c;
      void _i;
      void _s;
      return rest;
    }
    return {
      ...ev,
      cuotaAnual: cuota,
      impuestosPeriodo: cuota,
      sobreDatoIntroducido: sobre,
    };
  });

  return { ...base, escenarios, eventos };
}

/** Asegura campos nuevos en bags antiguos guardados en storage. */
export function normalizeBag(bag: ExpedienteBag): ExpedienteBag {
  const escenarios =
    bag.escenarios?.length > 0
      ? bag.escenarios
      : [makePlanBase(bag.cliente.id)];
  const deduped = dedupeJubilacionesBag({
    ...bag,
    escenarios,
    eventos: bag.eventos ?? [],
    historial: bag.historial ?? [],
  });
  const syncedIntereses = syncInteresesDerivadosBag(deduped);
  const normalized = syncClienteTotales(syncedIntereses);
  return recomputeFiscalBag(normalized);
}

export function seedClienteIds() {
  return seed.clientes.map((c) => c.id);
}
