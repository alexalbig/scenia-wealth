"use client";

import Link from "next/link";
import type { EstadoFiscalPersona } from "@/lib/fiscal";

/**
 * Estado declarado (sin_calculo) · sin cifra.
 * El enlace a Ingresos solo en motivo sin_ingresos.
 */
export function EstadoPersonaPanel({
  estado,
  clienteId,
}: {
  estado: Extract<EstadoFiscalPersona, { kind: "sin_calculo" }>;
  clienteId: string;
}) {
  return (
    <div className="idrow" style={{ marginBottom: 14 }}>
      <div className="idcell">
        <div className="lbl">Estado</div>
        <div className="v" style={{ fontSize: 14, marginTop: 6 }}>
          Sin cálculo
        </div>
        <div className="s" style={{ marginTop: 6 }}>
          {estado.aviso}
          {estado.motivo === "sin_ingresos" && (
            <>
              {" · "}
              <Link
                href={`/clientes/${clienteId}/patrimonio?tab=ingresos`}
                style={{
                  color: "var(--ink)",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Ir a Ingresos
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
