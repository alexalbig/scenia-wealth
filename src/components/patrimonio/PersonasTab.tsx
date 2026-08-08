"use client";

import { useMemo } from "react";
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
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import {
  jubilacionDePersonaEnEscenario,
  personaTieneTitularidadFromBag,
} from "@/lib/expediente";
import { estadoFiscalPersona } from "@/lib/fiscal/estado-persona";
import { ageFromBirthYear, formatEUR } from "@/lib/format";
import { personaLabel } from "@/lib/patrimonio";
import type { Persona } from "@/lib/types";

const RETIREMENT_AGE = 65;

function motivoCorto(
  motivo: "ccaa_sin_cobertura" | "fuente_no_contemplada" | "sin_ingresos",
): string {
  switch (motivo) {
    case "sin_ingresos":
      return "sin ingresos";
    case "ccaa_sin_cobertura":
      return "CCAA sin cobertura";
    case "fuente_no_contemplada":
      return "fuente no contemplada";
  }
}

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
  const { bag, planBase } = useExpediente();

  const estados = useMemo(() => {
    const map: Record<string, ReturnType<typeof estadoFiscalPersona>> = {};
    for (const p of personas) {
      map[p.id] = estadoFiscalPersona(
        p,
        bag.ingresos.filter((i) => i.personaId === p.id),
      );
    }
    return map;
  }, [personas, bag.ingresos]);

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
            <TH>Estado</TH>
            <TH>Jubilación</TH>
            <TH className="right">Ingresos del año</TH>
            <TH className="right">Patrimonio atribuido</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {personas.length === 0 && (
            <TR>
              <TD colSpan={8} className="mut">
                Sin personas. Usa «+ Añadir» para cargar la primera.
              </TD>
            </TR>
          )}
          {personas.map((p) => {
            const label = personaLabel(p);
            const est = estados[p.id];
            const sinIngresos =
              est?.kind === "sin_calculo" && est.motivo === "sin_ingresos";
            const sinTitularidad = !personaTieneTitularidadFromBag(bag, p.id);
            const jubEvento = planBase
              ? jubilacionDePersonaEnEscenario(bag, planBase.id, p.id)
              : undefined;
            const jubAnio = jubEvento?.anio ?? p.birthYear + RETIREMENT_AGE;
            const jubDesdeEvento = !!jubEvento;
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
                <TD>
                  {est?.kind === "calculable" ? (
                    <span className="pill">Calculable</span>
                  ) : (
                    <span className="pill" title={est?.aviso}>
                      Sin cálculo
                      {est ? ` · ${motivoCorto(est.motivo)}` : ""}
                    </span>
                  )}
                </TD>
                <TD className="num">
                  {jubAnio}
                  {!jubDesdeEvento ? (
                    <span className="mut" title="Estimación por edad · sin evento en el plan base">
                      {" "}
                      · est.
                    </span>
                  ) : null}
                </TD>
                <TD className="right num strong">
                  {sinIngresos ? (
                    <span className="mut">—</span>
                  ) : (
                    formatEUR(ingresosOf(p.id))
                  )}
                </TD>
                <TD className="right num">
                  {sinTitularidad ? (
                    <span className="mut">—</span>
                  ) : (
                    formatEUR(patrimonioOf(p.id))
                  )}
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
        El estado de cálculo alimenta Fiscalidad y las guardas del motor. «—»
        indica dato sin informar (ingresos) o sin titularidades (patrimonio).
      </div>
    </>
  );
}
