import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProyeccionView } from "@/components/proyeccion/ProyeccionView";
import { getCliente } from "@/lib/seed";

export default async function ProyeccionPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const cliente = getCliente(clienteId);
  if (!cliente) notFound();

  return (
    <Suspense
      fallback={
        <p className="text-[12px] text-mute">Cargando proyección…</p>
      }
    >
      <ProyeccionView cliente={cliente} />
    </Suspense>
  );
}
