import type { HistorialInforme, SeedData } from "./types";

/**
 * Seed ANEXO F — un asesor/EAF con seis clientes.
 * García-Llorente es el único completo; el resto solo pobla la Cartera.
 *
 * impuestosPeriodo de escenarios A/B: rollup del motor (primer ejercicio),
 * no cifras fijas.
 */

const CUENTA_ID = "cuenta-eaf-1";
const CLIENTE_GL = "cliente-garcia-llorente";
const PERSONA_CARLOS = "persona-carlos";
const PERSONA_MARTA = "persona-marta";
const SOCIEDAD_GC = "sociedad-garcia-consulting";
const FONDO_A = "inst-fondo-a";
const PLAN_CARLOS = "inst-plan-carlos";
const PLAN_MARTA = "inst-plan-marta";
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
      // 970.000 activos − 180.000 hipoteca = 790.000
      patrimonioNeto: 790_000,
      composicion: {
        // Activos brutos 970k: financiero 505 · inmobiliario 420 · otros 45
        // Sociedad sin valoración en seed (hueco F4)
        financiero: 505_000 / 970_000,
        inmobiliario: 420_000 / 970_000,
        empresarial: 0,
        otros: 45_000 / 970_000,
      },
      ultimaRevisionMeses: 1.5,
      completo: true,
      datosAFecha: "2026-07-27",
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
      nif: "B-98··· (demo)",
      capitalSocial: 3_000,
      fechaConstitucion: "2015-01-01",
      situacion: "Activa",
      objetoSocial: "Servicios de consultoría",
      participaciones: { [PERSONA_CARLOS]: 1 },
    },
  ],

  instrumentos: [
    {
      id: FONDO_A,
      clienteId: CLIENTE_GL,
      nombre: "Fondo A · RV global",
      tipoFiscal: "fondo",
      valor: 300_000,
      fechaAdquisicion: "2014-06-15",
      costeAdquisicion: 180_000,
      plusvaliaLatente: 120_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARLOS }, porcentaje: 0.6 },
        { owner: { kind: "persona", personaId: PERSONA_MARTA }, porcentaje: 0.4 },
      ],
    },
    {
      id: PLAN_CARLOS,
      clienteId: CLIENTE_GL,
      nombre: "Plan de pensiones · Carlos",
      tipoFiscal: "plan_pensiones",
      valor: 120_000,
      fechaAdquisicion: "2009-01-01",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARLOS }, porcentaje: 1 },
      ],
    },
    {
      id: PLAN_MARTA,
      clienteId: CLIENTE_GL,
      nombre: "Plan de pensiones · Marta",
      tipoFiscal: "plan_pensiones",
      valor: 85_000,
      fechaAdquisicion: "2003-03-01",
      // Aportaciones ≤ 31/12/2006 · dato introducido por el asesor (demo DT 12ª)
      fraccionPre2007: 0.55,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_MARTA }, porcentaje: 1 },
      ],
    },
  ],

  inmuebles: [
    {
      id: INMUEBLE_JAVEA,
      clienteId: CLIENTE_GL,
      nombre: "Vivienda · Jávea",
      valor: 420_000,
      fechaAdquisicion: "2009-01-01",
      costeAdquisicion: 295_000,
      plusvaliaLatente: 125_000,
      uso: "vivienda_habitual",
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
      prestamista: "Banco Levante",
      capitalPendiente: 180_000,
      tipoInteres: 0.029,
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
      /**
       * Cotizaciones SS del trabajador · ejercicio 2026.
       * Base tope 5.101,20 €/mes (Orden PJC/297/2026 art. 2.1) × 12 = 61.214,40 €.
       * Tipos trabajador: CC 4,70 % + desempleo 1,55 % + FP 0,10 % + MEI 0,15 % = 6,50 %
       * → 3.978,94 € sobre base tope.
       * + cotización adicional de solidaridad (art. 17) sobre retribución > tope
       *   (sueldo mensual 7.916,67 €) ≈ 70,68 € → total redondeado 4.050 €.
       * Fuente: BOE-A-2026-7296 Orden PJC/297/2026.
       */
      cotizacionesSS: 4_050,
    },
    {
      id: "ing-marta-trabajo",
      clienteId: CLIENTE_GL,
      personaId: PERSONA_MARTA,
      fuente: "trabajo",
      importeAnual: 32_000,
      descripcion: "Trabajo",
      /**
       * Cotizaciones SS del trabajador · ejercicio 2026.
       * Sueldo 32.000 €/año (2.666,67 €/mes) < base máxima 5.101,20 €/mes
       * → cotiza por el íntegro: 6,50 % × 32.000 = 2.080 €. Sin solidaridad.
       * Fuente: BOE-A-2026-7296 Orden PJC/297/2026 arts. 2, 4, 16, 33.
       */
      cotizacionesSS: 2_080,
    },
  ],

  gastos: [
    {
      id: "gas-intereses",
      clienteId: CLIENTE_GL,
      categoria: "Intereses de deuda",
      importeAnual: 5_220,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_JAVEA },
    },
    {
      id: "gas-suministros",
      clienteId: CLIENTE_GL,
      categoria: "Suministros y comunidad",
      importeAnual: 4_800,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_JAVEA },
    },
    {
      id: "gas-familiar",
      clienteId: CLIENTE_GL,
      categoria: "Familia y estilo de vida",
      importeAnual: 36_000,
      vinculadoA: null,
    },
    {
      id: "gas-seguros",
      clienteId: CLIENTE_GL,
      categoria: "Seguros",
      importeAnual: 2_400,
      vinculadoA: null,
    },
    {
      id: "gas-vehiculo",
      clienteId: CLIENTE_GL,
      categoria: "Vehículo",
      importeAnual: 3_600,
      vinculadoA: { kind: "otro", otroId: OTRO_AUDI },
    },
    {
      id: "gas-otros",
      clienteId: CLIENTE_GL,
      categoria: "Otros",
      importeAnual: 6_000,
      vinculadoA: null,
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
      // Hitos del plan base (mockup eventosBase)
      eventoIds: [
        "evt-base-jubilacion-2033",
        "evt-base-jubilacion-2036",
      ],
    },
    {
      id: ESC_A,
      clienteId: CLIENTE_GL,
      nombre: "A · Reembolso",
      esPlanBase: false,
      // impuestosPeriodo se calcula por rollup al cargar
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-a-jubilacion-carlos",
        "evt-a-jubilacion-marta",
        "evt-a-reembolso",
      ],
    },
    {
      id: ESC_B,
      clienteId: CLIENTE_GL,
      nombre: "B · Traspaso + rescate",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-b-jubilacion-carlos",
        "evt-b-jubilacion-marta",
        "evt-b-traspaso",
        "evt-b-rescate",
      ],
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
      id: "evt-base-jubilacion-2033",
      escenarioId: ESC_BASE,
      tipo: "jubilarse",
      anio: 2033,
      etiqueta: "Jubilación de Carlos (65)",
      targetId: PERSONA_CARLOS,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 32.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-base-jubilacion-2036",
      escenarioId: ESC_BASE,
      tipo: "jubilarse",
      anio: 2036,
      etiqueta: "Jubilación de Marta (65)",
      targetId: PERSONA_MARTA,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 14.500 €/año · introducida por el asesor",
    },
    {
      id: "evt-a-jubilacion-carlos",
      escenarioId: ESC_A,
      tipo: "jubilarse",
      anio: 2033,
      etiqueta: "Jubilación de Carlos (65)",
      targetId: PERSONA_CARLOS,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 32.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-a-jubilacion-marta",
      escenarioId: ESC_A,
      tipo: "jubilarse",
      anio: 2036,
      etiqueta: "Jubilación de Marta (65)",
      targetId: PERSONA_MARTA,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 14.500 €/año · introducida por el asesor",
    },
    {
      id: "evt-a-reembolso",
      escenarioId: ESC_A,
      tipo: "reembolsar_fondo",
      anio: 2026,
      hastaAnio: 2031,
      etiqueta: "Reembolsar Fondo A · 35.000 €/año",
      targetId: FONDO_A,
      notas: "2026–2031",
    },
    {
      id: "evt-b-jubilacion-carlos",
      escenarioId: ESC_B,
      tipo: "jubilarse",
      anio: 2033,
      etiqueta: "Jubilación de Carlos (65)",
      targetId: PERSONA_CARLOS,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 32.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-b-jubilacion-marta",
      escenarioId: ESC_B,
      tipo: "jubilarse",
      anio: 2036,
      etiqueta: "Jubilación de Marta (65)",
      targetId: PERSONA_MARTA,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 14.500 €/año · introducida por el asesor",
    },
    {
      id: "evt-b-traspaso",
      escenarioId: ESC_B,
      tipo: "traspasar_fondo",
      anio: 2026,
      etiqueta: "Traspasar Fondo A → Fondo B (Art. 94)",
      targetId: FONDO_A,
    },
    {
      id: "evt-b-rescate",
      escenarioId: ESC_B,
      tipo: "rescatar_plan",
      anio: 2026,
      hastaAnio: 2033,
      etiqueta: "Rescatar plan · renta · 15.000 €/año",
      targetId: PLAN_CARLOS,
      notas: "2026–2033",
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
  planMarta: PLAN_MARTA,
  inmuebleJavea: INMUEBLE_JAVEA,
  pasivoHipoteca: PASIVO_HIPOTECA,
  otroAudi: OTRO_AUDI,
  escBase: ESC_BASE,
  escA: ESC_A,
  escB: ESC_B,
} as const;

/** P7 · Informes emitidos (solo García-Llorente tiene historial en el seed). */
export const historialInformes: HistorialInforme[] = [
  {
    id: "hist-gl-hoy",
    clienteId: CLIENTE_GL,
    fecha: "2026-07-27",
    titulo: "Foto patrimonial · Familia García-Llorente · 27/07/2026",
    tipo: "Foto del patrimonio",
  },
  {
    id: "hist-gl-1",
    clienteId: CLIENTE_GL,
    fecha: "2026-05-12",
    titulo: "Informe de la foto patrimonial",
    tipo: "Foto del patrimonio",
  },
  {
    id: "hist-gl-2",
    clienteId: CLIENTE_GL,
    fecha: "2026-06-20",
    titulo: "Comparación · A Reembolso vs B Traspaso + rescate",
    tipo: "Comparación de escenarios",
  },
];

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

export function getPlanBase(clienteId: string) {
  return seed.escenarios.find((e) => e.clienteId === clienteId && e.esPlanBase);
}

export function getEventosDeEscenario(escenarioId: string) {
  const esc = seed.escenarios.find((e) => e.id === escenarioId);
  if (!esc) return [];
  return esc.eventoIds
    .map((id) => seed.eventos.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => !!e);
}

export function getHistorialDeCliente(clienteId: string) {
  return historialInformes
    .filter((h) => h.clienteId === clienteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function patrimonioTotalCartera() {
  return seed.clientes.reduce((sum, c) => sum + c.patrimonioNeto, 0);
}
