import type { SeedData } from "./types";

/**
 * Seed ANEXO F — un asesor/EAF con seis clientes.
 * García-Llorente es el único completo; el resto solo pobla la Cartera.
 *
 * Cifras del motor (mockup): A ≈ 14.200 € · B ≈ 9.800 €
 */

const CUENTA_ID = "cuenta-eaf-1";
const CLIENTE_GL = "cliente-garcia-llorente";
const PERSONA_CARLOS = "persona-carlos";
const PERSONA_MARTA = "persona-marta";
const SOCIEDAD_GC = "sociedad-garcia-consulting";
const FONDO_A = "inst-fondo-a";
const PLAN_CARLOS = "inst-plan-carlos";
const INMUEBLE_JAVEA = "inm-javea";
const PASIVO_HIPOTECA = "pasivo-hipoteca-javea";
const OTRO_AUDI = "otro-audi-q8";
const ESC_BASE = "esc-gl-base";
const ESC_A = "esc-gl-a-reembolso";
const ESC_B = "esc-gl-b-traspaso";

export const seed: SeedData = {
  cuenta: {
    id: CUENTA_ID,
    nombre: "Despacho EAF Valencia",
  },

  personas: [
    {
      id: PERSONA_CARLOS,
      nombre: "Carlos",
      apellidos: "García Llorente",
      birthYear: 1968,
      ccaa: "Comunitat Valenciana",
    },
    {
      id: PERSONA_MARTA,
      nombre: "Marta",
      apellidos: "García Llorente",
      birthYear: 1971,
      ccaa: "Comunitat Valenciana",
    },
  ],

  clientes: [
    {
      id: CLIENTE_GL,
      cuentaId: CUENTA_ID,
      nombre: "Familia García-Llorente",
      segmento: "Pre-jubilado",
      ccaa: "Comunitat Valenciana",
      personaIds: [PERSONA_CARLOS, PERSONA_MARTA],
      sociedadIds: [SOCIEDAD_GC],
      // 885.000 activos − 180.000 hipoteca = 705.000
      patrimonioNeto: 705_000,
      composicion: {
        // Activos brutos 885k: financiero 420 · inmobiliario 420 · otros 45
        // Sociedad sin valoración en seed (hueco F4)
        financiero: 420_000 / 885_000,
        inmobiliario: 420_000 / 885_000,
        empresarial: 0,
        otros: 45_000 / 885_000,
      },
      ultimaRevisionMeses: 1.5,
      completo: true,
      datosAFecha: "2026-06-30",
    },
    {
      id: "cliente-beltran",
      cuentaId: CUENTA_ID,
      nombre: "Familia Beltrán Ortiz",
      segmento: "Empresario",
      ccaa: "Comunitat Valenciana",
      personaIds: [],
      sociedadIds: [],
      patrimonioNeto: 2_840_000,
      composicion: {
        empresarial: 0.62,
        financiero: 0.21,
        inmobiliario: 0.15,
        otros: 0.02,
      },
      ultimaRevisionMeses: 2,
      completo: false,
      datosAFecha: "2026-05-15",
    },
    {
      id: "cliente-navarro",
      cuentaId: CUENTA_ID,
      nombre: "Familia Navarro Sanchís",
      segmento: "Jubilado",
      ccaa: "Comunitat Valenciana",
      personaIds: [],
      sociedadIds: [],
      patrimonioNeto: 1_150_000,
      composicion: {
        inmobiliario: 0.58,
        financiero: 0.39,
        empresarial: 0,
        otros: 0.03,
      },
      ultimaRevisionMeses: 5,
      completo: false,
      datosAFecha: "2026-02-20",
    },
    {
      id: "cliente-requena",
      cuentaId: CUENTA_ID,
      nombre: "Familia Requena Poveda",
      segmento: "Alto ingreso",
      ccaa: "Comunitat Valenciana",
      personaIds: [],
      sociedadIds: [],
      patrimonioNeto: 610_000,
      composicion: {
        financiero: 0.71,
        inmobiliario: 0.26,
        empresarial: 0,
        otros: 0.03,
      },
      ultimaRevisionMeses: 0.75, // ~3 semanas
      completo: false,
      datosAFecha: "2026-07-01",
    },
    {
      id: "cliente-server",
      cuentaId: CUENTA_ID,
      nombre: "Familia Server Alcaraz",
      segmento: "Herencia en curso",
      ccaa: "Comunitat Valenciana",
      personaIds: [],
      sociedadIds: [],
      patrimonioNeto: 1_930_000,
      composicion: {
        inmobiliario: 0.64,
        financiero: 0.28,
        empresarial: 0.08,
        otros: 0,
      },
      ultimaRevisionMeses: 8,
      completo: false,
      datosAFecha: "2025-11-10",
    },
    {
      id: "cliente-tormo",
      cuentaId: CUENTA_ID,
      nombre: "Familia Tormo Gisbert",
      segmento: "Pre-jubilado",
      ccaa: "Comunitat Valenciana",
      personaIds: [],
      sociedadIds: [],
      patrimonioNeto: 875_000,
      composicion: {
        financiero: 0.46,
        inmobiliario: 0.44,
        empresarial: 0,
        otros: 0.1,
      },
      ultimaRevisionMeses: 1,
      completo: false,
      datosAFecha: "2026-06-20",
    },
  ],

  sociedades: [
    {
      id: SOCIEDAD_GC,
      clienteId: CLIENTE_GL,
      nombre: "García Consulting SL",
      nif: "B12345678",
      capitalSocial: 3_000,
      fechaConstitucion: "2010-03-15",
      situacion: "Activa",
      objetoSocial: "Consultoría de gestión empresarial",
      participaciones: { [PERSONA_CARLOS]: 1 },
    },
  ],

  instrumentos: [
    {
      id: FONDO_A,
      clienteId: CLIENTE_GL,
      nombre: "Fondo A",
      tipoFiscal: "fondo",
      valor: 300_000,
      fechaAdquisicion: "2014-06-15",
      plusvaliaLatente: 120_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARLOS }, porcentaje: 0.6 },
        { owner: { kind: "persona", personaId: PERSONA_MARTA }, porcentaje: 0.4 },
      ],
    },
    {
      id: PLAN_CARLOS,
      clienteId: CLIENTE_GL,
      nombre: "Plan de pensiones Carlos",
      tipoFiscal: "plan_pensiones",
      valor: 120_000,
      fechaAdquisicion: "2009-01-01",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARLOS }, porcentaje: 1 },
      ],
    },
  ],

  inmuebles: [
    {
      id: INMUEBLE_JAVEA,
      clienteId: CLIENTE_GL,
      nombre: "Vivienda en Jávea",
      valor: 420_000,
      fechaAdquisicion: "2012-09-01",
      pasivoId: PASIVO_HIPOTECA,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARLOS }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_MARTA }, porcentaje: 0.5 },
      ],
    },
  ],

  otrosActivos: [
    {
      id: OTRO_AUDI,
      clienteId: CLIENTE_GL,
      nombre: "Audi Q8",
      tipo: "vehiculo",
      valor: 45_000,
      fechaAdquisicion: "2022-04-10",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARLOS }, porcentaje: 1 },
      ],
    },
  ],

  pasivos: [
    {
      id: PASIVO_HIPOTECA,
      clienteId: CLIENTE_GL,
      tipo: "hipoteca",
      prestamista: "CaixaBank",
      capitalPendiente: 180_000,
      tipoInteres: 0.022,
      cuotaMensual: 950,
      inmuebleId: INMUEBLE_JAVEA,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARLOS }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_MARTA }, porcentaje: 0.5 },
      ],
    },
  ],

  ingresos: [
    {
      id: "ing-carlos-trabajo",
      clienteId: CLIENTE_GL,
      personaId: PERSONA_CARLOS,
      fuente: "trabajo",
      importeAnual: 95_000,
      descripcion: "Trabajo",
    },
    {
      id: "ing-marta-trabajo",
      clienteId: CLIENTE_GL,
      personaId: PERSONA_MARTA,
      fuente: "trabajo",
      importeAnual: 32_000,
      descripcion: "Trabajo",
    },
  ],

  gastos: [
    {
      id: "gas-familiar",
      clienteId: CLIENTE_GL,
      categoria: "Gastos familiares",
      importeAnual: 36_000,
      vinculadoA: null,
    },
    {
      id: "gas-intereses-hipoteca",
      clienteId: CLIENTE_GL,
      categoria: "Intereses hipoteca",
      importeAnual: 4_000, // aproximación nivel 1, orientativa
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_JAVEA },
    },
  ],

  escenarios: [
    {
      id: ESC_BASE,
      clienteId: CLIENTE_GL,
      nombre: "Situación actual",
      esPlanBase: true,
      impuestosPeriodo: 0,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [],
    },
    {
      id: ESC_A,
      clienteId: CLIENTE_GL,
      nombre: "A · Reembolso",
      esPlanBase: false,
      impuestosPeriodo: 14_200,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: ["evt-a-reembolso"],
    },
    {
      id: ESC_B,
      clienteId: CLIENTE_GL,
      nombre: "B · Traspaso + rescate",
      esPlanBase: false,
      impuestosPeriodo: 9_800,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: ["evt-b-traspaso", "evt-b-rescate"],
    },
    // Clientes ligeros — stubs solo para la columna Escenarios de P1 (ANEXO F)
    {
      id: "esc-beltran-base",
      clienteId: "cliente-beltran",
      nombre: "Situación actual",
      esPlanBase: true,
      eventoIds: [],
    },
    {
      id: "esc-requena-base",
      clienteId: "cliente-requena",
      nombre: "Situación actual",
      esPlanBase: true,
      eventoIds: [],
    },
    {
      id: "esc-requena-alt",
      clienteId: "cliente-requena",
      nombre: "A · Alternativa",
      esPlanBase: false,
      eventoIds: [],
    },
    {
      id: "esc-server-base",
      clienteId: "cliente-server",
      nombre: "Situación actual",
      esPlanBase: true,
      eventoIds: [],
    },
  ],

  eventos: [
    {
      id: "evt-a-reembolso",
      escenarioId: ESC_A,
      tipo: "reembolsar_fondo",
      anio: 2026,
      etiqueta: "Reembolso Fondo A",
      targetId: FONDO_A,
      impuestosPeriodo: 14_200,
    },
    {
      id: "evt-b-traspaso",
      escenarioId: ESC_B,
      tipo: "traspasar_fondo",
      anio: 2026,
      etiqueta: "Traspaso Fondo A → Fondo B",
      targetId: FONDO_A,
      impuestosPeriodo: 0,
    },
    {
      id: "evt-b-rescate",
      escenarioId: ESC_B,
      tipo: "rescatar_plan",
      anio: 2026,
      etiqueta: "Rescate plan de pensiones (mixto)",
      targetId: PLAN_CARLOS,
      impuestosPeriodo: 9_800,
    },
  ],
};

/** IDs estables exportados para pantallas */
export const ids = {
  cuenta: CUENTA_ID,
  clienteGarciaLlorente: CLIENTE_GL,
  personaCarlos: PERSONA_CARLOS,
  personaMarta: PERSONA_MARTA,
  sociedadGarciaConsulting: SOCIEDAD_GC,
  fondoA: FONDO_A,
  planCarlos: PLAN_CARLOS,
  inmuebleJavea: INMUEBLE_JAVEA,
  pasivoHipoteca: PASIVO_HIPOTECA,
  otroAudi: OTRO_AUDI,
  escBase: ESC_BASE,
  escA: ESC_A,
  escB: ESC_B,
} as const;

export function getCliente(id: string) {
  return seed.clientes.find((c) => c.id === id);
}

export function getPersonasDeCliente(clienteId: string) {
  const cliente = getCliente(clienteId);
  if (!cliente) return [];
  return seed.personas.filter((p) => cliente.personaIds.includes(p.id));
}

export function getEscenariosDeCliente(clienteId: string) {
  return seed.escenarios.filter((e) => e.clienteId === clienteId);
}

export function patrimonioTotalCartera() {
  return seed.clientes.reduce((sum, c) => sum + c.patrimonioNeto, 0);
}
