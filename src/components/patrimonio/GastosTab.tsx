"use client";

import {
  Button,
  Pill,
  Table,
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { RowCrud } from "@/components/patrimonio/RowCrud";
import { formatEUR } from "@/lib/format";
import { labelVinculo } from "@/lib/patrimonio";
import type {
  Gasto,
  Inmueble,
  OtroActivo,
  Persona,
  Sociedad,
} from "@/lib/types";

/** Mockup `tplGastos` */
export function GastosTab({
  gastos,
  personas,
  inmuebles,
  sociedades,
  otros,
  onEvento,
  onAdd,
  onEdit,
  onDelete,
}: {
  gastos: Gasto[];
  personas: Persona[];
  inmuebles: Inmueble[];
  sociedades: Sociedad[];
  otros: OtroActivo[];
  onEvento: () => void;
  onAdd: () => void;
  onEdit: (g: Gasto) => void;
  onDelete: (id: string) => void;
}) {
  const total = gastos.reduce((s, g) => s + g.importeAnual, 0);

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
        <div className="lbl">Gastos · por categoría</div>
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
            <TH>Categoría</TH>
            <TH className="right">Importe anual</TH>
            <TH>Vinculado a</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {gastos.length === 0 && (
            <TR>
              <TD colSpan={4} className="mut">
                Sin gastos.
              </TD>
            </TR>
          )}
          {gastos.map((g) => {
            const vinc = labelVinculo(
              g,
              personas,
              inmuebles,
              sociedades,
              otros,
            );
            return (
              <TR key={g.id}>
                <TD>
                  <b>{g.categoria}</b>
                </TD>
                <TD className="right num strong">
                  {formatEUR(g.importeAnual)}
                </TD>
                <TD>
                  {vinc === "Sin vincular" ? (
                    <span className="mut">Sin vincular</span>
                  ) : (
                    <Pill tone="blue">{vinc}</Pill>
                  )}
                </TD>
                <TD className="right">
                  <RowCrud
                    onEdit={() => onEdit(g)}
                    onDelete={() => onDelete(g.id)}
                  />
                </TD>
              </TR>
            );
          })}
        </TBody>
        <TFoot>
          <TR>
            <TD>Total gastos</TD>
            <TD className="right num">{formatEUR(total)}</TD>
            <TD colSpan={2} />
          </TR>
        </TFoot>
      </Table>
      <div className="tiny" style={{ marginTop: 10 }}>
        Solo los <b>intereses</b> de la deuda cuentan como gasto; la amortización
        de capital es ahorro.
      </div>
    </>
  );
}
