import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PatrimonioView } from "@/components/patrimonio/PatrimonioView";
import { getCliente } from "@/lib/seed";

export default async function PatrimonioPage({
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
        <p className="text-[12px] text-mute">Cargando patrimonio…</p>
      }
    >
      <PatrimonioView cliente={cliente} />
    </Suspense>
  );
}
