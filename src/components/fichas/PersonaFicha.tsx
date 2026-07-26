"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Card,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { ageFromBirthYear, formatEUR } from "@/lib/format";
import {
  fuenteIngresoLabel,
  getIngresos,
  personaLabel,
  titularidadAgregada,
} from "@/lib/patrimonio";
import type { Persona } from "@/lib/types";

const fieldClass =
  "mt-1 w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-[13px] tabular-nums text-ink outline-none focus:border-blue";

/** Edad de jubilación por defecto del seed (Carlos · 2033). */
const DEFAULT_RETIREMENT_AGE = 65;

export function PersonaFicha({
  clienteId,
  persona,
}: {
  clienteId: string;
  persona: Persona;
}) {
  const edadActual = ageFromBirthYear(persona.birthYear);
  const defaultYear = persona.birthYear + DEFAULT_RETIREMENT_AGE;

  const [jubilacionAnio, setJubilacionAnio] = useState(defaultYear);
  const [jubilacionEdad, setJubilacionEdad] = useState(DEFAULT_RETIREMENT_AGE);

  const ingresos = useMemo(
    () =>
      getIngresos(clienteId).filter((i) => i.personaId === persona.id),
    [clienteId, persona.id],
  );
  const ingresosTotal = ingresos.reduce((s, i) => s + i.importeAnual, 0);
  const titularidad = titularidadAgregada(clienteId, persona.id);

  function onAnioChange(value: string) {
    const anio = Number(value);
    if (!Number.isFinite(anio)) return;
    setJubilacionAnio(anio);
    setJubilacionEdad(anio - persona.birthYear);
  }

  function onEdadChange(value: string) {
    const edad = Number(value);
    if (!Number.isFinite(edad)) return;
    setJubilacionEdad(edad);
    setJubilacionAnio(persona.birthYear + edad);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-upper">F1 · Persona</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            {personaLabel(persona)}
          </h2>
          <p className="mt-0.5 text-[11px] text-mute">
            {edadActual} años · input del motor fiscal (ingresos · titularidad)
          </p>
        </div>
        <Link
          href={`/clientes/${clienteId}/patrimonio?tab=personas`}
          className="text-[12px] font-semibold text-blue hover:underline"
        >
          ← Volver a Personas
        </Link>
      </div>

      <Card padding="sm">
        <p className="label-upper mb-3">Datos básicos</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="label-upper">Nombre</p>
            <p className="mt-1 text-[13px] font-semibold text-ink">
              {personaLabel(persona)}
            </p>
          </div>
          <div>
            <p className="label-upper">Fecha de nacimiento</p>
            <p className="mt-1 text-[13px] font-semibold tabular-nums text-ink">
              {persona.birthYear}
            </p>
            <p className="mt-0.5 text-[11px] text-mute">
              Año · {edadActual} años
            </p>
          </div>
          <div>
            <p className="label-upper">CCAA</p>
            <p className="mt-1">
              <Badge variant="neutral">{persona.ccaa}</Badge>
            </p>
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="label-upper">Ingresos del año</p>
            <p className="mt-0.5 text-[11px] text-mute">
              Desde la pestaña Ingresos · input del liquidador (rescate)
            </p>
          </div>
          <p className="text-[15px] font-bold tabular-nums text-ink">
            {formatEUR(ingresosTotal)}
          </p>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Fuente</TH>
              <TH>Descripción</TH>
              <TH className="text-right">Importe anual</TH>
            </TR>
          </THead>
          <TBody>
            {ingresos.map((ing) => (
              <TR key={ing.id}>
                <TD>{fuenteIngresoLabel(ing.fuente)}</TD>
                <TD className="text-slate">{ing.descripcion}</TD>
                <TD numeric>{formatEUR(ing.importeAnual)}</TD>
              </TR>
            ))}
            {ingresos.length === 0 && (
              <TR>
                <TD colSpan={3} className="py-4 text-center text-mute">
                  Sin ingresos registrados.
                </TD>
              </TR>
            )}
          </TBody>
          {ingresos.length > 0 && (
            <tfoot>
              <tr className="border-t border-line-2 bg-paper-2">
                <td
                  className="px-3 py-2.5 text-[12px] font-semibold"
                  colSpan={2}
                >
                  Total · input motor
                </td>
                <td className="px-3 py-2.5 text-right text-[12px] font-bold tabular-nums">
                  {formatEUR(ingresosTotal)}
                </td>
              </tr>
            </tfoot>
          )}
        </Table>
      </Card>

      <Card padding="sm">
        <p className="label-upper mb-1">Jubilación prevista</p>
        <p className="mb-3 text-[11px] text-mute">
          Introducido por el asesor, no calculado
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label-upper">Año</span>
            <input
              type="number"
              className={fieldClass}
              value={jubilacionAnio}
              onChange={(e) => onAnioChange(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-upper">Edad</span>
            <input
              type="number"
              className={fieldClass}
              value={jubilacionEdad}
              onChange={(e) => onEdadChange(e.target.value)}
            />
          </label>
        </div>
      </Card>

      <Card padding="sm">
        <p className="label-upper mb-1">Titularidad agregada</p>
        <p className="mb-2 text-[11px] text-mute">
          Parte del patrimonio atribuible por % de titularidad
        </p>
        <p className="text-[20px] font-bold tabular-nums tracking-[-0.02em] text-ink">
          {formatEUR(titularidad)}
        </p>
      </Card>
    </div>
  );
}
