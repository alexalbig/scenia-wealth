"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, Modal } from "@/components/ui";
import { ProyeccionChart } from "@/components/proyeccion/ProyeccionChart";
import { formatEUR } from "@/lib/format";
import { cn } from "@/lib/cn";
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
      <div className="space-y-4">
        <div>
          <p className="label-upper">P5 · Proyección</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            Plan base
          </h2>
        </div>
        <Card>
          <p className="label-upper mb-1">Cliente ligero</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-upper">P5 · Proyección</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            Situación actual
          </h2>
          <p className="mt-0.5 text-[12px] text-mute">
            Plan base · series año a año · hogar de los eventos
          </p>
        </div>
        {toast && (
          <p className="rounded-[6px] bg-paper-2 px-2.5 py-1 text-[11px] text-ink-3">
            {toast}
          </p>
        )}
      </div>

      {/* Controles: serie + toggle € */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Serie"
          className="flex flex-wrap gap-0 border-b border-line-2"
        >
          {PROYECCION_SERIES.map((s) => {
            const active = serie === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSerie(s.id)}
                className={cn(
                  "relative shrink-0 px-3 py-2 text-[12px] font-semibold transition-colors",
                  active ? "text-blue" : "text-mute hover:text-ink-3",
                )}
              >
                {s.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 rounded-[8px] border border-line-2 bg-paper p-0.5">
          <ToggleBtn
            active={mode === "hoy"}
            onClick={() => setMode("hoy")}
            label="€ hoy"
          />
          <ToggleBtn
            active={mode === "futuro"}
            onClick={() => setMode("futuro")}
            label="€ futuro"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <Card>
          <ProyeccionChart
            points={points}
            serie={serie}
            mode={mode}
            inflation={inflation}
            selectedYear={selectedYear}
            milestoneYears={milestoneYears}
            onSelectYear={setSelectedYear}
          />
        </Card>

        <Card padding="sm" className="flex flex-col">
          <div className="mb-3 border-b border-line px-1 pb-2">
            <p className="label-upper">Eventos del año</p>
            <p className="text-[15px] font-bold tabular-nums text-ink">
              {selectedYear ?? "—"}
            </p>
            {selectedPoint && (
              <p className="mt-0.5 text-[11px] tabular-nums text-mute">
                {PROYECCION_SERIES.find((s) => s.id === serie)?.label}:{" "}
                <span className="font-semibold text-ink-3">
                  {formatEUR(
                    displayValue(selectedPoint, serie, mode, inflation),
                  )}
                </span>
                {isSerieOrientativa(serie) && " · orientativo"}
              </p>
            )}
          </div>

          {selectedYear == null ? (
            <p className="px-1 text-[12px] text-mute">
              Fija un año en el gráfico para ver sus eventos.
            </p>
          ) : yearEvents.length === 0 ? (
            <p className="px-1 text-[12px] text-mute">
              Sin eventos en {selectedYear}.
            </p>
          ) : (
            <ul className="space-y-2">
              {yearEvents.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-[8px] border border-line-2 bg-paper-2 px-2.5 py-2"
                >
                  <p className="text-[12px] font-semibold text-ink">
                    {ev.etiqueta}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <Badge variant="neutral">{tipoEventoLabel(ev.tipo)}</Badge>
                    {ev.introducidoPorAsesor && (
                      <Badge variant="neutral">
                        Introducido por el asesor
                      </Badge>
                    )}
                  </div>
                  {ev.notas && (
                    <p className="mt-1 text-[10.5px] text-mute">{ev.notas}</p>
                  )}
                  {/* Sin cifras fiscales inventadas en hitos del plan base */}
                  {ev.impuestosPeriodo != null && ev.impuestosPeriodo > 0 && (
                    <p className="mt-1 text-[11px] tabular-nums text-ink-3">
                      Impuestos del periodo {formatEUR(ev.impuestosPeriodo)}{" "}
                      <span className="text-mute">orientativo</span>
                    </p>
                  )}
                  <div className="mt-2 flex gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => openEdit(ev)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => deleteEvent(ev.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
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
              className="h-9 w-full rounded-[8px] border border-line-2 bg-paper px-3 text-[13px] text-ink outline-none focus:border-blue"
            />
          </label>
          <label className="block">
            <span className="label-upper mb-1 block">Año</span>
            <input
              type="number"
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              className="h-9 w-full rounded-[8px] border border-line-2 bg-paper px-3 text-[13px] tabular-nums text-ink outline-none focus:border-blue"
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

function ToggleBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[6px] px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
        active
          ? "bg-blue text-white"
          : "bg-transparent text-mute hover:text-ink-3",
      )}
    >
      {label}
    </button>
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
