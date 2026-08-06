"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { useExpedienteOptional } from "@/components/expediente/ExpedienteProvider";
import { formatEUR, formatIntegerES, ageFromBirthYear } from "@/lib/format";
import { simularMotorEvento } from "@/lib/fiscal/motor";
import {
  buildContextoFiscalFromBag,
  parsePensionJubilacion,
} from "@/lib/fiscal/contexto";
import { estadoFiscalPersona } from "@/lib/fiscal/estado-persona";
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
  getIngresos,
  getInmuebles,
  getInstrumentos,
  getOtrosActivos,
  pasivosParaAmortizar,
} from "@/lib/patrimonio";
import { getPersonasDeCliente } from "@/lib/seed";
import { jubilacionDePersonaEnEscenario } from "@/lib/expediente";
import type { Evento, Pasivo, TipoEvento } from "@/lib/types";
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

/** Recuerda el último elemento usado en el menú completo (sesión). */
let lastElementIdRemembered: string | null = null;

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
  /** Año preseleccionado (p. ej. clic en año en Proyección o jubilación existente). */
  anioInicial?: number;
  /** Pensión precargada al editar una jubilación existente. */
  pensionInicial?: number;
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
  pensionInicial,
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
  const [anioContingencia, setAnioContingencia] = useState("2026");
  const [formError, setFormError] = useState<string | null>(null);
  const [reinvierte, setReinvierte] = useState(false);
  const [conHipoteca, setConHipoteca] = useState(false);
  const [pension, setPension] = useState("");
  const [impactoManual, setImpactoManual] = useState("");
  const [tituloGenerico, setTituloGenerico] = useState("");
  const [tipoGenerico, setTipoGenerico] = useState<
    "ingreso" | "gasto" | "movimiento"
  >("ingreso");
  const [escenarioId, setEscenarioId] = useState(escenarioInicialId ?? "");
  const [pasivoTargetId, setPasivoTargetId] = useState("");

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

  const pasivosAmortizar = useMemo((): Pasivo[] => {
    if (!exp?.bag) return [];
    return pasivosParaAmortizar(exp.bag.pasivos, elementoId);
  }, [exp?.bag, elementoId]);

  useEffect(() => {
    if (tipo !== "amortizar_hipoteca") return;
    if (pasivosAmortizar.length === 1) {
      setPasivoTargetId(pasivosAmortizar[0]!.id);
    } else if (
      pasivosAmortizar.length > 1 &&
      !pasivosAmortizar.some((p) => p.id === pasivoTargetId)
    ) {
      setPasivoTargetId("");
    } else if (pasivosAmortizar.length === 0) {
      setPasivoTargetId("");
    }
  }, [tipo, pasivosAmortizar, pasivoTargetId]);

  const titLinea = useMemo(() => {
    if (!clienteId || !elementoId) return null;
    const fromBag = exp?.bag;
    const inst =
      fromBag?.instrumentos.find((i) => i.id === elementoId) ??
      getInstrumentos(clienteId).find((i) => i.id === elementoId);
    const inm =
      fromBag?.inmuebles.find((i) => i.id === elementoId) ??
      getInmuebles(clienteId).find((i) => i.id === elementoId);
    const otro =
      fromBag?.otrosActivos.find((a) => a.id === elementoId) ??
      getOtrosActivos(clienteId).find((a) => a.id === elementoId);
    const personas = fromBag?.personas ?? getPersonasDeCliente(clienteId);
    const tits =
      inst?.titularidades ?? inm?.titularidades ?? otro?.titularidades;
    if (!tits || tits.length < 2) return null;
    return formatTitularidades(tits, personas).replace(/%/g, " %");
  }, [clienteId, elementoId, exp?.bag]);

  function applyDefaults(t: TipoEvento) {
    const d = defaultsParaEvento(t);
    const yearPref =
      anioInicial != null && Number.isFinite(anioInicial)
        ? String(anioInicial)
        : (d.anio ?? "2026");
    const yearN = Number(yearPref) || 2026;
    const hastaDefault = Number(d.hastaAnio) || yearN + 7;
    setAnio(yearPref);
    setHastaAnio(String(Math.max(hastaDefault, yearN)));
    setImporte(d.importe ?? "");
    setDestino(d.destino ?? "");
    setPension(
      pensionInicial != null && Number.isFinite(pensionInicial)
        ? String(Math.round(pensionInicial))
        : (d.pension ?? ""),
    );
    if (d.reinvierte != null) setReinvierte(d.reinvierte);
    setConHipoteca(false);
    setImpactoManual("");
    setTituloGenerico("");
    setTipoGenerico("ingreso");
    setModalidad("capital");
    const targetId = menuCompleto ? elemento?.id : elementoIdProp;
    const planTarget =
      targetId != null
        ? exp?.bag.instrumentos.find(
            (i) => i.id === targetId && i.tipoFiscal === "plan_pensiones",
          )
        : undefined;
    setAnioContingencia(
      t === "rescatar_plan" && planTarget?.anioContingencia != null
        ? String(planTarget.anioContingencia)
        : yearPref,
    );

    // Precarga jubilación existente del escenario (reemplazar, no duplicar).
    if (t === "jubilarse" && targetId && exp?.bag) {
      const escId =
        escenarioId ||
        escenarioInicialId ||
        exp.planBase?.id ||
        "";
      if (escId) {
        const existing = jubilacionDePersonaEnEscenario(
          exp.bag,
          escId,
          targetId,
        );
        if (existing) {
          setAnio(String(existing.anio));
          const p = parsePensionJubilacion(existing);
          if (p != null) setPension(String(Math.round(p)));
        }
      }
    }
  }

  useEffect(() => {
    if (!open) return;
    setEscenarioId(escenarioInicialId ?? "");
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
    setAnioContingencia(
      anioInicial != null && Number.isFinite(anioInicial)
        ? String(anioInicial)
        : "2026",
    );
    setFormError(null);

    if (menuCompleto) {
      const remembered =
        lastElementIdRemembered != null
          ? elementos.find((el) => el.id === lastElementIdRemembered)
          : undefined;
      if (remembered) {
        setElemento(remembered);
        const acs = accionesParaElemento(
          remembered.contexto,
          remembered.tipoFiscal,
        );
        if (acs.length === 1) {
          setTipo(acs[0]!.tipo);
          applyDefaults(acs[0]!.tipo);
          setStep("form");
        } else {
          setStep("menu");
        }
      } else {
        setElemento(null);
        setStep("elemento");
      }
      return;
    }

    setElemento(null);
    const ctx =
      contexto === "instrumento"
        ? "instrumento"
        : contexto === "ingreso" || contexto === "gasto"
          ? "generico"
          : contexto;
    const ops = accionesParaElemento(ctx, tipoFiscal);
    if (ops.length === 1) {
      setTipo(ops[0]!.tipo);
      applyDefaults(ops[0]!.tipo);
      setStep("form");
    } else {
      setStep("menu");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir
  }, [open, contexto, menuCompleto, escenarioInicialId, tipoFiscal, anioInicial, elementos]);

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
    setPasivoTargetId("");
    setFormError(null);
  }

  function setAnioClamped(next: string) {
    setAnio(next);
    setFormError(null);
    const y = Number(next);
    const h = Number(hastaAnio);
    if (Number.isFinite(y) && Number.isFinite(h) && h < y) {
      setHastaAnio(String(y));
    }
  }

  function setHastaClamped(next: string) {
    setHastaAnio(next);
    setFormError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function pickElemento(el: ElementoMenuItem) {
    setElemento(el);
    lastElementIdRemembered = el.id;
    const acs = accionesParaElemento(el.contexto, el.tipoFiscal);
    if (acs.length === 1) {
      setTipo(acs[0]!.tipo);
      applyDefaults(acs[0]!.tipo);
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
              etiqueta: `pensión ${formatIntegerES(Number(pension) || 0)} €/año`,
              notas: `Pensión estimada ${formatIntegerES(Number(pension) || 0)} €/año`,
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
          anioContingencia: Number(anioContingencia) || undefined,
          impactoManual: Number(impactoManual) || 0,
        },
        eventosPreview,
      );
    }
    // Fallback sin bag: clasificador por persona del seed (sin inventar CCAA).
    const personas = clienteId ? getPersonasDeCliente(clienteId) : [];
    const ingresosCliente = clienteId ? getIngresos(clienteId) : [];
    const tits = personas.slice(0, 1).map((p) => {
      const ingresos = ingresosCliente.filter((i) => i.personaId === p.id);
      return {
        personaId: p.id,
        pct: 1,
        baseGeneral: 0,
        edad: ageFromBirthYear(p.birthYear),
        ccaa: p.ccaa,
        nombre: p.nombre,
        estado: estadoFiscalPersona(p, ingresos),
      };
    });
    return {
      anio: year,
      ccaa: personas[0]?.ccaa ?? "",
      baseGeneralTitular: 0,
      titularidades: tits,
      importe: Number(importe) || 0,
      hastaAnio: hasta,
      modalidad,
      reinvierte,
      anioContingencia: Number(anioContingencia) || undefined,
      impactoManual: Number(impactoManual) || 0,
    };
  }

  function guardar() {
    if (!tipo) return;
    const year = Number(anio);
    if (!Number.isFinite(year)) return;

    const hastaN = Number(hastaAnio);
    const usaRango =
      tipo === "reembolsar_fondo" || tipo === "rescatar_plan";
    if (
      usaRango &&
      Number.isFinite(hastaN) &&
      hastaAnio.trim() !== "" &&
      hastaN < year
    ) {
      setFormError(
        "«Hasta el año» no puede ser anterior al año del evento.",
      );
      return;
    }

    if (tipo === "jubilarse") {
      const pensionAnual = Number(pension) || 0;
      onCreated?.({
        tipo,
        etiqueta: `Jubilación (${year}) · pensión ${formatEUR(pensionAnual)}/año`,
        anio: year,
        introducidoPorAsesor: true,
        notas: `Pensión estimada ${formatIntegerES(Math.round(pensionAnual))} €/año · introducida por el asesor · no calculada (motor de pensión: V2)`,
        escenarioId: escenarioId || undefined,
        targetId: elemento?.id ?? elementoIdProp,
      });
      handleClose();
      return;
    }

    if (tipo === "amortizar_hipoteca") {
      if (!pasivoTargetId || !pasivosAmortizar.some((p) => p.id === pasivoTargetId)) {
        setFormError(
          pasivosAmortizar.length === 0
            ? "No hay hipoteca asociada a este elemento · no se registra la amortización"
            : "Elige la hipoteca a amortizar",
        );
        return;
      }
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
      const pasivo = pasivosAmortizar.find((p) => p.id === pasivoTargetId);
      const hipLabel = pasivo
        ? `Hipoteca ${pasivo.prestamista}`
        : "hipoteca";
      etiqueta = `Amortizar ${hipLabel} · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "comprar_inmueble") {
      etiqueta = `Comprar inmueble · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "rescatar_plan") {
      etiqueta = `Rescatar plan · ${modalidad} · ${formatEUR(Number(importe) || 0)}/año`;
    } else if (tipo === "aportar_plan") {
      etiqueta = `Aportar a plan · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "repartir_dividendo") {
      etiqueta = `Repartir dividendo · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "vender_participacion") {
      etiqueta = `Vender participación · ${formatEUR(Number(importe) || 0)}`;
    } else if (tipo === "generico") {
      etiqueta =
        tituloGenerico.trim() ||
        (tipoGenerico === "gasto"
          ? "Gasto"
          : tipoGenerico === "movimiento"
            ? "Movimiento"
            : "Ingreso");
    }

    const usaHasta =
      (tipo === "reembolsar_fondo" || tipo === "rescatar_plan") &&
      Number.isFinite(hastaN) &&
      hastaN >= year;

    const importeN = Number(importe);
    const importeEvento =
      Number.isFinite(importeN) && importeN > 0 ? importeN : undefined;

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
      importe: importeEvento,
      tipoGenerico: tipo === "generico" ? tipoGenerico : undefined,
      cuotaAnual,
      impuestosPeriodo: cuotaAnual,
      introducidoPorAsesor: introducido || undefined,
      sobreDatoIntroducido:
        motor.kind === "calculado" || motor.kind === "neutro"
          ? motor.sobreDatoIntroducido
          : undefined,
      anioContingencia:
        tipo === "rescatar_plan" && modalidad === "capital"
          ? Number(anioContingencia) || undefined
          : undefined,
      notas: notasExtra,
      escenarioId: escenarioId || undefined,
      targetId:
        tipo === "amortizar_hipoteca"
          ? pasivoTargetId
          : (elemento?.id ?? elementoIdProp),
    });
    handleClose();
  }

  const tipoLabel = tipo ? tituloFormEvento(tipo) : "Evento";
  const destinoLive =
    (escenarioId || escenarioInicialId
      ? escenarios?.find((e) => e.id === (escenarioId || escenarioInicialId))
          ?.nombre
      : undefined) ??
    (escenarioId || escenarioInicialId
      ? exp?.bag.escenarios.find(
          (e) => e.id === (escenarioId || escenarioInicialId),
        )?.nombre
      : undefined);
  const destinoEyebrow =
    destinoLive ?? destinoNombre ?? "plan base (situación actual)";

  const eyebrow = `Nuevo evento · destino: ${destinoEyebrow}`;
  const titulo =
    step === "elemento"
      ? "¿Sobre qué elemento?"
      : step === "menu"
        ? "¿Qué decisión?"
        : tipo === "comprar_inmueble"
          ? tipoLabel
          : `${tipoLabel} · ${nombreEl}`;

  const showEscenarioSelect =
    !menuCompleto && escenarios && escenarios.length > 0;

  const chipMotor =
    tipo && tipo !== "jubilarse" && tipo !== "generico"
      ? simularMotorEvento(tipo, buildMotorCtx(tipo))
      : null;
  const chipAmortizarSinPasivo =
    tipo === "amortizar_hipoteca" &&
    (pasivosAmortizar.length === 0 ||
      (pasivosAmortizar.length > 1 && !pasivoTargetId))
      ? pasivosAmortizar.length === 0
        ? "No hay hipoteca asociada · no se registra la amortización · no se inventa un pasivo"
        : "Elige la hipoteca a amortizar · sin pasivo no se registra el evento"
      : null;
  const chip =
    chipAmortizarSinPasivo ??
    (chipMotor == null
      ? ""
      : chipMotor.kind === "calculado" || chipMotor.kind === "neutro"
        ? chipMotor.nota +
          (chipMotor.kind === "calculado" &&
          chipMotor.estimacionNoAutoliquidable
            ? " · ⚠ no válida para autoliquidación"
            : "")
        : chipMotor.kind === "pendiente_is" || chipMotor.kind === "sin_calculo"
          ? chipMotor.nota
          : chipPreviewEvento(tipo!, reinvierte));
  const chipSobreDato =
    !chipAmortizarSinPasivo &&
    chipMotor &&
    (chipMotor.kind === "calculado" || chipMotor.kind === "neutro")
      ? chipMotor.sobreDatoIntroducido
      : undefined;

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
      {formError && (
        <div className="err-msg on" style={{ marginBottom: 10 }}>
          {formError}
        </div>
      )}
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
            {menuCompleto ? (
              <span style={{ color: "var(--mute)" }}>
                {" "}
                ·{" "}
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--blue)",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    setElemento(null);
                    setTipo(null);
                    setStep("elemento");
                  }}
                >
                  cambiar
                </button>
              </span>
            ) : null}
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
                onChange={(e) => setAnioClamped(e.target.value)}
              />
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Hasta el año</label>
              <input
                type="number"
                value={hastaAnio}
                onChange={(e) => setHastaClamped(e.target.value)}
              />
            </div>
            <div />
          </div>
          {showTitLinea && <TitLinea texto={titLinea!} />}
          <ChipMotorResult texto={chip} sobreDato={chipSobreDato} />
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
              onChange={(e) => setAnioClamped(e.target.value)}
            />
          </div>
          {showTitLinea && <TitLinea texto={titLinea!} />}
          <ChipMotorResult texto={chip} sobreDato={chipSobreDato} />
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
              onChange={(e) => setAnioClamped(e.target.value)}
            />
          </div>
          <ChipMotorResult texto={chip} sobreDato={chipSobreDato} />
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
                onChange={(e) => setAnioClamped(e.target.value)}
              />
            </div>
          </div>
          <ChipMotorResult texto={chip} sobreDato={chipSobreDato} />
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
                onChange={(e) => setAnioClamped(e.target.value)}
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
                onChange={(e) => setAnioClamped(e.target.value)}
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
          <ChipMotorResult texto={chip} sobreDato={chipSobreDato} />
        </>
      )}

      {step === "form" && tipo === "amortizar_hipoteca" && (
        <>
          {pasivosAmortizar.length > 1 && (
            <div className="field">
              <label className="lbl">Hipoteca</label>
              <select
                value={pasivoTargetId}
                onChange={(e) => {
                  setPasivoTargetId(e.target.value);
                  setFormError(null);
                }}
              >
                <option value="">Elegir hipoteca…</option>
                {pasivosAmortizar.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.prestamista} · {formatEUR(p.capitalPendiente)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {pasivosAmortizar.length === 1 && (
            <div className="tiny" style={{ marginBottom: 8 }}>
              Hipoteca: <b>{pasivosAmortizar[0]!.prestamista}</b> ·{" "}
              {formatEUR(pasivosAmortizar[0]!.capitalPendiente)} pendiente
            </div>
          )}
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
                onChange={(e) => setAnioClamped(e.target.value)}
              />
            </div>
          </div>
          {formError && (
            <div className="err-msg on" style={{ marginBottom: 8 }}>
              {formError}
            </div>
          )}
          <ChipMotorResult texto={chip} sobreDato={chipSobreDato} />
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
                onChange={(e) => setAnioClamped(e.target.value)}
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
          <ChipMotorResult texto={chip} sobreDato={chipSobreDato} />
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
                  onChange={(e) => setAnioClamped(e.target.value)}
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
                onChange={(e) => setAnioClamped(e.target.value)}
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
              <label className="lbl">Año del rescate</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnioClamped(e.target.value)}
              />
            </div>
          </div>
          {modalidad === "capital" && (
            <div className="field">
              <label className="lbl">Año de la contingencia (DT 12ª)</label>
              <input
                type="number"
                value={anioContingencia}
                onChange={(e) => setAnioContingencia(e.target.value)}
              />
              <div className="tiny" style={{ marginTop: 4 }}>
                {(() => {
                  const anioRescate = Number(anio);
                  if (!Number.isFinite(anioRescate)) {
                    return "La reducción 40 % exige comprobar el plazo de la DT 12ª según año de rescate y contingencia.";
                  }
                  return `En ${anioRescate} la reducción 40 % solo cabe si la contingencia es ${anioRescate - 2}, ${anioRescate - 1} o ${anioRescate} (plazo = contingencia + 2 ejercicios).`;
                })()}
              </div>
            </div>
          )}
          <div className="field">
            <label className="lbl">Hasta el año</label>
            <input
              type="number"
              value={hastaAnio}
              onChange={(e) => setHastaClamped(e.target.value)}
            />
          </div>
          <ChipMotorResult texto={chip} sobreDato={chipSobreDato} />
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
                onChange={(e) => setAnioClamped(e.target.value)}
              />
            </div>
          </div>
          <div className="hint-info" style={{ margin: "8px 0" }}>
            <b>ⓘ</b>
            <span>
              La aportación reduce la base liquidable general hasta el límite
              del art. 52 (min. de 1.500 € y 30 % del rendimiento neto del
              trabajo). Si aportas de más, el exceso no reduce la base y se
              avisa. Plan individual · sin incremento empresarial.
            </span>
          </div>
          <ChipMotorResult texto={chip} sobreDato={chipSobreDato} />
        </>
      )}
    </Modal>
  );
}

function ChipMotorResult({
  texto,
  sobreDato,
}: {
  texto: string;
  sobreDato?: string;
}) {
  if (!texto) return null;
  return (
    <>
      <div className="calc-chip" style={{ alignSelf: "flex-start" }}>
        {texto}
      </div>
      {sobreDato ? (
        <div className="intro-chip" style={{ alignSelf: "flex-start" }}>
          ✎ Calculado sobre una {sobreDato}
        </div>
      ) : null}
    </>
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
  anioInicial,
  pensionInicial,
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
  anioInicial?: number;
  pensionInicial?: number;
  /**
   * Si se pasa, se ofrece selector de escenario.
   * F1 Persona no lo pasa: la jubilación de la ficha siempre va al plan base;
   * una hipótesis alternativa se monta desde Escenarios.
   */
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
      anioInicial={anioInicial}
      pensionInicial={pensionInicial}
      escenarios={escenarios}
      escenarioInicialId={escenarioInicialId}
      onCreated={onCreated}
    />
  );
}
