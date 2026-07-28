"use client";

import { useState } from "react";
import { Button, SheetPad, Toast } from "@/components/ui";
import { formatFechaDMY } from "@/lib/patrimonio";
import type { HistorialInforme } from "@/lib/types";

/**
 * P7 · Historial — marcado literal del mockup `renderHistorial`.
 */
export function HistorialView({ entries }: { entries: HistorialInforme[] }) {
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  return (
    <SheetPad>
      <div className="lbl" style={{ marginBottom: 4 }}>
        Historial
      </div>
      <div className="h2" style={{ marginBottom: 14 }}>
        Informes emitidos
      </div>

      {entries.length === 0 ? (
        <div className="empty">
          Aún no hay informes. Genera el primero desde Patrimonio o desde el
          comparador.
        </div>
      ) : (
        <div className="tl">
          {entries.map((h) => (
            <div key={h.id} className="tl-item">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                    {h.titulo}
                  </div>
                  <div className="tiny">
                    {formatFechaDMY(h.fecha)} · {h.tipo} · con Nota del asesor
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    flash("Descarga de PDF simulada en esta demo")
                  }
                >
                  Descargar PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="tiny" style={{ marginTop: 10 }}>
        Cada informe queda registrado con su fecha — el argumento de renovación
        del fee.
      </div>
      <Toast message={toast} />
    </SheetPad>
  );
}
