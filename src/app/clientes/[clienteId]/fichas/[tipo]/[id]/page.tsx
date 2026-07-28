"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { InmuebleFicha } from "@/components/fichas/InmuebleFicha";
import { OtroActivoFicha } from "@/components/fichas/OtroActivoFicha";
import { PersonaFicha } from "@/components/fichas/PersonaFicha";
import { PortfolioFicha } from "@/components/fichas/PortfolioFicha";
import { SociedadFicha } from "@/components/fichas/SociedadFicha";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { Card } from "@/components/ui";

const LABELS: Record<string, string> = {
  persona: "F1 · Persona",
  portfolio: "F2 · Portfolio",
  inmueble: "F3 · Inmueble",
  sociedad: "F4 · Sociedad",
  otro: "F5 · Otros activos",
};

export default function FichaPage() {
  const params = useParams<{
    clienteId: string;
    tipo: string;
    id: string;
  }>();
  const { bag } = useExpediente();
  const clienteId = params.clienteId;
  const tipo = params.tipo;
  const id = params.id;
  const personas = bag.personas;

  if (tipo === "persona") {
    const persona = personas.find((p) => p.id === id);
    if (!persona) {
      return <MissingFicha clienteId={clienteId} tipo={tipo} />;
    }
    return <PersonaFicha clienteId={clienteId} persona={persona} />;
  }

  if (tipo === "portfolio") {
    const instrumento = bag.instrumentos.find((i) => i.id === id);
    if (!instrumento) {
      return <MissingFicha clienteId={clienteId} tipo={tipo} />;
    }
    return (
      <PortfolioFicha
        clienteId={clienteId}
        instrumento={instrumento}
        instrumentos={bag.instrumentos}
      />
    );
  }

  if (tipo === "inmueble") {
    const inmueble = bag.inmuebles.find((i) => i.id === id);
    if (!inmueble) {
      return <MissingFicha clienteId={clienteId} tipo={tipo} />;
    }
    const pasivo = inmueble.pasivoId
      ? bag.pasivos.find((p) => p.id === inmueble.pasivoId)
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
    const sociedad = bag.sociedades.find((s) => s.id === id);
    if (!sociedad) {
      return <MissingFicha clienteId={clienteId} tipo={tipo} />;
    }
    return (
      <SociedadFicha
        clienteId={clienteId}
        sociedad={sociedad}
        personas={personas}
        instrumentos={bag.instrumentos}
        inmuebles={bag.inmuebles}
      />
    );
  }

  if (tipo === "otro") {
    const activo = bag.otrosActivos.find((a) => a.id === id);
    if (!activo) {
      return <MissingFicha clienteId={clienteId} tipo={tipo} />;
    }
    return (
      <OtroActivoFicha
        clienteId={clienteId}
        activo={activo}
        personas={personas}
      />
    );
  }

  return <MissingFicha clienteId={clienteId} tipo={tipo} />;
}

function MissingFicha({
  clienteId,
  tipo,
}: {
  clienteId: string;
  tipo: string;
}) {
  const label = LABELS[tipo] ?? "Ficha";
  return (
    <Card>
      <p className="label-upper mb-1">{label}</p>
      <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
        Elemento no encontrado
      </h2>
      <p className="mt-2 text-[13px] text-slate">
        Este elemento no está en el expediente actual.
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
