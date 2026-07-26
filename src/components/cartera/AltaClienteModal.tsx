"use client";

import { useMemo, useState } from "react";
import { Button, Modal } from "@/components/ui";
import {
  CCAAS,
  CCAA_CON_COBERTURA_FISCAL,
  type CCAA,
  type Segmento,
} from "@/lib/types";
import { cn } from "@/lib/cn";

const SEGMENTOS: Segmento[] = [
  "Empresario",
  "Pre-jubilado",
  "Jubilado",
  "Alto ingreso",
  "Herencia en curso",
];

interface PersonaDraft {
  id: string;
  nombre: string;
  birthDate: string;
  ccaa: CCAA;
}

interface AltaClienteModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (payload: {
    nombre: string;
    segmento: Segmento;
    personas: PersonaDraft[];
  }) => void;
}

function emptyPersona(
  ccaa: CCAA = CCAA_CON_COBERTURA_FISCAL,
): PersonaDraft {
  return {
    id: `draft-${Math.random().toString(36).slice(2, 9)}`,
    nombre: "",
    birthDate: "",
    ccaa,
  };
}

const fieldClass =
  "mt-1 w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-blue";

/**
 * P2 · Alta de cliente — modal de baja fricción (capa 1).
 * Obligatorio: nombre del expediente + una Persona (nombre, nacimiento, CCAA).
 */
export function AltaClienteModal({
  open,
  onClose,
  onCreated,
}: AltaClienteModalProps) {
  const [nombre, setNombre] = useState("");
  const [segmento, setSegmento] = useState<Segmento>("Pre-jubilado");
  const [personas, setPersonas] = useState<PersonaDraft[]>([emptyPersona()]);
  const [submitted, setSubmitted] = useState(false);

  const hasNonCv = personas.some(
    (p) => p.ccaa !== CCAA_CON_COBERTURA_FISCAL,
  );

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!nombre.trim()) e.push("nombre");
    if (!personas[0]?.nombre.trim()) e.push("persona-nombre");
    if (!personas[0]?.birthDate) e.push("persona-nacimiento");
    if (!personas[0]?.ccaa) e.push("persona-ccaa");
    return e;
  }, [nombre, personas]);

  function reset() {
    setNombre("");
    setSegmento("Pre-jubilado");
    setPersonas([emptyPersona()]);
    setSubmitted(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    setSubmitted(true);
    if (errors.length > 0) return;
    onCreated?.({ nombre: nombre.trim(), segmento, personas });
    handleClose();
  }

  function updatePersona(id: string, patch: Partial<PersonaDraft>) {
    setPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nuevo cliente"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Crear cliente</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-[12px] text-mute">
          Alta mínima (~30 s). El resto se rellena después, por capas.
        </p>

        <label className="block">
          <span className="label-upper">Nombre del expediente</span>
          <input
            className={cn(
              fieldClass,
              submitted && errors.includes("nombre") && "border-coral-deep",
            )}
            placeholder="Ej: Familia García-Llorente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          {submitted && errors.includes("nombre") && (
            <p className="mt-1 text-[11px] text-coral-deep">Obligatorio</p>
          )}
        </label>

        <label className="block">
          <span className="label-upper">Segmento</span>
          <select
            className={fieldClass}
            value={segmento}
            onChange={(e) => setSegmento(e.target.value as Segmento)}
          >
            {SEGMENTOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="label-upper">Personas</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setPersonas((prev) => [
                  ...prev,
                  emptyPersona(prev[0]?.ccaa ?? CCAA_CON_COBERTURA_FISCAL),
                ])
              }
            >
              + Añadir persona
            </Button>
          </div>

          {personas.map((p, idx) => (
            <div
              key={p.id}
              className="rounded-[8px] border border-line-2 bg-paper-2 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-ink-3">
                  Persona {idx + 1}
                  {idx === 0 ? " · obligatoria" : ""}
                </p>
                {personas.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setPersonas((prev) => prev.filter((x) => x.id !== p.id))
                    }
                  >
                    Quitar
                  </Button>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <label className="block sm:col-span-1">
                  <span className="label-upper">Nombre</span>
                  <input
                    className={cn(
                      fieldClass,
                      submitted &&
                        idx === 0 &&
                        errors.includes("persona-nombre") &&
                        "border-coral-deep",
                    )}
                    value={p.nombre}
                    onChange={(e) =>
                      updatePersona(p.id, { nombre: e.target.value })
                    }
                  />
                </label>
                <label className="block">
                  <span className="label-upper">Nacimiento</span>
                  <input
                    type="date"
                    className={cn(
                      fieldClass,
                      submitted &&
                        idx === 0 &&
                        errors.includes("persona-nacimiento") &&
                        "border-coral-deep",
                    )}
                    value={p.birthDate}
                    onChange={(e) =>
                      updatePersona(p.id, { birthDate: e.target.value })
                    }
                  />
                </label>
                <label className="block">
                  <span className="label-upper">CCAA</span>
                  <select
                    className={fieldClass}
                    value={p.ccaa}
                    onChange={(e) =>
                      updatePersona(p.id, {
                        ccaa: e.target.value as CCAA,
                      })
                    }
                  >
                    {CCAAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>

        {hasNonCv && (
          <div
            role="alert"
            className="rounded-[8px] border border-line-2 bg-paper-2 px-3 py-2.5 text-[12px] text-ink"
          >
            El cálculo fiscal solo está disponible para la Comunitat Valenciana.
          </div>
        )}
      </div>
    </Modal>
  );
}
