"use client";

import { useMemo, useState } from "react";
import {
  Button,
  FilaFiscal,
  SheetPad,
  Toast,
} from "@/components/ui";
import { ComparadorChart } from "@/components/escenarios/ComparadorChart";
import { PlantillaEvento } from "@/components/eventos/PlantillaEvento";
import { InformeModal } from "@/components/patrimonio/InformeModal";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import type { EventoCreadoPayload } from "@/lib/eventos-types";
import { cn } from "@/lib/cn";
import { formatEUR } from "@/lib/format";
import { formatFechaDMY } from "@/lib/patrimonio";
import {
  COMPARADOR_METRICAS,
  serieComparador,
  type ComparadorMetrica,
} from "@/lib/escenarios";
import { buildProyeccionSeries, toEuroHoy, type EuroMode } from "@/lib/proyeccion";
import type { Cliente, Escenario } from "@/lib/types";

type Modo = "detalle" | "comparador";

function pctLabel(decimal: number): string {
  const pct = decimal * 100;
  return Number.isInteger(pct) ? String(pct) : pct.toFixed(1).replace(".", ",");
}

/**
 * P6 · Escenarios + comparador — marcado literal del mockup.
 * Fuente de verdad: bag del expediente (ExpedienteProvider).
 */
export function EscenariosView({ cliente }: { cliente: Cliente }) {
  const {
    bag,
    ahorro,
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

  const years = useMemo(
    () =>
      buildProyeccionSeries(cliente.id, {
        patrimonioNeto: bag.cliente.patrimonioNeto,
        capacidad: ahorro.capacidad,
        completo: bag.cliente.completo,
      }).map((p) => p.year),
    [cliente.id, bag.cliente.patrimonioNeto, bag.cliente.completo, ahorro.capacidad],
  );

  const [selectedId, setSelectedId] = useState(
    () =>
      escenarios.find((e) => !e.esPlanBase)?.id ?? escenarios[0]?.id ?? "",
  );
  const [compareIds, setCompareIds] = useState<string[]>(() =>
    escenarios.map((e) => e.id),
  );
  const [modo, setModo] = useState<Modo>("comparador");
  const [metrica, setMetrica] = useState<ComparadorMetrica>("patrimonio");
  const [mode, setMode] = useState<EuroMode>("futuro");
  const [cmpYear, setCmpYear] = useState<number | null>(null);
  const [eventoOpen, setEventoOpen] = useState(false);
  const [informeOpen, setInformeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const selected =
    escenarios.find((e) => e.id === selectedId) ?? escenarios[0];

  const compareEscenarios = compareIds
    .map((id) => escenarios.find((e) => e.id === id))
    .filter((e): e is Escenario => !!e);

  const chartSeries = compareEscenarios.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    years,
    values: serieComparador(cliente.id, e.id, metrica, {
      impuestosPeriodo: e.impuestosPeriodo,
      esPlanBase: e.esPlanBase,
      patrimonioNeto: bag.cliente.patrimonioNeto,
      capacidad: ahorro.capacidad,
      completo: bag.cliente.completo,
    }),
  }));

  const fiscalCells = compareEscenarios.map((e) => ({
    id: e.id,
    name: e.nombre,
    amount: e.impuestosPeriodo ?? 0,
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
  const fiscalSobreDato = compareEscenarios.some(
    (e) => e.impuestosSobreDatoIntroducido,
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  function clonar(fromId: string) {
    const nonBase = bag.escenarios.filter((e) => !e.esPlanBase).length;
    const letter = String.fromCharCode(65 + nonBase);
    const nuevo = cloneEscenario(fromId, `${letter} · Nuevo escenario`);
    if (!nuevo) return;
    setSelectedId(nuevo.id);
    setModo("detalle");
    // El nuevo no entra en la comparación hasta que el asesor lo marque.
    flash("Escenario clonado · añade eventos de cualquier activo");
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
  const nSel = compareIds.length;
  const baseForClone = planBase?.id ?? escenarios[0]!.id;
  const regimenLabel =
    bag.sociedades.length > 0
      ? "Régimen: IRPF · IS pendiente de definir"
      : null;

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
          <div className="lbl">Escenarios</div>
          <div className="h2">Espacio de trabajo · sin pasos guiados</div>
          {regimenLabel && (
            <div className="tiny" style={{ marginTop: 4 }}>
              {regimenLabel}
            </div>
          )}
        </div>
        <Button variant="coral" onClick={() => clonar(baseForClone)}>
          + Nuevo escenario (clona el plan base)
        </Button>
      </div>

      <div className="esc-grid">
        <div>
          {escenarios.map((e) => {
            const eventosEsc = eventosDeEscenario(e.id);
            const on = e.id === selected.id && modo === "detalle";
            return (
              <div
                key={e.id}
                className={cn("esc-item", on && "on")}
                onClick={() => {
                  setSelectedId(e.id);
                  setModo("detalle");
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "space-between",
                  }}
                >
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
                        flex: 1,
                        fontSize: 12.5,
                        fontWeight: 700,
                        border: "1px solid var(--line-2)",
                        borderRadius: 6,
                        padding: "4px 8px",
                      }}
                    />
                  ) : (
                    <b style={{ fontSize: 12.5 }}>{e.nombre}</b>
                  )}
                  {e.esPlanBase && (
                    <span className="base-tag">Plan base</span>
                  )}
                </div>
                <div className="tiny" style={{ margin: "4px 0 8px" }}>
                  {`${eventosEsc.length} evento${eventosEsc.length !== 1 ? "s" : ""} · supuestos ${pctLabel(e.rentabilidadEsperada ?? 0.04)} % / ${pctLabel(e.inflacion ?? 0.02)} %`}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      color: "var(--slate)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="chk"
                      checked={compareIds.includes(e.id)}
                      onChange={() => toggleCompare(e.id)}
                    />{" "}
                    Comparar
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => clonar(e.id)}
                  >
                    ⧉ Clonar
                  </Button>
                  {!e.esPlanBase && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRenamingId(e.id);
                          setRenameDraft(e.nombre);
                        }}
                      >
                        Renombrar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
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
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <Button
            style={{ width: "100%", justifyContent: "center" }}
            disabled={nSel < 2}
            onClick={() => setModo("comparador")}
          >
            Comparar seleccionados ({nSel})
          </Button>
        </div>

        <div>
          {modo === "comparador" ? (
            <div className="sidep" style={{ padding: "16px 18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
                  <div className="lbl">Comparador</div>
                  <div className="h2">
                    {compareEscenarios.map((e) => e.nombre).join("  vs  ")}
                  </div>
                </div>
                <div className="toolbar">
                  <div className="chips">
                    {COMPARADOR_METRICAS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={cn(metrica === m.id && "on")}
                        onClick={() => setMetrica(m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="seg">
                    <button
                      type="button"
                      className={cn(mode === "hoy" && "on")}
                      onClick={() => setMode("hoy")}
                    >
                      € hoy
                    </button>
                    <button
                      type="button"
                      className={cn(mode === "futuro" && "on")}
                      onClick={() => setMode("futuro")}
                    >
                      € futuro
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setInformeOpen(true)}
                  >
                    Generar informe
                  </Button>
                </div>
              </div>

              <div className="chartbox" style={{ marginTop: 12 }}>
                <ComparadorChart
                  series={chartSeries}
                  metrica={metrica}
                  mode={mode}
                  inflation={inflation}
                  selectedYear={cmpYear}
                  onSelectYear={toggleCmpYear}
                />
              </div>

              <div style={{ marginTop: 12 }}>
                <FilaFiscal
                  cells={fiscalCells}
                  delta={delta}
                  parcial={fiscalParcial}
                  sobreDatoIntroducido={fiscalSobreDato}
                  parametrosAVerificar
                />
                <p className="tiny" style={{ marginTop: 6 }}>
                  € hoy / € futuro aplica al gráfico (patrimonio, líquidos e
                  impacto en serie). La fila fiscal es la cuota del primer
                  ejercicio en euros de ese año — no se deflacta.
                </p>
              </div>

              <div className="lbl" style={{ margin: "16px 0 6px" }}>
                Eventos de cada escenario
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.max(compareEscenarios.length, 1)}, 1fr)`,
                  gap: 12,
                }}
              >
                {compareEscenarios.map((e) => {
                  const eventosEsc = eventosDeEscenario(e.id);
                  return (
                    <div key={e.id}>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {e.nombre}
                      </div>
                      {eventosEsc.length === 0 ? (
                        <div className="tiny mut">Sin eventos propios.</div>
                      ) : (
                        eventosEsc.map((ev) => (
                          <div key={ev.id} className="evt">
                            <span
                              className={cn(
                                "evt-dot",
                                ev.introducidoPorAsesor && "intro",
                              )}
                            />
                            <div>
                              <div
                                style={{ fontSize: 11.5, fontWeight: 600 }}
                              >
                                {ev.etiqueta}
                              </div>
                              <div className="tiny">
                                {ev.notas?.match(/^\d{4}/)
                                  ? ev.notas
                                  : ev.anio}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>

              {cmpYear != null && (
                <div className="tiny" style={{ marginTop: 10 }}>
                  Año fijado: <b className="num">{cmpYear}</b> ·{" "}
                  {metrica === "irpf_acumulado"
                    ? "impacto fiscal de los eventos"
                    : "valor"}{" "}
                  por escenario:{" "}
                  {compareEscenarios
                    .map((e, i) => {
                      const raw =
                        chartSeries[i]?.values[
                          years.indexOf(cmpYear)
                        ] ?? 0;
                      const v =
                        mode === "hoy"
                          ? toEuroHoy(raw, cmpYear, inflation)
                          : raw;
                      return (
                        <span key={e.id}>
                          {i > 0 ? " · " : null}
                          {e.nombre}{" "}
                          <b className="num">{formatEUR(Math.round(v))}</b>
                        </span>
                      );
                    })}
                </div>
              )}
            </div>
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
                          style={{ cursor: selected.esPlanBase ? "default" : "text" }}
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
                      {!selected.esPlanBase && renamingId !== selected.id && (
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
                          value={pctLabel(selected.rentabilidadEsperada ?? 0.04)}
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
                                {formatEUR(ev.cuotaAnual)} · primer ejercicio ·
                                orientativo · parámetros (a verificar)
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
                                ✎ Calculado sobre una {ev.sobreDatoIntroducido}
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

      <InformeModal
        open={informeOpen}
        onClose={() => setInformeOpen(false)}
        titulo="Informe de la comparación"
        tituloInformeDefault={`Comparación de escenarios · ${compareEscenarios.map((e) => e.nombre).join(" vs ")}`}
        datosAFecha={formatFechaDMY(cliente.datosAFecha)}
        tipoInforme="Comparación de escenarios"
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
