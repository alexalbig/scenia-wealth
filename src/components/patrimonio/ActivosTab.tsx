"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  LiqBadge,
  Table,
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TitBar,
  TR,
} from "@/components/ui";
import { RowCrud } from "@/components/patrimonio/RowCrud";
import { formatEUR } from "@/lib/format";
import {
  formatTitularidades,
  liquidezInstrumento,
  tipoFiscalMockup,
  tipoOtroLabel,
  titularidadSegments,
} from "@/lib/patrimonio";
import type {
  Inmueble,
  Instrumento,
  OtroActivo,
  Pasivo,
  Persona,
  Sociedad,
} from "@/lib/types";

function EvBtn({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      ⚡ Evento
    </Button>
  );
}

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      + Añadir
    </Button>
  );
}

export function ActivosTab({
  clienteId,
  personas,
  instrumentos,
  inmuebles,
  sociedades,
  otros,
  pasivos,
  onEvento,
  onAdd,
  onEditInstrumento,
  onEditInmueble,
  onEditSociedad,
  onEditOtro,
  onDeleteInstrumento,
  onDeleteInmueble,
  onDeleteSociedad,
  onDeleteOtro,
}: {
  clienteId: string;
  personas: Persona[];
  instrumentos: Instrumento[];
  inmuebles: Inmueble[];
  sociedades: Sociedad[];
  otros: OtroActivo[];
  pasivos: Pasivo[];
  onEvento: (
    contexto: "instrumento" | "inmueble" | "sociedad" | "otro",
    nombre: string,
  ) => void;
  onAdd: (kind: "instrumento" | "inmueble" | "sociedad" | "otro") => void;
  onEditInstrumento: (i: Instrumento) => void;
  onEditInmueble: (i: Inmueble) => void;
  onEditSociedad: (s: Sociedad) => void;
  onEditOtro: (a: OtroActivo) => void;
  onDeleteInstrumento: (id: string) => void;
  onDeleteInmueble: (id: string) => void;
  onDeleteSociedad: (id: string) => void;
  onDeleteOtro: (id: string) => void;
}) {
  const router = useRouter();
  const totalFin = instrumentos.reduce((s, i) => s + i.valor, 0);
  const totalInm = inmuebles.reduce((s, i) => s + i.valor, 0);
  const totalOtros = otros.reduce((s, a) => s + a.valor, 0);
  const totalGeneral = totalFin + totalInm + totalOtros;
  const yearOf = (iso: string) => iso.slice(0, 4);

  function participacionLabel(s: Sociedad) {
    return Object.entries(s.participaciones)
      .map(([pid, pct]) => {
        const p = personas.find((x) => x.id === pid);
        return `${p ? p.nombre : pid} ${Math.round(pct * 100)} %`;
      })
      .join(" · ");
  }

  return (
    <>
      <div className="lbl" style={{ marginBottom: 8 }}>
        Activos · agrupados por tipo
      </div>
      <Table>
        <TBody>
          <TR className="group-head">
            <TD colSpan={8}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Activos financieros</span>
                <AddBtn onClick={() => onAdd("instrumento")} />
              </div>
            </TD>
          </TR>
          <TR>
            <TD colSpan={8} style={{ padding: 0, border: "none" }}>
              <Table>
                <THead>
                  <TR>
                    <TH>Instrumento</TH>
                    <TH>Tipo fiscal</TH>
                    <TH className="right">Valor</TH>
                    <TH>Adquisición</TH>
                    <TH className="right">Plusvalía latente</TH>
                    <TH>Titularidad</TH>
                    <TH>Liquidez</TH>
                    <TH />
                  </TR>
                </THead>
                <TBody>
                  {instrumentos.length === 0 && (
                    <TR>
                      <TD colSpan={8} className="mut">
                        Sin instrumentos. «+ Añadir» carga lo que el cliente ya
                        tiene.
                      </TD>
                    </TR>
                  )}
                  {instrumentos.map((i) => (
                    <TR
                      key={i.id}
                      className="rowlink"
                      onClick={() =>
                        router.push(
                          `/clientes/${clienteId}/fichas/portfolio/${i.id}`,
                        )
                      }
                    >
                      <TD>
                        <b>{i.nombre}</b>
                      </TD>
                      <TD className="slt">{tipoFiscalMockup(i.tipoFiscal)}</TD>
                      <TD className="right num strong">{formatEUR(i.valor)}</TD>
                      <TD className="num slt">{yearOf(i.fechaAdquisicion)}</TD>
                      <TD className="right num">
                        {i.plusvaliaLatente != null ? (
                          <span className="gain">
                            +{formatEUR(i.plusvaliaLatente)}
                          </span>
                        ) : (
                          <span className="mut">—</span>
                        )}
                      </TD>
                      <TD>
                        <span className="tiny">
                          {formatTitularidades(i.titularidades, personas)}
                        </span>
                        <TitBar
                          segments={titularidadSegments(i.titularidades)}
                        />
                      </TD>
                      <TD>
                        <LiqBadge level={liquidezInstrumento(i.tipoFiscal)} />
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
                            onEdit={() => onEditInstrumento(i)}
                            onDelete={() => onDeleteInstrumento(i.id)}
                          />
                          <EvBtn
                            onClick={() => onEvento("instrumento", i.nombre)}
                          />
                        </span>
                      </TD>
                    </TR>
                  ))}
                  <TR className="subtotal">
                    <TD colSpan={2}>Subtotal activos financieros</TD>
                    <TD className="right num">{formatEUR(totalFin)}</TD>
                    <TD colSpan={5} />
                  </TR>
                </TBody>
              </Table>
            </TD>
          </TR>

          <TR className="group-head">
            <TD colSpan={8}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Inmuebles</span>
                <AddBtn onClick={() => onAdd("inmueble")} />
              </div>
            </TD>
          </TR>
          <TR>
            <TD colSpan={8} style={{ padding: 0, border: "none" }}>
              <Table>
                <THead>
                  <TR>
                    <TH>Inmueble</TH>
                    <TH className="right">Valor</TH>
                    <TH>Adquisición</TH>
                    <TH>Hipoteca asociada</TH>
                    <TH>Titularidad</TH>
                    <TH>Liquidez</TH>
                    <TH />
                  </TR>
                </THead>
                <TBody>
                  {inmuebles.length === 0 && (
                    <TR>
                      <TD colSpan={7} className="mut">
                        Sin inmuebles.
                      </TD>
                    </TR>
                  )}
                  {inmuebles.map((inm) => {
                    const hip = pasivos.find((p) => p.id === inm.pasivoId);
                    return (
                      <TR
                        key={inm.id}
                        className="rowlink"
                        onClick={() =>
                          router.push(
                            `/clientes/${clienteId}/fichas/inmueble/${inm.id}`,
                          )
                        }
                      >
                        <TD>
                          <b>{inm.nombre}</b>
                        </TD>
                        <TD className="right num strong">
                          {formatEUR(inm.valor)}
                        </TD>
                        <TD className="num slt">
                          {yearOf(inm.fechaAdquisicion)}
                        </TD>
                        <TD className="slt">
                          {hip ? `Hipoteca ${hip.prestamista}` : "—"}
                        </TD>
                        <TD>
                          <span className="tiny">
                            {formatTitularidades(inm.titularidades, personas)}
                          </span>
                          <TitBar
                            segments={titularidadSegments(inm.titularidades)}
                          />
                        </TD>
                        <TD>
                          <LiqBadge level="b" />
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
                              onEdit={() => onEditInmueble(inm)}
                              onDelete={() => onDeleteInmueble(inm.id)}
                            />
                            <EvBtn
                              onClick={() => onEvento("inmueble", inm.nombre)}
                            />
                          </span>
                        </TD>
                      </TR>
                    );
                  })}
                  <TR className="subtotal">
                    <TD>Subtotal inmuebles</TD>
                    <TD className="right num">{formatEUR(totalInm)}</TD>
                    <TD colSpan={5} />
                  </TR>
                </TBody>
              </Table>
            </TD>
          </TR>

          <TR className="group-head">
            <TD colSpan={8}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Inversiones empresariales</span>
                <AddBtn onClick={() => onAdd("sociedad")} />
              </div>
            </TD>
          </TR>
          <TR>
            <TD colSpan={8} style={{ padding: 0, border: "none" }}>
              <Table>
                <THead>
                  <TR>
                    <TH>Sociedad</TH>
                    <TH>Participación</TH>
                    <TH className="right">Valor</TH>
                    <TH>Liquidez</TH>
                    <TH />
                  </TR>
                </THead>
                <TBody>
                  {sociedades.length === 0 && (
                    <TR>
                      <TD colSpan={5} className="mut">
                        Sin sociedades.
                      </TD>
                    </TR>
                  )}
                  {sociedades.map((s) => (
                    <TR
                      key={s.id}
                      className="rowlink"
                      onClick={() =>
                        router.push(
                          `/clientes/${clienteId}/fichas/sociedad/${s.id}`,
                        )
                      }
                    >
                      <TD>
                        <b>{s.nombre}</b>
                      </TD>
                      <TD className="slt">{participacionLabel(s)}</TD>
                      <TD className="right">
                        {s.valor != null && Number.isFinite(s.valor) ? (
                          <span className="num">{formatEUR(s.valor)}</span>
                        ) : (
                          <span className="mut">no valorada</span>
                        )}
                      </TD>
                      <TD>
                        <LiqBadge level="b" />
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
                            onEdit={() => onEditSociedad(s)}
                            onDelete={() => onDeleteSociedad(s.id)}
                          />
                          <EvBtn
                            onClick={() => onEvento("sociedad", s.nombre)}
                          />
                        </span>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TD>
          </TR>

          <TR className="group-head">
            <TD colSpan={8}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Otros activos</span>
                <AddBtn onClick={() => onAdd("otro")} />
              </div>
            </TD>
          </TR>
          <TR>
            <TD colSpan={8} style={{ padding: 0, border: "none" }}>
              <Table>
                <THead>
                  <TR>
                    <TH>Activo</TH>
                    <TH>Tipo</TH>
                    <TH className="right">Valor</TH>
                    <TH>Titularidad</TH>
                    <TH>Liquidez</TH>
                    <TH />
                  </TR>
                </THead>
                <TBody>
                  {otros.length === 0 && (
                    <TR>
                      <TD colSpan={6} className="mut">
                        Sin otros activos.
                      </TD>
                    </TR>
                  )}
                  {otros.map((a) => (
                    <TR
                      key={a.id}
                      className="rowlink"
                      onClick={() =>
                        router.push(
                          `/clientes/${clienteId}/fichas/otro/${a.id}`,
                        )
                      }
                    >
                      <TD>
                        <b>{a.nombre}</b>
                      </TD>
                      <TD className="slt">{tipoOtroLabel(a.tipo)}</TD>
                      <TD className="right num strong">{formatEUR(a.valor)}</TD>
                      <TD>
                        <span className="tiny">
                          {formatTitularidades(a.titularidades, personas)}
                        </span>
                        <TitBar
                          segments={titularidadSegments(a.titularidades)}
                        />
                      </TD>
                      <TD>
                        <LiqBadge level="b" />
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
                            onEdit={() => onEditOtro(a)}
                            onDelete={() => onDeleteOtro(a.id)}
                          />
                          <EvBtn onClick={() => onEvento("otro", a.nombre)} />
                        </span>
                      </TD>
                    </TR>
                  ))}
                  <TR className="subtotal">
                    <TD colSpan={2}>Subtotal otros</TD>
                    <TD className="right num">{formatEUR(totalOtros)}</TD>
                    <TD colSpan={3} />
                  </TR>
                </TBody>
              </Table>
            </TD>
          </TR>
        </TBody>
        <TFoot>
          <TR>
            <TD colSpan={5}>Total activos</TD>
            <TD colSpan={3} className="right num">
              {formatEUR(totalGeneral)}
            </TD>
          </TR>
        </TFoot>
      </Table>
      <div className="tiny" style={{ marginTop: 10 }}>
        «+ Añadir» carga un elemento que existe hoy · «⚡ Evento» describe una
        decisión futura sobre un elemento ya existente.
      </div>
    </>
  );
}
