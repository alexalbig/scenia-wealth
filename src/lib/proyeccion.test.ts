/**
 * Proyección con eventos · escenarios distintos → series distintas.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cloneExpedienteFromSeed, recomputeFiscalBag } from "@/lib/expediente";
import { ids } from "@/lib/seed";
import {
  buildProyeccionSeriesFromBag,
  parseImporteEvento,
} from "@/lib/proyeccion";

describe("buildProyeccionSeriesFromBag", () => {
  it("Situación actual ≠ C · Venta Jávea 2033 en 2034 y 2040", () => {
    const bag = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const baseEv = bag.eventos.filter((e) => e.escenarioId === ids.escBase);
    const cEv = bag.eventos.filter((e) => e.escenarioId === ids.escC);

    const base = buildProyeccionSeriesFromBag(bag, baseEv, {
      rentabilidad: 0.04,
    });
    const c = buildProyeccionSeriesFromBag(bag, cEv, { rentabilidad: 0.04 });

    const b34 = base.find((p) => p.year === 2034)!;
    const c34 = c.find((p) => p.year === 2034)!;
    const b40 = base.find((p) => p.year === 2040)!;
    const c40 = c.find((p) => p.year === 2040)!;

    assert.notEqual(b34.patrimonio, c34.patrimonio);
    assert.notEqual(b40.patrimonio, c40.patrimonio);
    // Tras la venta, C tiene más líquidos (efectivo de Jávea)
    assert.ok(c34.liquidos > b34.liquidos);
  });

  it("Líquidos 2036: D · Venta Jávea 2036 ≠ Situación actual", () => {
    const bag = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const baseEv = bag.eventos.filter((e) => e.escenarioId === ids.escBase);
    const dEv = bag.eventos.filter((e) => e.escenarioId === ids.escD);

    const base = buildProyeccionSeriesFromBag(bag, baseEv, {
      rentabilidad: 0.04,
    });
    const d = buildProyeccionSeriesFromBag(bag, dEv, { rentabilidad: 0.04 });

    const b36 = base.find((p) => p.year === 2036)!;
    const d36 = d.find((p) => p.year === 2036)!;
    assert.notEqual(b36.liquidos, d36.liquidos);
    assert.ok(d36.liquidos > b36.liquidos);
  });

  it("parseImporteEvento lee el importe de la etiqueta", () => {
    assert.equal(
      parseImporteEvento({
        id: "x",
        escenarioId: "e",
        tipo: "vender_inmueble",
        anio: 2033,
        etiqueta: "Vender Vivienda · Jávea · 420.000 €",
      }),
      420_000,
    );
  });

  it("importe y tipoGenerico son campos de modelo (renombrar no los pierde)", () => {
    const bag = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const baseEv = bag.eventos.filter((e) => e.escenarioId === ids.escBase);
    const withGen = [
      ...baseEv,
      {
        id: "evt-gen-test",
        escenarioId: ids.escBase,
        tipo: "generico" as const,
        anio: 2028,
        etiqueta: "Título renombrado sin cifra",
        importe: 200_000,
        tipoGenerico: "ingreso" as const,
        introducidoPorAsesor: true,
      },
    ];

    const base = buildProyeccionSeriesFromBag(bag, baseEv, {
      rentabilidad: 0.04,
    });
    const alt = buildProyeccionSeriesFromBag(bag, withGen, {
      rentabilidad: 0.04,
    });

    const b28 = base.find((p) => p.year === 2028)!;
    const a28 = alt.find((p) => p.year === 2028)!;
    assert.equal(a28.patrimonio - b28.patrimonio, 200_000);
  });

  it("A · Reembolso 2034 queda ~20k por debajo del plan base (cuota × años capitalizada)", () => {
    const bag0 = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const bag = recomputeFiscalBag(bag0);
    const baseEv = bag.eventos.filter((e) => e.escenarioId === ids.escBase);
    const aEv = bag.eventos.filter((e) => e.escenarioId === ids.escA);
    const reemb = aEv.find((e) => e.tipo === "reembolsar_fondo")!;
    assert.ok((reemb.cuotaAnual ?? 0) > 0);

    const base = buildProyeccionSeriesFromBag(bag, baseEv, {
      rentabilidad: 0.04,
    });
    const a = buildProyeccionSeriesFromBag(bag, aEv, { rentabilidad: 0.04 });
    const b34 = base.find((p) => p.year === 2034)!;
    const a34 = a.find((p) => p.year === 2034)!;
    assert.equal(b34.patrimonio, 1_567_827);
    assert.ok(a34.patrimonio < b34.patrimonio);
    // Seis cuotas de ~2.708 capitalizadas → gap del orden de 20k, no cero
    assert.ok(b34.patrimonio - a34.patrimonio > 15_000);
  });

  it("B · Pignoración no supera al plan base en patrimonio (sin almuerzo gratis)", () => {
    const bag = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const baseEv = bag.eventos.filter((e) => e.escenarioId === ids.escBase);
    const bEv = bag.eventos.filter((e) => e.escenarioId === ids.escB);

    const base = buildProyeccionSeriesFromBag(bag, baseEv, {
      rentabilidad: 0.04,
    });
    const b = buildProyeccionSeriesFromBag(bag, bEv, { rentabilidad: 0.04 });
    const b40 = base.find((p) => p.year === 2040)!;
    const p40 = b.find((p) => p.year === 2040)!;
    assert.equal(p40.patrimonio, b40.patrimonio);
    // Sí hay más líquidos brutos (prestamo + fondos), pero neto igual
    assert.ok(p40.liquidos > b40.liquidos);
  });
});
