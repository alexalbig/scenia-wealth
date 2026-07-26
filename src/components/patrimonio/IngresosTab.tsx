"use client";

import { Button, Card, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { formatEUR } from "@/lib/format";
import { fuenteIngresoLabel, personaLabel } from "@/lib/patrimonio";
import type { Ingreso, Persona } from "@/lib/types";

export function IngresosTab({
  personas,
  ingresos,
  onEvento,
}: {
  personas: Persona[];
  ingresos: Ingreso[];
  onEvento: () => void;
}) {
  const total = ingresos.reduce((s, i) => s + i.importeAnual, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-upper">Ingresos del año</p>
          <p className="text-[11px] text-mute">
            Alimentan el motor fiscal (base general · regla ②)
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
              <TH>Persona</TH>
              <TH>Fuente</TH>
              <TH className="text-right">Importe anual</TH>
            </TR>
          </THead>
          <TBody>
            {ingresos.map((ing) => {
              const p = personas.find((x) => x.id === ing.personaId);
              return (
                <TR key={ing.id}>
                  <TD className="font-semibold">
                    {p ? personaLabel(p) : ing.personaId}
                  </TD>
                  <TD>{fuenteIngresoLabel(ing.fuente)}</TD>
                  <TD numeric>{formatEUR(ing.importeAnual)}</TD>
                </TR>
              );
            })}
            {ingresos.length === 0 && (
              <TR>
                <TD colSpan={3} className="py-6 text-center text-mute">
                  Sin ingresos registrados.
                </TD>
              </TR>
            )}
          </TBody>
          {ingresos.length > 0 && (
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

      {personas.map((p) => {
        const sub = ingresos
          .filter((i) => i.personaId === p.id)
          .reduce((s, i) => s + i.importeAnual, 0);
        if (sub === 0) return null;
        return (
          <p key={p.id} className="text-[12px] text-slate">
            <span className="font-semibold text-ink">{personaLabel(p)}</span>
            {" · "}
            <span className="tabular-nums">{formatEUR(sub)}</span>
            {" · input liquidador"}
          </p>
        );
      })}
    </div>
  );
}
