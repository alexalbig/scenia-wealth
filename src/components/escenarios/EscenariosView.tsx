"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  FilaFiscal,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { ComparadorChart } from "@/components/escenarios/ComparadorChart";
import {
  PlantillaEvento,
  type EventoCreadoPayload,
} from "@/components/eventos/PlantillaEvento";
import { InformeModal } from "@/components/patrimonio/InformeModal";
import { formatEUR, formatPercent } from "@/lib/format";
import { formatFechaES } from "@/lib/patrimonio";
import { cn } from "@/lib/cn";
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
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-upper">P6 · Escenarios</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            Espacio de trabajo libre
          </h2>
          <p className="text-[12px] text-mute">
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

      {/* Lista de escenarios */}
      <Card padding="sm">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="label-upper">Escenarios del expediente</p>
          <span className="text-[11px] text-mute">
            Marca para comparar · el primero de la lista es el plan base
          </span>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Comparar</TH>
              <TH>Nombre</TH>
              <TH className="text-right">Eventos</TH>
              <TH className="text-right">Impuestos periodo</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {escenarios.map((e) => {
              const active = e.id === selected?.id;
              return (
                <TR
                  key={e.id}
                  className={cn("cursor-pointer", active && "bg-blue-soft/40")}
                  onClick={() => setSelectedId(e.id)}
                >
                  <TD onClick={(ev) => ev.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={compareIds.includes(e.id)}
                      onChange={() => toggleCompare(e.id)}
                      aria-label={`Comparar ${e.nombre}`}
                    />
                  </TD>
                  <TD>
                    <span className="font-semibold text-ink">{e.nombre}</span>
                    {e.esPlanBase && (
                      <Badge variant="blue" className="ml-2">
                        Plan base
                      </Badge>
                    )}
                  </TD>
                  <TD numeric>{e.eventos.length}</TD>
                  <TD numeric>
                    {e.impuestosPeriodo != null ? (
                      <span>
                        {formatEUR(e.impuestosPeriodo, true)}
                        <span className="ml-1 text-[10px] font-medium text-mute">
                          orientativo
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD onClick={(ev) => ev.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => clonar(e)}>
                      Clonar
                    </Button>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="label-upper mb-2">Supuestos · {selected.nombre}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="label-upper">Nombre</span>
                <input
                  className="mt-1 w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-[13px] outline-none focus:border-blue"
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
                  className="mt-1 w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-[13px] tabular-nums outline-none focus:border-blue"
                  value={selected.rentabilidadEsperada ?? 0.04}
                  onChange={(e) =>
                    updateSupuesto(selected.id, {
                      rentabilidadEsperada: Number(e.target.value),
                    })
                  }
                />
                <span className="mt-1 block text-[11px] text-mute">
                  {formatPercent(selected.rentabilidadEsperada ?? 0.04)}
                </span>
              </label>
              <label className="block">
                <span className="label-upper">Inflación</span>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-[13px] tabular-nums outline-none focus:border-blue"
                  value={selected.inflacion ?? 0.02}
                  onChange={(e) =>
                    updateSupuesto(selected.id, {
                      inflacion: Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
          </Card>

          <Card>
            <div className="mb-2 flex items-center justify-between">
              <p className="label-upper">Eventos · menú completo</p>
              <Button size="sm" onClick={() => setEventoOpen(true)}>
                + Evento
              </Button>
            </div>
            <ul className="max-h-48 space-y-1.5 overflow-y-auto">
              {selected.eventos.length === 0 && (
                <li className="text-[12px] text-mute">Sin eventos.</li>
              )}
              {selected.eventos.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-start justify-between gap-2 rounded-[8px] border border-line px-2.5 py-2"
                >
                  <div>
                    <p className="text-[12px] font-semibold text-ink">
                      {ev.anio} · {ev.etiqueta}
                    </p>
                    {ev.impuestosPeriodo != null && (
                      <p
                        className={cn(
                          "text-[11px] tabular-nums",
                          ev.introducidoPorAsesor
                            ? "text-mute italic"
                            : "font-semibold text-ink",
                        )}
                      >
                        {formatEUR(ev.impuestosPeriodo, true)}
                        {ev.introducidoPorAsesor
                          ? " · introducido por el asesor, no calculado"
                          : " · orientativo"}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteEvento(selected.id, ev.id)}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Comparador */}
      <Card padding="sm">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <p className="label-upper">Comparador</p>
            <p className="text-[12px] text-mute">
              Superpone escenarios · clic en un año · sin coronar ganador
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-[8px] border border-line-2">
              {COMPARADOR_METRICAS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetrica(m.id)}
                  className={cn(
                    "px-2.5 py-1.5 text-[11px] font-semibold",
                    metrica === m.id
                      ? "bg-blue text-white"
                      : "bg-paper text-mute hover:text-ink",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex overflow-hidden rounded-[8px] border border-line-2">
              <button
                type="button"
                onClick={() => setMode("hoy")}
                className={cn(
                  "px-2.5 py-1.5 text-[11px] font-semibold",
                  mode === "hoy" ? "bg-blue text-white" : "bg-paper text-mute",
                )}
              >
                € hoy
              </button>
              <button
                type="button"
                onClick={() => setMode("futuro")}
                className={cn(
                  "px-2.5 py-1.5 text-[11px] font-semibold",
                  mode === "futuro" ? "bg-blue text-white" : "bg-paper text-mute",
                )}
              >
                € futuro
              </button>
            </div>
          </div>
        </div>

        <ComparadorChart
          series={chartSeries}
          metrica={metrica}
          mode={mode}
          inflation={inflation}
          selectedYear={year}
          onSelectYear={setYear}
        />

        <p className="mt-2 px-1 text-[11px] text-mute">
          Año fijado <span className="font-semibold text-ink">{year}</span>
        </p>
      </Card>

      {/* CT2 Fila fiscal — pieza central del firewall */}
      {fiscalPair && (
        <FilaFiscal
          scenarioA={fiscalPair[0].nombre}
          amountA={fiscalPair[0].impuestosPeriodo ?? 0}
          scenarioB={fiscalPair[1].nombre}
          amountB={fiscalPair[1].impuestosPeriodo ?? 0}
        />
      )}

      {/* Eventos en paralelo */}
      {compareEscenarios.length >= 2 && (
        <Card padding="sm">
          <p className="label-upper mb-2 px-1">
            Eventos en paralelo · {year}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {compareEscenarios.map((e) => (
              <div key={e.id} className="rounded-[8px] border border-line-2 p-3">
                <p className="mb-2 text-[12px] font-bold text-ink">{e.nombre}</p>
                <ul className="space-y-1">
                  {e.eventos
                    .filter((ev) => ev.anio === year)
                    .map((ev) => (
                      <li key={ev.id} className="text-[12px] text-slate">
                        {ev.etiqueta}
                      </li>
                    ))}
                  {e.eventos.filter((ev) => ev.anio === year).length === 0 && (
                    <li className="text-[12px] text-mute">Sin eventos en {year}</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

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
