"use client";

import { useMemo, useState } from "react";
import { Button, SheetPad, Toast } from "@/components/ui";
import { ProyeccionChart } from "@/components/proyeccion/ProyeccionChart";
import { PlantillaEvento } from "@/components/eventos/PlantillaEvento";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { cn } from "@/lib/cn";
import { formatEUR } from "@/lib/format";
import { personaLabel } from "@/lib/patrimonio";
import {
  PROYECCION_SERIES,
  buildProyeccionSeriesFromBag,
  displayValue,
  serieLabel,
  type EuroMode,
  type ProyeccionSerieId,
} from "@/lib/proyeccion";
import type { Cliente, Evento } from "@/lib/types";

/**
 * P5 · Proyección — marcado literal del mockup `renderProyeccion`.
 * Fuente de verdad: bag del expediente (ExpedienteProvider).
 */
export function ProyeccionView({ cliente }: { cliente: Cliente }) {
  const { bag, planBase, menuElementos, eventosDeEscenario, addEvento, removeEvento } =
    useExpediente();

  const events = useMemo(
    () => (planBase ? eventosDeEscenario(planBase.id) : []),
    [planBase, eventosDeEscenario],
  );

  const [serie, setSerie] = useState<ProyeccionSerieId>("patrimonio");
  const [mode, setMode] = useState<EuroMode>("hoy");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [eventoOpen, setEventoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const points = useMemo(
    () =>
      buildProyeccionSeriesFromBag(bag, events, {
        rentabilidad: planBase?.rentabilidadEsperada ?? 0.04,
      }),
    [bag, events, planBase?.rentabilidadEsperada],
  );
  const inflation = planBase?.inflacion ?? 0.02;

  const milestoneYears = useMemo(
    () => [...new Set(events.map((e) => e.anio))].sort((a, b) => a - b),
    [events],
  );

  const yearEvents = useMemo(() => {
    if (selectedYear == null) return [];
    return events
      .filter((e) => e.anio === selectedYear)
      .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es"));
  }, [events, selectedYear]);

  const selectedPoint =
    selectedYear != null
      ? points.find((p) => p.year === selectedYear)
      : undefined;

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  function toggleYear(year: number) {
    setSelectedYear((prev) => (prev === year ? null : year));
  }

  function elementLabel(ev: Evento): string {
    if (!ev.targetId) return "";
    const persona = bag.personas.find((p) => p.id === ev.targetId);
    if (persona) return personaLabel(persona);
    return "";
  }

  function deleteEvent(id: string) {
    removeEvento(id);
    flash("Evento eliminado");
  }

  if (!planBase) {
    return (
      <SheetPad>
        <div className="lbl">Proyección · plan base</div>
        <div className="h2">Las series año a año</div>
        <div className="empty" style={{ marginTop: 14 }}>
          Sin plan base. Crea el primer escenario desde Escenarios para verlo
          aquí.
        </div>
      </SheetPad>
    );
  }

  return (
    <SheetPad>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div>
          <div className="lbl">Proyección · plan base</div>
          <div className="h2">Las series año a año</div>
        </div>
        <div className="toolbar">
          <div className="chips" role="tablist" aria-label="Serie">
            {PROYECCION_SERIES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={serie === s.id}
                className={cn(serie === s.id && "on")}
                onClick={() => setSerie(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="seg" role="group" aria-label="Unidad monetaria">
            <button
              type="button"
              className={cn(mode === "hoy" && "on")}
              aria-pressed={mode === "hoy"}
              onClick={() => setMode("hoy")}
            >
              € hoy
            </button>
            <button
              type="button"
              className={cn(mode === "futuro" && "on")}
              aria-pressed={mode === "futuro"}
              onClick={() => setMode("futuro")}
            >
              € futuro
            </button>
          </div>
        </div>
      </div>

      <div className="split">
        <div className="chartbox">
          <ProyeccionChart
            points={points}
            serie={serie}
            mode={mode}
            inflation={inflation}
            selectedYear={selectedYear}
            milestoneYears={milestoneYears}
            onSelectYear={toggleYear}
          />
          <div className="tiny" style={{ marginTop: 4 }}>
            Pincha en la línea para fijar un año · ● hitos del plan base ·{" "}
            {mode === "hoy"
              ? "valores deflactados al 2 % anual (€ de hoy)"
              : "valores nominales (€ futuros)"}
            .
          </div>
        </div>

        <div className="sidep">
          {selectedYear != null ? (
            <>
              <div className="lbl">Año fijado</div>
              <div className="h2 num">{selectedYear}</div>
              {selectedPoint && (
                <div
                  className="sub"
                  style={{
                    margin: "8px 0 4px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{serieLabel(serie)}</span>
                  <b className="num">
                    {formatEUR(
                      displayValue(
                        selectedPoint,
                        serie,
                        mode,
                        inflation,
                      ),
                    )}
                  </b>
                </div>
              )}
              <div
                className="lbl"
                style={{ marginTop: 14, marginBottom: 4 }}
              >
                Eventos de {selectedYear}
              </div>
              {yearEvents.length === 0 ? (
                <div className="empty" style={{ padding: "14px 4px" }}>
                  Sin eventos en {selectedYear}.
                </div>
              ) : (
                yearEvents.map((ev) => (
                  <EventoRow
                    key={ev.id}
                    ev={ev}
                    elementLabel={elementLabel(ev)}
                    onDelete={() => deleteEvent(ev.id)}
                  />
                ))
              )}
              <Button
                size="sm"
                style={{ marginTop: 8 }}
                onClick={() => setEventoOpen(true)}
              >
                + Añadir evento en {selectedYear}
              </Button>
            </>
          ) : (
            <>
              <div className="lbl">Eventos del plan base</div>
              <div style={{ marginTop: 6 }}>
                {events.length === 0 ? (
                  <div className="empty">Sin eventos anotados.</div>
                ) : (
                  events
                    .slice()
                    .sort((a, b) => a.anio - b.anio)
                    .map((ev) => (
                      <EventoRow
                        key={ev.id}
                        ev={ev}
                        elementLabel={elementLabel(ev)}
                        onDelete={() => deleteEvent(ev.id)}
                      />
                    ))
                )}
              </div>
              <Button
                size="sm"
                style={{ marginTop: 8 }}
                onClick={() => setEventoOpen(true)}
              >
                + Añadir evento
              </Button>
              <div className="tiny" style={{ marginTop: 10 }}>
                Todo lo que anotas desde las fichas se refleja aquí.
              </div>
            </>
          )}
        </div>
      </div>

      <PlantillaEvento
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="completo"
        clienteId={cliente.id}
        elementoNombre="Plan base"
        destinoNombre="Plan base (Situación actual)"
        anioInicial={selectedYear ?? undefined}
        escenarioInicialId={planBase.id}
        elementosOverride={menuElementos}
        onCreated={(payload) => {
          addEvento(payload, { escenarioId: planBase.id });
          if (selectedYear == null) setSelectedYear(payload.anio);
          flash("Evento añadido al plan base — se refleja en Proyección");
        }}
      />
      <Toast message={toast} />
    </SheetPad>
  );
}

function EventoRow({
  ev,
  elementLabel,
  onDelete,
}: {
  ev: Evento;
  elementLabel: string;
  onDelete: () => void;
}) {
  return (
    <div className="evt">
      <span
        className={cn("evt-dot", ev.introducidoPorAsesor && "intro")}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{ev.etiqueta}</div>
        <div className="tiny">
          {ev.anio}
          {elementLabel ? ` · ${elementLabel}` : ""}
        </div>
        {(ev.cuotaAnual != null || ev.impuestosPeriodo != null) &&
          !ev.introducidoPorAsesor && (
            <div className="calc-chip" style={{ marginTop: 4 }}>
              {formatEUR(ev.cuotaAnual ?? ev.impuestosPeriodo!)} · primer
              ejercicio · orientativo
            </div>
          )}
        {ev.sobreDatoIntroducido && !ev.introducidoPorAsesor && (
          <div className="intro-chip" style={{ marginTop: 4 }}>
            ✎ Calculado sobre una {ev.sobreDatoIntroducido}
          </div>
        )}
        {ev.introducidoPorAsesor && (
          <div className="intro-chip" style={{ marginTop: 4 }}>
            ✎ Introducido por el asesor · no calculado
          </div>
        )}
        {ev.notas &&
          !ev.introducidoPorAsesor &&
          ev.cuotaAnual == null &&
          ev.impuestosPeriodo == null && (
            <div className="tiny" style={{ marginTop: 2 }}>
              {ev.notas}
            </div>
          )}
      </div>
      <div className="evt-actions">
        <button type="button" onClick={onDelete}>
          Eliminar
        </button>
      </div>
    </div>
  );
}
