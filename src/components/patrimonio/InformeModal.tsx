"use client";

import { useState } from "react";
import { Button, Modal } from "@/components/ui";

/**
 * CT3 · Informe — nota del asesor obligatoria antes de generar el PDF.
 * Firewall: todo documento con marca del despacho lleva conclusión humana.
 */
export function InformeModal({
  open,
  onClose,
  titulo = "Informe de la foto patrimonial",
  datosAFecha,
}: {
  open: boolean;
  onClose: () => void;
  titulo?: string;
  datosAFecha: string;
}) {
  const [nota, setNota] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setNota("");
    setSubmitted(false);
    setDone(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleGenerate() {
    setSubmitted(true);
    if (!nota.trim()) return;
    setDone(true);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={titulo}
      footer={
        done ? (
          <Button onClick={handleClose}>Cerrar</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate}>Generar PDF</Button>
          </>
        )
      }
    >
      {done ? (
        <div className="space-y-2 text-[13px]">
          <p className="font-semibold text-ink">Informe anotado en Historial</p>
          <p className="text-slate">
            Mockup: no se genera un PDF real. La nota del asesor queda registrada
            con el sello del despacho.
          </p>
          <p className="label-upper mt-3">Sello</p>
          <p className="text-[12px] text-mute">
            Datos a fecha de {datosAFecha} · cálculo orientativo, no asesoramiento
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[12px] text-mute">
            Antes de emitir el documento, escribe tu conclusión. Es obligatorio:
            la marca del despacho no sale sin ella.
          </p>
          <label className="block">
            <span className="label-upper">Nota del asesor</span>
            <textarea
              rows={4}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Conclusión para el cliente…"
              className={`mt-1 w-full rounded-[8px] border bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-blue ${
                submitted && !nota.trim()
                  ? "border-coral-deep"
                  : "border-line-2"
              }`}
            />
            {submitted && !nota.trim() && (
              <p className="mt-1 text-[11px] text-coral-deep">
                La nota del asesor es obligatoria
              </p>
            )}
          </label>
        </div>
      )}
    </Modal>
  );
}
