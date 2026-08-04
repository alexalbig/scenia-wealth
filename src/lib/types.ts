/** Modelo de datos — ANEXO B (Scenia Wealth) */

/** 17 comunidades autónomas (nombres oficiales en español). */
export const CCAAS = [
  "Andalucía",
  "Aragón",
  "Principado de Asturias",
  "Illes Balears",
  "Canarias",
  "Cantabria",
  "Castilla y León",
  "Castilla-La Mancha",
  "Cataluña",
  "Comunidad de Madrid",
  "Comunidad Foral de Navarra",
  "Comunitat Valenciana",
  "Extremadura",
  "Galicia",
  "La Rioja",
  "País Vasco",
  "Región de Murcia",
] as const;

export type CCAA = (typeof CCAAS)[number];

/** Única CCAA con cobertura de base general (rescate). */
export const CCAA_CON_COBERTURA_FISCAL: CCAA = "Comunitat Valenciana";

/** Regímenes forales: sin cobertura de general ni del ahorro. */
export const CCAAS_FORALES: readonly CCAA[] = [
  "País Vasco",
  "Comunidad Foral de Navarra",
] as const;

export function esRegimenForal(ccaa: string): boolean {
  return (CCAAS_FORALES as readonly string[]).includes(ccaa);
}

/** Entrada de timeline P7 — informe emitido. */
export interface HistorialInforme {
  id: string;
  clienteId: string;
  /** ISO YYYY-MM-DD */
  fecha: string;
  titulo: string;
  /** p. ej. «Foto del patrimonio» · «Comparación de escenarios» */
  tipo: string;
}

export type Segmento =
  | "Empresario"
  | "Pre-jubilado"
  | "Jubilado"
  | "Alto ingreso"
  | "Herencia en curso";

export type TipoFiscalInstrumento =
  | "fondo"
  | "plan_pensiones"
  | "accion"
  | "otro";

export type TipoOtroActivo =
  | "vehiculo"
  | "arte"
  | "joyas"
  | "efectivo"
  | "mobiliario"
  | "cripto"
  | "coleccion"
  | "otro";

export type TipoPasivo = "hipoteca" | "credito";

export type FuenteIngreso =
  | "trabajo"
  | "alquiler"
  | "dividendo"
  | "pension"
  | "actividad_economica"
  | "otros";

export type TipoEvento =
  | "reembolsar_fondo"
  | "traspasar_fondo"
  | "pignorar"
  | "aportar_fondo"
  | "rescatar_plan"
  | "amortizar_hipoteca"
  | "vender_inmueble"
  | "comprar_inmueble"
  | "jubilarse"
  | "repartir_dividendo"
  | "vender_participacion"
  | "aportar_plan"
  | "generico";

export type OwnerRef =
  | { kind: "persona"; personaId: string }
  | { kind: "sociedad"; sociedadId: string };

/** Dueño abstracto del expediente. Invisible en MVP. */
export interface Cuenta {
  id: string;
  nombre: string;
}

/** Identidad única en todo el sistema. */
export interface Persona {
  id: string;
  nombre: string;
  apellidos: string;
  birthYear: number;
  ccaa: CCAA;
}

/** Persona jurídica dentro de un Cliente. */
export interface Sociedad {
  id: string;
  clienteId: string;
  nombre: string;
  nif: string;
  capitalSocial: number;
  fechaConstitucion: string;
  situacion: string;
  objetoSocial: string;
  /** Participación por personaId → % (0–1) */
  participaciones: Record<string, number>;
  /**
   * Valor de la participación en el patrimonio del cliente.
   * Si falta → "no valorada" (nunca se muestra 0 € como cifra).
   */
  valor?: number;
}

export interface Titularidad {
  owner: OwnerRef;
  /** Fracción 0–1 */
  porcentaje: number;
}

export interface Instrumento {
  id: string;
  clienteId: string;
  nombre: string;
  tipoFiscal: TipoFiscalInstrumento;
  valor: number;
  fechaAdquisicion: string; // YYYY-MM-DD
  /** Coste de adquisición (FIFO / plusvalía) */
  costeAdquisicion?: number;
  /** Plusvalía latente (hecho objetivo — único uso del verde) */
  plusvaliaLatente?: number;
  /**
   * Fracción 0–1 de derechos por aportaciones ≤ 31/12/2006 (DT 12ª).
   * Solo planes de pensiones · introducido por el asesor · no calculado.
   */
  fraccionPre2007?: number;
  titularidades: Titularidad[];
  /** Si cuelga de una sociedad */
  sociedadId?: string;
}

export interface Inmueble {
  id: string;
  clienteId: string;
  nombre: string;
  valor: number;
  fechaAdquisicion: string;
  costeAdquisicion?: number;
  plusvaliaLatente?: number;
  /**
   * Uso del inmueble — distingue art. 33.4.b) (vivienda habitual >65)
   * de art. 38.3 (reinversión en renta vitalicia).
   */
  uso?: UsoInmueble;
  titularidades: Titularidad[];
  pasivoId?: string;
  sociedadId?: string;
}

/** Uso fiscal del inmueble. */
export type UsoInmueble =
  | "vivienda_habitual"
  | "segunda_residencia"
  | "alquiler"
  | "local";

export interface OtroActivo {
  id: string;
  clienteId: string;
  nombre: string;
  tipo: TipoOtroActivo;
  valor: number;
  fechaAdquisicion?: string;
  titularidades: Titularidad[];
}

export interface Pasivo {
  id: string;
  clienteId: string;
  tipo: TipoPasivo;
  prestamista: string;
  capitalPendiente: number;
  tipoInteres: number; // decimal, ej. 0.025
  cuotaMensual: number;
  inmuebleId?: string;
  titularidades: Titularidad[];
}

export interface Ingreso {
  id: string;
  clienteId: string;
  personaId: string;
  fuente: FuenteIngreso;
  importeAnual: number;
  descripcion?: string;
  /**
   * Cotizaciones a la Seguridad Social del año (art. 19.2.a LIRPF).
   * Solo si las informa el asesor — el motor no las estima.
   */
  cotizacionesSS?: number;
}

export interface Gasto {
  id: string;
  clienteId: string;
  categoria: string;
  importeAnual: number;
  vinculadoA?:
    | OwnerRef
    | { kind: "inmueble"; inmuebleId: string }
    | { kind: "otro"; otroId: string }
    | null;
}

export interface Evento {
  id: string;
  escenarioId: string;
  tipo: TipoEvento;
  anio: number;
  /** Fin del rango anual (inclusive); si falta, = anio */
  hastaAnio?: number;
  etiqueta: string;
  /** Elemento sobre el que actúa */
  targetId?: string;
  /**
   * Cuota del primer ejercicio (orientativa · motor).
   * El impacto agregado del escenario vive en Escenario.impuestosPeriodo (rollup).
   */
  cuotaAnual?: number;
  /**
   * @deprecated Preferir cuotaAnual. Alias legacy en bags antiguos.
   */
  impuestosPeriodo?: number;
  /** Si el asesor tecleó el impacto a mano */
  introducidoPorAsesor?: boolean;
  /**
   * Cuota del motor calculada sobre un dato introducido por el asesor
   * (p. ej. «pensión estimada por el asesor»). Cálculo real · base estimada.
   */
  sobreDatoIntroducido?: string;
  /**
   * Año de la contingencia (jubilación, invalidez…) · DT 12ª plazos.
   * Obligatorio para valorar la reducción 40 % en rescate capital.
   */
  anioContingencia?: number;
  notas?: string;
}

export interface Escenario {
  id: string;
  clienteId: string;
  nombre: string;
  /** El plan base ("Situación actual") */
  esPlanBase: boolean;
  /**
   * Impacto fiscal · primer ejercicio — rollup de eventos (motor fresco).
   * No es acumulación multi-año.
   */
  impuestosPeriodo?: number;
  /** Hay eventos sin liquidador excluidos del total */
  impuestosParcial?: boolean;
  /** Motivos del cálculo parcial (titular + causa). */
  impuestosMotivosParcial?: string[];
  /**
   * Alguna cuota del rollup usa base con dato introducido (pensión estimada).
   * No implica parcial.
   */
  impuestosSobreDatoIntroducido?: boolean;
  rentabilidadEsperada?: number;
  inflacion?: number;
  eventoIds: string[];
}

/** Composición para la mini-barra de P1 (fracciones 0–1 que suman ~1). */
export interface ComposicionPatrimonio {
  financiero: number;
  inmobiliario: number;
  empresarial: number;
  otros: number;
}

export interface Cliente {
  id: string;
  cuentaId: string;
  /** Alias del expediente */
  nombre: string;
  segmento: Segmento;
  ccaa: CCAA;
  personaIds: string[];
  sociedadIds: string[];
  /** Patrimonio NETO (activos − pasivos) */
  patrimonioNeto: number;
  composicion: ComposicionPatrimonio;
  /** Meses desde la última revisión (relativo a hoy) */
  ultimaRevisionMeses: number;
  /** true = datos completos (García-Llorente); false = ligero para Cartera */
  completo: boolean;
  datosAFecha: string; // YYYY-MM-DD
}

export interface SeedData {
  cuenta: Cuenta;
  personas: Persona[];
  clientes: Cliente[];
  sociedades: Sociedad[];
  instrumentos: Instrumento[];
  inmuebles: Inmueble[];
  otrosActivos: OtroActivo[];
  pasivos: Pasivo[];
  ingresos: Ingreso[];
  gastos: Gasto[];
  escenarios: Escenario[];
  eventos: Evento[];
}
