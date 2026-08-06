"use client";

import { useMemo, useState } from "react";
import type { Persona, Titularidad } from "@/lib/types";

/**
 * Control reutilizable de reparto de titularidad.
 * Valida suma = 100 %. Por defecto 100 % a la primera persona.
 * Al salir de un campo, si la suma de décimas está a ±0,1 de 100,
 * el producto cuadrea el resto en el último campo tocado.
 */
export function TitularidadEditor({
  personas,
  value,
  onChange,
  error,
}: {
  personas: Persona[];
  value: Titularidad[];
  onChange: (next: Titularidad[]) => void;
  error?: boolean;
}) {
  const [lastEditedId, setLastEditedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return personas.map((p) => {
      const t = value.find(
        (x) => x.owner.kind === "persona" && x.owner.personaId === p.id,
      );
      return {
        personaId: p.id,
        label: `${p.nombre} ${p.apellidos}`.trim(),
        pct: t ? Math.round(t.porcentaje * 1000) / 10 : 0,
      };
    });
  }, [personas, value]);

  const rawSum = value.reduce((s, t) => s + t.porcentaje, 0);
  const sumLabel = Math.round(rawSum * 1000) / 10;
  const sumOk = titularidadSumaOk(value);

  function buildFromTenths(tenthsByPersona: Map<string, number>): Titularidad[] {
    return personas
      .map((p) => {
        const tenths = tenthsByPersona.get(p.id) ?? 0;
        return {
          owner: { kind: "persona" as const, personaId: p.id },
          porcentaje: tenths / 1000,
        };
      })
      .filter((t) => t.porcentaje > 0);
  }

  function setPct(personaId: string, pct: number) {
    const clamped = Math.max(0, Math.min(100, pct));
    setLastEditedId(personaId);
    const next: Titularidad[] = personas
      .map((p) => {
        const existing = value.find(
          (x) => x.owner.kind === "persona" && x.owner.personaId === p.id,
        );
        const pctVal =
          p.id === personaId ? clamped / 100 : (existing?.porcentaje ?? 0);
        return {
          owner: { kind: "persona" as const, personaId: p.id },
          porcentaje: pctVal,
        };
      })
      .filter((t) => t.porcentaje > 0);
    onChange(next);
  }

  /** Cuadre automático si la suma de décimas está a 0,1 de 100. */
  function normalizeOnBlur(personaId: string) {
    const tenths = new Map<string, number>();
    for (const p of personas) {
      const t = value.find(
        (x) => x.owner.kind === "persona" && x.owner.personaId === p.id,
      );
      tenths.set(p.id, t ? Math.round(t.porcentaje * 1000) : 0);
    }
    // Asegura el valor del campo que acaba de editarse (por si el state va un tick atrás).
    const edited = value.find(
      (x) => x.owner.kind === "persona" && x.owner.personaId === personaId,
    );
    if (edited) tenths.set(personaId, Math.round(edited.porcentaje * 1000));

    let sum = 0;
    for (const v of tenths.values()) sum += v;
    const delta = 1000 - sum;
    if (Math.abs(delta) === 0) {
      onChange(buildFromTenths(tenths));
      return;
    }
    if (Math.abs(delta) > 1) return; // lejos de 100 → error visible, sin cuadre

    const targetId = lastEditedId ?? personaId;
    const cur = tenths.get(targetId) ?? 0;
    tenths.set(targetId, Math.max(0, cur + delta));
    onChange(buildFromTenths(tenths));
  }

  if (personas.length === 0) {
    return (
      <div className="tiny">
        Añade al menos una persona al expediente para repartir titularidad.
      </div>
    );
  }

  return (
    <div>
      <div className="lbl" style={{ marginBottom: 6 }}>
        Reparto de titularidad
      </div>
      <div
        style={{
          border: `1px solid ${error || !sumOk ? "var(--coral-deep)" : "var(--line-2)"}`,
          borderRadius: 8,
          background: "#fff",
          padding: "10px 12px",
        }}
      >
        {rows.map((r) => (
          <div
            key={r.personaId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>
              {r.label}
            </span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={r.pct}
              onChange={(e) => setPct(r.personaId, Number(e.target.value))}
              onBlur={() => normalizeOnBlur(r.personaId)}
              style={{ width: 72 }}
              className={error || !sumOk ? "err" : undefined}
            />
            <span className="tiny">%</span>
          </div>
        ))}
        <div className="tit-bar" style={{ marginTop: 4 }}>
          {rows
            .filter((r) => r.pct > 0)
            .map((r, i) => (
              <i
                key={r.personaId}
                style={{
                  width: `${r.pct}%`,
                  background: i === 0 ? "var(--blue)" : "#8FA0BE",
                }}
              />
            ))}
        </div>
        <div
          className={`err-msg ${!sumOk ? "on" : ""}`}
          style={{ marginTop: 6 }}
        >
          La suma debe ser 100 % (ahora {sumLabel.toLocaleString("es-ES")} %).
        </div>
      </div>
    </div>
  );
}

export function titularidadSumaOk(value: Titularidad[]) {
  const sum = value.reduce((s, t) => s + t.porcentaje, 0);
  return Math.abs(sum - 1) < 0.001;
}
