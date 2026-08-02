/**
 * Test de coherencia interna de escalas IRPF.
 * Falla si las cuotas acumuladas (históricas o inventadas) no cuadran con tramos×tipos.
 *
 * Ejecutar: `npm test` (node:test).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cuotasAcumuladasDerivadas,
  desviacionesEscala,
  cuotaEscala,
} from "./escalas";
import {
  getEscalaAutonomicaGeneral,
  getEscalaEstatalGeneral,
  getEscalaAhorroEstatal,
  type TramoEscala,
} from "./parametros";

/**
 * Cuotas que estaban guardadas en la tabla antes de derivarlas (commit previo).
 * Sirven para documentar la desviación histórica frente a la derivada.
 */
const CV_GUARDADAS_HISTORICAS = [
  0, 1_080, 2_280, 3_780, 5_530, 7_530, 9_780, 12_280, 19_700, 33_450, 47_700,
];

const ESTATAL_GUARDADAS_HISTORICAS = [
  0, 1_182.75, 2_112.75, 4_362.75, 8_950.75, 62_950.75,
];

/** Escala inconsistente a propósito: tramo 52–65k @ 22,5 % con cuota siguiente = 9.780. */
const CV_INCONSISTENTE_REVISION: TramoEscala[] = [
  { hasta: 12_000, tipo: 0.09 },
  { hasta: 22_000, tipo: 0.12 },
  { hasta: 32_000, tipo: 0.15 },
  { hasta: 42_000, tipo: 0.175 },
  { hasta: 52_000, tipo: 0.2 },
  { hasta: 65_000, tipo: 0.225 }, // corte 65k (DL 14/2022) ≠ 62k vigente
  { hasta: 72_000, tipo: 0.25 },
  { hasta: 100_000, tipo: 0.265 },
  { hasta: 150_000, tipo: 0.275 },
  { hasta: 200_000, tipo: 0.285 },
  { hasta: null, tipo: 0.295 },
];

/** Cuotas de la tabla vieja aplicadas sobre cortes a 65k → desincronizadas. */
const CV_INCONSISTENTE_GUARDADAS = [
  0, 1_080, 2_280, 3_780, 5_530, 7_530, 9_780, 12_280, 19_700, 33_450, 47_700,
];

describe("escalas IRPF · cuotas acumuladas derivadas", () => {
  it("CV Ley 9/2022 (52–62k): las cuotas históricas cuadraban con los tramos (Δ = 0)", () => {
    const tramos = getEscalaAutonomicaGeneral(2026, "Comunitat Valenciana")!.valor;
    const desv = desviacionesEscala(tramos, CV_GUARDADAS_HISTORICAS);
    for (const d of desv) {
      assert.equal(
        d.delta,
        0,
        `tramo ${d.indice} hasta=${d.hasta}: guardada ${d.guardada} ≠ derivada ${d.derivada} (Δ ${d.delta})`,
      );
    }
  });

  it("estatal: las cuotas históricas cuadraban con los tramos (Δ = 0)", () => {
    const tramos = getEscalaEstatalGeneral(2026).valor;
    const desv = desviacionesEscala(tramos, ESTATAL_GUARDADAS_HISTORICAS);
    for (const d of desv) {
      assert.equal(d.delta, 0, `estatal tramo ${d.indice}: Δ ${d.delta}`);
    }
  });

  it("falla si se mezclan cortes a 65k con cuotas de la escala 62k (desviación de la revisión)", () => {
    const desv = desviacionesEscala(
      CV_INCONSISTENTE_REVISION,
      CV_INCONSISTENTE_GUARDADAS,
    );
    // Al inicio del tramo que termina en 72k: derivada = 7530 + 13000×0,225 = 10455
    // guardada = 9780 → Δ = 9780 − 10455 = −675
    const t6 = desv[6]!;
    assert.equal(t6.derivada, 10_455);
    assert.equal(t6.guardada, 9_780);
    assert.equal(t6.delta, -675);

    const conDesvio = desv.filter((d) => d.delta !== 0 && d.delta != null);
    assert.ok(
      conDesvio.length >= 5,
      `esperaba ≥5 tramos desviados, hay ${conDesvio.length}`,
    );
  });

  it("cuotaEscala no lee cuotaAcumulada guardada — solo deriva", () => {
    const tramos = getEscalaAutonomicaGeneral(2026, "Comunitat Valenciana")!.valor;
    // 62.000 exactos = fin del tramo al 22,5 %
    assert.equal(cuotaEscala(62_000, tramos), 9_780);
    // 65.000 cae en el tramo 62–72 @ 25 %
    assert.equal(cuotaEscala(65_000, tramos), 9_780 + 3_000 * 0.25);
  });

  it("ahorro: derivadas coherentes con AEAT (mitad)", () => {
    const tramos = getEscalaAhorroEstatal(2026).valor;
    const deriv = cuotasAcumuladasDerivadas(tramos);
    assert.equal(deriv[0], 0);
    assert.equal(deriv[1], 570); // 6000 × 0,095
    assert.equal(deriv[2], 5_190); // 570 + 44000 × 0,105
  });
});
