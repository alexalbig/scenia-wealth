"use client";

import { HistorialView } from "@/components/historial/HistorialView";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";

export default function HistorialPage() {
  const { bag } = useExpediente();
  return <HistorialView entries={bag.historial ?? []} />;
}
