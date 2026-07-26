import { formatDeltaEUR, formatEUR } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * CT2 · Fila fiscal neutra
 *
 * FIREWALL incorporado por diseño:
 * - Sin props de color / tone / intent / winner
 * - Solo tinta neutra (--ink / --blue / --mute)
 * - "orientativo" siempre presente
 * - Nunca corona un ganador
 *
 * Imposible pintar verde/rojo/ámbar desde fuera.
 */
export interface FilaFiscalProps {
  label?: string;
  /** Nombre escenario A */
  scenarioA: string;
  /** Impuestos del periodo A (€) */
  amountA: number;
  /** Nombre escenario B */
  scenarioB: string;
  /** Impuestos del periodo B (€) */
  amountB: number;
  className?: string;
}

export function FilaFiscal({
  label = "Impuestos del periodo",
  scenarioA,
  amountA,
  scenarioB,
  amountB,
  className,
}: FilaFiscalProps) {
  const delta = amountA - amountB;

  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-[8px] border border-line-2 bg-paper-2 px-4 py-3 text-[12px]",
        className,
      )}
      data-component="fila-fiscal"
      data-firewall="neutral-only"
    >
      <span className="font-semibold text-ink">{label}</span>
      <span className="tabular-nums text-ink">
        <span className="text-mute">{scenarioA}</span>{" "}
        <span className="font-bold">{formatEUR(amountA, true)}</span>
      </span>
      <span className="tabular-nums text-ink">
        <span className="text-mute">{scenarioB}</span>{" "}
        <span className="font-bold">{formatEUR(amountB, true)}</span>
      </span>
      <span className="tabular-nums font-bold text-blue">
        Δ {formatDeltaEUR(delta, true)}
      </span>
      <span className="label-upper !normal-case !tracking-normal text-mute">
        orientativo
      </span>
    </div>
  );
}
