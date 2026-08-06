/**
 * Amortizar exige targetId de pasivo; interés baja con el capital.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ids } from "./seed";
import { cloneExpedienteFromSeed, capacidadFromBag } from "./expediente";
import { pasivosParaAmortizar } from "./patrimonio";
import { buildProyeccionSeriesFromBag } from "./proyeccion";
import type { Evento } from "./types";

describe("pasivosParaAmortizar", () => {
  it("desde pasivo: solo ese; desde inmueble: los vinculados; sin id: vacío", () => {
    const bag = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const hip = bag.pasivos[0]!;
    assert.equal(pasivosParaAmortizar(bag.pasivos, hip.id).length, 1);
    assert.equal(
      pasivosParaAmortizar(bag.pasivos, hip.inmuebleId).length,
      1,
    );
    assert.equal(pasivosParaAmortizar(bag.pasivos, undefined).length, 0);
    assert.equal(pasivosParaAmortizar(bag.pasivos, "no-existe").length, 0);
  });

  it("dos hipotecas en el mismo inmueble: pide elegir (devuelve las dos)", () => {
    const bag = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const hip = bag.pasivos[0]!;
    bag.pasivos.push({
      ...hip,
      id: "pasivo-extra",
      prestamista: "Otro banco",
      capitalPendiente: 50_000,
    });
    const cands = pasivosParaAmortizar(bag.pasivos, hip.inmuebleId);
    assert.equal(cands.length, 2);
  });
});

describe("proyección · interés derivado del capital", () => {
  it("interés baja al amortizar capital; capital 0 → interés 0 en la capacidad", () => {
    const bag = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const plan = bag.escenarios.find((e) => e.esPlanBase)!;
    const hip = bag.pasivos.find((p) => p.id === ids.pasivoHipoteca)!;

    // Sin eventos: la capacidad del año 1 coincide con P3.7
    const cap0 = capacidadFromBag(bag);
    const series0 = buildProyeccionSeriesFromBag(bag, [], {
      rentabilidad: plan.rentabilidadEsperada,
    });
    assert.equal(series0[0]!.ahorro, Math.round(cap0.capacidad));

    // Amortizar casi todo el capital en 2026
    const ev: Evento = {
      id: "evt-test-amort",
      escenarioId: plan.id,
      tipo: "amortizar_hipoteca",
      anio: 2026,
      etiqueta: "Amortizar test",
      targetId: hip.id,
      importe: hip.capitalPendiente,
    };
    // Meter efectivo suficiente
    bag.otrosActivos.push({
      id: "otro-cash-test",
      clienteId: bag.cliente.id,
      nombre: "Caja",
      tipo: "efectivo",
      valor: 500_000,
      titularidades: [],
    });
    const series = buildProyeccionSeriesFromBag(bag, [ev], {
      rentabilidad: 0,
    });
    // 2026 aún carga el interés del capital inicial; 2027 ya no (capital 0)
    assert.ok(series[0]!.ahorro < series[1]!.ahorro);
    // Target inventado no mueve nada
    const bad: Evento = {
      ...ev,
      id: "evt-bad",
      targetId: bag.inmuebles[0]!.id, // inmueble, no pasivo
      importe: 10_000,
    };
    const seriesBad = buildProyeccionSeriesFromBag(bag, [bad], {
      rentabilidad: 0,
    });
    assert.equal(seriesBad[0]!.ahorro, series0[0]!.ahorro);
  });

  it("García-Llorente: la capacidad deja de ser plana tras 2036 (interés decrece)", () => {
    const bag = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const plan = bag.escenarios.find((e) => e.esPlanBase)!;
    const evs = bag.eventos.filter((e) => e.escenarioId === plan.id);
    const series = buildProyeccionSeriesFromBag(bag, evs, {
      rentabilidad: plan.rentabilidadEsperada,
    });
    const y2026 = series.find((p) => p.year === 2026)!;
    const y2030 = series.find((p) => p.year === 2030)!;
    // Con interés derivado, amortizar capital reduce el gasto → capacidad sube.
    assert.ok(
      y2030.ahorro > y2026.ahorro,
      `esperaba capacidad 2030 (${y2030.ahorro}) > 2026 (${y2026.ahorro})`,
    );
  });
});
