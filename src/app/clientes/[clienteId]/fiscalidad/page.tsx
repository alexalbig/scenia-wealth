"use client";

import { FiscalidadView } from "@/components/fiscalidad/FiscalidadView";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";

export default function FiscalidadPage() {
  const { bag } = useExpediente();
  return <FiscalidadView cliente={bag.cliente} />;
}
