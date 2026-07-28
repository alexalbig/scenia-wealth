"use client";

import { cn } from "@/lib/cn";
import type { EurMode } from "@/lib/fiscal";
import type { Persona } from "@/lib/types";

/**
 * Controles P4 — marcado mockup: `.toolbar` · `.seg` · `.on`
 */
export function FiscalControls({
  personas,
  personaId,
  onPersona,
  anios,
  anio,
  onAnio,
  eurMode,
  onEurMode,
}: {
  personas: Persona[];
  personaId: string;
  onPersona: (id: string) => void;
  anios: number[];
  anio: number;
  onAnio: (anio: number) => void;
  eurMode: EurMode;
  onEurMode: (mode: EurMode) => void;
}) {
  const options = anios.includes(anio)
    ? anios
    : [...anios, anio].sort((a, b) => a - b);

  return (
    <div className="toolbar">
      <div className="seg" role="group" aria-label="Persona">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(p.id === personaId && "on")}
            aria-pressed={p.id === personaId}
            onClick={() => onPersona(p.id)}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <select
        value={anio}
        aria-label="Año"
        onChange={(e) => onAnio(Number(e.target.value))}
        style={{
          border: "1px solid var(--line-2)",
          borderRadius: 8,
          padding: "6px 9px",
          fontSize: 12,
          background: "#fff",
          color: "var(--ink)",
        }}
      >
        {options.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <div className="seg" role="group" aria-label="Unidad monetaria">
        <button
          type="button"
          className={cn(eurMode === "hoy" && "on")}
          aria-pressed={eurMode === "hoy"}
          onClick={() => onEurMode("hoy")}
        >
          € hoy
        </button>
        <button
          type="button"
          className={cn(eurMode === "futuro" && "on")}
          aria-pressed={eurMode === "futuro"}
          onClick={() => onEurMode("futuro")}
        >
          € futuro
        </button>
      </div>
    </div>
  );
}
