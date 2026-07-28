"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  initialsFromName,
  SheetPad,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Toast,
  TR,
} from "@/components/ui";
import { EventoModal } from "@/components/patrimonio/EventoModal";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { ageFromBirthYear, formatEUR } from "@/lib/format";
import { personaLabel } from "@/lib/patrimonio";
import type { Persona, Titularidad } from "@/lib/types";

const RETIREMENT_AGE = 65;

function filasAtribuidas(
  bag: ReturnType<typeof useExpediente>["bag"],
  personaId: string,
) {
  const rows: Array<{
    id: string;
    nombre: string;
    pctLabel: string;
    valor: number;
  }> = [];
  const push = (
    id: string,
    nombre: string,
    valor: number,
    titularidades: Titularidad[],
  ) => {
    const t = titularidades.find(
      (x) => x.owner.kind === "persona" && x.owner.personaId === personaId,
    );
    if (t && t.porcentaje > 0) {
      rows.push({
        id,
        nombre,
        pctLabel: `${Math.round(t.porcentaje * 100)} %`,
        valor: valor * t.porcentaje,
      });
    }
  };
  bag.instrumentos.forEach((i) =>
    push(i.id, i.nombre, i.valor, i.titularidades),
  );
  bag.inmuebles.forEach((i) =>
    push(i.id, i.nombre, i.valor, i.titularidades),
  );
  bag.otrosActivos.forEach((a) =>
    push(a.id, a.nombre, a.valor, a.titularidades),
  );
  return rows;
}

/**
 * F1 · Ficha Persona — marcado literal del mockup `fPersona`.
 */
export function PersonaFicha({
  clienteId,
  persona,
}: {
  clienteId: string;
  persona: Persona;
}) {
  const { bag, ingresosPersona, patrimonioAtribuido, planBase, addEvento } =
    useExpediente();
  const escenariosOpts = bag.escenarios.map((e) => ({
    id: e.id,
    nombre: e.nombre,
  }));
  const [eventoOpen, setEventoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const edad = ageFromBirthYear(persona.birthYear);
  const jubilacionAnio = persona.birthYear + RETIREMENT_AGE;
  const label = personaLabel(persona);
  const iniciales = initialsFromName(label);
  const ingresos = ingresosPersona(persona.id);
  const totalAtribuido = patrimonioAtribuido(persona.id);
  const filas = useMemo(
    () => filasAtribuidas(bag, persona.id),
    [bag, persona.id],
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  return (
    <SheetPad>
      <Link
        href={`/clientes/${clienteId}/patrimonio?tab=personas`}
        className="backlink"
      >
        ‹ Patrimonio · Personas
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <Avatar
          initials={iniciales}
          style={{ width: 40, height: 40, fontSize: 14 }}
        />
        <div>
          <div className="lbl">Ficha · Persona</div>
          <div className="h1" style={{ fontSize: 22 }}>
            {label}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Button size="sm" onClick={() => setEventoOpen(true)}>
            ⚡ Evento
          </Button>
        </div>
      </div>

      <div className="kv">
        <div>
          <div className="lbl">Nacimiento</div>
          <div className="v">
            {persona.birthYear} · {edad} años
          </div>
        </div>
        <div>
          <div className="lbl">Comunidad autónoma</div>
          <div className="v" style={{ fontSize: 12.5 }}>
            {persona.ccaa}
          </div>
        </div>
        <div>
          <div className="lbl">Ingresos del año</div>
          <div className="v">{formatEUR(ingresos)}</div>
          <div className="tiny">alimenta el motor fiscal</div>
        </div>
        <div>
          <div className="lbl">Jubilación prevista</div>
          <div className="v">
            {jubilacionAnio} ({RETIREMENT_AGE})
          </div>
          <div className="tag-manual" style={{ marginTop: 4 }}>
            ✎ estimación del asesor
          </div>
        </div>
      </div>

      <div className="lbl" style={{ margin: "18px 0 6px" }}>
        Patrimonio atribuido · {formatEUR(totalAtribuido)}
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Elemento</TH>
            <TH className="right">Titularidad</TH>
            <TH className="right">Valor atribuido</TH>
          </TR>
        </THead>
        <TBody>
          {filas.map((row) => (
            <TR key={row.id}>
              <TD>
                <b>{row.nombre}</b>
              </TD>
              <TD className="right num">{row.pctLabel}</TD>
              <TD className="right num">
                {row.valor != null ? (
                  formatEUR(row.valor)
                ) : (
                  <span className="mut">no valorada</span>
                )}
              </TD>
            </TR>
          ))}
          {filas.length === 0 && (
            <TR>
              <TD colSpan={3}>
                <div className="empty">Sin patrimonio atribuido.</div>
              </TD>
            </TR>
          )}
        </TBody>
      </Table>

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="persona"
        elementoNombre={label}
        elementoId={persona.id}
        clienteId={clienteId}
        escenarios={escenariosOpts}
        escenarioInicialId={planBase?.id}
        onCreated={(payload) => {
          addEvento(payload, {
            escenarioId: planBase?.id,
            targetId: persona.id,
          });
          flash("Evento añadido al plan base — se refleja en Proyección");
        }}
      />
      <Toast message={toast} />
    </SheetPad>
  );
}
