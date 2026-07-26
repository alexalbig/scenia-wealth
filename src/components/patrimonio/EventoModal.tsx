"use client";

import { Button, Modal } from "@/components/ui";

const EVENTOS_POR_CONTEXTO: Record<string, string[]> = {
  instrumento: ["Reembolsar fondo", "Traspasar fondo", "Pignorar", "Aportar a fondo", "Rescatar plan"],
  inmueble: ["Comprar inmueble", "Vender inmueble", "Amortizar hipoteca"],
  pasivo: ["Amortizar hipoteca", "Evento genérico"],
  sociedad: ["Repartir dividendo", "Vender participación"],
  otro: ["Vender (genérico, sin cálculo fiscal)"],
  ingreso: ["Evento genérico (sin cálculo fiscal)"],
  gasto: ["Evento genérico (sin cálculo fiscal)"],
};

/**
 * CT1 · Plantilla de evento (stub MVP).
 * Lista los eventos posibles; el formulario completo llega con el motor.
 */
export function EventoModal({
  open,
  onClose,
  contexto,
  elementoNombre,
}: {
  open: boolean;
  onClose: () => void;
  contexto: keyof typeof EVENTOS_POR_CONTEXTO;
  elementoNombre: string;
}) {
  const eventos = EVENTOS_POR_CONTEXTO[contexto] ?? ["Evento genérico"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Plantilla de evento"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <p className="mb-3 text-[12px] text-mute">
        Sobre <span className="font-semibold text-ink">{elementoNombre}</span>.
        Elige un evento; el asesor describe 2–3 campos y el motor calcula
        (nunca teclea un tipo impositivo).
      </p>
      <ul className="space-y-1.5">
        {eventos.map((ev) => (
          <li key={ev}>
            <button
              type="button"
              className="w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-left text-[13px] font-semibold text-ink hover:border-blue hover:text-blue"
              onClick={onClose}
            >
              {ev}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
