import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  capitalizado,
  compararAmortizarDeCamino,
  compararAmortizarVsInvertir,
  mesesRestantesFrances,
  plazoEfectivoTrasAmortizar,
} from "@/lib/amortizar-vs-invertir";
import type { Evento, Pasivo } from "@/lib/types";

function hipotecaGL(over?: Partial<Pasivo>): Pasivo {
  return {
    id: "pasivo-hipoteca-javea",
    clienteId: "cliente-garcia-llorente",
    tipo: "hipoteca",
    prestamista: "Banco Levante",
    capitalPendiente: 180_000,
    tipoInteres: 0.029,
    cuotaMensual: 950,
    modalidadInteres: "fijo",
    plazoRestanteAnios: 21,
    inmuebleId: "inm-javea",
    titularidades: [],
    ...over,
  };
}

describe("capitalizado", () => {
  it("X·((1+t)^n−1) · GL n=21 sin acortar", () => {
    // Comprobación de la forma: 50k · ((1,029)^21 − 1) ≈ 41.137
    const v = capitalizado(50_000, 0.029, 21);
    assert.ok(Math.abs(v - 41_137) < 5, `got ${v}`);
    assert.ok(Math.abs(capitalizado(50_000, 0.04, 21) - 63_938) < 5);
    assert.ok(Math.abs(capitalizado(50_000, 0.02, 21) - 25_783) < 5);
  });
});

describe("plazo efectivo tras amortizar", () => {
  it("amortizar 50k acorta por debajo de 21 años (cuota constante)", () => {
    const p = hipotecaGL();
    const n0 = mesesRestantesFrances(180_000, 0.029, 950)! / 12;
    const nTras = plazoEfectivoTrasAmortizar(p, 50_000, 2026, 2026)!;
    assert.ok(n0 > 20 && n0 < 22, `plazo original ~21, got ${n0}`);
    assert.ok(nTras < 21, `debe acortar, got ${nTras}`);
    assert.ok(nTras > 10, `no debe colapsar, got ${nTras}`);
  });
});

describe("compararAmortizarVsInvertir", () => {
  it("hipoteca fija GL · 50k · usa n efectivo < 21", () => {
    const r = compararAmortizarVsInvertir({
      pasivo: hipotecaGL(),
      importe: 50_000,
      anioEvento: 2026,
      anioDatos: 2026,
      rentabilidadEsperada: 0.04,
    });
    assert.equal(r.kind, "comparacion");
    if (r.kind !== "comparacion") return;
    assert.equal(r.nDeclaradoAnios, 21);
    assert.ok(r.nEfectivoAnios < 21);
    assert.ok(r.interesContractualAhorrado < 41_137);
    assert.ok(r.rendimientoEsperado < 63_938);
    assert.ok(r.rendimientoEsperado > r.interesContractualAhorrado);
    // r=2 % → expectativa baja; certeza no cambia
    const r2 = compararAmortizarVsInvertir({
      pasivo: hipotecaGL(),
      importe: 50_000,
      anioEvento: 2026,
      anioDatos: 2026,
      rentabilidadEsperada: 0.02,
    });
    assert.equal(r2.kind, "comparacion");
    if (r2.kind !== "comparacion") return;
    assert.equal(r2.interesContractualAhorrado, r.interesContractualAhorrado);
    assert.ok(r2.rendimientoEsperado < r.rendimientoEsperado);
  });

  it("variable → no_aplicable", () => {
    const r = compararAmortizarVsInvertir({
      pasivo: hipotecaGL({ modalidadInteres: "variable" }),
      importe: 50_000,
      anioEvento: 2026,
      anioDatos: 2026,
      rentabilidadEsperada: 0.04,
    });
    assert.equal(r.kind, "no_aplicable");
  });

  it("sin plazo → sin_datos", () => {
    const r = compararAmortizarVsInvertir({
      pasivo: hipotecaGL({ plazoRestanteAnios: undefined }),
      importe: 50_000,
      anioEvento: 2026,
      anioDatos: 2026,
      rentabilidadEsperada: 0.04,
    });
    assert.equal(r.kind, "sin_datos");
    if (r.kind === "sin_datos") assert.equal(r.motivo, "sin_plazo");
  });

  it("sin rentabilidad del escenario → sin_datos (no fallback 4 %)", () => {
    const r = compararAmortizarVsInvertir({
      pasivo: hipotecaGL(),
      importe: 50_000,
      anioEvento: 2026,
      anioDatos: 2026,
      rentabilidadEsperada: undefined,
    });
    assert.equal(r.kind, "sin_datos");
    if (r.kind === "sin_datos")
      assert.equal(r.motivo, "sin_rentabilidad_escenario");
  });
});

describe("compararAmortizarDeCamino", () => {
  it("suma importes del mismo pasivo", () => {
    const pasivo = hipotecaGL();
    const eventos: Evento[] = [
      {
        id: "a",
        escenarioId: "e",
        tipo: "amortizar_hipoteca",
        anio: 2026,
        etiqueta: "Amortizar 20k",
        targetId: pasivo.id,
        importe: 20_000,
      },
      {
        id: "b",
        escenarioId: "e",
        tipo: "amortizar_hipoteca",
        anio: 2027,
        etiqueta: "Amortizar 30k",
        targetId: pasivo.id,
        importe: 30_000,
      },
    ];
    const r = compararAmortizarDeCamino({
      eventos,
      pasivos: [pasivo],
      anioDatos: 2026,
      rentabilidadEsperada: 0.04,
    });
    assert.equal(r?.kind, "comparacion");
    if (r?.kind !== "comparacion") return;
    assert.equal(r.importe, 50_000);
  });

  it("distintos pasivos → sin_datos varios_pasivos", () => {
    const a = hipotecaGL({ id: "h1" });
    const b = hipotecaGL({ id: "h2", capitalPendiente: 90_000 });
    const eventos: Evento[] = [
      {
        id: "a",
        escenarioId: "e",
        tipo: "amortizar_hipoteca",
        anio: 2026,
        etiqueta: "A",
        targetId: "h1",
        importe: 10_000,
      },
      {
        id: "b",
        escenarioId: "e",
        tipo: "amortizar_hipoteca",
        anio: 2026,
        etiqueta: "B",
        targetId: "h2",
        importe: 10_000,
      },
    ];
    const r = compararAmortizarDeCamino({
      eventos,
      pasivos: [a, b],
      anioDatos: 2026,
      rentabilidadEsperada: 0.04,
    });
    assert.equal(r?.kind, "sin_datos");
    if (r?.kind === "sin_datos") assert.equal(r.motivo, "varios_pasivos");
  });
});
