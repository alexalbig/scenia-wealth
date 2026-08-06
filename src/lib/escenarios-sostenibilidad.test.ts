/**
 * Columna «¿se sostiene?» · agotamiento de líquidos.
 * Caso sintético (no seed): líquidos finitos + déficit estructural → se agotan antes de 2050.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ExpedienteBag } from "@/lib/expediente";
import {
  sostenibilidadDeCamino,
  COMPARADOR_HORIZONTE,
} from "@/lib/escenarios";
import { buildProyeccionSeriesFromBag } from "@/lib/proyeccion";
import type { Evento } from "@/lib/types";

/** Cliente delgado: 60.000 € en efectivo, déficit estructural 25.000 €/año. */
function bagDelgado(): ExpedienteBag {
  const clienteId = "cliente-agotamiento-test";
  const personaId = "persona-agotamiento";
  return {
    cliente: {
      id: clienteId,
      cuentaId: "cuenta-test",
      nombre: "Cliente agotamiento (test)",
      segmento: "Pre-jubilado",
      ccaa: "Comunitat Valenciana",
      personaIds: [personaId],
      sociedadIds: [],
      patrimonioNeto: 60_000,
      composicion: {
        financiero: 1,
        inmobiliario: 0,
        empresarial: 0,
        otros: 0,
      },
      ultimaRevisionMeses: 0,
      datosAFecha: "2026-01-01",
    },
    personas: [
      {
        id: personaId,
        nombre: "Ana",
        apellidos: "Prueba",
        birthYear: 1965,
        ccaa: "Comunitat Valenciana",
      },
    ],
    instrumentos: [],
    inmuebles: [],
    sociedades: [],
    otrosActivos: [
      {
        id: "efectivo-agotamiento",
        clienteId,
        nombre: "Cuenta corriente",
        tipo: "efectivo",
        valor: 60_000,
        titularidades: [
          { owner: { kind: "persona", personaId }, porcentaje: 1 },
        ],
      },
    ],
    pasivos: [],
    ingresos: [
      {
        id: "ing-agotamiento",
        clienteId,
        personaId,
        fuente: "pension",
        importeAnual: 5_000,
      },
    ],
    gastos: [
      {
        id: "gas-agotamiento",
        clienteId,
        categoria: "Vida",
        importeAnual: 30_000,
      },
    ],
    escenarios: [],
    eventos: [],
    historial: [],
  };
}

describe("sostenibilidadDeCamino · agotamiento", () => {
  it("con líquidos finitos y déficit, el texto es «Los líquidos se agotan en AAAA»", () => {
    const bag = bagDelgado();
    // Sin eventos: solo el déficit estructural (−25.000 €/año) sobre 60.000 €.
    const points = buildProyeccionSeriesFromBag(bag, [], { rentabilidad: 0.04 });
    const sost = sostenibilidadDeCamino(points);

    assert.ok(
      sost.anioAgotamientoLiquidos != null,
      "debe detectar agotamiento antes del horizonte",
    );
    assert.ok(
      sost.anioAgotamientoLiquidos! < COMPARADOR_HORIZONTE,
      `agotamiento ${sost.anioAgotamientoLiquidos} debe ser < ${COMPARADOR_HORIZONTE}`,
    );
    assert.equal(
      sost.texto,
      `Los líquidos se agotan en ${sost.anioAgotamientoLiquidos}`,
    );
    assert.equal(sost.aguantaHorizonte, false);

    // Sanity: el bruto cruza ≤ 0 ese año; el recortado se queda en 0.
    const p = points.find((x) => x.year === sost.anioAgotamientoLiquidos)!;
    assert.ok(p.liquidosBrutos <= 0);
    assert.equal(p.liquidos, 0);

    // eslint-disable-next-line no-console -- salida pedida para verificar el texto
    console.log("texto columna «¿se sostiene?»:", sost.texto);
    console.log("año de agotamiento:", sost.anioAgotamientoLiquidos);
  });

  it("la serie de líquidos sí incluye las cuotas: un camino con cuota se agota antes", () => {
    const bag = bagDelgado();
    // Mismo déficit estructural; el camino B paga 20.000 € de cuota en 2026.
    const sinCuota: Evento[] = [];
    const conCuota: Evento[] = [
      {
        id: "evt-cuota-test",
        escenarioId: "esc-b",
        tipo: "generico",
        anio: 2026,
        etiqueta: "Gasto con impacto fiscal",
        importe: 1, // el movimiento es mínimo; lo que importa es la cuota
        tipoGenerico: "gasto",
        cuotaAnual: 20_000,
        impuestosPeriodo: 20_000,
        introducidoPorAsesor: true,
      },
    ];

    const ptsA = buildProyeccionSeriesFromBag(bag, sinCuota, {
      rentabilidad: 0.04,
    });
    const ptsB = buildProyeccionSeriesFromBag(bag, conCuota, {
      rentabilidad: 0.04,
    });
    const a = sostenibilidadDeCamino(ptsA);
    const b = sostenibilidadDeCamino(ptsB);

    assert.ok(a.anioAgotamientoLiquidos != null);
    assert.ok(b.anioAgotamientoLiquidos != null);
    assert.ok(
      b.anioAgotamientoLiquidos! < a.anioAgotamientoLiquidos!,
      `B (${b.anioAgotamientoLiquidos}) debe agotarse antes que A (${a.anioAgotamientoLiquidos}) porque paga 20.000 € de cuota`,
    );

    // Misma capacidad estructural: la columna por capacidad no diferenciaría;
    // el agotamiento sí, porque liquidosBrutos descuenta la cuota del efectivo.
    assert.equal(a.anioCapacidadNegativa, b.anioCapacidadNegativa);

    console.log("A sin cuota:", a.texto);
    console.log("B con cuota 20.000 €:", b.texto);
  });
});
