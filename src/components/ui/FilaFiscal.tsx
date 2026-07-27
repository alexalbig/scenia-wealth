import { formatDeltaEUR, formatEUR } from "@/lib/format";

/**
 * CT2 · Fila fiscal neutra
 *
 * FIREWALL: colores fijados vía CSS `[data-firewall="neutral-only"]`
 * (solo ink / slate / mute). No acepta props de color/tone/winner.
 * className externo se ignora a propósito — no puede pintar verde/rojo/ámbar.
 */
export interface FilaFiscalProps {
  label?: string;
  scenarioA: string;
  amountA: number;
  scenarioB: string;
  amountB: number;
  /** Ignorado — el firewall no admite clases de color externas */
  className?: string;
}

export function FilaFiscal({
  label = "Impuestos del periodo",
  scenarioA,
  amountA,
  scenarioB,
  amountB,
}: FilaFiscalProps) {
  const delta = amountA - amountB;

  return (
    <div data-component="fila-fiscal" data-firewall="neutral-only">
      <div className="ff-lbl">{label}</div>
      <div className="ff-cells" style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
        <div
          className="ff-cell"
          style={{
            flex: 1,
            minWidth: 120,
            padding: "2px 16px 2px 0",
          }}
        >
          <div className="ff-name">{scenarioA}</div>
          <div className="ff-val">{formatEUR(amountA, true)}</div>
        </div>
        <div
          className="ff-cell"
          style={{
            flex: 1,
            minWidth: 120,
            padding: "2px 16px",
            borderLeft: "1px solid var(--line)",
          }}
        >
          <div className="ff-name">{scenarioB}</div>
          <div className="ff-val">{formatEUR(amountB, true)}</div>
        </div>
        <div
          className="ff-cell"
          style={{
            flex: 1,
            minWidth: 100,
            padding: "2px 0 2px 16px",
            borderLeft: "1px solid var(--line)",
          }}
        >
          <div className="ff-name">Δ</div>
          <div className="ff-val">{formatDeltaEUR(delta, true)}</div>
        </div>
      </div>
      <p className="ff-note">
        Cálculo orientativo · Scenia muestra; el asesor concluye. No se corona un
        ganador.
      </p>
    </div>
  );
}
