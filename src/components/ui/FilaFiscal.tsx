import { formatEUR } from "@/lib/format";

/**
 * CT2 · Fila fiscal — marcado `.fila-fiscal` del mockup.
 * FIREWALL: ignora className; sin props de tono; tinta forzada en CSS.
 */
export function FilaFiscal({
  label = "Impuestos del periodo 2026–2033",
  cells,
  delta,
  className: _ignored,
}: {
  label?: string;
  cells: Array<{ name: string; amount: number }>;
  /** Δ absoluta entre alternativas (sin signo de “ganador”). */
  delta?: number | null;
  className?: string;
}) {
  void _ignored;
  return (
    <div className="fila-fiscal" data-firewall="neutral-only">
      <div className="ff-lbl">{label}</div>
      <div className="ff-cells">
        {cells.map((c) => (
          <div key={c.name} className="ff-cell">
            <div className="ff-name">{c.name}</div>
            <div className="ff-val">{formatEUR(c.amount)}</div>
          </div>
        ))}
        {delta != null && (
          <div className="ff-cell">
            <div className="ff-name">Δ diferencia</div>
            <div className="ff-val">{formatEUR(delta)}</div>
          </div>
        )}
      </div>
      <div className="ff-note">
        Cálculo orientativo · parámetros (a verificar) · Scenia muestra las
        cifras; la conclusión es del asesor.
      </div>
    </div>
  );
}
