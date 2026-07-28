"use client";

import { useMemo, useState } from "react";
import { SheetPad } from "@/components/ui";
import { FiscalControls } from "@/components/fiscalidad/FiscalControls";
import { TramosViewer } from "@/components/fiscalidad/TramosViewer";
import { SerieIRPF } from "@/components/fiscalidad/SerieIRPF";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { formatEUR } from "@/lib/format";
import { ids } from "@/lib/seed";
import {
  anioPorDefecto,
  aniosToolbarFiscal,
  baseAhorroPersona,
  baseGeneralPersona,
  ccaaConCobertura,
  cuotaIRPFPersona,
  factorFiscalAnyo,
  irpfVidaPresentado,
  kpisVida,
  serieIRPFPlanBase,
  type EurMode,
} from "@/lib/fiscal";
import type { Cliente } from "@/lib/types";

/**
 * P4 · Fiscalidad — marcado literal del mockup `renderFiscalidad`.
 * El liquidador mock (KPIs, cuota, serie) solo existe para García-Llorente
 * (firewall 8: no inventar cifras fiscales). El resto de expedientes
 * completos muestran bases reales del bag y un aviso honesto.
 */
export function FiscalidadView({ cliente }: { cliente: Cliente }) {
  const { bag, ingresosPersona } = useExpediente();
  const personas = bag.personas;
  const isGL = cliente.id === ids.clienteGarciaLlorente;

  const anios = useMemo(() => aniosToolbarFiscal(), []);
  const serie = useMemo(() => (isGL ? serieIRPFPlanBase() : []), [isGL]);

  const [personaId, setPersonaId] = useState(() => personas[0]?.id ?? "");
  const [anio, setAnio] = useState(anioPorDefecto);
  const [eurMode, setEurMode] = useState<EurMode>("hoy");

  if (!cliente.completo) {
    return (
      <SheetPad>
        <div className="lbl">Fiscalidad · foto del plan base</div>
        <div className="h2">Cómo está fiscalmente este cliente</div>
        <div className="chartbox" style={{ marginTop: 14 }}>
          <p className="tiny" style={{ margin: 0 }}>
            Este expediente solo puebla la Cartera. La foto fiscal completa
            está en Familia García-Llorente.
          </p>
        </div>
      </SheetPad>
    );
  }

  if (!ccaaConCobertura(cliente.ccaa)) {
    return (
      <SheetPad>
        <div className="lbl">Fiscalidad · foto del plan base</div>
        <div className="h2">Cómo está fiscalmente este cliente</div>
        <div className="chartbox" style={{ marginTop: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink)" }}>
            El cálculo fiscal solo está disponible para la Comunitat
            Valenciana.
          </p>
          <p className="tiny" style={{ marginTop: 6 }}>
            CCAA del expediente: {cliente.ccaa}
          </p>
        </div>
      </SheetPad>
    );
  }

  const personaActiva =
    personas.find((p) => p.id === personaId) ?? personas[0];
  const pid = personaActiva?.id ?? "";
  const nombreCorto = personaActiva?.nombre ?? "";

  const kpis = isGL ? kpisVida(cliente.id, pid) : null;
  const baseG = isGL ? baseGeneralPersona(cliente.id, pid) : ingresosPersona(pid);
  const baseA = isGL ? baseAhorroPersona(cliente.id, pid) : 0;
  const cuota = isGL ? cuotaIRPFPersona(pid) : 0;
  const factor = factorFiscalAnyo(anio, eurMode);

  return (
    <SheetPad>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div>
          <div className="lbl">Fiscalidad · foto del plan base</div>
          <div className="h2">Cómo está fiscalmente este cliente</div>
        </div>
        <FiscalControls
          personas={personas}
          personaId={pid}
          onPersona={setPersonaId}
          anios={anios}
          anio={anio}
          onAnio={setAnio}
          eurMode={eurMode}
          onEurMode={setEurMode}
        />
      </div>

      {isGL && kpis && (
        <div className="grid2" style={{ marginBottom: 14 }}>
          <div
            style={{
              border: "1px solid var(--line-2)",
              borderRadius: 10,
              background: "#fff",
              padding: "13px 15px",
            }}
          >
            <div className="lbl">
              IRPF proyectado {kpis.anioInicio}–{kpis.anioFin} · {nombreCorto}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }} className="num">
              {formatEUR(irpfVidaPresentado(kpis.irpfTotal, eurMode))}
            </div>
            <div className="tiny">
              orientativo · parámetros (a verificar)
            </div>
          </div>
          <div
            style={{
              border: "1px solid var(--line-2)",
              borderRadius: 10,
              background: "#fff",
              padding: "13px 15px",
            }}
          >
            <div className="lbl">Tipo efectivo medio (ETR) · {anio}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }} className="num">
              {formatETR(kpis.etr)}
            </div>
            <div className="tiny">
              cuota ≈ {formatEUR(Math.round(cuota * factor))} sobre{" "}
              {formatEUR(Math.round(baseG * factor))} · orientativo
            </div>
          </div>
        </div>
      )}

      {!isGL && (
        <div className="chartbox" style={{ marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink)" }}>
            Liquidador mock cargado solo para García-Llorente · las bases sí
            reflejan los ingresos del expediente.
          </p>
        </div>
      )}

      <TramosViewer
        anio={anio}
        personaNombre={nombreCorto}
        baseGeneral={baseG}
        baseAhorro={baseA}
      />

      {isGL && (
        <SerieIRPF
          serie={serie}
          anio={anio}
          onAnio={setAnio}
          eurMode={eurMode}
        />
      )}
    </SheetPad>
  );
}

function formatETR(value: number): string {
  return (
    new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(value * 100) + " %"
  );
}
