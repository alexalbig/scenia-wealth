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
import { formatFechaES, personaLabel } from "@/lib/patrimonio";
import type { Inmueble, Instrumento, Persona, Sociedad } from "@/lib/types";

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
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-upper mb-1">F4 · Sociedad</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            {sociedad.nombre}
          </h2>
          <div className="mt-2">
            <Badge variant="neutral">{sociedad.situacion}</Badge>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEventoOpen(true)}>
          + Evento
        </Button>
      </div>

      <Card padding="sm">
        <p className="label-upper mb-3">Datos mercantiles</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="label-upper">NIF</p>
            <p className="mt-1 text-[13px] font-semibold tabular-nums text-ink">
              {sociedad.nif}
            </p>
          </div>
          <div>
            <p className="label-upper">Capital social</p>
            <p className="mt-1 text-[13px] font-semibold tabular-nums text-ink">
              {formatEUR(sociedad.capitalSocial)}
            </p>
            <p className="mt-0.5 text-[11px] text-mute">
              Introducido por el asesor, no calculado
            </p>
          </div>
          <div>
            <p className="label-upper">Fecha de constitución</p>
            <p className="mt-1 text-[13px] font-semibold text-ink">
              {formatFechaES(sociedad.fechaConstitucion)}
            </p>
          </div>
          <div>
            <p className="label-upper">Situación</p>
            <p className="mt-1">
              <Badge variant="neutral">{sociedad.situacion}</Badge>
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="label-upper">Objeto social</p>
            <p className="mt-1 text-[13px] font-semibold text-ink">
              {sociedad.objetoSocial}
            </p>
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <p className="label-upper mb-2">Participación</p>
        <Table>
          <THead>
            <TR>
              <TH>Persona</TH>
              <TH className="text-right">Participación</TH>
            </TR>
          </THead>
          <TBody>
            {participaciones.map((row) => (
              <TR key={row.personaId}>
                <TD className="font-semibold">{row.label}</TD>
                <TD numeric>
                  <Badge variant="neutral">
                    {Math.round(row.porcentaje * 100)} %
                  </Badge>
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
      </Card>

      <Card padding="sm">
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
          <p className="px-1 py-4 text-center text-[12px] text-mute">
            Sin activos registrados en la sociedad
          </p>
        )}
      </Card>

      {/* Firewall regla 8: hueco visible — sin cifras de Impuesto de Sociedades */}
      <Card
        padding="sm"
        className="border-dashed border-line-2 bg-paper-2"
      >
        <p className="label-upper mb-1">Impuesto de Sociedades</p>
        <p className="text-[13px] font-semibold text-ink">
          Liquidador de Impuesto de Sociedades · pendiente de definir
        </p>
        <p className="mt-1 text-[12px] text-mute">
          No hay cálculo fiscal societario.
        </p>
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
        contexto="sociedad"
        elementoNombre={sociedad.nombre}
      />
    </div>
  );
}
