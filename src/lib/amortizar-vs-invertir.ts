/**
 * Regla ③ · Amortizar hipoteca vs invertir la misma cantidad.
 *
 * Amortizar es equivalente a una inversión libre de riesgo al tipo de la
 * hipoteca. Las dos patas son la misma operación con distinta tasa y distinto
 * grado de certeza. Capitalizan: X × ((1 + tasa)^n − 1).
 *
 * n es el plazo efectivo tras la amortización (la cuota se mantiene → la
 * hipoteca termina antes). No se inventa modalidad ni plazo ni rentabilidad.
 */

import type { Evento, ModalidadInteres, Pasivo } from "@/lib/types";

export type ComparacionAmortizarVsInvertir =
  | {
      kind: "comparacion";
      importe: number;
      /** Plazo restante declarado (ajustado al año del evento). */
      nDeclaradoAnios: number;
      /** Plazo tras amortizar manteniendo la cuota (≤ declarado). */
      nEfectivoAnios: number;
      tipoInteres: number;
      rentabilidadEscenario: number;
      interesContractualAhorrado: number;
      rendimientoEsperado: number;
    }
  | {
      kind: "no_aplicable";
      motivo: "tipo_no_fijo";
      modalidad: ModalidadInteres;
    }
  | {
      kind: "sin_datos";
      motivo:
        | "sin_modalidad"
        | "sin_plazo"
        | "sin_rentabilidad_escenario"
        | "importe_invalido"
        | "cuota_insuficiente"
        | "varios_pasivos";
      detalle?: string;
    };

/** Capitalización: X × ((1 + tasa)^n − 1). */
export function capitalizado(importe: number, tasa: number, nAnios: number): number {
  if (importe <= 0 || nAnios <= 0) return 0;
  if (tasa <= -1) return 0;
  return importe * (Math.pow(1 + tasa, nAnios) - 1);
}

/**
 * Meses restantes de una amortización francesa con cuota fija.
 * null si la cuota no cubre el interés del primer mes.
 */
export function mesesRestantesFrances(
  capital: number,
  tipoAnual: number,
  cuotaMensual: number,
): number | null {
  if (capital <= 0) return 0;
  if (cuotaMensual <= 0) return null;
  const r = tipoAnual / 12;
  if (r <= 0) {
    return Math.ceil(capital / cuotaMensual);
  }
  const interesMes = capital * r;
  if (cuotaMensual <= interesMes + 1e-9) return null;
  const ratio = 1 - (capital * r) / cuotaMensual;
  if (ratio <= 0) return null;
  return Math.log(ratio) / -Math.log(1 + r);
}

/**
 * Plazo efectivo en años tras amortizar `importe` manteniendo la cuota.
 * Acota por el plazo declarado ajustado al año del evento (no alarga).
 */
export function plazoEfectivoTrasAmortizar(
  pasivo: Pasivo,
  importeAmortizado: number,
  anioEvento: number,
  anioDatos: number,
): number | null {
  const declarado = pasivo.plazoRestanteAnios;
  if (declarado == null || !Number.isFinite(declarado) || declarado <= 0) {
    return null;
  }
  const nDeclarado = Math.max(0, declarado - (anioEvento - anioDatos));
  if (nDeclarado <= 0) return null;

  const capitalTras = Math.max(0, pasivo.capitalPendiente - importeAmortizado);
  if (capitalTras <= 0) {
    // Cancelación total: el horizonte es el plazo declarado restante.
    return nDeclarado;
  }

  const meses = mesesRestantesFrances(
    capitalTras,
    pasivo.tipoInteres,
    pasivo.cuotaMensual,
  );
  if (meses == null) return null;
  const nFrances = meses / 12;
  return Math.min(nDeclarado, nFrances);
}

export function compararAmortizarVsInvertir(opts: {
  pasivo: Pasivo;
  importe: number;
  anioEvento: number;
  anioDatos: number;
  rentabilidadEsperada: number | null | undefined;
}): ComparacionAmortizarVsInvertir {
  const { pasivo, importe, anioEvento, anioDatos, rentabilidadEsperada } = opts;

  if (!Number.isFinite(importe) || importe <= 0) {
    return { kind: "sin_datos", motivo: "importe_invalido" };
  }
  if (pasivo.modalidadInteres == null) {
    return { kind: "sin_datos", motivo: "sin_modalidad" };
  }
  if (pasivo.modalidadInteres !== "fijo") {
    return {
      kind: "no_aplicable",
      motivo: "tipo_no_fijo",
      modalidad: pasivo.modalidadInteres,
    };
  }
  if (
    pasivo.plazoRestanteAnios == null ||
    !Number.isFinite(pasivo.plazoRestanteAnios) ||
    pasivo.plazoRestanteAnios <= 0
  ) {
    return { kind: "sin_datos", motivo: "sin_plazo" };
  }
  if (
    rentabilidadEsperada == null ||
    !Number.isFinite(rentabilidadEsperada)
  ) {
    return { kind: "sin_datos", motivo: "sin_rentabilidad_escenario" };
  }

  const nDeclarado = Math.max(
    0,
    pasivo.plazoRestanteAnios - (anioEvento - anioDatos),
  );
  if (nDeclarado <= 0) {
    return { kind: "sin_datos", motivo: "sin_plazo" };
  }

  const n = plazoEfectivoTrasAmortizar(
    pasivo,
    Math.min(importe, pasivo.capitalPendiente),
    anioEvento,
    anioDatos,
  );
  if (n == null) {
    return { kind: "sin_datos", motivo: "cuota_insuficiente" };
  }

  const x = Math.min(importe, pasivo.capitalPendiente);
  return {
    kind: "comparacion",
    importe: x,
    nDeclaradoAnios: nDeclarado,
    nEfectivoAnios: n,
    tipoInteres: pasivo.tipoInteres,
    rentabilidadEscenario: rentabilidadEsperada,
    interesContractualAhorrado: capitalizado(x, pasivo.tipoInteres, n),
    rendimientoEsperado: capitalizado(x, rentabilidadEsperada, n),
  };
}

/**
 * Agrega eventos de amortizar de un camino para la tabla de hechos.
 * Misma hipoteca → suma importes. Distintos pasivos → no compara (explícito).
 */
export function compararAmortizarDeCamino(opts: {
  eventos: Evento[];
  pasivos: Pasivo[];
  anioDatos: number;
  rentabilidadEsperada: number | null | undefined;
}): ComparacionAmortizarVsInvertir | null {
  const amortizaciones = opts.eventos
    .filter((e) => e.tipo === "amortizar_hipoteca")
    .sort((a, b) => a.anio - b.anio || a.id.localeCompare(b.id));
  if (amortizaciones.length === 0) return null;

  const targetIds = [
    ...new Set(
      amortizaciones
        .map((e) => e.targetId)
        .filter((id): id is string => !!id),
    ),
  ];
  if (targetIds.length === 0) {
    return {
      kind: "sin_datos",
      motivo: "importe_invalido",
      detalle: "Los eventos de amortizar no tienen pasivo objetivo",
    };
  }
  if (targetIds.length > 1) {
    return {
      kind: "sin_datos",
      motivo: "varios_pasivos",
      detalle:
        "Varios pasivos distintos en el camino · no se agrega en silencio",
    };
  }

  const pasivoId = targetIds[0]!;
  const pasivo = opts.pasivos.find((p) => p.id === pasivoId);
  if (!pasivo) {
    return {
      kind: "sin_datos",
      motivo: "importe_invalido",
      detalle: "Pasivo del evento no encontrado en el expediente",
    };
  }

  let importe = 0;
  let anioEvento = amortizaciones[0]!.anio;
  for (const ev of amortizaciones) {
    const x = ev.importe ?? 0;
    if (!Number.isFinite(x) || x <= 0) continue;
    importe += x;
    anioEvento = Math.min(anioEvento, ev.anio);
  }
  if (importe <= 0) {
    return { kind: "sin_datos", motivo: "importe_invalido" };
  }

  return compararAmortizarVsInvertir({
    pasivo,
    importe,
    anioEvento,
    anioDatos: opts.anioDatos,
    rentabilidadEsperada: opts.rentabilidadEsperada,
  });
}

export function textoMotivoComparacion(
  r: ComparacionAmortizarVsInvertir,
): string {
  if (r.kind === "no_aplicable") {
    return "Comparación no aplicable: el tipo no es contractual fijo";
  }
  if (r.kind === "sin_datos") {
    switch (r.motivo) {
      case "sin_modalidad":
        return "Falta la modalidad del tipo de interés del pasivo";
      case "sin_plazo":
        return "Falta el plazo restante del pasivo";
      case "sin_rentabilidad_escenario":
        return "El escenario no declara rentabilidad esperada";
      case "importe_invalido":
        return r.detalle ?? "Importe de amortización no válido";
      case "cuota_insuficiente":
        return "La cuota no cubre el interés · no se estima el plazo efectivo";
      case "varios_pasivos":
        return (
          r.detalle ??
          "Varios pasivos distintos · no se compara sin elegir uno"
        );
    }
  }
  return "";
}
