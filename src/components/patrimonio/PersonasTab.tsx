"use client";

import Link from "next/link";
import { Badge, Button, Card, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { formatEUR } from "@/lib/format";
import { ageFromBirthYear } from "@/lib/format";
import {
  ingresosPorPersona,
  personaLabel,
  titularidadAgregada,
} from "@/lib/patrimonio";
import type { Persona } from "@/lib/types";

export function PersonasTab({
  clienteId,
  personas,
  onAdd,
}: {
  clienteId: string;
  personas: Persona[];
  onAdd: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-upper">Personas del expediente</p>
        <Button size="sm" variant="secondary" onClick={onAdd}>
          + Añadir persona
        </Button>
      </div>

      <Card padding="sm">
        <Table>
          <THead>
            <TR>
              <TH>Nombre</TH>
              <TH>Edad</TH>
              <TH>CCAA</TH>
              <TH className="text-right">Ingresos del año</TH>
              <TH className="text-right">Titularidad agregada</TH>
            </TR>
          </THead>
          <TBody>
            {personas.map((p) => (
              <TR key={p.id}>
                <TD>
                  <Link
                    href={`/clientes/${clienteId}/fichas/persona/${p.id}`}
                    className="font-semibold text-ink hover:underline"
                  >
                    {personaLabel(p)}
                  </Link>
                </TD>
                <TD>{ageFromBirthYear(p.birthYear)}</TD>
                <TD>
                  <Badge variant="neutral">{p.ccaa}</Badge>
                </TD>
                <TD numeric>{formatEUR(ingresosPorPersona(clienteId, p.id))}</TD>
                <TD numeric>{formatEUR(titularidadAgregada(clienteId, p.id))}</TD>
              </TR>
            ))}
            {personas.length === 0 && (
              <TR>
                <TD colSpan={5} className="py-6 text-center text-mute">
                  Sin personas en este expediente.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
