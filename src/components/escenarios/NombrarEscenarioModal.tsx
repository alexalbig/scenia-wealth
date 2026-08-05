"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "@/components/ui";

/**
 * Pide el nombre en el mismo gesto al clonar / duplicar un escenario.
 */
export function NombrarEscenarioModal({
  open,
  onClose,
  titulo,
  nombrePropuesto,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  titulo: string;
  nombrePropuesto: string;
  onConfirm: (nombre: string) => void;
}) {
  const [nombre, setNombre] = useState(nombrePropuesto);

  useEffect(() => {
    if (!open) return;
    setNombre(nombrePropuesto);
  }, [open, nombrePropuesto]);

  function handleConfirm() {
    const n = nombre.trim();
    if (!n) return;
    onConfirm(n);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Escenario"
      title={titulo}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            disabled={!nombre.trim()}
            onClick={handleConfirm}
          >
            Crear
          </Button>
        </>
      }
    >
      <div className="field">
        <label className="lbl">Nombre</label>
        <input
          type="text"
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
          }}
        />
        <div className="tiny" style={{ marginTop: 6 }}>
          El clon hereda los eventos del origen — jubilaciones y línea temporal
          incluidas.
        </div>
      </div>
    </Modal>
  );
}
