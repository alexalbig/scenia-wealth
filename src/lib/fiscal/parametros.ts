/**
 * Tabla de parámetros fiscales — SOLO datos, sin lógica.
 * Indexada por (año, CCAA) donde aplica.
 *
 * Ninguna cifra fiscal puede vivir fuera de este módulo.
 * Todos los parámetros quedan en 'a-verificar' hasta confirmación del fiscalista.
 *
 * Las cuotas íntegras acumuladas NO se guardan: se derivan de (hasta, tipo)
 * en tiempo de cálculo (`cuotasAcumuladasDerivadas` / `cuotaEscala`).
 */

export type ParametroEstado = "verificado" | "a-verificar";

export interface ParametroFiscal<T = number> {
  valor: T;
  fuente: string;
  fechaConsulta: string;
  estado: ParametroEstado;
}

/** Fila de una escala oficial — solo tramos y tipos (sin cuota acumulada). */
export interface TramoEscala {
  /** Límite superior de la base liquidable (null = resto). */
  hasta: number | null;
  /** Tipo marginal (fracción, p. ej. 0,095). */
  tipo: number;
}

/** Vigencia de una escala por ejercicio. */
interface EscalaPorVigencia {
  /** Primer ejercicio de aplicación (incluido). */
  desdeAnio: number;
  /** Último ejercicio (incluido); null = vigente en adelante. */
  hastaAnio: number | null;
  escala: ParametroFiscal<TramoEscala[]>;
}

const FECHA = "2026-08-01";
const AV = "a-verificar" as const;

function p<T>(
  valor: T,
  fuente: string,
  estado: ParametroEstado = AV,
  fechaConsulta: string = FECHA,
): ParametroFiscal<T> {
  return { valor, fuente, fechaConsulta, estado };
}

/** Escala estatal base general · art. 63.1 LIRPF (AEAT Manual Renta 2025). */
const ESCALA_ESTATAL_GENERAL: TramoEscala[] = [
  { hasta: 12_450, tipo: 0.095 },
  { hasta: 20_200, tipo: 0.12 },
  { hasta: 35_200, tipo: 0.15 },
  { hasta: 60_000, tipo: 0.185 },
  { hasta: 300_000, tipo: 0.225 },
  { hasta: null, tipo: 0.245 },
];

/**
 * Escala autonómica CV · Ley 13/1997 art. 2, redacción DF primera.1 Ley 9/2022
 * (vigencia desde 2023 · AEAT Manual / hisenda.gva).
 *
 * Cortes: 12k · 22k · 32k · 42k · 52k · 62k · 72k · 100k · 150k · 200k · resto.
 * (El DL 14/2022 usó 65k/80k solo para el ejercicio 2022 — no aplica aquí.)
 *
 * Reforma 2026 (rebaja de tipos): solo ANTEPROYECTO · NO publicada en DOGV · no incorporada.
 */
const ESCALA_CV_GENERAL: TramoEscala[] = [
  { hasta: 12_000, tipo: 0.09 },
  { hasta: 22_000, tipo: 0.12 },
  { hasta: 32_000, tipo: 0.15 },
  { hasta: 42_000, tipo: 0.175 },
  { hasta: 52_000, tipo: 0.2 },
  { hasta: 62_000, tipo: 0.225 },
  { hasta: 72_000, tipo: 0.25 },
  { hasta: 100_000, tipo: 0.265 },
  { hasta: 150_000, tipo: 0.275 },
  { hasta: 200_000, tipo: 0.285 },
  { hasta: null, tipo: 0.295 },
];

/**
 * Mitad estatal del ahorro · art. 66 LIRPF (Ley 7/2024 DF 7ª, efectos 1-ene-2025).
 */
const ESCALA_AHORRO_ESTATAL: TramoEscala[] = [
  { hasta: 6_000, tipo: 0.095 },
  { hasta: 50_000, tipo: 0.105 },
  { hasta: 200_000, tipo: 0.115 },
  { hasta: 300_000, tipo: 0.135 },
  { hasta: null, tipo: 0.15 },
];

/** Mitad autonómica del ahorro · art. 76 LIRPF (misma Ley 7/2024). */
const ESCALA_AHORRO_AUTONOMICA: TramoEscala[] = [
  { hasta: 6_000, tipo: 0.095 },
  { hasta: 50_000, tipo: 0.105 },
  { hasta: 200_000, tipo: 0.115 },
  { hasta: 300_000, tipo: 0.135 },
  { hasta: null, tipo: 0.15 },
];

const FUENTE_ESTATAL_G =
  "Ley 35/2006 art. 63.1 · AEAT Manual Renta 2025 (gravamen estatal) · https://sede.agenciatributaria.gob.es/";
const FUENTE_CV_G =
  "Ley 13/1997 art. 2 · redacción DF primera.1 Ley 9/2022 (vigencia desde 2023) · Hacienda Cap. IV tributación autonómica 2026. Reforma 2026: solo anteproyecto — no DOGV.";
const FUENTE_AHORRO =
  "Ley 35/2006 arts. 66 y 76 · Ley 7/2024 DF 7ª (efectos 1-ene-2025) · AEAT novedades normativa 2024";

export const PARAMETROS = {
  escalaEstatalGeneral: p(ESCALA_ESTATAL_GENERAL, FUENTE_ESTATAL_G),
  escalaAutonomicaCV: p(ESCALA_CV_GENERAL, FUENTE_CV_G),
  escalaAhorroEstatal: p(ESCALA_AHORRO_ESTATAL, FUENTE_AHORRO),
  escalaAhorroAutonomica: p(ESCALA_AHORRO_AUTONOMICA, FUENTE_AHORRO),
  minimoContribuyente: p(
    5_550,
    "Ley 35/2006 art. 57.1 · AEAT Manual Renta 2025 (mínimo del contribuyente)",
  ),
  minimoContribuyenteMas65: p(
    1_150,
    "Ley 35/2006 art. 57.2 · AEAT Manual Renta 2025",
  ),
  minimoContribuyenteMas75: p(
    1_400,
    "Ley 35/2006 art. 57.2 · AEAT Manual Renta 2025",
  ),
  /**
   * Hueco: CV tiene mínimos autonómicos propios (Ley 13/1997 art. 2 bis · Ley 9/2022).
   * Sin importes verificados en DOGV → el gravamen autonómico usa el mínimo estatal
   * como simplificación declarada (ver parametros-fiscales-pendientes.md).
   */
  minimoAutonomicoCVUsaEstatal: p(
    true,
    "Simplificación declarada · mínimos autonómicos CV (art. 2 bis Ley 13/1997) pendientes de verificar en DOGV",
  ),
  /** Edad a partir de la cual aplica el incremento art. 57.2 (primer tramo). */
  umbralEdadMas65: p(
    65,
    "Ley 35/2006 art. 57.2 · «edad superior a 65 años»",
  ),
  /** Edad a partir de la cual aplica el incremento adicional art. 57.2. */
  umbralEdadMas75: p(
    75,
    "Ley 35/2006 art. 57.2 · «edad superior a 75 años»",
  ),
  reduccion40PlanesPre2007: p(
    0.4,
    "LIRPF DT 12ª · AEAT Manual Renta 2025 (régimen transitorio prestaciones capital)",
  ),
  reduccion40SoloFormaCapital: p(
    true,
    "LIRPF DT 12ª · AEAT Manual Renta 2025 — solo prestaciones en forma de capital",
  ),
  reduccion40AportacionesHasta: p(
    "2006-12-31",
    "LIRPF DT 12ª · AEAT Manual Renta 2025 — aportaciones hasta 31/12/2006",
  ),
  exencionReinversionRentaVitaliciaLimite: p(
    240_000,
    "Ley 35/2006 art. 38.3 · AEAT Manual Renta 2025",
  ),
  exencionReinversionPlazoMeses: p(
    6,
    "Ley 35/2006 art. 38.3 · AEAT Manual Renta 2025",
  ),
  /** Art. 19.2.f) LIRPF · otros gastos distintos · 2.000 € anuales. */
  gastoOtrosTrabajoArt19: p(
    2_000,
    "Ley 35/2006 art. 19.2.f) · AEAT Manual Renta 2025 (fase 2 rendimiento neto del trabajo)",
  ),
  /**
   * Art. 20 LIRPF · reducción por obtención de rendimientos del trabajo
   * (redacción RDL 4/2024, efectos desde 1-ene-2024). Solo si RNT < tope.
   */
  reduccionTrabajoTopeRNT: p(
    19_747.5,
    "Ley 35/2006 art. 20 · redacción RDL 4/2024 art. 3.Uno · AEAT Manual Renta 2024/2025",
  ),
  reduccionTrabajoOtrasRentasMax: p(
    6_500,
    "Ley 35/2006 art. 20 · otras rentas (no exentas) distintas del trabajo ≤ 6.500 €",
  ),
  reduccionTrabajoTramo1Hasta: p(
    14_852,
    "Ley 35/2006 art. 20.a) · RDL 4/2024",
  ),
  reduccionTrabajoTramo1Cuantia: p(
    7_302,
    "Ley 35/2006 art. 20.a) · RDL 4/2024",
  ),
  reduccionTrabajoTramo2Hasta: p(
    17_673.52,
    "Ley 35/2006 art. 20.b) · RDL 4/2024",
  ),
  reduccionTrabajoTramo2Coef: p(
    1.75,
    "Ley 35/2006 art. 20.b) · RDL 4/2024",
  ),
  reduccionTrabajoTramo3Cuantia: p(
    2_364.34,
    "Ley 35/2006 art. 20.c) · RDL 4/2024",
  ),
  reduccionTrabajoTramo3Coef: p(
    1.14,
    "Ley 35/2006 art. 20.c) · RDL 4/2024",
  ),
  /**
   * Art. 52.1 LIRPF · límite conjunto aportaciones previsión social.
   * Redacción vigente (PGE 2023 / AEAT Manual Renta 2025): 1.500 € o 30 % RNT.
   * El incremento +8.500 € por contribuciones empresariales no se aplica
   * al plan individual del partícipe sin aportación de empresa.
   */
  aportacionPlanLimiteEuros: p(
    1_500,
    "Ley 35/2006 art. 52.1.b) · redacción vigente · AEAT Manual Renta 2025 §8.2.2.6",
  ),
  aportacionPlanLimitePctRNT: p(
    0.3,
    "Ley 35/2006 art. 52.1.a) · 30 % de rendimientos netos del trabajo y actividades económicas · AEAT Manual Renta 2025",
  ),
  aportacionPlanIncrementoEmpresarial: p(
    8_500,
    "Ley 35/2006 art. 52.1 · incremento máx. por contribuciones empresariales / aportaciones al mismo instrumento · AEAT Manual Renta 2025",
  ),
  /**
   * Horizonte de referencia del comparador (producto).
   * La fila fiscal ya no acumula el periodo — solo el primer ejercicio.
   * Hasta 2036 para que la demo D · Venta Jávea 2036 entre en la fila.
   */
  periodoFilaFiscalDesde: p(2026, "Spec producto CT2 · horizonte de referencia"),
  periodoFilaFiscalHasta: p(2036, "Spec producto CT2 · horizonte de referencia · demo art. 33.4.b)"),
} as const;

export type ParametroKey = keyof typeof PARAMETROS;

/** Vigencias: el año del ejercicio selecciona la fila. */
const VIGENCIA_ESTATAL_GENERAL: EscalaPorVigencia[] = [
  {
    desdeAnio: 2025,
    hastaAnio: null,
    escala: PARAMETROS.escalaEstatalGeneral,
  },
];

const VIGENCIA_CV_GENERAL: EscalaPorVigencia[] = [
  {
    desdeAnio: 2023,
    hastaAnio: null,
    escala: PARAMETROS.escalaAutonomicaCV,
  },
];

const VIGENCIA_AHORRO_ESTATAL: EscalaPorVigencia[] = [
  {
    desdeAnio: 2025,
    hastaAnio: null,
    escala: PARAMETROS.escalaAhorroEstatal,
  },
];

const VIGENCIA_AHORRO_AUTONOMICA: EscalaPorVigencia[] = [
  {
    desdeAnio: 2025,
    hastaAnio: null,
    escala: PARAMETROS.escalaAhorroAutonomica,
  },
];

function escalaParaAnio(
  anio: number,
  vigencias: EscalaPorVigencia[],
): ParametroFiscal<TramoEscala[]> | null {
  for (const v of vigencias) {
    if (anio < v.desdeAnio) continue;
    if (v.hastaAnio != null && anio > v.hastaAnio) continue;
    return v.escala;
  }
  return null;
}

export function getEscalaEstatalGeneral(
  anio: number,
): ParametroFiscal<TramoEscala[]> {
  return (
    escalaParaAnio(anio, VIGENCIA_ESTATAL_GENERAL) ??
    PARAMETROS.escalaEstatalGeneral
  );
}

export function getEscalaAutonomicaGeneral(
  anio: number,
  ccaa: string,
): ParametroFiscal<TramoEscala[]> | null {
  if (ccaa !== "Comunitat Valenciana") return null;
  return escalaParaAnio(anio, VIGENCIA_CV_GENERAL);
}

export function getEscalaAhorroEstatal(
  anio: number,
): ParametroFiscal<TramoEscala[]> {
  return (
    escalaParaAnio(anio, VIGENCIA_AHORRO_ESTATAL) ??
    PARAMETROS.escalaAhorroEstatal
  );
}

export function getEscalaAhorroAutonomica(
  anio: number,
): ParametroFiscal<TramoEscala[]> {
  return (
    escalaParaAnio(anio, VIGENCIA_AHORRO_AUTONOMICA) ??
    PARAMETROS.escalaAhorroAutonomica
  );
}

export function parametrosUsadosEnMotor(): ParametroKey[] {
  return [
    "escalaEstatalGeneral",
    "escalaAutonomicaCV",
    "escalaAhorroEstatal",
    "escalaAhorroAutonomica",
    "minimoContribuyente",
    "minimoContribuyenteMas65",
    "minimoContribuyenteMas75",
    "minimoAutonomicoCVUsaEstatal",
    "umbralEdadMas65",
    "umbralEdadMas75",
    "reduccion40PlanesPre2007",
    "reduccion40SoloFormaCapital",
    "reduccion40AportacionesHasta",
    "exencionReinversionRentaVitaliciaLimite",
    "exencionReinversionPlazoMeses",
    "gastoOtrosTrabajoArt19",
    "reduccionTrabajoTopeRNT",
    "reduccionTrabajoOtrasRentasMax",
    "reduccionTrabajoTramo1Hasta",
    "reduccionTrabajoTramo1Cuantia",
    "reduccionTrabajoTramo2Hasta",
    "reduccionTrabajoTramo2Coef",
    "reduccionTrabajoTramo3Cuantia",
    "reduccionTrabajoTramo3Coef",
    "aportacionPlanLimiteEuros",
    "aportacionPlanLimitePctRNT",
    "aportacionPlanIncrementoEmpresarial",
    "periodoFilaFiscalDesde",
    "periodoFilaFiscalHasta",
  ];
}

export function algunParametroAVerificar(
  keys: ParametroKey[] = parametrosUsadosEnMotor(),
): boolean {
  return keys.some((k) => PARAMETROS[k].estado === "a-verificar");
}

export function listarParametrosParaDocumento(): Array<{
  key: string;
  valor: unknown;
  fuente: string;
  fechaConsulta: string;
  estado: ParametroEstado;
}> {
  return Object.entries(PARAMETROS).map(([key, meta]) => ({
    key,
    valor: meta.valor,
    fuente: meta.fuente,
    fechaConsulta: meta.fechaConsulta,
    estado: meta.estado,
  }));
}
