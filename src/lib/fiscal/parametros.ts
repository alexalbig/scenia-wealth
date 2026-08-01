/**
 * Tabla de parámetros fiscales — SOLO datos, sin lógica.
 * Indexada por (año, CCAA) donde aplica.
 *
 * Ninguna cifra fiscal puede vivir fuera de este módulo.
 * Todos los parámetros quedan en 'a-verificar' hasta confirmación del fiscalista.
 */

export type ParametroEstado = "verificado" | "a-verificar";

export interface ParametroFiscal<T = number> {
  valor: T;
  fuente: string;
  fechaConsulta: string;
  estado: ParametroEstado;
}

/** Fila de una escala oficial (formato AEAT / LIRPF). */
export interface TramoEscala {
  /** Límite superior de la base liquidable (null = resto). */
  hasta: number | null;
  /** Tipo marginal (fracción, p. ej. 0,095). */
  tipo: number;
  /** Cuota íntegra acumulada al inicio de este tramo. */
  cuotaAcumulada: number;
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
  { hasta: 12_450, tipo: 0.095, cuotaAcumulada: 0 },
  { hasta: 20_200, tipo: 0.12, cuotaAcumulada: 1_182.75 },
  { hasta: 35_200, tipo: 0.15, cuotaAcumulada: 2_112.75 },
  { hasta: 60_000, tipo: 0.185, cuotaAcumulada: 4_362.75 },
  { hasta: 300_000, tipo: 0.225, cuotaAcumulada: 8_950.75 },
  { hasta: null, tipo: 0.245, cuotaAcumulada: 62_950.75 },
];

/**
 * Escala autonómica CV · Ley 13/1997 art. 2, redacción DF primera.1 Ley 9/2022
 * (texto hisenda.gva / Hacienda estatal Cap. IV 2026 · vigencia desde 2023).
 *
 * Reforma 2026 (rebaja de tipos): solo en ANTEPROYECTO de Ley de Medidas 2026
 * (hisenda.gva.es). NO publicada en DOGV como ley — no incorporada.
 */
const ESCALA_CV_GENERAL: TramoEscala[] = [
  { hasta: 12_000, tipo: 0.09, cuotaAcumulada: 0 },
  { hasta: 22_000, tipo: 0.12, cuotaAcumulada: 1_080 },
  { hasta: 32_000, tipo: 0.15, cuotaAcumulada: 2_280 },
  { hasta: 42_000, tipo: 0.175, cuotaAcumulada: 3_780 },
  { hasta: 52_000, tipo: 0.2, cuotaAcumulada: 5_530 },
  { hasta: 62_000, tipo: 0.225, cuotaAcumulada: 7_530 },
  { hasta: 72_000, tipo: 0.25, cuotaAcumulada: 9_780 },
  { hasta: 100_000, tipo: 0.265, cuotaAcumulada: 12_280 },
  { hasta: 150_000, tipo: 0.275, cuotaAcumulada: 19_700 },
  { hasta: 200_000, tipo: 0.285, cuotaAcumulada: 33_450 },
  { hasta: null, tipo: 0.295, cuotaAcumulada: 47_700 },
];

/**
 * Mitad estatal del ahorro · art. 66 LIRPF (Ley 7/2024 DF 7ª, efectos 1-ene-2025).
 */
const ESCALA_AHORRO_ESTATAL: TramoEscala[] = [
  { hasta: 6_000, tipo: 0.095, cuotaAcumulada: 0 },
  { hasta: 50_000, tipo: 0.105, cuotaAcumulada: 570 },
  { hasta: 200_000, tipo: 0.115, cuotaAcumulada: 5_190 },
  { hasta: 300_000, tipo: 0.135, cuotaAcumulada: 22_440 },
  { hasta: null, tipo: 0.15, cuotaAcumulada: 35_940 },
];

/** Mitad autonómica del ahorro · art. 76 LIRPF (misma Ley 7/2024). */
const ESCALA_AHORRO_AUTONOMICA: TramoEscala[] = [
  { hasta: 6_000, tipo: 0.095, cuotaAcumulada: 0 },
  { hasta: 50_000, tipo: 0.105, cuotaAcumulada: 570 },
  { hasta: 200_000, tipo: 0.115, cuotaAcumulada: 5_190 },
  { hasta: 300_000, tipo: 0.135, cuotaAcumulada: 22_440 },
  { hasta: null, tipo: 0.15, cuotaAcumulada: 35_940 },
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
  /**
   * Horizonte de referencia del comparador (producto).
   * La fila fiscal ya no acumula el periodo — solo el primer ejercicio.
   */
  periodoFilaFiscalDesde: p(2026, "Spec producto CT2 · horizonte de referencia"),
  periodoFilaFiscalHasta: p(2033, "Spec producto CT2 · horizonte de referencia"),
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
    "umbralEdadMas65",
    "umbralEdadMas75",
    "reduccion40PlanesPre2007",
    "reduccion40SoloFormaCapital",
    "reduccion40AportacionesHasta",
    "exencionReinversionRentaVitaliciaLimite",
    "exencionReinversionPlazoMeses",
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
