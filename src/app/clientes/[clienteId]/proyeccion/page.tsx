"use client";

import { Suspense } from "react";
import { ProyeccionView } from "@/components/proyeccion/ProyeccionView";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";

export default function ProyeccionPage() {
  const { bag } = useExpediente();
  return (
    <Suspense fallback={<p className="tiny">Cargando proyección…</p>}>
      <ProyeccionView cliente={bag.cliente} />
    </Suspense>
  );
}
