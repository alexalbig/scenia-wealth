import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  desgloseBaseLiquidable,
  limiteAportacionPlanIndividual,
} from "./base-liquidable";
import { simularMotorEvento } from "./motor";

describe("base liquidable arts. 19/20", () => {
  it("Carlos 95.000 brutos → 93.000 liquidable (sin cotizaciones · art. 20 = 0)", () => {
    const d = desgloseBaseLiquidable({
      ingresosTrabajoBrutos: 95_000,
      cotizacionesSS: null,
    });
    assert.equal(d.bruto, 95_000);
    assert.equal(d.cotizacionesSS, 0);
    assert.equal(d.cotizacionesInformadas, false);
    assert.equal(d.gastosOtrosArt19, 2_000);
    assert.equal(d.reduccionArt20, 0);
    assert.equal(d.baseLiquidable, 93_000);
  });

  it("rescate 15.000 renta sobre 93.000 sale más barato que sobre 95.000", () => {
    const ctxBase = {
      anio: 2026,
      ccaa: "Comunitat Valenciana",
      titularidades: [
        { personaId: "carlos", pct: 1, baseGeneral: 93_000, edad: 58 },
      ],
      baseGeneralTitular: 93_000,
      importe: 15_000,
      modalidad: "renta" as const,
      notaBaseLiquidable:
        "bruto trabajo 95.000 € · − cotizaciones SS 0 € (no informadas · no estimadas) · − art. 19.2.f) 2.000 € · − art. 20 0 € (RNT ≥ tope o no aplica)",
    };
    const r93 = simularMotorEvento("rescatar_plan", ctxBase);
    const r95 = simularMotorEvento("rescatar_plan", {
      ...ctxBase,
      baseGeneralTitular: 95_000,
      titularidades: [
        { personaId: "carlos", pct: 1, baseGeneral: 95_000, edad: 58 },
      ],
    });
    assert.equal(r93.kind, "calculado");
    assert.equal(r95.kind, "calculado");
    if (r93.kind === "calculado" && r95.kind === "calculado") {
      assert.ok(r93.importe < r95.importe);
      assert.equal(r95.importe, 7_450);
      assert.equal(r93.importe, 7_430);
    }
  });

  it("límite aportación individual = 1.500 si RNT alto", () => {
    const lim = limiteAportacionPlanIndividual(93_000);
    assert.equal(lim.limite, 1_500);
    assert.ok(lim.porPct > 1_500);
  });

  it("aportación 1.500 ahorra cuota; exceso se avisa", () => {
    const ctx = {
      anio: 2026,
      ccaa: "Comunitat Valenciana",
      titularidades: [
        { personaId: "carlos", pct: 1, baseGeneral: 93_000, edad: 58 },
      ],
      baseGeneralTitular: 93_000,
      rendimientoNetoTrabajo: 93_000,
      importe: 3_000,
      notaBaseLiquidable: "base liquidable 93000 €",
    };
    const r = simularMotorEvento("aportar_plan", ctx);
    assert.equal(r.kind, "calculado");
    if (r.kind === "calculado") {
      assert.ok(r.importe < 0, "ahorro = importe negativo");
      assert.match(r.nota, /exceso/);
      assert.match(r.nota, /1\.500/);
    }
  });
});
