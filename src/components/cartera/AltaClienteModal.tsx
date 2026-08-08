"use client";

import { useMemo, useState } from "react";
import { Button, Modal } from "@/components/ui";
import {
  CCAAS,
  CCAA_CON_COBERTURA_FISCAL,
  type CCAA,
  type Segmento,
} from "@/lib/types";
import { avisoCoberturaCcaa } from "@/lib/fiscal";

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
}

interface AltaClienteModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (payload: {
    nombre: string;
    segmento: Segmento;
    ccaa: CCAA;
    personas: Array<PersonaDraft & { ccaa: CCAA }>;
  }) => void;
}

function emptyPersona(): PersonaDraft {
  return {
    id: `draft-${Math.random().toString(36).slice(2, 9)}`,
    nombre: "",
    birthDate: "",
  };
}

/**
 * P2 · Alta de cliente — composición del mockup (`ov-alta`).
 * Personas: nombre + nacimiento. Segmento + CCAA del expediente en `.grid2`.
 */
export function AltaClienteModal({
  open,
  onClose,
  onCreated,
}: AltaClienteModalProps) {
  const [nombre, setNombre] = useState("");
  const [segmento, setSegmento] = useState<Segmento>("Pre-jubilado");
  const [ccaa, setCcaa] = useState<CCAA>(CCAA_CON_COBERTURA_FISCAL);
  const [personas, setPersonas] = useState<PersonaDraft[]>([emptyPersona()]);
  const [submitted, setSubmitted] = useState(false);

  const hasNonCv = ccaa !== CCAA_CON_COBERTURA_FISCAL;

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!nombre.trim()) e.push("nombre");
    const validas = personas.filter((p) => p.nombre.trim() && p.birthDate);
    if (validas.length === 0) e.push("personas");
    return e;
  }, [nombre, personas]);

  function reset() {
    setNombre("");
    setSegmento("Pre-jubilado");
    setCcaa(CCAA_CON_COBERTURA_FISCAL);
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
    const validas = personas
      .filter((p) => p.nombre.trim() && p.birthDate)
      .map((p) => ({ ...p, ccaa }));
    onCreated?.({
      nombre: nombre.trim(),
      segmento,
      ccaa,
      personas: validas,
    });
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
      eyebrow="Nuevo cliente"
      title="Alta de cliente"
      footer={
        <>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>
            Crear cliente
          </Button>
        </>
      }
    >
      <div className="field">
        <label className="lbl">Nombre del expediente *</label>
        <input
          type="text"
          placeholder="Ej.: Familia Pérez Soler"
          className={submitted && errors.includes("nombre") ? "err" : undefined}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        {submitted && errors.includes("nombre") && (
          <div className="err-msg on">
            El nombre del expediente es obligatorio.
          </div>
        )}
      </div>

      <div>
        <label className="lbl" style={{ display: "block", marginBottom: 6 }}>
          Personas del expediente *
        </label>
        {personas.map((p) => (
          <div key={p.id} className="grid2" style={{ marginBottom: 8 }}>
            <div className="field">
              <input
                type="text"
                placeholder="Nombre y apellidos"
                className={
                  submitted &&
                  errors.includes("personas") &&
                  !p.nombre.trim()
                    ? "err"
                    : undefined
                }
                value={p.nombre}
                onChange={(e) =>
                  updatePersona(p.id, { nombre: e.target.value })
                }
              />
            </div>
            <div className="field">
              <input
                type="date"
                aria-label="Fecha de nacimiento"
                className={
                  submitted &&
                  errors.includes("personas") &&
                  !p.birthDate
                    ? "err"
                    : undefined
                }
                value={p.birthDate}
                onChange={(e) =>
                  updatePersona(p.id, { birthDate: e.target.value })
                }
              />
            </div>
          </div>
        ))}
        <div className="tiny" style={{ marginBottom: 8 }}>
          La fecha de nacimiento es necesaria para calcular edades y plazos
          fiscales.
        </div>
        <Button
          size="sm"
          onClick={() => setPersonas((prev) => [...prev, emptyPersona()])}
        >
          + Añadir persona
        </Button>
        {submitted && errors.includes("personas") && (
          <div className="err-msg on">
            Añade al menos una persona con nombre y fecha de nacimiento.
          </div>
        )}
      </div>

      <div className="grid2">
        <div className="field">
          <label className="lbl">Segmento</label>
          <select
            value={segmento}
            onChange={(e) => setSegmento(e.target.value as Segmento)}
          >
            {SEGMENTOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="lbl">Comunidad autónoma</label>
          <select
            value={ccaa}
            onChange={(e) => setCcaa(e.target.value as CCAA)}
          >
            {CCAAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasNonCv && (
        <div className="hint-info" role="alert">
          <b>ⓘ</b>
          <span>{avisoCoberturaCcaa(ccaa)}</span>
        </div>
      )}

      <div className="tiny">
        Alta mínima: el nombre del expediente y una persona con fecha de
        nacimiento son obligatorios. El patrimonio se completa después, por
        capas.
      </div>
    </Modal>
  );
}
