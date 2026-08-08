"use client";

import { Button, Table, TBody, TD, TFoot, TH, THead, TR } from "@/components/ui";
import { RowCrud } from "@/components/patrimonio/RowCrud";
import { formatEUR } from "@/lib/format";
import {
  AVISO_COTIZACIONES_SIN_INFORMAR,
  cuboDeFuente,
  fuenteAplicaCotizaciones,
  motivoFilaIngreso,
} from "@/lib/ingresos-fiscal";
import { fuenteIngresoLabel, personaLabel } from "@/lib/patrimonio";
import type { Ingreso, Persona } from "@/lib/types";

function cotizacionesInformadas(persona: Persona | undefined): number | null {
  if (
    persona?.cotizacionesSS != null &&
    Number.isFinite(persona.cotizacionesSS)
  ) {
    return persona.cotizacionesSS;
  }
  return null;
}

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
  let baseGeneral = 0;
  let baseAhorro = 0;
  let sinCalculo = 0;
  for (const i of ingresos) {
    const cubo = cuboDeFuente(i.fuente);
    if (cubo === "base_general") baseGeneral += i.importeAnual;
    else if (cubo === "base_ahorro") baseAhorro += i.importeAnual;
    else sinCalculo += i.importeAnual;
  }

  const faltaCotizaciones = ingresos.some((ing) => {
    if (!fuenteAplicaCotizaciones(ing.fuente)) return false;
    const p = personas.find((x) => x.id === ing.personaId);
    return cotizacionesInformadas(p) == null;
  });

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

      {ingresos.length === 0 ? (
        <div className="empty-invite">
          <div className="h2" style={{ marginBottom: 8, textAlign: "center" }}>
            Sin ingresos cargados
          </div>
          <p>
            Sin ellos no se puede calcular la fiscalidad ni la capacidad de
            ahorro, y la proyección parte de cero.
          </p>
          <Button size="sm" variant="ghost" onClick={onAdd}>
            + Añadir
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Persona</TH>
                <TH>Fuente</TH>
                <TH className="right">Importe anual</TH>
                <TH className="right">Cotizaciones SS</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {ingresos.map((ing) => {
                const p = personas.find((x) => x.id === ing.personaId);
                const motivo = motivoFilaIngreso(ing.fuente);
                const aplicaCotiz = fuenteAplicaCotizaciones(ing.fuente);
                const cotiz = aplicaCotiz
                  ? cotizacionesInformadas(p)
                  : null;
                const sinInformar = aplicaCotiz && cotiz == null;

                return (
                  <TR key={ing.id}>
                    <TD>
                      <b>{p ? personaLabel(p) : ing.personaId}</b>
                    </TD>
                    <TD className="slt">
                      {fuenteIngresoLabel(ing.fuente)}
                      {motivo && (
                        <div className="tiny mut" style={{ marginTop: 4 }}>
                          {motivo}
                        </div>
                      )}
                    </TD>
                    <TD className="right num strong">
                      {formatEUR(ing.importeAnual)}
                    </TD>
                    <TD className="right">
                      {aplicaCotiz ? (
                        sinInformar ? (
                          <span className="hueco">sin informar</span>
                        ) : (
                          <span className="num">{formatEUR(cotiz!)}</span>
                        )
                      ) : null}
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
                <TD colSpan={2}>Total</TD>
                <TD className="right num">{formatEUR(total)}</TD>
                <TD />
                <TD />
              </TR>
              <TR>
                <TD colSpan={2} className="mut">
                  Base general
                </TD>
                <TD className="right num mut">
                  {baseGeneral > 0 ? formatEUR(baseGeneral) : "—"}
                </TD>
                <TD />
                <TD />
              </TR>
              <TR>
                <TD colSpan={2} className="mut">
                  Base del ahorro
                </TD>
                <TD className="right num mut">
                  {baseAhorro > 0 ? formatEUR(baseAhorro) : "—"}
                </TD>
                <TD />
                <TD />
              </TR>
              <TR>
                <TD colSpan={2} className="mut">
                  Sin cálculo
                </TD>
                <TD className="right num mut">
                  {sinCalculo > 0 ? formatEUR(sinCalculo) : "—"}
                </TD>
                <TD />
                <TD />
              </TR>
            </TFoot>
          </Table>
          {faltaCotizaciones && (
            <div className="tiny mut" style={{ marginTop: 10 }}>
              {AVISO_COTIZACIONES_SIN_INFORMAR}
            </div>
          )}
          <div className="tiny" style={{ marginTop: 10 }}>
            Los importes de la tabla son brutos. El motor liquida sobre la base
            liquidable (arts. 19/20 · cotizaciones SS en la persona, solo si las
            informas) — el rescate del plan se apila ahí, no sobre el bruto.
          </div>
        </>
      )}
    </>
  );
}
