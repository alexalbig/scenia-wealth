"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  FilaFiscal,
} from "@/components/ui";
import { ComparadorChart } from "@/components/escenarios/ComparadorChart";
import {
  PlantillaEvento,
  type EventoCreadoPayload,
} from "@/components/eventos/PlantillaEvento";
import { InformeModal } from "@/components/patrimonio/InformeModal";
import { formatEUR, formatPercent } from "@/lib/format";
import { formatFechaES } from "@/lib/patrimonio";
import {
  COMPARADOR_METRICAS,
  buildEscenarioSeries,
  type ComparadorMetrica,
} from "@/lib/escenarios";
import {
  getEscenariosDeCliente,
  getEventosDeEscenario,
} from "@/lib/seed";
import { PROYECCION_BASE_YEAR, type EuroMode } from "@/lib/proyeccion";
import type { Cliente, Escenario, Evento } from "@/lib/types";

type LocalEscenario = Escenario & { eventos: Evento[] };

function cloneLocal(esc: Escenario, eventos: Evento[]): LocalEscenario {
  return {
    ...esc,
    eventos: eventos.map((e) => ({ ...e })),
  };
}

export function EscenariosView({ cliente }: { cliente: Cliente }) {
  const seedEscenarios = useMemo(() => {
    const list = getEscenariosDeCliente(cliente.id).slice().sort((a, b) => {
      if (a.esPlanBase) return -1;
      if (b.esPlanBase) return 1;
      return a.nombre.localeCompare(b.nombre, "es");
    });
    return list.map((e) =>
      cloneLocal(e, getEventosDeEscenario(e.id)),
    );
  }, [cliente.id]);

  const [escenarios, setEscenarios] = useState<LocalEscenario[]>(seedEscenarios);
  const [selectedId, setSelectedId] = useState(
    seedEscenarios[0]?.id ?? "",
  );
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    const nonBase = seedEscenarios.filter((e) => !e.esPlanBase);
    if (nonBase.length >= 2) return [nonBase[0]!.id, nonBase[1]!.id];
    if (seedEscenarios.length >= 2)
      return [seedEscenarios[0]!.id, seedEscenarios[1]!.id];
    return seedEscenarios[0] ? [seedEscenarios[0].id] : [];
  });
  const [metrica, setMetrica] = useState<ComparadorMetrica>("patrimonio");
  const [mode, setMode] = useState<EuroMode>("futuro");
  const [year, setYear] = useState(PROYECCION_BASE_YEAR);
  const [eventoOpen, setEventoOpen] = useState(false);
  const [informeOpen, setInformeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selected = escenarios.find((e) => e.id === selectedId) ?? escenarios[0];

  const compareEscenarios = compareIds
    .map((id) => escenarios.find((e) => e.id === id))
    .filter((e): e is LocalEscenario => !!e);

  const chartSeries = compareEscenarios.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    points: buildEscenarioSeries(cliente.id, e.id),
  }));

  const fiscalPair =
    compareEscenarios.length >= 2
      ? [compareEscenarios[0]!, compareEscenarios[1]!]
      : null;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  }

  function clonar(esc: LocalEscenario) {
    const id = `esc-clone-${Date.now()}`;
    const nuevo: LocalEscenario = {
      ...esc,
      id,
      nombre: `${esc.nombre} (copia)`,
      esPlanBase: false,
      impuestosPeriodo: esc.impuestosPeriodo,
      eventos: esc.eventos.map((ev) => ({
        ...ev,
        id: `${ev.id}-copy-${Date.now()}`,
        escenarioId: id,
      })),
    };
    setEscenarios((prev) => [...prev, nuevo]);
    setSelectedId(id);
    flash("Escenario clonado");
  }

  function updateSupuesto(
    id: string,
    patch: Partial<Pick<Escenario, "rentabilidadEsperada" | "inflacion" | "nombre">>,
  ) {
    setEscenarios((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  function onEventoCreado(payload: EventoCreadoPayload) {
    const targetId = payload.escenarioId || selectedId;
    const ev: Evento = {
      id: `evt-local-${Date.now()}`,
      escenarioId: targetId,
      tipo: payload.tipo,
      anio: payload.anio,
      etiqueta: payload.etiqueta,
      impuestosPeriodo: payload.impuestosPeriodo,
      introducidoPorAsesor: payload.introducidoPorAsesor,
      notas: payload.notas,
    };
    setEscenarios((prev) =>
      prev.map((e) =>
        e.id === targetId
          ? {
              ...e,
              eventos: [...e.eventos, ev],
              impuestosPeriodo:
                payload.impuestosPeriodo != null && !payload.introducidoPorAsesor
                  ? (e.impuestosPeriodo ?? 0) + (payload.impuestosPeriodo ?? 0)
                  : e.impuestosPeriodo,
            }
          : e,
      ),
    );
    setSelectedId(targetId);
    flash("Evento añadido");
  }

  function deleteEvento(escenarioId: string, eventoId: string) {
    setEscenarios((prev) =>
      prev.map((e) =>
        e.id === escenarioId
          ? { ...e, eventos: e.eventos.filter((ev) => ev.id !== eventoId) }
          : e,
      ),
    );
    flash("Evento eliminado");
  }

  if (!cliente.completo) {
    return (
      <Card>
        <p className="label-upper mb-1">Cliente ligero</p>
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">
          Escenarios
        </h2>
        <p className="mt-2 text-[13px] text-slate">
          El comparador completo está en Familia García-Llorente.
        </p>
      </Card>
    );
  }

  const inflation = selected?.inflacion ?? 0.02;
  const hasSociedad = cliente.sociedadIds.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-upper">P6 · Escenarios</p>
          <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">
            Espacio de trabajo libre
          </h2>
          <p className="mt-0.5 text-[11px] text-mute">
            El escenario es del cliente · plan base = primer escenario
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasSociedad && (
            <Badge variant="neutral">Régimen IRPF · IS pendiente</Badge>
          )}
          {!hasSociedad && <Badge variant="blue">Régimen IRPF</Badge>}
          <Button size="sm" variant="secondary" onClick={() => setInformeOpen(true)}>
            Generar informe
          </Button>
          {toast && (
            <span className="rounded-[6px] bg-paper-2 px-2 py-1 text-[11px] text-ink-3">
              {toast}
            </span>
          )}
        </div>
      </div>

      <div className="esc-grid">
        {/* Lista de escenarios */}
        <div>
          <p className="label-upper mb-2">Escenarios del expediente</p>
          {escenarios.map((e) => {
            const active = e.id === selected?.id;
            return (
              <div
                key={e.id}
                role="button"
                tabIndex={0}
                data-on={active}
                className="esc-item"
                onClick={() => setSelectedId(e.id)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    setSelectedId(e.id);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <b className="text-[12.5px] text-ink">{e.nombre}</b>
                  {e.esPlanBase && <span className="base-tag">Plan base</span>}
                </div>
                <p className="my-1 text-[10.5px] text-mute">
                  {e.eventos.length} evento{e.eventos.length !== 1 ? "s" : ""}
                  {" · "}
                  supuestos{" "}
                  {formatPercent(e.rentabilidadEsperada ?? 0.04)} /{" "}
                  {formatPercent(e.inflacion ?? 0.02)}
                </p>
                {e.impuestosPeriodo != null && (
                  <div className="calc-chip mb-2">
                    {formatEUR(e.impuestosPeriodo, true)} · orientativo
                  </div>
                )}
                <div
                  className="flex items-center gap-2.5"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-slate">
                    <input
                      type="checkbox"
                      className="h-[15px] w-[15px] accent-ink"
                      checked={compareIds.includes(e.id)}
                      onChange={() => toggleCompare(e.id)}
                      aria-label={`Comparar ${e.nombre}`}
                    />
                    Comparar
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => clonar(e)}
                  >
                    Clonar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detalle del seleccionado */}
        <div className="space-y-3">
          {selected && (
            <div className="sidep">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="label-upper">Escenario</p>
                  <h3 className="text-[17px] font-bold tracking-[-0.01em] text-ink">
                    {selected.nombre}
                  </h3>
                  {selected.esPlanBase && (
                    <p className="mt-0.5 text-[11px] text-mute">
                      La vida «tal como va» — comparable y editable como
                      cualquier otro.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                <label className="block">
                  <span className="label-upper">Nombre</span>
                  <input
                    className="mt-1 w-full rounded-[8px] border border-line-2 bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-ink"
                    value={selected.nombre}
                    onChange={(e) =>
                      updateSupuesto(selected.id, { nombre: e.target.value })
                    }
                  />
                </label>
                <label className="block">
                  <span className="label-upper">Rentabilidad esperada</span>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 w-full rounded-[8px] border border-line-2 bg-white px-2.5 py-1.5 text-[12px] tabular-nums outline-none focus:border-ink"
                    value={selected.rentabilidadEsperada ?? 0.04}
                    onChange={(e) =>
                      updateSupuesto(selected.id, {
                        rentabilidadEsperada: Number(e.target.value),
                      })
                    }
                  />
                  <span className="mt-0.5 block text-[10.5px] text-mute">
                    {formatPercent(selected.rentabilidadEsperada ?? 0.04)}
                  </span>
                </label>
                <label className="block">
                  <span className="label-upper">Inflación</span>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 w-full rounded-[8px] border border-line-2 bg-white px-2.5 py-1.5 text-[12px] tabular-nums outline-none focus:border-ink"
                    value={selected.inflacion ?? 0.02}
                    onChange={(e) =>
                      updateSupuesto(selected.id, {
                        inflacion: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-2">
                <p className="label-upper">Eventos · menú completo</p>
                <Button size="sm" onClick={() => setEventoOpen(true)}>
                  + Evento
                </Button>
              </div>
              <ul className="mt-1 max-h-52 overflow-y-auto">
                {selected.eventos.length === 0 && (
                  <li className="py-3 text-[12px] text-mute">Sin eventos.</li>
                )}
                {selected.eventos.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-start justify-between gap-2 border-t border-line py-2 first:border-t-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-ink">
                        {ev.anio} · {ev.etiqueta}
                      </p>
                      {ev.impuestosPeriodo != null &&
                        (ev.introducidoPorAsesor ? (
                          <div className="intro-chip mt-1">
                            {formatEUR(ev.impuestosPeriodo, true)} ·
                            introducido por el asesor, no calculado
                          </div>
                        ) : (
                          <div className="calc-chip mt-1">
                            {formatEUR(ev.impuestosPeriodo, true)} ·
                            orientativo
                          </div>
                        ))}
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10.5px] text-mute hover:bg-paper-2 hover:text-ink"
                      onClick={() => deleteEvento(selected.id, ev.id)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comparador */}
          <div className="sidep">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="label-upper">Comparador</p>
                <p className="text-[12px] text-mute">
                  Superpone escenarios · clic en un año · sin coronar ganador
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="chips" role="group" aria-label="Métrica">
                  {COMPARADOR_METRICAS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      data-on={metrica === m.id}
                      onClick={() => setMetrica(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="seg" role="group" aria-label="Unidad monetaria">
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
              </div>
            </div>

            <div className="chartbox">
              <ComparadorChart
                series={chartSeries}
                metrica={metrica}
                mode={mode}
                inflation={inflation}
                selectedYear={year}
                onSelectYear={setYear}
              />
              <p className="mt-2 text-[11px] text-mute">
                Año fijado{" "}
                <span className="font-semibold text-ink">{year}</span>
              </p>
            </div>

            {fiscalPair && (
              <div className="mt-3">
                <FilaFiscal
                  scenarioA={fiscalPair[0].nombre}
                  amountA={fiscalPair[0].impuestosPeriodo ?? 0}
                  scenarioB={fiscalPair[1].nombre}
                  amountB={fiscalPair[1].impuestosPeriodo ?? 0}
                />
              </div>
            )}

            {compareEscenarios.length >= 2 && (
              <div className="mt-4">
                <p className="label-upper mb-2">
                  Eventos en paralelo · {year}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {compareEscenarios.map((e) => (
                    <div key={e.id}>
                      <p className="mb-1 text-[11.5px] font-bold text-ink">
                        {e.nombre}
                      </p>
                      <ul>
                        {e.eventos
                          .filter((ev) => ev.anio === year)
                          .map((ev) => (
                            <li
                              key={ev.id}
                              className="flex items-start gap-2 border-t border-line py-1.5 first:border-t-0"
                            >
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-[2px] bg-blue" />
                              <div>
                                <p className="text-[11.5px] font-semibold text-ink">
                                  {ev.etiqueta}
                                </p>
                                <p className="text-[10.5px] text-mute">
                                  {ev.anio}
                                </p>
                              </div>
                            </li>
                          ))}
                        {e.eventos.filter((ev) => ev.anio === year).length ===
                          0 && (
                          <li className="text-[12px] text-mute">
                            Sin eventos en {year}
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PlantillaEvento
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="completo"
        elementoNombre={selected?.nombre ?? "Cliente"}
        escenarios={escenarios.map((e) => ({ id: e.id, nombre: e.nombre }))}
        escenarioInicialId={selected?.id}
        onCreated={onEventoCreado}
      />

      <InformeModal
        open={informeOpen}
        onClose={() => setInformeOpen(false)}
        titulo="Informe de comparación de escenarios"
        datosAFecha={formatFechaES(cliente.datosAFecha)}
      />
    </div>
  );
}
