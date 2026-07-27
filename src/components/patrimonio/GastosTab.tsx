"use client";

import {
  Button,
  Card,
  Table,
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TR,
} from "@/components/ui";
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
          <p className="label-upper">Gastos · por categoría</p>
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
            <TFoot>
              <TR>
                <TD>Total gastos</TD>
                <TD numeric>{formatEUR(total)}</TD>
                <TD />
              </TR>
            </TFoot>
          )}
        </Table>
      </Card>

      <p className="text-[11px] text-mute">
        Solo los <b className="font-semibold text-ink-3">intereses</b> de la
        deuda cuentan como gasto; la amortización de capital es ahorro.
      </p>
    </div>
  );
}
