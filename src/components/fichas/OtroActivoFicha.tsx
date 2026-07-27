"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
} from "@/components/ui";
import { EventoModal } from "@/components/patrimonio/EventoModal";
import { formatEUR } from "@/lib/format";
import {
  formatFechaES,
  personaLabel,
  tipoOtroLabel,
} from "@/lib/patrimonio";
import type { OtroActivo, Persona } from "@/lib/types";

const backlinkClass =
  "mb-1.5 -ml-2 inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] font-semibold text-slate hover:bg-paper-2 hover:text-ink";

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

  const titularidadTxt = activo.titularidades
    .map((t) => {
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
      return `${label} ${Math.round(t.porcentaje * 100)} %`;
    })
    .join(" · ");

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
          <p className="label-upper">Ficha · Otros activos</p>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-ink">
            {activo.nombre}
          </h2>
          <p className="mt-0.5 text-[11px] text-mute">
            {tipoOtroLabel(activo.tipo)}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEventoOpen(true)}>
          ⚡ Evento
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Valor actual</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {formatEUR(activo.valor)}
          </p>
          <span className="intro-chip mt-1.5">✎ introducido por el asesor</span>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Fecha de adquisición</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {activo.fechaAdquisicion
              ? formatFechaES(activo.fechaAdquisicion)
              : "—"}
          </p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Titularidad</p>
          <p className="mt-[3px] text-[12.5px] font-semibold text-ink">
            {titularidadTxt || "—"}
          </p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Tipo</p>
          <p className="mt-[3px]">
            <Badge variant="coral">{tipoOtroLabel(activo.tipo)}</Badge>
          </p>
        </div>
      </div>

      <p className="mt-3.5 text-[11px] text-mute">
        La venta de este activo va por el{" "}
        <b className="font-semibold text-ink-3">evento genérico</b> (sin cálculo
        fiscal): genera ganancia patrimonial en IRPF, pero está fuera de las 5
        reglas del motor.
      </p>

      <div className="mt-3 rounded-[10px] border border-dashed border-line-2 bg-paper-2 px-3.5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-ink">
            Venta genérica · sin cálculo fiscal
          </p>
          <Badge variant="neutral">Sin cálculo fiscal</Badge>
        </div>
        <div className="mt-2.5">
          <Button size="sm" variant="ghost" onClick={() => setEventoOpen(true)}>
            Vender (genérico, sin cálculo fiscal)
          </Button>
        </div>
      </div>

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="otro"
        elementoNombre={activo.nombre}
      />
    </div>
  );
}
