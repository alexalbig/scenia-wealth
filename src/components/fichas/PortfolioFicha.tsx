"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
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

const backlinkClass =
  "mb-1.5 -ml-2 inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] font-semibold text-slate hover:bg-paper-2 hover:text-ink";

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
    <div>
      <Link
        href={`/clientes/${clienteId}/patrimonio?tab=activos`}
        className={backlinkClass}
      >
        ‹ Patrimonio · Activos
      </Link>

      <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-upper">Ficha · Portfolio financiero</p>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-ink">
            {instrumento.nombre}
          </h2>
          <p className="mt-0.5 text-[11px] text-mute">
            {tipoFiscalLabel(instrumento.tipoFiscal)}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => openEvento(instrumento.nombre)}>
          ⚡ Evento
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Tipo fiscal</p>
          <p className="mt-[3px]">
            <Badge variant="neutral">
              {tipoFiscalLabel(instrumento.tipoFiscal)}
            </Badge>
          </p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Valor actual</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {formatEUR(instrumento.valor)}
          </p>
          <span className="intro-chip mt-1.5">✎ introducido por el asesor</span>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Fecha de adquisición</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {formatFechaES(instrumento.fechaAdquisicion)}
          </p>
          <p className="mt-0.5 text-[10.5px] text-mute">clave para traspaso y FIFO</p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Plusvalía latente</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums">
            {instrumento.plusvaliaLatente != null ? (
              <span className="font-semibold text-green">
                +{formatEUR(instrumento.plusvaliaLatente)}
              </span>
            ) : (
              <span className="text-mute">—</span>
            )}
          </p>
          {instrumento.plusvaliaLatente != null && (
            <span className="calc-chip mt-1.5">calculado</span>
          )}
        </div>
      </div>

      <p className="label-upper mb-1.5 mt-[18px]">Reparto de titularidad</p>
      <div className="max-w-[420px] rounded-[10px] border border-line-2 bg-white px-3.5 py-3">
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
        <p className="mt-2 text-[10.5px] text-mute">
          Cada titular tributa su parte en su propia escala — por eso el reparto vive en el instrumento.
        </p>
      </div>

      {siblings.length > 0 && (
        <>
          <p className="label-upper mb-1.5 mt-[18px]">
            Otros instrumentos del expediente
          </p>
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
                      className="font-semibold text-ink hover:underline"
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
                      <span className="font-semibold text-green">
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
        </>
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
