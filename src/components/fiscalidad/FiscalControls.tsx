"use client";

import { cn } from "@/lib/cn";
import type { EurMode } from "@/lib/fiscal";
import type { Persona } from "@/lib/types";
import { personaLabel } from "@/lib/patrimonio";

const selectClass =
  "mt-1 w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-blue";

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
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-[180px] flex-1">
        <span className="label-upper">Persona</span>
        <select
          className={selectClass}
          value={personaId}
          onChange={(e) => onPersona(e.target.value)}
        >
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {personaLabel(p)}
            </option>
          ))}
        </select>
      </label>

      <label className="min-w-[120px]">
        <span className="label-upper">Año</span>
        <select
          className={selectClass}
          value={anio}
          onChange={(e) => onAnio(Number(e.target.value))}
        >
          {anios.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="label-upper">Unidad</span>
        <div
          role="group"
          aria-label="Unidad monetaria"
          className="mt-1 flex rounded-[8px] border border-line-2 bg-paper p-0.5"
        >
          <ToggleBtn
            active={eurMode === "hoy"}
            onClick={() => onEurMode("hoy")}
          >
            € hoy
          </ToggleBtn>
          <ToggleBtn
            active={eurMode === "futuro"}
            onClick={() => onEurMode("futuro")}
          >
            € futuro
          </ToggleBtn>
        </div>
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 rounded-[6px] px-3 text-[12px] font-semibold transition-colors",
        active ? "bg-blue text-white" : "bg-transparent text-mute hover:text-ink-3",
      )}
    >
      {children}
    </button>
  );
}
