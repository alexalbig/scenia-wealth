"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, LiqBadge, SheetPad, Toast } from "@/components/ui";
import { EventoModal } from "@/components/patrimonio/EventoModal";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { formatEUR } from "@/lib/format";
import {
  liquidezInstrumento,
  titTxtCorto,
  titularidadSegments,
  tipoFiscalMockup,
  yearFromIso,
} from "@/lib/patrimonio";
import type { Instrumento } from "@/lib/types";

/**
 * F2 · Ficha Portfolio — marcado literal del mockup `fPortfolio`.
 */
export function PortfolioFicha({
  clienteId,
  instrumento,
}: {
  clienteId: string;
  instrumento: Instrumento;
  /** Compat: otros instrumentos del expediente (ya no se listan en ficha). */
  instrumentos?: Instrumento[];
}) {
  const { bag, planBase, addEvento } = useExpediente();
  const escenariosOpts = bag.escenarios.map((e) => ({
    id: e.id,
    nombre: e.nombre,
  }));
  const personas = bag.personas;
  const [eventoOpen, setEventoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const esPlan = instrumento.tipoFiscal === "plan_pensiones";
  const titulo = esPlan ? "Plan de pensiones" : instrumento.nombre;
  const acciones = esPlan
    ? "Rescatar plan — desde «⚡ Evento». El motor calcula; tú nunca tecleas un tipo impositivo."
    : "Reembolsar · Traspasar · Pignorar · Aportar — desde «⚡ Evento». El motor calcula; tú nunca tecleas un tipo impositivo.";

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
          <div className="lbl">Ficha · Portfolio financiero</div>
          <div className="h1" style={{ fontSize: 22 }}>
            {titulo}
          </div>
          <div className="tiny" style={{ marginTop: 2 }}>
            {tipoFiscalMockup(instrumento.tipoFiscal)}
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
          <div className="lbl">Valor actual</div>
          <div className="v">{formatEUR(instrumento.valor)}</div>
        </div>
        <div>
          <div className="lbl">Fecha de adquisición</div>
          <div className="v">{yearFromIso(instrumento.fechaAdquisicion)}</div>
          <div className="tiny">clave para traspaso y FIFO</div>
        </div>
        {instrumento.costeAdquisicion != null && (
          <div>
            <div className="lbl">Coste de adquisición</div>
            <div className="v">{formatEUR(instrumento.costeAdquisicion)}</div>
          </div>
        )}
        {instrumento.plusvaliaLatente != null && (
          <div>
            <div className="lbl">Plusvalía latente</div>
            <div className="v gain">
              +{formatEUR(instrumento.plusvaliaLatente)}
            </div>
            <div className="tiny">hecho objetivo del activo</div>
          </div>
        )}
        {esPlan && (
          <div>
            <div className="lbl">% aportaciones ≤ 31/12/2006</div>
            <div className="v">
              {instrumento.fraccionPre2007 != null
                ? `${Math.round(instrumento.fraccionPre2007 * 100)} %`
                : "—"}
            </div>
            <div className="tiny">
              {instrumento.fraccionPre2007 != null
                ? "introducido por el asesor · no calculado · DT 12ª"
                : "hueco · sin dato el motor no aplica la reducción 40 %"}
            </div>
          </div>
        )}
        <div>
          <div className="lbl">Liquidez</div>
          <div className="v" style={{ fontSize: 12 }}>
            <LiqBadge level={liquidezInstrumento(instrumento.tipoFiscal)} />
          </div>
        </div>
      </div>

      <div className="lbl" style={{ margin: "18px 0 6px" }}>
        Reparto de titularidad
      </div>
      <div
        style={{
          border: "1px solid var(--line-2)",
          borderRadius: 10,
          background: "#fff",
          padding: "12px 14px",
          maxWidth: 420,
        }}
      >
        <span className="tiny">
          {titTxtCorto(instrumento.titularidades, personas)}
        </span>
        <div className="tit-bar">
          {titularidadSegments(instrumento.titularidades).map((s, i) => (
            <i key={i} style={{ width: `${s.pct}%`, background: s.color }} />
          ))}
        </div>
        <div className="tiny" style={{ marginTop: 8 }}>
          Cada titular tributa su parte en su propia escala — por eso el
          reparto vive en el instrumento.
        </div>
      </div>

      <div className="lbl" style={{ margin: "18px 0 6px" }}>
        Acciones sobre este instrumento
      </div>
      <div className="tiny">{acciones}</div>

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="instrumento"
        elementoNombre={titulo}
        tipoFiscal={instrumento.tipoFiscal}
        elementoId={instrumento.id}
        clienteId={clienteId}
        escenarios={escenariosOpts}
        escenarioInicialId={planBase?.id}
        onCreated={(payload) => {
          addEvento(payload, {
            escenarioId: planBase?.id,
            targetId: instrumento.id,
          });
          setToast("Evento añadido al plan base — se refleja en Proyección");
          window.setTimeout(() => setToast(null), 2600);
        }}
      />
      <Toast message={toast} />
    </SheetPad>
  );
}
