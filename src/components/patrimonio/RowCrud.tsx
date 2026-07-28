"use client";

import { Button } from "@/components/ui";

/** Acciones de fila: editar / eliminar — discretas frente a ⚡ Evento. */
export function RowCrud({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <span
      style={{ display: "inline-flex", gap: 4, alignItems: "center" }}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        Editar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm("¿Eliminar este elemento?")) onDelete();
        }}
      >
        Eliminar
      </Button>
    </span>
  );
}
