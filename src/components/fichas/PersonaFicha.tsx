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
import { parsePensionJubilacion } from "@/lib/fiscal/contexto";
import { estadoFiscalPersona } from "@/lib/fiscal/estado-persona";
import { avisoCoberturaCcaa, ccaaConCoberturaGeneral } from "@/lib/fiscal";
import { jubilacionDePersonaEnEscenario } from "@/lib/expediente";
import { ageFromBirthYear, formatEUR } from "@/lib/format";
import { formatPctLabel, personaLabel } from "@/lib/patrimonio";
import type { CCAA, Persona, Titularidad } from "@/lib/types";

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
        pctLabel: formatPctLabel(t.porcentaje),
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
 * F1 · Ficha Persona.
 * La jubilación de la ficha es el evento del plan base (misma verdad).
 * Una hipótesis alternativa («¿y si en 2029?») se monta desde Escenarios.
 */
export function PersonaFicha({
  clienteId,
  persona,
}: {
  clienteId: string;
  persona: Persona;
}) {
  const {
    bag,
    ingresosPersona,
    patrimonioAtribuido,
    planBase,
    addEvento,
    desgloseBasePersona,
  } = useExpediente();
  const [eventoOpen, setEventoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const edad = ageFromBirthYear(persona.birthYear);
  const estimacionEdad = persona.birthYear + RETIREMENT_AGE;
  const label = personaLabel(persona);
  const iniciales = initialsFromName(label);
  const ingresos = ingresosPersona(persona.id);
  const totalAtribuido = patrimonioAtribuido(persona.id);
  const filas = useMemo(
    () => filasAtribuidas(bag, persona.id),
    [bag, persona.id],
  );

  const ingresosPersonaBag = useMemo(
    () => bag.ingresos.filter((i) => i.personaId === persona.id),
    [bag.ingresos, persona.id],
  );
  const estado = useMemo(
    () => estadoFiscalPersona(persona, ingresosPersonaBag),
    [persona, ingresosPersonaBag],
  );
  const desglose = useMemo(
    () => desgloseBasePersona(persona.id),
    [desgloseBasePersona, persona.id],
  );

  const jubEvento = planBase
    ? jubilacionDePersonaEnEscenario(bag, planBase.id, persona.id)
    : undefined;
  const jubAnio = jubEvento?.anio ?? estimacionEdad;
  const jubPension = jubEvento
    ? parsePensionJubilacion(jubEvento)
    : null;
  const jubDesdeEvento = !!jubEvento;

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
          {!ccaaConCoberturaGeneral(persona.ccaa) && (
            <div className="tiny" style={{ marginTop: 4 }}>
              {avisoCoberturaCcaa(persona.ccaa as CCAA) ||
                "Base general sin escala autonómica cargada"}
            </div>
          )}
        </div>
        <div>
          <div className="lbl">Ingresos del año</div>
          {estado.kind === "sin_calculo" &&
          estado.motivo === "sin_ingresos" ? (
            <>
              <div className="v" style={{ fontSize: 14 }}>
                Sin ingresos informados
              </div>
              <div className="tiny" style={{ marginTop: 4 }}>
                <Link
                  href={`/clientes/${clienteId}/patrimonio?tab=ingresos`}
                  style={{
                    color: "var(--ink)",
                    fontWeight: 600,
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                  }}
                >
                  Ir a Ingresos
                </Link>
              </div>
            </>
          ) : estado.kind === "calculable" && desglose.bruto > 0 ? (
            <>
              <div className="v">{formatEUR(desglose.baseLiquidable)}</div>
              <div className="tiny" style={{ marginTop: 4 }}>
                base liquidable · orientativo
              </div>
              <div
                className="tiny"
                style={{ marginTop: 8, color: "var(--ink-3)" }}
              >
                {desglose.conceptos.map((c) => (
                  <div
                    key={c.etiqueta}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "1px 0",
                    }}
                  >
                    <span>{c.etiqueta}</span>
                    <span className="num">{formatEUR(c.importe)}</span>
                  </div>
                ))}
              </div>
              {desglose.trabajoBruto > 0 &&
                !desglose.cotizacionesInformadas && (
                  <div className="tiny" style={{ marginTop: 6 }}>
                    Cotizaciones SS no informadas · se restan 0 € ·{" "}
                    <span className="mut">editar persona para informarlas</span>
                  </div>
                )}
            </>
          ) : (
            <>
              <div className="v">{formatEUR(ingresos)}</div>
              <div className="tiny">bruto del año</div>
            </>
          )}
        </div>
        <div>
          <div className="lbl">Jubilación prevista</div>
          <div className="v">
            {jubAnio}
            {!jubDesdeEvento ? ` (${RETIREMENT_AGE})` : ""}
            {jubPension != null ? ` · ${formatEUR(jubPension)}/año` : ""}
          </div>
          <div className="tag-manual" style={{ marginTop: 4 }}>
            ✎{" "}
            {jubDesdeEvento
              ? "estimación del asesor · plan base"
              : "estimación por edad · sin evento en el plan base"}
          </div>
          <div className="tiny" style={{ marginTop: 6 }}>
            La ficha describe la vida real (plan base). Una jubilación
            alternativa se monta en Escenarios.
          </div>
        </div>
        <div>
          <div className="lbl">Estado de cálculo</div>
          {estado.kind === "calculable" ? (
            <>
              <div className="v" style={{ fontSize: 14 }}>
                Con renta calculable
              </div>
              <div className="tiny" style={{ marginTop: 4 }}>
                Perfil {estado.perfil}
                {!ccaaConCoberturaGeneral(persona.ccaa)
                  ? " · base del ahorro disponible"
                  : ""}
              </div>
            </>
          ) : (
            <>
              <div className="v" style={{ fontSize: 14 }}>
                Sin cálculo
              </div>
              <div className="tiny" style={{ marginTop: 4 }}>
                {estado.aviso}
                {estado.motivo === "sin_ingresos" && (
                  <>
                    {" · "}
                    <Link
                      href={`/clientes/${clienteId}/patrimonio?tab=ingresos`}
                      style={{
                        color: "var(--ink)",
                        fontWeight: 600,
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                      }}
                    >
                      Ir a Ingresos
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="lbl" style={{ margin: "18px 0 6px" }}>
        Patrimonio atribuido
        {filas.length === 0
          ? " · sin titularidades"
          : ` · ${formatEUR(totalAtribuido)}`}
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
        escenarioInicialId={planBase?.id}
        anioInicial={jubAnio}
        pensionInicial={jubPension ?? undefined}
        onCreated={(payload) => {
          addEvento(payload, {
            escenarioId: planBase?.id,
            targetId: persona.id,
          });
          flash(
            jubDesdeEvento
              ? "Jubilación del plan base actualizada"
              : "Jubilación anotada en el plan base",
          );
        }}
      />
      <Toast message={toast} />
    </SheetPad>
  );
}
