"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, SheetPad, Toast } from "@/components/ui";
import { ComparadorChart } from "@/components/escenarios/ComparadorChart";
import { LecturaEnHechos } from "@/components/escenarios/LecturaEnHechos";
import { NombrarEscenarioModal } from "@/components/escenarios/NombrarEscenarioModal";
import { TablaHechos } from "@/components/escenarios/TablaHechos";
import { PlantillaEvento } from "@/components/eventos/PlantillaEvento";
import { InformeModal } from "@/components/patrimonio/InformeModal";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import type { EventoCreadoPayload } from "@/lib/eventos-types";
import { cn } from "@/lib/cn";
import { formatEUR } from "@/lib/format";
import { formatFechaDMY } from "@/lib/patrimonio";
import {
  anioFijadoPorDefecto,
  aniosComparador,
  COMPARADOR_HORIZONTE,
  hitosDeCamino,
  lecturaEnHechos,
  nombrePropuestoCopia,
  serieComparador,
  sostenibilidadDeCamino,
  type CaminoLectura,
  type ComparadorMetrica,
} from "@/lib/escenarios";
import {
  buildProyeccionSeriesFromBag,
  toEuroHoy,
  type EuroMode,
} from "@/lib/proyeccion";
import type { Cliente, Escenario } from "@/lib/types";

type Modo = "detalle" | "comparador";

const MAX_COMPARE = 3;

function pctLabel(decimal: number): string {
  const pct = decimal * 100;
  return Number.isInteger(pct) ? String(pct) : pct.toFixed(1).replace(".", ",");
}

/**
 * P6 · Escenarios + comparador — marcado literal de comparador-B-escenarios.html.
 * Fuente de verdad: bag del expediente (ExpedienteProvider).
 */
export function EscenariosView({ cliente }: { cliente: Cliente }) {
  const {
    bag,
    planBase,
    menuElementos,
    eventosDeEscenario,
    addEvento,
    removeEvento,
    cloneEscenario,
    patchEscenario,
    removeEscenario,
    addHistorial,
  } = useExpediente();

  const escenarios = useMemo(() => {
    return [...bag.escenarios].sort((a, b) => {
      if (a.esPlanBase) return -1;
      if (b.esPlanBase) return 1;
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [bag.escenarios]);

  const years = useMemo(() => aniosComparador(), []);

  const [selectedId, setSelectedId] = useState(
    () =>
      escenarios.find((e) => !e.esPlanBase)?.id ?? escenarios[0]?.id ?? "",
  );
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    const base = planBase?.id;
    const alts = escenarios.filter((e) => !e.esPlanBase).slice(0, 2);
    return [
      ...(base ? [base] : []),
      ...alts.map((e) => e.id),
    ].slice(0, MAX_COMPARE);
  });
  const [modo, setModo] = useState<Modo>("comparador");
  const [metrica, setMetrica] = useState<ComparadorMetrica>("liquidos");
  const [mode, setMode] = useState<EuroMode>("futuro");
  const [cmpYear, setCmpYear] = useState<number | null>(null);
  const [eventoOpen, setEventoOpen] = useState(false);
  const [informeOpen, setInformeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [notaAsesor, setNotaAsesor] = useState("");
  const [nombrarOpen, setNombrarOpen] = useState(false);
  const [clonarFromId, setClonarFromId] = useState<string | null>(null);

  const selected =
    escenarios.find((e) => e.id === selectedId) ?? escenarios[0];

  // Plan base siempre en la comparación
  useEffect(() => {
    if (!planBase) return;
    setCompareIds((prev) =>
      prev.includes(planBase.id) ? prev : [planBase.id, ...prev].slice(0, MAX_COMPARE),
    );
  }, [planBase]);

  const compareEscenarios = useMemo(() => {
    const ordered: Escenario[] = [];
    if (planBase && compareIds.includes(planBase.id)) ordered.push(planBase);
    for (const id of compareIds) {
      if (planBase && id === planBase.id) continue;
      const e = escenarios.find((x) => x.id === id);
      if (e) ordered.push(e);
    }
    return ordered;
  }, [compareIds, escenarios, planBase]);

  const seriesByEsc = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof buildProyeccionSeriesFromBag>
    >();
    for (const e of compareEscenarios) {
      map.set(
        e.id,
        buildProyeccionSeriesFromBag(bag, eventosDeEscenario(e.id), {
          rentabilidad: e.rentabilidadEsperada ?? 0.04,
        }),
      );
    }
    return map;
  }, [bag, compareEscenarios, eventosDeEscenario]);

  const anioFijado = useMemo(() => {
    if (cmpYear != null) return cmpYear;
    return anioFijadoPorDefecto(
      compareEscenarios.map((e) => eventosDeEscenario(e.id)),
    );
  }, [cmpYear, compareEscenarios, eventosDeEscenario]);

  const filasHechos = useMemo(() => {
    return compareEscenarios.map((e) => {
      const points = seriesByEsc.get(e.id) ?? [];
      const pLiq = points.find((p) => p.year === anioFijado);
      const pFin = points.find((p) => p.year === COMPARADOR_HORIZONTE);
      let liquidos = pLiq?.liquidos ?? 0;
      if (mode === "hoy") {
        liquidos = toEuroHoy(liquidos, anioFijado, e.inflacion ?? 0.02);
      }
      return {
        id: e.id,
        nombre: e.nombre,
        esPlanBase: e.esPlanBase,
        eventos: eventosDeEscenario(e.id),
        impactoFiscal: e.esPlanBase ? null : (e.impuestosPeriodo ?? 0),
        liquidosEnAnio: Math.round(liquidos),
        patrimonioFinal: Math.round(pFin?.patrimonio ?? 0),
        sostenibilidad: sostenibilidadDeCamino(points),
        impuestosParcial: e.impuestosParcial,
        impuestosMotivosParcial: e.impuestosMotivosParcial,
        impuestosSobreDatoIntroducido: e.impuestosSobreDatoIntroducido,
      };
    });
  }, [
    compareEscenarios,
    seriesByEsc,
    anioFijado,
    mode,
    eventosDeEscenario,
  ]);

  const chartSeries = compareEscenarios.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    years,
    esPlanBase: e.esPlanBase,
    values: serieComparador(bag, eventosDeEscenario(e.id), metrica, {
      rentabilidad: e.rentabilidadEsperada ?? 0.04,
    }),
  }));

  const hitos = useMemo(() => {
    const all = compareEscenarios.flatMap((e) =>
      hitosDeCamino(
        eventosDeEscenario(e.id),
        seriesByEsc.get(e.id) ?? [],
      ),
    );
    const seen = new Set<string>();
    return all.filter((h) => {
      const id = `${h.year}|${h.label}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [compareEscenarios, eventosDeEscenario, seriesByEsc]);

  const caminosLectura: CaminoLectura[] = filasHechos.map((f) => ({
    id: f.id,
    nombre: f.nombre,
    esPlanBase: f.esPlanBase,
    impuestosPeriodo: f.impactoFiscal ?? 0,
    liquidosEnAnio: f.liquidosEnAnio,
    patrimonioFinal: f.patrimonioFinal,
    anioFijado,
    eventos: f.eventos,
    sostenibilidad: f.sostenibilidad,
  }));

  const conCifra = compareEscenarios.filter((e) => !e.esPlanBase);
  const delta =
    conCifra.length >= 2
      ? Math.abs(
          (conCifra[0]!.impuestosPeriodo ?? 0) -
            (conCifra[1]!.impuestosPeriodo ?? 0),
        )
      : null;
  const fiscalParcial = compareEscenarios.some((e) => e.impuestosParcial);
  const fiscalMotivosParcial = compareEscenarios.flatMap(
    (e) => e.impuestosMotivosParcial ?? [],
  );
  const fiscalSobreDato = compareEscenarios.some(
    (e) => e.impuestosSobreDatoIntroducido,
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  function toggleCompare(id: string) {
    if (planBase && id === planBase.id) return; // siempre marcado
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  function abrirClonar(fromId: string) {
    setClonarFromId(fromId);
    setNombrarOpen(true);
  }

  function confirmarClon(nombre: string) {
    if (!clonarFromId) return;
    const nuevo = cloneEscenario(clonarFromId, nombre);
    if (!nuevo) return;
    setSelectedId(nuevo.id);
    setModo("detalle");
    flash("Escenario clonado · añade eventos de cualquier activo");
    setClonarFromId(null);
  }

  function updateSupuesto(
    id: string,
    patch: Partial<Pick<Escenario, "rentabilidadEsperada" | "inflacion">>,
  ) {
    patchEscenario(id, patch);
    flash("Supuesto actualizado (recomputación simulada)");
  }

  function onEventoCreado(payload: EventoCreadoPayload) {
    const targetId = payload.escenarioId || selectedId;
    addEvento(payload, {
      escenarioId: targetId,
      targetId: payload.targetId,
    });
    setSelectedId(targetId);
    setModo("detalle");
    flash("Evento añadido");
  }

  function deleteEvento(eventoId: string) {
    removeEvento(eventoId);
    flash("Evento eliminado");
  }

  function toggleCmpYear(y: number) {
    setCmpYear((prev) => (prev === y ? null : y));
  }

  if (!cliente.completo) {
    return (
      <SheetPad>
        <div className="lbl">Escenarios</div>
        <div className="h2">Espacio de trabajo · sin pasos guiados</div>
        <div className="chartbox" style={{ marginTop: 14 }}>
          <p className="tiny" style={{ margin: 0 }}>
            El comparador completo está en Familia García-Llorente.
          </p>
        </div>
      </SheetPad>
    );
  }

  if (escenarios.length === 0 || !selected) {
    return (
      <SheetPad>
        <div className="lbl">Escenarios</div>
        <div className="h2">Espacio de trabajo · sin pasos guiados</div>
        <div className="empty" style={{ marginTop: 14 }}>
          Sin escenarios todavía. El plan base se crea automáticamente al
          abrir el expediente.
        </div>
      </SheetPad>
    );
  }

  const inflation = selected.inflacion ?? 0.02;
  const baseForClone = planBase?.id ?? escenarios[0]!.id;
  const regimenLabel =
    bag.sociedades.length > 0
      ? "Régimen: IRPF · IS pendiente de definir"
      : null;
  const altsMarcadas = compareIds.filter((id) => id !== planBase?.id).length;
  const limiteAlcanzado = compareIds.length >= MAX_COMPARE;
  const origenClon = clonarFromId
    ? escenarios.find((e) => e.id === clonarFromId)
    : null;

  return (
    <SheetPad>
      <div className="cmp">
        <div className="headrow">
          <div className="h2">Escenarios</div>
          <div className="sub">
            Marque hasta tres escenarios para enfrentarlos al plan base. Los
            hechos primero; la curva, como apoyo. La conclusión la firma usted.
            {regimenLabel ? ` · ${regimenLabel}` : ""}
          </div>
        </div>

        <div className="layout">
          <div className="aside">
            <div className="top">
              <span className="lbl">Escenarios</span>
              <button
                type="button"
                className="btn2"
                onClick={() => abrirClonar(baseForClone)}
              >
                + Nuevo
              </button>
            </div>

            {escenarios.map((e) => {
              const eventosEsc = eventosDeEscenario(e.id);
              const on =
                e.id === selected.id && modo === "detalle"
                  ? true
                  : compareIds.includes(e.id) && modo === "comparador";
              const propios = eventosEsc.filter((ev) => ev.tipo !== "jubilarse");
              return (
                <div
                  key={e.id}
                  className={cn(
                    "esc",
                    e.esPlanBase && "base",
                    on && "on",
                  )}
                  onClick={() => {
                    setSelectedId(e.id);
                    setModo("detalle");
                  }}
                >
                  <input
                    type="checkbox"
                    checked={compareIds.includes(e.id)}
                    disabled={e.esPlanBase}
                    title={
                      e.esPlanBase
                        ? "El plan base siempre está en la comparación"
                        : limiteAlcanzado && !compareIds.includes(e.id)
                          ? "Límite de tres escenarios"
                          : undefined
                    }
                    onClick={(ev) => ev.stopPropagation()}
                    onChange={() => toggleCompare(e.id)}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renamingId === e.id ? (
                      <input
                        autoFocus
                        value={renameDraft}
                        onClick={(ev) => ev.stopPropagation()}
                        onChange={(ev) => setRenameDraft(ev.target.value)}
                        onBlur={(ev) => {
                          const n = (ev.target as HTMLInputElement).value.trim();
                          if (n && n !== e.nombre) {
                            patchEscenario(e.id, { nombre: n });
                            flash("Escenario renombrado");
                          }
                          setRenamingId(null);
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") {
                            (ev.target as HTMLInputElement).blur();
                          }
                          if (ev.key === "Escape") setRenamingId(null);
                        }}
                        style={{
                          width: "100%",
                          fontSize: 12.5,
                          fontWeight: 600,
                          border: "1px solid var(--line-2)",
                          borderRadius: 6,
                          padding: "2px 6px",
                        }}
                      />
                    ) : (
                      <span className="t">
                        {e.nombre}
                        {e.esPlanBase ? (
                          <span className="ref">referencia</span>
                        ) : null}
                      </span>
                    )}
                    <div className="m">
                      {e.esPlanBase
                        ? "La vida tal como va"
                        : `${propios.length} evento${propios.length !== 1 ? "s" : ""}`}
                      {!e.esPlanBase && e.impuestosPeriodo != null ? (
                        <>
                          {" · cuota "}
                          <span className="num">
                            {formatEUR(e.impuestosPeriodo)}
                          </span>{" "}
                          <span className="orient">orientativo</span>
                        </>
                      ) : null}
                    </div>
                    <div
                      className="esc-actions"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => abrirClonar(e.id)}
                      >
                        Duplicar
                      </button>
                      {!e.esPlanBase && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingId(e.id);
                              setRenameDraft(e.nombre);
                            }}
                          >
                            Renombrar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `¿Eliminar el escenario «${e.nombre}»?`,
                                )
                              )
                                return;
                              removeEscenario(e.id);
                              setCompareIds((prev) =>
                                prev.filter((x) => x !== e.id),
                              );
                              if (selectedId === e.id) {
                                setSelectedId(planBase?.id ?? "");
                                setModo("comparador");
                              }
                              flash("Escenario eliminado");
                            }}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="hint">
              {limiteAlcanzado
                ? "Límite alcanzado: tres escenarios a la vez. Desmarque uno para añadir otro."
                : "Máximo tres escenarios a la vez: nadie decide entre seis cosas."}
            </div>

            <Button
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 10,
              }}
              disabled={altsMarcadas < 1}
              onClick={() => setModo("comparador")}
            >
              Ver comparación ({compareIds.length})
            </Button>
          </div>

          <div className="results">
            {modo === "comparador" ? (
              <>
                <TablaHechos
                  filas={filasHechos}
                  anioFijado={anioFijado}
                  delta={delta}
                  parcial={fiscalParcial}
                  motivosParcial={
                    fiscalMotivosParcial.length > 0
                      ? fiscalMotivosParcial
                      : undefined
                  }
                  sobreDatoIntroducido={fiscalSobreDato}
                />

                <div className="sect">
                  <ComparadorChart
                    series={chartSeries}
                    metrica={metrica}
                    mode={mode}
                    inflation={inflation}
                    selectedYear={cmpYear}
                    onSelectYear={toggleCmpYear}
                    onMetricaChange={setMetrica}
                    onModeChange={setMode}
                    hitos={hitos}
                  />
                </div>

                <LecturaEnHechos texto={lecturaEnHechos(caminosLectura)} />

                <div className="nota">
                  <span className="lbl">
                    Nota del asesor — obligatoria antes del informe
                  </span>
                  <textarea
                    value={notaAsesor}
                    onChange={(e) => setNotaAsesor(e.target.value)}
                    placeholder="Su lectura profesional de esta comparación: qué caminos se enseñaron, qué pesó en la conversación y qué acordó con el cliente."
                  />
                  <div className="row">
                    <span className="hint">
                      La conclusión del informe es suya, no del sistema. Mínimo
                      20 caracteres.
                    </span>
                    <button
                      type="button"
                      className="btn-coral"
                      disabled={notaAsesor.trim().length < 20}
                      onClick={() => setInformeOpen(true)}
                    >
                      Generar informe PDF
                    </button>
                  </div>
                </div>

                <div className="legal">
                  Cifras fiscales orientativas · Parámetros a verificar · Scenia
                  muestra el cálculo; no recomienda.
                </div>
              </>
            ) : (
              (() => {
                const eventosSel = eventosDeEscenario(selected.id);
                return (
                  <div className="sidep" style={{ padding: "16px 18px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div className="lbl">Escenario</div>
                        {renamingId === selected.id ? (
                          <input
                            autoFocus
                            value={renameDraft}
                            onChange={(ev) => setRenameDraft(ev.target.value)}
                            onBlur={(ev) => {
                              const n = (
                                ev.target as HTMLInputElement
                              ).value.trim();
                              if (n && n !== selected.nombre) {
                                patchEscenario(selected.id, { nombre: n });
                                flash("Escenario renombrado");
                              }
                              setRenamingId(null);
                            }}
                            onKeyDown={(ev) => {
                              if (ev.key === "Enter") {
                                (ev.target as HTMLInputElement).blur();
                              }
                              if (ev.key === "Escape") setRenamingId(null);
                            }}
                            className="h2"
                            style={{
                              width: "100%",
                              border: "1px solid var(--line-2)",
                              borderRadius: 6,
                              padding: "4px 8px",
                              font: "inherit",
                            }}
                          />
                        ) : (
                          <div
                            className="h2"
                            style={{
                              cursor: selected.esPlanBase
                                ? "default"
                                : "text",
                            }}
                            onDoubleClick={() => {
                              if (selected.esPlanBase) return;
                              setRenamingId(selected.id);
                              setRenameDraft(selected.nombre);
                            }}
                            title={
                              selected.esPlanBase
                                ? undefined
                                : "Doble clic para renombrar"
                            }
                          >
                            {selected.nombre}
                          </div>
                        )}
                        {selected.esPlanBase && (
                          <div className="tiny" style={{ marginTop: 2 }}>
                            La vida «tal como va» — comparable y editable como
                            cualquier otro.
                          </div>
                        )}
                        {!selected.esPlanBase &&
                          renamingId !== selected.id && (
                            <button
                              type="button"
                              className="tiny"
                              style={{
                                marginTop: 4,
                                background: "none",
                                border: "none",
                                padding: 0,
                                color: "var(--slate)",
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                              onClick={() => {
                                setRenamingId(selected.id);
                                setRenameDraft(selected.nombre);
                              }}
                            >
                              Renombrar
                            </button>
                          )}
                      </div>
                      <div className="toolbar">
                        <span className="tiny">Supuestos:</span>
                        <label className="tiny">
                          Rentabilidad{" "}
                          <input
                            type="number"
                            step={0.1}
                            value={pctLabel(
                              selected.rentabilidadEsperada ?? 0.04,
                            )}
                            style={{
                              width: 56,
                              border: "1px solid var(--line-2)",
                              borderRadius: 6,
                              padding: "4px 6px",
                            }}
                            onChange={(e) =>
                              updateSupuesto(selected.id, {
                                rentabilidadEsperada:
                                  (Number(e.target.value) || 0) / 100,
                              })
                            }
                          />{" "}
                          %
                        </label>
                        <label className="tiny">
                          Inflación{" "}
                          <input
                            type="number"
                            step={0.1}
                            value={pctLabel(selected.inflacion ?? 0.02)}
                            style={{
                              width: 56,
                              border: "1px solid var(--line-2)",
                              borderRadius: 6,
                              padding: "4px 6px",
                            }}
                            onChange={(e) =>
                              updateSupuesto(selected.id, {
                                inflacion:
                                  (Number(e.target.value) || 0) / 100,
                              })
                            }
                          />{" "}
                          %
                        </label>
                        <Button
                          size="sm"
                          onClick={() => setModo("comparador")}
                        >
                          Ver comparación
                        </Button>
                      </div>
                    </div>

                    <div className="lbl" style={{ margin: "14px 0 4px" }}>
                      Eventos del escenario
                    </div>
                    {eventosSel.length === 0 ? (
                      <div className="empty">
                        Sin eventos. Añade el primero — de cualquier activo.
                      </div>
                    ) : (
                      eventosSel.map((ev) => (
                        <div key={ev.id} className="evt">
                          <span
                            className={cn(
                              "evt-dot",
                              ev.introducidoPorAsesor && "intro",
                            )}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>
                              {ev.etiqueta}
                            </div>
                            <div className="tiny">
                              {ev.notas?.match(/^\d{4}/)
                                ? `${ev.notas}`
                                : ev.anio}
                            </div>
                            {ev.cuotaAnual != null &&
                              !ev.introducidoPorAsesor && (
                                <div
                                  className="calc-chip"
                                  style={{ marginTop: 4 }}
                                >
                                  {formatEUR(ev.cuotaAnual)} · primer
                                  ejercicio · orientativo · parámetros (a
                                  verificar)
                                </div>
                              )}
                            {ev.cuotaAnual == null &&
                              ev.impuestosPeriodo != null &&
                              !ev.introducidoPorAsesor && (
                                <div
                                  className="calc-chip"
                                  style={{ marginTop: 4 }}
                                >
                                  {formatEUR(ev.impuestosPeriodo)} · primer
                                  ejercicio · orientativo · parámetros (a
                                  verificar)
                                </div>
                              )}
                            {ev.sobreDatoIntroducido &&
                              !ev.introducidoPorAsesor && (
                                <div
                                  className="intro-chip"
                                  style={{ marginTop: 4 }}
                                >
                                  ✎ Calculado sobre una{" "}
                                  {ev.sobreDatoIntroducido}
                                </div>
                              )}
                            {ev.introducidoPorAsesor && (
                              <div
                                className="intro-chip"
                                style={{ marginTop: 4 }}
                              >
                                ✎ Introducido por el asesor · no calculado
                              </div>
                            )}
                          </div>
                          <div className="evt-actions">
                            <button
                              type="button"
                              onClick={() => deleteEvento(ev.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 10,
                        alignItems: "center",
                      }}
                    >
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setEventoOpen(true)}
                      >
                        + Añadir evento
                      </Button>
                      <span className="tiny">
                        El menú de eventos aparece completo — el escenario es
                        del cliente, no de un activo.
                      </span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>

      <PlantillaEvento
        open={eventoOpen}
        onClose={() => setEventoOpen(false)}
        contexto="completo"
        clienteId={cliente.id}
        elementoNombre={selected.nombre}
        destinoNombre={selected.nombre}
        escenarioInicialId={selected.id}
        escenarios={escenarios.map((e) => ({ id: e.id, nombre: e.nombre }))}
        elementosOverride={menuElementos}
        onCreated={onEventoCreado}
      />

      <NombrarEscenarioModal
        open={nombrarOpen}
        onClose={() => {
          setNombrarOpen(false);
          setClonarFromId(null);
        }}
        titulo={
          origenClon?.esPlanBase
            ? "Nuevo escenario (clona el plan base)"
            : `Duplicar «${origenClon?.nombre ?? ""}»`
        }
        nombrePropuesto={
          origenClon
            ? nombrePropuestoCopia(origenClon, escenarios)
            : "Nuevo escenario"
        }
        onConfirm={confirmarClon}
      />

      <InformeModal
        open={informeOpen}
        onClose={() => setInformeOpen(false)}
        titulo="Informe de la comparación"
        tituloInformeDefault={`Comparación de escenarios · ${compareEscenarios.map((e) => e.nombre).join(" vs ")}`}
        datosAFecha={formatFechaDMY(cliente.datosAFecha)}
        tipoInforme="Comparación de escenarios"
        notaInicial={notaAsesor}
        onGenerated={(info) =>
          addHistorial({
            fecha: new Date().toISOString().slice(0, 10),
            titulo: info.titulo,
            tipo: info.tipo,
          })
        }
      />
      <Toast message={toast} />
    </SheetPad>
  );
}
