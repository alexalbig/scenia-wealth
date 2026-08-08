"use client";

import { Button, Table, TBody, TD, TFoot, TH, THead, TR } from "@/components/ui";
import { RowCrud } from "@/components/patrimonio/RowCrud";
import { formatEUR } from "@/lib/format";
import { fuenteIngresoLabel, personaLabel } from "@/lib/patrimonio";
import type { Ingreso, Persona } from "@/lib/types";

export function IngresosTab({
  personas,
  ingresos,
  onEvento,
  onAdd,
  onEdit,
  onDelete,
}: {
  personas: Persona[];
  ingresos: Ingreso[];
  onEvento: () => void;
  onAdd: () => void;
  onEdit: (i: Ingreso) => void;
  onDelete: (id: string) => void;
}) {
  const total = ingresos.reduce((s, i) => s + i.importeAnual, 0);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div className="lbl">Ingresos · por persona y fuente</div>
        <div style={{ display: "flex", gap: 6 }}>
          <Button size="sm" variant="ghost" onClick={onAdd}>
            + Añadir
          </Button>
          <Button size="sm" onClick={onEvento}>
            ⚡ Evento
          </Button>
        </div>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Persona</TH>
            <TH>Fuente</TH>
            <TH className="right">Importe anual</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {ingresos.length === 0 && (
            <TR>
              <TD colSpan={4} className="mut">
                Sin ingresos. El alta alimenta el liquidador de base general.
              </TD>
            </TR>
          )}
          {ingresos.map((ing) => {
            const p = personas.find((x) => x.id === ing.personaId);
            return (
              <TR key={ing.id}>
                <TD>
                  <b>{p ? personaLabel(p) : ing.personaId}</b>
                </TD>
                <TD className="slt">{fuenteIngresoLabel(ing.fuente)}</TD>
                <TD className="right num strong">
                  {formatEUR(ing.importeAnual)}
                </TD>
                <TD className="right">
                  <RowCrud
                    onEdit={() => onEdit(ing)}
                    onDelete={() => onDelete(ing.id)}
                  />
                </TD>
              </TR>
            );
          })}
        </TBody>
        <TFoot>
          <TR>
            <TD colSpan={2}>Total ingresos</TD>
            <TD className="right num">{formatEUR(total)}</TD>
            <TD />
          </TR>
        </TFoot>
      </Table>
      <div className="tiny" style={{ marginTop: 10 }}>
        Los importes de la tabla son brutos. El motor liquida sobre la base
        liquidable (arts. 19/20 · cotizaciones SS en la persona, solo si las
        informas) — el rescate del plan se apila ahí, no sobre el bruto.
      </div>
    </>
  );
}
