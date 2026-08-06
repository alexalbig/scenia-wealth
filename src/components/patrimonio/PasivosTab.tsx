"use client";

import { Button, Table, TBody, TD, TFoot, TH, THead, TitBar, TR } from "@/components/ui";
import { RowCrud } from "@/components/patrimonio/RowCrud";
import { formatEUR } from "@/lib/format";
import { formatTitularidades, titularidadSegments } from "@/lib/patrimonio";
import type { Inmueble, Pasivo, Persona } from "@/lib/types";

export function PasivosTab({
  personas,
  pasivos,
  inmuebles,
  onEvento,
  onAdd,
  onEdit,
  onDelete,
}: {
  personas: Persona[];
  pasivos: Pasivo[];
  inmuebles: Inmueble[];
  onEvento: (nombre: string, elementoId: string) => void;
  onAdd: () => void;
  onEdit: (p: Pasivo) => void;
  onDelete: (id: string) => void;
}) {
  const total = pasivos.reduce((s, p) => s + p.capitalPendiente, 0);

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
        <div className="lbl">Pasivos</div>
        <div style={{ display: "flex", gap: 6 }}>
          <Button size="sm" variant="ghost" onClick={onAdd}>
            + Añadir
          </Button>
        </div>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Deuda</TH>
            <TH>Prestamista</TH>
            <TH className="right">Capital pendiente</TH>
            <TH className="right">Tipo</TH>
            <TH>Modalidad</TH>
            <TH className="right">Plazo</TH>
            <TH className="right">Cuota</TH>
            <TH>Inmueble</TH>
            <TH>Titularidad</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {pasivos.length === 0 && (
            <TR>
              <TD colSpan={10} className="mut">
                Sin pasivos.
              </TD>
            </TR>
          )}
          {pasivos.map((p) => {
            const inm = inmuebles.find((i) => i.id === p.inmuebleId);
            const label =
              p.tipo === "hipoteca"
                ? `Hipoteca ${p.prestamista}`
                : `Crédito ${p.prestamista}`;
            const modalidadLabel =
              p.modalidadInteres === "fijo"
                ? "Fijo"
                : p.modalidadInteres === "variable"
                  ? "Variable"
                  : p.modalidadInteres === "mixto"
                    ? "Mixto"
                    : "—";
            return (
              <TR key={p.id}>
                <TD>
                  <b>{label}</b>
                </TD>
                <TD className="slt">{p.prestamista}</TD>
                <TD className="right num strong">
                  {formatEUR(p.capitalPendiente)}
                </TD>
                <TD className="right num">
                  {(p.tipoInteres * 100).toLocaleString("es-ES")} %
                </TD>
                <TD className="slt">{modalidadLabel}</TD>
                <TD className="right num">
                  {p.plazoRestanteAnios != null
                    ? `${p.plazoRestanteAnios} años`
                    : "—"}
                </TD>
                <TD className="right num">{formatEUR(p.cuotaMensual)}/mes</TD>
                <TD className="slt">{inm?.nombre ?? "—"}</TD>
                <TD>
                  <span className="tiny">
                    {formatTitularidades(p.titularidades, personas)}
                  </span>
                  <TitBar segments={titularidadSegments(p.titularidades)} />
                </TD>
                <TD className="right">
                  <span
                    style={{
                      display: "inline-flex",
                      gap: 4,
                      alignItems: "center",
                    }}
                  >
                    <RowCrud
                      onEdit={() => onEdit(p)}
                      onDelete={() => onDelete(p.id)}
                    />
                    <Button size="sm" onClick={() => onEvento(label, p.id)}>
                      ⚡ Evento
                    </Button>
                  </span>
                </TD>
              </TR>
            );
          })}
        </TBody>
        <TFoot>
          <TR>
            <TD colSpan={2}>Total pasivos</TD>
            <TD className="right num">{formatEUR(total)}</TD>
            <TD colSpan={7} />
          </TR>
        </TFoot>
      </Table>
      <div className="hint-info" style={{ marginTop: 12 }}>
        <b>ⓘ</b>
        <span>
          La cuota nunca va entera a un sitio: los <b>intereses</b> cuentan como
          gasto y la <b>amortización de capital</b> como ahorro. Aproximación
          anual orientativa (nivel 1).
        </span>
      </div>
    </>
  );
}
