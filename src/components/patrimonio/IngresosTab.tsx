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
          <p className="label-upper">Ingresos · por persona y fuente</p>
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
            <TFoot>
              <TR>
                <TD colSpan={2}>Total ingresos</TD>
                <TD numeric>{formatEUR(total)}</TD>
              </TR>
            </TFoot>
          )}
        </Table>
      </Card>

      <p className="text-[11px] text-mute">
        El total por persona es el input del liquidador de base general — el
        rescate del plan se apila sobre estos ingresos.
      </p>
    </div>
  );
}
