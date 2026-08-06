"use client";

import { formatEUR } from "@/lib/format";
import { resumenGastosVinculados } from "@/lib/patrimonio";
import type { Gasto } from "@/lib/types";

/**
 * Bloque de ficha: coste anual de gastos vinculados al elemento.
 */
export function GastosVinculadosBlock({
  gastos,
  valorElemento,
}: {
  gastos: Gasto[];
  valorElemento?: number | null;
}) {
  if (gastos.length === 0) return null;

  const { total, lineas, pctValor } = resumenGastosVinculados(
    gastos,
    valorElemento,
  );
  const pctTxt =
    pctValor != null
      ? ` · ${pctValor.toLocaleString("es-ES", {
          maximumFractionDigits: 1,
          minimumFractionDigits: 0,
        })} % de su valor`
      : "";

  return (
    <div
      style={{
        border: "1px solid var(--line-2)",
        borderRadius: 10,
        background: "#fff",
        padding: "13px 15px",
        marginTop: 16,
      }}
    >
      <div className="lbl" style={{ marginBottom: 6 }}>
        Gastos vinculados
      </div>
      <div className="v" style={{ fontSize: 14, marginBottom: 8 }}>
        {formatEUR(total)}/año{pctTxt}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {lineas.map((l) => (
          <div
            key={`${l.categoria}-${l.importeAnual}`}
            className="sub"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 0",
            }}
          >
            <span>{l.categoria}</span>
            <span className="num">{formatEUR(l.importeAnual)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
