import type { HistorialInforme, SeedData } from "./types";

/**
 * Seed ANEXO F — un asesor/EAF con seis clientes.
 * Los seis son expedientes completos: personas, activos, pasivos,
 * ingresos, gastos y escenarios con eventos reales.
 *
 * impuestosPeriodo: rollup del motor (primer ejercicio), no cifras fijas.
 *
 * Escenarios GL (pares comparables):
 *   A vs B — misma liquidez ≈35k · reembolso vs pignoración
 *   C vs D — misma venta Jávea · 2033 vs 2036 (art. 33.4.b)
 *   E — rescate capital Marta con DT 12ª (anioContingencia 2026)
 *
 * Los otros cinco expedientes cubren un caso de motor distinto cada uno:
 *   Beltrán — sociedad valorada · 2 hipotecas en el local (selector amortizar) · dividendo
 *   Navarro — Comunidad de Madrid (firewall §7) · capacidad negativa · líquidos que se agotan
 *   Requena — autónomo · crédito personal · titular Madrid con fondo compartido
 *   Server  — patrimonio casi todo inmobiliario · >65 con uso alquiler (no exime)
 *   Tormo   — rescate DT 12ª · Amparo a 2–3 años del umbral 65 (exención vivienda)
 */

const CUENTA_ID = "cuenta-eaf-1";
const CLIENTE_GL = "cliente-garcia-llorente";
const CLIENTE_BELTRAN = "cliente-beltran";
const CLIENTE_NAVARRO = "cliente-navarro";
const CLIENTE_REQUENA = "cliente-requena";
const CLIENTE_SERVER = "cliente-server";
const CLIENTE_TORMO = "cliente-tormo";

/* ── Personas ── */
const PERSONA_CARLOS = "persona-carlos";
const PERSONA_MARTA = "persona-marta";
const PERSONA_LUCIA = "persona-lucia";
const PERSONA_HUGO = "persona-hugo";
const PERSONA_AMPARO = "persona-amparo";
const PERSONA_VICENT = "persona-vicent";
const PERSONA_JORGE = "persona-jorge-beltran";
const PERSONA_ELENA = "persona-elena-ortiz";
const PERSONA_RAMON = "persona-ramon-navarro";
const PERSONA_PILAR = "persona-pilar-sanchis";
const PERSONA_NURIA = "persona-nuria-poveda";
const PERSONA_CLARA = "persona-clara-requena";
const PERSONA_ANDREU = "persona-andreu-requena";
const PERSONA_CARMEN = "persona-carmen-server";
const PERSONA_LLUIS = "persona-lluis-gisbert";

/* ── García-Llorente ── */
const SOCIEDAD_GC = "sociedad-garcia-consulting";
const FONDO_A = "inst-fondo-a";
const PLAN_CARLOS = "inst-plan-carlos";
const PLAN_MARTA = "inst-plan-marta";
const INMUEBLE_JAVEA = "inm-javea";
const PASIVO_HIPOTECA = "pasivo-hipoteca-javea";
const OTRO_AUDI = "otro-audi-q8";
const ESC_BASE = "esc-gl-base";
const ESC_A = "esc-gl-a-reembolso";
const ESC_B = "esc-gl-b-pignoracion";
const ESC_C = "esc-gl-c-javea-2033";
const ESC_D = "esc-gl-d-javea-2036";
const ESC_E = "esc-gl-e-rescate-marta";
const ESC_F = "esc-gl-f-amortizar";

/* ── Beltrán Ortiz ── */
const SOCIEDAD_BELTRAN = "sociedad-beltran-holding";
const FONDO_BELTRAN_CAIXA_RV = "inst-beltran-caixa-rv-global";
const FONDO_BELTRAN_CAIXA_MIXTO = "inst-beltran-caixa-mixto";
const FONDO_BELTRAN_CAIXA_RF = "inst-beltran-caixa-rf-euro";
const FONDO_BELTRAN_CAIXA_EMERGENTES = "inst-beltran-caixa-emergentes";
const FONDO_BELTRAN_CAIXA_MONETARIO = "inst-beltran-caixa-monetario";
const FONDO_BELTRAN_SANT_RV_USA = "inst-beltran-santander-rv-usa";
const FONDO_BELTRAN_SANT_SMALL = "inst-beltran-santander-small-caps";
const FONDO_BELTRAN_SANT_RF = "inst-beltran-santander-rf-corporate";
const FONDO_BELTRAN_SANT_INDEXADO = "inst-beltran-santander-indexado";
const FONDO_BELTRAN_SANT_LIQUIDEZ = "inst-beltran-santander-liquidez";
const INMUEBLE_BELTRAN_VIVIENDA = "inm-beltran-vivienda-valencia";
const INMUEBLE_BELTRAN_LOCAL = "inm-beltran-local";
const OTRO_BELTRAN_COCHE = "otro-beltran-coche";
const PASIVO_BELTRAN_HIPOTECA = "pasivo-beltran-hipoteca";
const PASIVO_BELTRAN_LOCAL = "pasivo-beltran-hipoteca-local";
const PASIVO_BELTRAN_LOCAL_REFORMA = "pasivo-beltran-hipoteca-local-reforma";
const ESC_BELTRAN_BASE = "esc-beltran-base";
const ESC_BELTRAN_A = "esc-beltran-a-dividendo";

/* ── Navarro Sanchís ── */
const INMUEBLE_NAVARRO_VIVIENDA = "inm-navarro-vivienda-madrid";
const INMUEBLE_NAVARRO_COSTA = "inm-navarro-costa";
const FONDO_NAVARRO = "inst-navarro-fondo-mixto";
const PLAN_RAMON = "inst-navarro-plan-ramon";
const OTRO_NAVARRO_EFECTIVO = "otro-navarro-efectivo";
const ESC_NAVARRO_BASE = "esc-navarro-base";
const ESC_NAVARRO_A = "esc-navarro-a-venta-costa";

/* ── Requena Poveda ── */
const INMUEBLE_REQUENA_VIVIENDA = "inm-requena-vivienda";
const FONDO_REQUENA_RV = "inst-requena-rv-global";
const FONDO_REQUENA_RF = "inst-requena-rf-mixta";
const FONDO_REQUENA_INDEXADO = "inst-requena-indexado";
const PLAN_VICENT = "inst-requena-plan-vicent";
const OTRO_REQUENA_COCHE = "otro-requena-coche";
const PASIVO_REQUENA_HIPOTECA = "pasivo-requena-hipoteca";
const PASIVO_REQUENA_CREDITO = "pasivo-requena-credito-coche";
const ESC_REQUENA_BASE = "esc-requena-base";
const ESC_REQUENA_A = "esc-requena-a-aportacion";

/* ── Server Alcaraz ── */
const INMUEBLE_SERVER_VIVIENDA = "inm-server-vivienda-valencia";
const INMUEBLE_SERVER_RUSSAFA = "inm-server-russafa";
const INMUEBLE_SERVER_PUEBLO = "inm-server-casa-pueblo";
const INMUEBLE_SERVER_LOCAL = "inm-server-local";
const FONDO_SERVER = "inst-server-fondo";
const ESC_SERVER_BASE = "esc-server-base";
const ESC_SERVER_A = "esc-server-a-venta-russafa";

/* ── Tormo Gisbert ── */
const INMUEBLE_TORMO_VIVIENDA = "inm-tormo-vivienda";
const FONDO_TORMO = "inst-tormo-fondo";
const PLAN_LLUIS = "inst-tormo-plan-lluis";
const OTRO_TORMO_COCHE = "otro-tormo-coche";
const OTRO_TORMO_COLECCION = "otro-tormo-coleccion";
const PASIVO_TORMO_HIPOTECA = "pasivo-tormo-hipoteca";
const ESC_TORMO_BASE = "esc-tormo-base";
const ESC_TORMO_A = "esc-tormo-a-rescate";

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
    // Lucía · sin ingresos · demo estado P4 «sin ingresos informados».
    // SIN titularidad sobre activos hasta que las guardas v14 estén en motor.ts/CT1.
    {
      id: PERSONA_LUCIA,
      nombre: "Lucía",
      apellidos: "García Llorente",
      birthYear: 2004,
      ccaa: "Comunitat Valenciana",
    },
    /* ── Beltrán Ortiz ── */
    {
      id: PERSONA_JORGE,
      nombre: "Jorge",
      apellidos: "Beltrán Ortiz",
      birthYear: 1975,
      ccaa: "Comunitat Valenciana",
    },
    {
      id: PERSONA_ELENA,
      nombre: "Elena",
      apellidos: "Ortiz Ruiz",
      birthYear: 1977,
      ccaa: "Comunitat Valenciana",
    },
    /* ── Navarro Sanchís ── */
    {
      id: PERSONA_RAMON,
      nombre: "Ramón",
      apellidos: "Navarro Sanchís",
      birthYear: 1954,
      ccaa: "Comunidad de Madrid",
    },
    {
      id: PERSONA_PILAR,
      nombre: "Pilar",
      apellidos: "Sanchís Mora",
      birthYear: 1957,
      ccaa: "Comunidad de Madrid",
    },
    // Hugo · hijo · vive con Ramón y Pilar en Madrid.
    // Demo de la cobertura matizada del firewall §7 dentro de un hogar entero:
    // la base del ahorro sí se liquida en Madrid; la base general, no.
    {
      id: PERSONA_HUGO,
      nombre: "Hugo",
      apellidos: "Navarro Sanchís",
      birthYear: 2001,
      ccaa: "Comunidad de Madrid",
    },
    /* ── Requena Poveda ── */
    // Vicent · actividad económica · fuente no contemplada por el motor.
    {
      id: PERSONA_VICENT,
      nombre: "Vicent",
      apellidos: "Requena Poveda",
      birthYear: 1980,
      ccaa: "Comunitat Valenciana",
    },
    {
      id: PERSONA_NURIA,
      nombre: "Núria",
      apellidos: "Poveda Llopis",
      birthYear: 1983,
      ccaa: "Comunitat Valenciana",
    },
    // Clara · menor sin ingresos · sin titularidad sobre activos (igual que Lucía).
    {
      id: PERSONA_CLARA,
      nombre: "Clara",
      apellidos: "Requena Poveda",
      birthYear: 2010,
      ccaa: "Comunitat Valenciana",
    },
    // Andreu · hermano de Vicent · vive en Madrid · titular de fondo compartido.
    // Cobertura mixta: calculable en base del ahorro; sin escala general CV.
    {
      id: PERSONA_ANDREU,
      nombre: "Andreu",
      apellidos: "Requena Soler",
      birthYear: 1978,
      ccaa: "Comunidad de Madrid",
    },
    /* ── Server Alcaraz ── */
    // Carmen · titular única · 72 años en 2026 (umbral art. 33.4.b).
    {
      id: PERSONA_CARMEN,
      nombre: "Carmen",
      apellidos: "Server Alcaraz",
      birthYear: 1954,
      ccaa: "Comunitat Valenciana",
    },
    /* ── Tormo Gisbert ── */
    // Amparo · 63 en 2026 · a 2 años del umbral art. 33.4.b (exención vivienda).
    // Pensión anticipada; titular al 50 % de la vivienda habitual.
    {
      id: PERSONA_AMPARO,
      nombre: "Amparo",
      apellidos: "Tormo Gisbert",
      birthYear: 1963,
      ccaa: "Comunitat Valenciana",
    },
    {
      id: PERSONA_LLUIS,
      nombre: "Lluís",
      apellidos: "Gisbert Ferrer",
      birthYear: 1961,
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
      personaIds: [PERSONA_CARLOS, PERSONA_MARTA, PERSONA_LUCIA],
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
      datosAFecha: "2026-07-27",
    },
    {
      id: CLIENTE_BELTRAN,
      cuentaId: CUENTA_ID,
      nombre: "Familia Beltrán Ortiz",
      segmento: "Empresario",
      ccaa: "Comunitat Valenciana",
      personaIds: [PERSONA_JORGE, PERSONA_ELENA],
      sociedadIds: [SOCIEDAD_BELTRAN],
      // 3.140.000 activos − 300.000 pasivos = 2.840.000
      // (+120k valoración Holding = +120k hipotecas del local)
      patrimonioNeto: 2_840_000,
      composicion: {
        // Brutos 3.140k: empresarial 1.880 · financiero 600 · inmobiliario 620 · otros 40
        empresarial: 1_880_000 / 3_140_000,
        financiero: 600_000 / 3_140_000,
        inmobiliario: 620_000 / 3_140_000,
        otros: 40_000 / 3_140_000,
      },
      ultimaRevisionMeses: 2,
      datosAFecha: "2026-05-15",
    },
    {
      id: CLIENTE_NAVARRO,
      cuentaId: CUENTA_ID,
      nombre: "Familia Navarro Sanchís",
      segmento: "Jubilado",
      // Demo firewall §7 · aviso de cobertura (resto de clientes = CV)
      ccaa: "Comunidad de Madrid",
      personaIds: [PERSONA_RAMON, PERSONA_PILAR, PERSONA_HUGO],
      sociedadIds: [],
      // 1.150.000 activos − 0 pasivos = 1.150.000
      patrimonioNeto: 1_150_000,
      composicion: {
        inmobiliario: 800_000 / 1_150_000,
        financiero: 310_000 / 1_150_000,
        empresarial: 0,
        otros: 40_000 / 1_150_000,
      },
      ultimaRevisionMeses: 5,
      datosAFecha: "2026-02-20",
    },
    {
      id: CLIENTE_REQUENA,
      cuentaId: CUENTA_ID,
      nombre: "Familia Requena Poveda",
      segmento: "Alto ingreso",
      ccaa: "Comunitat Valenciana",
      personaIds: [PERSONA_VICENT, PERSONA_NURIA, PERSONA_CLARA, PERSONA_ANDREU],
      sociedadIds: [],
      // 750.000 activos − 140.000 hipoteca − 15.000 crédito coche = 595.000
      patrimonioNeto: 595_000,
      composicion: {
        financiero: 430_000 / 750_000,
        inmobiliario: 280_000 / 750_000,
        empresarial: 0,
        otros: 40_000 / 750_000,
      },
      ultimaRevisionMeses: 0.75, // ~3 semanas
      datosAFecha: "2026-07-01",
    },
    {
      id: CLIENTE_SERVER,
      cuentaId: CUENTA_ID,
      nombre: "Familia Server Alcaraz",
      segmento: "Herencia en curso",
      ccaa: "Comunitat Valenciana",
      personaIds: [PERSONA_CARMEN],
      sociedadIds: [],
      // 1.930.000 activos − 0 pasivos = 1.930.000
      patrimonioNeto: 1_930_000,
      composicion: {
        inmobiliario: 1_730_000 / 1_930_000,
        financiero: 200_000 / 1_930_000,
        empresarial: 0,
        otros: 0,
      },
      ultimaRevisionMeses: 8,
      datosAFecha: "2025-11-10",
    },
    {
      id: CLIENTE_TORMO,
      cuentaId: CUENTA_ID,
      nombre: "Familia Tormo Gisbert",
      segmento: "Pre-jubilado",
      ccaa: "Comunitat Valenciana",
      personaIds: [PERSONA_AMPARO, PERSONA_LLUIS],
      sociedadIds: [],
      // 950.000 activos − 75.000 hipoteca = 875.000
      patrimonioNeto: 875_000,
      composicion: {
        financiero: 400_000 / 950_000,
        inmobiliario: 420_000 / 950_000,
        empresarial: 0,
        otros: 130_000 / 950_000,
      },
      ultimaRevisionMeses: 1,
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
    {
      id: SOCIEDAD_BELTRAN,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Beltrán Holding SL",
      nif: "B-97··· (demo)",
      capitalSocial: 60_000,
      fechaConstitucion: "2006-09-18",
      situacion: "Activa",
      objetoSocial: "Tenencia de participaciones y arrendamiento",
      participaciones: {
        [PERSONA_JORGE]: 0.6,
        [PERSONA_ELENA]: 0.4,
      },
      // Valoración introducida por el asesor · el cálculo societario sigue
      // pendiente de definir (firewall §8): no hay liquidador de IS.
      // Incluye +120.000 € para cuadrar las dos hipotecas del local.
      valor: 1_880_000,
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

    /* ── Beltrán · cartera CaixaBank (a nombre de Jorge) ── */
    {
      id: FONDO_BELTRAN_CAIXA_RV,
      clienteId: CLIENTE_BELTRAN,
      nombre: "CaixaBank · RV global",
      tipoFiscal: "fondo",
      valor: 95_000,
      fechaAdquisicion: "2013-03-11",
      costeAdquisicion: 62_000,
      plusvaliaLatente: 33_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 1 },
      ],
    },
    {
      id: FONDO_BELTRAN_CAIXA_MIXTO,
      clienteId: CLIENTE_BELTRAN,
      nombre: "CaixaBank · Mixto moderado",
      tipoFiscal: "fondo",
      valor: 80_000,
      fechaAdquisicion: "2017-05-02",
      costeAdquisicion: 66_000,
      plusvaliaLatente: 14_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 1 },
      ],
    },
    {
      id: FONDO_BELTRAN_CAIXA_RF,
      clienteId: CLIENTE_BELTRAN,
      nombre: "CaixaBank · RF euro",
      tipoFiscal: "fondo",
      valor: 70_000,
      fechaAdquisicion: "2021-01-20",
      costeAdquisicion: 68_000,
      plusvaliaLatente: 2_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 1 },
      ],
    },
    {
      id: FONDO_BELTRAN_CAIXA_EMERGENTES,
      clienteId: CLIENTE_BELTRAN,
      nombre: "CaixaBank · Emergentes",
      tipoFiscal: "fondo",
      valor: 55_000,
      fechaAdquisicion: "2019-09-30",
      costeAdquisicion: 48_000,
      plusvaliaLatente: 7_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 1 },
      ],
    },
    {
      id: FONDO_BELTRAN_CAIXA_MONETARIO,
      clienteId: CLIENTE_BELTRAN,
      nombre: "CaixaBank · Monetario",
      tipoFiscal: "fondo",
      valor: 40_000,
      fechaAdquisicion: "2024-02-14",
      costeAdquisicion: 39_000,
      plusvaliaLatente: 1_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 1 },
      ],
    },

    /* ── Beltrán · cartera Santander (a nombre de Elena) ── */
    {
      id: FONDO_BELTRAN_SANT_RV_USA,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Santander · RV Estados Unidos",
      tipoFiscal: "fondo",
      valor: 90_000,
      fechaAdquisicion: "2012-11-05",
      costeAdquisicion: 51_000,
      plusvaliaLatente: 39_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 1 },
      ],
    },
    {
      id: FONDO_BELTRAN_SANT_SMALL,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Santander · Small caps Europa",
      tipoFiscal: "fondo",
      valor: 65_000,
      fechaAdquisicion: "2018-07-23",
      costeAdquisicion: 52_000,
      plusvaliaLatente: 13_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 1 },
      ],
    },
    {
      id: FONDO_BELTRAN_SANT_RF,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Santander · RF corporativa",
      tipoFiscal: "fondo",
      valor: 55_000,
      fechaAdquisicion: "2020-10-08",
      costeAdquisicion: 53_000,
      plusvaliaLatente: 2_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 1 },
      ],
    },
    {
      id: FONDO_BELTRAN_SANT_INDEXADO,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Santander · Indexado mundial",
      tipoFiscal: "fondo",
      valor: 30_000,
      fechaAdquisicion: "2022-06-01",
      costeAdquisicion: 22_000,
      plusvaliaLatente: 8_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 1 },
      ],
    },
    {
      id: FONDO_BELTRAN_SANT_LIQUIDEZ,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Santander · Liquidez",
      tipoFiscal: "fondo",
      valor: 20_000,
      fechaAdquisicion: "2025-01-15",
      costeAdquisicion: 20_000,
      plusvaliaLatente: 0,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 1 },
      ],
    },

    /* ── Navarro ── */
    {
      id: FONDO_NAVARRO,
      clienteId: CLIENTE_NAVARRO,
      nombre: "Fondo mixto · perfil conservador",
      tipoFiscal: "fondo",
      valor: 220_000,
      fechaAdquisicion: "2011-04-12",
      costeAdquisicion: 150_000,
      plusvaliaLatente: 70_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_RAMON }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_PILAR }, porcentaje: 0.5 },
      ],
    },
    {
      id: PLAN_RAMON,
      clienteId: CLIENTE_NAVARRO,
      nombre: "Plan de pensiones · Ramón",
      tipoFiscal: "plan_pensiones",
      valor: 90_000,
      fechaAdquisicion: "1998-06-01",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_RAMON }, porcentaje: 1 },
      ],
    },

    /* ── Requena ── */
    {
      id: FONDO_REQUENA_RV,
      clienteId: CLIENTE_REQUENA,
      nombre: "Fondo · RV global",
      tipoFiscal: "fondo",
      valor: 180_000,
      fechaAdquisicion: "2016-02-08",
      costeAdquisicion: 120_000,
      plusvaliaLatente: 60_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_VICENT }, porcentaje: 0.6 },
        { owner: { kind: "persona", personaId: PERSONA_NURIA }, porcentaje: 0.4 },
      ],
    },
    {
      id: FONDO_REQUENA_RF,
      clienteId: CLIENTE_REQUENA,
      nombre: "Fondo · RF mixta",
      tipoFiscal: "fondo",
      valor: 120_000,
      fechaAdquisicion: "2020-03-02",
      costeAdquisicion: 108_000,
      plusvaliaLatente: 12_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_VICENT }, porcentaje: 0.6 },
        { owner: { kind: "persona", personaId: PERSONA_NURIA }, porcentaje: 0.4 },
      ],
    },
    {
      id: FONDO_REQUENA_INDEXADO,
      clienteId: CLIENTE_REQUENA,
      nombre: "Fondo · Indexado mundial",
      tipoFiscal: "fondo",
      valor: 80_000,
      fechaAdquisicion: "2021-11-19",
      costeAdquisicion: 58_000,
      plusvaliaLatente: 22_000,
      // Compartido con Andreu (Madrid) · demo cobertura mixta en reembolso.
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_NURIA }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_ANDREU }, porcentaje: 0.5 },
      ],
    },
    {
      id: PLAN_VICENT,
      clienteId: CLIENTE_REQUENA,
      nombre: "Plan de pensiones · Vicent",
      tipoFiscal: "plan_pensiones",
      valor: 50_000,
      fechaAdquisicion: "2012-12-20",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_VICENT }, porcentaje: 1 },
      ],
    },

    /* ── Server ── */
    {
      id: FONDO_SERVER,
      clienteId: CLIENTE_SERVER,
      nombre: "Fondo · Mixto defensivo",
      tipoFiscal: "fondo",
      valor: 200_000,
      fechaAdquisicion: "2015-09-14",
      costeAdquisicion: 155_000,
      plusvaliaLatente: 45_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARMEN }, porcentaje: 1 },
      ],
    },

    /* ── Tormo ── */
    {
      id: FONDO_TORMO,
      clienteId: CLIENTE_TORMO,
      nombre: "Fondo · RV europea",
      tipoFiscal: "fondo",
      valor: 180_000,
      fechaAdquisicion: "2013-10-07",
      costeAdquisicion: 130_000,
      plusvaliaLatente: 50_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_AMPARO }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_LLUIS }, porcentaje: 0.5 },
      ],
    },
    {
      id: PLAN_LLUIS,
      clienteId: CLIENTE_TORMO,
      nombre: "Plan de pensiones · Lluís",
      tipoFiscal: "plan_pensiones",
      valor: 220_000,
      fechaAdquisicion: "1996-02-01",
      // Datos introducidos por el asesor (DT 12ª) · no calculados
      fraccionPre2007: 0.45,
      anioContingencia: 2026,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_LLUIS }, porcentaje: 1 },
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

    /* ── Beltrán ── */
    {
      id: INMUEBLE_BELTRAN_VIVIENDA,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Vivienda · Valencia",
      valor: 400_000,
      fechaAdquisicion: "2010-06-30",
      costeAdquisicion: 265_000,
      plusvaliaLatente: 135_000,
      uso: "vivienda_habitual",
      pasivoId: PASIVO_BELTRAN_HIPOTECA,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 0.5 },
      ],
    },
    {
      id: INMUEBLE_BELTRAN_LOCAL,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Local comercial · Avinguda del Port",
      valor: 220_000,
      fechaAdquisicion: "2014-04-22",
      costeAdquisicion: 150_000,
      plusvaliaLatente: 70_000,
      uso: "local",
      // Dos hipotecas asociadas (compra + reforma) · el selector de amortizar
      // se ejercita desde esta ficha. pasivoId apunta a la principal.
      pasivoId: PASIVO_BELTRAN_LOCAL,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 0.5 },
      ],
    },

    /* ── Navarro ── */
    {
      id: INMUEBLE_NAVARRO_VIVIENDA,
      clienteId: CLIENTE_NAVARRO,
      nombre: "Vivienda · Madrid",
      valor: 620_000,
      fechaAdquisicion: "1992-03-16",
      costeAdquisicion: 210_000,
      plusvaliaLatente: 410_000,
      uso: "vivienda_habitual",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_RAMON }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_PILAR }, porcentaje: 0.5 },
      ],
    },
    {
      id: INMUEBLE_NAVARRO_COSTA,
      clienteId: CLIENTE_NAVARRO,
      nombre: "Segunda residencia · costa de Alicante",
      valor: 180_000,
      fechaAdquisicion: "2003-08-01",
      costeAdquisicion: 96_000,
      plusvaliaLatente: 84_000,
      uso: "segunda_residencia",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_RAMON }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_PILAR }, porcentaje: 0.5 },
      ],
    },

    /* ── Requena ── */
    {
      id: INMUEBLE_REQUENA_VIVIENDA,
      clienteId: CLIENTE_REQUENA,
      nombre: "Vivienda · València",
      valor: 280_000,
      fechaAdquisicion: "2022-09-09",
      costeAdquisicion: 245_000,
      plusvaliaLatente: 35_000,
      uso: "vivienda_habitual",
      pasivoId: PASIVO_REQUENA_HIPOTECA,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_VICENT }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_NURIA }, porcentaje: 0.5 },
      ],
    },

    /* ── Server · patrimonio casi todo inmobiliario ── */
    {
      id: INMUEBLE_SERVER_VIVIENDA,
      clienteId: CLIENTE_SERVER,
      nombre: "Vivienda · València",
      valor: 720_000,
      fechaAdquisicion: "1988-05-20",
      costeAdquisicion: 190_000,
      plusvaliaLatente: 530_000,
      uso: "vivienda_habitual",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARMEN }, porcentaje: 1 },
      ],
    },
    {
      id: INMUEBLE_SERVER_RUSSAFA,
      clienteId: CLIENTE_SERVER,
      nombre: "Piso en alquiler · Russafa",
      valor: 480_000,
      fechaAdquisicion: "2006-02-28",
      costeAdquisicion: 300_000,
      plusvaliaLatente: 180_000,
      uso: "alquiler",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARMEN }, porcentaje: 1 },
      ],
    },
    {
      id: INMUEBLE_SERVER_PUEBLO,
      clienteId: CLIENTE_SERVER,
      nombre: "Casa del pueblo · Ontinyent",
      valor: 380_000,
      fechaAdquisicion: "1995-11-03",
      costeAdquisicion: 120_000,
      plusvaliaLatente: 260_000,
      uso: "segunda_residencia",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARMEN }, porcentaje: 1 },
      ],
    },
    {
      id: INMUEBLE_SERVER_LOCAL,
      clienteId: CLIENTE_SERVER,
      nombre: "Solar y local · Ontinyent",
      valor: 150_000,
      fechaAdquisicion: "1995-11-03",
      costeAdquisicion: 90_000,
      plusvaliaLatente: 60_000,
      uso: "local",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARMEN }, porcentaje: 1 },
      ],
    },

    /* ── Tormo ── */
    {
      id: INMUEBLE_TORMO_VIVIENDA,
      clienteId: CLIENTE_TORMO,
      nombre: "Vivienda · Gandia",
      valor: 420_000,
      fechaAdquisicion: "2004-07-15",
      costeAdquisicion: 300_000,
      plusvaliaLatente: 120_000,
      uso: "vivienda_habitual",
      pasivoId: PASIVO_TORMO_HIPOTECA,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_AMPARO }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_LLUIS }, porcentaje: 0.5 },
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
    {
      id: OTRO_BELTRAN_COCHE,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Volvo XC60",
      tipo: "vehiculo",
      valor: 40_000,
      fechaAdquisicion: "2023-03-02",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 1 },
      ],
    },
    {
      id: OTRO_NAVARRO_EFECTIVO,
      clienteId: CLIENTE_NAVARRO,
      nombre: "Cuentas corrientes",
      tipo: "efectivo",
      valor: 40_000,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_RAMON }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_PILAR }, porcentaje: 0.5 },
      ],
    },
    {
      id: OTRO_REQUENA_COCHE,
      clienteId: CLIENTE_REQUENA,
      nombre: "Cupra Formentor",
      tipo: "vehiculo",
      valor: 40_000,
      fechaAdquisicion: "2024-01-18",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_VICENT }, porcentaje: 1 },
      ],
    },
    {
      id: OTRO_TORMO_COCHE,
      clienteId: CLIENTE_TORMO,
      nombre: "Mercedes GLC",
      tipo: "vehiculo",
      valor: 55_000,
      fechaAdquisicion: "2023-09-05",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_LLUIS }, porcentaje: 1 },
      ],
    },
    {
      id: OTRO_TORMO_COLECCION,
      clienteId: CLIENTE_TORMO,
      nombre: "Colección de pintura valenciana",
      tipo: "coleccion",
      valor: 75_000,
      fechaAdquisicion: "2008-12-01",
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_AMPARO }, porcentaje: 1 },
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
      modalidadInteres: "fijo",
      plazoRestanteAnios: 21,
      inmuebleId: INMUEBLE_JAVEA,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_CARLOS }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_MARTA }, porcentaje: 0.5 },
      ],
    },
    {
      id: PASIVO_BELTRAN_HIPOTECA,
      clienteId: CLIENTE_BELTRAN,
      tipo: "hipoteca",
      prestamista: "CaixaBank",
      capitalPendiente: 180_000,
      tipoInteres: 0.029,
      cuotaMensual: 950,
      modalidadInteres: "fijo",
      plazoRestanteAnios: 21,
      inmuebleId: INMUEBLE_BELTRAN_VIVIENDA,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 0.5 },
      ],
    },
    {
      id: PASIVO_BELTRAN_LOCAL,
      clienteId: CLIENTE_BELTRAN,
      tipo: "hipoteca",
      prestamista: "CaixaBank",
      capitalPendiente: 90_000,
      tipoInteres: 0.032,
      cuotaMensual: 510,
      modalidadInteres: "fijo",
      plazoRestanteAnios: 18,
      inmuebleId: INMUEBLE_BELTRAN_LOCAL,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 0.5 },
      ],
    },
    {
      id: PASIVO_BELTRAN_LOCAL_REFORMA,
      clienteId: CLIENTE_BELTRAN,
      tipo: "hipoteca",
      prestamista: "CaixaBank",
      capitalPendiente: 30_000,
      tipoInteres: 0.05,
      cuotaMensual: 290,
      // Variable · demo regla ③ no aplicable
      modalidadInteres: "variable",
      plazoRestanteAnios: 10,
      inmuebleId: INMUEBLE_BELTRAN_LOCAL,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_JORGE }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_ELENA }, porcentaje: 0.5 },
      ],
    },
    {
      id: PASIVO_REQUENA_HIPOTECA,
      clienteId: CLIENTE_REQUENA,
      tipo: "hipoteca",
      prestamista: "Banco Sabadell",
      capitalPendiente: 140_000,
      tipoInteres: 0.03,
      cuotaMensual: 665,
      modalidadInteres: "fijo",
      plazoRestanteAnios: 22,
      inmuebleId: INMUEBLE_REQUENA_VIVIENDA,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_VICENT }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_NURIA }, porcentaje: 0.5 },
      ],
    },
    {
      id: PASIVO_REQUENA_CREDITO,
      clienteId: CLIENTE_REQUENA,
      tipo: "credito",
      prestamista: "BBVA",
      capitalPendiente: 15_000,
      tipoInteres: 0.069,
      cuotaMensual: 280,
      modalidadInteres: "fijo",
      plazoRestanteAnios: 5,
      // Sin inmueble · crédito del Cupra · demo interés derivado sin vínculo.
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_VICENT }, porcentaje: 1 },
      ],
    },
    {
      id: PASIVO_TORMO_HIPOTECA,
      clienteId: CLIENTE_TORMO,
      tipo: "hipoteca",
      prestamista: "Caixa Ontinyent",
      capitalPendiente: 75_000,
      tipoInteres: 0.028,
      cuotaMensual: 720,
      modalidadInteres: "fijo",
      plazoRestanteAnios: 9,
      inmuebleId: INMUEBLE_TORMO_VIVIENDA,
      titularidades: [
        { owner: { kind: "persona", personaId: PERSONA_AMPARO }, porcentaje: 0.5 },
        { owner: { kind: "persona", personaId: PERSONA_LLUIS }, porcentaje: 0.5 },
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

    /* ── Beltrán ── */
    {
      id: "ing-jorge-trabajo",
      clienteId: CLIENTE_BELTRAN,
      personaId: PERSONA_JORGE,
      fuente: "trabajo",
      importeAnual: 92_000,
      descripcion: "Trabajo (nómina de la sociedad)",
      /**
       * Cotizaciones SS del trabajador · ejercicio 2026.
       * Sueldo por encima de la base máxima (5.101,20 €/mes × 12 = 61.214,40 €)
       * → 6,50 % sobre base tope = 3.978,94 € + solidaridad (art. 17) sobre el
       * exceso → total redondeado 4.050 €.
       * Fuente: BOE-A-2026-7296 Orden PJC/297/2026 arts. 2, 4, 16, 17, 33.
       */
      cotizacionesSS: 4_050,
    },
    {
      id: "ing-elena-trabajo",
      clienteId: CLIENTE_BELTRAN,
      personaId: PERSONA_ELENA,
      fuente: "trabajo",
      importeAnual: 48_000,
      descripcion: "Trabajo",
      /**
       * Sueldo 48.000 €/año (4.000 €/mes) < base máxima 5.101,20 €/mes
       * → 6,50 % × 48.000 = 3.120 €. Sin solidaridad.
       * Fuente: BOE-A-2026-7296 Orden PJC/297/2026 arts. 2, 4, 16, 33.
       */
      cotizacionesSS: 3_120,
    },

    /* ── Navarro · hogar jubilado con un hijo trabajando ── */
    {
      id: "ing-ramon-pension",
      clienteId: CLIENTE_NAVARRO,
      personaId: PERSONA_RAMON,
      fuente: "pension",
      importeAnual: 15_500,
      descripcion: "Pensión de jubilación",
    },
    {
      id: "ing-pilar-pension",
      clienteId: CLIENTE_NAVARRO,
      personaId: PERSONA_PILAR,
      fuente: "pension",
      importeAnual: 11_500,
      descripcion: "Pensión de jubilación",
    },
    {
      id: "ing-hugo-trabajo",
      clienteId: CLIENTE_NAVARRO,
      personaId: PERSONA_HUGO,
      fuente: "trabajo",
      importeAnual: 24_000,
      descripcion: "Trabajo",
      /**
       * Sueldo 24.000 €/año (2.000 €/mes) < base máxima 5.101,20 €/mes
       * → 6,50 % × 24.000 = 1.560 €. Sin solidaridad.
       * Fuente: BOE-A-2026-7296 Orden PJC/297/2026 arts. 2, 4, 16, 33.
       */
      cotizacionesSS: 1_560,
    },

    /* ── Requena ── */
    {
      id: "ing-vicent-aaee",
      clienteId: CLIENTE_REQUENA,
      personaId: PERSONA_VICENT,
      fuente: "actividad_economica",
      importeAnual: 68_000,
      descripcion: "Actividad económica",
    },
    {
      id: "ing-nuria-trabajo",
      clienteId: CLIENTE_REQUENA,
      personaId: PERSONA_NURIA,
      fuente: "trabajo",
      importeAnual: 38_000,
      descripcion: "Trabajo",
      /**
       * Sueldo 38.000 €/año (3.166,67 €/mes) < base máxima 5.101,20 €/mes
       * → 6,50 % × 38.000 = 2.470 €. Sin solidaridad.
       * Fuente: BOE-A-2026-7296 Orden PJC/297/2026 arts. 2, 4, 16, 33.
       */
      cotizacionesSS: 2_470,
    },
    {
      id: "ing-andreu-trabajo",
      clienteId: CLIENTE_REQUENA,
      personaId: PERSONA_ANDREU,
      fuente: "trabajo",
      importeAnual: 36_000,
      descripcion: "Trabajo (Madrid)",
      /**
       * Sueldo 36.000 €/año (3.000 €/mes) < base máxima 5.101,20 €/mes
       * → 6,50 % × 36.000 = 2.340 €. Sin solidaridad.
       * Fuente: BOE-A-2026-7296 Orden PJC/297/2026 arts. 2, 4, 16, 33.
       */
      cotizacionesSS: 2_340,
    },

    /* ── Server ── */
    {
      id: "ing-carmen-alquiler",
      clienteId: CLIENTE_SERVER,
      personaId: PERSONA_CARMEN,
      fuente: "alquiler",
      importeAnual: 24_000,
      descripcion: "Alquiler del piso de Russafa",
    },

    /* ── Tormo ── */
    {
      id: "ing-amparo-pension",
      clienteId: CLIENTE_TORMO,
      personaId: PERSONA_AMPARO,
      fuente: "pension",
      importeAnual: 26_000,
      descripcion: "Pensión",
    },
    {
      id: "ing-lluis-trabajo",
      clienteId: CLIENTE_TORMO,
      personaId: PERSONA_LLUIS,
      fuente: "trabajo",
      importeAnual: 52_000,
      descripcion: "Trabajo",
      /**
       * Sueldo 52.000 €/año (4.333,33 €/mes) < base máxima 5.101,20 €/mes
       * → 6,50 % × 52.000 = 3.380 €. Sin solidaridad.
       * Fuente: BOE-A-2026-7296 Orden PJC/297/2026 arts. 2, 4, 16, 33.
       */
      cotizacionesSS: 3_380,
    },
  ],

  gastos: [
    {
      id: "gas-intereses",
      clienteId: CLIENTE_GL,
      categoria: "Intereses de deuda",
      origenInteres: "derivado_pasivo",
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

    /* ── Beltrán ── */
    {
      id: "gas-beltran-intereses",
      clienteId: CLIENTE_BELTRAN,
      categoria: "Intereses de deuda",
      origenInteres: "derivado_pasivo",
      importeAnual: 5_220,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_BELTRAN_VIVIENDA },
    },
    {
      id: "gas-beltran-intereses-local",
      clienteId: CLIENTE_BELTRAN,
      categoria: "Intereses de deuda",
      origenInteres: "derivado_pasivo",
      // 90.000 × 3,2 % + 30.000 × 5 % = 2.880 + 1.500
      importeAnual: 4_380,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_BELTRAN_LOCAL },
    },
    {
      id: "gas-beltran-suministros",
      clienteId: CLIENTE_BELTRAN,
      categoria: "Suministros y comunidad",
      importeAnual: 3_600,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_BELTRAN_VIVIENDA },
    },
    {
      id: "gas-beltran-familiar",
      clienteId: CLIENTE_BELTRAN,
      categoria: "Familia y estilo de vida",
      importeAnual: 42_000,
      vinculadoA: null,
    },
    {
      id: "gas-beltran-seguros",
      clienteId: CLIENTE_BELTRAN,
      categoria: "Seguros",
      importeAnual: 2_800,
      vinculadoA: null,
    },
    {
      id: "gas-beltran-vehiculo",
      clienteId: CLIENTE_BELTRAN,
      categoria: "Vehículo",
      importeAnual: 2_400,
      vinculadoA: { kind: "otro", otroId: OTRO_BELTRAN_COCHE },
    },
    {
      id: "gas-beltran-otros",
      clienteId: CLIENTE_BELTRAN,
      categoria: "Otros",
      importeAnual: 8_000,
      vinculadoA: null,
    },

    /* ── Navarro · capacidad de ahorro negativa ── */
    {
      id: "gas-navarro-familiar",
      clienteId: CLIENTE_NAVARRO,
      categoria: "Familia y ayuda al hijo",
      importeAnual: 48_000,
      vinculadoA: null,
    },
    {
      id: "gas-navarro-suministros",
      clienteId: CLIENTE_NAVARRO,
      categoria: "Suministros y comunidad",
      importeAnual: 6_000,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_NAVARRO_VIVIENDA },
    },
    {
      id: "gas-navarro-seguros",
      clienteId: CLIENTE_NAVARRO,
      categoria: "Seguros",
      importeAnual: 3_200,
      vinculadoA: null,
    },
    {
      id: "gas-navarro-salud",
      clienteId: CLIENTE_NAVARRO,
      categoria: "Salud",
      importeAnual: 4_800,
      vinculadoA: null,
    },
    {
      id: "gas-navarro-otros",
      clienteId: CLIENTE_NAVARRO,
      categoria: "Otros",
      importeAnual: 12_000,
      vinculadoA: null,
    },

    /* ── Requena ── */
    {
      id: "gas-requena-intereses",
      clienteId: CLIENTE_REQUENA,
      categoria: "Intereses de deuda",
      origenInteres: "derivado_pasivo",
      importeAnual: 4_200,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_REQUENA_VIVIENDA },
    },
    {
      id: "gas-requena-intereses-credito",
      clienteId: CLIENTE_REQUENA,
      categoria: "Intereses de deuda",
      origenInteres: "derivado_pasivo",
      // 15.000 × 6,9 % · crédito sin inmueble
      importeAnual: 1_035,
      vinculadoA: null,
    },
    {
      id: "gas-requena-familiar",
      clienteId: CLIENTE_REQUENA,
      categoria: "Familia y estilo de vida",
      importeAnual: 28_000,
      vinculadoA: null,
    },
    {
      id: "gas-requena-suministros",
      clienteId: CLIENTE_REQUENA,
      categoria: "Suministros y comunidad",
      importeAnual: 2_400,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_REQUENA_VIVIENDA },
    },
    {
      id: "gas-requena-vehiculo",
      clienteId: CLIENTE_REQUENA,
      categoria: "Vehículo",
      importeAnual: 3_000,
      vinculadoA: { kind: "otro", otroId: OTRO_REQUENA_COCHE },
    },
    {
      id: "gas-requena-otros",
      clienteId: CLIENTE_REQUENA,
      categoria: "Otros",
      importeAnual: 5_000,
      vinculadoA: null,
    },

    /* ── Server ── */
    {
      id: "gas-server-alquiler",
      clienteId: CLIENTE_SERVER,
      categoria: "Suministros y comunidad",
      importeAnual: 4_800,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_SERVER_RUSSAFA },
    },
    {
      id: "gas-server-tributos",
      clienteId: CLIENTE_SERVER,
      categoria: "Tributos locales (IBI y tasas)",
      importeAnual: 3_600,
      vinculadoA: null,
    },
    {
      id: "gas-server-familiar",
      clienteId: CLIENTE_SERVER,
      categoria: "Familia y estilo de vida",
      importeAnual: 18_000,
      vinculadoA: null,
    },
    {
      id: "gas-server-seguros",
      clienteId: CLIENTE_SERVER,
      categoria: "Seguros",
      importeAnual: 2_400,
      vinculadoA: null,
    },
    {
      id: "gas-server-otros",
      clienteId: CLIENTE_SERVER,
      categoria: "Otros",
      importeAnual: 6_000,
      vinculadoA: null,
    },

    /* ── Tormo ── */
    {
      id: "gas-tormo-intereses",
      clienteId: CLIENTE_TORMO,
      categoria: "Intereses de deuda",
      origenInteres: "derivado_pasivo",
      importeAnual: 2_100,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_TORMO_VIVIENDA },
    },
    {
      id: "gas-tormo-familiar",
      clienteId: CLIENTE_TORMO,
      categoria: "Familia y estilo de vida",
      importeAnual: 22_000,
      vinculadoA: null,
    },
    {
      id: "gas-tormo-suministros",
      clienteId: CLIENTE_TORMO,
      categoria: "Suministros y comunidad",
      importeAnual: 3_000,
      vinculadoA: { kind: "inmueble", inmuebleId: INMUEBLE_TORMO_VIVIENDA },
    },
    {
      id: "gas-tormo-vehiculo",
      clienteId: CLIENTE_TORMO,
      categoria: "Vehículo",
      importeAnual: 2_800,
      vinculadoA: { kind: "otro", otroId: OTRO_TORMO_COCHE },
    },
    {
      id: "gas-tormo-otros",
      clienteId: CLIENTE_TORMO,
      categoria: "Otros",
      importeAnual: 5_000,
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
      nombre: "B · Pignoración",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-b-jubilacion-carlos",
        "evt-b-jubilacion-marta",
        "evt-b-pignoracion",
      ],
    },
    {
      id: ESC_C,
      clienteId: CLIENTE_GL,
      nombre: "C · Venta Jávea 2033",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-c-jubilacion-carlos",
        "evt-c-jubilacion-marta",
        "evt-c-venta-javea",
      ],
    },
    {
      id: ESC_D,
      clienteId: CLIENTE_GL,
      nombre: "D · Venta Jávea 2036",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-d-jubilacion-carlos",
        "evt-d-jubilacion-marta",
        "evt-d-venta-javea",
      ],
    },
    {
      id: ESC_E,
      clienteId: CLIENTE_GL,
      nombre: "E · Rescate capital Marta",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-e-jubilacion-carlos",
        "evt-e-jubilacion-marta",
        "evt-e-rescate-capital",
      ],
    },
    {
      id: ESC_F,
      clienteId: CLIENTE_GL,
      nombre: "F · Amortizar 50.000",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-f-jubilacion-carlos",
        "evt-f-jubilacion-marta",
        "evt-f-amortizar",
      ],
    },

    /* ── Beltrán ── */
    {
      id: ESC_BELTRAN_BASE,
      clienteId: CLIENTE_BELTRAN,
      nombre: "Situación actual",
      esPlanBase: true,
      impuestosPeriodo: 0,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-beltran-base-jubilacion-jorge",
        "evt-beltran-base-jubilacion-elena",
      ],
    },
    {
      id: ESC_BELTRAN_A,
      clienteId: CLIENTE_BELTRAN,
      nombre: "A · Reparto de dividendo 2027",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-beltran-a-jubilacion-jorge",
        "evt-beltran-a-jubilacion-elena",
        "evt-beltran-a-dividendo",
      ],
    },

    /* ── Navarro ── */
    {
      id: ESC_NAVARRO_BASE,
      clienteId: CLIENTE_NAVARRO,
      nombre: "Situación actual",
      esPlanBase: true,
      impuestosPeriodo: 0,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      // Hogar ya jubilado: la situación actual no tiene hitos por delante.
      // Su interés es la trayectoria — la capacidad es negativa y los líquidos se agotan.
      eventoIds: [],
    },
    {
      id: ESC_NAVARRO_A,
      clienteId: CLIENTE_NAVARRO,
      nombre: "A · Venta de la segunda residencia 2032",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: ["evt-navarro-a-venta-costa"],
    },

    /* ── Requena ── */
    {
      id: ESC_REQUENA_BASE,
      clienteId: CLIENTE_REQUENA,
      nombre: "Situación actual",
      esPlanBase: true,
      impuestosPeriodo: 0,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: ["evt-requena-base-jubilacion-vicent"],
    },
    {
      id: ESC_REQUENA_A,
      clienteId: CLIENTE_REQUENA,
      nombre: "A · Aportación al plan 2026",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-requena-a-jubilacion-vicent",
        "evt-requena-a-aportacion",
      ],
    },

    /* ── Server ── */
    {
      id: ESC_SERVER_BASE,
      clienteId: CLIENTE_SERVER,
      nombre: "Situación actual",
      esPlanBase: true,
      impuestosPeriodo: 0,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      // Carmen ya cobra pensión y alquiler: sin hitos pendientes en la foto actual.
      eventoIds: [],
    },
    {
      id: ESC_SERVER_A,
      clienteId: CLIENTE_SERVER,
      nombre: "A · Venta del piso de Russafa 2030",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: ["evt-server-a-venta-russafa"],
    },

    /* ── Tormo ── */
    {
      id: ESC_TORMO_BASE,
      clienteId: CLIENTE_TORMO,
      nombre: "Situación actual",
      esPlanBase: true,
      impuestosPeriodo: 0,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: ["evt-tormo-base-jubilacion-lluis"],
    },
    {
      id: ESC_TORMO_A,
      clienteId: CLIENTE_TORMO,
      nombre: "A · Rescate en capital del plan de Lluís",
      esPlanBase: false,
      rentabilidadEsperada: 0.04,
      inflacion: 0.02,
      eventoIds: [
        "evt-tormo-a-jubilacion-lluis",
        "evt-tormo-a-rescate-capital",
      ],
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
      importe: 35_000,
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
      id: "evt-b-pignoracion",
      escenarioId: ESC_B,
      tipo: "pignorar",
      anio: 2026,
      etiqueta: "Pignorar Fondo A · 35.000 €",
      targetId: FONDO_A,
      importe: 35_000,
      notas: "Misma liquidez que A · sin realizar plusvalía",
    },
    {
      id: "evt-c-jubilacion-carlos",
      escenarioId: ESC_C,
      tipo: "jubilarse",
      anio: 2033,
      etiqueta: "Jubilación de Carlos (65)",
      targetId: PERSONA_CARLOS,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 32.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-c-jubilacion-marta",
      escenarioId: ESC_C,
      tipo: "jubilarse",
      anio: 2036,
      etiqueta: "Jubilación de Marta (65)",
      targetId: PERSONA_MARTA,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 14.500 €/año · introducida por el asesor",
    },
    {
      id: "evt-c-venta-javea",
      escenarioId: ESC_C,
      tipo: "vender_inmueble",
      anio: 2033,
      etiqueta: "Vender Vivienda · Jávea · 420.000 €",
      targetId: INMUEBLE_JAVEA,
      importe: 420_000,
      notas: "Carlos 65 · Marta 62 · art. 33.4.b) parcial",
    },
    {
      id: "evt-d-jubilacion-carlos",
      escenarioId: ESC_D,
      tipo: "jubilarse",
      anio: 2033,
      etiqueta: "Jubilación de Carlos (65)",
      targetId: PERSONA_CARLOS,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 32.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-d-jubilacion-marta",
      escenarioId: ESC_D,
      tipo: "jubilarse",
      anio: 2036,
      etiqueta: "Jubilación de Marta (65)",
      targetId: PERSONA_MARTA,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 14.500 €/año · introducida por el asesor",
    },
    {
      id: "evt-d-venta-javea",
      escenarioId: ESC_D,
      tipo: "vender_inmueble",
      anio: 2036,
      etiqueta: "Vender Vivienda · Jávea · 420.000 €",
      targetId: INMUEBLE_JAVEA,
      importe: 420_000,
      notas: "Carlos 68 · Marta 65 · art. 33.4.b) pleno",
    },
    {
      id: "evt-e-jubilacion-carlos",
      escenarioId: ESC_E,
      tipo: "jubilarse",
      anio: 2033,
      etiqueta: "Jubilación de Carlos (65)",
      targetId: PERSONA_CARLOS,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 32.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-e-jubilacion-marta",
      escenarioId: ESC_E,
      tipo: "jubilarse",
      anio: 2036,
      etiqueta: "Jubilación de Marta (65)",
      targetId: PERSONA_MARTA,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 14.500 €/año · introducida por el asesor",
    },
    {
      id: "evt-e-rescate-capital",
      escenarioId: ESC_E,
      tipo: "rescatar_plan",
      anio: 2026,
      etiqueta: "Rescatar plan · capital · 15.000 €",
      targetId: PLAN_MARTA,
      importe: 15_000,
      // Contingencia en 2026 → plazo DT 12ª hasta 2028 · reducción 40 % aplicable
      anioContingencia: 2026,
      notas: "DT 12ª · fraccionPre2007 55 % · contingencia 2026",
    },

    {
      id: "evt-f-jubilacion-carlos",
      escenarioId: ESC_F,
      tipo: "jubilarse",
      anio: 2033,
      etiqueta: "Jubilación de Carlos (65)",
      targetId: PERSONA_CARLOS,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 32.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-f-jubilacion-marta",
      escenarioId: ESC_F,
      tipo: "jubilarse",
      anio: 2036,
      etiqueta: "Jubilación de Marta (65)",
      targetId: PERSONA_MARTA,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 14.500 €/año · introducida por el asesor",
    },
    {
      id: "evt-f-amortizar",
      escenarioId: ESC_F,
      tipo: "amortizar_hipoteca",
      anio: 2026,
      etiqueta: "Amortizar Hipoteca Banco Levante · 50.000 €",
      targetId: PASIVO_HIPOTECA,
      importe: 50_000,
    },

    /* ── Beltrán ── */
    {
      id: "evt-beltran-base-jubilacion-jorge",
      escenarioId: ESC_BELTRAN_BASE,
      tipo: "jubilarse",
      anio: 2040,
      etiqueta: "Jubilación de Jorge (65)",
      targetId: PERSONA_JORGE,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 28.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-beltran-base-jubilacion-elena",
      escenarioId: ESC_BELTRAN_BASE,
      tipo: "jubilarse",
      anio: 2042,
      etiqueta: "Jubilación de Elena (65)",
      targetId: PERSONA_ELENA,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 18.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-beltran-a-jubilacion-jorge",
      escenarioId: ESC_BELTRAN_A,
      tipo: "jubilarse",
      anio: 2040,
      etiqueta: "Jubilación de Jorge (65)",
      targetId: PERSONA_JORGE,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 28.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-beltran-a-jubilacion-elena",
      escenarioId: ESC_BELTRAN_A,
      tipo: "jubilarse",
      anio: 2042,
      etiqueta: "Jubilación de Elena (65)",
      targetId: PERSONA_ELENA,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 18.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-beltran-a-dividendo",
      escenarioId: ESC_BELTRAN_A,
      tipo: "repartir_dividendo",
      anio: 2027,
      etiqueta: "Repartir dividendo · Beltrán Holding SL · 40.000 €",
      targetId: SOCIEDAD_BELTRAN,
      importe: 40_000,
      notas: "Jorge 60 % · Elena 40 % · liquidación societaria pendiente de definir",
    },

    /* ── Navarro ── */
    {
      id: "evt-navarro-a-venta-costa",
      escenarioId: ESC_NAVARRO_A,
      tipo: "vender_inmueble",
      anio: 2032,
      etiqueta: "Vender Segunda residencia · costa de Alicante · 180.000 €",
      targetId: INMUEBLE_NAVARRO_COSTA,
      importe: 180_000,
      notas:
        "Ramón 78 · Pilar 75 · segunda residencia: la edad no exime (art. 33.4.b) es solo vivienda habitual)",
    },

    /* ── Requena ── */
    {
      id: "evt-requena-base-jubilacion-vicent",
      escenarioId: ESC_REQUENA_BASE,
      tipo: "jubilarse",
      anio: 2045,
      etiqueta: "Jubilación de Vicent (65)",
      targetId: PERSONA_VICENT,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 22.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-requena-a-jubilacion-vicent",
      escenarioId: ESC_REQUENA_A,
      tipo: "jubilarse",
      anio: 2045,
      etiqueta: "Jubilación de Vicent (65)",
      targetId: PERSONA_VICENT,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 22.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-requena-a-aportacion",
      escenarioId: ESC_REQUENA_A,
      tipo: "aportar_plan",
      anio: 2026,
      etiqueta: "Aportar al plan de Vicent · 1.500 €",
      targetId: PLAN_VICENT,
      importe: 1_500,
      notas: "Límite individual art. 52 LIRPF",
    },

    /* ── Server ── */
    {
      id: "evt-server-a-venta-russafa",
      escenarioId: ESC_SERVER_A,
      tipo: "vender_inmueble",
      anio: 2030,
      etiqueta: "Vender Piso en alquiler · Russafa · 480.000 €",
      targetId: INMUEBLE_SERVER_RUSSAFA,
      importe: 480_000,
      notas:
        "Carmen 76 · uso alquiler: fuera del art. 33.4.b), la edad por sí sola no exime",
    },

    /* ── Tormo ── */
    {
      id: "evt-tormo-base-jubilacion-lluis",
      escenarioId: ESC_TORMO_BASE,
      tipo: "jubilarse",
      anio: 2027,
      etiqueta: "Jubilación de Lluís (66)",
      targetId: PERSONA_LLUIS,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 22.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-tormo-a-jubilacion-lluis",
      escenarioId: ESC_TORMO_A,
      tipo: "jubilarse",
      anio: 2027,
      etiqueta: "Jubilación de Lluís (66)",
      targetId: PERSONA_LLUIS,
      introducidoPorAsesor: true,
      notas: "Pensión estimada 22.000 €/año · introducida por el asesor",
    },
    {
      id: "evt-tormo-a-rescate-capital",
      escenarioId: ESC_TORMO_A,
      tipo: "rescatar_plan",
      anio: 2027,
      etiqueta: "Rescatar plan · capital · 20.000 €",
      targetId: PLAN_LLUIS,
      importe: 20_000,
      // Contingencia en 2026 → plazo DT 12ª hasta 2028 · reducción 40 % aplicable
      anioContingencia: 2026,
      notas: "DT 12ª · fraccionPre2007 45 % · contingencia 2026",
    },
  ],
};

/** IDs estables exportados para pantallas */
export const ids = {
  cuenta: CUENTA_ID,
  clienteGarciaLlorente: CLIENTE_GL,
  clienteBeltran: CLIENTE_BELTRAN,
  clienteNavarro: CLIENTE_NAVARRO,
  clienteRequena: CLIENTE_REQUENA,
  clienteServer: CLIENTE_SERVER,
  clienteTormo: CLIENTE_TORMO,

  personaCarlos: PERSONA_CARLOS,
  personaMarta: PERSONA_MARTA,
  personaLucia: PERSONA_LUCIA,
  personaHugo: PERSONA_HUGO,
  personaAmparo: PERSONA_AMPARO,
  personaVicent: PERSONA_VICENT,
  personaJorge: PERSONA_JORGE,
  personaElena: PERSONA_ELENA,
  personaRamon: PERSONA_RAMON,
  personaPilar: PERSONA_PILAR,
  personaNuria: PERSONA_NURIA,
  personaClara: PERSONA_CLARA,
  personaAndreu: PERSONA_ANDREU,
  personaCarmen: PERSONA_CARMEN,
  personaLluis: PERSONA_LLUIS,

  sociedadGarciaConsulting: SOCIEDAD_GC,
  sociedadBeltranHolding: SOCIEDAD_BELTRAN,

  fondoA: FONDO_A,
  planCarlos: PLAN_CARLOS,
  planMarta: PLAN_MARTA,
  inmuebleJavea: INMUEBLE_JAVEA,
  pasivoHipoteca: PASIVO_HIPOTECA,
  otroAudi: OTRO_AUDI,

  fondoBeltranCaixaRv: FONDO_BELTRAN_CAIXA_RV,
  fondoBeltranCaixaMixto: FONDO_BELTRAN_CAIXA_MIXTO,
  fondoBeltranCaixaRf: FONDO_BELTRAN_CAIXA_RF,
  fondoBeltranCaixaEmergentes: FONDO_BELTRAN_CAIXA_EMERGENTES,
  fondoBeltranCaixaMonetario: FONDO_BELTRAN_CAIXA_MONETARIO,
  fondoBeltranSantRvUsa: FONDO_BELTRAN_SANT_RV_USA,
  fondoBeltranSantSmall: FONDO_BELTRAN_SANT_SMALL,
  fondoBeltranSantRf: FONDO_BELTRAN_SANT_RF,
  fondoBeltranSantIndexado: FONDO_BELTRAN_SANT_INDEXADO,
  fondoBeltranSantLiquidez: FONDO_BELTRAN_SANT_LIQUIDEZ,
  inmuebleBeltranVivienda: INMUEBLE_BELTRAN_VIVIENDA,
  inmuebleBeltranLocal: INMUEBLE_BELTRAN_LOCAL,
  otroBeltranCoche: OTRO_BELTRAN_COCHE,
  pasivoBeltranHipoteca: PASIVO_BELTRAN_HIPOTECA,
  pasivoBeltranLocal: PASIVO_BELTRAN_LOCAL,
  pasivoBeltranLocalReforma: PASIVO_BELTRAN_LOCAL_REFORMA,

  inmuebleNavarroVivienda: INMUEBLE_NAVARRO_VIVIENDA,
  inmuebleNavarroCosta: INMUEBLE_NAVARRO_COSTA,
  fondoNavarro: FONDO_NAVARRO,
  planRamon: PLAN_RAMON,
  otroNavarroEfectivo: OTRO_NAVARRO_EFECTIVO,

  inmuebleRequenaVivienda: INMUEBLE_REQUENA_VIVIENDA,
  fondoRequenaRv: FONDO_REQUENA_RV,
  fondoRequenaRf: FONDO_REQUENA_RF,
  fondoRequenaIndexado: FONDO_REQUENA_INDEXADO,
  planVicent: PLAN_VICENT,
  otroRequenaCoche: OTRO_REQUENA_COCHE,
  pasivoRequenaHipoteca: PASIVO_REQUENA_HIPOTECA,
  pasivoRequenaCredito: PASIVO_REQUENA_CREDITO,

  inmuebleServerVivienda: INMUEBLE_SERVER_VIVIENDA,
  inmuebleServerRussafa: INMUEBLE_SERVER_RUSSAFA,
  inmuebleServerPueblo: INMUEBLE_SERVER_PUEBLO,
  inmuebleServerLocal: INMUEBLE_SERVER_LOCAL,
  fondoServer: FONDO_SERVER,

  inmuebleTormoVivienda: INMUEBLE_TORMO_VIVIENDA,
  fondoTormo: FONDO_TORMO,
  planLluis: PLAN_LLUIS,
  otroTormoCoche: OTRO_TORMO_COCHE,
  otroTormoColeccion: OTRO_TORMO_COLECCION,
  pasivoTormoHipoteca: PASIVO_TORMO_HIPOTECA,

  escBase: ESC_BASE,
  escA: ESC_A,
  escB: ESC_B,
  escC: ESC_C,
  escD: ESC_D,
  escE: ESC_E,
  escF: ESC_F,
  escBeltranBase: ESC_BELTRAN_BASE,
  escBeltranA: ESC_BELTRAN_A,
  escNavarroBase: ESC_NAVARRO_BASE,
  escNavarroA: ESC_NAVARRO_A,
  escRequenaBase: ESC_REQUENA_BASE,
  escRequenaA: ESC_REQUENA_A,
  escServerBase: ESC_SERVER_BASE,
  escServerA: ESC_SERVER_A,
  escTormoBase: ESC_TORMO_BASE,
  escTormoA: ESC_TORMO_A,
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
    titulo: "Comparación · A Reembolso vs B Pignoración",
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

/**
 * Alternativas montadas (P1): escenarios con al menos un evento.
 * El plan base ("Situación actual") no cuenta nunca — tenga eventos o no.
 * Las jubilaciones del expediente viven ahí; la columna mide exploración del asesor.
 */
export function countEscenariosConEventos(
  escenarios: Array<{ id: string; eventoIds: string[]; esPlanBase?: boolean }>,
  eventos: Array<{ escenarioId: string }> = [],
): number {
  return escenarios.filter((e) => {
    if (e.esPlanBase) return false;
    if (e.eventoIds.length > 0) return true;
    return eventos.some((ev) => ev.escenarioId === e.id);
  }).length;
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
