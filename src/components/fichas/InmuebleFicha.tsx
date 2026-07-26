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
import { formatFechaES, personaLabel } from "@/lib/patrimonio";
import type { Inmueble, Pasivo, Persona } from "@/lib/types";

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
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-upper mb-1">F3 · Inmueble</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            {inmueble.nombre}
          </h2>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEventoOpen(true)}>
          + Evento
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card padding="sm">
          <p className="label-upper mb-2">Valor</p>
          <p className="text-[22px] font-bold tracking-[-0.02em] tabular-nums text-ink">
            {formatEUR(inmueble.valor)}
          </p>
          <p className="mt-1 text-[11px] text-mute">
            Introducido por el asesor, no calculado
          </p>
        </Card>
        <Card padding="sm">
          <p className="label-upper mb-2">Fecha de adquisición</p>
          <p className="text-[22px] font-bold tracking-[-0.02em] text-ink">
            {formatFechaES(inmueble.fechaAdquisicion)}
          </p>
        </Card>
      </div>

      <Card padding="sm">
        <p className="label-upper mb-2">Hipoteca</p>
        {pasivo ? (
          <Table>
            <THead>
              <TR>
                <TH>Prestamista</TH>
                <TH className="text-right">Capital pendiente</TH>
                <TH className="text-right">Tipo</TH>
                <TH className="text-right">Cuota</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD className="font-semibold">{pasivo.prestamista}</TD>
                <TD numeric>{formatEUR(pasivo.capitalPendiente)}</TD>
                <TD numeric>{formatPercent(pasivo.tipoInteres)}</TD>
                <TD numeric>{formatEUR(pasivo.cuotaMensual)}/mes</TD>
              </TR>
            </TBody>
          </Table>
        ) : (
          <p className="px-1 py-3 text-[12px] text-mute">Sin hipoteca asociada.</p>
        )}
      </Card>

      <Card padding="sm">
        <p className="label-upper mb-2">Reparto de titularidad</p>
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
      </Card>

      <p>
        <Link
          href={`/clientes/${clienteId}/patrimonio?tab=activos`}
          className="text-[12px] font-semibold text-blue hover:underline"
        >
          ← Volver a Activos
        </Link>
      </p>

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="inmueble"
        elementoNombre={inmueble.nombre}
      />
    </div>
  );
}
