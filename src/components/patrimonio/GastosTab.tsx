"use client";

import { Button, Card, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { formatEUR } from "@/lib/format";
import { labelVinculo } from "@/lib/patrimonio";
import type { Gasto, Inmueble, Persona, Sociedad } from "@/lib/types";

export function GastosTab({
  gastos,
  personas,
  inmuebles,
  sociedades,
  onEvento,
}: {
  gastos: Gasto[];
  personas: Persona[];
  inmuebles: Inmueble[];
  sociedades: Sociedad[];
  onEvento: () => void;
}) {
  const total = gastos.reduce((s, g) => s + g.importeAnual, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-upper">Gastos recurrentes</p>
          <p className="text-[11px] text-mute">
            Solo los intereses de deuda cuentan como gasto (no el capital)
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={onEvento}>
          + Evento genérico
        </Button>
      </div>

      <Card padding="sm">
        <Table>
          <THead>
            <TR>
              <TH>Categoría</TH>
              <TH>Vincular a</TH>
              <TH className="text-right">Importe anual</TH>
            </TR>
          </THead>
          <TBody>
            {gastos.map((g) => (
              <TR key={g.id}>
                <TD className="font-semibold">{g.categoria}</TD>
                <TD className="text-slate">
                  {labelVinculo(g, personas, inmuebles, sociedades)}
                </TD>
                <TD numeric>{formatEUR(g.importeAnual)}</TD>
              </TR>
            ))}
            {gastos.length === 0 && (
              <TR>
                <TD colSpan={3} className="py-6 text-center text-mute">
                  Sin gastos registrados.
                </TD>
              </TR>
            )}
          </TBody>
          {gastos.length > 0 && (
            <tfoot>
              <tr className="border-t border-line-2 bg-paper-2">
                <td className="px-3 py-2.5 text-[12px] font-semibold" colSpan={2}>
                  Total
                </td>
                <td className="px-3 py-2.5 text-right text-[12px] font-bold tabular-nums">
                  {formatEUR(total)}
                </td>
              </tr>
            </tfoot>
          )}
        </Table>
      </Card>
    </div>
  );
}
