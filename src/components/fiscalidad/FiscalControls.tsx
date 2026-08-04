"use client";

import { cn } from "@/lib/cn";
import type { Persona } from "@/lib/types";
import type { EstadoFiscalPersona } from "@/lib/fiscal";

/**
 * Controles P4 — persona y año.
 * Muestra todas las personas; las no calculables llevan etiqueta «sin cálculo».
 * Con un solo titular, el selector de persona desaparece.
 */
export function FiscalControls({
  personas,
  estados,
  personaId,
  onPersona,
  anios,
  anio,
  onAnio,
}: {
  personas: Persona[];
  estados: Record<string, EstadoFiscalPersona>;
  personaId: string;
  onPersona: (id: string) => void;
  anios: number[];
  anio: number;
  onAnio: (anio: number) => void;
}) {
  const options = anios.includes(anio)
    ? anios
    : [...anios, anio].sort((a, b) => a - b);

  const showPersonaSeg = personas.length > 1;

  return (
    <div className="controls">
      {showPersonaSeg && (
        <div className="seg" role="group" aria-label="Persona">
          {personas.map((p) => {
            const est = estados[p.id];
            const sinCalculo = est?.kind === "sin_calculo";
            return (
              <button
                key={p.id}
                type="button"
                className={cn(p.id === personaId && "on")}
                aria-pressed={p.id === personaId}
                onClick={() => onPersona(p.id)}
                title={sinCalculo ? "Sin cálculo" : undefined}
              >
                {p.nombre}
                {sinCalculo ? " · sin cálculo" : ""}
              </button>
            );
          })}
        </div>
      )}

      <select
        value={anio}
        aria-label="Ejercicio"
        onChange={(e) => onAnio(Number(e.target.value))}
      >
        {options.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
