"use client";

import { useState } from "react";
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
import { EventoModal } from "@/components/patrimonio/EventoModal";
import { formatEUR, formatPercent } from "@/lib/format";
import {
  formatFechaES,
  personaLabel,
  tipoFiscalLabel,
} from "@/lib/patrimonio";
import { getPersonasDeCliente } from "@/lib/seed";
import type { Instrumento, Persona } from "@/lib/types";

export function PortfolioFicha({
  clienteId,
  instrumento,
  instrumentos,
}: {
  clienteId: string;
  instrumento: Instrumento;
  instrumentos: Instrumento[];
}) {
  const personas = getPersonasDeCliente(clienteId);
  const siblings = instrumentos.filter((i) => i.id !== instrumento.id);
  const [eventoOpen, setEventoOpen] = useState(false);
  const [eventoTarget, setEventoTarget] = useState(instrumento.nombre);

  function openEvento(nombre: string) {
    setEventoTarget(nombre);
    setEventoOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-upper">F2 · Portfolio</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            {instrumento.nombre}
          </h2>
          <p className="mt-0.5 text-[11px] text-mute">
            Instrumento · valor · adquisición · titularidad
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="secondary" onClick={() => openEvento(instrumento.nombre)}>
            Evento
          </Button>
          <Link
            href={`/clientes/${clienteId}/patrimonio?tab=activos`}
            className="text-[12px] font-semibold text-blue hover:underline"
          >
            ← Volver a Activos
          </Link>
        </div>
      </div>

      <Card padding="sm">
        <p className="label-upper mb-3">Detalle del instrumento</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="label-upper">Tipo fiscal</p>
            <p className="mt-1">
              <Badge variant="neutral">
                {tipoFiscalLabel(instrumento.tipoFiscal)}
              </Badge>
            </p>
          </div>
          <div>
            <p className="label-upper">Valor</p>
            <p className="mt-1 text-[15px] font-bold tabular-nums text-ink">
              {formatEUR(instrumento.valor)}
            </p>
          </div>
          <div>
            <p className="label-upper">Fecha de adquisición</p>
            <p className="mt-1 text-[13px] font-semibold tabular-nums text-ink">
              {formatFechaES(instrumento.fechaAdquisicion)}
            </p>
          </div>
          <div>
            <p className="label-upper">Plusvalía latente</p>
            <p className="mt-1 text-[15px] font-bold tabular-nums">
              {instrumento.plusvaliaLatente != null ? (
                <span className="text-green">
                  +{formatEUR(instrumento.plusvaliaLatente)}
                </span>
              ) : (
                <span className="text-mute">—</span>
              )}
            </p>
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <p className="label-upper mb-3">Titularidad</p>
        <Table>
          <THead>
            <TR>
              <TH>Titular</TH>
              <TH className="text-right">Participación</TH>
              <TH className="text-right">Valor atribuible</TH>
            </TR>
          </THead>
          <TBody>
            {instrumento.titularidades.map((t, idx) => {
              const nombre = ownerLabel(t, personas);
              return (
                <TR key={`${nombre}-${idx}`}>
                  <TD className="font-semibold">{nombre}</TD>
                  <TD numeric>{formatPercent(t.porcentaje)}</TD>
                  <TD numeric>
                    {formatEUR(instrumento.valor * t.porcentaje)}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>

      {siblings.length > 0 && (
        <Card padding="sm">
          <p className="label-upper mb-3">Otros instrumentos del expediente</p>
          <Table>
            <THead>
              <TR>
                <TH>Instrumento</TH>
                <TH>Tipo fiscal</TH>
                <TH className="text-right">Valor</TH>
                <TH className="text-right">Plusvalía latente</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {siblings.map((i) => (
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
                    <Badge variant="neutral">
                      {tipoFiscalLabel(i.tipoFiscal)}
                    </Badge>
                  </TD>
                  <TD numeric>{formatEUR(i.valor)}</TD>
                  <TD numeric>
                    {i.plusvaliaLatente != null ? (
                      <span className="text-green">
                        +{formatEUR(i.plusvaliaLatente)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEvento(i.nombre)}
                    >
                      Evento
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="instrumento"
        elementoNombre={eventoTarget}
      />
    </div>
  );
}

function ownerLabel(
  t: Instrumento["titularidades"][number],
  personas: Persona[],
): string {
  const owner = t.owner;
  if (owner.kind === "persona") {
    const p = personas.find((x) => x.id === owner.personaId);
    return p ? personaLabel(p) : owner.personaId;
  }
  return "Sociedad";
}
