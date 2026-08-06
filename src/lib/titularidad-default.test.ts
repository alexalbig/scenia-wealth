/**
 * defaultTitularidades: 100 % al primero; equalTitularidadShares: resto al primero.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultTitularidades,
  equalTitularidadShares,
} from "./expediente";
import type { Persona } from "./types";

const personas: Persona[] = [
  { id: "p1", nombre: "Ana", apellidos: "", birthYear: 1980, ccaa: "Comunitat Valenciana" },
  { id: "p2", nombre: "Luis", apellidos: "", birthYear: 1982, ccaa: "Comunitat Valenciana" },
  { id: "p3", nombre: "Lucía", apellidos: "", birthYear: 2010, ccaa: "Comunitat Valenciana" },
];

describe("defaultTitularidades", () => {
  it("asigna 100 % al primer titular (no reparte entre todos)", () => {
    const tits = defaultTitularidades(personas);
    assert.equal(tits.length, 1);
    assert.equal(tits[0]!.owner.kind, "persona");
    if (tits[0]!.owner.kind === "persona") {
      assert.equal(tits[0]!.owner.personaId, "p1");
    }
    assert.equal(tits[0]!.porcentaje, 1);
  });
});

describe("equalTitularidadShares", () => {
  it("3 partes: suma exacta 1 y el resto va al primero", () => {
    const s = equalTitularidadShares(3);
    assert.equal(s.length, 3);
    assert.equal(s.reduce((a, b) => a + b, 0), 1);
    assert.ok(s[0]! >= s[1]!);
    assert.equal(s[1], s[2]);
  });

  it("2 partes: 0.5 / 0.5", () => {
    assert.deepEqual(equalTitularidadShares(2), [0.5, 0.5]);
  });
});
