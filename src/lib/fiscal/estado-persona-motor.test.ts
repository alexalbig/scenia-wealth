/**
 * Guardas v14 en el motor: titular no calculable no se liquida;
 * en ganancias el resto sigue; la fila marca parcial.
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
  it("Hugo (Madrid) en reembolso → sin_calculo; Carlos/Marta se liquidan; rollup parcial", () => {
    const bag0 = cloneExpedienteFromSeed(ids.clienteGarciaLlorente)!;
    // Titularidad temporal: Carlos 50 % · Marta 30 % · Hugo 20 %
    // Hugo ya no está en personaIds de GL (seed); el caso mixtitular sigue siendo válido.
    const hugoFromSeed = seed.personas.find((p) => p.id === ids.personaHugo)!;
    bag0.personas.push({ ...hugoFromSeed });
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
    assert.equal(estHugo.kind, "sin_calculo");
    if (estHugo.kind === "sin_calculo") {
      assert.equal(estHugo.motivo, "ccaa_sin_cobertura");
    }

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
    assert.equal(hugoTit!.estado?.kind, "sin_calculo");
    assert.equal(hugoTit!.ccaa, "Comunidad de Madrid");

    const r = simularMotorEvento("reembolsar_fondo", ctx);
    assert.equal(r.kind, "calculado");
    if (r.kind === "calculado") {
      assert.ok(r.importe > 0, "Carlos+Marta generan cuota");
      assert.ok(r.parcialTitulares && r.parcialTitulares.length === 1);
      assert.equal(r.parcialTitulares![0]!.personaId, ids.personaHugo);
      assert.match(r.parcialTitulares![0]!.motivo, /Comunitat Valenciana/);
      assert.match(r.nota, /cálculo parcial/);
      assert.match(r.desglose ?? "", /Hugo/);
      assert.match(r.desglose ?? "", /sin_calculo/);
      // Solo 80 % de la ganancia (Carlos 50 + Marta 30) entra en la cuota
      const rFull = simularMotorEvento("reembolsar_fondo", {
        ...ctx,
        titularidades: ctx.titularidades.filter(
          (t) => t.personaId !== ids.personaHugo,
        ),
      });
      assert.equal(rFull.kind, "calculado");
      if (rFull.kind === "calculado") {
        assert.equal(r.importe, rFull.importe);
      }
    }

    const rollup = rollupImpuestosEscenario([ev], () => ctx);
    assert.equal(rollup.parcial, true);
    assert.ok(
      rollup.motivosParcial.some((m) => /Hugo|Comunitat Valenciana/.test(m)),
    );
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

  it("seed Fondo A vuelve a Carlos 60 / Marta 40 (sin Hugo)", () => {
    const fondo = seed.instrumentos.find((i) => i.id === ids.fondoA)!;
    assert.equal(fondo.titularidades.length, 2);
    assert.ok(
      !fondo.titularidades.some(
        (t) =>
          t.owner.kind === "persona" && t.owner.personaId === ids.personaHugo,
      ),
    );
  });
});
