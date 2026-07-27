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
  const total = pasivos.reduce((s, p) => s + p.capitalPendiente, 0);

  return (
    <div className="space-y-3">
      <p className="label-upper">Pasivos</p>

      <Card padding="none" className="overflow-hidden">
        <Table>
          <THead>
            <TR>
              <TH>Deuda</TH>
              <TH>Prestamista</TH>
              <TH className="text-right">Capital pendiente</TH>
              <TH className="text-right">Tipo</TH>
              <TH className="text-right">Cuota</TH>
              <TH>Inmueble</TH>
              <TH>Titularidad</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {pasivos.map((p) => {
              const inm = inmuebles.find((i) => i.id === p.inmuebleId);
              const label =
                p.tipo === "hipoteca"
                  ? `Hipoteca · ${p.prestamista}`
                  : `Crédito · ${p.prestamista}`;
              return (
                <TR key={p.id}>
                  <TD className="font-semibold">{label}</TD>
                  <TD className="text-slate">{p.prestamista}</TD>
                  <TD numeric>{formatEUR(p.capitalPendiente)}</TD>
                  <TD numeric>{formatPercent(p.tipoInteres)}</TD>
                  <TD numeric>{formatEUR(p.cuotaMensual)}/mes</TD>
                  <TD className="text-slate">{inm?.nombre ?? "—"}</TD>
                  <TD className="text-[11px] text-slate">
                    {formatTitularidades(p.titularidades, personas)}
                  </TD>
                  <TD className="text-right">
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
            {pasivos.length === 0 && (
              <TR>
                <TD colSpan={8} className="py-6 text-center text-mute">
                  Sin pasivos.
                </TD>
              </TR>
            )}
          </TBody>
          {pasivos.length > 0 && (
            <TFoot>
              <TR>
                <TD colSpan={2}>Total pasivos</TD>
                <TD numeric>{formatEUR(total)}</TD>
                <TD colSpan={5} />
              </TR>
            </TFoot>
          )}
        </Table>
      </Card>

      <div className="hint-info">
        <b>ⓘ</b>
        <span>
          La cuota nunca va entera a un sitio: los <b>intereses</b> cuentan como
          gasto y la <b>amortización de capital</b> como ahorro. Aproximación
          anual orientativa (nivel 1).
        </span>
      </div>
    </div>
  );
}
