import { formatEUR } from "@/lib/format";

/**
 * CT2 · Fila fiscal — marcado `.fila-fiscal` del mockup.
 * FIREWALL: ignora className; sin props de tono; tinta forzada en CSS.
 *
 * Muestra el impacto del primer ejercicio (no acumulación multi-año).
 */
export function FilaFiscal({
  label,
  cells,
  delta,
  parcial = false,
  motivosParcial,
  sobreDatoIntroducido = false,
  parametrosAVerificar = true,
  className: _ignored,
}: {
  label?: string;
  cells: Array<{ name: string; amount: number; id?: string }>;
  /** Δ absoluta entre alternativas (sin signo de “ganador”). */
  delta?: number | null;
  /** Hay eventos sin liquidador excluidos del total */
  parcial?: boolean;
  /** Qué titular / evento y por qué (v14). */
  motivosParcial?: string[];
  /**
   * Alguna cuota usa base con dato introducido (pensión estimada).
   * No implica parcial.
   */
  sobreDatoIntroducido?: boolean;
  parametrosAVerificar?: boolean;
  className?: string;
}) {
  void _ignored;
  const lbl = label ?? "Impacto fiscal · primer año · orientativo";
  const motivos =
    motivosParcial && motivosParcial.length > 0
      ? motivosParcial.join(" · ")
      : null;

  return (
    <div className="fila-fiscal" data-firewall="neutral-only">
      <div className="ff-lbl">{lbl}</div>
      <div className="ff-cells">
        {cells.map((c, i) => (
          <div key={c.id ?? `${c.name}-${i}`} className="ff-cell">
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
        {parcial
          ? "Cálculo parcial · hay partes sin liquidador (no sumadas) · "
          : "Cálculo "}
        orientativo
        {parametrosAVerificar ? " · parámetros (a verificar)" : ""}
        {sobreDatoIntroducido
          ? " · calculado sobre una pensión estimada por el asesor"
          : ""}
        {motivos ? ` · ${motivos}` : ""} · Scenia muestra las cifras; la
        conclusión es del asesor. Solo el primer ejercicio de cada evento (sin
        acumulación multi-año).
      </div>
    </div>
  );
}
