import { notFound } from "next/navigation";
import { HistorialView } from "@/components/historial/HistorialView";
import { getCliente, getHistorialDeCliente } from "@/lib/seed";

export default async function HistorialPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const cliente = getCliente(clienteId);
  if (!cliente) notFound();

  const entries = getHistorialDeCliente(clienteId);

  return <HistorialView entries={entries} />;
}
