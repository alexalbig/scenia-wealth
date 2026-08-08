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

/**
 * Porcentajes de titularidad para UI (un decimal).
 * El resto de décimas va al primero para que siempre sumen 100,0.
 */
export function displayTitularidadPercents(
  titularidades: Titularidad[],
): number[] {
  if (titularidades.length === 0) return [];
  const tenths = titularidades.map((t) =>
    Math.round(t.porcentaje * 1000),
  );
  const sum = tenths.reduce((a, b) => a + b, 0);
  const target = 1000;
  if (sum !== target && tenths.length > 0) {
    tenths[0] = tenths[0]! + (target - sum);
  }
  return tenths.map((t) => t / 10);
}

/** Una sola cuota en % con un decimal (p. ej. ficha de persona). */
export function formatPctLabel(porcentaje: number): string {
  const tenths = Math.round(porcentaje * 1000) / 10;
  return `${tenths.toLocaleString("es-ES", {
    minimumFractionDigits: Number.isInteger(tenths) ? 0 : 1,
    maximumFractionDigits: 1,
  })} %`;
}

function formatDisplayPct(tenthsOfPercent: number): string {
  const n = tenthsOfPercent;
  return `${n.toLocaleString("es-ES", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 1,
    maximumFractionDigits: 1,
  })}`;
}

export function formatTitularidades(
  titularidades: Titularidad[],
  personas: Persona[],
): string {
  const pcts = displayTitularidadPercents(titularidades);
  return titularidades
    .map((t, i) => {
      const pct = formatDisplayPct(pcts[i] ?? 0);
      if (t.owner.kind === "persona") {
        const personaId = t.owner.personaId;
        const p = personas.find((x) => x.id === personaId);
        const name = p ? p.nombre : personaId;
        return `${name} ${pct}%`;
      }
      const sociedadId = t.owner.sociedadId;
      const s = seed.sociedades.find((x) => x.id === sociedadId);
      return `${s?.nombre ?? "Sociedad"} ${pct}%`;
    })
    .join(" · ");
}

const TIT_COLORS = ["var(--blue)", "#8FA0BE", "var(--faintest)"];

export function titularidadSegments(
  titularidades: Titularidad[],
): Array<{ pct: number; color: string }> {
  const pcts = displayTitularidadPercents(titularidades);
  return titularidades.map((_, i) => ({
    pct: pcts[i] ?? 0,
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
    case "actividad_economica":
      return "Actividad económica";
    case "otros":
      return "Otros";
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
  const pcts = displayTitularidadPercents(titularidades);
  return titularidades
    .map((t, i) => {
      const pct = formatDisplayPct(pcts[i] ?? 0);
      const owner = t.owner;
      if (owner.kind === "persona") {
        const p = personas.find((x) => x.id === owner.personaId);
        const name = p?.nombre ?? owner.personaId;
        return `${name} ${pct} %`;
      }
      return `Sociedad ${pct} %`;
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

/** Gastos asociados a un elemento vía «Vincular a». */
export function gastosVinculadosA(
  gastos: Gasto[],
  ref:
    | { kind: "inmueble"; inmuebleId: string }
    | { kind: "otro"; otroId: string }
    | { kind: "sociedad"; sociedadId: string },
): Gasto[] {
  return gastos.filter((g) => {
    const v = g.vinculadoA;
    if (!v) return false;
    if (ref.kind === "inmueble" && v.kind === "inmueble") {
      return v.inmuebleId === ref.inmuebleId;
    }
    if (ref.kind === "otro" && v.kind === "otro") {
      return v.otroId === ref.otroId;
    }
    if (ref.kind === "sociedad" && v.kind === "sociedad") {
      return v.sociedadId === ref.sociedadId;
    }
    return false;
  });
}

export function resumenGastosVinculados(
  gastos: Gasto[],
  valorElemento: number | null | undefined,
): {
  total: number;
  lineas: Array<{ categoria: string; importeAnual: number }>;
  pctValor: number | null;
} {
  const lineas = gastos.map((g) => ({
    categoria: g.categoria,
    importeAnual: g.importeAnual,
  }));
  const total = lineas.reduce((s, l) => s + l.importeAnual, 0);
  const pctValor =
    valorElemento != null && valorElemento > 0
      ? (total / valorElemento) * 100
      : null;
  return { total, lineas, pctValor };
}

/** Nivel 1: cuota anual ≈ cuota×12 − interés derivado (capital × tipo). */
export function esGastoInteresDeuda(g: Gasto): boolean {
  const c = g.categoria.toLowerCase();
  return c.includes("interés") || c.includes("interes");
}

/** Interés anual orientativo del pasivo · capital pendiente × tipo. */
export function interesAnualPasivo(p: Pasivo): number {
  if (p.capitalPendiente <= 0 || p.tipoInteres <= 0) return 0;
  return p.capitalPendiente * p.tipoInteres;
}

export function interesesAnualesDerivados(pasivos: Pasivo[]): number {
  return pasivos.reduce((s, p) => s + interesAnualPasivo(p), 0);
}

/**
 * Pasivos candidatos a un evento de amortizar.
 * Por id de pasivo, o hipotecas ligadas a un inmueble. Nunca inventa uno.
 */
export function pasivosParaAmortizar(
  pasivos: Pasivo[],
  elementoId: string | undefined,
): Pasivo[] {
  if (!elementoId) return [];
  const asPasivo = pasivos.find((p) => p.id === elementoId);
  if (asPasivo) return [asPasivo];
  return pasivos.filter((p) => p.inmuebleId === elementoId);
}

export function amortizacionCapitalAnual(pasivos: Pasivo[]): number {
  return pasivos.reduce((sum, p) => {
    if (p.capitalPendiente <= 0) return sum;
    const cuotaAnual = p.cuotaMensual * 12;
    const intereses = interesAnualPasivo(p);
    const amort = Math.max(0, cuotaAnual - intereses);
    return sum + Math.min(p.capitalPendiente, amort);
  }, 0);
}

/**
 * Gastos para capacidad / proyección: líneas no-interés + derivados del capital vivo.
 * El importe tecleado en «Intereses de deuda» no cuenta: manda capital × tipo.
 */
export function gastosAnualesConInteresDerivado(
  pasivos: Pasivo[],
  gastos: Gasto[],
): { gastosBaseSinIntereses: number; interesesDerivados: number; total: number } {
  const gastosBaseSinIntereses = gastos
    .filter((g) => !esGastoInteresDeuda(g))
    .reduce((s, g) => s + g.importeAnual, 0);
  const interesesDerivados = interesesAnualesDerivados(pasivos);
  return {
    gastosBaseSinIntereses,
    interesesDerivados,
    total: gastosBaseSinIntereses + interesesDerivados,
  };
}

/** Importe derivado que corresponde a un gasto de intereses (por inmueble o suma). */
export function interesDerivadoParaGasto(
  g: Gasto,
  pasivos: Pasivo[],
): number | null {
  if (!esGastoInteresDeuda(g)) return null;
  if (g.vinculadoA?.kind === "inmueble") {
    const id = g.vinculadoA.inmuebleId;
    return pasivos
      .filter((p) => p.inmuebleId === id)
      .reduce((s, p) => s + interesAnualPasivo(p), 0);
  }
  // Sin vínculo a inmueble: intereses de pasivos sin inmueble.
  return pasivos
    .filter((p) => !p.inmuebleId)
    .reduce((s, p) => s + interesAnualPasivo(p), 0);
}

export function capacidadAhorro(clienteId: string) {
  const ingresos = getIngresos(clienteId).reduce((s, i) => s + i.importeAnual, 0);
  const pasivos = getPasivos(clienteId);
  const gastos = getGastos(clienteId);
  const { total: gastosTotal } = gastosAnualesConInteresDerivado(pasivos, gastos);
  const amort = amortizacionCapitalAnual(pasivos);
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
      pctLabel: formatPctLabel(pct),
      valor: i.valor * pct,
    });
  }
  for (const inm of getInmuebles(clienteId)) {
    const pct = pctOf(inm.titularidades);
    if (pct <= 0) continue;
    rows.push({
      id: inm.id,
      nombre: inm.nombre,
      pctLabel: formatPctLabel(pct),
      valor: inm.valor * pct,
    });
  }
  for (const a of getOtrosActivos(clienteId)) {
    const pct = pctOf(a.titularidades);
    if (pct <= 0) continue;
    rows.push({
      id: a.id,
      nombre: a.nombre,
      pctLabel: formatPctLabel(pct),
      valor: a.valor * pct,
    });
  }
  for (const s of getSociedades(clienteId)) {
    const pct = s.participaciones[personaId] ?? 0;
    if (pct <= 0) continue;
    rows.push({
      id: s.id,
      nombre: s.nombre,
      pctLabel: formatPctLabel(pct),
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
