"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Toast } from "@/components/ui";

/**
 * CT3 · Informe — marcado literal del mockup.
 * Firewall 4: nota del asesor obligatoria antes de generar.
 */
export function InformeModal({
  open,
  onClose,
  titulo = "Informe de la foto patrimonial",
  tituloInformeDefault,
  datosAFecha,
  tipoInforme = "Foto del patrimonio",
  notaInicial,
  onGenerated,
}: {
  open: boolean;
  onClose: () => void;
  titulo?: string;
  /** Valor inicial del campo «Título del informe» */
  tituloInformeDefault?: string;
  datosAFecha: string;
  /** Tipo de informe registrado en el Historial (P7) */
  tipoInforme?: string;
  /** Nota precargada (p. ej. la del comparador P6). */
  notaInicial?: string;
  /** Se llama al generar con éxito, antes del toast — para registrar en Historial */
  onGenerated?: (info: { titulo: string; tipo: string }) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [nota, setNota] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNombre(
      tituloInformeDefault ??
        `Foto patrimonial · ${datosAFecha}`,
    );
    setNota(notaInicial ?? "");
    setSubmitted(false);
  }, [open, tituloInformeDefault, datosAFecha, notaInicial]);

  function handleClose() {
    setNota("");
    setSubmitted(false);
    onClose();
  }

  function handleGenerate() {
    setSubmitted(true);
    if (!nota.trim()) return;
    onGenerated?.({ titulo: nombre.trim() || tituloInformeDefault || titulo, tipo: tipoInforme });
    setToast("Informe generado con tu Nota · disponible en el Historial");
    window.setTimeout(() => {
      setToast(null);
      handleClose();
    }, 1800);
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        eyebrow="Informe"
        title={titulo}
        footer={
          <>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button variant="primary" onClick={handleGenerate}>
              Generar informe
            </Button>
          </>
        }
      >
        <div className="field">
          <label className="lbl">Título del informe</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="lbl">Nota del asesor · obligatoria</label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className={submitted && !nota.trim() ? "err" : undefined}
            placeholder="Tu conclusión profesional. Scenia muestra el cálculo; la conclusión es tuya y firma el informe."
          />
          <div
            className={submitted && !nota.trim() ? "err-msg on" : "err-msg"}
          >
            La Nota del asesor es obligatoria para generar el informe.
          </div>
        </div>
        <div className="tiny">
          El PDF incluirá la marca del despacho, el sello{" "}
          <b>«cálculo orientativo, no asesoramiento»</b> y el sello{" "}
          <b>
            «datos a fecha de {datosAFecha}»
          </b>
          .
        </div>
      </Modal>
      <Toast message={toast} />
    </>
  );
}
