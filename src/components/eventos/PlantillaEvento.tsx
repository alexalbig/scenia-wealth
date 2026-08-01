"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { useExpedienteOptional } from "@/components/expediente/ExpedienteProvider";
import { formatEUR, ageFromBirthYear } from "@/lib/format";
import { simularMotorEvento } from "@/lib/fiscal/motor";
import { buildContextoFiscalFromBag } from "@/lib/fiscal/contexto";
import {
  accionesParaElemento,
  chipPreviewEvento,
  defaultsParaEvento,
  elementosMenuCliente,
  tituloFormEvento,
  type ElementoMenuItem,
} from "@/lib/eventos-menu";
import {
  formatTitularidades,
  getInmuebles,
  getInstrumentos,
  getOtrosActivos,
} from "@/lib/patrimonio";
import { getPersonasDeCliente } from "@/lib/seed";
import type { Evento, TipoEvento } from "@/lib/types";
import type { EventoCreadoPayload } from "@/lib/eventos-types";

export type { EventoCreadoPayload } from "@/lib/eventos-types";

export type EventoContexto =
  | "instrumento"
  | "inmueble"
  | "pasivo"
  | "sociedad"
  | "otro"
  | "persona"
  | "ingreso"
  | "gasto"
  | "completo";

type Step = "elemento" | "menu" | "form";

interface PlantillaEventoProps {
  open: boolean;
  onClose: () => void;
  contexto: EventoContexto;
  elementoNombre: string;
  clienteId?: string;
  destinoNombre?: string;
  tipoFiscal?: string;
  /** Id del elemento (ficha) para titularidad multi-titular. */
  elementoId?: string;
  /** Año preseleccionado (p. ej. clic en año en Proyección). */
  anioInicial?: number;
  escenarios?: Array<{ id: string; nombre: string }>;
  escenarioInicialId?: string;
  /** Menú CT1 desde el expediente (bag). Si falta, cae a seed. */
  elementosOverride?: ElementoMenuItem[];
  onCreated?: (payload: EventoCreadoPayload) => void;
}

/**
 * CT1 · Plantilla de evento — flujo y marcado del mockup `abrirEvento` / `renderEventoForm`.
 */
export function PlantillaEvento({
  open,
  onClose,
  contexto,
  elementoNombre,
  clienteId,
  destinoNombre,
  tipoFiscal,
  elementoId: elementoIdProp,
  anioInicial,
  escenarios,
  escenarioInicialId,
  elementosOverride,
  onCreated,
}: PlantillaEventoProps) {
  const exp = useExpedienteOptional();
  const menuCompleto = contexto === "completo";

  const elementos = useMemo(() => {
    if (!menuCompleto) return [];
    if (elementosOverride && elementosOverride.length > 0) {
      return elementosOverride;
    }
    return clienteId ? elementosMenuCliente(clienteId) : [];
  }, [clienteId, menuCompleto, elementosOverride]);

  const [step, setStep] = useState<Step>(menuCompleto ? "elemento" : "menu");
  const [elemento, setElemento] = useState<ElementoMenuItem | null>(null);
  const [tipo, setTipo] = useState<TipoEvento | null>(null);
  const [anio, setAnio] = useState("2026");
  const [hastaAnio, setHastaAnio] = useState("2031");
  const [importe, setImporte] = useState("");
  const [destino, setDestino] = useState("");
  const [modalidad, setModalidad] = useState<"capital" | "renta" | "mixto">(
    "capital",
  );
  const [reinvierte, setReinvierte] = useState(true);
  const [conHipoteca, setConHipoteca] = useState(false);
  const [pension, setPension] = useState("");
  const [impactoManual, setImpactoManual] = useState("");
  const [tituloGenerico, setTituloGenerico] = useState("");
  const [tipoGenerico, setTipoGenerico] = useState<
    "ingreso" | "gasto" | "movimiento"
  >("ingreso");
  const [escenarioId, setEscenarioId] = useState(escenarioInicialId ?? "");

  const opciones = useMemo(() => {
    if (menuCompleto && elemento) {
      return accionesParaElemento(elemento.contexto, elemento.tipoFiscal);
    }
    if (!menuCompleto) {
      const ctx =
        contexto === "instrumento"
          ? "instrumento"
          : contexto === "ingreso" || contexto === "gasto"
            ? "generico"
            : contexto;
      return accionesParaElemento(ctx, tipoFiscal);
    }
    return [];
  }, [menuCompleto, elemento, contexto, tipoFiscal]);

  const nombreEl = menuCompleto ? (elemento?.nombre ?? "") : elementoNombre;
  const elementoId = menuCompleto ? elemento?.id : elementoIdProp;

  const titLinea = useMemo(() => {
    if (!clienteId || !elementoId) return null;
    const personas = getPersonasDeCliente(clienteId);
    const inst = getInstrumentos(clienteId).find((i) => i.id === elementoId);
    const inm = getInmuebles(clienteId).find((i) => i.id === elementoId);
    const otro = getOtrosActivos(clienteId).find((a) => a.id === elementoId);
    const tits =
      inst?.titularidades ?? inm?.titularidades ?? otro?.titularidades;
    if (!tits || tits.length < 2) return null;
    return formatTitularidades(tits, personas).replace(/%/g, " %");
  }, [clienteId, elementoId]);

  function applyDefaults(t: TipoEvento) {
    const d = defaultsParaEvento(t);
    const yearPref =
      anioInicial != null && Number.isFinite(anioInicial)
        ? String(anioInicial)
        : (d.anio ?? "2026");
    setAnio(yearPref);
    setHastaAnio(d.hastaAnio ?? "2031");
    setImporte(d.importe ?? "");
    setDestino(d.destino ?? "");
    setPension(d.pension ?? "");
    if (d.reinvierte != null) setReinvierte(d.reinvierte);
    setConHipoteca(false);
    setImpactoManual("");
    setTituloGenerico("");
    setTipoGenerico("ingreso");
    setModalidad("capital");
  }

  useEffect(() => {
    if (!open) return;
    setEscenarioId(escenarioInicialId ?? "");
    setElemento(null);
    setTipo(null);
    setImpactoManual("");
    setTituloGenerico("");
    setTipoGenerico("ingreso");

    if (menuCompleto) {
      setStep("elemento");
      return;
    }

    const ctx =
      contexto === "instrumento"
        ? "instrumento"
        : contexto === "ingreso" || contexto === "gasto"
          ? "generico"
          : contexto;
    const ops = accionesParaElemento(ctx, tipoFiscal);
    if (ops.length === 1) {
      setTipo(ops[0].tipo);
      applyDefaults(ops[0].tipo);
      setStep("form");
    } else {
      setStep("menu");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir
  }, [open, contexto, menuCompleto, escenarioInicialId, tipoFiscal, anioInicial]);

  function reset() {
    setStep(menuCompleto ? "elemento" : "menu");
    setElemento(null);
    setTipo(null);
    setAnio("2026");
    setHastaAnio("2031");
    setImporte("");
    setDestino("");
    setModalidad("capital");
    setReinvierte(true);
    setConHipoteca(false);
    setPension("");
    setImpactoManual("");
    setTituloGenerico("");
    setTipoGenerico("ingreso");
    setEscenarioId(escenarioInicialId ?? "");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function pickElemento(el: ElementoMenuItem) {
    setElemento(el);
    const acs = accionesParaElemento(el.contexto, el.tipoFiscal);
    if (acs.length === 1) {
      setTipo(acs[0].tipo);
      applyDefaults(acs[0].tipo);
      setStep("form");
    } else {
      setTipo(null);
      setStep("menu");
    }
  }

  function pickTipo(t: TipoEvento) {
    setTipo(t);
    applyDefaults(t);
    setStep("form");
  }

  function goBack() {
    if (step === "form") {
      if (menuCompleto && opciones.length === 1) {
        setTipo(null);
        setStep("elemento");
        setElemento(null);
        return;
      }
      if (!menuCompleto && opciones.length === 1) {
        handleClose();
        return;
      }
      setTipo(null);
      setStep("menu");
      return;
    }
    if (step === "menu" && menuCompleto) {
      setElemento(null);
      setTipo(null);
      setStep("elemento");
    }
  }

  function buildMotorCtx(tipoEv: TipoEvento) {
    const year = Number(anio) || 2026;
    const hasta = Number(hastaAnio) || undefined;
    const elId = elemento?.id ?? elementoIdProp;
    if (exp?.bag && elId) {
      const stub: Evento = {
        id: "preview",
        escenarioId: escenarioId || "",
        tipo: tipoEv,
        anio: year,
        hastaAnio: hasta,
        etiqueta: "",
        targetId: elId,
      };
      const eventosEsc = escenarioId
        ? exp.eventosDeEscenario(escenarioId)
        : [];
      // Incluye jubilaciones del escenario para la base general del preview
      const stubConPension: Evento =
        tipoEv === "jubilarse"
          ? {
              ...stub,
              etiqueta: `pensión ${Number(pension) || 0} €/año`,
              notas: `Pensión estimada ${Number(pension) || 0} €/año`,
            }
          : stub;
      const eventosPreview =
        tipoEv === "jubilarse"
          ? [...eventosEsc.filter((e) => e.tipo !== "jubilarse" || e.targetId !== elId), stubConPension]
          : eventosEsc;
      return buildContextoFiscalFromBag(
        exp.bag,
        stubConPension,
        {
          importe: Number(importe) || 0,
          hastaAnio: hasta,
          modalidad,
          reinvierte,
          impactoManual: Number(impactoManual) || 0,
        },
        eventosPreview,
      );
    }
    // Fallback sin bag: sin CCAA inventada — el motor devolverá sin_calculo si hace falta
    const personas = clienteId ? getPersonasDeCliente(clienteId) : [];
    const tits = personas.slice(0, 1).map((p) => ({
      personaId: p.id,
      pct: 1,
      baseGeneral: 0,
      edad: ageFromBirthYear(p.birthYear),
    }));
    return {
      anio: year,
      ccaa: personas[0]?.ccaa ?? "",
      baseGeneralTitular: 0,
      titularidades: tits,
      importe: Number(importe) || 0,
      hastaAnio: hasta,
      modalidad,
      reinvierte,
      impactoManual: Number(impactoManual) || 0,
    };
  }

  function guardar() {
    if (!tipo) return;
    const year = Number(anio);
    if (!Number.isFinite(year)) return;

    if (tipo === "jubilarse") {
      const pensionAnual = Number(pension) || 0;
      onCreated?.({
        tipo,
        etiqueta: `Jubilación (${year}) · pensión ${formatEUR(pensionAnual)}/año`,
        anio: year,
        introducidoPorAsesor: true,
        notas: `Pensión estimada ${Math.round(pensionAnual)} €/año · introducida por el asesor · no calculada (motor de pensión: V2)`,
        escenarioId: escenarioId || undefined,
        targetId: elemento?.id ?? elementoIdProp,
      });
      handleClose();
      return;
    }

    const ctx = buildMotorCtx(tipo);
    const motor = simularMotorEvento(tipo, ctx);

    const label = opciones.find((o) => o.tipo === tipo)?.label ?? tipo;
    const introducido =
      tipo === "generico" ||
      (impactoManual.trim() !== "" && motor.kind === "sin_calculo");

    let cuotaAnual: number | undefined;
    if (motor.kind === "calculado" || motor.kind === "neutro") {
      cuotaAnual = motor.importe;
    } else if (introducido && impactoManual.trim()) {
      cuotaAnual = Number(impactoManual);
    }

    let etiqueta = `${label} · ${nombreEl}`;
    if (tipo === "reembolsar_fondo") {
      etiqueta = `Reembolsar ${nombreEl} · ${formatEUR(Number(importe) || 0)}/año`;
    } else if (tipo === "traspasar_fondo") {
      etiqueta = `Traspasar ${nombreEl} → ${destino || "Fondo B"} (Art. 94)`;
    } else if (tipo === "pignorar") {
      etiqueta = `Pignorar ${nombreEl} · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "aportar_fondo") {
      etiqueta = `Aportar a ${nombreEl} · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "vender_inmueble") {
      etiqueta = `Vender ${nombreEl} · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "amortizar_hipoteca") {
      etiqueta = `Amortizar hipoteca · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "comprar_inmueble") {
      etiqueta = `Comprar inmueble · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "rescatar_plan") {
      etiqueta = `Rescatar plan · ${modalidad} · ${formatEUR(Number(importe) || 0)}/año`;
    } else if (tipo === "repartir_dividendo") {
      etiqueta = `Repartir dividendo · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "vender_participacion") {
      etiqueta = `Vender participación · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "generico") {
      etiqueta = tituloGenerico.trim() || "Evento genérico";
    }

    const hastaN = Number(hastaAnio);
    const usaHasta =
      (tipo === "reembolsar_fondo" || tipo === "rescatar_plan") &&
      Number.isFinite(hastaN) &&
      hastaN > year;

    const notasExtra = usaHasta
      ? `${year}–${hastaN}`
      : motor.kind === "pendiente_is" || motor.kind === "sin_calculo"
        ? motor.nota
        : motor.nota;

    onCreated?.({
      tipo,
      etiqueta,
      anio: year,
      hastaAnio: usaHasta ? hastaN : undefined,
      cuotaAnual,
      impuestosPeriodo: cuotaAnual,
      introducidoPorAsesor: introducido || undefined,
      notas: notasExtra,
      escenarioId: escenarioId || undefined,
      targetId: elemento?.id ?? elementoIdProp,
    });
    handleClose();
  }

  const tipoLabel = tipo ? tituloFormEvento(tipo) : "Evento";
  const destinoEyebrow =
    destinoNombre ??
    escenarios?.find((e) => e.id === escenarioId)?.nombre ??
    "plan base (situación actual)";

  const eyebrow = `Nuevo evento · destino: ${destinoEyebrow}`;
  const titulo =
    step === "elemento"
      ? "¿Sobre qué elemento?"
      : step === "menu"
        ? "¿Qué decisión?"
        : `${tipoLabel} · ${nombreEl}`;

  const showEscenarioSelect =
    !menuCompleto && escenarios && escenarios.length > 0;

  const chip =
    tipo && tipo !== "jubilarse" && tipo !== "generico"
      ? (() => {
          const m = simularMotorEvento(tipo, buildMotorCtx(tipo));
          if (m.kind === "calculado" || m.kind === "neutro") return m.nota;
          if (m.kind === "pendiente_is" || m.kind === "sin_calculo")
            return m.nota;
          return chipPreviewEvento(tipo, reinvierte);
        })()
      : "";

  const showTitLinea =
    titLinea &&
    (tipo === "reembolsar_fondo" ||
      tipo === "traspasar_fondo" ||
      tipo === "vender_inmueble");

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow={eyebrow}
      title={titulo}
      size="lg"
      footer={
        step === "elemento" ? (
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        ) : step === "menu" ? (
          <Button
            variant="secondary"
            onClick={() => {
              if (menuCompleto) goBack();
              else handleClose();
            }}
          >
            {menuCompleto ? "‹ Atrás" : "Cancelar"}
          </Button>
        ) : (
          <>
            <Button onClick={goBack}>‹ Atrás</Button>
            <Button variant="primary" onClick={guardar}>
              Guardar evento
            </Button>
          </>
        )
      }
    >
      {showEscenarioSelect && (
        <div className="field">
          <label className="lbl">Escenario destino</label>
          <select
            value={escenarioId}
            onChange={(e) => setEscenarioId(e.target.value)}
          >
            <option value="">Elegir escenario…</option>
            {escenarios!.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {step === "elemento" && (
        <>
          <div className="opt-grid">
            {elementos.map((el) => (
              <button
                key={el.id}
                type="button"
                onClick={() => pickElemento(el)}
              >
                {el.nombre}
                <span className="tiny">{el.hint}</span>
              </button>
            ))}
          </div>
          <div className="tiny">
            Menú completo: el escenario es del cliente, no de un activo.
          </div>
        </>
      )}

      {step === "menu" && (
        <>
          <div className="tiny" style={{ marginBottom: 2 }}>
            Elemento: <b>{nombreEl}</b>
          </div>
          <div className="opt-grid">
            {opciones.map((ev) => (
              <button
                key={ev.tipo}
                type="button"
                onClick={() => pickTipo(ev.tipo)}
              >
                {ev.label}
                <span className="tiny">{ev.hint}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === "form" && tipo === "reembolsar_fondo" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Importe anual</label>
              <input
                type="number"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Hasta el año</label>
              <input
                type="number"
                value={hastaAnio}
                onChange={(e) => setHastaAnio(e.target.value)}
              />
            </div>
            <div />
          </div>
          {showTitLinea && <TitLinea texto={titLinea!} />}
          <div className="calc-chip" style={{ alignSelf: "flex-start" }}>
            {chip}
          </div>
        </>
      )}

      {step === "form" && tipo === "traspasar_fondo" && (
        <>
          <div className="field">
            <label className="lbl">Fondo destino</label>
            <input
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="lbl">Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
          </div>
          {showTitLinea && <TitLinea texto={titLinea!} />}
          <div className="calc-chip" style={{ alignSelf: "flex-start" }}>
            {chip}
          </div>
        </>
      )}

      {step === "form" && tipo === "pignorar" && (
        <>
          <div className="field">
            <label className="lbl">Importe pignorado</label>
            <input
              type="number"
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="lbl">Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
          </div>
          <div className="calc-chip" style={{ alignSelf: "flex-start" }}>
            {chip}
          </div>
        </>
      )}

      {step === "form" && tipo === "aportar_fondo" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Importe</label>
              <input
                type="number"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
          </div>
          <div className="calc-chip" style={{ alignSelf: "flex-start" }}>
            {chip}
          </div>
        </>
      )}

      {step === "form" && tipo === "jubilarse" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Pensión anual estimada</label>
              <input
                type="number"
                value={pension}
                onChange={(e) => setPension(e.target.value)}
              />
            </div>
          </div>
          <div
            className="intro-chip"
            style={{ alignSelf: "flex-start", marginTop: 12 }}
          >
            ✎ Pensión introducida por el asesor · no calculada (motor de
            pensión: V2)
          </div>
        </>
      )}

      {step === "form" && tipo === "vender_inmueble" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Importe de venta</label>
              <input
                type="number"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
          </div>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              margin: "8px 0",
            }}
          >
            <input
              type="checkbox"
              className="chk"
              checked={reinvierte}
              onChange={(e) => setReinvierte(e.target.checked)}
            />
            Reinversión en renta vitalicia (mayor de 65)
          </label>
          {showTitLinea && <TitLinea texto={titLinea!} />}
          <div className="calc-chip" style={{ alignSelf: "flex-start" }}>
            {chip}
          </div>
        </>
      )}

      {step === "form" && tipo === "amortizar_hipoteca" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Importe a amortizar</label>
              <input
                type="number"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
          </div>
          <div className="calc-chip" style={{ alignSelf: "flex-start" }}>
            {chip}
          </div>
        </>
      )}

      {step === "form" && tipo === "comprar_inmueble" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Precio</label>
              <input
                type="number"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
          </div>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              margin: "8px 0",
            }}
          >
            <input
              type="checkbox"
              className="chk"
              checked={conHipoteca}
              onChange={(e) => setConHipoteca(e.target.checked)}
            />
            Con hipoteca
          </label>
          <div className="calc-chip" style={{ alignSelf: "flex-start" }}>
            {chip}
          </div>
        </>
      )}

      {step === "form" &&
        (tipo === "repartir_dividendo" || tipo === "vender_participacion") && (
          <>
            <div className="grid2">
              <div className="field">
                <label className="lbl">Importe</label>
                <input
                  type="number"
                  value={importe}
                  onChange={(e) => setImporte(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="lbl">Año</label>
                <input
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                />
              </div>
            </div>
            <div
              style={{
                border: "1px solid var(--line-2)",
                borderRadius: 8,
                background: "var(--paper-2)",
                padding: "10px 12px",
              }}
            >
              <span className="tag-pend">
                Sin cálculo · liquidador de IS pendiente de definir
              </span>
              <div className="tiny" style={{ marginTop: 6 }}>
                El evento se registra en el escenario, pero Scenia no muestra
                cifras fiscales societarias que no puede calcular.
              </div>
            </div>
          </>
        )}

      {step === "form" && tipo === "generico" && (
        <>
          <div>
            <label
              className="lbl"
              style={{ display: "block", marginBottom: 6 }}
            >
              Tipo
            </label>
            <div className="radio-row">
              {(
                [
                  ["ingreso", "Ingreso"],
                  ["gasto", "Gasto"],
                  ["movimiento", "Movimiento libre"],
                ] as const
              ).map(([id, label]) => (
                <label key={id}>
                  <input
                    type="radio"
                    name="ev-gt"
                    checked={tipoGenerico === id}
                    onChange={() => setTipoGenerico(id)}
                  />{" "}
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="lbl">Título</label>
            <input
              type="text"
              value={tituloGenerico}
              onChange={(e) => setTituloGenerico(e.target.value)}
              placeholder="Ej.: Ingreso extraordinario"
            />
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Importe</label>
              <input
                type="number"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="lbl">Impacto fiscal estimado (opcional)</label>
            <input
              type="number"
              value={impactoManual}
              onChange={(e) => setImpactoManual(e.target.value)}
            />
          </div>
          <div
            className="intro-chip"
            style={{ alignSelf: "flex-start" }}
          >
            ✎ Si tecleas un impacto fiscal, se marcará «introducido por el
            asesor, no calculado»
          </div>
        </>
      )}

      {step === "form" && tipo === "rescatar_plan" && (
        <>
          <div style={{ marginBottom: 10 }}>
            <label
              className="lbl"
              style={{ display: "block", marginBottom: 6 }}
            >
              Modalidad
            </label>
            <div className="radio-row">
              {(["capital", "renta", "mixto"] as const).map((m) => (
                <label key={m}>
                  <input
                    type="radio"
                    name="ev-mod"
                    checked={modalidad === m}
                    onChange={() => setModalidad(m)}
                  />{" "}
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Importe anual</label>
              <input
                type="number"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="lbl">Hasta el año</label>
            <input
              type="number"
              value={hastaAnio}
              onChange={(e) => setHastaAnio(e.target.value)}
            />
          </div>
          <div className="calc-chip" style={{ alignSelf: "flex-start" }}>
            {chip}
          </div>
        </>
      )}

      {step === "form" && tipo === "aportar_plan" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Importe</label>
              <input
                type="number"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="lbl">Impacto fiscal estimado (opcional)</label>
            <input
              type="number"
              value={impactoManual}
              onChange={(e) => setImpactoManual(e.target.value)}
            />
            <div
              className="intro-chip"
              style={{ alignSelf: "flex-start", marginTop: 8 }}
            >
              ✎ Si tecleas un impacto fiscal, se marcará «introducido por el
              asesor, no calculado»
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

function TitLinea({ texto }: { texto: string }) {
  return (
    <div className="hint-info" style={{ margin: "10px 0" }}>
      <b>ⓘ</b>
      <span>
        Actúa sobre <b>{texto}</b> — proporcional al reparto de titularidad.
        Cada titular tributa su parte en su escala.
      </span>
    </div>
  );
}

/** Compatibilidad: menú corto usado desde fichas. */
export function EventoModal({
  open,
  onClose,
  contexto,
  elementoNombre,
  tipoFiscal,
  elementoId,
  clienteId,
  escenarios,
  escenarioInicialId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  contexto: Exclude<EventoContexto, "completo">;
  elementoNombre: string;
  tipoFiscal?: string;
  elementoId?: string;
  clienteId?: string;
  /** Si el expediente ya tiene escenarios propios, se ofrece el selector de destino. */
  escenarios?: Array<{ id: string; nombre: string }>;
  escenarioInicialId?: string;
  onCreated?: (payload: EventoCreadoPayload) => void;
}) {
  return (
    <PlantillaEvento
      open={open}
      onClose={onClose}
      contexto={contexto}
      elementoNombre={elementoNombre}
      tipoFiscal={tipoFiscal}
      elementoId={elementoId}
      clienteId={clienteId}
      escenarios={escenarios}
      escenarioInicialId={escenarioInicialId}
      onCreated={onCreated}
    />
  );
}
