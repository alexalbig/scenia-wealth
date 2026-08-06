"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, LiqBadge, SheetPad, Toast } from "@/components/ui";
import { EventoModal } from "@/components/patrimonio/EventoModal";
import { GastosVinculadosBlock } from "@/components/fichas/GastosVinculadosBlock";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { formatEUR, formatPercent } from "@/lib/format";
import {
  gastosVinculadosA,
  titTxtCorto,
  titularidadSegments,
  yearFromIso,
} from "@/lib/patrimonio";
import type { Inmueble, Pasivo, Persona } from "@/lib/types";

/**
 * F3 · Ficha Inmueble — marcado literal del mockup `fInmueble`.
 */
export function InmuebleFicha({
  clienteId,
  inmueble,
  pasivo,
  personas,
}: {
  clienteId: string;
  inmueble: Inmueble;
  pasivo?: Pasivo;
  personas: Persona[];
}) {
  const { bag, planBase, addEvento } = useExpediente();
  const escenariosOpts = bag.escenarios.map((e) => ({
    id: e.id,
    nombre: e.nombre,
  }));
  const [eventoOpen, setEventoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const adq = yearFromIso(inmueble.fechaAdquisicion);
  const coste = inmueble.costeAdquisicion;
  const plusv = inmueble.plusvaliaLatente;
  const gastosInmueble = gastosVinculadosA(bag.gastos, {
    kind: "inmueble",
    inmuebleId: inmueble.id,
  });

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
          <div className="lbl">Ficha · Inmueble</div>
          <div className="h1" style={{ fontSize: 22 }}>
            {inmueble.nombre}
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
          <div className="v">{formatEUR(inmueble.valor)}</div>
        </div>
        <div>
          <div className="lbl">Adquisición</div>
          <div className="v">
            {adq}
            {coste != null ? ` · ${formatEUR(coste)}` : ""}
          </div>
        </div>
        {plusv != null && (
          <div>
            <div className="lbl">Plusvalía latente</div>
            <div className="v gain">+{formatEUR(plusv)}</div>
          </div>
        )}
        <div>
          <div className="lbl">Liquidez</div>
          <div className="v" style={{ fontSize: 12 }}>
            <LiqBadge level="b" />
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
            Hipoteca asociada
          </div>
          {pasivo ? (
            <>
              <div
                className="sub"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                }}
              >
                <span>Capital pendiente</span>
                <b className="num">{formatEUR(pasivo.capitalPendiente)}</b>
              </div>
              <div
                className="sub"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                }}
              >
                <span>Tipo</span>
                <b className="num">{formatPercent(pasivo.tipoInteres)}</b>
              </div>
              <div
                className="sub"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                }}
              >
                <span>Cuota</span>
                <b className="num">{formatEUR(pasivo.cuotaMensual)}/mes</b>
              </div>
            </>
          ) : (
            <div className="tiny">Sin hipoteca asociada.</div>
          )}
        </div>

        <div
          style={{
            border: "1px solid var(--line-2)",
            borderRadius: 10,
            background: "#fff",
            padding: "13px 15px",
          }}
        >
          <div className="lbl" style={{ marginBottom: 6 }}>
            Reparto de titularidad
          </div>
          <span className="tiny">
            {titTxtCorto(inmueble.titularidades, personas)}
          </span>
          <div className="tit-bar">
            {titularidadSegments(inmueble.titularidades).map((s, i) => (
              <i key={i} style={{ width: `${s.pct}%`, background: s.color }} />
            ))}
          </div>
          <div className="tiny" style={{ marginTop: 10 }}>
            Acciones: Vender (regla &gt;65) · Amortizar hipoteca — desde «⚡
            Evento».
          </div>
        </div>
      </div>

      <GastosVinculadosBlock
        gastos={gastosInmueble}
        valorElemento={inmueble.valor}
      />

      <EventoModal
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="inmueble"
        elementoNombre={inmueble.nombre}
        elementoId={inmueble.id}
        clienteId={clienteId}
        escenarios={escenariosOpts}
        escenarioInicialId={planBase?.id}
        onCreated={(payload) => {
          addEvento(payload, {
            escenarioId: planBase?.id,
            targetId: inmueble.id,
          });
          setToast("Evento añadido al plan base — se refleja en Proyección");
          window.setTimeout(() => setToast(null), 2600);
        }}
      />
      <Toast message={toast} />
    </SheetPad>
  );
}
