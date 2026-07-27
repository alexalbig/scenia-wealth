"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
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
  "mt-1 w-full rounded-[8px] border border-line-2 bg-white px-2.5 py-2 text-[12.5px] tabular-nums text-ink outline-none focus:border-ink";

const backlinkClass =
  "mb-1.5 -ml-2 inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] font-semibold text-slate hover:bg-paper-2 hover:text-ink";

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
    <div>
      <Link
        href={`/clientes/${clienteId}/patrimonio?tab=personas`}
        className={backlinkClass}
      >
        ‹ Patrimonio · Personas
      </Link>

      <div className="mb-3.5">
        <p className="label-upper">Ficha · Persona</p>
        <h2 className="text-[22px] font-bold tracking-[-0.02em] text-ink">
          {personaLabel(persona)}
        </h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Nacimiento</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {persona.birthYear} · {edadActual} años
          </p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Comunidad autónoma</p>
          <p className="mt-[3px]">
            <Badge variant="neutral">{persona.ccaa}</Badge>
          </p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Ingresos del año</p>
          <p className="mt-[3px] text-[14.5px] font-bold tabular-nums text-ink">
            {formatEUR(ingresosTotal)}
          </p>
          <p className="mt-0.5 text-[10.5px] text-mute">alimenta el motor fiscal</p>
        </div>
        <div className="rounded-[10px] border border-line-2 bg-white px-[13px] py-[11px]">
          <p className="label-upper">Jubilación prevista</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-mute">
                Año
              </span>
              <input
                type="number"
                className={fieldClass}
                value={jubilacionAnio}
                onChange={(e) => onAnioChange(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-mute">
                Edad
              </span>
              <input
                type="number"
                className={fieldClass}
                value={jubilacionEdad}
                onChange={(e) => onEdadChange(e.target.value)}
              />
            </label>
          </div>
          <span className="intro-chip mt-2">✎ estimación del asesor</span>
        </div>
      </div>

      <p className="label-upper mb-1.5 mt-[18px]">
        Ingresos del año · {formatEUR(ingresosTotal)}
      </p>
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
                className="px-3 py-2 text-[12px] font-semibold"
                colSpan={2}
              >
                Total · input motor
              </td>
              <td className="px-3 py-2 text-right text-[12px] font-bold tabular-nums">
                {formatEUR(ingresosTotal)}
              </td>
            </tr>
          </tfoot>
        )}
      </Table>

      <p className="label-upper mb-1.5 mt-[18px]">
        Patrimonio atribuido · {formatEUR(titularidad)}
      </p>
      <div className="max-w-[420px] rounded-[10px] border border-line-2 bg-white px-3.5 py-3">
        <p className="text-[14.5px] font-bold tabular-nums text-ink">
          {formatEUR(titularidad)}
        </p>
        <p className="mt-1 text-[10.5px] text-mute">
          Parte del patrimonio atribuible por % de titularidad
        </p>
      </div>
    </div>
  );
}
