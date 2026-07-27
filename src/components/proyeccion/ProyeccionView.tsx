"use client";

import { useMemo, useState } from "react";
import { Button, Card, Modal } from "@/components/ui";
import { ProyeccionChart } from "@/components/proyeccion/ProyeccionChart";
import { formatEUR } from "@/lib/format";
import {
  getEventosDeEscenario,
  getPlanBase,
} from "@/lib/seed";
import {
  PROYECCION_BASE_YEAR,
  PROYECCION_SERIES,
  buildProyeccionSeries,
  displayValue,
  isSerieOrientativa,
  type EuroMode,
  type ProyeccionSerieId,
} from "@/lib/proyeccion";
import type { Cliente, Evento } from "@/lib/types";

export function ProyeccionView({ cliente }: { cliente: Cliente }) {
  const planBase = useMemo(() => getPlanBase(cliente.id), [cliente.id]);
  const seedEvents = useMemo(
    () => (planBase ? getEventosDeEscenario(planBase.id) : []),
    [planBase],
  );

  const [events, setEvents] = useState<Evento[]>(() =>
    seedEvents.map((e) => ({ ...e })),
  );
  const [serie, setSerie] = useState<ProyeccionSerieId>("patrimonio");
  const [mode, setMode] = useState<EuroMode>("futuro");
  const [selectedYear, setSelectedYear] = useState<number | null>(
    PROYECCION_BASE_YEAR,
  );
  const [editing, setEditing] = useState<Evento | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editYear, setEditYear] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const points = useMemo(
    () => buildProyeccionSeries(cliente.id),
    [cliente.id],
  );
  const inflation = planBase?.inflacion ?? 0.02;

  const milestoneYears = useMemo(
    () => [...new Set(events.map((e) => e.anio))].sort((a, b) => a - b),
    [events],
  );

  const yearEvents = useMemo(
    () =>
      selectedYear == null
        ? []
        : events
            .filter((e) => e.anio === selectedYear)
            .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es")),
    [events, selectedYear],
  );

  const selectedPoint =
    selectedYear != null
      ? points.find((p) => p.year === selectedYear)
      : undefined;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function openEdit(ev: Evento) {
    setEditing(ev);
    setEditLabel(ev.etiqueta);
    setEditYear(String(ev.anio));
  }

  function saveEdit() {
    if (!editing) return;
    const year = Number(editYear);
    if (!editLabel.trim() || !Number.isFinite(year)) return;
    setEvents((prev) =>
      prev.map((e) =>
        e.id === editing.id
          ? { ...e, etiqueta: editLabel.trim(), anio: year }
          : e,
      ),
    );
    setSelectedYear(year);
    setEditing(null);
    flash("Evento actualizado");
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    flash("Evento eliminado");
  }

  if (!cliente.completo) {
    return (
      <div className="space-y-3">
        <div>
          <p className="label-upper">P5 · Proyección</p>
          <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">
            Plan base
          </h2>
        </div>
        <Card>
          <p className="label-upper mb-1">Cliente ligero</p>
          <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">
            {cliente.nombre}
          </h2>
          <p className="mt-2 text-[13px] text-slate">
            Este expediente solo puebla la Cartera. Patrimonio neto{" "}
            <span className="font-semibold tabular-nums text-ink">
              {formatEUR(cliente.patrimonioNeto)}
            </span>
            . La proyección completa está en Familia García-Llorente.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-upper">P5 · Proyección</p>
          <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">
            Situación actual
          </h2>
          <p className="mt-0.5 text-[11px] text-mute">
            Plan base · series año a año · hogar de los eventos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Serie" className="chips">
            {PROYECCION_SERIES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={serie === s.id}
                data-on={serie === s.id}
                onClick={() => setSerie(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Unidad monetaria" className="seg">
            <button
              type="button"
              data-on={mode === "hoy"}
              aria-pressed={mode === "hoy"}
              onClick={() => setMode("hoy")}
            >
              € hoy
            </button>
            <button
              type="button"
              data-on={mode === "futuro"}
              aria-pressed={mode === "futuro"}
              onClick={() => setMode("futuro")}
            >
              € futuro
            </button>
          </div>
          {toast && (
            <p className="rounded-[6px] bg-paper-2 px-2.5 py-1 text-[11px] text-ink-3">
              {toast}
            </p>
          )}
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
            onSelectYear={setSelectedYear}
          />
        </div>

        <div className="sidep flex flex-col">
          <p className="label-upper">Eventos del año</p>
          <p className="text-[17px] font-bold tracking-[-0.01em] tabular-nums text-ink">
            {selectedYear ?? "—"}
          </p>
          {selectedPoint && (
            <p className="mt-1 flex justify-between text-[11px] text-slate">
              <span>
                {PROYECCION_SERIES.find((s) => s.id === serie)?.label}
              </span>
              <b className="tabular-nums text-ink">
                {formatEUR(
                  displayValue(selectedPoint, serie, mode, inflation),
                )}
                {isSerieOrientativa(serie) && (
                  <span className="ml-1 font-medium text-mute">
                    · orientativo
                  </span>
                )}
              </b>
            </p>
          )}

          <div className="mt-3.5">
            {selectedYear == null ? (
              <p className="text-[12px] text-mute">
                Fija un año en el gráfico para ver sus eventos.
              </p>
            ) : yearEvents.length === 0 ? (
              <p className="py-3.5 text-[12px] text-mute">
                Sin eventos en {selectedYear}.
              </p>
            ) : (
              <ul>
                {yearEvents.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-start gap-2 border-t border-line py-2 first:border-t-0"
                  >
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-[2px] ${
                        ev.introducidoPorAsesor
                          ? "bg-faintest"
                          : "bg-blue"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-ink">
                        {ev.etiqueta}
                      </p>
                      <p className="text-[10.5px] text-mute">
                        {tipoEventoLabel(ev.tipo)}
                      </p>
                      {ev.impuestosPeriodo != null &&
                        ev.impuestosPeriodo > 0 &&
                        !ev.introducidoPorAsesor && (
                          <div className="calc-chip mt-1">
                            {formatEUR(ev.impuestosPeriodo)} · orientativo
                          </div>
                        )}
                      {ev.introducidoPorAsesor && (
                        <div className="intro-chip mt-1">
                          Introducido por el asesor · no calculado
                        </div>
                      )}
                      {ev.notas && (
                        <p className="mt-1 text-[10.5px] text-mute">
                          {ev.notas}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <button
                        type="button"
                        className="rounded px-1.5 py-0.5 text-[10.5px] text-mute hover:bg-paper-2 hover:text-ink"
                        onClick={() => openEdit(ev)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="rounded px-1.5 py-0.5 text-[10.5px] text-mute hover:bg-paper-2 hover:text-ink"
                        onClick={() => deleteEvent(ev.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar evento"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className="label-upper mb-1 block">Etiqueta</span>
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="h-9 w-full rounded-[8px] border border-line-2 bg-paper px-3 text-[13px] text-ink outline-none focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="label-upper mb-1 block">Año</span>
            <input
              type="number"
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              className="h-9 w-full rounded-[8px] border border-line-2 bg-paper px-3 text-[13px] tabular-nums text-ink outline-none focus:border-ink"
            />
          </label>
          <p className="text-[11px] text-mute">
            Mockup local · los cambios no se persisten.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function tipoEventoLabel(tipo: Evento["tipo"]): string {
  switch (tipo) {
    case "jubilarse":
      return "Jubilarse";
    case "generico":
      return "Genérico";
    case "reembolsar_fondo":
      return "Reembolso";
    case "traspasar_fondo":
      return "Traspaso";
    case "rescatar_plan":
      return "Rescate";
    case "amortizar_hipoteca":
      return "Amortizar";
    case "vender_inmueble":
      return "Vender inmueble";
    case "comprar_inmueble":
      return "Comprar inmueble";
    default:
      return "Evento";
  }
}
