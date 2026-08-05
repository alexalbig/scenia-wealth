import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { amortizacionCapitalAnual } from "./patrimonio";
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
}: {
  id: string;
  inmuebleId?: string;
  cuotaMensual: number;
}): Pasivo {
  return {
    id,
    clienteId: "c",
    tipo: "hipoteca",
    prestamista: "Banco demo",
    capitalPendiente: 0,
    tipoInteres: 0.03,
    cuotaMensual,
    inmuebleId,
    titularidades: titularSoloPersona("p1"),
  };
}

function interesGasto({
  id,
  vinculadoInmuebleId,
  importeAnual,
}: {
  id: string;
  vinculadoInmuebleId?: string;
  importeAnual: number;
}): Gasto {
  return {
    id,
    clienteId: "c",
    categoria: "Intereses de deuda",
    importeAnual,
    vinculadoA:
      vinculadoInmuebleId != null
        ? { kind: "inmueble", inmuebleId: vinculadoInmuebleId }
        : null,
  };
}

describe("amortizacionCapitalAnual (capacidad de ahorro)", () => {
  it("cliente sin hipoteca: amortización 0", () => {
    const amort = amortizacionCapitalAnual(
      [],
      [interesGasto({ id: "g1", importeAnual: 2_000 })],
    );
    assert.equal(amort, 0);
  });

  it("dos hipotecas en inmuebles distintos: amortiza por hipoteca", () => {
    const pasivos = [
      hipoteca({ id: "h1", inmuebleId: "inm1", cuotaMensual: 1_000 }), // 12.000
      hipoteca({ id: "h2", inmuebleId: "inm2", cuotaMensual: 800 }), // 9.600
    ];
    const gastos = [
      interesGasto({ id: "gi1", vinculadoInmuebleId: "inm1", importeAnual: 2_000 }),
      interesGasto({ id: "gi2", vinculadoInmuebleId: "inm2", importeAnual: 1_000 }),
    ];
    const amort = amortizacionCapitalAnual(pasivos, gastos);
    // (12.000 - 2.000) + (9.600 - 1.000) = 18.600
    assert.equal(amort, 18_600);
  });

  it("hipoteca sin inmueble vinculado (crédito personal): amortización descuenta intereses no asignados", () => {
    const pasivos = [hipoteca({ id: "h1", cuotaMensual: 1_000 })]; // 12.000
    const gastos = [interesGasto({ id: "gi1", importeAnual: 2_000 })]; // no vinculado

    const amort = amortizacionCapitalAnual(pasivos, gastos);
    // 12.000 - 2.000 = 10.000
    assert.equal(amort, 10_000);
  });
});

