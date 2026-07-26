"use client";

import { useMemo, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { formatEUR } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  eventosParaContexto,
  simularMotorEvento,
  type ResultadoFiscalMotor,
} from "@/lib/escenarios";
import type { TipoEvento } from "@/lib/types";

export type EventoContexto =
  | "instrumento"
  | "inmueble"
  | "pasivo"
  | "sociedad"
  | "otro"
  | "ingreso"
  | "gasto"
  | "completo";

export interface EventoCreadoPayload {
  tipo: TipoEvento;
  etiqueta: string;
  anio: number;
  impuestosPeriodo?: number;
  introducidoPorAsesor?: boolean;
  notas?: string;
  escenarioId?: string;
}

interface PlantillaEventoProps {
  open: boolean;
  onClose: () => void;
  contexto: EventoContexto;
  elementoNombre: string;
  /** Escenarios a los que puede ir el evento (atajo desde ficha) */
  escenarios?: Array<{ id: string; nombre: string }>;
  escenarioInicialId?: string;
  onCreated?: (payload: EventoCreadoPayload) => void;
}

const fieldClass =
  "mt-1 w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-blue";

/**
 * CT1 · Plantilla de evento
 * El asesor describe 2–3 campos; el motor calcula. Nunca teclea un tipo impositivo.
 */
export function PlantillaEvento({
  open,
  onClose,
  contexto,
  elementoNombre,
  escenarios,
  escenarioInicialId,
  onCreated,
}: PlantillaEventoProps) {
  const opciones = useMemo(() => eventosParaContexto(contexto), [contexto]);
  const [step, setStep] = useState<"menu" | "form">("menu");
  const [tipo, setTipo] = useState<TipoEvento | null>(null);
  const [anio, setAnio] = useState("2026");
  const [importe, setImporte] = useState("");
  const [destino, setDestino] = useState("");
  const [modalidad, setModalidad] = useState<"capital" | "renta" | "mixto">(
    "mixto",
  );
  const [reinvierte, setReinvierte] = useState(false);
  const [pension, setPension] = useState("");
  const [impactoManual, setImpactoManual] = useState("");
  const [escenarioId, setEscenarioId] = useState(escenarioInicialId ?? "");
  const [resultado, setResultado] = useState<ResultadoFiscalMotor | null>(null);

  function reset() {
    setStep("menu");
    setTipo(null);
    setAnio("2026");
    setImporte("");
    setDestino("");
    setModalidad("mixto");
    setReinvierte(false);
    setPension("");
    setImpactoManual("");
    setEscenarioId(escenarioInicialId ?? "");
    setResultado(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function pickTipo(t: TipoEvento) {
    setTipo(t);
    setStep("form");
    setResultado(null);
  }

  function calcular() {
    if (!tipo) return;
    const year = Number(anio);
    if (!Number.isFinite(year)) return;
    const res = simularMotorEvento(tipo, {
      importe: Number(importe) || 0,
      anio: year,
      destino,
      modalidad,
      reinvierte,
      pension: Number(pension) || 0,
      impactoManual: Number(impactoManual) || 0,
    });
    setResultado(res);
  }

  function confirmar() {
    if (!tipo || !resultado) return;
    const year = Number(anio);
    const label = opciones.find((o) => o.tipo === tipo)?.label ?? tipo;
    const introducido =
      tipo === "jubilarse" ||
      tipo === "generico" ||
      (impactoManual.trim() !== "" && resultado.kind === "sin_calculo");

    let impuestos: number | undefined;
    if (resultado.kind === "calculado" || resultado.kind === "neutro") {
      impuestos = resultado.importe;
    } else if (introducido && impactoManual.trim()) {
      impuestos = Number(impactoManual);
    }

    onCreated?.({
      tipo,
      etiqueta: `${label} · ${elementoNombre}`,
      anio: year,
      impuestosPeriodo: impuestos,
      introducidoPorAsesor: introducido || undefined,
      notas: resultado.nota,
      escenarioId: escenarioId || undefined,
    });
    handleClose();
  }

  const titulo =
    step === "menu" ? "Plantilla de evento" : "Describir el evento";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={titulo}
      size="lg"
      footer={
        step === "menu" ? (
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => { setStep("menu"); setResultado(null); }}>
              ← Menú
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            {!resultado ? (
              <Button onClick={calcular}>Calcular</Button>
            ) : (
              <Button onClick={confirmar}>Añadir al escenario</Button>
            )}
          </>
        )
      }
    >
      <p className="mb-3 text-[12px] text-mute">
        Sobre <span className="font-semibold text-ink">{elementoNombre}</span>.
        El asesor describe; el motor calcula. Nunca se teclea un tipo impositivo.
      </p>

      {escenarios && escenarios.length > 0 && (
        <label className="mb-3 block">
          <span className="label-upper">Escenario destino</span>
          <select
            className={fieldClass}
            value={escenarioId}
            onChange={(e) => setEscenarioId(e.target.value)}
          >
            <option value="">Elegir escenario…</option>
            {escenarios.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </label>
      )}

      {step === "menu" && (
        <ul className="space-y-1.5">
          {opciones.map((ev) => (
            <li key={ev.tipo}>
              <button
                type="button"
                className="w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-left text-[13px] font-semibold text-ink hover:border-blue hover:text-blue"
                onClick={() => pickTipo(ev.tipo)}
              >
                {ev.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {step === "form" && tipo && (
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-ink">
            {opciones.find((o) => o.tipo === tipo)?.label}
          </p>

          <label className="block">
            <span className="label-upper">Año</span>
            <input
              type="number"
              className={fieldClass}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
          </label>

          {(tipo === "reembolsar_fondo" ||
            tipo === "pignorar" ||
            tipo === "aportar_fondo" ||
            tipo === "rescatar_plan" ||
            tipo === "amortizar_hipoteca" ||
            tipo === "vender_inmueble" ||
            tipo === "comprar_inmueble" ||
            tipo === "repartir_dividendo" ||
            tipo === "vender_participacion" ||
            tipo === "aportar_plan") && (
            <label className="block">
              <span className="label-upper">Importe (€)</span>
              <input
                type="number"
                className={fieldClass}
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                placeholder="Importe"
              />
            </label>
          )}

          {tipo === "traspasar_fondo" && (
            <label className="block">
              <span className="label-upper">Fondo destino</span>
              <input
                className={fieldClass}
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Nombre del fondo destino"
              />
            </label>
          )}

          {tipo === "rescatar_plan" && (
            <label className="block">
              <span className="label-upper">Modalidad</span>
              <select
                className={fieldClass}
                value={modalidad}
                onChange={(e) =>
                  setModalidad(e.target.value as "capital" | "renta" | "mixto")
                }
              >
                <option value="capital">Capital</option>
                <option value="renta">Renta</option>
                <option value="mixto">Mixto</option>
              </select>
            </label>
          )}

          {tipo === "vender_inmueble" && (
            <label className="flex items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={reinvierte}
                onChange={(e) => setReinvierte(e.target.checked)}
              />
              ¿Reinversión en renta vitalicia?
            </label>
          )}

          {tipo === "jubilarse" && (
            <label className="block">
              <span className="label-upper">Pensión estimada (€ / año)</span>
              <input
                type="number"
                className={fieldClass}
                value={pension}
                onChange={(e) => setPension(e.target.value)}
              />
              <span className="mt-1 block text-[11px] text-mute">
                Introducido por el asesor, no calculado
              </span>
            </label>
          )}

          {(tipo === "generico" || tipo === "aportar_plan") && (
            <label className="block">
              <span className="label-upper">
                Impacto fiscal (opcional, si lo teclea el asesor)
              </span>
              <input
                type="number"
                className={fieldClass}
                value={impactoManual}
                onChange={(e) => setImpactoManual(e.target.value)}
              />
              <span className="mt-1 block text-[11px] text-mute">
                Si se rellena, se marca «introducido por el asesor, no calculado»
              </span>
            </label>
          )}

          {resultado && <ResultadoPanel resultado={resultado} />}
        </div>
      )}
    </Modal>
  );
}

function ResultadoPanel({ resultado }: { resultado: ResultadoFiscalMotor }) {
  if (resultado.kind === "pendiente_is") {
    return (
      <div className="rounded-[8px] border border-dashed border-line-2 bg-paper-2 px-3 py-3">
        <p className="label-upper mb-1">Impuesto de Sociedades</p>
        <p className="text-[13px] font-semibold text-ink">
          Pendiente de definir
        </p>
        <p className="mt-1 text-[12px] text-mute">{resultado.nota}</p>
      </div>
    );
  }

  if (resultado.kind === "sin_calculo") {
    return (
      <div className="rounded-[8px] border border-line-2 bg-paper-2 px-3 py-3">
        <p className="label-upper mb-1">Sin cálculo del motor</p>
        <p className="text-[12px] text-slate">{resultado.nota}</p>
      </div>
    );
  }

  // calculado | neutro — cifra del motor (aspecto distinto a introducido)
  return (
    <div className="rounded-[8px] border border-line-2 bg-ink-2 px-3 py-3 text-dark-text">
      <p className="label-upper !text-faint mb-1">
        {resultado.regla} · calculado por el motor
      </p>
      <p className="text-[22px] font-bold tracking-[-0.02em] tabular-nums">
        {formatEUR(resultado.importe, true)}
      </p>
      <p className="mt-1 text-[11px] text-faint">{resultado.nota}</p>
      <p className="mt-2 text-[10.5px] uppercase tracking-[0.06em] text-mute">
        orientativo
      </p>
    </div>
  );
}

/** Compatibilidad: menú corto usado desde fichas. */
export function EventoModal({
  open,
  onClose,
  contexto,
  elementoNombre,
}: {
  open: boolean;
  onClose: () => void;
  contexto: Exclude<EventoContexto, "completo">;
  elementoNombre: string;
}) {
  return (
    <PlantillaEvento
      open={open}
      onClose={onClose}
      contexto={contexto}
      elementoNombre={elementoNombre}
    />
  );
}
