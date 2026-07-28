"use client";

import { useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  initialsFromName,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { RowCrud } from "@/components/patrimonio/RowCrud";
import { ageFromBirthYear, formatEUR } from "@/lib/format";
import { personaLabel } from "@/lib/patrimonio";
import type { Persona } from "@/lib/types";

export function PersonasTab({
  clienteId,
  personas,
  ingresosOf,
  patrimonioOf,
  onAdd,
  onEdit,
  onDelete,
}: {
  clienteId: string;
  personas: Persona[];
  ingresosOf: (personaId: string) => number;
  patrimonioOf: (personaId: string) => number;
  onAdd: () => void;
  onEdit: (p: Persona) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div className="lbl">Personas del expediente</div>
        <Button size="sm" variant="ghost" onClick={onAdd}>
          + Añadir
        </Button>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Persona</TH>
            <TH>Edad</TH>
            <TH>CCAA</TH>
            <TH className="right">Ingresos del año</TH>
            <TH className="right">Patrimonio atribuido</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {personas.length === 0 && (
            <TR>
              <TD colSpan={6} className="mut">
                Sin personas. Usa «+ Añadir» para cargar la primera.
              </TD>
            </TR>
          )}
          {personas.map((p) => {
            const label = personaLabel(p);
            return (
              <TR
                key={p.id}
                className="rowlink"
                onClick={() =>
                  router.push(`/clientes/${clienteId}/fichas/persona/${p.id}`)
                }
              >
                <TD>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 9 }}
                  >
                    <Avatar initials={initialsFromName(label)} />
                    <b>{label}</b>
                  </div>
                </TD>
                <TD className="num">{ageFromBirthYear(p.birthYear)}</TD>
                <TD className="slt">{p.ccaa}</TD>
                <TD className="right num strong">
                  {formatEUR(ingresosOf(p.id))}
                </TD>
                <TD className="right num">
                  {formatEUR(patrimonioOf(p.id))}
                </TD>
                <TD className="right">
                  <RowCrud
                    onEdit={() => onEdit(p)}
                    onDelete={() => onDelete(p.id)}
                  />
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
      <div className="tiny" style={{ marginTop: 10 }}>
        Los ingresos alimentan el motor fiscal (regla del rescate del plan).
      </div>
    </>
  );
}
