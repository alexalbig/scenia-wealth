"use client";

import { Suspense } from "react";
import { PatrimonioView } from "@/components/patrimonio/PatrimonioView";

export default function PatrimonioPage() {
  return (
    <Suspense fallback={<p className="tiny">Cargando patrimonio…</p>}>
      <PatrimonioView />
    </Suspense>
  );
}
