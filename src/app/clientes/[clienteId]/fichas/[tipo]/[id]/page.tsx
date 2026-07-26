import Link from "next/link";
import { notFound } from "next/navigation";
import { InmuebleFicha } from "@/components/fichas/InmuebleFicha";
import { OtroActivoFicha } from "@/components/fichas/OtroActivoFicha";
import { PersonaFicha } from "@/components/fichas/PersonaFicha";
import { PortfolioFicha } from "@/components/fichas/PortfolioFicha";
import { SociedadFicha } from "@/components/fichas/SociedadFicha";
import { Card } from "@/components/ui";
import {
  getInmuebles,
  getInstrumentos,
  getOtrosActivos,
  getPasivos,
  getSociedades,
} from "@/lib/patrimonio";
import { getCliente, getPersonasDeCliente } from "@/lib/seed";

const LABELS: Record<string, string> = {
  persona: "F1 · Persona",
  portfolio: "F2 · Portfolio",
  inmueble: "F3 · Inmueble",
  sociedad: "F4 · Sociedad",
  otro: "F5 · Otros activos",
};

export default async function FichaPage({
  params,
}: {
  params: Promise<{ clienteId: string; tipo: string; id: string }>;
}) {
  const { clienteId, tipo, id } = await params;
  const cliente = getCliente(clienteId);
  if (!cliente) notFound();

  const personas = getPersonasDeCliente(clienteId);

  if (tipo === "persona") {
    const persona = personas.find((p) => p.id === id);
    if (!persona) notFound();
    return <PersonaFicha clienteId={clienteId} persona={persona} />;
  }

  if (tipo === "portfolio") {
    const instrumentos = getInstrumentos(clienteId);
    const instrumento = instrumentos.find((i) => i.id === id);
    if (!instrumento) notFound();
    return (
      <PortfolioFicha
        clienteId={clienteId}
        instrumento={instrumento}
        instrumentos={instrumentos}
      />
    );
  }

  if (tipo === "inmueble") {
    const inmueble = getInmuebles(clienteId).find((i) => i.id === id);
    if (!inmueble) notFound();
    const pasivo = inmueble.pasivoId
      ? getPasivos(clienteId).find((p) => p.id === inmueble.pasivoId)
      : undefined;
    return (
      <InmuebleFicha
        clienteId={clienteId}
        inmueble={inmueble}
        pasivo={pasivo}
        personas={personas}
      />
    );
  }

  if (tipo === "sociedad") {
    const sociedad = getSociedades(clienteId).find((s) => s.id === id);
    if (!sociedad) notFound();
    return (
      <SociedadFicha
        clienteId={clienteId}
        sociedad={sociedad}
        personas={personas}
        instrumentos={getInstrumentos(clienteId)}
        inmuebles={getInmuebles(clienteId)}
      />
    );
  }

  if (tipo === "otro") {
    const activo = getOtrosActivos(clienteId).find((a) => a.id === id);
    if (!activo) notFound();
    return (
      <OtroActivoFicha
        clienteId={clienteId}
        activo={activo}
        personas={personas}
      />
    );
  }

  const label = LABELS[tipo] ?? "Ficha";

  return (
    <Card>
      <p className="label-upper mb-1">{label}</p>
      <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
        Ficha · {id}
      </h2>
      <p className="mt-2 text-[13px] text-slate">
        Drill-down desde Patrimonio. El detalle de la ficha se construye en una
        fase posterior; la navegación ya queda preparada.
      </p>
      <p className="mt-4">
        <Link
          href={`/clientes/${clienteId}/patrimonio?tab=activos`}
          className="text-[12px] font-semibold text-blue hover:underline"
        >
          ← Volver a Activos
        </Link>
      </p>
    </Card>
  );
}
