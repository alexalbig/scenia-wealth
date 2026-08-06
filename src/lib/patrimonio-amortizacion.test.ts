import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  amortizacionCapitalAnual,
  gastosAnualesConInteresDerivado,
  interesAnualPasivo,
} from "./patrimonio";
import type { Gasto, Pasivo, Titularidad } from "./types";

function titularSoloPersona(personaId: string): Titularidad[] {
  return [
    {
      owner: { kind: "persona", personaId },
      porcentaje: 1,
    },
  ];
}

function hipoteca({
  id,
  inmuebleId,
  cuotaMensual,
  capitalPendiente,
  tipoInteres,
}: {
  id: string;
  inmuebleId?: string;
  cuotaMensual: number;
  capitalPendiente: number;
  tipoInteres: number;
}): Pasivo {
  return {
    id,
    clienteId: "c",
    tipo: "hipoteca",
    prestamista: "Banco demo",
    capitalPendiente,
    tipoInteres,
    cuotaMensual,
    inmuebleId,
    titularidades: titularSoloPersona("p1"),
  };
}

describe("interesAnualPasivo / amortizacionCapitalAnual", () => {
  it("interés = capital × tipo", () => {
    const p = hipoteca({
      id: "h1",
      capitalPendiente: 180_000,
      tipoInteres: 0.029,
      cuotaMensual: 950,
    });
    assert.equal(interesAnualPasivo(p), 5_220);
  });

  it("cliente sin hipoteca: amortización 0", () => {
    assert.equal(amortizacionCapitalAnual([]), 0);
  });

  it("dos hipotecas: amortiza con interés derivado por pasivo", () => {
    const pasivos = [
      hipoteca({
        id: "h1",
        inmuebleId: "inm1",
        cuotaMensual: 1_000,
        capitalPendiente: 100_000,
        tipoInteres: 0.02, // 2.000
      }),
      hipoteca({
        id: "h2",
        inmuebleId: "inm2",
        cuotaMensual: 800,
        capitalPendiente: 50_000,
        tipoInteres: 0.02, // 1.000
      }),
    ];
    // (12.000 - 2.000) + (9.600 - 1.000) = 18.600
    assert.equal(amortizacionCapitalAnual(pasivos), 18_600);
  });

  it("capital a cero → interés 0 → amortización 0 (cuota irrelevante)", () => {
    const pasivos = [
      hipoteca({
        id: "h1",
        cuotaMensual: 1_000,
        capitalPendiente: 0,
        tipoInteres: 0.03,
      }),
    ];
    assert.equal(interesAnualPasivo(pasivos[0]!), 0);
    assert.equal(amortizacionCapitalAnual(pasivos), 0);
  });

  it("gastosAnualesConInteresDerivado ignora líneas de interés tecleadas", () => {
    const pasivos = [
      hipoteca({
        id: "h1",
        inmuebleId: "inm1",
        cuotaMensual: 950,
        capitalPendiente: 180_000,
        tipoInteres: 0.029,
      }),
    ];
    const gastos: Gasto[] = [
      {
        id: "g1",
        clienteId: "c",
        categoria: "Intereses de deuda",
        importeAnual: 99_999,
        vinculadoA: { kind: "inmueble", inmuebleId: "inm1" },
        origenInteres: "introducido_asesor",
      },
      {
        id: "g2",
        clienteId: "c",
        categoria: "Familia",
        importeAnual: 10_000,
      },
    ];
    const r = gastosAnualesConInteresDerivado(pasivos, gastos);
    assert.equal(r.gastosBaseSinIntereses, 10_000);
    assert.equal(r.interesesDerivados, 5_220);
    assert.equal(r.total, 15_220);
  });
});
