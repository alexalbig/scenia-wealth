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

const FECHA = "2026-07-29";
const AV = "a-verificar" as const;

function p<T>(
  valor: T,
  fuente: string,
  estado: ParametroEstado = AV,
): ParametroFiscal<T> {
  return { valor, fuente, fechaConsulta: FECHA, estado };
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
 * Escala autonómica CV · Ley 13/1997 art. 2 (texto hisenda.gva.es a 1-ene-2024).
 * Posible reforma 2026 en prensa — no incorporada; queda a-verificar.
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
 * AEAT: novedades normativa 2024.
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

/**
 * Aproximación UI (estatal+CV sumados) para el visor de tramos del mockup.
 * NO es tarifa oficial — solo composición visual.
 */
const ESCALA_GENERAL_DISPLAY: Array<{ desde: number; hasta: number; tipo: number }> = [
  { desde: 0, hasta: 12_450, tipo: 0.19 },
  { desde: 12_450, hasta: 20_200, tipo: 0.24 },
  { desde: 20_200, hasta: 35_200, tipo: 0.3 },
  { desde: 35_200, hasta: 60_000, tipo: 0.37 },
  { desde: 60_000, hasta: 300_000, tipo: 0.45 },
  { desde: 300_000, hasta: Infinity, tipo: 0.47 },
];

const ESCALA_AHORRO_DISPLAY: Array<{ desde: number; hasta: number; tipo: number }> = [
  { desde: 0, hasta: 6_000, tipo: 0.19 },
  { desde: 6_000, hasta: 50_000, tipo: 0.21 },
  { desde: 50_000, hasta: 200_000, tipo: 0.23 },
  { desde: 200_000, hasta: 300_000, tipo: 0.27 },
  { desde: 300_000, hasta: Infinity, tipo: 0.3 },
];

const FUENTE_ESTATAL_G =
  "Ley 35/2006 art. 63.1 · AEAT Manual Renta 2025 (gravamen estatal) · https://sede.agenciatributaria.gob.es/";
const FUENTE_CV_G =
  "Ley 13/1997 art. 2 (CV) · texto actualizado a 1-ene-2024 (hisenda.gva.es). Posible reforma 2026 no incorporada.";
const FUENTE_AHORRO =
  "Ley 35/2006 arts. 66 y 76 · Ley 7/2024 DF 7ª (efectos 1-ene-2025) · AEAT novedades normativa 2024";

export const PARAMETROS = {
  escalaEstatalGeneral: p(ESCALA_ESTATAL_GENERAL, FUENTE_ESTATAL_G),
  escalaAutonomicaCV: p(ESCALA_CV_GENERAL, FUENTE_CV_G),
  escalaAhorroEstatal: p(ESCALA_AHORRO_ESTATAL, FUENTE_AHORRO),
  escalaAhorroAutonomica: p(ESCALA_AHORRO_AUTONOMICA, FUENTE_AHORRO),
  escalaGeneralDisplayCV: p(
    ESCALA_GENERAL_DISPLAY,
    "Aproximación UI mockup (suma orientativa estatal+CV) · NO es tarifa oficial",
  ),
  escalaAhorroDisplay: p(
    ESCALA_AHORRO_DISPLAY,
    "Aproximación UI (suma mitades art. 66+76) · Ley 7/2024 último tramo 30 %",
  ),
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
  /** Horizonte de la fila fiscal CT2 — decisión de producto, no norma. */
  periodoFilaFiscalDesde: p(2026, "Spec producto CT2 · horizonte comparador"),
  periodoFilaFiscalHasta: p(2033, "Spec producto CT2 · horizonte comparador"),
} as const;

export type ParametroKey = keyof typeof PARAMETROS;

export function getEscalaEstatalGeneral(
  _anio: number,
): ParametroFiscal<TramoEscala[]> {
  return PARAMETROS.escalaEstatalGeneral;
}

export function getEscalaAutonomicaGeneral(
  _anio: number,
  ccaa: string,
): ParametroFiscal<TramoEscala[]> | null {
  if (ccaa !== "Comunitat Valenciana") return null;
  return PARAMETROS.escalaAutonomicaCV;
}

export function getEscalaAhorroEstatal(
  _anio: number,
): ParametroFiscal<TramoEscala[]> {
  return PARAMETROS.escalaAhorroEstatal;
}

export function getEscalaAhorroAutonomica(
  _anio: number,
): ParametroFiscal<TramoEscala[]> {
  return PARAMETROS.escalaAhorroAutonomica;
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
