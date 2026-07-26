import { notFound } from "next/navigation";
import { FiscalidadView } from "@/components/fiscalidad/FiscalidadView";
import { getCliente } from "@/lib/seed";

export default async function FiscalidadPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const cliente = getCliente(clienteId);
  if (!cliente) notFound();

  return <FiscalidadView cliente={cliente} />;
}
