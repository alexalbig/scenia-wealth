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
import { formatEUR } from "@/lib/format";
import {
  formatFechaES,
  personaLabel,
  tipoOtroLabel,
} from "@/lib/patrimonio";
import type { OtroActivo, Persona } from "@/lib/types";

export function OtroActivoFicha({
  clienteId,
  activo,
  personas,
}: {
  clienteId: string;
  activo: OtroActivo;
  personas: Persona[];
}) {
  const [eventoOpen, setEventoOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-upper mb-1">F5 · Otros activos</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            {activo.nombre}
          </h2>
          <div className="mt-2">
            <Badge variant="coral">{tipoOtroLabel(activo.tipo)}</Badge>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEventoOpen(true)}>
          + Evento
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card padding="sm">
          <p className="label-upper mb-2">Valor</p>
          <p className="text-[22px] font-bold tracking-[-0.02em] tabular-nums text-ink">
            {formatEUR(activo.valor)}
          </p>
          <p className="mt-1 text-[11px] text-mute">
            Introducido por el asesor, no calculado
          </p>
        </Card>
        <Card padding="sm">
          <p className="label-upper mb-2">Fecha de adquisición</p>
          <p className="text-[22px] font-bold tracking-[-0.02em] text-ink">
            {activo.fechaAdquisicion
              ? formatFechaES(activo.fechaAdquisicion)
              : "—"}
          </p>
        </Card>
      </div>

      <Card padding="sm">
        <p className="label-upper mb-2">Titularidad</p>
        <Table>
          <THead>
            <TR>
              <TH>Titular</TH>
              <TH className="text-right">Participación</TH>
            </TR>
          </THead>
          <TBody>
            {activo.titularidades.map((t, idx) => {
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

      <Card padding="sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="label-upper mb-1">Evento de venta</p>
            <p className="text-[13px] text-slate">
              Venta genérica · no forma parte de las 5 reglas del motor.
            </p>
          </div>
          <Badge variant="neutral">Sin cálculo fiscal</Badge>
        </div>
        <p className="mt-3 rounded-[8px] border border-dashed border-line-2 bg-paper-2 px-3 py-2 text-[12px] text-mute">
          El evento registra la operación; no se inventan cifras de IRPF.
        </p>
        <div className="mt-3">
          <Button size="sm" variant="ghost" onClick={() => setEventoOpen(true)}>
            Vender (genérico, sin cálculo fiscal)
          </Button>
        </div>
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
        contexto="otro"
        elementoNombre={activo.nombre}
      />
    </div>
  );
}
