/**
 * displayTitularidadPercents: etiquetas que siempre suman 100.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  displayTitularidadPercents,
  formatTitularidades,
} from "./patrimonio";
import type { Persona, Titularidad } from "./types";

const personas: Persona[] = [
  {
    id: "a",
    nombre: "Ana",
    apellidos: "",
    birthYear: 1980,
    ccaa: "Comunitat Valenciana",
  },
  {
    id: "b",
    nombre: "Luis",
    apellidos: "",
    birthYear: 1982,
    ccaa: "Comunitat Valenciana",
  },
  {
    id: "c",
    nombre: "Lucía",
    apellidos: "",
    birthYear: 2010,
    ccaa: "Comunitat Valenciana",
  },
];

describe("displayTitularidadPercents", () => {
  it("tres iguales: suma 100 (resto al primero)", () => {
    const tits: Titularidad[] = [
      { owner: { kind: "persona", personaId: "a" }, porcentaje: 1 / 3 },
      { owner: { kind: "persona", personaId: "b" }, porcentaje: 1 / 3 },
      { owner: { kind: "persona", personaId: "c" }, porcentaje: 1 / 3 },
    ];
    const pcts = displayTitularidadPercents(tits);
    assert.equal(
      Math.round(pcts.reduce((s, p) => s + p, 0) * 10) / 10,
      100,
    );
    assert.deepEqual(pcts, [33.4, 33.3, 33.3]);
  });

  it("60/40 sin resto artificial", () => {
    const tits: Titularidad[] = [
      { owner: { kind: "persona", personaId: "a" }, porcentaje: 0.6 },
      { owner: { kind: "persona", personaId: "b" }, porcentaje: 0.4 },
    ];
    assert.deepEqual(displayTitularidadPercents(tits), [60, 40]);
  });

  it("formatTitularidades no muestra 99", () => {
    const tits: Titularidad[] = [
      { owner: { kind: "persona", personaId: "a" }, porcentaje: 1 / 3 },
      { owner: { kind: "persona", personaId: "b" }, porcentaje: 1 / 3 },
      { owner: { kind: "persona", personaId: "c" }, porcentaje: 1 / 3 },
    ];
    const label = formatTitularidades(tits, personas);
    assert.match(label, /33,4%|33.4%/);
    assert.doesNotMatch(label, /33% · .*33% · .*33%/);
  });
});
