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
      eyebrow="Informe"
      title={titulo}
      footer={
        done ? (
          <Button onClick={handleClose}>Cerrar</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate}>Generar informe</Button>
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
          <p className="sello mt-2">
            Datos a fecha de <b>{datosAFecha}</b> · cálculo orientativo, no
            asesoramiento
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <span className="label-upper">Nota del asesor · obligatoria</span>
            <textarea
              rows={4}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Tu conclusión profesional. Scenia muestra el cálculo; la conclusión es tuya y firma el informe."
              className={`mt-1 w-full resize-y rounded-[8px] border bg-white px-2.5 py-2 text-[12.5px] text-ink outline-none focus:border-ink ${
                submitted && !nota.trim()
                  ? "border-coral-deep"
                  : "border-line-2"
              }`}
            />
            {submitted && !nota.trim() && (
              <p className="mt-1 text-[11px] font-semibold text-coral-deep">
                La Nota del asesor es obligatoria para generar el informe.
              </p>
            )}
          </label>
          <p className="text-[11px] text-mute">
            El PDF incluirá la marca del despacho, el sello{" "}
            <b className="font-semibold text-ink-3">
              «cálculo orientativo, no asesoramiento»
            </b>{" "}
            y el sello{" "}
            <b className="font-semibold text-ink-3">
              «datos a fecha de {datosAFecha}»
            </b>
            .
          </p>
        </div>
      )}
    </Modal>
  );
}
