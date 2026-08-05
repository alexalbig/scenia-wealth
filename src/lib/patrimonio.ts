import { seed } from "./seed";
import { ageFromBirthYear, formatEUR } from "./format";
import type {
  Cliente,
  Gasto,
  Ingreso,
  Inmueble,
  Instrumento,
  OtroActivo,
  Pasivo,
  Persona,
  Sociedad,
  Titularidad,
} from "./types";

export function getInstrumentos(clienteId: string) {
  return seed.instrumentos.filter((i) => i.clienteId === clienteId);
}

export function getInmuebles(clienteId: string) {
  return seed.inmuebles.filter((i) => i.clienteId === clienteId);
}

export function getOtrosActivos(clienteId: string) {
  return seed.otrosActivos.filter((a) => a.clienteId === clienteId);
}

export function getPasivos(clienteId: string) {
  return seed.pasivos.filter((p) => p.clienteId === clienteId);
}

export function getIngresos(clienteId: string) {
  return seed.ingresos.filter((i) => i.clienteId === clienteId);
}

export function getGastos(clienteId: string) {
  return seed.gastos.filter((g) => g.clienteId === clienteId);
}

export function getSociedades(clienteId: string) {
  return seed.sociedades.filter((s) => s.clienteId === clienteId);
}

export function personaLabel(persona: Persona) {
  return `${persona.nombre} ${persona.apellidos}`.trim();
}

export function formatTitularidades(
  titularidades: Titularidad[],
  personas: Persona[],
): string {
  return titularidades
    .map((t) => {
      if (t.owner.kind === "persona") {
        const personaId = t.owner.personaId;
        const p = personas.find((x) => x.id === personaId);
        const name = p ? p.nombre : personaId;
        return `${name} ${Math.round(t.porcentaje * 100)}%`;
      }
      const sociedadId = t.owner.sociedadId;
      const s = seed.sociedades.find((x) => x.id === sociedadId);
      return `${s?.nombre ?? "Sociedad"} ${Math.round(t.porcentaje * 100)}%`;
    })
    .join(" · ");
}

const TIT_COLORS = ["var(--blue)", "#8FA0BE", "var(--faintest)"];

export function titularidadSegments(
  titularidades: Titularidad[],
): Array<{ pct: number; color: string }> {
  return titularidades.map((t, i) => ({
    pct: Math.round(t.porcentaje * 100),
    color: TIT_COLORS[i % TIT_COLORS.length],
  }));
}

export function tipoFiscalMockup(tipo: Instrumento["tipoFiscal"]) {
  switch (tipo) {
    case "fondo":
      return "Fondo traspasable";
    case "plan_pensiones":
      return "Plan de pensiones";
    case "accion":
      return "Acción";
    default:
      return "Otro";
  }
}

export function liquidezInstrumento(
  tipo: Instrumento["tipoFiscal"],
): "a" | "b" {
  return tipo === "fondo" || tipo === "accion" ? "a" : "b";
}

export function tipoFiscalLabel(tipo: Instrumento["tipoFiscal"]) {
  switch (tipo) {
    case "fondo":
      return "Fondo";
    case "plan_pensiones":
      return "Plan de pensiones";
    case "accion":
      return "Acción";
    default:
      return "Otro";
  }
}

export function tipoOtroLabel(tipo: OtroActivo["tipo"]) {
  switch (tipo) {
    case "vehiculo":
      return "Vehículo";
    case "arte":
      return "Arte";
    case "joyas":
      return "Joyas";
    case "efectivo":
      return "Efectivo / liquidez";
    case "mobiliario":
      return "Mobiliario y enseres";
    case "cripto":
      return "Criptomonedas";
    case "coleccion":
      return "Colección";
    default:
      return "Otro";
  }
}

export function fuenteIngresoLabel(fuente: Ingreso["fuente"]) {
  switch (fuente) {
    case "trabajo":
      return "Trabajo";
    case "alquiler":
      return "Alquiler";
    case "dividendo":
      return "Dividendo";
    case "pension":
      return "Pensión";
    default:
      return "Otros";
  }
}

/** Año (YYYY) desde ISO — fichas mockup. */
export function yearFromIso(iso: string) {
  return iso.slice(0, 4);
}

/** Texto corto de titularidad tipo mockup `titTxt` · «Carlos 60 % · Marta 40 %». */
export function titTxtCorto(
  titularidades: Titularidad[],
  personas: Persona[],
): string {
  return titularidades
    .map((t) => {
      const owner = t.owner;
      if (owner.kind === "persona") {
        const p = personas.find((x) => x.id === owner.personaId);
        const name = p?.nombre ?? owner.personaId;
        return `${name} ${Math.round(t.porcentaje * 100)} %`;
      }
      return `Sociedad ${Math.round(t.porcentaje * 100)} %`;
    })
    .join(" · ");
}

export function formatFechaES(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

/** Mockup `fmtFecha` · dd/mm/aaaa — sin toLocaleDateString (evita hydration mismatch). */
export function formatFechaDMY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

/** Nivel 1: cuota anual ≈ cuota×12 − intereses (orientativo). */
export function amortizacionCapitalAnual(pasivos: Pasivo[], gastos: Gasto[]) {
  // Intereses: asignamos por inmueble cuando hay vinculación;
  // y si no hay inmueble vinculado (crédito personal / hipoteca sin inmueble),
  // repartimos los intereses no asignados entre los pasivos sin inmueble.
  const interesesPorInmueble = new Map<string, number>();
  let interesesNoAsignados = 0;

  for (const g of gastos) {
    const esInteres =
      g.categoria.toLowerCase().includes("interés") ||
      g.categoria.toLowerCase().includes("interes");
    if (!esInteres) continue;

    if (g.vinculadoA?.kind === "inmueble") {
      const id = g.vinculadoA.inmuebleId;
      interesesPorInmueble.set(
        id,
        (interesesPorInmueble.get(id) ?? 0) + g.importeAnual,
      );
    } else {
      interesesNoAsignados += g.importeAnual;
    }
  }

  const pasivosSinInmueble = pasivos.filter(
    (p) => !(p.tipo === "hipoteca" && p.inmuebleId),
  );
  const interesesSinInmueblePorPasivo =
    pasivosSinInmueble.length > 0
      ? interesesNoAsignados / pasivosSinInmueble.length
      : 0;

  return pasivos.reduce((sum, p) => {
    const cuotaAnual = p.cuotaMensual * 12;
    const intereses =
      p.tipo === "hipoteca" && p.inmuebleId
        ? interesesPorInmueble.get(p.inmuebleId) ?? 0
        : interesesSinInmueblePorPasivo;
    return sum + Math.max(0, cuotaAnual - intereses);
  }, 0);
}

export function capacidadAhorro(clienteId: string) {
  const ingresos = getIngresos(clienteId).reduce((s, i) => s + i.importeAnual, 0);
  const gastos = getGastos(clienteId);
  const gastosTotal = gastos.reduce((s, g) => s + g.importeAnual, 0);
  const amort = amortizacionCapitalAnual(getPasivos(clienteId), gastos);
  return {
    ingresos,
    gastos: gastosTotal,
    amortizacionCapital: amort,
    capacidad: ingresos - gastosTotal + amort,
  };
}

export function totalesActivos(clienteId: string) {
  const financiero = getInstrumentos(clienteId).reduce((s, i) => s + i.valor, 0);
  const inmobiliario = getInmuebles(clienteId).reduce((s, i) => s + i.valor, 0);
  const otros = getOtrosActivos(clienteId).reduce((s, a) => s + a.valor, 0);
  const sociedades = getSociedades(clienteId);
  const valoradas = sociedades.filter(
    (s) => s.valor != null && Number.isFinite(s.valor),
  );
  const empresarial = valoradas.reduce((s, soc) => s + (soc.valor ?? 0), 0);
  const empresarialSinValorar =
    sociedades.length > 0 && valoradas.length === 0;
  const pasivos = getPasivos(clienteId).reduce((s, p) => s + p.capitalPendiente, 0);
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

export function ingresosPorPersona(clienteId: string, personaId: string) {
  return getIngresos(clienteId)
    .filter((i) => i.personaId === personaId)
    .reduce((s, i) => s + i.importeAnual, 0);
}

/** Valor de activos atribuible a una persona por % de titularidad. */
export function titularidadAgregada(
  clienteId: string,
  personaId: string,
): number {
  let total = 0;
  const add = (valor: number, titularidades: Titularidad[]) => {
    const t = titularidades.find(
      (x) => x.owner.kind === "persona" && x.owner.personaId === personaId,
    );
    if (t) total += valor * t.porcentaje;
  };
  getInstrumentos(clienteId).forEach((i) => add(i.valor, i.titularidades));
  getInmuebles(clienteId).forEach((i) => add(i.valor, i.titularidades));
  getOtrosActivos(clienteId).forEach((a) => add(a.valor, a.titularidades));
  return total;
}

/** Filas de patrimonio atribuido a una persona (tabla F1). */
export function patrimonioAtribuidoFilas(
  clienteId: string,
  personaId: string,
): Array<{
  id: string;
  nombre: string;
  pctLabel: string;
  valor: number | null;
}> {
  const rows: Array<{
    id: string;
    nombre: string;
    pctLabel: string;
    valor: number | null;
  }> = [];

  const pctOf = (titularidades: Titularidad[]) => {
    const t = titularidades.find(
      (x) => x.owner.kind === "persona" && x.owner.personaId === personaId,
    );
    return t?.porcentaje ?? 0;
  };

  for (const i of getInstrumentos(clienteId)) {
    const pct = pctOf(i.titularidades);
    if (pct <= 0) continue;
    rows.push({
      id: i.id,
      nombre: i.nombre,
      pctLabel: `${Math.round(pct * 100)} %`,
      valor: i.valor * pct,
    });
  }
  for (const inm of getInmuebles(clienteId)) {
    const pct = pctOf(inm.titularidades);
    if (pct <= 0) continue;
    rows.push({
      id: inm.id,
      nombre: inm.nombre,
      pctLabel: `${Math.round(pct * 100)} %`,
      valor: inm.valor * pct,
    });
  }
  for (const a of getOtrosActivos(clienteId)) {
    const pct = pctOf(a.titularidades);
    if (pct <= 0) continue;
    rows.push({
      id: a.id,
      nombre: a.nombre,
      pctLabel: `${Math.round(pct * 100)} %`,
      valor: a.valor * pct,
    });
  }
  for (const s of getSociedades(clienteId)) {
    const pct = s.participaciones[personaId] ?? 0;
    if (pct <= 0) continue;
    rows.push({
      id: s.id,
      nombre: s.nombre,
      pctLabel: `${Math.round(pct * 100)} %`,
      valor: null, // F4 sin valoración
    });
  }
  return rows;
}

export function labelVinculo(
  gasto: Gasto,
  personas: Persona[],
  inmuebles: Inmueble[],
  sociedades: Sociedad[],
  otros: OtroActivo[] = [],
): string {
  const v = gasto.vinculadoA;
  if (!v) return "Sin vincular";
  if (v.kind === "persona") {
    const p = personas.find((x) => x.id === v.personaId);
    return p ? personaLabel(p) : "Persona";
  }
  if (v.kind === "inmueble") {
    const i = inmuebles.find((x) => x.id === v.inmuebleId);
    return i?.nombre ?? "Inmueble";
  }
  if (v.kind === "sociedad") {
    const s = sociedades.find((x) => x.id === v.sociedadId);
    return s?.nombre ?? "Sociedad";
  }
  if (v.kind === "otro") {
    const a = otros.find((x) => x.id === v.otroId);
    return a?.nombre ?? "Otro activo";
  }
  return "Sin vincular";
}

export function contextoCliente(cliente: Cliente, personas: Persona[]) {
  const edades = personas
    .map((p) => ageFromBirthYear(p.birthYear))
    .sort((a, b) => b - a);
  const edadLabel =
    edades.length === 0
      ? "—"
      : edades.length === 1
        ? `${edades[0]} años`
        : `${edades.join(" / ")} años`;
  return {
    nombre: cliente.nombre,
    edadLabel,
    ccaa: cliente.ccaa,
    segmento: cliente.segmento,
    patrimonioLabel: formatEUR(cliente.patrimonioNeto),
  };
}
