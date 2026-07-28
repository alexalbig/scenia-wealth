"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, LiqBadge, SheetPad, Toast } from "@/components/ui";
import { EventoModal } from "@/components/patrimonio/EventoModal";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { formatEUR } from "@/lib/format";
import {
  titTxtCorto,
  tipoOtroLabel,
  yearFromIso,
} from "@/lib/patrimonio";
import type { OtroActivo, Persona } from "@/lib/types";

/**
 * F5 · Ficha Otros activos — marcado literal del mockup `fOtros`.
 */
export function OtroActivoFicha({
  clienteId,
  activo,
  personas,
}: {
  clienteId: string;
  activo: OtroActivo;
  personas: Persona[];
}) {
  const { bag, planBase, addEvento } = useExpediente();
  const escenariosOpts = bag.escenarios.map((e) => ({
    id: e.id,
    nombre: e.nombre,
  }));
  const [eventoOpen, setEventoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
          <div className="lbl">Ficha · Otros activos</div>
          <div className="h1" style={{ fontSize: 22 }}>
            {activo.nombre}
          </div>
          <div className="tiny" style={{ marginTop: 2 }}>
            {tipoOtroLabel(activo.tipo)}
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
          <div className="v">{formatEUR(activo.valor)}</div>
        </div>
        <div>
          <div className="lbl">Fecha de adquisición</div>
          <div className="v">
            {activo.fechaAdquisicion
              ? yearFromIso(activo.fechaAdquisicion)
              : "—"}
          </div>
        </div>
        <div>
          <div className="lbl">Titularidad</div>
          <div className="v" style={{ fontSize: 12.5 }}>
            {titTxtCorto(activo.titularidades, personas)}
          </div>
        </div>
        <div>
          <div className="lbl">Liquidez</div>
          <div className="v" style={{ fontSize: 12 }}>
            <LiqBadge level="b" />
          </div>
        </div>
      </div>

      <div className="tiny" style={{ marginTop: 14 }}>
        La venta de este activo va por el <b>evento genérico</b> (sin cálculo
        fiscal): genera ganancia patrimonial en IRPF, pero está fuera de las 5
        reglas del motor.
      </div>

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="otro"
        elementoNombre={activo.nombre}
        elementoId={activo.id}
        clienteId={clienteId}
        escenarios={escenariosOpts}
        escenarioInicialId={planBase?.id}
        onCreated={(payload) => {
          addEvento(payload, {
            escenarioId: planBase?.id,
            targetId: activo.id,
          });
          setToast("Evento añadido al plan base — se refleja en Proyección");
          window.setTimeout(() => setToast(null), 2600);
        }}
      />
      <Toast message={toast} />
    </SheetPad>
  );
}
