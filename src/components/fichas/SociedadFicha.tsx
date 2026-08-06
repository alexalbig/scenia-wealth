"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
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
import { GastosVinculadosBlock } from "@/components/fichas/GastosVinculadosBlock";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { formatEUR } from "@/lib/format";
import { gastosVinculadosA, yearFromIso } from "@/lib/patrimonio";
import { personaLabel } from "@/lib/patrimonio";
import type { Inmueble, Instrumento, Persona, Sociedad } from "@/lib/types";

/**
 * F4 · Ficha Sociedad — marcado literal del mockup `fSociedad`.
 */
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
  const { bag, planBase, addEvento } = useExpediente();
  const escenariosOpts = bag.escenarios.map((e) => ({
    id: e.id,
    nombre: e.nombre,
  }));
  const [eventoOpen, setEventoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
      .map((i) => ({
        id: i.id,
        nombre: i.nombre,
        tipo: "Instrumento",
        valor: i.valor,
      })),
    ...inmuebles
      .filter((i) => i.sociedadId === sociedad.id)
      .map((i) => ({
        id: i.id,
        nombre: i.nombre,
        tipo: "Inmueble",
        valor: i.valor,
      })),
  ];
  const gastosSociedad = gastosVinculadosA(bag.gastos, {
    kind: "sociedad",
    sociedadId: sociedad.id,
  });
  const valorSociedad =
    activosSociedad.reduce((s, a) => s + (a.valor ?? 0), 0) || null;

  return (
    <SheetPad>
      <Link
        href={`/clientes/${clienteId}/patrimonio?tab=activos`}
        className="backlink"
      >
        ‹ Patrimonio · Activos
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="lbl">Ficha · Sociedad</div>
          <div className="h1" style={{ fontSize: 22 }}>
            {sociedad.nombre}
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
          <div className="lbl">NIF</div>
          <div className="v" style={{ fontSize: 13 }}>
            {sociedad.nif}
          </div>
        </div>
        <div>
          <div className="lbl">Constitución</div>
          <div className="v">{yearFromIso(sociedad.fechaConstitucion)}</div>
        </div>
        <div>
          <div className="lbl">Capital social</div>
          <div className="v">{formatEUR(sociedad.capitalSocial)}</div>
        </div>
        <div>
          <div className="lbl">Situación mercantil</div>
          <div className="v" style={{ fontSize: 12.5 }}>
            {sociedad.situacion}
          </div>
        </div>
        <div>
          <div className="lbl">Objeto social</div>
          <div className="v" style={{ fontSize: 12, fontWeight: 500 }}>
            {sociedad.objetoSocial}
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid var(--line-2)",
            borderRadius: 10,
            background: "#fff",
            padding: "13px 15px",
          }}
        >
          <div className="lbl" style={{ marginBottom: 8 }}>
            Participación
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Persona</TH>
                <TH className="right">%</TH>
              </TR>
            </THead>
            <TBody>
              {participaciones.map((row) => (
                <TR key={row.personaId}>
                  <TD>
                    <b>{row.label}</b>
                  </TD>
                  <TD className="right num">
                    {Math.round(row.porcentaje * 100)} %
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
        <div
          style={{
            border: "1px solid var(--line-2)",
            borderRadius: 10,
            background: "#fff",
            padding: "13px 15px",
          }}
        >
          <div className="lbl" style={{ marginBottom: 8 }}>
            Activos de la sociedad
          </div>
          {activosSociedad.length > 0 ? (
            <Table>
              <THead>
                <TR>
                  <TH>Activo</TH>
                  <TH>Tipo</TH>
                  <TH className="right">Valor</TH>
                </TR>
              </THead>
              <TBody>
                {activosSociedad.map((a) => (
                  <TR key={a.id}>
                    <TD>
                      <b>{a.nombre}</b>
                    </TD>
                    <TD>{a.tipo}</TD>
                    <TD className="right num">{formatEUR(a.valor)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <div className="empty" style={{ padding: "12px 4px" }}>
              Sin activos registrados a nombre de la sociedad.
            </div>
          )}
        </div>
      </div>

      <GastosVinculadosBlock
        gastos={gastosSociedad}
        valorElemento={valorSociedad}
      />

      <div
        style={{
          marginTop: 14,
          border: "1px solid var(--line-2)",
          borderRadius: 10,
          background: "var(--paper-2)",
          padding: "14px 16px",
        }}
      >
        <span className="tag-pend">
          Fiscalidad societaria · pendiente de definir
        </span>
        <div className="sub" style={{ marginTop: 8 }}>
          El liquidador de Impuesto de Sociedades aún no existe en Scenia. Los
          eventos de esta ficha (repartir dividendo, vender participación){" "}
          <b>se registran sin cálculo fiscal</b> — no se muestran cifras que el
          motor no puede calcular.
        </div>
      </div>

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="sociedad"
        elementoNombre={sociedad.nombre}
        elementoId={sociedad.id}
        clienteId={clienteId}
        escenarios={escenariosOpts}
        escenarioInicialId={planBase?.id}
        onCreated={(payload) => {
          addEvento(payload, {
            escenarioId: planBase?.id,
            targetId: sociedad.id,
          });
          setToast(
            "Evento registrado sin cálculo fiscal — IS pendiente de definir",
          );
          window.setTimeout(() => setToast(null), 2600);
        }}
      />
      <Toast message={toast} />
    </SheetPad>
  );
}
