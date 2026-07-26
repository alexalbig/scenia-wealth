import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EscenariosView } from "@/components/escenarios/EscenariosView";
import { getCliente } from "@/lib/seed";

export default async function EscenariosPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const cliente = getCliente(clienteId);
  if (!cliente) notFound();

  return (
    <Suspense
      fallback={<p className="text-[12px] text-mute">Cargando escenarios…</p>}
    >
      <EscenariosView cliente={cliente} />
    </Suspense>
  );
}
