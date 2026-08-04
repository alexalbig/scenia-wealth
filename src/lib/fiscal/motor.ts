/**
 * Motor fiscal de eventos — liquida con parámetros de parametros.ts.
 * No inventa cifras: si falta dato (p. ej. % pre-2007), no aplica el beneficio.
 * Sin defaults silenciosos de CCAA.
 */

import { formatIntegerES } from "@/lib/format";
import type { TipoEvento, UsoInmueble } from "@/lib/types";
import { esRegimenForal } from "@/lib/types";
import { limiteAportacionPlanIndividual } from "./base-liquidable";
import {
  cuotaGeneralIRPF,
  cuotaMarginalAhorro,
  cuotaMarginalGeneral,
  minimoPersonalPorEdad,
} from "./escalas";
import {
  algunParametroAVerificar,
  PARAMETROS,
} from "./parametros";

export type ResultadoFiscalMotor =
  | {
      kind: "calculado";
      importe: number;
      regla: string;
      nota: string;
      parametrosAVerificar: boolean;
      desglose?: string;
      /**
       * Cifra orientativa que NO sigue el método legal completo
       * (p. ej. ratio único en lugar de FIFO art. 37.2).
       * No válida para autoliquidación — temporal hasta lotes.
       */
      estimacionNoAutoliquidable?: boolean;
      /**
       * Cálculo real sobre un dato introducido por el asesor
       * (p. ej. pensión estimada). No es «introducido» puro ni «parcial».
       */
      sobreDatoIntroducido?: string;
    }
  | {
      kind: "neutro";
      importe: 0;
      regla: string;
      nota: string;
      parametrosAVerificar: boolean;
      sobreDatoIntroducido?: string;
    }
  | { kind: "sin_calculo"; nota: string }
  | { kind: "pendiente_is"; nota: string };

export interface TitularFiscal {
  personaId: string;
  pct: number;
  baseGeneral: number;
  edad?: number;
}

export interface ContextoFiscalEvento {
  anio: number;
  /** CCAA del expediente — obligatoria; sin default a CV. */
  ccaa: string;
  /** Base general del titular principal (p. ej. dueño del plan). */
  baseGeneralTitular: number;
  titularidades: TitularFiscal[];
  valorActivo?: number;
  plusvaliaLatente?: number;
  costeAdquisicion?: number;
  importe?: number;
  hastaAnio?: number;
  modalidad?: "capital" | "renta" | "mixto";
  reinvierte?: boolean;
  /** Fracción de derechos correspondiente a aportaciones ≤ 31/12/2006. Desconocido → undefined. */
  fraccionPre2007?: number;
  /** Año de la contingencia (jubilación, etc.) · DT 12ª plazos. */
  anioContingencia?: number;
  /** Uso del inmueble · distingue art. 33.4.b) vs 38.3. */
  usoInmueble?: UsoInmueble;
  impactoManual?: number;
  /** Desglose legible bruto → liquidable (arts. 19/20) del titular principal. */
  notaBaseLiquidable?: string;
  /**
   * Rendimiento neto del trabajo antes de art. 20 (tras cotiz. + art. 19.2.f).
   * Sirve al límite % del art. 52 en aportaciones.
   */
  rendimientoNetoTrabajo?: number;
  /**
   * La base general incluye la pensión del evento «jubilarse»
   * (dato introducido por el asesor · no del expediente).
   */
  baseSobrePensionEstimada?: boolean;
}

const CCAA_COBERTURA_GENERAL = "Comunitat Valenciana";

function mensajeForal(ccaa: string): string {
  if (ccaa === "Comunidad Foral de Navarra") {
    return "La Comunidad Foral de Navarra tiene régimen fiscal propio; Scenia no cubre su normativa.";
  }
  if (ccaa === "País Vasco") {
    return "El País Vasco tiene régimen fiscal propio; Scenia no cubre su normativa.";
  }
  return "Régimen foral · Scenia no cubre su normativa.";
}

function ccaaAusenteOSinCoberturaGeneral(ccaa: string): string | null {
  if (!ccaa.trim()) {
    return "Falta la CCAA del expediente · no se liquida sin comunidad explícita.";
  }
  if (esRegimenForal(ccaa)) return mensajeForal(ccaa);
  if (ccaa !== CCAA_COBERTURA_GENERAL) {
    return "El cálculo fiscal de la base general solo está disponible para la Comunitat Valenciana.";
  }
  return null;
}

/** Bloqueo total (general + ahorro) para forales. */
function ccaaSinCoberturaAbsoluta(ccaa: string): string | null {
  if (!ccaa.trim()) {
    return "Falta la CCAA del expediente · no se liquida sin comunidad explícita.";
  }
  if (esRegimenForal(ccaa)) return mensajeForal(ccaa);
  return null;
}

/** Eventos que liquidan sobre base general (necesitan CV). */
function usaBaseGeneral(tipo: TipoEvento): boolean {
  return tipo === "rescatar_plan" || tipo === "aportar_plan";
}

/** Eventos que liquidan sobre base del ahorro (régimen común OK; forales no). */
function usaBaseAhorro(tipo: TipoEvento): boolean {
  return tipo === "reembolsar_fondo" || tipo === "vender_inmueble";
}

function marcaAVerificar(flag: boolean): string {
  return flag ? " · parámetros (a verificar)" : "";
}

/** Marca firewall · cálculo sobre pensión estimada (no inventa estilo nuevo). */
function marcaPensionEstimada(ctx: ContextoFiscalEvento): string {
  return ctx.baseSobrePensionEstimada
    ? " · calculado sobre una pensión estimada por el asesor"
    : "";
}

function sobreDatoIntroducidoDe(
  ctx: ContextoFiscalEvento,
): string | undefined {
  return ctx.baseSobrePensionEstimada
    ? "pensión estimada por el asesor"
    : undefined;
}

/**
 * Plazos DT 12ª tras Ley 26/2014 — si el rescate cae fuera, no hay 40 %.
 * - Contingencias ≥ 2015: ejercicio de la contingencia + 2
 * - Contingencias 2011–2014: hasta el 8.º ejercicio siguiente
 * - Contingencias ≤ 2010: plazo terminado el 31/12/2018
 */
export function reduccion40EnPlazo(
  anioContingencia: number,
  anioRescate: number,
): { ok: boolean; motivo: string } {
  if (!Number.isFinite(anioContingencia) || anioContingencia <= 0) {
    return {
      ok: false,
      motivo:
        "Falta el año de la contingencia · no se aplica la reducción 40 % (DT 12ª)",
    };
  }
  if (anioContingencia <= 2010) {
    return {
      ok: false,
      motivo:
        "Reducción 40 % no aplicada: contingencias de 2010 o anteriores · plazo terminado el 31/12/2018 (DT 12ª)",
    };
  }
  if (anioContingencia >= 2011 && anioContingencia <= 2014) {
    const limite = anioContingencia + 8;
    if (anioRescate > limite) {
      return {
        ok: false,
        motivo: `Reducción 40 % no aplicada: contingencia ${anioContingencia} · plazo hasta el ejercicio ${limite} (DT 12ª · Ley 26/2014)`,
      };
    }
    return {
      ok: true,
      motivo: `Contingencia ${anioContingencia} · dentro del plazo (hasta ${limite})`,
    };
  }
  // ≥ 2015
  const limite = anioContingencia + 2;
  if (anioRescate > limite) {
    return {
      ok: false,
      motivo: `Reducción 40 % no aplicada: contingencia ${anioContingencia} · plazo = contingencia + 2 ejercicios (hasta ${limite}; DT 12ª)`,
    };
  }
  if (anioRescate < anioContingencia) {
    return {
      ok: false,
      motivo: `Reducción 40 % no aplicada: el rescate (${anioRescate}) es anterior a la contingencia (${anioContingencia})`,
    };
  }
  return {
    ok: true,
    motivo: `Contingencia ${anioContingencia} · dentro del plazo (hasta ${limite})`,
  };
}

export function simularMotorEvento(
  tipo: TipoEvento,
  ctx: ContextoFiscalEvento,
): ResultadoFiscalMotor {
  const anio = ctx.anio;
  const ccaa = ctx.ccaa;
  const paramsAV = algunParametroAVerificar();
  const minSimplificado = PARAMETROS.minimoAutonomicoCVUsaEstatal.valor === true;
  const notaMinAut = minSimplificado
    ? " · gravamen autonómico con mínimo estatal (simplificación declarada)"
    : "";

  if (usaBaseGeneral(tipo)) {
    const bloqueo = ccaaAusenteOSinCoberturaGeneral(ccaa);
    if (bloqueo) {
      return { kind: "sin_calculo", nota: bloqueo };
    }
  }

  if (usaBaseAhorro(tipo)) {
    const bloqueo = ccaaSinCoberturaAbsoluta(ccaa);
    if (bloqueo) {
      return { kind: "sin_calculo", nota: bloqueo };
    }
  }

  switch (tipo) {
    case "reembolsar_fondo": {
      const importe = ctx.importe ?? 0;
      const valor = ctx.valorActivo ?? 0;
      const plusv =
        ctx.plusvaliaLatente ??
        (valor > 0 && ctx.costeAdquisicion != null
          ? Math.max(0, valor - ctx.costeAdquisicion)
          : 0);
      if (importe <= 0 || valor <= 0) {
        return {
          kind: "sin_calculo",
          nota: "Faltan valor del fondo o importe del reembolso para estimar la plusvalía.",
        };
      }
      // Temporal: ratio único ≠ FIFO art. 37.2. No válido para autoliquidación.
      const ratio = Math.min(1, Math.max(0, plusv / valor));
      const gananciaTotal = importe * ratio;
      const tits =
        ctx.titularidades.length > 0
          ? ctx.titularidades
          : [{ personaId: "?", pct: 1, baseGeneral: 0 }];

      let cuota = 0;
      const partes: string[] = [];
      for (const t of tits) {
        const g = gananciaTotal * t.pct;
        const c = cuotaMarginalAhorro(0, g, anio);
        cuota += c;
        partes.push(
          `${Math.round(t.pct * 100)} % → ganancia ${formatIntegerES(Math.round(g))} € → cuota ${formatIntegerES(Math.round(c))} €`,
        );
      }
      const redondeada = Math.round(cuota);
      return {
        kind: "calculado",
        importe: redondeada,
        regla: "Estimación ratio · no FIFO",
        nota: `Estimación por ratio plusvalía/valor (${(ratio * 100).toFixed(1)} %) · NO es el FIFO del art. 37.2 LIRPF · no válida para autoliquidación · cuota ≈ ${formatIntegerES(redondeada)} € · primer ejercicio · orientativo${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
        desglose: partes.join(" · "),
        estimacionNoAutoliquidable: true,
      };
    }

    case "traspasar_fondo":
      return {
        kind: "neutro",
        importe: 0,
        regla: "Art. 94",
        nota: `Neutro (Art. 94) · cuota 0 € · el destino hereda valor y fecha · orientativo${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
      };

    case "pignorar":
      return {
        kind: "neutro",
        importe: 0,
        regla: "Regla ④",
        nota: `No realiza plusvalía · cuota 0 € · coste financiero según entidad · orientativo${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
      };

    case "aportar_fondo":
    case "comprar_inmueble":
      return {
        kind: "neutro",
        importe: 0,
        regla: "Sin peaje IRPF",
        nota: `Sin consecuencia fiscal inmediata en IRPF · orientativo${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
      };

    case "rescatar_plan": {
      const importe = ctx.importe ?? 0;
      if (importe <= 0) {
        return {
          kind: "sin_calculo",
          nota: "Falta el importe del rescate.",
        };
      }
      const modalidad = ctx.modalidad ?? "renta";
      let baseImponible = importe;
      let notaReduccion =
        "Reducción 40 % no aplicada (rescate en renta o mixto · DT 12ª solo capital)";

      if (modalidad === "capital") {
        const soloCapital = PARAMETROS.reduccion40SoloFormaCapital.valor;
        const pct = PARAMETROS.reduccion40PlanesPre2007.valor;
        const plazo = reduccion40EnPlazo(
          ctx.anioContingencia ?? 0,
          anio,
        );
        if (!soloCapital) {
          notaReduccion =
            "Reducción 40 % no aplicada (configuración · solo forma de capital)";
        } else if (!plazo.ok) {
          notaReduccion = plazo.motivo;
        } else if (ctx.fraccionPre2007 != null && ctx.fraccionPre2007 > 0) {
          const reducible = importe * Math.min(1, ctx.fraccionPre2007);
          baseImponible = importe - reducible * pct;
          notaReduccion = `Reducción 40 % sobre ${(ctx.fraccionPre2007 * 100).toFixed(0)} % pre-2007 (DT 12ª · ${plazo.motivo} · dato introducido)`;
        } else {
          notaReduccion =
            "Reducción 40 % no aplicada: falta la fracción de aportaciones ≤ 31/12/2006 (hueco · no se inventa)";
        }
      }

      const tits =
        ctx.titularidades.length > 0
          ? ctx.titularidades
          : [
              {
                personaId: "titular",
                pct: 1,
                baseGeneral: ctx.baseGeneralTitular,
              },
            ];

      let cuota = 0;
      const partes: string[] = [];
      for (const t of tits) {
        const parte = baseImponible * t.pct;
        const base = t.baseGeneral;
        const min = minimoPersonalPorEdad(t.edad);
        const c = cuotaMarginalGeneral(base, parte, anio, ccaa, min);
        cuota += c;
        partes.push(
          `base ${formatIntegerES(Math.round(base))} € + ${formatIntegerES(Math.round(parte))} € → Δ ${formatIntegerES(Math.round(c))} €`,
        );
      }
      const redondeada = Math.round(cuota);
      const baseNota =
        ctx.notaBaseLiquidable != null
          ? `base liquidable (arts. 19/20) · ${ctx.notaBaseLiquidable}`
          : "base liquidable (arts. 19/20)";
      const sobre = sobreDatoIntroducidoDe(ctx);
      return {
        kind: "calculado",
        importe: redondeada,
        regla: "Base general",
        nota: `${baseNota} · se apila el rescate · ${notaReduccion} · cuota ≈ ${formatIntegerES(redondeada)} € · primer ejercicio · orientativo${marcaPensionEstimada(ctx)}${notaMinAut}${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
        desglose: partes.join(" · "),
        sobreDatoIntroducido: sobre,
      };
    }

    case "amortizar_hipoteca":
      return {
        kind: "sin_calculo",
        nota: "Regla ③ · la comparación amortizar vs invertir se muestra en el comparador, sin coronar ganador · orientativo",
      };

    case "vender_inmueble": {
      const uso = ctx.usoInmueble;
      const umbral65 = PARAMETROS.umbralEdadMas65.valor;
      const lim38 = PARAMETROS.exencionReinversionRentaVitaliciaLimite.valor;

      // Sin asumir: falta uso → no liquidar
      if (!uso) {
        return {
          kind: "sin_calculo",
          nota: "Falta el uso del inmueble (vivienda habitual / segunda residencia / alquiler / local) · necesario para distinguir art. 33.4.b) y art. 38.3 · no se asume",
        };
      }

      const tits = ctx.titularidades;
      if (tits.length === 0) {
        return {
          kind: "sin_calculo",
          nota: "Faltan titularidades del inmueble · no se liquida la plusvalía",
        };
      }
      const sinEdad = tits.filter(
        (t) => t.edad == null || !Number.isFinite(t.edad),
      );
      if (sinEdad.length > 0) {
        return {
          kind: "sin_calculo",
          nota: "Falta la fecha de nacimiento de al menos un titular · no se puede comprobar la edad ≥65 (art. 33.4.b) · no se asume",
        };
      }

      const plusv = ctx.plusvaliaLatente ?? 0;
      if (plusv <= 0) {
        return {
          kind: "sin_calculo",
          nota: "Sin plusvalía latente conocida · no se inventa la ganancia",
        };
      }

      /** Art. 33.4.b): vivienda habitual y edad ≥65 en el año de la venta. */
      const es334b = (t: TitularFiscal) =>
        uso === "vivienda_habitual" && (t.edad as number) >= umbral65;
      /** Art. 38.3: ≥65 + reinversión, cuando no aplica 33.4.b). */
      const es383 = (t: TitularFiscal) =>
        !es334b(t) &&
        (t.edad as number) >= umbral65 &&
        Boolean(ctx.reinvierte);

      const exentos334 = tits.filter(es334b);
      const pendientes38 = tits.filter(es383);
      const liquidables = tits.filter((t) => !es334b(t) && !es383(t));

      // Si hay cuota pendiente de art. 38.3 → aviso, sin inventar cifra
      if (pendientes38.length > 0) {
        const quien = pendientes38
          .map(
            (t) =>
              `${Math.round(t.pct * 100)} % (edad ${t.edad})`,
          )
          .join(" · ");
        const exentoNota =
          exentos334.length > 0
            ? ` · ${exentos334.map((t) => `${Math.round(t.pct * 100)} %`).join(" · ")} exento(s) art. 33.4.b)`
            : "";
        return {
          kind: "sin_calculo",
          nota: `Art. 38.3 · reinversión en renta vitalicia (límite ${formatIntegerES(lim38)} €) · titulares afectados: ${quien}${exentoNota} · requisitos art. 42 RIRPF pendientes de recoger en el flujo · sin cifra inventada`,
        };
      }

      // Todos exentos art. 33.4.b)
      if (exentos334.length === tits.length) {
        return {
          kind: "neutro",
          importe: 0,
          regla: "Art. 33.4.b)",
          nota: `Exención art. 33.4.b) LIRPF · vivienda habitual · todos los titulares ≥${umbral65} años en ${anio} · sin reinversión ni límite ${formatIntegerES(lim38)} € · cuota 0 € · orientativo${marcaAVerificar(paramsAV)}`,
          parametrosAVerificar: paramsAV,
        };
      }

      // Plusvalía gravable solo de titulares no exentos
      let gananciaGravable = 0;
      const partes: string[] = [];
      for (const t of liquidables) {
        const g = plusv * t.pct;
        gananciaGravable += g;
        const c = cuotaMarginalAhorro(0, g, anio);
        partes.push(
          `${Math.round(t.pct * 100)} % (edad ${t.edad}) → ganancia ${formatIntegerES(Math.round(g))} € → cuota ${formatIntegerES(Math.round(c))} €`,
        );
      }
      for (const t of exentos334) {
        partes.push(
          `${Math.round(t.pct * 100)} % (edad ${t.edad}) → exento art. 33.4.b)`,
        );
      }

      if (gananciaGravable <= 0) {
        return {
          kind: "neutro",
          importe: 0,
          regla: "Art. 33.4.b)",
          nota: `Exención art. 33.4.b) · sin ganancia gravable · orientativo${marcaAVerificar(paramsAV)}`,
          parametrosAVerificar: paramsAV,
        };
      }

      const cuota = Math.round(cuotaMarginalAhorro(0, gananciaGravable, anio));
      const mixtura =
        exentos334.length > 0
          ? ` · ${exentos334.map((t) => `${Math.round(t.pct * 100)} %`).join(" · ")} exento(s) art. 33.4.b)`
          : "";
      return {
        kind: "calculado",
        importe: cuota,
        regla:
          exentos334.length > 0
            ? "Plusvalía parcial · art. 33.4.b) mixto"
            : "Plusvalía → base del ahorro",
        nota: `Plusvalía gravable ${formatIntegerES(Math.round(gananciaGravable))} € → base del ahorro${mixtura} · cuota ≈ ${formatIntegerES(cuota)} € · primer ejercicio · orientativo${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
        desglose: partes.join(" · "),
      };
    }

    case "repartir_dividendo":
    case "vender_participacion":
      return {
        kind: "pendiente_is",
        nota: "Liquidador de Impuesto de Sociedades · pendiente de definir. No se inventan cifras.",
      };

    case "aportar_plan": {
      const aporte = ctx.importe ?? 0;
      if (aporte <= 0) {
        return {
          kind: "sin_calculo",
          nota: "Falta el importe de la aportación.",
        };
      }
      const tits =
        ctx.titularidades.length > 0
          ? ctx.titularidades
          : [
              {
                personaId: "titular",
                pct: 1,
                baseGeneral: ctx.baseGeneralTitular,
              },
            ];
      // Plan individual: límite art. 52 = min(1.500 €, 30 % RNT). Sin incremento empresarial.
      const rnt =
        ctx.rendimientoNetoTrabajo ??
        Math.max(0, ctx.baseGeneralTitular);
      const lim = limiteAportacionPlanIndividual(rnt);
      const aplicable = Math.min(aporte, lim.limite);
      const exceso = Math.max(0, aporte - lim.limite);

      let ahorro = 0;
      const partes: string[] = [];
      for (const t of tits) {
        const base = t.baseGeneral;
        const min = minimoPersonalPorEdad(t.edad);
        const reduccionTit = aplicable * t.pct;
        const baseTras = Math.max(0, base - reduccionTit);
        const cAntes = cuotaGeneralIRPF(base, anio, ccaa, min).total;
        const cDespues = cuotaGeneralIRPF(baseTras, anio, ccaa, min).total;
        const delta = Math.max(0, cAntes - cDespues);
        ahorro += delta;
        partes.push(
          `base ${formatIntegerES(Math.round(base))} € − ${formatIntegerES(Math.round(reduccionTit))} € → ahorro Δ ${formatIntegerES(Math.round(delta))} €`,
        );
      }
      const redondeada = Math.round(ahorro);
      const avisoExceso =
        exceso > 0
          ? ` · exceso ${formatIntegerES(Math.round(exceso))} € no reduce la base (límite art. 52 = ${formatIntegerES(Math.round(lim.limite))} €)`
          : "";
      const baseNota =
        ctx.notaBaseLiquidable != null
          ? ` · ${ctx.notaBaseLiquidable}`
          : "";
      const sobre = sobreDatoIntroducidoDe(ctx);
      return {
        kind: "calculado",
        // Ahorro fiscal = importe negativo en la fila (menos cuota)
        importe: -redondeada,
        regla: "Regla ⑥ · aportación plan",
        nota: `Regla ⑥ · aportación ${formatIntegerES(Math.round(aplicable))} € reduce la base liquidable general (límite art. 52: min(1.500 €, 30 % RNT) = ${formatIntegerES(Math.round(lim.limite))} €)${avisoExceso}${baseNota} · ahorro de cuota ≈ ${formatIntegerES(redondeada)} € · orientativo${marcaPensionEstimada(ctx)}${notaMinAut}${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
        desglose: partes.join(" · "),
        sobreDatoIntroducido: sobre,
      };
    }

    case "jubilarse":
      return {
        kind: "neutro",
        importe: 0,
        regla: "Ajuste de base",
        nota: `Sustituye ingresos de trabajo por la pensión estimada (introducida por el asesor) a partir de este año · sin cuota IRPF propia · orientativo${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
      };

    case "generico":
    default:
      return {
        kind: "sin_calculo",
        nota: "Sin cálculo fiscal del motor. Si hay impacto tecleado, queda marcado como introducido por el asesor.",
      };
  }
}

/** @deprecated Preferir simularMotorEvento(tipo, ctx). Compat Plantilla sin contexto rico. */
export function simularMotorEventoCampos(
  tipo: TipoEvento,
  campos: Record<string, string | number | boolean>,
): ResultadoFiscalMotor {
  return simularMotorEvento(tipo, {
    anio: Number(campos.anio) || 2026,
    ccaa: String(campos.ccaa ?? ""),
    baseGeneralTitular: 0,
    titularidades: [],
    importe: Number(campos.importe) || 0,
    modalidad: campos.modalidad as "capital" | "renta" | "mixto" | undefined,
    reinvierte: Boolean(campos.reinvierte),
    anioContingencia: Number(campos.anioContingencia) || undefined,
  });
}
