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
        return `${name} ${Math.round(t.porcentaje * 100)} %`;
      }
      const sociedadId = t.owner.sociedadId;
      const s = seed.sociedades.find((x) => x.id === sociedadId);
      return `${s?.nombre ?? "Sociedad"} ${Math.round(t.porcentaje * 100)} %`;
    })
    .join(" / ");
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
    case "efectivo":
      return "Efectivo";
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

export function formatFechaES(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

/** Nivel 1: cuota anual ≈ cuota×12 − intereses (orientativo). */
export function amortizacionCapitalAnual(pasivos: Pasivo[], gastos: Gasto[]) {
  const intereses = gastos
    .filter((g) => g.categoria.toLowerCase().includes("interés") || g.categoria.toLowerCase().includes("interes"))
    .reduce((s, g) => s + g.importeAnual, 0);
  const cuotasAnuales = pasivos.reduce((s, p) => s + p.cuotaMensual * 12, 0);
  return Math.max(0, cuotasAnuales - intereses);
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
  // Sociedad sin valoración en seed → 0 (hueco F4)
  const empresarial = 0;
  const pasivos = getPasivos(clienteId).reduce((s, p) => s + p.capitalPendiente, 0);
  const bruto = financiero + inmobiliario + empresarial + otros;
  return { financiero, inmobiliario, empresarial, otros, pasivos, bruto, neto: bruto - pasivos };
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

export function labelVinculo(
  gasto: Gasto,
  personas: Persona[],
  inmuebles: Inmueble[],
  sociedades: Sociedad[],
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
