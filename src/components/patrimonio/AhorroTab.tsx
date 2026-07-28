import { formatEUR } from "@/lib/format";

/** Mockup `tplAhorro` */
export function AhorroTab({
  ingresos,
  gastos,
  amortizacionCapital,
  capacidad,
}: {
  ingresos: number;
  gastos: number;
  amortizacionCapital: number;
  capacidad: number;
}) {
  const ahorroLiquido = ingresos - gastos;
  const tasaPct =
    ingresos > 0
      ? ((capacidad / ingresos) * 100).toLocaleString("es-ES", {
          maximumFractionDigits: 1,
        })
      : "0";

  return (
    <div className="grid2">
      <div className="darkcard">
        <div className="lbl">Capacidad de ahorro anual</div>
        <div className="big num">{formatEUR(capacidad)} / año</div>
        <div style={{ marginTop: 10 }}>
          <div className="row">
            <span>Ingresos</span>
            <b className="num">{formatEUR(ingresos)}</b>
          </div>
          <div className="row">
            <span>Gastos</span>
            <b className="num">−{formatEUR(gastos)}</b>
          </div>
          <div className="row">
            <span>Ahorro líquido</span>
            <b className="num">{formatEUR(ahorroLiquido)}</b>
          </div>
          <div className="row">
            <span>+ Reducción de deuda (amortización de capital)</span>
            <b className="num">{formatEUR(amortizacionCapital)}</b>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            border: "1px solid var(--line-2)",
            borderRadius: 10,
            background: "#fff",
            padding: "14px 16px",
          }}
        >
          <div className="lbl">Tasa de ahorro</div>
          <div style={{ fontSize: 22, fontWeight: 700 }} className="num">
            {tasaPct} %
          </div>
          <div className="tiny" style={{ marginTop: 2 }}>
            sobre los ingresos del año
          </div>
        </div>
        <div className="hint-info">
          <b>ⓘ</b>
          <span>
            El ahorro es un <b>resultado calculado</b> (ingresos − gastos +
            amortización). Esta pestaña es de solo lectura y no admite eventos.
          </span>
        </div>
      </div>
    </div>
  );
}
