"use client";

import type { EurMode } from "@/lib/fiscal";
import type { Persona } from "@/lib/types";

const selectClass =
  "h-[30px] rounded-[8px] border border-line-2 bg-white px-2.5 text-[12px] text-ink outline-none focus:border-ink";

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
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Persona" className="seg">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            data-on={p.id === personaId}
            aria-pressed={p.id === personaId}
            onClick={() => onPersona(p.id)}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <select
        className={selectClass}
        value={anio}
        aria-label="Año"
        onChange={(e) => onAnio(Number(e.target.value))}
      >
        {anios.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <div role="group" aria-label="Unidad monetaria" className="seg">
        <button
          type="button"
          data-on={eurMode === "hoy"}
          aria-pressed={eurMode === "hoy"}
          onClick={() => onEurMode("hoy")}
        >
          € hoy
        </button>
        <button
          type="button"
          data-on={eurMode === "futuro"}
          aria-pressed={eurMode === "futuro"}
          onClick={() => onEurMode("futuro")}
        >
          € futuro
        </button>
      </div>
    </div>
  );
}
