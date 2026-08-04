/**
 * Tests del clasificador de estado fiscal por persona + margen de salto.
 * Ejecutar: `npm test`
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estadoFiscalPersona } from "./estado-persona";
import { margenSiguienteSaltoGeneral } from "./escalas";
import { desgloseBaseLiquidable } from "./base-liquidable";
import type { Ingreso, Persona } from "@/lib/types";

const personaCV = (id: string, nombre: string): Persona => ({
  id,
  nombre,
  apellidos: "Test",
  birthYear: 1970,
  ccaa: "Comunitat Valenciana",
});

const personaMadrid = (id: string, nombre: string): Persona => ({
  ...personaCV(id, nombre),
  ccaa: "Comunidad de Madrid",
});

function ingreso(
  personaId: string,
  fuente: Ingreso["fuente"],
  importeAnual: number,
  cotizacionesSS?: number,
): Ingreso {
  return {
    id: `ing-${personaId}-${fuente}`,
    clienteId: "c",
    personaId,
    fuente,
    importeAnual,
    cotizacionesSS,
  };
}

describe("estadoFiscalPersona", () => {
  it("CCAA sin cobertura antes que sin ingresos", () => {
    const e = estadoFiscalPersona(personaMadrid("h", "Hugo"), []);
    assert.equal(e.kind, "sin_calculo");
    if (e.kind === "sin_calculo") {
      assert.equal(e.motivo, "ccaa_sin_cobertura");
      assert.match(e.aviso, /Comunitat Valenciana/);
    }
  });

  it("fuente actividad económica → sin_calculo", () => {
    const e = estadoFiscalPersona(personaCV("v", "Vicent"), [
      ingreso("v", "actividad_economica", 68_000),
    ]);
    assert.equal(e.kind, "sin_calculo");
    if (e.kind === "sin_calculo") {
      assert.equal(e.motivo, "fuente_no_contemplada");
      assert.match(e.aviso, /actividades económicas/);
    }
  });

  it("mezcla trabajo + AAEE → sin_calculo (no base a medias)", () => {
    const e = estadoFiscalPersona(personaCV("x", "X"), [
      ingreso("x", "trabajo", 40_000, 2_000),
      ingreso("x", "actividad_economica", 10_000),
    ]);
    assert.equal(e.kind, "sin_calculo");
    if (e.kind === "sin_calculo") {
      assert.equal(e.motivo, "fuente_no_contemplada");
    }
  });

  it("sin ingresos → sin_calculo", () => {
    const e = estadoFiscalPersona(personaCV("l", "Lucía"), []);
    assert.equal(e.kind, "sin_calculo");
    if (e.kind === "sin_calculo") {
      assert.equal(e.motivo, "sin_ingresos");
    }
  });

  it("trabajo en CV → calculable", () => {
    const e = estadoFiscalPersona(personaCV("c", "Carlos"), [
      ingreso("c", "trabajo", 95_000, 4_050),
    ]);
    assert.equal(e.kind, "calculable");
    if (e.kind === "calculable") {
      assert.equal(e.perfil, "trabajo");
    }
  });

  it("pensión → calculable con perfil pension", () => {
    const e = estadoFiscalPersona(personaCV("a", "Amparo"), [
      ingreso("a", "pension", 26_000),
    ]);
    assert.equal(e.kind, "calculable");
    if (e.kind === "calculable") {
      assert.equal(e.perfil, "pension");
    }
  });
});

describe("margenSiguienteSaltoGeneral", () => {
  it("Carlos 88.950 → 49 % / 11.050 € / 50 % (salta autonómica)", () => {
    const m = margenSiguienteSaltoGeneral(
      88_950,
      2026,
      "Comunitat Valenciana",
    );
    assert.ok(m);
    assert.equal(m!.tipoCombinado, 0.49);
    assert.equal(m!.margen, 11_050);
    assert.equal(m!.tipoCombinadoTrasSalto, 0.5);
    assert.equal(m!.escalaQueSalta, "autonomica");
  });

  it("Madrid → null", () => {
    assert.equal(
      margenSiguienteSaltoGeneral(88_950, 2026, "Comunidad de Madrid"),
      null,
    );
  });
});

describe("desglose · etiquetas por fuente", () => {
  it("pensionista: sin concepto de cotizaciones SS", () => {
    const d = desgloseBaseLiquidable({ pensionBruta: 26_000 });
    assert.equal(d.pensionBruta, 26_000);
    assert.equal(d.trabajoBruto, 0);
    assert.ok(!d.conceptos.some((c) => c.etiqueta.includes("cotizaciones")));
    assert.ok(d.conceptos.some((c) => c.etiqueta === "bruto pensión"));
  });

  it("asalariado con cotizaciones informadas: concepto presente", () => {
    const d = desgloseBaseLiquidable({
      trabajoBruto: 95_000,
      cotizacionesSS: 4_050,
    });
    assert.ok(
      d.conceptos.some((c) => c.etiqueta.includes("cotizaciones SS")),
    );
    assert.equal(d.baseLiquidable, 88_950);
  });

  it("asalariado sin cotizaciones: no inventa línea a 0 €", () => {
    const d = desgloseBaseLiquidable({
      trabajoBruto: 95_000,
      cotizacionesSS: null,
    });
    assert.ok(!d.conceptos.some((c) => c.etiqueta.includes("cotizaciones")));
    assert.equal(d.baseLiquidable, 93_000);
  });
});
