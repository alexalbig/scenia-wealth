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
  "mt-1 w-full rounded-[8px] border border-line-2 bg-white px-2.5 py-2 text-[12.5px] text-ink outline-none focus:border-ink";

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

  const eyebrow =
    step === "menu"
      ? `Nuevo evento · ${elementoNombre}`
      : "Describir el evento";
  const titulo =
    step === "menu"
      ? "¿Qué decisión?"
      : (opciones.find((o) => o.tipo === tipo)?.label ?? "Evento");

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow={eyebrow}
      title={titulo}
      size="lg"
      footer={
        step === "menu" ? (
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setStep("menu");
                setResultado(null);
              }}
            >
              ‹ Atrás
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
      {escenarios && escenarios.length > 0 && (
        <label className="block">
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
        <>
          <p className="text-[11px] text-mute">
            Elemento: <b className="font-semibold text-ink">{elementoNombre}</b>
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {opciones.map((ev) => (
              <button
                key={ev.tipo}
                type="button"
                className={cn(
                  "rounded-[8px] border border-line-2 bg-white px-3 py-2.5 text-left",
                  "text-[12px] font-semibold text-ink",
                  "hover:border-ink-3 hover:bg-paper-2",
                )}
                onClick={() => pickTipo(ev.tipo)}
              >
                {ev.label}
                <span className="mt-0.5 block text-[10.5px] font-medium text-mute">
                  El asesor describe; el motor calcula
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-mute">
            Menú completo: el escenario es del cliente, no de un activo.
          </p>
        </>
      )}

      {step === "form" && tipo && (
        <div className="space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
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
          </div>

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
            <div>
              <span className="label-upper mb-1.5 block">Modalidad</span>
              <div className="flex flex-wrap gap-2">
                {(["capital", "renta", "mixto"] as const).map((m) => (
                  <label
                    key={m}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-line-2 bg-white px-2.5 py-1.5 text-[12px] font-semibold capitalize",
                      modalidad === m && "border-ink bg-paper-2",
                    )}
                  >
                    <input
                      type="radio"
                      className="accent-ink"
                      checked={modalidad === m}
                      onChange={() => setModalidad(m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
          )}

          {tipo === "vender_inmueble" && (
            <label className="inline-flex items-center gap-1.5 text-[12px] text-ink">
              <input
                type="checkbox"
                className="accent-ink"
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
              <span className="intro-chip mt-2">
                ✎ Pensión introducida por el asesor · no calculada
              </span>
            </label>
          )}

          {(tipo === "generico" || tipo === "aportar_plan") && (
            <label className="block">
              <span className="label-upper">
                Impacto fiscal estimado (opcional)
              </span>
              <input
                type="number"
                className={fieldClass}
                value={impactoManual}
                onChange={(e) => setImpactoManual(e.target.value)}
              />
              <span className="intro-chip mt-2">
                ✎ Si tecleas un impacto fiscal, se marcará «introducido por el
                asesor, no calculado»
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
      <div className="rounded-[8px] border border-dashed border-line-2 bg-paper-2 px-3 py-2.5">
        <span className="inline-flex items-center rounded-[6px] border border-line-2 bg-paper-2 px-2 py-0.5 text-[10.5px] font-semibold text-slate">
          Sin cálculo · liquidador de IS pendiente de definir
        </span>
        <p className="mt-1.5 text-[11px] text-mute">{resultado.nota}</p>
      </div>
    );
  }

  if (resultado.kind === "sin_calculo") {
    return (
      <span className="intro-chip self-start">
        ✎ {resultado.nota}
      </span>
    );
  }

  // calculado | neutro — cifra del motor (aspecto distinto a introducido)
  return (
    <div className="flex flex-col gap-1.5">
      <span className="calc-chip self-start">
        {resultado.regla} · {formatEUR(resultado.importe, true)} · orientativo
      </span>
      <p className="text-[11px] text-mute">{resultado.nota}</p>
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
