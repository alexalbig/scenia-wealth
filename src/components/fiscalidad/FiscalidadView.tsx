"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { FiscalControls } from "@/components/fiscalidad/FiscalControls";
import { TramosViewer } from "@/components/fiscalidad/TramosViewer";
import { SerieIRPF } from "@/components/fiscalidad/SerieIRPF";
import { formatEUR } from "@/lib/format";
import {
  anioPorDefecto,
  aniosSerie,
  baseAhorroPersona,
  baseGeneralPersona,
  ccaaConCobertura,
  enEuros,
  kpisVida,
  personasFiscales,
  serieIRPF,
  type EurMode,
} from "@/lib/fiscal";
import type { Cliente } from "@/lib/types";

export function FiscalidadView({ cliente }: { cliente: Cliente }) {
  const personas = useMemo(
    () => personasFiscales(cliente.id),
    [cliente.id],
  );
  const anios = useMemo(() => aniosSerie(), []);

  const [personaId, setPersonaId] = useState(
    () => personas[0]?.id ?? "",
  );
  const [anio, setAnio] = useState(anioPorDefecto);
  const [eurMode, setEurMode] = useState<EurMode>("futuro");

  if (!cliente.completo) {
    return (
      <div className="space-y-4">
        <div>
          <p className="label-upper">P4 · Fiscalidad</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            Foto fiscal
          </h2>
        </div>
        <Card>
          <p className="label-upper mb-1">Cliente ligero</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            {cliente.nombre}
          </h2>
          <p className="mt-2 text-[13px] text-slate">
            Este expediente solo puebla la Cartera. La foto fiscal completa
            está en Familia García-Llorente.
          </p>
        </Card>
      </div>
    );
  }

  if (!ccaaConCobertura(cliente.ccaa)) {
    return (
      <div className="space-y-4">
        <div>
          <p className="label-upper">P4 · Fiscalidad</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            Foto fiscal
          </h2>
        </div>
        <Card>
          <p className="text-[13px] text-ink">
            El cálculo fiscal solo está disponible para la Comunitat
            Valenciana.
          </p>
          <p className="mt-2 text-[12px] text-mute">
            CCAA del expediente: {cliente.ccaa}
          </p>
        </Card>
      </div>
    );
  }

  const personaActiva =
    personas.find((p) => p.id === personaId) ?? personas[0];
  const pid = personaActiva?.id ?? "";
  const serie = serieIRPF(cliente.id, pid);
  const kpis = kpisVida(cliente.id, pid);
  const baseG = baseGeneralPersona(cliente.id, pid);
  const baseA = baseAhorroPersona(cliente.id, pid);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-upper">P4 · Fiscalidad</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            Foto fiscal · plan base
          </h2>
          <p className="mt-0.5 text-[11px] text-mute">
            Situación actual · Comunitat Valenciana · cifras{" "}
            <span className="normal-case tracking-normal">orientativas</span>
          </p>
        </div>
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

      {kpis && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card variant="dark">
            <p className="label-upper !text-faint mb-2">
              IRPF total proyectado
            </p>
            <p className="text-[28px] font-bold tracking-[-0.03em] tabular-nums text-dark-text">
              {formatEUR(
                enEuros(
                  kpis.irpfTotal,
                  Math.round((kpis.anioInicio + kpis.anioFin) / 2),
                  eurMode,
                ),
              )}
            </p>
            <p className="mt-1 text-[11px] text-faint">
              {kpis.anioInicio}–{kpis.anioFin} · orientativo
            </p>
          </Card>

          <Card padding="sm">
            <p className="label-upper mb-2">Tipo efectivo medio (ETR)</p>
            <p className="text-[28px] font-bold tracking-[-0.03em] tabular-nums text-ink">
              {formatETR(kpis.etr)}
            </p>
            <p className="mt-1 text-[11px] text-mute">
              IRPF / ingresos proyectados · orientativo
            </p>
          </Card>
        </div>
      )}

      <TramosViewer baseGeneral={baseG} baseAhorro={baseA} />

      <SerieIRPF
        serie={serie}
        anio={anio}
        onAnio={setAnio}
        eurMode={eurMode}
      />
    </div>
  );
}

function formatETR(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
