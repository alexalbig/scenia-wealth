"use client";

import { Button, Card, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { formatEUR, formatPercent } from "@/lib/format";
import { formatTitularidades } from "@/lib/patrimonio";
import type { Inmueble, Pasivo, Persona } from "@/lib/types";

export function PasivosTab({
  personas,
  pasivos,
  inmuebles,
  onEvento,
}: {
  personas: Persona[];
  pasivos: Pasivo[];
  inmuebles: Inmueble[];
  onEvento: (nombre: string) => void;
}) {
  const hipotecas = pasivos.filter((p) => p.tipo === "hipoteca");
  const creditos = pasivos.filter((p) => p.tipo === "credito");
  const total = pasivos.reduce((s, p) => s + p.capitalPendiente, 0);

  function renderGroup(title: string, items: Pasivo[], withInmueble: boolean) {
    return (
      <Card padding="sm">
        <p className="label-upper mb-2">{title}</p>
        <Table>
          <THead>
            <TR>
              <TH>Prestamista</TH>
              <TH className="text-right">Capital pendiente</TH>
              <TH className="text-right">Tipo</TH>
              <TH className="text-right">Cuota</TH>
              {withInmueble && <TH>Inmueble</TH>}
              <TH>Titularidad</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {items.map((p) => {
              const inm = inmuebles.find((i) => i.id === p.inmuebleId);
              return (
                <TR key={p.id}>
                  <TD className="font-semibold">{p.prestamista}</TD>
                  <TD numeric>{formatEUR(p.capitalPendiente)}</TD>
                  <TD numeric>{formatPercent(p.tipoInteres)}</TD>
                  <TD numeric>{formatEUR(p.cuotaMensual)}/mes</TD>
                  {withInmueble && <TD>{inm?.nombre ?? "—"}</TD>}
                  <TD className="text-[11px] text-slate">
                    {formatTitularidades(p.titularidades, personas)}
                  </TD>
                  <TD>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEvento(p.prestamista)}
                    >
                      Evento
                    </Button>
                  </TD>
                </TR>
              );
            })}
            {items.length === 0 && (
              <TR>
                <TD
                  colSpan={withInmueble ? 7 : 6}
                  className="py-4 text-center text-mute"
                >
                  Sin registros.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {renderGroup("Hipotecas", hipotecas, true)}
      {renderGroup("Créditos personales", creditos, false)}
      <p className="text-right text-[13px] font-bold tabular-nums text-ink">
        Total pasivos {formatEUR(total)}
      </p>
      <p className="text-[11px] text-mute">
        Separación interés/capital · nivel 1 orientativo: los intereses van a
        Gastos; la amortización de capital alimenta Ahorro.
      </p>
    </div>
  );
}
