"use client";

import { Suspense } from "react";
import { EscenariosView } from "@/components/escenarios/EscenariosView";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";

export default function EscenariosPage() {
  const { bag } = useExpediente();
  return (
    <Suspense fallback={<p className="tiny">Cargando escenarios…</p>}>
      <EscenariosView cliente={bag.cliente} />
    </Suspense>
  );
}
