"use client";

import Link from "next/link";
import {
  Badge,
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
import {
  formatFechaES,
  formatTitularidades,
  tipoFiscalLabel,
  tipoOtroLabel,
} from "@/lib/patrimonio";
import type {
  Inmueble,
  Instrumento,
  OtroActivo,
  Pasivo,
  Persona,
  Sociedad,
} from "@/lib/types";

export function ActivosTab({
  clienteId,
  personas,
  instrumentos,
  inmuebles,
  sociedades,
  otros,
  pasivos,
  onEvento,
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
}) {
  const totalFin = instrumentos.reduce((s, i) => s + i.valor, 0);
  const totalInm = inmuebles.reduce((s, i) => s + i.valor, 0);
  const totalOtros = otros.reduce((s, a) => s + a.valor, 0);
  const totalSoc = 0; // sin valoración — hueco F4
  const totalGeneral = totalFin + totalInm + totalOtros + totalSoc;

  return (
    <div className="space-y-3">
      <p className="label-upper">Activos · agrupados por tipo</p>

      <Card padding="none" className="overflow-hidden">
        <Table>
          <TBody>
            {/* ── Portfolio financiero ── */}
            <TR className="group-head">
              <TD colSpan={8}>Portfolio financiero</TD>
            </TR>
            <TR>
              <TD colSpan={8} className="border-b-0 p-0">
                <table className="w-full border-collapse text-left text-[12.5px]">
                  <THead>
                    <TR>
                      <TH>Instrumento</TH>
                      <TH>Tipo fiscal</TH>
                      <TH className="text-right">Valor</TH>
                      <TH>Adquisición</TH>
                      <TH className="text-right">Plusvalía latente</TH>
                      <TH>Titularidad</TH>
                      <TH />
                    </TR>
                  </THead>
                  <TBody>
                    {instrumentos.map((i) => (
                      <TR key={i.id} className="rowlink">
                        <TD>
                          <Link
                            href={`/clientes/${clienteId}/fichas/portfolio/${i.id}`}
                            className="font-semibold text-ink hover:underline"
                          >
                            {i.nombre}
                          </Link>
                        </TD>
                        <TD className="text-slate">
                          {tipoFiscalLabel(i.tipoFiscal)}
                        </TD>
                        <TD numeric>{formatEUR(i.valor)}</TD>
                        <TD className="tabular-nums text-slate">
                          {formatFechaES(i.fechaAdquisicion)}
                        </TD>
                        <TD numeric>
                          {i.plusvaliaLatente != null ? (
                            <span className="text-green">
                              +{formatEUR(i.plusvaliaLatente)}
                            </span>
                          ) : (
                            <span className="text-mute">—</span>
                          )}
                        </TD>
                        <TD className="text-[11px] text-slate">
                          {formatTitularidades(i.titularidades, personas)}
                        </TD>
                        <TD className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEvento("instrumento", i.nombre)}
                          >
                            Evento
                          </Button>
                        </TD>
                      </TR>
                    ))}
                    {instrumentos.length === 0 && (
                      <TR>
                        <TD colSpan={7} className="py-4 text-center text-mute">
                          Sin instrumentos.
                        </TD>
                      </TR>
                    )}
                    <TR className="subtotal">
                      <TD colSpan={2}>Subtotal portfolio</TD>
                      <TD numeric>{formatEUR(totalFin)}</TD>
                      <TD colSpan={4} />
                    </TR>
                  </TBody>
                </table>
              </TD>
            </TR>

            {/* ── Inmuebles ── */}
            <TR className="group-head">
              <TD colSpan={8}>Inmuebles</TD>
            </TR>
            <TR>
              <TD colSpan={8} className="border-b-0 p-0">
                <table className="w-full border-collapse text-left text-[12.5px]">
                  <THead>
                    <TR>
                      <TH>Inmueble</TH>
                      <TH className="text-right">Valor</TH>
                      <TH>Adquisición</TH>
                      <TH>Hipoteca asociada</TH>
                      <TH>Titularidad</TH>
                      <TH />
                    </TR>
                  </THead>
                  <TBody>
                    {inmuebles.map((inm) => {
                      const hip = pasivos.find((p) => p.id === inm.pasivoId);
                      return (
                        <TR key={inm.id} className="rowlink">
                          <TD>
                            <Link
                              href={`/clientes/${clienteId}/fichas/inmueble/${inm.id}`}
                              className="font-semibold text-ink hover:underline"
                            >
                              {inm.nombre}
                            </Link>
                          </TD>
                          <TD numeric>{formatEUR(inm.valor)}</TD>
                          <TD className="tabular-nums text-slate">
                            {formatFechaES(inm.fechaAdquisicion)}
                          </TD>
                          <TD className="text-slate">
                            {hip
                              ? `${formatEUR(hip.capitalPendiente)} · ${hip.prestamista}`
                              : "—"}
                          </TD>
                          <TD className="text-[11px] text-slate">
                            {formatTitularidades(inm.titularidades, personas)}
                          </TD>
                          <TD className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEvento("inmueble", inm.nombre)}
                            >
                              Evento
                            </Button>
                          </TD>
                        </TR>
                      );
                    })}
                    {inmuebles.length === 0 && (
                      <TR>
                        <TD colSpan={6} className="py-4 text-center text-mute">
                          Sin inmuebles.
                        </TD>
                      </TR>
                    )}
                    <TR className="subtotal">
                      <TD>Subtotal inmuebles</TD>
                      <TD numeric>{formatEUR(totalInm)}</TD>
                      <TD colSpan={4} />
                    </TR>
                  </TBody>
                </table>
              </TD>
            </TR>

            {/* ── Empresarial ── */}
            <TR className="group-head">
              <TD colSpan={8}>Inversiones empresariales</TD>
            </TR>
            <TR>
              <TD colSpan={8} className="border-b-0 p-0">
                <table className="w-full border-collapse text-left text-[12.5px]">
                  <THead>
                    <TR>
                      <TH>Sociedad</TH>
                      <TH className="text-right">Participación</TH>
                      <TH className="text-right">Valor</TH>
                      <TH />
                    </TR>
                  </THead>
                  <TBody>
                    {sociedades.map((s) => {
                      const pct = Object.values(s.participaciones).reduce(
                        (a, b) => a + b,
                        0,
                      );
                      return (
                        <TR key={s.id} className="rowlink">
                          <TD>
                            <Link
                              href={`/clientes/${clienteId}/fichas/sociedad/${s.id}`}
                              className="font-semibold text-ink hover:underline"
                            >
                              {s.nombre}
                            </Link>
                          </TD>
                          <TD numeric>{Math.round(pct * 100)} %</TD>
                          <TD className="text-right text-mute">
                            Pendiente de definir
                          </TD>
                          <TD className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEvento("sociedad", s.nombre)}
                            >
                              Evento
                            </Button>
                          </TD>
                        </TR>
                      );
                    })}
                    {sociedades.length === 0 && (
                      <TR>
                        <TD colSpan={4} className="py-4 text-center text-mute">
                          Sin sociedades.
                        </TD>
                      </TR>
                    )}
                  </TBody>
                </table>
              </TD>
            </TR>

            {/* ── Otros ── */}
            <TR className="group-head">
              <TD colSpan={8}>Otros activos</TD>
            </TR>
            <TR>
              <TD colSpan={8} className="border-b-0 p-0">
                <table className="w-full border-collapse text-left text-[12.5px]">
                  <THead>
                    <TR>
                      <TH>Activo</TH>
                      <TH>Tipo</TH>
                      <TH className="text-right">Valor</TH>
                      <TH>Titularidad</TH>
                      <TH />
                    </TR>
                  </THead>
                  <TBody>
                    {otros.map((a) => (
                      <TR key={a.id} className="rowlink">
                        <TD>
                          <Link
                            href={`/clientes/${clienteId}/fichas/otro/${a.id}`}
                            className="font-semibold text-ink hover:underline"
                          >
                            {a.nombre}
                          </Link>
                        </TD>
                        <TD>
                          <Badge variant="coral">{tipoOtroLabel(a.tipo)}</Badge>
                        </TD>
                        <TD numeric>{formatEUR(a.valor)}</TD>
                        <TD className="text-[11px] text-slate">
                          {formatTitularidades(a.titularidades, personas)}
                        </TD>
                        <TD className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEvento("otro", a.nombre)}
                          >
                            Evento
                          </Button>
                        </TD>
                      </TR>
                    ))}
                    {otros.length === 0 && (
                      <TR>
                        <TD colSpan={5} className="py-4 text-center text-mute">
                          Sin otros activos.
                        </TD>
                      </TR>
                    )}
                    <TR className="subtotal">
                      <TD colSpan={2}>Subtotal otros</TD>
                      <TD numeric>{formatEUR(totalOtros)}</TD>
                      <TD colSpan={2} />
                    </TR>
                  </TBody>
                </table>
              </TD>
            </TR>
          </TBody>
          <TFoot>
            <TR>
              <TD colSpan={5}>Total activos</TD>
              <TD colSpan={3} numeric>
                {formatEUR(totalGeneral)}
              </TD>
            </TR>
          </TFoot>
        </Table>
      </Card>

      <p className="text-[11px] text-mute">
        Pincha el nombre para abrir su ficha · «Evento» añade una decisión sobre
        ese elemento.
      </p>
    </div>
  );
}
