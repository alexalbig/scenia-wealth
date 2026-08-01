"use client";

import { useMemo, useState } from "react";
import { SheetPad } from "@/components/ui";
import { FiscalControls } from "@/components/fiscalidad/FiscalControls";
import { TramosViewer } from "@/components/fiscalidad/TramosViewer";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { formatEUR } from "@/lib/format";
import {
  anioPorDefecto,
  aniosToolbarFiscal,
  avisoCoberturaCcaa,
  baseAhorroPersona,
  ccaaConCobertura,
  liquidacionEjercicio,
} from "@/lib/fiscal";
import type { Cliente } from "@/lib/types";

/**
 * P4 · Fiscalidad — liquidación de ejercicio (motor).
 * Sin KPIs de vida, sin series inventadas, sin 0 € limpios en huecos.
 */
export function FiscalidadView({ cliente }: { cliente: Cliente }) {
  const { bag, ingresosPersona } = useExpediente();
  const personas = bag.personas;

  const anios = useMemo(() => aniosToolbarFiscal(), []);
  const [personaId, setPersonaId] = useState(() => personas[0]?.id ?? "");
  const [anio, setAnio] = useState(anioPorDefecto);

  if (!cliente.completo) {
    return (
      <SheetPad>
        <div className="lbl">Fiscalidad · foto del plan base</div>
        <div className="h2">Cómo está fiscalmente este cliente</div>
        <div className="chartbox" style={{ marginTop: 14 }}>
          <p className="tiny" style={{ margin: 0 }}>
            Este expediente solo puebla la Cartera. Faltan ingresos y datos
            suficientes para liquidar el ejercicio — hueco, sin cifra
            inventada.
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
            {avisoCoberturaCcaa(cliente.ccaa)}
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

  const baseG = ingresosPersona(pid);
  const baseA = baseAhorroPersona(cliente.id, pid);
  const edad = personaActiva
    ? anio - personaActiva.birthYear
    : undefined;
  const liq = liquidacionEjercicio({
    baseGeneral: baseG,
    baseAhorro: baseA ?? 0,
    anio,
    ccaa: cliente.ccaa,
    edad,
  });

  const sinIngresos = baseG <= 0;

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
        />
      </div>

      {sinIngresos ? (
        <div className="chartbox" style={{ marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink)" }}>
            Sin ingresos del año en el expediente — no hay base general que
            liquidar. Hueco marcado; no se muestra una cuota inventada.
          </p>
        </div>
      ) : !liq.ccaaSinCobertura ? (
        <div
          style={{
            border: "1px solid var(--line-2)",
            borderRadius: 10,
            background: "#fff",
            padding: "13px 15px",
            marginBottom: 14,
          }}
        >
          <div className="lbl">
            Cuota del ejercicio {anio} · {nombreCorto}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }} className="num">
            {formatEUR(liq.cuotaGeneral)}
          </div>
          <div className="tiny">
            Base general {formatEUR(Math.round(baseG))} · estatal{" "}
            {formatEUR(liq.estatalGeneral)} · autonómica CV{" "}
            {formatEUR(liq.autonomicaGeneral)} · orientativo
            {liq.parametrosAVerificar ? " · parámetros (a verificar)" : ""}
          </div>
          {baseA == null ? (
            <div className="tiny" style={{ marginTop: 4 }}>
              Base del ahorro: sin modelo en el expediente (hueco · no se suma
              una cuota 0 inventada).
            </div>
          ) : (
            <div className="tiny" style={{ marginTop: 4 }}>
              Base del ahorro {formatEUR(baseA)} → cuota{" "}
              {formatEUR(liq.cuotaAhorro)}
            </div>
          )}
        </div>
      ) : null}

      <TramosViewer
        anio={anio}
        personaNombre={nombreCorto}
        baseGeneral={baseG}
        baseAhorro={baseA}
      />
    </SheetPad>
  );
}
