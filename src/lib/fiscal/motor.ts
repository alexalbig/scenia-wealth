/**
 * Motor fiscal de eventos — liquida con parámetros de parametros.ts.
 * No inventa cifras: si falta dato (p. ej. % pre-2007), no aplica el beneficio.
 */

import type { TipoEvento } from "@/lib/types";
import {
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
    }
  | {
      kind: "neutro";
      importe: 0;
      regla: string;
      nota: string;
      parametrosAVerificar: boolean;
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
  impactoManual?: number;
}

function marcaAVerificar(flag: boolean): string {
  return flag ? " · parámetros (a verificar)" : "";
}

export function simularMotorEvento(
  tipo: TipoEvento,
  ctx: ContextoFiscalEvento,
): ResultadoFiscalMotor {
  const anio = ctx.anio;
  const ccaa = ctx.ccaa || "Comunitat Valenciana";
  const paramsAV = algunParametroAVerificar();

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
          nota: "Faltan valor del fondo o importe del reembolso para estimar la plusvalía (FIFO).",
        };
      }
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
          `${Math.round(t.pct * 100)} % → ganancia ${Math.round(g)} € → cuota ${Math.round(c)} €`,
        );
      }
      const redondeada = Math.round(cuota);
      return {
        kind: "calculado",
        importe: redondeada,
        regla: "FIFO → base del ahorro",
        nota: `Plusvalía estimada (FIFO, ratio ${(ratio * 100).toFixed(1)} %) → base del ahorro · cuota ≈ ${redondeada.toLocaleString("es-ES")} €/año · orientativo${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
        desglose: partes.join(" · "),
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
        if (soloCapital && ctx.fraccionPre2007 != null && ctx.fraccionPre2007 > 0) {
          const reducible = importe * Math.min(1, ctx.fraccionPre2007);
          baseImponible = importe - reducible * pct;
          notaReduccion = `Reducción 40 % sobre ${(ctx.fraccionPre2007 * 100).toFixed(0)} % pre-2007 (DT 12ª)`;
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
          `base ${Math.round(base)} € + ${Math.round(parte)} € → Δ ${Math.round(c)} €`,
        );
      }
      const redondeada = Math.round(cuota);
      return {
        kind: "calculado",
        importe: redondeada,
        regla: "Base general",
        nota: `Base general · se apila sobre los ingresos del año · ${notaReduccion} · cuota ≈ ${redondeada.toLocaleString("es-ES")} €/año · orientativo${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
        desglose: partes.join(" · "),
      };
    }

    case "amortizar_hipoteca":
      return {
        kind: "sin_calculo",
        nota: "Regla ③ · la comparación amortizar vs invertir se muestra en el comparador, sin coronar ganador · orientativo",
      };

    case "vender_inmueble": {
      if (ctx.reinvierte) {
        const lim = PARAMETROS.exencionReinversionRentaVitaliciaLimite.valor;
        return {
          kind: "sin_calculo",
          nota: `Regla ⑤ · exención por reinversión >65 (art. 38.3 · límite ${lim.toLocaleString("es-ES")} €) · a verificar · sin cifra inventada`,
        };
      }
      const plusv = ctx.plusvaliaLatente ?? 0;
      if (plusv <= 0) {
        return {
          kind: "sin_calculo",
          nota: "Sin plusvalía latente conocida · no se inventa la ganancia",
        };
      }
      const cuota = Math.round(cuotaMarginalAhorro(0, plusv, anio));
      return {
        kind: "calculado",
        importe: cuota,
        regla: "Plusvalía → base del ahorro",
        nota: `Plusvalía → base del ahorro · cuota ≈ ${cuota.toLocaleString("es-ES")} € · orientativo${marcaAVerificar(paramsAV)}`,
        parametrosAVerificar: paramsAV,
      };
    }

    case "repartir_dividendo":
    case "vender_participacion":
      return {
        kind: "pendiente_is",
        nota: "Liquidador de Impuesto de Sociedades · pendiente de definir. No se inventan cifras.",
      };

    case "aportar_plan":
      return {
        kind: "sin_calculo",
        nota: "Fuera de las 5 reglas · genérico sin cálculo (candidata a regla ⑥ en V2)",
      };

    case "jubilarse":
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
    ccaa: "Comunitat Valenciana",
    baseGeneralTitular: 0,
    titularidades: [],
    importe: Number(campos.importe) || 0,
    modalidad: (campos.modalidad as "capital" | "renta" | "mixto") || "renta",
    reinvierte: Boolean(campos.reinvierte),
    impactoManual: Number(campos.impactoManual) || 0,
  });
}
