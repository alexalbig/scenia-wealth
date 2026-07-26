"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Table,
  TBody,
  TD,
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

function GroupHeader({
  title,
  total,
  action,
}: {
  title: string;
  total: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <div>
        <p className="label-upper">{title}</p>
        <p className="text-[12px] font-semibold tabular-nums text-ink">
          {formatEUR(total)}
        </p>
      </div>
      {action}
    </div>
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
}: {
  clienteId: string;
  personas: Persona[];
  instrumentos: Instrumento[];
  inmuebles: Inmueble[];
  sociedades: Sociedad[];
  otros: OtroActivo[];
  pasivos: Pasivo[];
  onEvento: (contexto: "instrumento" | "inmueble" | "sociedad" | "otro", nombre: string) => void;
}) {
  const totalFin = instrumentos.reduce((s, i) => s + i.valor, 0);
  const totalInm = inmuebles.reduce((s, i) => s + i.valor, 0);
  const totalOtros = otros.reduce((s, a) => s + a.valor, 0);
  const totalSoc = 0; // sin valoración — hueco F4
  const totalGeneral = totalFin + totalInm + totalOtros + totalSoc;

  return (
    <div className="space-y-5">
      <Card padding="sm">
        <GroupHeader
          title="Portfolio financiero"
          total={totalFin}
          action={
            <Button size="sm" variant="ghost" onClick={() => onEvento("instrumento", "Portfolio")}>
              + Evento
            </Button>
          }
        />
        <Table>
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
              <TR key={i.id}>
                <TD>
                  <Link
                    href={`/clientes/${clienteId}/fichas/portfolio/${i.id}`}
                    className="font-semibold text-blue hover:underline"
                  >
                    {i.nombre}
                  </Link>
                </TD>
                <TD>
                  <Badge variant="neutral">{tipoFiscalLabel(i.tipoFiscal)}</Badge>
                </TD>
                <TD numeric>{formatEUR(i.valor)}</TD>
                <TD>{formatFechaES(i.fechaAdquisicion)}</TD>
                <TD numeric>
                  {i.plusvaliaLatente != null ? (
                    <span className="text-green">
                      +{formatEUR(i.plusvaliaLatente)}
                    </span>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD className="text-[11px] text-slate">
                  {formatTitularidades(i.titularidades, personas)}
                </TD>
                <TD>
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
          </TBody>
        </Table>
      </Card>

      <Card padding="sm">
        <GroupHeader title="Inmuebles" total={totalInm} />
        <Table>
          <THead>
            <TR>
              <TH>Nombre</TH>
              <TH className="text-right">Valor</TH>
              <TH>Adquisición</TH>
              <TH>Hipoteca</TH>
              <TH>Titularidad</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {inmuebles.map((inm) => {
              const hip = pasivos.find((p) => p.id === inm.pasivoId);
              return (
                <TR key={inm.id}>
                  <TD>
                    <Link
                      href={`/clientes/${clienteId}/fichas/inmueble/${inm.id}`}
                      className="font-semibold text-blue hover:underline"
                    >
                      {inm.nombre}
                    </Link>
                  </TD>
                  <TD numeric>{formatEUR(inm.valor)}</TD>
                  <TD>{formatFechaES(inm.fechaAdquisicion)}</TD>
                  <TD>
                    {hip
                      ? `${formatEUR(hip.capitalPendiente)} · ${hip.prestamista}`
                      : "—"}
                  </TD>
                  <TD className="text-[11px] text-slate">
                    {formatTitularidades(inm.titularidades, personas)}
                  </TD>
                  <TD>
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
          </TBody>
        </Table>
      </Card>

      <Card padding="sm">
        <GroupHeader title="Inversiones empresariales" total={totalSoc} />
        <Table>
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
              const pct = Object.values(s.participaciones).reduce((a, b) => a + b, 0);
              return (
                <TR key={s.id}>
                  <TD>
                    <Link
                      href={`/clientes/${clienteId}/fichas/sociedad/${s.id}`}
                      className="font-semibold text-blue hover:underline"
                    >
                      {s.nombre}
                    </Link>
                  </TD>
                  <TD numeric>{Math.round(pct * 100)} %</TD>
                  <TD numeric>
                    <span className="text-mute">Pendiente de definir</span>
                  </TD>
                  <TD>
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
        </Table>
      </Card>

      <Card padding="sm">
        <GroupHeader title="Otros activos" total={totalOtros} />
        <Table>
          <THead>
            <TR>
              <TH>Nombre</TH>
              <TH>Tipo</TH>
              <TH className="text-right">Valor</TH>
              <TH>Titularidad</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {otros.map((a) => (
              <TR key={a.id}>
                <TD>
                  <Link
                    href={`/clientes/${clienteId}/fichas/otro/${a.id}`}
                    className="font-semibold text-blue hover:underline"
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
                <TD>
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
          </TBody>
        </Table>
      </Card>

      <p className="text-right text-[13px] font-bold tabular-nums text-ink">
        Total activos {formatEUR(totalGeneral)}
      </p>
    </div>
  );
}
