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
import { formatFechaES, personaLabel } from "@/lib/patrimonio";
import type { Inmueble, Pasivo, Persona } from "@/lib/types";

const backlinkClass =
  "mb-1.5 -ml-2 inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] font-semibold text-slate hover:bg-paper-2 hover:text-ink";

export function InmuebleFicha({
  clienteId,
  inmueble,
  pasivo,
  personas,
}: {
  clienteId: string;
  inmueble: Inmueble;
  pasivo?: Pasivo;
  personas: Persona[];
}) {
  const [eventoOpen, setEventoOpen] = useState(false);

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
          <p className="label-upper">Ficha · Inmueble</p>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-ink">
            {inmueble.nombre}
          </h2>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEventoOpen(true)}>
          ⚡ Evento
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Valor actual</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {formatEUR(inmueble.valor)}
          </p>
          <span className="intro-chip mt-1.5">✎ introducido por el asesor</span>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Adquisición</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {formatFechaES(inmueble.fechaAdquisicion)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
        <div className="rounded-[10px] border border-line-2 bg-white px-[15px] py-[13px]">
          <p className="label-upper mb-2">Hipoteca asociada</p>
          {pasivo ? (
            <div className="space-y-1">
              <div className="flex justify-between py-1 text-[12px] text-ink-3">
                <span>Prestamista</span>
                <b className="font-semibold text-ink">{pasivo.prestamista}</b>
              </div>
              <div className="flex justify-between py-1 text-[12px] text-ink-3">
                <span>Capital pendiente</span>
                <b className="font-semibold tabular-nums text-ink">
                  {formatEUR(pasivo.capitalPendiente)}
                </b>
              </div>
              <div className="flex justify-between py-1 text-[12px] text-ink-3">
                <span>Tipo</span>
                <b className="font-semibold tabular-nums text-ink">
                  {formatPercent(pasivo.tipoInteres)}
                </b>
              </div>
              <div className="flex justify-between py-1 text-[12px] text-ink-3">
                <span>Cuota</span>
                <b className="font-semibold tabular-nums text-ink">
                  {formatEUR(pasivo.cuotaMensual)}/mes
                </b>
              </div>
            </div>
          ) : (
            <p className="py-2 text-[12px] text-mute">Sin hipoteca asociada.</p>
          )}
        </div>

        <div className="rounded-[10px] border border-line-2 bg-white px-[15px] py-[13px]">
          <p className="label-upper mb-1.5">Reparto de titularidad</p>
          <Table>
            <THead>
              <TR>
                <TH>Titular</TH>
                <TH className="text-right">Participación</TH>
              </TR>
            </THead>
            <TBody>
              {inmueble.titularidades.map((t, idx) => {
                const owner = t.owner;
                const persona =
                  owner.kind === "persona"
                    ? personas.find((p) => p.id === owner.personaId)
                    : undefined;
                const label =
                  owner.kind === "persona"
                    ? persona
                      ? personaLabel(persona)
                      : owner.personaId
                    : "Sociedad";
                return (
                  <TR key={`${label}-${idx}`}>
                    <TD className="font-semibold">{label}</TD>
                    <TD numeric>
                      <Badge variant="neutral">
                        {Math.round(t.porcentaje * 100)} %
                      </Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
          <p className="mt-2.5 text-[10.5px] text-mute">
            Acciones: Vender (regla &gt;65) · Amortizar hipoteca — desde «⚡ Evento».
          </p>
        </div>
      </div>

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="inmueble"
        elementoNombre={inmueble.nombre}
      />
    </div>
  );
}
