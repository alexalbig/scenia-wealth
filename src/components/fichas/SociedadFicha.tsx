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
import { formatEUR } from "@/lib/format";
import { formatFechaES, personaLabel } from "@/lib/patrimonio";
import type { Inmueble, Instrumento, Persona, Sociedad } from "@/lib/types";

const backlinkClass =
  "mb-1.5 -ml-2 inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] font-semibold text-slate hover:bg-paper-2 hover:text-ink";

export function SociedadFicha({
  clienteId,
  sociedad,
  personas,
  instrumentos,
  inmuebles,
}: {
  clienteId: string;
  sociedad: Sociedad;
  personas: Persona[];
  instrumentos: Instrumento[];
  inmuebles: Inmueble[];
}) {
  const [eventoOpen, setEventoOpen] = useState(false);

  const participaciones = Object.entries(sociedad.participaciones).map(
    ([personaId, porcentaje]) => {
      const persona = personas.find((p) => p.id === personaId);
      return {
        personaId,
        label: persona ? personaLabel(persona) : personaId,
        porcentaje,
      };
    },
  );

  const activosSociedad = [
    ...instrumentos
      .filter((i) => i.sociedadId === sociedad.id)
      .map((i) => ({ id: i.id, nombre: i.nombre, tipo: "Instrumento", valor: i.valor })),
    ...inmuebles
      .filter((i) => i.sociedadId === sociedad.id)
      .map((i) => ({ id: i.id, nombre: i.nombre, tipo: "Inmueble", valor: i.valor })),
  ];

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
          <p className="label-upper">Ficha · Sociedad</p>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-ink">
            {sociedad.nombre}
          </h2>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEventoOpen(true)}>
          ⚡ Evento
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">NIF</p>
          <p className="mt-[3px] text-[13px] font-bold tabular-nums text-ink">
            {sociedad.nif}
          </p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Constitución</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {formatFechaES(sociedad.fechaConstitucion)}
          </p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Capital social</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {formatEUR(sociedad.capitalSocial)}
          </p>
          <span className="intro-chip mt-1.5">✎ introducido por el asesor</span>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Situación mercantil</p>
          <p className="mt-[3px]">
            <Badge variant="neutral">{sociedad.situacion}</Badge>
          </p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px] sm:col-span-2">
          <p className="label-upper">Objeto social</p>
          <p className="mt-[3px] text-[12px] font-medium text-ink">
            {sociedad.objetoSocial}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
        <div className="rounded-[10px] border border-line-2 bg-white px-[15px] py-[13px]">
          <p className="label-upper mb-2">Participación</p>
          <Table>
            <THead>
              <TR>
                <TH>Persona</TH>
                <TH className="text-right">%</TH>
              </TR>
            </THead>
            <TBody>
              {participaciones.map((row) => (
                <TR key={row.personaId}>
                  <TD className="font-semibold">{row.label}</TD>
                  <TD numeric>
                    {Math.round(row.porcentaje * 100)} %
                  </TD>
                </TR>
              ))}
              {participaciones.length === 0 && (
                <TR>
                  <TD colSpan={2} className="py-4 text-center text-mute">
                    Sin participaciones registradas.
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </div>

        <div className="rounded-[10px] border border-line-2 bg-white px-[15px] py-[13px]">
          <p className="label-upper mb-2">Activos de la sociedad</p>
          {activosSociedad.length > 0 ? (
            <Table>
              <THead>
                <TR>
                  <TH>Activo</TH>
                  <TH>Tipo</TH>
                  <TH className="text-right">Valor</TH>
                </TR>
              </THead>
              <TBody>
                {activosSociedad.map((a) => (
                  <TR key={a.id}>
                    <TD className="font-semibold">{a.nombre}</TD>
                    <TD>{a.tipo}</TD>
                    <TD numeric>{formatEUR(a.valor)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <p className="px-1 py-3 text-center text-[12px] text-mute">
              Sin activos registrados a nombre de la sociedad.
            </p>
          )}
        </div>
      </div>

      {/* Firewall regla 8: hueco visible — sin cifras de Impuesto de Sociedades */}
      <div className="mt-3.5 rounded-[10px] border border-dashed border-line-2 bg-paper-2 px-4 py-3.5">
        <span className="inline-flex items-center rounded-[6px] border border-line-2 bg-paper-2 px-2 py-0.5 text-[10.5px] font-semibold text-slate">
          Fiscalidad societaria · pendiente de definir
        </span>
        <p className="mt-2 text-[12px] text-ink-3">
          El liquidador de Impuesto de Sociedades aún no existe en Scenia. Los
          eventos de esta ficha (repartir dividendo, vender participación){" "}
          <b className="font-semibold text-ink">se registran sin cálculo fiscal</b>{" "}
          — no se muestran cifras que el motor no puede calcular.
        </p>
      </div>

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="sociedad"
        elementoNombre={sociedad.nombre}
      />
    </div>
  );
}
