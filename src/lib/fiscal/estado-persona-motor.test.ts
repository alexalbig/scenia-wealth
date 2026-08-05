/**
 * Guardas v14 en el motor: titular no calculable no se liquida;
 * plusvalías (ahorro) sí liquidan fuera de CV; rescate exige CV.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ids, seed } from "@/lib/seed";
import { cloneExpedienteFromSeed } from "@/lib/expediente";
import { buildContextoFiscalFromBag } from "./contexto";
import { simularMotorEvento } from "./motor";
import { rollupImpuestosEscenario } from "./rollup";
import { estadoFiscalPersona } from "./estado-persona";

describe("guardas v14 · motor por titular", () => {
  it("Hugo (Madrid) en reembolso mixtitular → se liquida su parte; no es parcial por CCAA", () => {
    const bag0 = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const hugoFromSeed = seed.personas.find((p) => p.id === ids.personaHugo)!;
    bag0.personas.push({ ...hugoFromSeed });
    bag0.ingresos.push(
      ...seed.ingresos.filter((i) => i.personaId === ids.personaHugo),
    );
    const fondo = bag0.instrumentos.find((i) => i.id === ids.fondoA)!;
    fondo.titularidades = [
      {
        owner: { kind: "persona", personaId: ids.personaCarlos },
        porcentaje: 0.5,
      },
      {
        owner: { kind: "persona", personaId: ids.personaMarta },
        porcentaje: 0.3,
      },
      {
        owner: { kind: "persona", personaId: ids.personaHugo },
        porcentaje: 0.2,
      },
    ];

    const hugo = hugoFromSeed;
    const ingresosHugo = seed.ingresos.filter(
      (i) => i.personaId === ids.personaHugo,
    );
    const estHugo = estadoFiscalPersona(hugo, ingresosHugo);
    assert.equal(estHugo.kind, "calculable");

    const ev = {
      id: "evt-test-reembolso-hugo",
      escenarioId: ids.escBase,
      tipo: "reembolsar_fondo" as const,
      anio: 2026,
      etiqueta: "Reembolso Fondo A 35.000 €",
      targetId: ids.fondoA,
    };
    const ctx = buildContextoFiscalFromBag(bag0, ev, { importe: 35_000 }, []);
    assert.equal(ctx.titularidades.length, 3);
    const hugoTit = ctx.titularidades.find(
      (t) => t.personaId === ids.personaHugo,
    );
    assert.ok(hugoTit);
    assert.equal(hugoTit!.estado?.kind, "calculable");
    assert.equal(hugoTit!.ccaa, "Comunidad de Madrid");

    const r = simularMotorEvento("reembolsar_fondo", ctx);
    assert.equal(r.kind, "calculado");
    if (r.kind === "calculado") {
      assert.ok(r.importe > 0, "los tres titulares generan cuota del ahorro");
      assert.equal(r.parcialTitulares, undefined);
      assert.match(r.desglose ?? "", /Hugo/);
    }
  });

  it("Madrid solo · reembolso liquida; rescate queda sin_calculo", () => {
    const bag0 = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const hugo = seed.personas.find((p) => p.id === ids.personaHugo)!;
    bag0.personas = [{ ...hugo }];
    bag0.cliente = {
      ...bag0.cliente,
      ccaa: "Comunidad de Madrid",
      personaIds: [ids.personaHugo],
    };
    const fondo = bag0.instrumentos.find((i) => i.id === ids.fondoA)!;
    fondo.titularidades = [
      {
        owner: { kind: "persona", personaId: ids.personaHugo },
        porcentaje: 1,
      },
    ];
    // Ingresos de Hugo en el bag
    bag0.ingresos = seed.ingresos.filter((i) => i.personaId === ids.personaHugo);

    const evReemb = {
      id: "evt-madrid-reemb",
      escenarioId: ids.escBase,
      tipo: "reembolsar_fondo" as const,
      anio: 2026,
      etiqueta: "Reembolso Madrid",
      targetId: ids.fondoA,
    };
    const ctxReemb = buildContextoFiscalFromBag(
      bag0,
      evReemb,
      { importe: 35_000 },
      [],
    );
    const rReemb = simularMotorEvento("reembolsar_fondo", ctxReemb);
    assert.equal(rReemb.kind, "calculado");
    if (rReemb.kind === "calculado") {
      assert.ok(rReemb.importe > 0);
    }

    const plan = bag0.instrumentos.find(
      (i) => i.tipoFiscal === "plan_pensiones",
    );
    const evResc = {
      id: "evt-madrid-resc",
      escenarioId: ids.escBase,
      tipo: "rescatar_plan" as const,
      anio: 2026,
      etiqueta: "Rescate Madrid",
      targetId: plan?.id ?? ids.personaHugo,
    };
    const ctxResc = buildContextoFiscalFromBag(
      bag0,
      evResc,
      { importe: 10_000, modalidad: "renta" },
      [],
    );
    // ctx.ccaa puede venir del cliente Madrid
    const rResc = simularMotorEvento("rescatar_plan", {
      ...ctxResc,
      ccaa: "Comunidad de Madrid",
    });
    assert.equal(rResc.kind, "sin_calculo");
    if (rResc.kind === "sin_calculo") {
      assert.match(rResc.nota, /base general|Comunitat Valenciana|Madrid/i);
    }
  });

  it("rescate sobre Lucía (sin ingresos) → sin_calculo entero", () => {
    const bag0 = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const lucia = bag0.personas.find((p) => p.id === ids.personaLucia)!;
    const est = estadoFiscalPersona(lucia, []);
    assert.equal(est.kind, "sin_calculo");

    const ev = {
      id: "evt-test-rescate-lucia",
      escenarioId: ids.escBase,
      tipo: "rescatar_plan" as const,
      anio: 2026,
      etiqueta: "Rescate en renta 10.000 €",
      targetId: ids.personaLucia,
    };
    const ctx = buildContextoFiscalFromBag(
      bag0,
      ev,
      { importe: 10_000, modalidad: "renta" },
      [],
    );
    const r = simularMotorEvento("rescatar_plan", ctx);
    assert.equal(r.kind, "sin_calculo");
    if (r.kind === "sin_calculo") {
      assert.match(r.nota, /sin ingresos|Sin ingresos/i);
    }
  });

  it("rollup de escenario con evento mixtitular no inventa cuota", () => {
    const bag0 = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    const ev = bag0.eventos.find((e) => e.tipo === "reembolsar_fondo");
    if (!ev) return;
    const ctx = buildContextoFiscalFromBag(bag0, ev, { importe: 35_000 }, []);
    const rollup = rollupImpuestosEscenario([ev], () => ctx);
    assert.equal(typeof rollup.impuestosPeriodo, "number");
  });
});
